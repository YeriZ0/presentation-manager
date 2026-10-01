import { EVENTS, message } from '../../../../shared/remote-control/protocol.js';
import { assertMessage } from '../../../../shared/remote-control/validators.js';

/**
 * @param {{reader: import('../../../../shared/remote-control/contracts.js').PlayerReader, transport: import('../../../../shared/remote-control/contracts.js').RemoteTransport, getCredentials: Function}} dependencies
 */
export function createPlayerStatePublisher({
    reader,
    transport,
    getCredentials,
}) {
    let revision = 0;
    let unsubscribe = null;
    let previous = '';

    function publish(force = false) {
        const credentials = getCredentials();
        if (!credentials || !transport.isConnected()) return;
        const state = reader.readState();
        const signature = JSON.stringify({
            ...state,
            elapsed: Math.floor(state.elapsed),
        });
        if (!force && signature === previous) return;
        previous = signature;
        const payload = message({
            sessionId: credentials.sessionId,
            revision: ++revision,
            state,
        });
        try {
            assertMessage(EVENTS.state, payload);
            transport.request(EVENTS.state, payload).catch(() => {});
        } catch {
            /* Snapshot validation reports unsupported metadata to the controller */
        }
    }

    return {
        publish,
        snapshot({ sessionId, syncId }) {
            const payload = message({
                sessionId,
                syncId,
                revision: ++revision,
                metadata: reader.readMetadata(),
                state: reader.readState(),
            });
            return assertMessage(EVENTS.snapshot, payload);
        },
        start() {
            if (!unsubscribe) unsubscribe = reader.subscribe(() => publish());
            publish(true);
        },
        stop() {
            unsubscribe?.();
            unsubscribe = null;
            previous = '';
        },
    };
}
