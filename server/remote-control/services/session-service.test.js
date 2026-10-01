import { describe, expect, it } from 'vitest';
import { createSessionService } from './session-service.js';
import { createMemorySessionRepository } from '../adapters/memory-session-repository.js';
import { createTokenFactory } from '../adapters/crypto-token-factory.js';
import { DEFAULT_POLICY } from '../domain/session-policy.js';

function fixture() {
    let now = 1000;
    const service = createSessionService({
        repository: createMemorySessionRepository(),
        tokens: createTokenFactory(),
        clock: { now: () => now },
        policy: { ...DEFAULT_POLICY, recoveryMs: 100, codeTtlMs: 500 },
    });
    return {
        service,
        advance: (duration) => {
            now += duration;
        },
    };
}

describe('session service authorization and leases', () => {
    it('atomically grants a single controller under concurrent pairing', async () => {
        const { service } = fixture();
        const host = await service.create('host');
        const results = await Promise.allSettled([
            service.pair(host.data.code, 'mobile-one'),
            service.pair(host.data.code, 'mobile-two'),
        ]);
        expect(
            results.filter((result) => result.status === 'fulfilled'),
        ).toHaveLength(1);
        expect(
            results.filter((result) => result.status === 'rejected'),
        ).toHaveLength(1);
        await expect(service.regenerate(host.auth)).rejects.toMatchObject({
            code: 'CONTROLLER_BUSY',
        });
    });

    it('reserves the slot and fences the replaced socket during recovery', async () => {
        const { service, advance } = fixture();
        const host = await service.create('host');
        const mobile = await service.pair(host.data.code, 'mobile');
        await service.disconnect(mobile.auth);
        advance(50);
        const restored = await service.resume(mobile.data, 'new-mobile');
        expect(restored.auth.generation).not.toBe(mobile.auth.generation);
        expect(await service.disconnect(mobile.auth)).toBeNull();
        await expect(service.authorize(restored.auth)).resolves.toMatchObject({
            controller: { connected: true },
        });
        await expect(service.authorize(mobile.auth)).rejects.toMatchObject({
            code: 'UNAUTHORIZED',
        });
    });

    it('rejects an expired credential before the sweeper runs', async () => {
        const { service, advance } = fixture();
        const host = await service.create('host');
        const mobile = await service.pair(host.data.code, 'mobile');
        await service.disconnect(mobile.auth);
        advance(101);
        await expect(
            service.resume(mobile.data, 'new-mobile'),
        ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
        await expect(service.regenerate(host.auth)).resolves.toHaveProperty(
            'code',
        );
    });

    it('revokes explicit release while preserving the presentation session', async () => {
        const { service } = fixture();
        const host = await service.create('host');
        const mobile = await service.pair(host.data.code, 'mobile');
        await service.release(mobile.auth);
        await expect(
            service.resume(mobile.data, 'new-mobile'),
        ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
        await expect(service.authorize(host.auth)).resolves.toMatchObject({
            controller: null,
        });
        await expect(service.close(mobile.auth)).rejects.toMatchObject({
            code: 'UNAUTHORIZED',
        });
        await service.close(host.auth);
        await expect(service.authorize(host.auth)).rejects.toMatchObject({
            code: 'SESSION_EXPIRED',
        });
    });

    it('expires codes and host leases without accepting old tokens', async () => {
        const { service, advance } = fixture();
        const host = await service.create('host');
        advance(501);
        await expect(
            service.pair(host.data.code, 'mobile'),
        ).rejects.toMatchObject({ code: 'INVALID_CODE' });
        await service.disconnect(host.auth);
        advance(101);
        await expect(
            service.resume(host.data, 'new-host'),
        ).rejects.toMatchObject({ code: 'SESSION_EXPIRED' });
        expect(await service.sweep()).toEqual([
            { sessionId: host.data.sessionId, ended: true },
        ]);
    });
});
