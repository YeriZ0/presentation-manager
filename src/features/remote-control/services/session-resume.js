import { EVENTS } from '../../../../shared/remote-control/protocol.js';
import { RemoteError } from '../../../../shared/remote-control/errors.js';

export async function resumeSession({
    transport,
    credentials,
    isCurrent,
    clock,
}) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
        if (!isCurrent()) throw new RemoteError('DISCONNECTED');
        const requestedAt = clock?.now() ?? 0;
        try {
            const restored = await transport.request(EVENTS.resume, {
                sessionId: credentials.sessionId,
                role: credentials.role,
                token: credentials.token,
            });
            return { restored, requestedAt };
        } catch (error) {
            if (
                error.code !== 'RESULT_UNKNOWN' ||
                !transport.isConnected() ||
                attempt === 1
            )
                throw error;
        }
    }
    throw new RemoteError('CONNECTION_FAILED');
}
