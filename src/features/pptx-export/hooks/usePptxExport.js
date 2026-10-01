import { useContext } from 'react';
import { useStore } from 'zustand';
import { PptxExportContext } from '../state/export-context.js';

export function usePptxExport(selector = (state) => state) {
    const context = useContext(PptxExportContext);
    if (!context)
        throw new Error('El servicio de exportacion PPTX no esta disponible');

    const state = useStore(context.store, selector);
    return {
        state,
        start: () => context.service.start(context.presentation),
        cancel: context.service.cancel,
        reset: () => context.store.getState().reset(),
    };
}
