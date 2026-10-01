import { usePptxExport } from '../hooks/usePptxExport.js';
import { useShallow } from 'zustand/react/shallow';
import { MenuIcon } from '../../presentation-player/components/MenuIcon.jsx';
import styles from './PptxExport.module.css';
import playerStyles from '../../../player/PresentationPlayer.module.css';

export function ExportAction({ variant = 'preflight' }) {
    const selector = useShallow((current) => ({ active: current.active }));
    const { state, start } = usePptxExport(selector);

    if (variant === 'menu') {
        return (
            <button
                className={playerStyles.menuItem}
                type="button"
                disabled={state.active}
                aria-busy={state.active}
                onClick={start}
            >
                <MenuIcon name="download" />
                <span>
                    {state.active ? 'Exportando…' : 'Exportar a PowerPoint'}
                </span>
            </button>
        );
    }

    return (
        <button
            className={styles.preflightAction}
            type="button"
            disabled={state.active}
            aria-busy={state.active}
            onClick={start}
        >
            <MenuIcon name="download" />
            <span>
                {state.active ? 'Exportando…' : 'Exportar a PowerPoint'}
            </span>
        </button>
    );
}
