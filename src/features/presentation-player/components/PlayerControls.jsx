import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { MenuIcon } from './MenuIcon.jsx';
import { usePlayerStore } from '../state/PlayerStoreProvider.jsx';
import styles from '../../../player/PresentationPlayer.module.css';

const TIMER_POSITIONS = [
    { id: 'top-left', label: 'Arriba izquierda' },
    { id: 'top-right', label: 'Arriba derecha' },
    { id: 'bottom-left', label: 'Abajo izquierda' },
    { id: 'bottom-right', label: 'Abajo derecha' },
];

export const PlayerControls = forwardRef(function PlayerControls({
    closeSignal,
    onClose,
    onFocusFrame,
    onToggleFullscreen,
    timer,
}, ref) {
    const fullscreen = usePlayerStore((state) => state.fullscreen);
    const timerEnabled = usePlayerStore((state) => state.timerEnabled);
    const timerPosition = usePlayerStore((state) => state.timerPosition);
    const timerRunning = usePlayerStore((state) => state.timerRunning);
    const setTimerPosition = usePlayerStore((state) => state.setTimerPosition);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isTimerMenuOpen, setIsTimerMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const timerMenuRef = useRef(null);
    const timerMenuTriggerRef = useRef(null);
    const controlRef = useRef(null);

    function closeMenus() {
        setIsTimerMenuOpen(false);
        setIsMenuOpen(false);
    }

    function closeTimerMenu() {
        setIsTimerMenuOpen(false);
        timerMenuTriggerRef.current?.focus({ preventScroll: true });
    }

    useEffect(closeMenus, [closeSignal]);

    useEffect(() => {
        if (!isMenuOpen) return undefined;
        function handlePointerDown(event) {
            if (
                !menuRef.current?.contains(event.target) &&
                !controlRef.current?.contains(event.target)
            ) {
                closeMenus();
            }
        }
        document.addEventListener('pointerdown', handlePointerDown);
        return () => document.removeEventListener('pointerdown', handlePointerDown);
    }, [isMenuOpen]);

    useEffect(() => {
        if (isMenuOpen) menuRef.current?.querySelector('button')?.focus();
    }, [isMenuOpen]);

    useEffect(() => {
        if (isTimerMenuOpen) timerMenuRef.current?.querySelector('button')?.focus();
    }, [isTimerMenuOpen]);

    async function handleFullscreen() {
        const changed = await onToggleFullscreen();
        if (!changed) return;
        closeMenus();
        onFocusFrame();
    }

    function selectTimerPosition(position) {
        setTimerPosition(position);
        closeTimerMenu();
    }

    function handleCloseMenu() {
        if (menuRef.current?.contains(document.activeElement)) {
            controlRef.current?.focus({ preventScroll: true });
        }
        closeMenus();
    }

    useImperativeHandle(ref, () => ({
        closeForEscape: () => {
            if (isTimerMenuOpen) {
                closeTimerMenu();
                return;
            }
            handleCloseMenu();
        },
        closeMenus,
    }));

    return (
        <div className={styles.controls}>
            {isMenuOpen && (
                <div
                    ref={menuRef}
                    className={styles.menu}
                    aria-label="Controles de presentación"
                >
                    <button className={styles.menuItem} type="button" onClick={handleFullscreen}>
                        <MenuIcon name="corners-out" />
                        <span>{fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}</span>
                    </button>
                    <button className={styles.menuItem} type="button" onClick={() => timer.toggleTimer(fullscreen)}>
                        <MenuIcon name="timer" />
                        <span>{timerEnabled ? 'Ocultar timer' : 'Mostrar timer'}</span>
                    </button>
                    {timerEnabled && (
                        <button className={styles.menuItem} type="button" onClick={timer.toggleTimerRunning}>
                            <MenuIcon name={timerRunning ? 'pause' : 'play'} />
                            <span>{timerRunning ? 'Pausar timer' : 'Continuar timer'}</span>
                        </button>
                    )}
                    {timerEnabled && (
                        <button className={styles.menuItem} type="button" onClick={() => timer.resetTimer(fullscreen)}>
                            <MenuIcon name="arrow-counter-clockwise" />
                            <span>Reiniciar timer</span>
                        </button>
                    )}
                    {timerEnabled && (
                        <button
                            ref={timerMenuTriggerRef}
                            className={styles.menuItem}
                            type="button"
                            aria-expanded={isTimerMenuOpen}
                            aria-haspopup="true"
                            onClick={() => setIsTimerMenuOpen((open) => !open)}
                        >
                            <MenuIcon name="crosshair" />
                            <span>Posición del timer</span>
                            <MenuIcon name="caret-left" className={styles.menuCaret} />
                        </button>
                    )}
                    <button className={`${styles.menuItem} ${styles.destructiveAction}`} type="button" onClick={onClose}>
                        <MenuIcon name="x" />
                        <span>Cerrar presentación</span>
                    </button>
                    {timerEnabled && isTimerMenuOpen && (
                        <div ref={timerMenuRef} className={styles.timerMenu} aria-label="Posición del timer">
                            {TIMER_POSITIONS.map((position) => (
                                <button
                                    key={position.id}
                                    className={`${styles.menuItem} ${timerPosition === position.id ? styles.timerPositionActive : ''}`}
                                    type="button"
                                    aria-pressed={timerPosition === position.id}
                                    onClick={() => selectTimerPosition(position.id)}
                                >
                                    <MenuIcon name="crosshair" />
                                    <span>{position.label}</span>
                                    {timerPosition === position.id && <MenuIcon name="check" className={styles.menuIndicator} />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
            <button
                ref={controlRef}
                className={styles.controlButton}
                type="button"
                aria-label={isMenuOpen ? 'Cerrar controles' : 'Abrir controles'}
                aria-expanded={isMenuOpen}
                onClick={() => (isMenuOpen ? handleCloseMenu() : setIsMenuOpen(true))}
            >
                <span />
                <span />
            </button>
        </div>
    );
});
