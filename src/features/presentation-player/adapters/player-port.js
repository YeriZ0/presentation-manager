export function createPlayerReader(store) {
    return {
        readMetadata() {
            const metadata = store.getState().metadata;
            return {
                title: metadata.title,
                slides: metadata.slides.map(({ id, title, notes }) => ({
                    id,
                    title,
                    notes,
                })),
            };
        },
        readState() {
            const state = store.getState();
            const slideId = state.metadata.slides[state.activeIndex].id;
            return {
                phase: state.phase,
                activeIndex: state.activeIndex,
                slideId,
                ready:
                    state.phase === 'stage' && state.readySlideId === slideId,
                fullscreen: state.fullscreen,
                timerEnabled: state.timerEnabled,
                timerRunning: state.timerRunning,
                timerPosition: state.timerPosition,
                elapsed: state.elapsed,
                playerError: state.playerError.slice(0, 1024),
            };
        },
        subscribe: (listener) => store.subscribe(listener),
    };
}
