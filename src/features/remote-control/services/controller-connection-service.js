import {
    EVENTS,
    LIMITS,
    PROTOCOL_VERSION,
    selectSessionStatus,
} from '../../../../shared/remote-control/protocol.js';
import { assertMessage } from '../../../../shared/remote-control/validators.js';
import { RemoteError } from '../../../../shared/remote-control/errors.js';
import { resumeSession } from './session-resume.js';

/**
 * @param {{transport: import('../../../../shared/remote-control/contracts.js').RemoteTransport, credentialStore: import('../../../../shared/remote-control/contracts.js').CredentialStore, store: Object, scheduler: Object, idFactory: function(): string}} dependencies
 */
export function createControllerConnectionService({
    transport,
    credentialStore,
    store,
    scheduler,
    idFactory,
}) {
    let credentials = null;
    let started = false;
    let disposeTimer = null;
    let resuming = false;
    let syncPromise = null;
    let epoch = 0;
    const subscriptions = [];
    const patch = (value) => store.setState(value);

    function clear(reason = '') {
        credentials = null;
        resuming = false;
        syncPromise = null;
        epoch += 1;
        credentialStore.clear();
        patch({
            connection: reason ? 'expired' : 'idle',
            sessionId: null,
            metadata: null,
            player: null,
            status: null,
            revision: -1,
            pending: false,
            error: reason,
        });
        transport.disconnect();
    }

    async function synchronize() {
        if (!credentials || syncPromise) return syncPromise;
        const current = credentials;
        const operation = epoch;
        patch({ connection: 'synchronizing' });
        const pendingSync = (async () => {
            try {
                const frame = await transport.request(
                    EVENTS.synchronize,
                    { sessionId: current.sessionId },
                    LIMITS.snapshotTimeoutMs + 1000,
                );
                if (
                    !started ||
                    operation !== epoch ||
                    credentials?.generation !== current.generation
                )
                    return;
                const { generation, ...payload } = frame;
                assertMessage(EVENTS.snapshot, payload);
                if (
                    frame.sessionId !== current.sessionId ||
                    generation !== current.generation
                )
                    throw new RemoteError('INVALID_MESSAGE');
                const previous = store.getState();
                const player =
                    previous.revision > frame.revision && previous.player
                        ? previous.player
                        : frame.state;
                patch({
                    metadata: frame.metadata,
                    player,
                    revision: Math.max(previous.revision, frame.revision),
                    connection: 'connected',
                });
            } catch (error) {
                if (operation !== epoch || !started) return;
                if (['UNAUTHORIZED', 'SESSION_EXPIRED'].includes(error.code))
                    clear(error.code);
                else
                    patch({
                        connection: 'recovering',
                        error: error.code || 'INTERNAL_ERROR',
                    });
            } finally {
                if (syncPromise === pendingSync) syncPromise = null;
            }
        })();
        syncPromise = pendingSync;
        return syncPromise;
    }

    async function resume() {
        if (!credentials || resuming || !started) return;
        resuming = true;
        const operation = epoch;
        patch({ connection: 'recovering', pending: false });
        try {
            const { restored } = await resumeSession({
                transport,
                credentials,
                isCurrent: () => started && operation === epoch,
            });
            if (!started || operation !== epoch) return;
            credentials = restored;
            credentialStore.save(restored);
            patch({
                sessionId: restored.sessionId,
                status: selectSessionStatus(restored),
                revision: -1,
                metadata: null,
                player: null,
                error: '',
            });
            await synchronize();
        } catch (error) {
            if (operation !== epoch || !started) return;
            if (['UNAUTHORIZED', 'SESSION_EXPIRED'].includes(error.code))
                clear(error.code);
            else patch({ connection: 'recovering', error: error.code });
        } finally {
            if (operation === epoch) {
                resuming = false;
                if (
                    credentials &&
                    transport.isConnected() &&
                    store.getState().connection === 'recovering' &&
                    store.getState().status?.presenterConnected
                )
                    synchronize();
            }
        }
    }

    async function disconnect() {
        const current = credentials;
        credentials = null;
        epoch += 1;
        credentialStore.clear();
        patch({ connection: 'disconnecting', pending: true });
        if (current && transport.isConnected()) {
            try {
                await transport.request(
                    EVENTS.release,
                    { sessionId: current.sessionId },
                    1000,
                );
            } catch {
                /* The recovery lease releases an unreachable controller */
            }
        }
        clear();
    }

    function reconnect() {
        if (!started || !credentials) return Promise.resolve();
        if (transport.isConnected()) return resume();
        const operation = epoch;
        patch({ connection: 'recovering' });
        return transport.connect().catch(() => {
            if (started && credentials && operation === epoch) {
                patch({ connection: 'recovering', error: 'CONNECTION_FAILED' });
            }
        });
    }

    return {
        synchronize,
        disconnect,
        reconnect,
        suspend() {
            transport.disconnect();
        },
        start() {
            if (disposeTimer !== null) scheduler.clearTimeout(disposeTimer);
            disposeTimer = null;
            if (started) return;
            started = true;
            subscriptions.push(
                transport.subscribe('connect', () => {
                    resume();
                }),
                transport.subscribe('disconnect', () => {
                    if (credentials) {
                        epoch += 1;
                        resuming = false;
                        syncPromise = null;
                        patch({ connection: 'recovering', pending: false });
                    }
                }),
                transport.subscribe(EVENTS.status, (status) => {
                    if (
                        status.protocolVersion !== PROTOCOL_VERSION ||
                        status.sessionId !== credentials?.sessionId
                    )
                        return;
                    if (
                        !resuming &&
                        status.controllerGeneration !== credentials.generation
                    ) {
                        clear('SESSION_EXPIRED');
                        return;
                    }
                    patch({ status });
                    if (!status.presenterConnected)
                        patch({ connection: 'recovering' });
                    else if (
                        !resuming &&
                        store.getState().connection === 'recovering'
                    )
                        synchronize();
                }),
                transport.subscribe(EVENTS.ended, (event) => {
                    if (event.sessionId === credentials?.sessionId)
                        clear(event.reason);
                }),
                transport.subscribe(EVENTS.state, (frame) => {
                    if (
                        !credentials ||
                        frame.sessionId !== credentials.sessionId ||
                        frame.generation !== credentials.generation
                    )
                        return;
                    try {
                        const payload = { ...frame };
                        delete payload.generation;
                        assertMessage(EVENTS.state, payload);
                        if (frame.revision <= store.getState().revision) return;
                        const metadata = store.getState().metadata;
                        if (
                            metadata &&
                            metadata.slides[frame.state.activeIndex]?.id !==
                                frame.state.slideId
                        )
                            return;
                        patch({
                            player: frame.state,
                            revision: frame.revision,
                        });
                    } catch {
                        /* Invalid state never replaces the confirmed view */
                    }
                }),
            );
            credentials = credentialStore.load();
            if (credentials) {
                patch({
                    sessionId: credentials.sessionId,
                    connection: 'recovering',
                });
                reconnect();
            }
        },
        async pair(code) {
            if (store.getState().pending || credentials) return;
            let operation = epoch;
            patch({ connection: 'connecting', pending: true, error: '' });
            try {
                await transport.connect();
                if (!started || operation !== epoch) return;
                const paired = await transport.request(EVENTS.pair, { code });
                if (!started || operation !== epoch) return;
                credentials = paired;
                epoch += 1;
                operation = epoch;
                credentialStore.save(credentials);
                patch({
                    sessionId: credentials.sessionId,
                    status: selectSessionStatus(credentials),
                    revision: -1,
                });
                await synchronize();
            } catch (error) {
                if (started && operation === epoch)
                    patch({
                        connection: credentials ? 'recovering' : 'idle',
                        error: error.code || 'INTERNAL_ERROR',
                    });
            } finally {
                if (started && operation === epoch) patch({ pending: false });
            }
        },
        async send(command) {
            const state = store.getState();
            if (
                !credentials ||
                state.connection !== 'connected' ||
                state.pending
            )
                return;
            const operation = epoch;
            patch({ pending: true, error: '' });
            try {
                await transport.request(EVENTS.command, {
                    sessionId: credentials.sessionId,
                    requestId: idFactory(),
                    command,
                });
            } catch (error) {
                if (operation !== epoch) return;
                patch({ error: error.code || 'INTERNAL_ERROR' });
                if (error.code === 'RESULT_UNKNOWN') await synchronize();
                else if (
                    ['UNAUTHORIZED', 'SESSION_EXPIRED'].includes(error.code)
                )
                    clear(error.code);
            } finally {
                if (operation === epoch) patch({ pending: false });
            }
        },
        clearError() {
            patch({ error: '' });
        },
        scheduleDispose() {
            disposeTimer = scheduler.setTimeout(() => {
                started = false;
                subscriptions.splice(0).forEach((unsubscribe) => unsubscribe());
                disconnect();
            }, 0);
        },
    };
}
