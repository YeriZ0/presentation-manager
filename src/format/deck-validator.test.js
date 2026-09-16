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
