import { strToU8, zipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { loadArchive } from './archive-loader.js';

function createArchive(entries, name = 'deck.zip') {
    const bytes = zipSync(
        Object.fromEntries(
            Object.entries(entries).map(([path, value]) => [
                path,
                strToU8(value),
            ]),
        ),
    );
    return {
        name,
        size: bytes.byteLength,
        arrayBuffer: async () => bytes.buffer,
    };
}

const manifest = JSON.stringify({
    format: 'web-deck',
    version: 1,
    title: 'Archive test',
    viewport: { width: 1920, height: 1080 },
    slides: [{ id: 'intro', source: 'slides/intro.html' }],
});

describe('loadArchive', () => {
    it('loads and validates a ZIP package', async () => {
        const result = await loadArchive(
            createArchive({
                'deck.json': manifest,
                'slides/intro.html': '<h1>Introduction</h1>',
            }),
        );
        expect(result.deck.title).toBe('Archive test');
        expect(result.files.has('slides/intro.html')).toBe(true);
    });

    it('rejects a package without a root manifest', async () => {
        await expect(
            loadArchive(createArchive({ 'slides/intro.html': '<h1 />' })),
        ).rejects.toThrow('deck.json debe estar en la raiz del ZIP');
    });

    it('rejects unsupported file types', async () => {
        await expect(
            loadArchive(
                createArchive({
                    'deck.json': manifest,
                    'slides/intro.html': '<h1 />',
                    'payload.exe': 'not allowed',
                }),
            ),
        ).rejects.toThrow('Tipo de archivo no permitido');
    });
});
