import {
    EVENTS,
    LIMITS,
    message,
} from '../../../shared/remote-control/protocol.js';
import { assertMessage } from '../../../shared/remote-control/validators.js';
import { RemoteError } from '../../../shared/remote-control/errors.js';

/** Participant transport exposes request and notify without socket objects */
export function createCommandRelayService({
    sessions,
    participants,
    clock,
    tokens,
}) {
    const pending = new Map();

    async function synchronize(auth) {
        const session = await sessions.authorize(auth, 'controller');
        if (!session.presenter.connected)
            throw new RemoteError('PRESENTER_OFFLINE');
        const syncId = tokens.id();
        const response = await participants.request(
            session.presenter.socketId,
            EVENTS.snapshotRequest,
            message({ sessionId: session.id, syncId }),
            LIMITS.snapshotTimeoutMs,
        );
        if (!response.ok) throw new RemoteError(response.error);
        assertMessage(EVENTS.snapshot, response.data);
        if (
            response.data.sessionId !== session.id ||
            response.data.syncId !== syncId
        )
            throw new RemoteError('INVALID_MESSAGE');
        await sessions.authorize(auth, 'controller');
        return { ...response.data, generation: auth.generation };
    }

    async function execute(auth, payload) {
        const session = await sessions.authorize(auth, 'controller');
        if (!session.presenter.connected)
            throw new RemoteError('PRESENTER_OFFLINE');
        if (pending.has(session.id)) throw new RemoteError('COMMAND_PENDING');
        const entry = {
            requestId: payload.requestId,
            generation: auth.generation,
            startedAt: clock.now(),
        };
        pending.set(session.id, entry);
        try {
            const response = await participants.request(
                session.presenter.socketId,
                EVENTS.execute,
                message({
                    ...payload,
                    controllerGeneration: auth.generation,
                    deadline: clock.now() + LIMITS.commandTimeoutMs,
                }),
                LIMITS.commandTimeoutMs,
            );
            await sessions.authorize(auth, 'controller');
            if (pending.get(session.id) !== entry)
                throw new RemoteError('UNAUTHORIZED');
            if (!response || typeof response.ok !== 'boolean')
                throw new RemoteError('INVALID_MESSAGE');
            if (!response.ok)
                throw new RemoteError(
                    typeof response.error === 'string'
                        ? response.error
                        : 'INTERNAL_ERROR',
                );
            return null;
        } finally {
            if (pending.get(session.id) === entry) pending.delete(session.id);
        }
    }

    return {
        synchronize,
        execute,
        cancel(sessionId) {
            pending.delete(sessionId);
        },
        dispose() {
            pending.clear();
        },
    };
}
