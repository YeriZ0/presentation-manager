import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-dom', () => ({
    flushSync: (callback) => callback(),
}));

import { prefersReducedMotion, runViewTransition } from './view-transition.js';

function mockBrowser({ viewTransitions, reducedMotion }) {
    globalThis.window = {
        matchMedia: vi.fn(() => ({ matches: reducedMotion })),
    };
    if (viewTransitions) {
        globalThis.document = {
            startViewTransition: vi.fn((options) => {
                options.update();
                return { ready: Promise.resolve() };
            }),
        };
    } else {
        delete globalThis.document;
    }
}

afterEach(() => {
    delete globalThis.window;
    delete globalThis.document;
    vi.restoreAllMocks();
});

describe('runViewTransition', () => {
    it('starts a native transition with the given types', () => {
        mockBrowser({ viewTransitions: true, reducedMotion: false });
        const update = vi.fn();

        const transitioned = runViewTransition(['slide-next'], update);

        expect(transitioned).toBe(true);
        expect(globalThis.document.startViewTransition).toHaveBeenCalledOnce();
        expect(
            globalThis.document.startViewTransition.mock.calls[0][0].types,
        ).toEqual(['slide-next']);
        expect(update).toHaveBeenCalledOnce();
    });

    it('updates directly without native support', () => {
        mockBrowser({ viewTransitions: false, reducedMotion: false });
        const update = vi.fn();

        const transitioned = runViewTransition(['slide-next'], update);

        expect(transitioned).toBe(false);
        expect(update).toHaveBeenCalledOnce();
    });

    it('updates directly when motion is reduced', () => {
        mockBrowser({ viewTransitions: true, reducedMotion: true });
        const update = vi.fn();

        const transitioned = runViewTransition(['stage-exit'], update);

        expect(transitioned).toBe(false);
        expect(globalThis.document.startViewTransition).not.toHaveBeenCalled();
        expect(update).toHaveBeenCalledOnce();
    });
});

describe('prefersReducedMotion', () => {
    it('reports false outside a browser environment', () => {
        expect(prefersReducedMotion()).toBe(false);
    });
});
