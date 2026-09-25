import { buildContentSecurityPolicy } from './security-policy.js';
import {
    getBasePath,
    getExtension,
    hasExtension,
    resolveLocalPath,
} from './path-utils.js';
import { createSlideBridge } from './slide-bridge.js';

const MIME_TYPES = {
    '.avif': 'image/avif',
    '.css': 'text/css',
    '.gif': 'image/gif',
    '.html': 'text/html',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.mjs': 'text/javascript',
    '.otf': 'font/otf',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.ttf': 'font/ttf',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
};

const INLINE_IMAGE_EXTENSIONS = new Set([
    '.avif',
    '.gif',
    '.jpeg',
    '.jpg',
    '.png',
    '.svg',
    '.webp',
]);

const INLINE_FONT_EXTENSIONS = new Set(['.otf', '.ttf', '.woff', '.woff2']);

export function createVirtualFilesystem(deck, files) {
    const urls = new Map();
    const privatePaths = new Set([
        'deck.json',
        ...deck.slides.map((slide) => slide.notes).filter(Boolean),
        ...deck.slides.map((slide) => slide.diagram?.source).filter(Boolean),
        'diagrams/config.json',
    ]);

    for (const [path, bytes] of files) {
        if (
            privatePaths.has(path) ||
            path.startsWith('diagrams/') ||
            hasExtension(path, '.html', '.css')
        ) {
            continue;
        }
        urls.set(path, createFileUrl(path, bytes));
    }

    for (const path of files.keys()) {
        if (hasExtension(path, '.css')) createCssUrl(path, files, urls, []);
    }

    const slideUrls = new Map();
    for (const slide of deck.slides) {
        const source = new TextDecoder().decode(files.get(slide.source));
        const html = rewriteDocument(
            source,
            slide,
            urls,
            files,
            buildContentSecurityPolicy(deck),
        );
        const url = URL.createObjectURL(
            new Blob([html], { type: 'text/html' }),
        );
        slideUrls.set(slide.id, url);
        urls.set(`__slide__/${slide.id}`, url);
    }

    return {
        getSlideUrl: (id) => slideUrls.get(id),
        revoke: () => {
            const uniqueUrls = new Set(urls.values());
            uniqueUrls.forEach((url) => URL.revokeObjectURL(url));
            urls.clear();
            slideUrls.clear();
        },
    };
}

