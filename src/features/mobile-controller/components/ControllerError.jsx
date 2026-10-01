import { AlertCircleIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRemoteControl } from '../../remote-control/hooks/useRemoteControl.js';
import { remoteErrorMessage } from '../../remote-control/lib/error-messages.js';

export function ControllerError() {
    const error = useRemoteControl((state) => state.error);
    if (!error) return null;
    return (
        <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertDescription>{remoteErrorMessage(error)}</AlertDescription>
        </Alert>
    );
}
