import { createContext, useContext, useRef } from 'react';
import { useStore } from 'zustand';
import { createPlayerStore } from './player-store.js';

const PlayerStoreContext = createContext(null);

export function PlayerStoreProvider({ metadata, children }) {
    const storeRef = useRef(null);
    if (!storeRef.current) storeRef.current = createPlayerStore(metadata);

    return (
        <PlayerStoreContext.Provider value={storeRef.current}>
            {children}
        </PlayerStoreContext.Provider>
    );
}

export function usePlayerStore(selector) {
    return useStore(usePlayerStoreApi(), selector);
}

export function usePlayerStoreApi() {
    const store = useContext(PlayerStoreContext);
    if (!store) throw new Error('El store del reproductor no esta disponible');
    return store;
}
