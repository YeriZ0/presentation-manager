import { describe, expect, it, vi } from 'vitest';
import { createExportService } from './export-service.js';
import { createExportStore } from '../state/export-store.js';

function makeService(overrides = {}) {
    const renderer = {
        capture: vi.fn(async (_presentation, options) => {
            options.onProgress(1);
            return [{ html: '<div></div>' }];
        }),
        disposeJob: vi.fn(),
    };
    const encoder = {
        encode: vi.fn(async () => new ArrayBuffer(8)),
        disposeJob: vi.fn(),
    };
    const downloader = { download: vi.fn(async () => {}) };
    const store = createExportStore();
    return {
        service: createExportService({
            renderer,
            encoder,
            downloader,
            store,
            ...overrides,
        }),
        renderer,
        encoder,
        downloader,
        store,
    };
}

const presentation = {
    deck: { title: 'Test', slides: [{ id: 'one' }] },
};

describe('createExportService', () => {
    it('runs capture, encode and download in order and releases snapshots', async () => {
        const { service, renderer, encoder, downloader, store } = makeService();
        const result = await service.start(presentation);

        expect(result).toBe(true);
        expect(renderer.capture).toHaveBeenCalledOnce();
        expect(encoder.encode).toHaveBeenCalledOnce();
        expect(downloader.download).toHaveBeenCalledOnce();
        expect(store.getState().status).toBe('success');
    });

    it('rejects a second active job and supports cancellation', async () => {
        let resolveCapture;
        const renderer = {
            capture: vi.fn(
                () =>
                    new Promise((resolve) => {
                        resolveCapture = resolve;
                    }),
            ),
            disposeJob: vi.fn(),
        };
        const store = createExportStore();
        const service = createExportService({
            renderer,
            encoder: { encode: vi.fn() },
            downloader: { download: vi.fn() },
            store,
        });
        const first = service.start(presentation);
        expect(await service.start(presentation)).toBe(false);
        service.cancel();
        resolveCapture([]);
        expect(await first).toBe(false);
        expect(store.getState().status).toBe('cancelled');
    });

    it('reports encoder errors without downloading', async () => {
        const { service, downloader, store } = makeService({
            encoder: {
                encode: vi.fn(async () => {
                    throw new Error('Fallo PPTX');
                }),
            },
        });
        await service.start(presentation);
        expect(downloader.download).not.toHaveBeenCalled();
        expect(store.getState()).toMatchObject({
            status: 'error',
            error: 'Fallo PPTX',
        });
    });

    it('resumes after a StrictMode effect cleanup cycle', async () => {
        const { service, store } = makeService();
        service.dispose();
        expect(await service.start(presentation)).toBe(false);

        service.resume();
        expect(await service.start(presentation)).toBe(true);
        expect(store.getState().status).toBe('success');
    });
});
