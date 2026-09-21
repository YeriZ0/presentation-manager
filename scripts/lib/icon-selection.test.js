import { describe, expect, it } from 'vitest';
import { normalizeIconSelection } from './icon-selection.mjs';

const catalog = { roles: { code: 'code' }, weights: ['regular', 'bold'] };
describe('icon selection', () => {
    it('accepts approved safe names outside the curated subset', () => {
        expect(
            normalizeIconSelection(
                [{ name: 'brackets-curly', approved: true }],
                catalog,
            )[0].name,
        ).toBe('brackets-curly');
        expect(() =>
            normalizeIconSelection([{ name: 'brackets-curly' }], catalog),
        ).toThrow('approved');
    });
    it.each(['../code', 'code"}', '__proto__', 'a/b'])(
        'rejects unsafe names or CSS roles: %s',
        (name) => {
            expect(() =>
                normalizeIconSelection([{ name, approved: true }], catalog),
            ).toThrow();
            expect(() =>
                normalizeIconSelection([{ name: 'code', role: name }], catalog),
            ).toThrow();
        },
    );
    it('keeps distinct semantic roles that share one asset', () => {
        const result = normalizeIconSelection(
            [
                { name: 'code', role: 'input' },
                { name: 'code', role: 'output' },
            ],
            catalog,
        );
        expect(result.map((icon) => icon.role)).toEqual(['input', 'output']);
    });
    it('allows explicit weights for the same semantic asset', () => {
        expect(
            normalizeIconSelection(
                [
                    { name: 'code', weight: 'regular' },
                    { name: 'code', weight: 'bold' },
                ],
                catalog,
            ),
        ).toHaveLength(2);
    });
});
