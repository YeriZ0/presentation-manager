import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('distributed skill schema', () => {
    it('matches the application schema', async () => {
        const applicationSchema = JSON.parse(
            await readFile(
                new URL('./deck.schema.json', import.meta.url),
                'utf8',
            ),
        );
        const skillSchema = JSON.parse(
            await readFile(
                new URL(
                    '../../.agents/skills/create-web-deck/references/deck.schema.json',
                    import.meta.url,
                ),
                'utf8',
            ),
        );

        expect(skillSchema).toEqual(applicationSchema);
    });
});
