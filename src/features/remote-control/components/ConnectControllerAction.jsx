import { SmartphoneIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DialogTrigger } from '@/components/ui/dialog';
import { useRemoteService } from '../hooks/useRemoteControl.js';

export function ConnectControllerAction({ variant = 'preflight' }) {
    const service = useRemoteService();
    const menu = variant === 'menu';
    return (
        <DialogTrigger asChild>
            <Button
                type="button"
                data-connect-controller
                variant={menu ? 'player-menu' : 'outline'}
                size={menu ? 'player-menu' : 'touch'}
                onClick={() => service.preparePairing()}
            >
                <SmartphoneIcon data-icon="inline-start" />
                Conectar control móvil
            </Button>
        </DialogTrigger>
    );
}
