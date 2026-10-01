import { createServer } from 'node:http';
import { performance } from 'node:perf_hooks';
import { Server } from 'socket.io';
import { LIMITS } from '../shared/remote-control/protocol.js';
import { createMemorySessionRepository } from './remote-control/adapters/memory-session-repository.js';
import { createTokenFactory } from './remote-control/adapters/crypto-token-factory.js';
import { createSessionService } from './remote-control/services/session-service.js';
import { createSocketIoGateway } from './remote-control/adapters/socket-io-gateway.js';
import { DEFAULT_POLICY } from './remote-control/domain/session-policy.js';
import { createClientAddressReader } from './remote-control/adapters/client-address.js';

export function createRemoteServer({
    clock = { now: () => performance.timeOrigin + performance.now() },
    scheduler = { setInterval, clearInterval },
    repository = createMemorySessionRepository(),
    tokens = createTokenFactory(),
    policy = DEFAULT_POLICY,
    trustProxy = false,
} = {}) {
    let handler = (_request, response) => {
        response.writeHead(404);
        response.end();
    };
    const http = createServer((request, response) =>
        handler(request, response),
    );
    const io = new Server(http, {
        maxHttpBufferSize: LIMITS.messageBytes + 1024,
        serveClient: false,
        allowRequest(request, done) {
            let permitted = true;
            if (request.headers.origin) {
                try {
                    permitted =
                        new URL(request.headers.origin).host ===
                        request.headers.host;
                } catch {
                    permitted = false;
                }
            }
            done(
                null,
                permitted && io.engine.clientsCount < policy.maxSessions * 3,
            );
        },
    });
    const sessions = createSessionService({
        repository,
        clock,
        tokens,
        policy,
    });
    const gateway = createSocketIoGateway({
        io,
        sessions,
        clock,
        tokens,
        scheduler,
        policy,
        clientAddress: createClientAddressReader({ trustProxy }),
    });

    return {
        http,
        setRequestHandler(next) {
            handler = next;
        },
        async close() {
            gateway.dispose();
            await new Promise((resolve) => io.close(resolve));
        },
    };
}
