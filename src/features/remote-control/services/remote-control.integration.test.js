import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRemoteServer } from '../../../../server/create-server.js';
import { createPlayerStore } from '../../presentation-player/state/player-store.js';
import { createPlayerReader } from '../../presentation-player/adapters/player-port.js';
import { createPlayerActions } from '../../presentation-player/services/player-actions.js';
import { createPresentationTimer } from '../../presentation-player/services/presentation-timer.js';
import { createRemoteControlStore } from '../state/remote-control-store.js';
import { createSocketIoTransport } from '../adapters/socket-io-client.js';
import { createControllerConnectionService } from './controller-connection-service.js';
import { createPresenterConnectionService } from './presenter-connection-service.js';

let cleanup;
afterEach(async () => {
    await cleanup?.();
    cleanup = null;
});

describe('presenter and controller services over real Socket.IO', () => {
    it('synchronizes notes, shared actions, recovery and intentional release', async () => {
        const server = createRemoteServer();
        await new Promise((resolve) =>
            server.http.listen(0, '127.0.0.1', resolve),
        );
        const url = `http://127.0.0.1:${server.http.address().port}`;
        const hostTransport = createSocketIoTransport({ url });
        const mobileTransport = createSocketIoTransport({ url });
        const player = createPlayerStore({
            title: 'A local deck',
            viewport: { width: 1280, height: 720 },
            slides: [
                { id: 'one', title: 'First', notes: 'Only the notes travel' },
                { id: 'two', title: 'Second', notes: 'Second notes' },
            ],
        });
        const scheduler = { setTimeout, clearTimeout };
        const clock = { now: () => Date.now() };
        const timer = createPresentationTimer({
            store: player,
            clock,
            scheduler: { setInterval, clearInterval },
        });
        const hostStore = createRemoteControlStore('presenter');
        const mobileStore = createRemoteControlStore('controller');
        let saved = null;
        const credentialStore = {
            load: () => saved,
            save: (value) => {
                saved = value;
            },
            clear: () => {
                saved = null;
            },
        };
        const host = createPresenterConnectionService({
            transport: hostTransport,
            reader: createPlayerReader(player),
            actions: createPlayerActions({ store: player, timer, clock }),
            store: hostStore,
            clock,
            scheduler,
        });
        const mobile = createControllerConnectionService({
            transport: mobileTransport,
            credentialStore,
            store: mobileStore,
            scheduler,
            idFactory: () => crypto.randomUUID(),
        });
        cleanup = async () => {
            await mobile.disconnect();
            await host.end();
            mobile.scheduleDispose();
            host.scheduleDispose();
            await new Promise((resolve) => setTimeout(resolve, 0));
            timer.stop();
            await server.close();
        };
        host.start();
        mobile.start();
        timer.start();
        await host.preparePairing();
        await mobile.pair(hostStore.getState().code);
        expect(mobileStore.getState().connection).toBe('connected');
        expect(hostStore.getState().status).not.toHaveProperty('token');
        expect(mobileStore.getState().status).not.toHaveProperty('token');
        expect(mobileStore.getState().metadata.slides[0].notes).toBe(
            'Only the notes travel',
        );
        expect(mobileStore.getState().metadata).not.toHaveProperty('files');
        player.getState().setPhase('stage');
        player.getState().markSlideReady('one');
        await vi.waitFor(() =>
            expect(mobileStore.getState().player.ready).toBe(true),
        );
        await mobile.send({ type: 'next', expectedSlideId: 'one' });
        await vi.waitFor(() =>
            expect(mobileStore.getState().player.activeIndex).toBe(1),
        );
        player.getState().markSlideReady('two');
        await mobile.send({ type: 'timer-enabled', enabled: true });
        expect(player.getState().timerEnabled).toBe(true);
        const previousGeneration = saved.generation;
        mobile.suspend();
        expect(saved).not.toBeNull();
        await mobile.reconnect();
        await vi.waitFor(() =>
            expect(mobileStore.getState().connection).toBe('connected'),
        );
        expect(saved.generation).not.toBe(previousGeneration);
        expect(mobileStore.getState().player.activeIndex).toBe(1);
        await mobile.disconnect();
        expect(saved).toBeNull();
        expect(mobileStore.getState().metadata).toBeNull();
        expect(player.getState().phase).toBe('stage');
        await host.preparePairing(true);
        expect(hostStore.getState().code).toMatch(/^\d{6}$/);
    }, 15000);
});
