import { createStore } from 'zustand/vanilla';

const INITIAL_TIMER_POSITION = 'top-right';

export function createPresentationMetadata(deck, files) {
    const decoder = new TextDecoder();

    return {
        title: deck.title,
        viewport: deck.viewport,
        slides: deck.slides.map((slide) => ({
            id: slide.id,
            title: slide.title || slide.id,
            hasNotes: Boolean(slide.notes),
            notes: slide.notes ? decoder.decode(files.get(slide.notes)) : '',
        })),
    };
}

export function createPlayerStore(metadata) {
    return createStore((set, get) => ({
        metadata,
        phase: 'preflight',
        activeIndex: 0,
        readySlideId: null,
        previousIndex: null,
        fullscreen: false,
        playerError: '',
        timerEnabled: false,
        timerRunning: false,
        timerPosition: INITIAL_TIMER_POSITION,
        elapsed: 0,
        start: () => set({ phase: 'stage' }),
        navigateTo: (nextIndex) => {
            const state = get();
            const activeSlide = state.metadata.slides[state.activeIndex];
            if (state.readySlideId !== activeSlide.id) return false;
            if (
                nextIndex < 0 ||
                nextIndex >= state.metadata.slides.length ||
                nextIndex === state.activeIndex
            ) {
                return false;
            }
            set({
                activeIndex: nextIndex,
                previousIndex: state.activeIndex,
                readySlideId: null,
                playerError: '',
            });
            return true;
        },
        markSlideReady: (slideId) => {
            const state = get();
            if (state.metadata.slides[state.activeIndex].id !== slideId) return;
            set({ readySlideId: slideId });
        },
        clearPreviousSlide: () => set({ previousIndex: null }),
        setFullscreen: (fullscreen) => set({ fullscreen }),
        setPlayerError: (playerError) => set({ playerError }),
        setTimerEnabled: (timerEnabled) =>
            set({
                timerEnabled,
                timerRunning: timerEnabled ? get().timerRunning : false,
            }),
        setTimerRunning: (timerRunning) => set({ timerRunning }),
        setTimerPosition: (timerPosition) => set({ timerPosition }),
        setElapsed: (elapsed) => set({ elapsed }),
        resetTimer: () => set({ elapsed: 0 }),
    }));
}
