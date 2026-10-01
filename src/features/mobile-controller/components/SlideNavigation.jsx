import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    useRemoteControl,
    useRemoteService,
} from '../../remote-control/hooks/useRemoteControl.js';
import styles from '../ControllerScreen.module.css';

export function SlideNavigation() {
    const available = useRemoteControl(
        (state) =>
            state.connection === 'connected' &&
            state.player?.phase === 'stage' &&
            state.player?.ready &&
            !state.pending,
    );
    const index = useRemoteControl((state) => state.player?.activeIndex ?? 0);
    const total = useRemoteControl(
        (state) => state.metadata?.slides.length ?? 0,
    );
    const slideId = useRemoteControl((state) => state.player?.slideId);
    const service = useRemoteService();
    return (
        <nav
            className={styles.navigation}
            aria-label="Navegación de diapositivas"
        >
            <Button
                size="navigation"
                disabled={!available || index === 0}
                aria-label="Diapositiva anterior"
                onClick={() =>
                    service.send({ type: 'previous', expectedSlideId: slideId })
                }
            >
                <ChevronLeftIcon data-icon="inline-start" />
            </Button>
            <Button
                size="navigation"
                disabled={!available || index >= total - 1}
                aria-label="Siguiente diapositiva"
                onClick={() =>
                    service.send({ type: 'next', expectedSlideId: slideId })
                }
            >
                <ChevronRightIcon data-icon="inline-start" />
            </Button>
        </nav>
    );
}
