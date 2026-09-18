import { describe, expect, it } from 'vitest';
import { assertSafePath, validateDeck } from './deck-validator.js';

const validDeck = {
    format: 'web-deck',
    version: 1,
    title: 'Test deck',
    viewport: { width: 1920, height: 1080 },
    slides: [
        {
            id: 'intro',
            source: 'slides/001/index.html',
            notes: 'notes/001.md',
        },
    ],
};

const validFiles = new Map([
    ['slides/001/index.html', new Uint8Array()],
    ['notes/001.md', new Uint8Array()],
]);

describe('validateDeck', () => {
    it('accepts a complete version one deck', () => {
        expect(validateDeck(validDeck, validFiles)).toBe(validDeck);
    });

    it('rejects duplicate slide identifiers', () => {
        const deck = {
            ...validDeck,
            slides: [validDeck.slides[0], validDeck.slides[0]],
        };
        expect(() => validateDeck(deck, validFiles)).toThrow(
            'El ID de diapositiva esta duplicado',
        );
    });

    it('rejects missing files', () => {
        expect(() => validateDeck(validDeck, new Map())).toThrow(
            'Falta el archivo de diapositiva',
        );
    });

    it('requires attribution and license files for chart runtimes', () => {
        const files = new Map([
            ...validFiles,
            ['assets/vendor/echarts/echarts.min.js', new Uint8Array()],
        ]);

        expect(() => validateDeck(validDeck, files)).toThrow(
            'assets/ATTRIBUTIONS.md',
        );
    });

    it('accepts a chart runtime with local legal notices', () => {
        const files = new Map([
            ...validFiles,
            ['assets/vendor/echarts/echarts.min.js', new Uint8Array()],
            ['assets/vendor/echarts/LICENSE.txt', new Uint8Array()],
            ['assets/ATTRIBUTIONS.md', new Uint8Array()],
        ]);

        expect(validateDeck(validDeck, files)).toBe(validDeck);
    });

    it('requires legal files and stylesheet registration for icons', () => {
        const files = new Map([
            ...validFiles,
            ['assets/icons/phosphor/check.svg', new Uint8Array()],
        ]);

        expect(() => validateDeck(validDeck, files)).toThrow(
            'assets/icons/icons.css',
        );
    });

    it('rejects icon markup without a local SVG asset', () => {
        const files = new Map([
            ...validFiles,
            [
                'slides/001/index.html',
                new TextEncoder().encode('<span class="deck-icon"></span>'),
            ],
        ]);

        expect(() => validateDeck(validDeck, files)).toThrow(
            'activos SVG locales',
        );
    });

    it('accepts registered local icons with legal notices', () => {
        const files = new Map([
            ...validFiles,
            ['assets/icons/phosphor/check.svg', new Uint8Array()],
            [
                'assets/icons/icons.css',
                new TextEncoder().encode(
                    '.deck-icon--check { mask-image: url("./phosphor/check.svg"); }',
                ),
            ],
            [
                'assets/licenses/phosphor-icons.txt',
                new TextEncoder().encode('MIT License '.repeat(10)),
            ],
            [
                'assets/ATTRIBUTIONS.md',
                new TextEncoder().encode(
                    'Phosphor Icons 2.1.0 | https://phosphoricons.com | MIT | assets/icons/phosphor/',
                ),
            ],
        ]);

        expect(validateDeck(validDeck, files)).toBe(validDeck);
    });

    it('requires a license and manifest for an alternative icon library', () => {
        const files = new Map([
            ...validFiles,
            ['assets/icons/lucide/check.svg', new Uint8Array()],
            [
                'assets/icons/icons.css',
                new TextEncoder().encode('./lucide/check.svg'),
            ],
            ['assets/ATTRIBUTIONS.md', new TextEncoder().encode('Lucide')],
        ]);

        expect(() => validateDeck(validDeck, files)).toThrow(
            'licencia de la biblioteca de iconos: lucide',
        );
    });

    it('accepts a registered alternative icon library', () => {
        const iconPath = 'assets/icons/lucide/check.svg';
        const manifest = JSON.stringify({
            icons: [
                {
                    path: iconPath,
                    source: 'library',
                    library: 'lucide',
                    version: '0.468.0',
                    license: 'ISC',
                    sourceUrl: 'https://lucide.dev',
                },
            ],
        });
        const files = new Map([
            ...validFiles,
            [iconPath, new Uint8Array()],
            [
                'assets/icons/icons.css',
                new TextEncoder().encode(
                    '.deck-icon--check { mask-image: url("./lucide/check.svg"); }',
                ),
            ],
            ['assets/icons/manifest.json', new TextEncoder().encode(manifest)],
            [
                'assets/licenses/lucide.txt',
                new TextEncoder().encode('ISC License '.repeat(10)),
            ],
            [
                'assets/ATTRIBUTIONS.md',
                new TextEncoder().encode(
                    'Lucide 0.468.0 | ISC | https://lucide.dev | assets/icons/lucide/check.svg',
                ),
            ],
        ]);

        expect(validateDeck(validDeck, files)).toBe(validDeck);
    });

    it('accepts a registered icon supplied by the user', () => {
        const iconPath = 'assets/icons/user/custom.svg';
        const manifest = JSON.stringify({
            icons: [
                {
                    path: iconPath,
                    source: 'user',
                    providedByUser: true,
                    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
                },
            ],
        });
        const files = new Map([
            ...validFiles,
            [iconPath, new Uint8Array()],
            [
                'assets/icons/icons.css',
                new TextEncoder().encode(
                    '.deck-icon--custom { mask-image: url("./user/custom.svg"); }',
                ),
            ],
            ['assets/icons/manifest.json', new TextEncoder().encode(manifest)],
            [
                'assets/ATTRIBUTIONS.md',
                new TextEncoder().encode(
                    'Icono aportado por el usuario: assets/icons/user/custom.svg',
                ),
            ],
        ]);

        expect(validateDeck(validDeck, files)).toBe(validDeck);
    });

    it('rejects an incorrect hash for an icon supplied by the user', () => {
        const iconPath = 'assets/icons/user/custom.svg';
        const manifest = JSON.stringify({
            icons: [
                {
                    path: iconPath,
                    source: 'user',
                    providedByUser: true,
                    sha256: '0'.repeat(64),
                },
            ],
        });
        const files = new Map([
            ...validFiles,
            [iconPath, new Uint8Array()],
            [
                'assets/icons/icons.css',
                new TextEncoder().encode(
                    '.deck-icon--custom { mask-image: url("./user/custom.svg"); }',
                ),
            ],
            ['assets/icons/manifest.json', new TextEncoder().encode(manifest)],
            [
                'assets/ATTRIBUTIONS.md',
                new TextEncoder().encode(
                    'Icono aportado por el usuario: assets/icons/user/custom.svg',
                ),
            ],
        ]);

        expect(() => validateDeck(validDeck, files)).toThrow(
            'no tiene procedencia válida',
        );
    });

    it('validates nested SVG paths under the user icon directory', () => {
        const files = new Map([
            ...validFiles,
            ['assets/icons/user/nested/custom.SVG', new Uint8Array()],
        ]);

        expect(() => validateDeck(validDeck, files)).toThrow(
            'assets/icons/icons.css',
        );
    });
});

describe('assertSafePath', () => {
    it.each(['../secret.txt', '/absolute.html', 'C:/slide.html', 'a\\b.html'])(
        'rejects unsafe path %s',
        (path) => {
            expect(() => assertSafePath(path)).toThrow('Ruta no segura');
        },
    );

    it('accepts a normalized relative path', () => {
        expect(() => assertSafePath('slides/001/index.html')).not.toThrow();
    });
});
