import { useEffect, useState } from 'react';
import { createVirtualFilesystem } from '../../../runtime/virtual-filesystem.js';

export function useSlideRuntime(presentation, active) {
    const [runtime, setRuntime] = useState(null);

    useEffect(() => {
        if (!active) return undefined;
        const nextRuntime = createVirtualFilesystem(
            presentation.deck,
            presentation.files,
        );
        setRuntime(nextRuntime);
        return () => {
            nextRuntime.revoke();
        };
    }, [active, presentation]);

    return runtime;
}
