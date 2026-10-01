import { ClockIcon, PauseIcon, PlayIcon, RotateCcwIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldSet,
    FieldLegend,
} from '@/components/ui/field';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';
import {
    useRemoteControl,
    useRemoteService,
} from '../../remote-control/hooks/useRemoteControl.js';
import { TIMER_POSITIONS } from '../../../../shared/remote-control/protocol.js';

export function TimerSettings() {
    const enabled = useRemoteControl((state) =>
        Boolean(state.player?.timerEnabled),
    );
    const running = useRemoteControl((state) =>
        Boolean(state.player?.timerRunning),
    );
    const position = useRemoteControl(
        (state) => state.player?.timerPosition ?? 'top-right',
    );
    const available = useRemoteControl(
        (state) =>
            state.connection === 'connected' &&
            state.player?.phase === 'stage' &&
            !state.pending,
    );
    const service = useRemoteService();
    const RunIcon = running ? PauseIcon : PlayIcon;

    return (
        <Drawer>
            <DrawerTrigger asChild>
                <Button
                    variant="outline"
                    size="icon-touch"
                    aria-label="Ajustes del temporizador"
                >
                    <ClockIcon data-icon="inline-start" />
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="mx-auto flex w-full max-w-md flex-col gap-4">
                    <DrawerHeader>
                        <DrawerTitle>Ajustes del temporizador</DrawerTitle>
                        <DrawerDescription>
                            Estos ajustes se aplican al reloj del escritorio.
                        </DrawerDescription>
                    </DrawerHeader>
                    <FieldGroup className="px-4">
                        <Field
                            orientation="horizontal"
                            data-disabled={!available}
                            className="min-h-11"
                        >
                            <FieldLabel
                                htmlFor="timer-visible"
                                className="min-h-11 items-center"
                            >
                                Mostrar temporizador
                            </FieldLabel>
                            <Switch
                                id="timer-visible"
                                checked={enabled}
                                disabled={!available}
                                onCheckedChange={(value) =>
                                    service.send({
                                        type: 'timer-enabled',
                                        enabled: value,
                                    })
                                }
                            />
                        </Field>
                        <Field
                            orientation="horizontal"
                            data-disabled={!available || !enabled}
                        >
                            <Button
                                variant="outline"
                                size="touch"
                                disabled={!available || !enabled}
                                onClick={() =>
                                    service.send({
                                        type: 'timer-running',
                                        running: !running,
                                    })
                                }
                            >
                                <RunIcon data-icon="inline-start" />
                                {running ? 'Pausar' : 'Continuar'}
                            </Button>
                            <Button
                                variant="outline"
                                size="touch"
                                disabled={!available || !enabled}
                                onClick={() =>
                                    service.send({ type: 'timer-reset' })
                                }
                            >
                                <RotateCcwIcon data-icon="inline-start" />
                                Reiniciar
                            </Button>
                        </Field>
                        <FieldSet disabled={!available || !enabled}>
                            <FieldLegend variant="label">
                                Posición en el escritorio
                            </FieldLegend>
                            <ToggleGroup
                                type="single"
                                value={position}
                                variant="outline"
                                spacing={2}
                                disabled={!available || !enabled}
                                className="grid w-full grid-cols-2 gap-2"
                                aria-label="Posición del temporizador"
                                onValueChange={(value) => {
                                    if (value)
                                        service.send({
                                            type: 'timer-position',
                                            position: value,
                                        });
                                }}
                            >
                                {TIMER_POSITIONS.map((item) => (
                                    <ToggleGroupItem
                                        key={item.id}
                                        value={item.id}
                                        className="min-h-11 whitespace-normal"
                                    >
                                        {item.label}
                                    </ToggleGroupItem>
                                ))}
                            </ToggleGroup>
                        </FieldSet>
                    </FieldGroup>
                    <DrawerFooter>
                        <DrawerClose asChild>
                            <Button variant="outline" size="touch">
                                Cerrar ajustes
                            </Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
