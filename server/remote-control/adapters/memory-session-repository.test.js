import { describe, expect, it } from 'vitest';
import { createMemorySessionRepository } from './memory-session-repository.js';

describe('session repository concurrency contract', () => {
    it('prevents a stale reaper from deleting a recovered session', async () => {
        const repository = createMemorySessionRepository();
        await repository.create(
            {
                id: 'one',
                version: 0,
                code: { value: '123456' },
                connected: false,
            },
            10,
        );
        const expiredSnapshot = await repository.get('one');
        await repository.update('one', expiredSnapshot.version, {
            ...expiredSnapshot,
            connected: true,
        });
        await expect(
            repository.remove('one', expiredSnapshot.version),
        ).rejects.toMatchObject({ code: 'CONFLICT' });
        expect(await repository.get('one')).toMatchObject({
            connected: true,
            version: 1,
        });
    });

    it('keeps code indexes and stored records isolated from caller mutations', async () => {
        const repository = createMemorySessionRepository();
        const record = { id: 'one', version: 0, code: { value: '123456' } };
        await repository.create(record, 10);
        record.code.value = '654321';
        expect(await repository.findByCode('123456')).toMatchObject({
            id: 'one',
        });
        const copy = await repository.get('one');
        copy.code = null;
        await repository.update('one', 0, copy);
        expect(await repository.findByCode('123456')).toBeNull();
    });
});
