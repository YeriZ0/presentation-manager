import { useEffect, useRef, useState } from 'react';
import { Navigate, useMatch, useNavigate } from 'react-router-dom';
import { useDeckImport } from '../../features/deck-import/useDeckImport.js';
import { ImportScreen } from '../../player/ImportScreen.jsx';
import { PresentationPlayer } from '../../features/presentation-player/PresentationPlayer.jsx';
import { runViewTransition } from '../../player/view-transition.js';

export default function PresenterLayout() {
    const inputRef = useRef(null);
    const closeTimerRef = useRef(null);
    const [presentation, setPresentation] = useState(null);
    const [closing, setClosing] = useState(false);
    const live = Boolean(useMatch('/presenter/live'));
    const navigate = useNavigate();
    const { error, importFile, isLoading } = useDeckImport(setPresentation);

    useEffect(() => () => window.clearTimeout(closeTimerRef.current), []);

    function openPicker() {
        inputRef.current?.click();
    }
    async function handleFile(event) {
        const file = event.target.files?.[0];
        if (!file) return;
        await importFile(file);
        event.target.value = '';
    }
    function handleClose() {
        if (closing) return;
        const finish = () => {
            setPresentation(null);
            setClosing(false);
            navigate('/presenter', { replace: true });
        };
        if (!runViewTransition(['stage-exit'], finish)) {
            setClosing(true);
            closeTimerRef.current = window.setTimeout(finish, 340);
        }
    }

    if (live && !presentation) return <Navigate to="/presenter" replace />;

    return (
        <>
            {presentation ? (
                <PresentationPlayer
                    presentation={presentation}
                    phase={live ? 'stage' : 'preflight'}
                    onStart={() => navigate('/presenter/live')}
                    onClose={handleClose}
                    leaving={closing}
                />
            ) : (
                <ImportScreen
                    onOpenPicker={openPicker}
                    onSelectFile={importFile}
                    error={error}
                    isLoading={isLoading}
                />
            )}
            <input
                ref={inputRef}
                className="visually-hidden"
                type="file"
                accept=".zip,application/zip"
                onChange={handleFile}
            />
        </>
    );
}
