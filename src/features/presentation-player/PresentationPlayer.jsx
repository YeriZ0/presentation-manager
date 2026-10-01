import { useEffect, useMemo, useRef } from 'react';
import { createPresentationMetadata } from './state/player-store.js';
import { PlayerStoreProvider } from './state/PlayerStoreProvider.jsx';
import { usePlayerStoreApi } from './hooks/usePlayerStore.js';
import { PlayerActionsProvider } from './state/PlayerActionsProvider.jsx';
import { usePlayerActions } from './hooks/usePlayerActions.js';
import { PreflightScreen } from './components/PreflightScreen.jsx';
import { PlayerStage } from './components/PlayerStage.jsx';
import { PptxExportProvider } from '../pptx-export/state/PptxExportProvider.jsx';
import { RemoteControlProvider } from '../remote-control/state/RemoteControlProvider.jsx';
import { PairingDialog } from '../remote-control/components/PairingDialog.jsx';
import { useRemoteService } from '../remote-control/hooks/useRemoteControl.js';
import styles from '../../player/PresentationPlayer.module.css';

export function PresentationPlayer(props) {
    const { presentation } = props;
    const metadata = useMemo(
        () => createPresentationMetadata(presentation.deck, presentation.files),
        [presentation],
    );
    return (
        <PlayerStoreProvider metadata={metadata}>
            <PlayerActionsProvider>
                <PptxExportProvider presentation={presentation}>
                    <PresenterConnection {...props} />
                </PptxExportProvider>
            </PlayerActionsProvider>
        </PlayerStoreProvider>
    );
}

function PresenterConnection(props) {
    const { reader, actions } = usePlayerActions();
    return (
        <RemoteControlProvider
            role="presenter"
            reader={reader}
            actions={actions}
        >
            <PlayerSession {...props} />
        </RemoteControlProvider>
    );
}

function PlayerSession({ presentation, phase, onStart, onClose, leaving }) {
    const store = usePlayerStoreApi();
    const remote = useRemoteService();
    const closing = useRef(false);
    useEffect(() => {
        store.getState().setPhase(phase);
    }, [store, phase]);

    async function close() {
        if (closing.current) return;
        closing.current = true;
        await remote.end();
        onClose();
    }

    return (
        <PairingDialog>
            <div className={styles.screenEnter}>
                {phase === 'preflight' ? (
                    <PreflightScreen onStart={onStart} onClose={close} />
                ) : (
                    <PlayerStage
                        presentation={presentation}
                        onClose={close}
                        leaving={leaving}
                    />
                )}
            </div>
        </PairingDialog>
    );
}
