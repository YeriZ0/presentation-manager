import { describe, expect, it } from 'vitest';
import { getFontFormat } from './font-format.js';

describe('getFontFormat', () => {
    it.each([
        ['ttf', 'truetype'],
        ['otf', 'opentype'],
        ['woff', 'woff'],
        ['woff2', 'woff2'],
        ['TTF', 'truetype'],
    ])('uses the CSS font format for %s', (extension, format) => {
        expect(getFontFormat(extension)).toBe(format);
    });

    it('does not invent formats for unsupported files', () => {
        expect(getFontFormat('svg')).toBeUndefined();
    });
});
