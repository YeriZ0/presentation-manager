import { createPresentationMetadata } from './state/player-store.js';
import {
    PlayerStoreProvider,
    usePlayerStore,
} from './state/PlayerStoreProvider.jsx';
import { PreflightScreen } from './components/PreflightScreen.jsx';
import { PlayerStage } from './components/PlayerStage.jsx';
import styles from '../../player/PresentationPlayer.module.css';
import { PptxExportProvider } from '../pptx-export/state/PptxExportProvider.jsx';

export function PresentationPlayer({ presentation, onClose, leaving }) {
    const metadata = createPresentationMetadata(
        presentation.deck,
        presentation.files,
    );

    return (
        <PlayerStoreProvider metadata={metadata}>
            <PptxExportProvider presentation={presentation}>
                <PlayerSession
                    presentation={presentation}
                    onClose={onClose}
                    leaving={leaving}
                />
            </PptxExportProvider>
        </PlayerStoreProvider>
    );
}

function PlayerSession({ presentation, onClose, leaving }) {
    const phase = usePlayerStore((state) => state.phase);

    return (
        <div className={styles.screenEnter}>
            {phase === 'preflight' ? (
                <PreflightScreen onClose={onClose} />
            ) : (
                <PlayerStage
                    presentation={presentation}
                    onClose={onClose}
                    leaving={leaving}
                />
            )}
        </div>
    );
}
