import { RemoteError } from '../../../shared/remote-control/errors.js';
import {
    DEFAULT_POLICY,
    expireSession,
    sessionStatus,
} from '../domain/session-policy.js';

/**
 * Session rules depend only on repository, time and token ports
 * @param {{repository: import('../../../shared/remote-control/contracts.js').SessionRepository, clock: import('../../../shared/remote-control/contracts.js').Clock, tokens: Object, policy?: Object}} dependencies
 */
export function createSessionService({
    repository,
    clock,
    tokens,
    policy = DEFAULT_POLICY,
}) {
    async function update(id, transition) {
        for (let attempt = 0; attempt < 12; attempt += 1) {
            const current = await repository.get(id);
            if (!current) throw new RemoteError('SESSION_EXPIRED');
            const next = expireSession(current, clock.now());
            transition(next);
            try {
                return await repository.update(id, current.version, next);
            } catch (error) {
                if (error.code !== 'CONFLICT') throw error;
            }
        }
        throw new RemoteError('SERVER_BUSY');
    }

    function checkBinding(session, auth) {
        const participant = session[auth.role];
        if (
            !participant ||
            !participant.connected ||
            participant.socketId !== auth.socketId ||
            participant.generation !== auth.generation
        )
            throw new RemoteError('UNAUTHORIZED');
        return participant;
    }

    async function authorize(auth, role) {
        if (!auth || (role && role !== auth.role))
            throw new RemoteError('UNAUTHORIZED');
        const current = await repository.get(auth.sessionId);
        if (!current) throw new RemoteError('SESSION_EXPIRED');
        const session = expireSession(current, clock.now());
        checkBinding(session, auth);
        return session;
    }

    const credential = (session, role, token) => ({
        sessionId: session.id,
        role,
        token,
        generation: session[role].generation,
        recoveryMs: policy.recoveryMs,
        serverNow: clock.now(),
        ...sessionStatus(session),
    });
    const binding = (session, role) => ({
        sessionId: session.id,
        role,
        socketId: session[role].socketId,
        generation: session[role].generation,
    });

    return {
        authorize,
        status: sessionStatus,
        async create(socketId) {
            for (let attempt = 0; attempt < 12; attempt += 1) {
                const token = tokens.token();
                const session = {
                    id: tokens.id(),
                    version: 0,
                    presenter: {
                        socketId,
                        generation: tokens.id(),
                        tokenHash: tokens.hash(token),
                        connected: true,
                        recoverUntil: null,
                    },
                    controller: null,
                    code: {
                        value: tokens.code(),
                        expiresAt: clock.now() + policy.codeTtlMs,
                    },
                };
                try {
                    await repository.create(session, policy.maxSessions);
                    return {
                        auth: binding(session, 'presenter'),
                        data: {
                            ...credential(session, 'presenter', token),
                            code: session.code.value,
                            expiresAt: session.code.expiresAt,
                        },
                    };
                } catch (error) {
                    if (error.code !== 'CODE_COLLISION') throw error;
                }
            }
            throw new RemoteError('SERVER_BUSY');
        },
        async regenerate(auth) {
            await authorize(auth, 'presenter');
            for (let attempt = 0; attempt < 12; attempt += 1) {
                try {
                    const session = await update(auth.sessionId, (next) => {
                        checkBinding(next, auth);
                        if (next.controller)
                            throw new RemoteError('CONTROLLER_BUSY');
                        next.code = {
                            value: tokens.code(),
                            expiresAt: clock.now() + policy.codeTtlMs,
                        };
                    });
                    return {
                        code: session.code.value,
                        expiresAt: session.code.expiresAt,
                    };
                } catch (error) {
                    if (error.code !== 'CODE_COLLISION') throw error;
                }
            }
            throw new RemoteError('SERVER_BUSY');
        },
        async pair(code, socketId) {
            const found = await repository.findByCode(code);
            if (!found) throw new RemoteError('INVALID_CODE');
            const token = tokens.token();
            const session = await update(found.id, (next) => {
                if (!next.presenter.connected)
                    throw new RemoteError('PRESENTER_OFFLINE');
                if (next.controller) throw new RemoteError('CONTROLLER_BUSY');
                if (!next.code || next.code.value !== code)
                    throw new RemoteError('INVALID_CODE');
                next.controller = {
                    socketId,
                    generation: tokens.id(),
                    tokenHash: tokens.hash(token),
                    connected: true,
                    recoverUntil: null,
                };
                next.code = null;
            });
            return {
                auth: binding(session, 'controller'),
                data: credential(session, 'controller', token),
            };
        },
        async resume({ sessionId, role, token }, socketId) {
            const session = await update(sessionId, (next) => {
                const participant = next[role];
                if (
                    !participant ||
                    !tokens.matches(token, participant.tokenHash)
                )
                    throw new RemoteError('UNAUTHORIZED');
                participant.connected = true;
                participant.socketId = socketId;
                participant.generation = tokens.id();
                participant.recoverUntil = null;
            });
            return {
                auth: binding(session, role),
                data: credential(session, role, token),
            };
        },
        async disconnect(auth) {
            if (!auth) return null;
            try {
                return await update(auth.sessionId, (next) => {
                    const participant = checkBinding(next, auth);
                    participant.connected = false;
                    participant.recoverUntil = clock.now() + policy.recoveryMs;
                });
            } catch (error) {
                if (['UNAUTHORIZED', 'SESSION_EXPIRED'].includes(error.code))
                    return null;
                throw error;
            }
        },
        async release(auth) {
            await authorize(auth, 'controller');
            return update(auth.sessionId, (next) => {
                checkBinding(next, auth);
                next.controller = null;
            });
        },
        async close(auth) {
            for (let attempt = 0; attempt < 12; attempt += 1) {
                const current = await authorize(auth, 'presenter');
                try {
                    await repository.remove(auth.sessionId, current.version);
                    return;
                } catch (error) {
                    if (error.code !== 'CONFLICT') throw error;
                }
            }
            throw new RemoteError('SERVER_BUSY');
        },
        async sweep() {
            const changes = [];
            for (const current of await repository.list()) {
                try {
                    const next = expireSession(
                        structuredClone(current),
                        clock.now(),
                    );
                    if (JSON.stringify(next) !== JSON.stringify(current)) {
                        const saved = await repository.update(
                            current.id,
                            current.version,
                            next,
                        );
                        changes.push({
                            sessionId: saved.id,
                            status: sessionStatus(saved),
                        });
                    }
                } catch (error) {
                    if (error.code === 'SESSION_EXPIRED') {
                        try {
                            await repository.remove(
                                current.id,
                                current.version,
                            );
                            changes.push({
                                sessionId: current.id,
                                ended: true,
                            });
                        } catch (removalError) {
                            if (removalError.code !== 'CONFLICT')
                                throw removalError;
                        }
                    } else if (error.code !== 'CONFLICT') throw error;
                }
            }
            return changes;
        },
    };
}
