import { describe, expect, it } from 'vitest';
import { createClientAddressReader } from './client-address.js';

describe('trusted proxy address boundary', () => {
    it('accepts forwarded addresses only from explicitly trusted loopback peers', () => {
        const remote = {
            handshake: {
                address: '198.51.100.1',
                headers: { 'x-forwarded-for': '203.0.113.1' },
            },
        };
        const local = {
            handshake: { ...remote.handshake, address: '127.0.0.1' },
        };
        expect(createClientAddressReader()(local)).toBe('127.0.0.1');
        expect(createClientAddressReader({ trustProxy: true })(remote)).toBe(
            '198.51.100.1',
        );
        expect(createClientAddressReader({ trustProxy: true })(local)).toBe(
            '203.0.113.1',
        );
    });
});
