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

    it('accepts registered local icons with legal notices', () => {
        const files = new Map([
            ...validFiles,
            ['assets/icons/phosphor/check.svg', new Uint8Array()],
            [
                'assets/icons/icons.css',
                new TextEncoder().encode('./phosphor/check.svg'),
            ],
            ['assets/licenses/phosphor-icons.txt', new Uint8Array()],
            ['assets/ATTRIBUTIONS.md', new Uint8Array()],
        ]);

        expect(validateDeck(validDeck, files)).toBe(validDeck);
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
