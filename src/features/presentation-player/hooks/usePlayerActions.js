import { useContext } from 'react';
import { PlayerActionsContext } from '../state/player-actions-context.js';

export function usePlayerActions() {
    const ports = useContext(PlayerActionsContext);
    if (!ports)
        throw new Error('Las acciones del reproductor no están disponibles.');
    return ports;
}
