import { createVirtualFilesystem } from '../../../runtime/virtual-filesystem.js';
import { createSnapshotBridge } from '../runtime/snapshot-bridge.js';
import { isExportMessage, validateSlideSnapshot } from '../contracts.js';

const SLIDE_TIMEOUT_MS = 30000;

function waitForMessage(frame, jobId, slideId, signal) {
    return new Promise((resolve, reject) => {
        const timeout = window.setTimeout(
            () =>
                finish(
                    reject,
                    new Error(`Tiempo de espera agotado en ${slideId}`),
                ),
            SLIDE_TIMEOUT_MS,
        );

        function cleanup() {
            window.clearTimeout(timeout);
            window.removeEventListener('message', onMessage);
            signal.removeEventListener('abort', onAbort);
        }

        function finish(callback, value) {
            cleanup();
            callback(value);
        }

        function onAbort() {
            finish(reject, new DOMException('Cancelado', 'AbortError'));
        }

        function onMessage(event) {
            if (event.source !== frame.contentWindow) return;
            if (
                isExportMessage(event.data, {
                    type: 'snapshot',
                    jobId,
                    slideId,
                })
            ) {
                finish(resolve, event.data.snapshot);
                return;
            }
            if (
                isExportMessage(event.data, {
                    type: 'error',
                    jobId,
                    slideId,
                })
            ) {
                finish(reject, new Error(event.data.error));
            }
        }

        window.addEventListener('message', onMessage);
        signal.addEventListener('abort', onAbort, { once: true });
        if (signal.aborted) onAbort();
    });
}

function waitForReady(frame, slideId, signal) {
    return new Promise((resolve, reject) => {
        const timeout = window.setTimeout(
            () =>
                finish(
                    reject,
                    new Error(`La diapositiva ${slideId} no respondio`),
                ),
            SLIDE_TIMEOUT_MS,
        );

        function cleanup() {
            window.clearTimeout(timeout);
            window.removeEventListener('message', onMessage);
            signal.removeEventListener('abort', onAbort);
        }

        function finish(callback, value) {
            cleanup();
            callback(value);
        }

        function onAbort() {
            finish(reject, new DOMException('Cancelado', 'AbortError'));
        }

        function onMessage(event) {
            if (
                event.source === frame.contentWindow &&
                event.data?.type === 'web-deck:ready' &&
                event.data?.version === 1 &&
                event.data?.slideId === slideId
            ) {
                finish(resolve);
            }
        }

        window.addEventListener('message', onMessage);
        signal.addEventListener('abort', onAbort, { once: true });
        if (signal.aborted) onAbort();
    });
}

export function createSlideRenderer() {
    const jobs = new Map();

    async function capture(presentation, { jobId, signal, onProgress }) {
        const runtime = createVirtualFilesystem(
            presentation.deck,
            presentation.files,
            {
                bridgeFactory: createSnapshotBridge,
            },
        );
        const frames = new Set();
        jobs.set(jobId, { runtime, frames });
        const snapshots = [];
        let totalSnapshotSize = 0;
        const { width, height } = presentation.deck.viewport;

        try {
            for (const [index, slide] of presentation.deck.slides.entries()) {
                if (signal.aborted)
                    throw new DOMException('Cancelado', 'AbortError');
                onProgress(index + 1);

                const frame = document.createElement('iframe');
                frame.title = `Preparacion de diapositiva ${index + 1}`;
                frame.tabIndex = -1;
                frame.setAttribute('aria-hidden', 'true');
                frame.setAttribute('sandbox', 'allow-scripts');
                Object.assign(frame.style, {
                    position: 'fixed',
                    left: '0',
                    top: '0',
                    width: `${width}px`,
                    height: `${height}px`,
                    border: '0',
                    pointerEvents: 'none',
                    opacity: '0',
                    zIndex: '100',
                });
                frames.add(frame);
                document.body.append(frame);
                const ready = waitForReady(frame, slide.id, signal);
                frame.src = runtime.getSlideUrl(slide.id);

                try {
                    await ready;
                    const response = waitForMessage(
                        frame,
                        jobId,
                        slide.id,
                        signal,
                    );
                    frame.contentWindow.postMessage(
                        {
                            type: 'web-deck:activate',
                            version: 1,
                            slideId: slide.id,
                        },
                        '*',
                    );
                    frame.contentWindow.postMessage(
                        {
                            namespace: 'web-deck:pptx',
                            version: 1,
                            type: 'capture',
                            jobId,
                            slideId: slide.id,
                        },
                        '*',
                    );
                    const snapshot = validateSlideSnapshot(
                        await response,
                        presentation.deck.externalResources?.fontHosts || [],
                    );
                    totalSnapshotSize += snapshot.html.length;
                    if (totalSnapshotSize > 100 * 1024 * 1024) {
                        throw new Error(
                            'La presentación supera el límite de datos para exportar',
                        );
                    }
                    snapshots.push({
                        ...snapshot,
                        slideId: slide.id,
                        title: slide.title || slide.id,
                        notes: slide.notes
                            ? new TextDecoder().decode(
                                  presentation.files.get(slide.notes),
                              )
                            : '',
                    });
                } catch (error) {
                    throw new Error(
                        `No se pudo preparar la diapositiva ${index + 1} (${slide.title || slide.id}): ${error.message}`,
                        { cause: error },
                    );
                } finally {
                    frame.remove();
                    frames.delete(frame);
                }
            }
            return snapshots;
        } catch (error) {
            snapshots.forEach((snapshot) => {
                snapshot.html = '';
                snapshot.fontFaces = [];
                snapshot.notes = '';
            });
            throw error;
        } finally {
            frames.forEach((frame) => frame.remove());
            frames.clear();
            runtime.revoke();
        }
    }

    function disposeJob(jobId) {
        const job = jobs.get(jobId);
        if (!job) return;
        job.frames.forEach((frame) => frame.remove());
        job.runtime.revoke();
        jobs.delete(jobId);
    }

    return { capture, disposeJob };
}
