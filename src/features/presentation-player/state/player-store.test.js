import { describe, expect, it } from 'vitest';
import {
    createPlayerStore,
    createPresentationMetadata,
} from './player-store.js';

const metadata = {
    title: 'Deck de prueba',
    viewport: { width: 1280, height: 720 },
    slides: [
        { id: 'one', title: 'Uno', hasNotes: true, notes: 'Nota uno' },
        { id: 'two', title: 'Dos', hasNotes: false, notes: '' },
    ],
};

describe('createPlayerStore', () => {
    it('blocks navigation until the active slide is ready', () => {
        const store = createPlayerStore(metadata);

        expect(store.getState().navigateTo(1)).toBe(false);
        store.getState().markSlideReady('one');
        expect(store.getState().navigateTo(1)).toBe(true);
        expect(store.getState().activeIndex).toBe(1);
        expect(store.getState().previousIndex).toBe(0);
        expect(store.getState().readySlideId).toBeNull();
    });

    it('keeps state isolated between presentation sessions', () => {
        const firstStore = createPlayerStore(metadata);
        const secondStore = createPlayerStore(metadata);

        firstStore.getState().start();
        firstStore.getState().setElapsed(42);

        expect(secondStore.getState().phase).toBe('preflight');
        expect(secondStore.getState().elapsed).toBe(0);
    });
});

describe('createPresentationMetadata', () => {
    it('projects only display metadata and decoded notes', () => {
        const deck = {
            title: 'Deck de prueba',
            viewport: { width: 1280, height: 720 },
            slides: [
                {
                    id: 'one',
                    title: 'Uno',
                    source: 'slides/one/index.html',
                    notes: 'notes/one.md',
                },
            ],
        };
        const files = new Map([
            ['slides/one/index.html', new TextEncoder().encode('<h1>Uno</h1>')],
            ['notes/one.md', new TextEncoder().encode('Nota uno')],
        ]);

        expect(createPresentationMetadata(deck, files)).toEqual({
            title: 'Deck de prueba',
            viewport: { width: 1280, height: 720 },
            slides: [
                { id: 'one', title: 'Uno', hasNotes: true, notes: 'Nota uno' },
            ],
        });
    });
});
