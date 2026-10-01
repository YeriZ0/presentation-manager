import { useState } from 'react';
import { createPlayerStore } from './player-store.js';
import { PlayerStoreContext } from './player-store-context.js';

export function PlayerStoreProvider({ metadata, children }) {
    const [store] = useState(() => createPlayerStore(metadata));

    return (
        <PlayerStoreContext.Provider value={store}>
            {children}
        </PlayerStoreContext.Provider>
    );
}
