import { useSyncExternalStore } from 'react';
import { MOBILE_BREAKPOINT } from '../../shared/remote-control/protocol.js';

const query = `(width < ${MOBILE_BREAKPOINT}px)`;

function subscribe(callback) {
    const media = window.matchMedia(query);
    media.addEventListener('change', callback);
    return () => media.removeEventListener('change', callback);
}

function getSnapshot() {
    return window.matchMedia(query).matches;
}

export function useMobileViewport() {
    return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
