import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFileDownloader } from './file-downloader.js';

describe('createFileDownloader', () => {
    afterEach(() => vi.restoreAllMocks());

    it('downloads a PPTX using an ASCII filename and revokes its URL', async () => {
        const anchor = {
            click: vi.fn(),
            remove: vi.fn(),
        };
        const document = {
            createElement: vi.fn(() => anchor),
            body: { append: vi.fn() },
        };
        const URL = {
            createObjectURL: vi.fn(() => 'blob:test'),
            revokeObjectURL: vi.fn(),
        };
        await createFileDownloader({ document, URL }).download(
            new ArrayBuffer(2),
            'Prueba Ñ',
            new AbortController().signal,
        );

        expect(anchor.download).toBe('prueba-n.pptx');
        expect(anchor.click).toHaveBeenCalledOnce();
        expect(URL.createObjectURL).toHaveBeenCalledOnce();
        expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test');
        expect(anchor.remove).toHaveBeenCalledOnce();
    });
});
