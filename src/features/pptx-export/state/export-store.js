import { createStore } from 'zustand/vanilla';

export function createExportStore() {
    return createStore((set) => ({
        status: 'idle',
        currentSlide: 0,
        slideCount: 0,
        message: '',
        error: '',
        active: false,
        setCapturing: (slideCount) =>
            set({
                status: 'capturing',
                currentSlide: 0,
                slideCount,
                message: 'Preparando las diapositivas',
                error: '',
                active: true,
            }),
        setProgress: (currentSlide) =>
            set({
                currentSlide,
                message: `Preparando diapositiva ${currentSlide}`,
            }),
        setEncoding: () =>
            set({
                status: 'encoding',
                message: 'Generando el archivo PowerPoint',
            }),
        setDownloading: () =>
            set({ status: 'downloading', message: 'Descargando presentación' }),
        setSuccess: () =>
            set({
                status: 'success',
                message: 'Presentación exportada',
                active: false,
            }),
        setError: (error) =>
            set({ status: 'error', message: '', error, active: false }),
        setCancelled: () =>
            set({
                status: 'cancelled',
                message: 'Exportación cancelada',
                active: false,
            }),
        reset: () =>
            set({
                status: 'idle',
                currentSlide: 0,
                slideCount: 0,
                message: '',
                error: '',
                active: false,
            }),
    }));
}
