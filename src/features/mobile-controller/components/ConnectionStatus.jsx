import { WifiIcon, WifiOffIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRemoteControl } from '../../remote-control/hooks/useRemoteControl.js';

const labels = {
    idle: 'Sin conexión',
    connecting: 'Conectando…',
    synchronizing: 'Sincronizando…',
    connected: 'Conectado',
    recovering: 'Reconectando…',
    expired: 'Sesión finalizada',
    disconnecting: 'Desconectando…',
};

export function ConnectionStatus() {
    const connection = useRemoteControl((state) => state.connection);
    const Icon = connection === 'connected' ? WifiIcon : WifiOffIcon;
    return (
        <span role="status" aria-live="polite">
            <Badge
                variant={connection === 'connected' ? 'secondary' : 'outline'}
            >
                <Icon data-icon="inline-start" />
                {labels[connection] || 'Sin conexión'}
            </Badge>
        </span>
    );
}
