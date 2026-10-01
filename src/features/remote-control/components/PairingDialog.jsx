import { useEffect, useState, useSyncExternalStore } from 'react';
import { RefreshCwIcon, SmartphoneIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import {
    useRemoteControl,
    useRemoteService,
} from '../hooks/useRemoteControl.js';
import { remoteErrorMessage } from '../lib/error-messages.js';

const subscribeFullscreen = (callback) => {
    document.addEventListener('fullscreenchange', callback);
    return () => document.removeEventListener('fullscreenchange', callback);
};
const readFullscreen = () => document.fullscreenElement;

export function PairingDialog({ children }) {
    const [open, setOpen] = useState(false);
    const [now, setNow] = useState(() => Date.now());
    const code = useRemoteControl((state) => state.code);
    const expiresAt = useRemoteControl((state) => state.expiresAt);
    const status = useRemoteControl((state) => state.status?.controllerState);
    const connection = useRemoteControl((state) => state.connection);
    const pending = useRemoteControl((state) => state.pending);
    const error = useRemoteControl((state) => state.error);
    const service = useRemoteService();
    const container = useSyncExternalStore(
        subscribeFullscreen,
        readFullscreen,
        () => null,
    );
    useEffect(() => {
        if (!open || !expiresAt) return;
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, [open, expiresAt]);
    const remaining = Math.max(0, Math.ceil(((expiresAt || 0) - now) / 1000));
    const occupied = status === 'connected' || status === 'recovering';

    return (
        <Dialog
            open={open}
            onOpenChange={(value) => {
                setOpen(value);
                if (value) setNow(Date.now());
            }}
        >
            {children}
            <DialogContent
                container={container || undefined}
                onCloseAutoFocus={(event) => {
                    const target =
                        document.querySelector('[data-connect-controller]') ||
                        document.querySelector('[data-player-controls]');
                    if (target) {
                        event.preventDefault();
                        target.focus({ preventScroll: true });
                    }
                }}
            >
                <DialogHeader>
                    <DialogTitle>Conectar control móvil</DialogTitle>
                    <DialogDescription>
                        Abra esta dirección en el móvil e introduzca el código.
                        La presentación permanece en este equipo.
                    </DialogDescription>
                </DialogHeader>
                <p className="break-all rounded-md bg-muted p-3 text-sm">
                    {window.location.origin}/controller
                </p>
                {pending ? (
                    <p className="flex items-center gap-2" role="status">
                        <Spinner /> Preparando conexión…
                    </p>
                ) : null}
                {occupied ? (
                    <Badge variant="secondary">
                        <SmartphoneIcon data-icon="inline-start" />
                        {status === 'connected'
                            ? 'Móvil conectado'
                            : 'Esperando reconexión del móvil'}
                    </Badge>
                ) : code && remaining > 0 ? (
                    <div className="flex flex-col items-center gap-2 py-4">
                        <p
                            className="text-4xl font-semibold tracking-widest tabular-nums"
                            aria-label={`Código ${code.split('').join(' ')}`}
                        >
                            {code.slice(0, 3)} {code.slice(3)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Válido durante {Math.floor(remaining / 60)}:
                            {String(remaining % 60).padStart(2, '0')}
                        </p>
                    </div>
                ) : !pending ? (
                    <p className="text-sm text-muted-foreground">
                        Genere un código para emparejar el móvil.
                    </p>
                ) : null}
                {connection === 'recovering' ? (
                    <p role="status">Reconectando con el servidor…</p>
                ) : null}
                {error ? (
                    <Alert variant="destructive">
                        <AlertDescription>
                            {remoteErrorMessage(error)}
                        </AlertDescription>
                    </Alert>
                ) : null}
                <DialogFooter>
                    {connection === 'recovering' ? (
                        <Button
                            variant="outline"
                            disabled={pending}
                            onClick={() => service.preparePairing()}
                        >
                            Reintentar conexión
                        </Button>
                    ) : null}
                    {!occupied ? (
                        <Button
                            variant="outline"
                            disabled={pending || connection === 'recovering'}
                            onClick={() => service.preparePairing(true)}
                        >
                            <RefreshCwIcon data-icon="inline-start" />
                            Generar nuevo código
                        </Button>
                    ) : null}
                    <DialogClose asChild>
                        <Button>Cerrar</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
