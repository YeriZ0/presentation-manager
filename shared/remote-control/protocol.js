export const PROTOCOL_VERSION = 1;
export const MOBILE_BREAKPOINT = 768;
export const TIMER_POSITIONS = Object.freeze([
    { id: 'top-left', label: 'Arriba izquierda' },
    { id: 'top-right', label: 'Arriba derecha' },
    { id: 'bottom-left', label: 'Abajo izquierda' },
    { id: 'bottom-right', label: 'Abajo derecha' },
]);
export const EVENTS = Object.freeze({
    create: 'session:create',
    regenerate: 'pairing:regenerate',
    pair: 'controller:pair',
    resume: 'session:resume',
    release: 'controller:release',
    close: 'session:close',
    status: 'session:status',
    ended: 'session:ended',
    command: 'player:command',
    execute: 'player:execute',
    state: 'player:state',
    snapshot: 'player:snapshot',
    snapshotRequest: 'player:snapshot-request',
    synchronize: 'player:synchronize',
});
export const LIMITS = Object.freeze({
    messageBytes: 2 * 1024 * 1024,
    commandTimeoutMs: 5000,
    snapshotTimeoutMs: 8000,
    recoveryMs: 60000,
    codeTtlMs: 300000,
    resultTtlMs: 120000,
    maxResults: 256,
    maxSessions: 1000,
});

export function message(payload = {}) {
    return { ...payload, protocolVersion: PROTOCOL_VERSION };
}

export function selectSessionStatus(value) {
    return {
        sessionId: value.sessionId,
        presenterConnected: value.presenterConnected,
        presenterRecoveryUntil: value.presenterRecoveryUntil ?? null,
        controllerState: value.controllerState,
        controllerGeneration: value.controllerGeneration ?? null,
        recoveryUntil: value.recoveryUntil ?? null,
    };
}
