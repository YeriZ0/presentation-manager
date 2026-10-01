import { useEffect, useRef } from 'react';
import { createExportService } from '../services/export-service.js';
import { createSlideRenderer } from '../adapters/slide-renderer.js';
import { createPptxEncoder } from '../adapters/pptx-encoder.js';
import { createFileDownloader } from '../adapters/file-downloader.js';
import { createExportStore } from './export-store.js';
import { PptxExportContext } from './export-context.js';

export function PptxExportProvider({ presentation, children }) {
    const valueRef = useRef(null);
    if (!valueRef.current) {
        const store = createExportStore();
        const service = createExportService({
            renderer: createSlideRenderer(),
            encoder: createPptxEncoder(),
            downloader: createFileDownloader(),
            store,
        });
        valueRef.current = { store, service, presentation };
    }

    useEffect(() => {
        valueRef.current.service.resume();
        return () => valueRef.current?.service.dispose();
    }, []);

    return (
        <PptxExportContext.Provider value={valueRef.current}>
            {children}
        </PptxExportContext.Provider>
    );
}
