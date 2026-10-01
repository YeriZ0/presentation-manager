import {
    EVENTS,
    PROTOCOL_VERSION,
    selectSessionStatus,
} from '../../../../shared/remote-control/protocol.js';
import {
    failure,
    RemoteError,
} from '../../../../shared/remote-control/errors.js';
import { createPlayerStatePublisher } from './player-state-publisher.js';
import { resumeSession } from './session-resume.js';

export function createPresenterConnectionService({
    transport,
    reader,
    actions,
    store,
    clock,
    scheduler,
}) {
    let credentials = null;
    let started = false;
    let disposeTimer = null;
    let resuming = false;
    let epoch = 0;
    let serverOffset = 0;
    let ending = false;
    const subscriptions = [];
    const publisher = createPlayerStatePublisher({
        reader,
        transport,
        getCredentials: () => credentials,
    });
    const patch = (value) => store.setState(value);

    async function resume() {
        if (!credentials || resuming || !started) return;
        resuming = true;
        const operation = epoch;
        patch({ connection: 'recovering' });
        try {
            const { restored, requestedAt } = await resumeSession({
                transport,
                credentials,
                clock,
                isCurrent: () => started && operation === epoch,
            });
            if (!started || operation !== epoch) return;
            credentials = restored;
            serverOffset = restored.serverNow - requestedAt;
            patch({
                connection: 'connected',
                sessionId: restored.sessionId,
                status: selectSessionStatus(restored),
                error: '',
            });
            publisher.start();
        } catch (error) {
            if (!started || operation !== epoch) return;
            if (['UNAUTHORIZED', 'SESSION_EXPIRED'].includes(error.code)) {
                credentials = null;
                publisher.stop();
                patch({
                    connection: 'idle',
                    sessionId: null,
                    status: null,
                    code: null,
                    expiresAt: null,
                    error: error.code,
                });
            } else patch({ error: error.code });
        } finally {
            if (operation === epoch) resuming = false;
        }
    }

    async function end() {
        if (ending) return;
        ending = true;
        const current = credentials;
        credentials = null;
        resuming = false;
        epoch += 1;
        publisher.stop();
        patch({ pending: true, connection: 'disconnecting' });
        if (current && transport.isConnected()) {
            try {
                await transport.request(
                    EVENTS.close,
                    { sessionId: current.sessionId },
                    1000,
                );
            } catch {
                /* The server lease handles an interrupted close */
            }
        }
        transport.disconnect();
        patch({
            pending: false,
            connection: 'idle',
            status: null,
            sessionId: null,
            code: null,
            expiresAt: null,
            error: '',
        });
        ending = false;
    }

    return {
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
                    epoch += 1;
                    resuming = false;
                    patch({
                        pending: false,
                        connection: credentials ? 'recovering' : 'idle',
                    });
                }),
                transport.subscribe(EVENTS.status, (status) => {
                    if (
                        status.protocolVersion !== PROTOCOL_VERSION ||
                        status.sessionId !== credentials?.sessionId
                    )
                        return;
                    patch({
                        status,
                        ...(status.controllerState !== 'pairing'
                            ? { code: null, expiresAt: null }
                            : {}),
                    });
                }),
                transport.subscribe(EVENTS.ended, (event) => {
                    if (event.sessionId !== credentials?.sessionId) return;
                    credentials = null;
                    publisher.stop();
                    patch({
                        connection: 'idle',
                        status: null,
                        sessionId: null,
                        code: null,
                        expiresAt: null,
                        error: event.reason,
                    });
                }),
                transport.subscribe(
                    EVENTS.snapshotRequest,
                    (request, reply) => {
                        try {
                            if (
                                request.protocolVersion !== PROTOCOL_VERSION ||
                                request.sessionId !== credentials?.sessionId
                            )
                                throw new RemoteError('UNAUTHORIZED');
                            reply({
                                ok: true,
                                data: publisher.snapshot(request),
                            });
                        } catch (error) {
                            reply(failure(error));
                        }
                    },
                ),
                transport.subscribe(EVENTS.execute, (request, reply) => {
                    if (
                        request.protocolVersion !== PROTOCOL_VERSION ||
                        request.sessionId !== credentials?.sessionId ||
                        request.controllerGeneration !==
                            store.getState().status?.controllerGeneration
                    ) {
                        reply(failure(new RemoteError('UNAUTHORIZED')));
                        return;
                    }
                    if (
                        store.getState().connection !== 'connected' ||
                        !Number.isFinite(request.deadline) ||
                        clock.now() + serverOffset >= request.deadline
                    ) {
                        reply(failure(new RemoteError('STALE_COMMAND')));
                        return;
                    }
                    reply(actions.execute(request));
                }),
            );
        },
        async preparePairing(force = false) {
            if (ending || !started || store.getState().pending) return;
            const operation = epoch;
            patch({ pending: true, error: '' });
            try {
                await transport.connect();
                if (!started || operation !== epoch) return;
                if (
                    credentials &&
                    store.getState().connection === 'recovering' &&
                    !resuming
                )
                    await resume();
                if (!started || operation !== epoch) return;
                if (!credentials) {
                    const requestedAt = clock.now();
                    const created = await transport.request(EVENTS.create, {});
                    if (!started || operation !== epoch) return;
                    credentials = created;
                    serverOffset = created.serverNow - requestedAt;
                    patch({
                        connection: 'connected',
                        sessionId: created.sessionId,
                        status: selectSessionStatus(created),
                        code: created.code,
                        expiresAt: created.expiresAt - serverOffset,
                    });
                    publisher.start();
                } else {
                    if (resuming) throw new RemoteError('DISCONNECTED');
                    const state = store.getState();
                    if (
                        ['connected', 'recovering'].includes(
                            state.status?.controllerState,
                        )
                    )
                        return;
                    if (!force && state.code && state.expiresAt > clock.now())
                        return;
                    const code = await transport.request(EVENTS.regenerate, {
                        sessionId: credentials.sessionId,
                    });
                    patch({
                        code: code.code,
                        expiresAt: code.expiresAt - serverOffset,
                        connection: 'connected',
                    });
                }
            } catch (error) {
                if (started && operation === epoch)
                    patch({ error: error.code || 'INTERNAL_ERROR' });
            } finally {
                if (started && operation === epoch) patch({ pending: false });
            }
        },
        end,
        scheduleDispose() {
            disposeTimer = scheduler.setTimeout(() => {
                started = false;
                subscriptions.splice(0).forEach((unsubscribe) => unsubscribe());
                end();
            }, 0);
        },
    };
}
