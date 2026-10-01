import { useContext } from 'react';
import { useStore } from 'zustand';
import { PlayerStoreContext } from '../state/player-store-context.js';

export function usePlayerStoreApi() {
    const store = useContext(PlayerStoreContext);
    if (!store) throw new Error('El store del reproductor no está disponible.');
    return store;
}

export function usePlayerStore(selector) {
    return useStore(usePlayerStoreApi(), selector);
}
