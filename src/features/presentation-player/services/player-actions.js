import { assertCommand } from '../../../../shared/remote-control/validators.js';
import { LIMITS } from '../../../../shared/remote-control/protocol.js';
import {
    failure,
    success,
    RemoteError,
} from '../../../../shared/remote-control/errors.js';

export function createPlayerActions({ store, timer, clock }) {
    const navigationListeners = new Set();
    const results = new Map();

    function navigateTo(index, options = {}) {
        const state = store.getState();
        if (state.phase !== 'stage' || !state.navigateTo(index)) return false;
        navigationListeners.forEach((listener) => listener(options));
        return true;
    }

    function move(command, delta) {
        const state = store.getState();
        const slide = state.metadata.slides[state.activeIndex];
        if (command.expectedSlideId !== slide.id)
            throw new RemoteError('STALE_COMMAND');
        if (state.readySlideId !== slide.id)
            throw new RemoteError('PLAYER_NOT_READY');
        const nextIndex = state.activeIndex + delta;
        if (nextIndex < 0 || nextIndex >= state.metadata.slides.length)
            throw new RemoteError('OUT_OF_RANGE');
        if (!navigateTo(nextIndex)) throw new RemoteError('PLAYER_NOT_READY');
    }

    const handlers = {
        next: (command) => move(command, 1),
        previous: (command) => move(command, -1),
        'timer-enabled': (command) => timer.setEnabled(command.enabled),
        'timer-running': (command) => timer.setRunning(command.running),
        'timer-reset': () => timer.resetTimer(),
        'timer-position': (command) => timer.setPosition(command.position),
    };

    return {
        navigateTo,
        timer,
        subscribeNavigation(listener) {
            navigationListeners.add(listener);
            return () => navigationListeners.delete(listener);
        },
        execute({ requestId, command }) {
            const now = clock.now();
            for (const [key, entry] of results)
                if (entry.until <= now) results.delete(key);
            const fingerprint = JSON.stringify(command);
            const cached = results.get(requestId);
            if (cached)
                return cached.fingerprint === fingerprint
                    ? cached.result
                    : failure(new RemoteError('INVALID_MESSAGE'));
            let result;
            try {
                assertCommand(command);
                if (store.getState().phase !== 'stage')
                    throw new RemoteError('PLAYER_NOT_READY');
                handlers[command.type](command);
                result = success();
            } catch (error) {
                result = failure(error);
            }
            if (results.size >= LIMITS.maxResults)
                results.delete(results.keys().next().value);
            results.set(requestId, {
                fingerprint,
                result,
                until: now + LIMITS.resultTtlMs,
            });
            return result;
        },
    };
}
