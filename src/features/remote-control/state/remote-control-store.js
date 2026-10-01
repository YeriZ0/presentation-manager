import { createStore } from 'zustand/vanilla';

export function createRemoteControlStore(role) {
    return createStore(() => ({
        role,
        connection: 'idle',
        sessionId: null,
        status: null,
        code: null,
        expiresAt: null,
        metadata: null,
        player: null,
        revision: -1,
        pending: false,
        error: '',
    }));
}
