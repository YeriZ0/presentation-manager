import { createJobId } from '../contracts.js';

export function createExportService({ renderer, encoder, downloader, store }) {
    let controller = null;
    let disposed = false;

    async function start(presentation) {
        if (disposed || controller) return false;
        controller = new AbortController();
        const jobId = createJobId();
        const { signal } = controller;
        const slides = presentation.deck.slides;
        store.getState().setCapturing(slides.length);
        let snapshots;

        try {
            snapshots = await renderer.capture(presentation, {
                jobId,
                signal,
                onProgress: (currentSlide) => {
                    if (!signal.aborted)
                        store.getState().setProgress(currentSlide);
                },
            });
            if (signal.aborted)
                throw new DOMException('Cancelado', 'AbortError');

            store.getState().setEncoding();
            const bytes = await encoder.encode(presentation, snapshots, {
                jobId,
                signal,
            });
            if (signal.aborted)
                throw new DOMException('Cancelado', 'AbortError');

            store.getState().setDownloading();
            await downloader.download(bytes, presentation.deck.title, signal);
            store.getState().setSuccess();
            return true;
        } catch (error) {
            if (signal.aborted || error?.name === 'AbortError') {
                store.getState().setCancelled();
                return false;
            }
            store
                .getState()
                .setError(
                    error instanceof Error
                        ? error.message
                        : 'No se pudo exportar la presentación',
                );
            return false;
        } finally {
            snapshots?.forEach((snapshot) => {
                snapshot.html = '';
                snapshot.fontFaces = [];
                snapshot.notes = '';
            });
            renderer.disposeJob?.(jobId);
            encoder.disposeJob?.(jobId);
            controller = null;
        }
    }

    function cancel() {
        controller?.abort();
    }

    function dispose() {
        disposed = true;
        cancel();
    }

    function resume() {
        disposed = false;
    }

    return { start, cancel, dispose, resume };
}
