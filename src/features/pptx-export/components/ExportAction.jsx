import { usePptxExport } from '../hooks/usePptxExport.js';
import { useShallow } from 'zustand/react/shallow';
import { MenuIcon } from '../../presentation-player/components/MenuIcon.jsx';
import { Button } from '@/components/ui/button';
import { DownloadIcon } from 'lucide-react';
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
        <Button
            variant="outline"
            size="touch"
            type="button"
            disabled={state.active}
            aria-busy={state.active}
            onClick={start}
        >
            <DownloadIcon data-icon="inline-start" />
            <span>{state.active ? 'Exportando…' : 'Exportar PPTX'}</span>
        </Button>
    );
}
