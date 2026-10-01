import { describe, expect, it, vi } from 'vitest';
import { createBrowserScheduler } from './browser-scheduler.js';
import { createRemoteControlStore } from '../features/remote-control/state/remote-control-store.js';
import { createControllerConnectionService } from '../features/remote-control/services/controller-connection-service.js';
import { createPresenterConnectionService } from '../features/remote-control/services/presenter-connection-service.js';

function createStrictTimerHost() {
    let nextHandle = 0;
    const tasks = new Map();
    const host = {
        setTimeout(callback, delay, ...args) {
            if (this !== host) throw new TypeError('Illegal invocation');
            const handle = ++nextHandle;
            tasks.set(handle, { callback, delay, args, repeat: false });
            return handle;
        },
        clearTimeout(handle) {
            if (this !== host) throw new TypeError('Illegal invocation');
            tasks.delete(handle);
        },
        setInterval(callback, delay, ...args) {
            if (this !== host) throw new TypeError('Illegal invocation');
            const handle = ++nextHandle;
            tasks.set(handle, { callback, delay, args, repeat: true });
            return handle;
        },
        clearInterval(handle) {
            if (this !== host) throw new TypeError('Illegal invocation');
            tasks.delete(handle);
        },
    };
    return {
        host,
        tasks,
        flush() {
            for (const [handle, task] of [...tasks]) {
                if (!task.repeat) tasks.delete(handle);
                task.callback(...task.args);
            }
        },
    };
}

describe('browser scheduler receiver boundary', () => {
    it('preserves the Window receiver for scheduling and cancellation', () => {
        const { host, tasks, flush } = createStrictTimerHost();
        const unbound = { setTimeout: host.setTimeout };
        expect(() => unbound.setTimeout(() => {}, 0)).toThrow(
            'Illegal invocation',
        );
        const scheduler = createBrowserScheduler(host);
        const timeoutCallback = vi.fn();
        const intervalCallback = vi.fn();
        const timeout = scheduler.setTimeout(timeoutCallback, 10, 'timeout');
        const interval = scheduler.setInterval(
            intervalCallback,
            250,
            'interval',
        );
        expect(tasks.get(timeout).delay).toBe(10);
        expect(tasks.get(interval).delay).toBe(250);
        flush();
        expect(timeoutCallback).toHaveBeenCalledWith('timeout');
        expect(intervalCallback).toHaveBeenCalledWith('interval');
        scheduler.clearTimeout(timeout);
        scheduler.clearInterval(interval);
        expect(tasks.size).toBe(0);
        const canceled = scheduler.setTimeout(timeoutCallback, 0);
        scheduler.clearTimeout(canceled);
        flush();
        expect(timeoutCallback).toHaveBeenCalledTimes(1);
    });

    it.each(['presenter', 'controller'])(
        'cancels Strict Mode cleanup and disposes the %s exactly once',
        (role) => {
            const { host, tasks, flush } = createStrictTimerHost();
            const unsubscribe = vi.fn();
            const transport = {
                subscribe: vi.fn(() => unsubscribe),
                isConnected: () => false,
                disconnect: vi.fn(),
            };
            const dependencies = {
                transport,
                store: createRemoteControlStore(role),
                scheduler: createBrowserScheduler(host),
            };
            const service =
                role === 'presenter'
                    ? createPresenterConnectionService({
                          ...dependencies,
                          reader: {},
                          actions: {},
                          clock: { now: () => 0 },
                      })
                    : createControllerConnectionService({
                          ...dependencies,
                          credentialStore: { load: () => null, clear: vi.fn() },
                          idFactory: () => 'request',
                      });
            service.start();
            const subscriptions = transport.subscribe.mock.calls.length;
            service.scheduleDispose();
            expect(tasks.size).toBe(1);
            service.start();
            expect(tasks.size).toBe(0);
            expect(transport.subscribe).toHaveBeenCalledTimes(subscriptions);
            expect(transport.disconnect).not.toHaveBeenCalled();
            service.scheduleDispose();
            flush();
            expect(unsubscribe).toHaveBeenCalledTimes(subscriptions);
            expect(transport.disconnect).toHaveBeenCalledTimes(1);
            expect(tasks.size).toBe(0);
        },
    );
});
