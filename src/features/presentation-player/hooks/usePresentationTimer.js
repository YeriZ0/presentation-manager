import { usePlayerActions } from './usePlayerActions.js';

export function usePresentationTimer() {
    return usePlayerActions().actions.timer;
}
