import { createServer } from 'vite';
import { parseArgs } from 'node:util';
import { createRemoteServer } from './create-server.js';

const { values } = parseArgs({
    options: { host: { type: 'string' }, port: { type: 'string' } },
});
const host = values.host || process.env.HOST || '127.0.0.1';
const port = Number(values.port || process.env.PORT || 5173);
const server = createRemoteServer();
const vite = await createServer({
    server: { middlewareMode: true, hmr: { server: server.http } },
    appType: 'spa',
});
server.setRequestHandler(vite.middlewares);
server.http.listen(port, host, () => {
    console.info(`Armadillo PP: http://${host}:${port}`);
});
async function shutdown() {
    await vite.close();
    await server.close();
    process.exit(0);
}
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
