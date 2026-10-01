import { LIMITS } from '../../../shared/remote-control/protocol.js';
import { RemoteError } from '../../../shared/remote-control/errors.js';

export const DEFAULT_POLICY = Object.freeze({
    codeTtlMs: LIMITS.codeTtlMs,
    recoveryMs: LIMITS.recoveryMs,
    maxSessions: LIMITS.maxSessions,
    attemptsPerMinute: 12,
});

export function expireSession(session, now) {
    if (!session.presenter.connected && session.presenter.recoverUntil <= now) {
        throw new RemoteError('SESSION_EXPIRED');
    }
    if (
        session.controller &&
        !session.controller.connected &&
        session.controller.recoverUntil <= now
    ) {
        session.controller = null;
    }
    if (session.code && session.code.expiresAt <= now) session.code = null;
    return session;
}

export function sessionStatus(session) {
    return {
        sessionId: session.id,
        presenterConnected: session.presenter.connected,
        presenterRecoveryUntil: session.presenter.recoverUntil,
        controllerState: session.controller
            ? session.controller.connected
                ? 'connected'
                : 'recovering'
            : session.code
              ? 'pairing'
              : 'available',
        controllerGeneration: session.controller?.generation ?? null,
        recoveryUntil: session.controller?.recoverUntil ?? null,
    };
}
