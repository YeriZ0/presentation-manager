import { useEffect, useRef, useState } from 'react';
import { useDeckImport } from '../features/deck-import/useDeckImport.js';
import { ImportScreen } from '../player/ImportScreen.jsx';
import { PresentationPlayer } from '../features/presentation-player/PresentationPlayer.jsx';
import { runViewTransition } from '../player/view-transition.js';

const CLOSE_FADE_MS = 340;

export function App() {
    const inputRef = useRef(null);
    const closeTimerRef = useRef(null);
    const [presentation, setPresentation] = useState(null);
    const [closing, setClosing] = useState(false);

    useEffect(() => () => window.clearTimeout(closeTimerRef.current), []);

    function openPicker() {
        inputRef.current?.click();
    }

    function openPresentation(archive) {
        setPresentation(archive);
    }

    const { error, importFile, isLoading } = useDeckImport(openPresentation);

    async function handleFile(event) {
        const file = event.target.files?.[0];
        if (!file) return;
        await importFile(file);
        event.target.value = '';
    }

    async function handleDroppedFile(file) {
        await importFile(file);
    }

    function handleClose() {
        if (closing) return;
        const finish = () => {
            setPresentation(null);
            setClosing(false);
        };
        const transitioned = runViewTransition(['stage-exit'], finish);
        if (!transitioned) {
            setClosing(true);
            closeTimerRef.current = window.setTimeout(finish, CLOSE_FADE_MS);
        }
    }

    if (presentation) {
        return (
            <>
                {closing && (
                    <ImportScreen
                        onOpenPicker={openPicker}
                        onSelectFile={handleDroppedFile}
                        error={error}
                        isLoading={isLoading}
                    />
                )}
                <PresentationPlayer
                    presentation={presentation}
                    onClose={handleClose}
                    leaving={closing}
                />
            </>
        );
    }

    return (
        <>
            <ImportScreen
                onOpenPicker={openPicker}
                onSelectFile={handleDroppedFile}
                error={error}
                isLoading={isLoading}
            />
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
