import { describe, expect, it, vi } from 'vitest';
import { resumeSession } from './session-resume.js';
import { EVENTS } from '../../../../shared/remote-control/protocol.js';
import { RemoteError } from '../../../../shared/remote-control/errors.js';

describe('identity recovery after an unknown acknowledgement', () => {
    const credentials = {
        sessionId: 'one',
        role: 'controller',
        token: 'test-token',
    };

    it('retries only the identity handshake and returns the final clock reference', async () => {
        const request = vi
            .fn()
            .mockRejectedValueOnce(new RemoteError('RESULT_UNKNOWN'))
            .mockResolvedValueOnce({ generation: 'new' });
        let now = 10;
        const result = await resumeSession({
            transport: { request, isConnected: () => true },
            credentials,
            isCurrent: () => true,
            clock: { now: () => now++ },
        });
        expect(result).toEqual({
            restored: { generation: 'new' },
            requestedAt: 11,
        });
        expect(request).toHaveBeenCalledTimes(2);
        expect(
            request.mock.calls.every(([event]) => event === EVENTS.resume),
        ).toBe(true);
    });

    it('does not retry revoked identities or requests after a disconnect', async () => {
        const request = vi
            .fn()
            .mockRejectedValue(new RemoteError('UNAUTHORIZED'));
        await expect(
            resumeSession({
                transport: { request, isConnected: () => true },
                credentials,
                isCurrent: () => true,
            }),
        ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
        expect(request).toHaveBeenCalledTimes(1);
        request.mockClear();
        await expect(
            resumeSession({
                transport: { request, isConnected: () => true },
                credentials,
                isCurrent: () => false,
            }),
        ).rejects.toMatchObject({ code: 'DISCONNECTED' });
        expect(request).not.toHaveBeenCalled();
    });
});
