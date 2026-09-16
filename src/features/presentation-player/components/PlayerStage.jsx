import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { useViewportScale } from '../../../hooks/useViewportScale.js';
import { useFullscreen } from '../hooks/useFullscreen.js';
import { usePresentationTimer } from '../hooks/usePresentationTimer.js';
import { useSlideRuntime } from '../hooks/useSlideRuntime.js';
import { formatTime } from '../lib/format-time.js';
import { isInteractiveTarget } from '../lib/isInteractiveTarget.js';
import { usePlayerStore, usePlayerStoreApi } from '../state/PlayerStoreProvider.jsx';
import { PlayerControls } from './PlayerControls.jsx';
import styles from '../../../player/PresentationPlayer.module.css';

export function PlayerStage({ leaving, onClose, presentation }) {
    const store = usePlayerStoreApi();
    const metadata = usePlayerStore((state) => state.metadata);
    const activeIndex = usePlayerStore((state) => state.activeIndex);
    const previousIndex = usePlayerStore((state) => state.previousIndex);
    const readySlideId = usePlayerStore((state) => state.readySlideId);
    const playerError = usePlayerStore((state) => state.playerError);
    const timerEnabled = usePlayerStore((state) => state.timerEnabled);
    const timerPosition = usePlayerStore((state) => state.timerPosition);
    const elapsed = usePlayerStore((state) => state.elapsed);
    const [closeSignal, setCloseSignal] = useState(0);
    const playerRef = useRef(null);
    const frameRef = useRef(null);
    const controlsRef = useRef(null);
    const activationFrameRef = useRef(0);
    const frameFocusRequestedRef = useRef(true);
    const activeSlide = metadata.slides[activeIndex];
    const isReady = readySlideId === activeSlide.id;
    const runtime = useSlideRuntime(presentation, true);
    const scale = useViewportScale(playerRef, metadata.viewport);
    const timer = usePresentationTimer();
    const { toggle: toggleFullscreen } = useFullscreen(
        playerRef,
        timer.handleFullscreenChange,
    );

    function focusSlideFrame() {
        window.requestAnimationFrame(() => {
            frameRef.current?.focus({ preventScroll: true });
            frameFocusRequestedRef.current = false;
        });
    }

    function navigateTo(nextIndex, { focusFrame = false } = {}) {
        frameFocusRequestedRef.current =
            focusFrame || document.activeElement === frameRef.current;
        if (!store.getState().navigateTo(nextIndex)) return;
        window.cancelAnimationFrame(activationFrameRef.current);
        controlsRef.current?.closeMenus();
        setCloseSignal((value) => value + 1);
    }

    const onWindowMessage = useEffectEvent((event) => {
        if (event.source !== frameRef.current?.contentWindow) return;
        if (event.data?.version !== 1) return;
        if (event.data?.slideId !== store.getState().metadata.slides[store.getState().activeIndex].id) return;

        if (event.data.type === 'web-deck:ready') {
            const source = event.source;
            const slideId = event.data.slideId;
            window.cancelAnimationFrame(activationFrameRef.current);
            activationFrameRef.current = window.requestAnimationFrame(() => {
                if (source !== frameRef.current?.contentWindow) return;
                store.getState().markSlideReady(slideId);
                activationFrameRef.current = window.requestAnimationFrame(() => {
                    if (source !== frameRef.current?.contentWindow) return;
                    source.postMessage(
                        { type: 'web-deck:activate', version: 1, slideId },
                        '*',
                    );
                });
            });
        }
        if (event.data.type === 'web-deck:next') navigateTo(activeIndex + 1);
        if (event.data.type === 'web-deck:previous') navigateTo(activeIndex - 1);
        if (event.data.type === 'web-deck:escape') controlsRef.current?.closeForEscape();
    });

    const onWindowKeyDown = useEffectEvent((event) => {
        if (event.key === 'Escape') {
            controlsRef.current?.closeForEscape();
            return;
        }
        if (event.key === 'ArrowRight' || event.key === 'PageDown') {
            event.preventDefault();
            navigateTo(activeIndex + 1, { focusFrame: true });
            return;
        }
        if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
            event.preventDefault();
            navigateTo(activeIndex - 1, { focusFrame: true });
            return;
        }
        if (isInteractiveTarget(event.target)) return;
        if (event.key === ' ') {
            event.preventDefault();
            navigateTo(activeIndex + 1);
        }
    });

    useEffect(() => {
        function handleMessage(event) {
            onWindowMessage(event);
        }
        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('message', handleMessage);
            window.cancelAnimationFrame(activationFrameRef.current);
        };
    }, []);

    useEffect(() => {
        function handleKeyDown(event) {
            onWindowKeyDown(event);
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (previousIndex === null || !isReady) return undefined;
        const timerId = window.setTimeout(
            () => store.getState().clearPreviousSlide(),
            420,
        );
        return () => window.clearTimeout(timerId);
    }, [isReady, previousIndex, store]);

    useEffect(() => {
        if (!isReady || !frameFocusRequestedRef.current) return;
        frameRef.current?.focus({ preventScroll: true });
        frameFocusRequestedRef.current = false;
    }, [isReady]);

    async function closePresentation() {
        if (document.fullscreenElement) await document.exitFullscreen();
        onClose();
    }

    const renderedIndexes =
        previousIndex === null ? [activeIndex] : [previousIndex, activeIndex];
    const viewportStyle = {
        '--slide-width': `${metadata.viewport.width}px`,
        '--slide-height': `${metadata.viewport.height}px`,
        '--slide-scale': scale,
    };

    return (
        <main className={`${styles.player} ${leaving ? styles.playerLeaving : ''}`} ref={playerRef}>
            <div className={styles.stage}>
                {runtime && renderedIndexes.map((slideIndex) => {
                    const renderedSlide = metadata.slides[slideIndex];
                    const isActive = slideIndex === activeIndex;
                    const state = isActive ? (isReady ? 'ready' : 'loading') : 'waiting';
                    const isInteractive = isActive && isReady;
                    return (
                        <div
                            key={renderedSlide.id}
                            className={`${styles.slideViewport} ${isActive && isReady ? styles.slideReady : ''} ${isActive ? '' : styles.slideWaiting}`}
                            data-slide-state={state}
                            style={viewportStyle}
                            inert={isInteractive ? undefined : ''}
                            aria-hidden={isInteractive ? undefined : true}
                        >
                            <iframe
                                ref={isActive ? frameRef : null}
                                className={styles.slideFrame}
                                src={runtime.getSlideUrl(renderedSlide.id)}
                                sandbox="allow-scripts"
                                role="document"
                                aria-label={`Diapositiva ${slideIndex + 1}: ${renderedSlide.title}`}
                                tabIndex={isInteractive ? 0 : -1}
                                referrerPolicy="no-referrer"
                            />
                        </div>
                    );
                })}
            </div>
            {!isReady && <div className={styles.loading} role="status"><span className={styles.loadingMark} />Preparando diapositiva {activeIndex + 1}</div>}
            {playerError && <p className={styles.playerError} role="alert">{playerError}</p>}
            <PlayerControls
                ref={controlsRef}
                closeSignal={closeSignal}
                onClose={closePresentation}
                onFocusFrame={focusSlideFrame}
                onToggleFullscreen={toggleFullscreen}
                timer={timer}
            />
            {timerEnabled && <time className={`${styles.timer} ${styles[timerPosition]}`} dateTime={`PT${Math.floor(elapsed)}S`} aria-live="off">{formatTime(elapsed)}</time>}
            <div className={styles.progress} aria-hidden="true"><span style={{ transform: `scaleX(${(activeIndex + 1) / metadata.slides.length})` }} /></div>
        </main>
    );
}
