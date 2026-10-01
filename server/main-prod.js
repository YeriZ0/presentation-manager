import { fileURLToPath } from 'node:url';
import { createRemoteServer } from './create-server.js';
import { createStaticHandler } from './adapters/static-handler.js';

const server = createRemoteServer({
    trustProxy: process.env.TRUST_PROXY === '1',
});
server.setRequestHandler(
    createStaticHandler(fileURLToPath(new URL('../dist/', import.meta.url))),
);
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 3000);
server.http.listen(port, host, () =>
    console.info(`Armadillo PP: http://${host}:${port}`),
);
async function shutdown() {
    await server.close();
    process.exit(0);
}
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
