import { XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useRemoteService } from '../../remote-control/hooks/useRemoteControl.js';

export function DisconnectDialog() {
    const service = useRemoteService();
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="outline"
                    size="icon-touch"
                    aria-label="Desconectar control móvil"
                >
                    <XIcon data-icon="inline-start" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        ¿Seguro que quieres desconectarte?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        La presentación seguirá abierta en el escritorio. Para
                        volver a controlar necesitarás un nuevo código.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel size="touch">Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        variant="destructive"
                        size="touch"
                        onClick={() => service.disconnect()}
                    >
                        Desconectar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
