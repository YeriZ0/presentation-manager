import { EVENTS, message } from '../../../shared/remote-control/protocol.js';
import { assertMessage } from '../../../shared/remote-control/validators.js';
import {
    failure,
    success,
    RemoteError,
} from '../../../shared/remote-control/errors.js';
import { createCommandRelayService } from '../services/command-relay-service.js';

export function createSocketIoGateway({
    io,
    sessions,
    clock,
    tokens,
    scheduler,
    policy,
    clientAddress,
}) {
    const attempts = new Map();
    const participants = {
        request(socketId, event, payload, timeout) {
            return new Promise((resolve, reject) => {
                const socket = io.sockets.sockets.get(socketId);
                if (!socket?.connected)
                    return reject(new RemoteError('PRESENTER_OFFLINE'));
                socket
                    .timeout(timeout)
                    .emit(event, payload, (error, result) => {
                        if (error) reject(new RemoteError('RESULT_UNKNOWN'));
                        else resolve(result);
                    });
            });
        },
    };
    const relay = createCommandRelayService({
        sessions,
        participants,
        clock,
        tokens,
    });

    function publishStatus(session) {
        const status = sessions.status(session);
        io.to(session.id).emit(EVENTS.status, message(status));
    }

    function enforceAttempts(socket, event) {
        const key = `${event}:${clientAddress(socket)}`;
        const now = clock.now();
        let bucket = attempts.get(key);
        if (!bucket || bucket.until <= now) {
            if (attempts.size >= 4096 && !bucket)
                throw new RemoteError('SERVER_BUSY');
            bucket = { count: 0, until: now + 60000 };
            attempts.set(key, bucket);
        }
        bucket.count += 1;
        if (bucket.count > policy.attemptsPerMinute)
            throw new RemoteError('TOO_MANY_ATTEMPTS');
    }

    async function attach(socket, result) {
        const old = socket.data.auth;
        if (old && old.sessionId !== result.auth.sessionId)
            throw new RemoteError('UNAUTHORIZED');
        socket.data.auth = result.auth;
        if (!socket.connected) {
            await sessions.disconnect(result.auth);
            throw new RemoteError('DISCONNECTED');
        }
        await socket.join(result.auth.sessionId);
        const session = await sessions.authorize(result.auth);
        publishStatus(session);
        return result.data;
    }

    async function authorize(socket, payload, role) {
        if (socket.data.auth?.sessionId !== payload.sessionId)
            throw new RemoteError('UNAUTHORIZED');
        return sessions.authorize(socket.data.auth, role);
    }

    function onConnection(socket) {
        let handshakePending = false;
        let requestWindow = clock.now();
        let requestCount = 0;
        function handle(event, operation, handshake = false) {
            socket.on(event, async (payload, reply) => {
                if (typeof reply !== 'function') return;
                if (handshake && handshakePending)
                    return reply(failure(new RemoteError('COMMAND_PENDING')));
                if (handshake) handshakePending = true;
                try {
                    if (clock.now() - requestWindow >= 1000) {
                        requestWindow = clock.now();
                        requestCount = 0;
                    }
                    requestCount += 1;
                    if (requestCount > 30)
                        throw new RemoteError('TOO_MANY_ATTEMPTS');
                    if (
                        [
                            EVENTS.create,
                            EVENTS.pair,
                            EVENTS.regenerate,
                        ].includes(event)
                    )
                        enforceAttempts(socket, event);
                    assertMessage(event, payload);
                    reply(success(await operation(payload)));
                } catch (error) {
                    reply(failure(error));
                } finally {
                    if (handshake) handshakePending = false;
                }
            });
        }

        handle(
            EVENTS.create,
            async () => {
                if (socket.data.auth) throw new RemoteError('UNAUTHORIZED');
                return attach(socket, await sessions.create(socket.id));
            },
            true,
        );
        handle(
            EVENTS.pair,
            async (payload) => {
                if (socket.data.auth) throw new RemoteError('UNAUTHORIZED');
                return attach(
                    socket,
                    await sessions.pair(payload.code, socket.id),
                );
            },
            true,
        );
        handle(
            EVENTS.resume,
            async (payload) => {
                if (
                    socket.data.auth &&
                    (socket.data.auth.sessionId !== payload.sessionId ||
                        socket.data.auth.role !== payload.role)
                ) {
                    throw new RemoteError('UNAUTHORIZED');
                }
                return attach(
                    socket,
                    await sessions.resume(payload, socket.id),
                );
            },
            true,
        );
        handle(EVENTS.regenerate, async (payload) => {
            await authorize(socket, payload, 'presenter');
            const code = await sessions.regenerate(socket.data.auth);
            publishStatus(await sessions.authorize(socket.data.auth));
            return code;
        });
        handle(EVENTS.synchronize, async (payload) => {
            await authorize(socket, payload, 'controller');
            return relay.synchronize(socket.data.auth);
        });
        handle(EVENTS.command, async (payload) => {
            await authorize(socket, payload, 'controller');
            return relay.execute(socket.data.auth, payload);
        });
        handle(EVENTS.release, async (payload) => {
            await authorize(socket, payload, 'controller');
            const auth = socket.data.auth;
            const session = await sessions.release(auth);
            relay.cancel(auth.sessionId);
            publishStatus(session);
            await socket.leave(auth.sessionId);
            socket.data.auth = null;
            return null;
        });
        handle(EVENTS.close, async (payload) => {
            await authorize(socket, payload, 'presenter');
            await sessions.close(socket.data.auth);
            relay.cancel(payload.sessionId);
            io.to(payload.sessionId).emit(
                EVENTS.ended,
                message({
                    sessionId: payload.sessionId,
                    reason: 'SESSION_CLOSED',
                }),
            );
            io.in(payload.sessionId).socketsLeave(payload.sessionId);
            socket.data.auth = null;
            return null;
        });
        handle(EVENTS.state, async (payload) => {
            const session = await authorize(socket, payload, 'presenter');
            if (session.controller?.connected) {
                io.to(session.controller.socketId).emit(EVENTS.state, {
                    ...payload,
                    generation: session.controller.generation,
                });
            }
            return null;
        });
        socket.on('disconnect', () => {
            const auth = socket.data.auth;
            sessions
                .disconnect(auth)
                .then((session) => {
                    if (session) {
                        relay.cancel(auth.sessionId);
                        publishStatus(session);
                    }
                })
                .catch(() => {});
        });
    }

    io.on('connection', onConnection);
    const sweepTimer = scheduler.setInterval(async () => {
        try {
            for (const [key, bucket] of attempts)
                if (bucket.until <= clock.now()) attempts.delete(key);
            for (const change of await sessions.sweep()) {
                relay.cancel(change.sessionId);
                if (change.ended) {
                    io.to(change.sessionId).emit(
                        EVENTS.ended,
                        message({
                            sessionId: change.sessionId,
                            reason: 'SESSION_EXPIRED',
                        }),
                    );
                    io.in(change.sessionId).socketsLeave(change.sessionId);
                } else
                    io.to(change.sessionId).emit(
                        EVENTS.status,
                        message(change.status),
                    );
            }
        } catch {
            /* Expiration is also checked on every authorized request */
        }
    }, 1000);
    sweepTimer.unref?.();

    return {
        dispose() {
            scheduler.clearInterval(sweepTimer);
            io.off('connection', onConnection);
            attempts.clear();
            relay.dispose();
        },
    };
}
