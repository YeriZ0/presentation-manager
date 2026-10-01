import { isIP } from 'node:net';

const LOOPBACK = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);

export function createClientAddressReader({ trustProxy = false } = {}) {
    return (socket) => {
        const peer = socket.handshake.address;
        if (!trustProxy || !LOOPBACK.has(peer)) return peer;
        const header = socket.handshake.headers['x-forwarded-for'];
        const forwarded =
            typeof header === 'string' ? header.split(',')[0].trim() : '';
        return isIP(forwarded) ? forwarded : peer;
    };
}
