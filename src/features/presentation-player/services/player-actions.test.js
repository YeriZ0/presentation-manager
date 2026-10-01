import { describe, expect, it } from 'vitest';
import { createPlayerStore } from '../state/player-store.js';
import { createPlayerActions } from './player-actions.js';
import { createPresentationTimer } from './presentation-timer.js';

function fixture() {
    let now = 0;
    let tick;
    const store = createPlayerStore({
        title: 'Test',
        slides: ['one', 'two', 'three'].map((id) => ({
            id,
            title: id,
            notes: '',
        })),
    });
    store.getState().setPhase('stage');
    const timer = createPresentationTimer({
        store,
        clock: { now: () => now },
        scheduler: {
            setInterval: (callback) => {
                tick = callback;
                return 1;
            },
            clearInterval: () => {
                tick = null;
            },
        },
    });
    const actions = createPlayerActions({
        store,
        timer,
        clock: { now: () => now },
    });
    timer.start();
    return {
        store,
        timer,
        actions,
        advance: (duration) => {
            now += duration;
            tick?.();
        },
    };
}

describe('shared player actions', () => {
    it('deduplicates navigation at the execution boundary and rejects stale slides', () => {
        const { store, actions } = fixture();
        store.getState().markSlideReady('one');
        let effects = 0;
        actions.subscribeNavigation(() => {
            effects += 1;
        });
        const request = {
            requestId: 'move',
            command: { type: 'next', expectedSlideId: 'one' },
        };
        expect(actions.execute(request).ok).toBe(true);
        store.getState().markSlideReady('two');
        expect(actions.execute(request).ok).toBe(true);
        expect(store.getState().activeIndex).toBe(1);
        expect(effects).toBe(1);
        expect(
            actions.execute({ ...request, requestId: 'stale' }),
        ).toMatchObject({ ok: false, error: 'STALE_COMMAND' });
        expect(
            actions.execute({
                ...request,
                command: { type: 'previous', expectedSlideId: 'two' },
            }),
        ).toMatchObject({ ok: false, error: 'INVALID_MESSAGE' });
    });

    it('blocks commands in preflight and waits for readiness after returning to the stage', () => {
        const { store, actions } = fixture();
        store.getState().markSlideReady('one');
        store.getState().setPhase('preflight');
        expect(
            actions.execute({
                requestId: 'before',
                command: { type: 'next', expectedSlideId: 'one' },
            }),
        ).toMatchObject({ error: 'PLAYER_NOT_READY' });
        store.getState().setPhase('stage');
        expect(
            actions.execute({
                requestId: 'after',
                command: { type: 'next', expectedSlideId: 'one' },
            }),
        ).toMatchObject({ error: 'PLAYER_NOT_READY' });
    });

    it('preserves manual pause, reset and elapsed time across route changes', () => {
        const { store, timer, advance } = fixture();
        store.getState().setFullscreen(true);
        timer.setEnabled(true);
        advance(1500);
        expect(store.getState().elapsed).toBe(1.5);
        timer.setRunning(false);
        timer.handleFullscreenChange(true);
        advance(1000);
        expect(store.getState().elapsed).toBe(1.5);
        timer.resetTimer();
        expect(store.getState().elapsed).toBe(0);
        expect(store.getState().timerRunning).toBe(true);
        advance(2000);
        store.getState().setPhase('preflight');
        advance(1000);
        expect(store.getState().elapsed).toBe(2);
        expect(store.getState().timerRunning).toBe(false);
        timer.stop();
    });
});
