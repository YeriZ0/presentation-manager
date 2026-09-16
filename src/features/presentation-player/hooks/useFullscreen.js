import { useEffect, useEffectEvent } from 'react';
import { usePlayerStoreApi } from '../state/PlayerStoreProvider.jsx';

export function useFullscreen(playerRef, onChange) {
    const store = usePlayerStoreApi();
    const onFullscreenChange = useEffectEvent(onChange);

    useEffect(() => {
        function handleChange() {
            const fullscreen = Boolean(document.fullscreenElement);
            store.getState().setFullscreen(fullscreen);
            onFullscreenChange(fullscreen);
        }
        document.addEventListener('fullscreenchange', handleChange);
        return () => document.removeEventListener('fullscreenchange', handleChange);
    }, [store]);

    async function toggle() {
        const state = store.getState();
        state.setPlayerError('');
        try {
            if (document.fullscreenElement) await document.exitFullscreen();
            else await playerRef.current?.requestFullscreen();
            return true;
        } catch {
            state.setPlayerError(
                'El navegador rechazo el permiso de pantalla completa.',
            );
            return false;
        }
    }

    return { toggle };
}
