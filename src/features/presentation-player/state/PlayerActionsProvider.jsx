import { useEffect, useState } from 'react';
import { usePlayerStoreApi } from '../hooks/usePlayerStore.js';
import { PlayerActionsContext } from './player-actions-context.js';
import { createPlayerActions } from '../services/player-actions.js';
import { createPresentationTimer } from '../services/presentation-timer.js';
import { createPlayerReader } from '../adapters/player-port.js';
import { createBrowserScheduler } from '../../../lib/browser-scheduler.js';

export function PlayerActionsProvider({ children }) {
    const store = usePlayerStoreApi();
    const [ports] = useState(() => {
        const timer = createPresentationTimer({
            store,
            clock: { now: () => performance.now() },
            scheduler: createBrowserScheduler(),
        });
        return {
            actions: createPlayerActions({
                store,
                timer,
                clock: { now: () => Date.now() },
            }),
            reader: createPlayerReader(store),
        };
    });
    useEffect(() => {
        ports.actions.timer.start();
        return () => ports.actions.timer.stop();
    }, [ports]);
    return (
        <PlayerActionsContext.Provider value={ports}>
            {children}
        </PlayerActionsContext.Provider>
    );
}
