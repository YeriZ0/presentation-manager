import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';

const types = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.webp': 'image/webp',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.ico': 'image/x-icon',
};

export function createStaticHandler(root) {
    const directory = resolve(root);
    return async (request, response) => {
        try {
            if (!['GET', 'HEAD'].includes(request.method)) {
                response.writeHead(405);
                response.end();
                return;
            }
            const path = decodeURIComponent(
                new URL(request.url, 'http://localhost').pathname,
            );
            let file = resolve(
                directory,
                `.${path.endsWith('/') ? `${path}index.html` : path}`,
            );
            if (!file.startsWith(directory + sep)) {
                response.writeHead(404);
                response.end();
                return;
            }
            let info;
            try {
                info = await stat(file);
            } catch {
                /* Missing routes are resolved below */
            }
            if (
                !info?.isFile() &&
                ['/', '/presenter', '/presenter/live', '/controller'].includes(
                    path.replace(/\/$/, '') || '/',
                )
            ) {
                file = resolve(directory, 'index.html');
                info = await stat(file);
            }
            if (!info?.isFile()) {
                response.writeHead(404);
                response.end();
                return;
            }
            response.writeHead(200, {
                'Content-Type':
                    types[extname(file)] || 'application/octet-stream',
                'Content-Length': info.size,
                'Cache-Control': path.startsWith('/assets/')
                    ? 'public, max-age=31536000, immutable'
                    : 'no-cache',
                'X-Content-Type-Options': 'nosniff',
            });
            if (request.method === 'HEAD') response.end();
            else
                createReadStream(file)
                    .on('error', () => response.destroy())
                    .pipe(response);
        } catch {
            if (!response.headersSent) response.writeHead(404);
            response.end();
        }
    };
}
