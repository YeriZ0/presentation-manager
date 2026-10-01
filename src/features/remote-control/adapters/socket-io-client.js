import { io } from 'socket.io-client';
import { message, LIMITS } from '../../../../shared/remote-control/protocol.js';
import { RemoteError } from '../../../../shared/remote-control/errors.js';

export function createSocketIoTransport({ socketFactory = io, url } = {}) {
    let socket = null;
    let connecting = null;
    let cancelConnection = null;
    const listeners = new Map();

    function getSocket() {
        if (!socket) {
            socket = socketFactory(url, {
                autoConnect: false,
                forceNew: true,
                reconnection: true,
                reconnectionDelay: 500,
                reconnectionDelayMax: 4000,
            });
            for (const [event, callbacks] of listeners)
                callbacks.forEach((callback) => socket.on(event, callback));
        }
        return socket;
    }

    return {
        isConnected: () => Boolean(socket?.connected),
        connect() {
            const current = getSocket();
            if (current.connected) return Promise.resolve();
            if (connecting) return connecting;
            connecting = new Promise((resolve, reject) => {
                const cleanup = () => {
                    clearTimeout(timeout);
                    current.off('connect', connected);
                    current.off('connect_error', failed);
                    cancelConnection = null;
                };
                const connected = () => {
                    cleanup();
                    resolve();
                };
                const failed = () => {
                    cleanup();
                    reject(new RemoteError('CONNECTION_FAILED'));
                };
                const timeout = setTimeout(() => {
                    cleanup();
                    reject(new RemoteError('CONNECTION_FAILED'));
                }, 10000);
                cancelConnection = () => {
                    cleanup();
                    reject(new RemoteError('DISCONNECTED'));
                };
                current.once('connect', connected);
                current.once('connect_error', failed);
                current.connect();
            }).finally(() => {
                connecting = null;
            });
            return connecting;
        },
        request(event, payload, timeout = LIMITS.commandTimeoutMs) {
            if (!socket?.connected)
                return Promise.reject(new RemoteError('DISCONNECTED'));
            return new Promise((resolve, reject) => {
                socket
                    .timeout(timeout)
                    .emit(event, message(payload), (error, response) => {
                        if (error) reject(new RemoteError('RESULT_UNKNOWN'));
                        else if (!response?.ok)
                            reject(
                                new RemoteError(
                                    response?.error || 'INVALID_MESSAGE',
                                ),
                            );
                        else resolve(response.data);
                    });
            });
        },
        subscribe(event, callback) {
            if (!listeners.has(event)) listeners.set(event, new Set());
            listeners.get(event).add(callback);
            socket?.on(event, callback);
            return () => {
                listeners.get(event)?.delete(callback);
                socket?.off(event, callback);
            };
        },
        disconnect() {
            cancelConnection?.();
            socket?.disconnect();
        },
    };
}
