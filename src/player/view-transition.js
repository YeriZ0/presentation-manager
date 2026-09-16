import { flushSync } from 'react-dom';

// Runs update inside a native same-document view transition when the
// browser supports it and the user allows motion, otherwise runs it
// directly so the CSS fallback takes over
// Returns true when a native transition was started
export function runViewTransition(types, update) {
    if (
        typeof document === 'undefined' ||
        typeof document.startViewTransition !== 'function' ||
        prefersReducedMotion()
    ) {
        update();
        return false;
    }
    document.startViewTransition({
        update: () => {
            flushSync(update);
        },
        types,
    });
    return true;
}

// Reports the reduced motion preference without assuming a browser env
export function prefersReducedMotion() {
    return (
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
}
