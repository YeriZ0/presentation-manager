import { afterEach, describe, expect, it } from 'vitest';
import { io } from 'socket.io-client';
import { createRemoteServer } from '../create-server.js';
import { EVENTS, message } from '../../shared/remote-control/protocol.js';
import { success } from '../../shared/remote-control/errors.js';

const clients = [];
let server;
afterEach(async () => {
    clients.splice(0).forEach((socket) => socket.disconnect());
    await server?.close();
    server = null;
});

async function connect(url) {
    const socket = io(url, { forceNew: true, reconnection: false });
    clients.push(socket);
    await new Promise((resolve, reject) => {
        socket.once('connect', resolve);
        socket.once('connect_error', reject);
    });
    return socket;
}

const request = (socket, event, data = {}) =>
    socket.timeout(2000).emitWithAck(event, message(data));

describe('Socket.IO session gateway', () => {
    it('pairs, relays execution and revokes control without exposing the package', async () => {
        server = createRemoteServer();
        await new Promise((resolve) =>
            server.http.listen(0, '127.0.0.1', resolve),
        );
        const url = `http://127.0.0.1:${server.http.address().port}`;
        const host = await connect(url);
        const mobile = await connect(url);
        const outsider = await connect(url);
        const created = await request(host, EVENTS.create);
        const paired = await request(mobile, EVENTS.pair, {
            code: created.data.code,
        });
        expect(paired.ok).toBe(true);
        expect(
            await request(outsider, EVENTS.command, {
                sessionId: created.data.sessionId,
                requestId: 'outsider',
                command: { type: 'next', expectedSlideId: 'one' },
            }),
        ).toMatchObject({ ok: false, error: 'UNAUTHORIZED' });
        const received = [];
        host.on(EVENTS.execute, (payload, reply) => {
            received.push(payload);
            reply(success());
        });
        const command = {
            sessionId: created.data.sessionId,
            requestId: 'move-one',
            command: { type: 'next', expectedSlideId: 'one' },
        };
        expect(await request(mobile, EVENTS.command, command)).toMatchObject({
            ok: true,
        });
        expect(received[0]).toMatchObject({
            command: command.command,
            controllerGeneration: paired.data.generation,
        });
        expect(received[0]).not.toHaveProperty('files');
        expect(
            await request(mobile, EVENTS.release, {
                sessionId: created.data.sessionId,
            }),
        ).toMatchObject({ ok: true });
        expect(await request(mobile, EVENTS.command, command)).toMatchObject({
            ok: false,
            error: 'UNAUTHORIZED',
        });
        expect(
            await request(host, EVENTS.regenerate, {
                sessionId: created.data.sessionId,
            }),
        ).toMatchObject({ ok: true });
    });

    it('rejects malformed commands and cross-origin transport connections', async () => {
        server = createRemoteServer();
        await new Promise((resolve) =>
            server.http.listen(0, '127.0.0.1', resolve),
        );
        const url = `http://127.0.0.1:${server.http.address().port}`;
        const socket = await connect(url);
        expect(
            await request(socket, EVENTS.pair, { code: '123' }),
        ).toMatchObject({ ok: false, error: 'INVALID_MESSAGE' });
        const foreign = io(url, {
            forceNew: true,
            reconnection: false,
            transports: ['websocket'],
            extraHeaders: { Origin: 'https://foreign.example' },
        });
        clients.push(foreign);
        await expect(
            new Promise((resolve, reject) => {
                foreign.once('connect', resolve);
                foreign.once('connect_error', reject);
            }),
        ).rejects.toBeDefined();
    });
});
