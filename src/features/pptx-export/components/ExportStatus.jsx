import { usePptxExport } from '../hooks/usePptxExport.js';
import { useShallow } from 'zustand/react/shallow';
import styles from './PptxExport.module.css';

export function ExportStatus({ placement = 'preflight' }) {
    const selector = useShallow((current) => ({
        active: current.active,
        currentSlide: current.currentSlide,
        error: current.error,
        message: current.message,
        slideCount: current.slideCount,
        status: current.status,
    }));
    const { state, cancel, reset, start } = usePptxExport(selector);

    if (state.status === 'idle') return null;

    const isError = state.status === 'error';
    const isActive = state.active;

    return (
        <div
            className={`${styles.status} ${styles[placement]}`}
            role={isError ? 'alert' : 'status'}
            aria-live={isError ? 'assertive' : 'polite'}
            aria-busy={isActive}
        >
            <span>
                {isError
                    ? state.error
                    : state.status === 'capturing'
                      ? `${state.message} (${state.currentSlide}/${state.slideCount})`
                      : state.message}
            </span>
            {isActive ? (
                <button type="button" onClick={cancel}>
                    Cancelar
                </button>
            ) : isError ? (
                <button type="button" onClick={reset}>
                    Cerrar aviso
                </button>
            ) : (
                <button type="button" onClick={reset}>
                    Cerrar
                </button>
            )}
            {isError && (
                <button type="button" onClick={start}>
                    Reintentar
                </button>
            )}
        </div>
    );
}
