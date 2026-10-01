import { useRemoteControl } from '../../remote-control/hooks/useRemoteControl.js';
import { formatTime } from '@/lib/format-time';

export function TimerDisplay() {
    const elapsed = useRemoteControl((state) => state.player?.elapsed ?? 0);
    const enabled = useRemoteControl((state) =>
        Boolean(state.player?.timerEnabled),
    );
    const running = useRemoteControl((state) =>
        Boolean(state.player?.timerRunning),
    );
    return (
        <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-xs text-muted-foreground">
                Temporizador ·{' '}
                {!enabled ? 'Oculto' : running ? 'En marcha' : 'Pausado'}
            </span>
            <time
                className="text-xl font-semibold tabular-nums"
                dateTime={`PT${Math.floor(elapsed)}S`}
                aria-live="off"
            >
                {formatTime(elapsed)}
            </time>
        </div>
    );
}
