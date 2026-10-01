export function createPresentationTimer({ store, clock, scheduler }) {
    let interval = null;
    let unsubscribe = null;
    let startedAt = 0;
    let baseElapsed = 0;
    let manuallyPaused = false;

    function tick() {
        store
            .getState()
            .setElapsed(baseElapsed + (clock.now() - startedAt) / 1000);
    }

    function reconcile() {
        const state = store.getState();
        const running =
            state.phase === 'stage' && state.timerEnabled && state.timerRunning;
        if (running && interval === null) {
            baseElapsed = state.elapsed;
            startedAt = clock.now();
            interval = scheduler.setInterval(tick, 250);
        } else if (!running && interval !== null) {
            scheduler.clearInterval(interval);
            interval = null;
        }
    }

    function setEnabled(enabled, fullscreen = store.getState().fullscreen) {
        const state = store.getState();
        if (enabled && !state.timerEnabled && fullscreen) {
            manuallyPaused = false;
            state.setTimerRunning(true);
        }
        state.setTimerEnabled(enabled);
    }

    function setRunning(running) {
        if (!store.getState().timerEnabled) return;
        manuallyPaused = !running;
        store.getState().setTimerRunning(running);
    }

    function resetTimer(fullscreen = store.getState().fullscreen) {
        const state = store.getState();
        if (interval !== null) {
            scheduler.clearInterval(interval);
            interval = null;
        }
        manuallyPaused = false;
        state.resetTimer();
        state.setTimerRunning(Boolean(fullscreen && state.timerEnabled));
        reconcile();
    }

    return {
        setEnabled,
        setRunning,
        resetTimer,
        setPosition(position) {
            store.getState().setTimerPosition(position);
        },
        toggleTimer(fullscreen) {
            setEnabled(!store.getState().timerEnabled, fullscreen);
        },
        toggleTimerRunning() {
            setRunning(!store.getState().timerRunning);
        },
        handleFullscreenChange(fullscreen) {
            const state = store.getState();
            if (fullscreen && state.timerEnabled && !manuallyPaused)
                state.setTimerRunning(true);
        },
        start() {
            if (unsubscribe) return;
            unsubscribe = store.subscribe(reconcile);
            reconcile();
        },
        stop() {
            unsubscribe?.();
            unsubscribe = null;
            if (interval !== null) {
                tick();
                scheduler.clearInterval(interval);
                interval = null;
            }
        },
    };
}
