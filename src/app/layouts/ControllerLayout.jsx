import { RemoteControlProvider } from '../../features/remote-control/state/RemoteControlProvider.jsx';
import { ControllerScreen } from '../../features/mobile-controller/ControllerScreen.jsx';

export default function ControllerLayout() {
    return (
        <RemoteControlProvider role="controller">
            <ControllerScreen />
        </RemoteControlProvider>
    );
}
