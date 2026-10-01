import { Button } from '@/components/ui/button';
import {
    useRemoteControl,
    useRemoteService,
} from '../remote-control/hooks/useRemoteControl.js';
import { ConnectionStatus } from './components/ConnectionStatus.jsx';
import { ControllerError } from './components/ControllerError.jsx';
import { PairingForm } from './components/PairingForm.jsx';
import { TimerDisplay } from './components/TimerDisplay.jsx';
import { TimerSettings } from './components/TimerSettings.jsx';
import { DisconnectDialog } from './components/DisconnectDialog.jsx';
import { SlideNotes } from './components/SlideNotes.jsx';
import { SlideNavigation } from './components/SlideNavigation.jsx';
import styles from './ControllerScreen.module.css';

export function ControllerScreen() {
    const sessionId = useRemoteControl((state) => state.sessionId);
    const title = useRemoteControl((state) => state.metadata?.title);
    const slideTitle = useRemoteControl(
        (state) =>
            state.metadata?.slides[state.player?.activeIndex ?? 0]?.title,
    );
    const number = useRemoteControl((state) =>
        state.player ? state.player.activeIndex + 1 : null,
    );
    const total = useRemoteControl((state) => state.metadata?.slides.length);
    const phase = useRemoteControl((state) => state.player?.phase);
    const ready = useRemoteControl((state) => Boolean(state.player?.ready));
    const connection = useRemoteControl((state) => state.connection);
    const playerError = useRemoteControl((state) => state.player?.playerError);
    const service = useRemoteService();

    return (
        <main className={styles.screen} data-slot="controller">
            <div className={sessionId ? styles.shell : styles.pairing}>
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                        Armadillo PP in Web
                    </span>
                    <ConnectionStatus />
                </div>
                {!sessionId ? (
                    <PairingForm />
                ) : (
                    <>
                        <header className="flex items-center gap-3">
                            <TimerDisplay />
                            <TimerSettings />
                            <DisconnectDialog />
                        </header>
                        <section
                            className="flex flex-col gap-2"
                            aria-labelledby="controller-slide-title"
                        >
                            <p
                                className="truncate text-xs text-muted-foreground"
                                title={title}
                            >
                                {title || 'Recuperando presentación…'}
                            </p>
                            <div className="flex items-start justify-between gap-4">
                                <h1
                                    id="controller-slide-title"
                                    className="m-0 line-clamp-2 break-words text-lg font-semibold"
                                    title={slideTitle}
                                >
                                    {slideTitle || 'Diapositiva'}
                                </h1>
                                <span className="shrink-0 text-lg tabular-nums">
                                    {number ?? '—'} / {total ?? '—'}
                                </span>
                            </div>
                        </section>
                        <ControllerError />
                        {playerError ? (
                            <p
                                role="alert"
                                className="text-sm text-destructive"
                            >
                                {playerError}
                            </p>
                        ) : null}
                        <SlideNotes />
                        <p
                            className="text-center text-xs text-muted-foreground"
                            role="status"
                        >
                            {connection !== 'connected'
                                ? 'Esperando conexión y sincronización…'
                                : phase === 'preflight'
                                  ? 'Esperando a que comience la presentación'
                                  : !ready
                                    ? 'Preparando diapositiva…'
                                    : 'Listo para controlar'}
                        </p>
                        {connection === 'recovering' ? (
                            <Button
                                variant="outline"
                                size="touch"
                                onClick={() => service.reconnect()}
                            >
                                Volver a sincronizar
                            </Button>
                        ) : null}
                        <SlideNavigation />
                    </>
                )}
            </div>
        </main>
    );
}
