import { useState } from 'react';
import { loadArchive } from '../../runtime/archive-loader.js';

export function useDeckImport(onLoaded) {
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    async function importFile(file) {
        if (!file || isLoading) return;
        setIsLoading(true);
        setError('');
        try {
            onLoaded(await loadArchive(file));
        } catch (loadError) {
            setError(loadError.message);
        } finally {
            setIsLoading(false);
        }
    }

    return { error, importFile, isLoading };
}
