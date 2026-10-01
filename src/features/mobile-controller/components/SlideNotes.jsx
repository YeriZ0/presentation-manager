import { FileTextIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { useRemoteControl } from '../../remote-control/hooks/useRemoteControl.js';
import styles from '../ControllerScreen.module.css';

export function SlideNotes() {
    const slide = useRemoteControl(
        (state) => state.metadata?.slides[state.player?.activeIndex ?? 0],
    );
    return (
        <section className={styles.notes} aria-labelledby="slide-notes-title">
            <h2 id="slide-notes-title" className="text-sm font-medium">
                Notas
            </h2>
            <ScrollArea
                key={slide?.id || 'loading'}
                className={styles.notesScroll}
                viewportLabel="Notas de la diapositiva"
            >
                {!slide ? (
                    <div
                        className="flex flex-col gap-3 p-4"
                        aria-label="Cargando notas"
                    >
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                ) : slide.notes ? (
                    <p className="m-0 whitespace-pre-wrap break-words p-4 text-sm leading-relaxed">
                        {slide.notes}
                    </p>
                ) : (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <FileTextIcon />
                            </EmptyMedia>
                            <EmptyTitle>
                                Sin notas para esta diapositiva
                            </EmptyTitle>
                        </EmptyHeader>
                    </Empty>
                )}
            </ScrollArea>
        </section>
    );
}
