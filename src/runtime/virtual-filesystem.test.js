import { strToU8 } from 'fflate';
import { describe, expect, it, vi } from 'vitest';
import { createVirtualFilesystem } from './virtual-filesystem.js';

const deck = {
    format: 'web-deck',
    version: 1,
    title: 'Runtime test',
    viewport: { width: 1920, height: 1080 },
    slides: [
        {
            id: 'intro',
            source: 'slides/intro/index.html',
            notes: 'notes/intro.md',
        },
    ],
};

describe('createVirtualFilesystem', () => {
    it('injects security, inlines local assets and revokes URLs', async () => {
        const files = new Map([
            [
                'slides/intro/index.html',
                strToU8(
                    '<html><head><link rel="stylesheet" href="style.css"><script src="app.js" defer></script></head><body><img src="../../assets/image.png"></body></html>',
                ),
            ],
            [
                'slides/intro/style.css',
                strToU8('body{background:url(../../assets/image.png)}'),
            ],
            ['slides/intro/app.js', strToU8('console.log(1);')],
            ['assets/image.png', new Uint8Array([1, 2, 3])],
            ['notes/intro.md', strToU8('Private notes')],
            ['deck.json', strToU8('{}')],
        ]);
        const revokeSpy = vi.spyOn(URL, 'revokeObjectURL');
        const runtime = createVirtualFilesystem(deck, files);
        const response = await fetch(runtime.getSlideUrl('intro'));
        const html = await response.text();

        expect(html).toContain('Content-Security-Policy');
        expect(html).toContain("connect-src 'none'");
        expect(html).toContain('web-deck:ready');
        expect(html).toContain('a[href],button,input,select,textarea');
        expect(html).toContain('<style>body{background:url(');
        expect(html).toContain('data:image/png;base64,AQID');
        expect(html).toContain('<script>console.log(1);</script>');
        expect(html).toContain('src="data:image/png;base64,AQID"');
        expect(html).not.toContain('="blob:');
        expect(html).not.toContain('Private notes');
        expect(html.indexOf('src="data:image/png;base64,AQID"')).toBeLessThan(
            html.indexOf('<script>console.log(1);</script>'),
        );

        runtime.revoke();
        expect(revokeSpy).toHaveBeenCalled();
        revokeSpy.mockRestore();
    });

    it('keeps external references and resolves nested imports safely', async () => {
        const files = new Map([
            [
                'slides/intro/index.html',
                strToU8(
                    '<html><head><link rel="stylesheet" href="style.css"><script src="https://cdn.example.com/app.js"></script></head><body><img src="https://images.example.com/a.png"></body></html>',
                ),
            ],
            [
                'slides/intro/style.css',
                strToU8('@import "more.css";body{color:#111}'),
            ],
            ['slides/intro/more.css', strToU8('p{margin:0}')],
            ['deck.json', strToU8('{}')],
        ]);
        const runtime = createVirtualFilesystem(deck, files);
        const response = await fetch(runtime.getSlideUrl('intro'));
        const html = await response.text();

        expect(html).toContain('p{margin:0}');
        expect(html).toContain('body{color:#111}');
        expect(html).toContain('https://cdn.example.com/app.js');
        expect(html).toContain('https://images.example.com/a.png');
        expect(html).not.toContain('="blob:');
        runtime.revoke();
    });

    it('keeps packaged Mermaid sources private and inert', async () => {
        const diagramDeck = {
            ...deck,
            slides: [
                {
                    ...deck.slides[0],
                    diagram: {
                        engine: 'mermaid',
                        engineVersion: '11.17.2',
                        type: 'workflow',
                        source: 'diagrams/intro.mmd',
                        sourceHash: '0'.repeat(64),
                    },
                },
            ],
        };
        const files = new Map([
            [
                'slides/intro/index.html',
                strToU8(
                    '<html><head></head><body><svg data-diagram-static></svg></body></html>',
                ),
            ],
            ['diagrams/intro.mmd', strToU8('PRIVATE_MERMAID_SOURCE')],
            ['diagrams/config.json', strToU8('{}')],
            ['deck.json', strToU8('{}')],
        ]);
        const runtime = createVirtualFilesystem(diagramDeck, files);
        const response = await fetch(runtime.getSlideUrl('intro'));
        const html = await response.text();

        expect(html).toContain('data-diagram-static');
        expect(html).not.toContain('PRIVATE_MERMAID_SOURCE');
        runtime.revoke();
    });
});
