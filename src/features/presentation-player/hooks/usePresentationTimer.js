import { useEffect, useRef, useState } from 'react';
import { usePlayerStore, usePlayerStoreApi } from '../state/PlayerStoreProvider.jsx';

export function usePresentationTimer() {
    const store = usePlayerStoreApi();
    const timerEnabled = usePlayerStore((state) => state.timerEnabled);
    const timerRunning = usePlayerStore((state) => state.timerRunning);
    const elapsed = usePlayerStore((state) => state.elapsed);
    const elapsedRef = useRef(elapsed);
    const manuallyPausedRef = useRef(false);
    const [revision, setRevision] = useState(0);

    useEffect(() => {
        elapsedRef.current = elapsed;
    }, [elapsed]);

    useEffect(() => {
        if (!timerEnabled || !timerRunning) return undefined;
        const baseElapsed = elapsedRef.current;
        const startedAt = performance.now();
        const timerId = window.setInterval(() => {
            const nextElapsed =
                baseElapsed + (performance.now() - startedAt) / 1000;
            elapsedRef.current = nextElapsed;
            store.getState().setElapsed(nextElapsed);
        }, 250);
        return () => window.clearInterval(timerId);
    }, [revision, store, timerEnabled, timerRunning]);

    function toggleTimer(fullscreen) {
        const state = store.getState();
        const nextEnabled = !state.timerEnabled;
        if (nextEnabled && fullscreen) {
            manuallyPausedRef.current = false;
            state.setTimerRunning(true);
        }
        if (!nextEnabled) state.setTimerRunning(false);
        state.setTimerEnabled(nextEnabled);
    }

    function toggleTimerRunning() {
        const state = store.getState();
        manuallyPausedRef.current = state.timerRunning;
        state.setTimerRunning(!state.timerRunning);
    }

    function resetTimer(fullscreen) {
        const state = store.getState();
        elapsedRef.current = 0;
        manuallyPausedRef.current = false;
        state.resetTimer();
        setRevision((value) => value + 1);
        state.setTimerRunning(Boolean(fullscreen && state.timerEnabled));
    }

    function handleFullscreenChange(fullscreen) {
        const state = store.getState();
        if (fullscreen && state.timerEnabled && !manuallyPausedRef.current) {
            state.setTimerRunning(true);
        }
    }

    return {
        handleFullscreenChange,
        resetTimer,
        toggleTimer,
        toggleTimerRunning,
    };
}