function createCssUrl(path, files, urls, stack) {
    if (urls.has(path)) return urls.get(path);
    if (stack.includes(path)) {
        throw new Error(
            `Circular CSS import: ${[...stack, path].join(' -> ')}`,
        );
    }

    const bytes = files.get(path);
    if (!bytes) return null;
    const basePath = getBasePath(path);
    const nextStack = [...stack, path];
    let css = new TextDecoder().decode(bytes);

    css = css.replace(/@import\s+(['"])([^'"]+)\1/gi, (match, quote, value) => {
        const resolvedPath = resolveLocalPath(value, basePath);
        if (!resolvedPath || !hasExtension(resolvedPath, '.css')) {
            return match;
        }
        const url = createCssUrl(resolvedPath, files, urls, nextStack);
        return url ? `@import ${quote}${url}${quote}` : match;
    });

    css = css.replace(/url\((['"]?)([^)'"]+)\1\)/gi, (match, quote, value) => {
        const url = resolveLocalUrl(value, basePath, urls);
        return url ? `url(${quote}${url}${quote})` : match;
    });

    const url = URL.createObjectURL(new Blob([css], { type: 'text/css' }));
    urls.set(path, url);
    return url;
}

function rewriteDocument(source, slide, urls, files, csp) {
    const basePath = getBasePath(slide.source);
    const bridge = createSlideBridge(slide.id);
    const injected = `<meta http-equiv="Content-Security-Policy" content="${escapeAttribute(csp)}">${bridge}`;
    let html = source.replace(/<head([^>]*)>/i, `<head$1>${injected}`);
    if (html === source) html = `${injected}${source}`;

    html = inlineStylesheets(html, basePath, files);
    html = inlineScripts(html, basePath, files);

    html = html.replace(
        /(src|href|poster)=(['"])([^'"]+)\2/gi,
        (match, attribute, quote, value) => {
            const url = resolveAssetUrl(value, basePath, urls, files);
            return url ? `${attribute}=${quote}${url}${quote}` : match;
        },
    );

    html = html.replace(
        /srcset=(['"])([^'"]+)\1/gi,
        (match, quote, sourceSet) => {
            const rewritten = sourceSet
                .split(',')
                .map((candidate) => {
                    const [value, descriptor] = candidate
                        .trim()
                        .split(/\s+/, 2);
                    const url = resolveAssetUrl(value, basePath, urls, files);
                    return `${url || value}${descriptor ? ` ${descriptor}` : ''}`;
                })
                .join(', ');
            return `srcset=${quote}${rewritten}${quote}`;
        },
    );

    return html.replace(
        /url\((['"]?)([^)'"]+)\1\)/gi,
        (match, quote, value) => {
            const url = resolveAssetUrl(value, basePath, urls, files);
            return url ? `url(${quote}${url}${quote})` : match;
        },
    );
}

// Inlines local stylesheets so slides do not depend on blob
// subresources, which sandboxed frames without same-origin access block
function inlineStylesheets(html, basePath, files) {
    return html.replace(/<link\b([^>]*)>/gi, (tag, attrs) => {
        if (!/\brel\s*=\s*(['"])[^'"]*stylesheet[^'"]*\1/i.test(attrs)) {
            return tag;
        }
        const href = getAttribute(attrs, 'href');
        if (!href) return tag;
        const path = resolveLocalPath(href, basePath);
        if (!path || !hasExtension(path, '.css')) return tag;
        const css = inlineCssText(path, files, []);
        if (css === null) return tag;
        const media = getAttribute(attrs, 'media');
        const mediaAttr = media ? ` media="${escapeAttribute(media)}"` : '';
        return `<style${mediaAttr}>${css.replace(/<\/style/gi, '<\\/style')}</style>`;
    });
}

// Inlines local scripts for the same sandbox reason as stylesheets
function inlineScripts(html, basePath, files) {
    const deferredScripts = [];
    const rewritten = html.replace(
        /<script\b([^>]*)>\s*<\/script\s*>/gi,
        (tag, attrs) => {
            const src = getAttribute(attrs, 'src');
            if (!src) return tag;
            const path = resolveLocalPath(src, basePath);
            if (!path) return tag;
            const bytes = files.get(path);
            if (!bytes) return tag;
            const type = getAttribute(attrs, 'type');
            const typeAttr = type ? ` type="${escapeAttribute(type)}"` : '';
            const js = new TextDecoder()
                .decode(bytes)
                .replace(/<\/script/gi, '<\\/script');
            const script = `<script${typeAttr}>${js}</script>`;

            if (/(?:^|\s)defer(?:\s|=|$)/i.test(attrs)) {
                deferredScripts.push(script);
                return '';
            }

            return script;
        },
    );

    if (deferredScripts.length === 0) return rewritten;

    const scripts = deferredScripts.join('');
    if (/<\/body\s*>/i.test(rewritten)) {
        return rewritten.replace(/<\/body\s*>/i, `${scripts}</body>`);
    }
    if (/<\/html\s*>/i.test(rewritten)) {
        return rewritten.replace(/<\/html\s*>/i, `${scripts}</html>`);
    }
    return `${rewritten}${scripts}`;
}

function inlineCssText(path, files, stack) {
    const bytes = files.get(path);
    if (!bytes || stack.includes(path)) return null;
    const basePath = getBasePath(path);
    const nextStack = [...stack, path];
    let css = new TextDecoder().decode(bytes);

    css = css.replace(
        /@import\s+(?:url\((['"]?)([^)'"]+)\1\)|(['"])([^'"]+)\3)[^;]*;/gi,
        (match, quote, urlValue, plainQuote, plainValue) => {
            const resolved = resolveLocalPath(urlValue ?? plainValue, basePath);
            if (!resolved || !hasExtension(resolved, '.css')) {
                return match;
            }
            const nested = inlineCssText(resolved, files, nextStack);
            return nested === null ? match : nested;
        },
    );

    return css.replace(/url\((['"]?)([^)'"]+)\1\)/gi, (match, quote, value) => {
        const url = resolveAssetUrl(value, basePath, null, files);
        return url ? `url(${quote}${url}${quote})` : match;
    });
}

function getAttribute(attrs, name) {
    const match = attrs.match(
        new RegExp(`${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'),
    );
    if (!match) return null;
    return match[1] ?? match[2] ?? match[3];
}

function toDataUri(path, files) {
    const extension = getExtension(path);
    if (
        !INLINE_IMAGE_EXTENSIONS.has(extension) &&
        !INLINE_FONT_EXTENSIONS.has(extension)
    ) {
        return null;
    }
    const bytes = files.get(path);
    if (!bytes) return null;
    const mime = MIME_TYPES[extension] || 'application/octet-stream';
    return `data:${mime};base64,${bytesToBase64(bytes)}`;
}

function bytesToBase64(bytes) {
    let binary = '';
    const CHUNK = 0x8000;
    for (let i = 0; i < bytes.length; i += CHUNK) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
    }
    return btoa(binary);
}

function resolveLocalUrl(value, basePath, urls) {
    const path = resolveLocalPath(value, basePath);
    return path ? urls.get(path) || null : null;
}

// Prefers data URIs for images and fonts so sandboxed slides load
// them without blob subresources; falls back to blob URLs otherwise
function resolveAssetUrl(value, basePath, urls, files) {
    const path = resolveLocalPath(value, basePath);
    if (!path) return null;
    const dataUri = files ? toDataUri(path, files) : null;
    if (dataUri) return dataUri;
    return urls ? urls.get(path) || null : null;
}

function createFileUrl(path, bytes) {
    const extension = getExtension(path);
    return URL.createObjectURL(
        new Blob([bytes], {
            type: MIME_TYPES[extension] || 'application/octet-stream',
        }),
    );
}

function escapeAttribute(value) {
    return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
