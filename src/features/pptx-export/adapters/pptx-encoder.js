import { restoreSnapshotLayout } from '../runtime/snapshot-layout.js';

const RUNTIME_BASE = `${import.meta.env.BASE_URL}generated/pptx/`;

function abortError() {
    return new DOMException('Cancelado', 'AbortError');
}

function waitForGeneration(promise, signal, timeoutMs) {
    return new Promise((resolve, reject) => {
        const timeout = window.setTimeout(
            () =>
                finish(
                    reject,
                    new Error(
                        'La generación de PowerPoint superó el tiempo límite',
                    ),
                ),
            timeoutMs,
        );

        function finish(callback, value) {
            window.clearTimeout(timeout);
            signal.removeEventListener('abort', onAbort);
            callback(value);
        }

        function onAbort() {
            finish(reject, abortError());
        }

        promise.then(
            (value) => finish(resolve, value),
            (error) => finish(reject, error),
        );
        signal.addEventListener('abort', onAbort, { once: true });
        if (signal.aborted) onAbort();
    });
}

function createConversionFrame() {
    const frame = document.createElement('iframe');
    frame.title = 'Generador de PowerPoint';
    frame.tabIndex = -1;
    frame.setAttribute('aria-hidden', 'true');
    frame.setAttribute('sandbox', 'allow-scripts allow-same-origin');
    Object.assign(frame.style, {
        position: 'fixed',
        left: '0',
        top: '0',
        width: '1920px',
        height: '1080px',
        border: '0',
        pointerEvents: 'none',
        opacity: '0',
        zIndex: '100',
    });
    document.body.append(frame);
    return frame;
}

function loadRuntime(frame, signal, resources = {}) {
    return new Promise((resolve, reject) => {
        const doc = frame.contentDocument;
        const csp = doc.createElement('meta');
        csp.httpEquiv = 'Content-Security-Policy';
        const imageHosts = (resources.imageHosts || [])
            .map((host) => `https://${host}`)
            .join(' ');
        const fontHosts = (resources.fontHosts || [])
            .map((host) => `https://${host}`)
            .join(' ');
        const runtimeOrigin = new URL(RUNTIME_BASE, window.location.href)
            .origin;
        csp.content = `default-src 'none'; script-src 'self' ${runtimeOrigin}; style-src 'unsafe-inline'; img-src data: blob: ${imageHosts}; font-src data: blob: ${fontHosts}; connect-src blob: ${imageHosts} ${fontHosts}; object-src 'none'; base-uri 'none'`;
        doc.head.append(csp);

        const script = doc.createElement('script');
        script.src = `${RUNTIME_BASE}dom-to-pptx.bundle.js`;
        const cleanup = () => signal.removeEventListener('abort', onAbort);
        const onAbort = () => {
            cleanup();
            reject(abortError());
        };
        script.onload = () => {
            cleanup();
            resolve();
        };
        script.onerror = () => {
            cleanup();
            reject(new Error('No se pudo cargar el motor PPTX local'));
        };
        signal.addEventListener('abort', onAbort, { once: true });
        if (signal.aborted) onAbort();
        doc.head.append(script);
    });
}

const ALLOWED_ELEMENTS = new Set(
    'a abbr address article aside b blockquote br button caption circle clippath code dd defs del details div dl dt em ellipse figcaption figure footer g h1 h2 h3 h4 h5 h6 header hr i img ins kbd line lineargradient li main mark mask ol p path pattern picture polygon polyline pre q rect s samp section small source span stop strong sub summary sup svg table tbody td text textarea tfoot th thead time tr tspan u ul use var fegaussianblur feoffset input'.split(
        ' ',
    ),
);

function isAllowedUrl(value, resources) {
    const normalized = value.trim();
    if (
        normalized.startsWith('#') ||
        /^(data:image\/|blob:)/i.test(normalized)
    ) {
        return true;
    }
    try {
        const url = new URL(normalized);
        return (
            url.protocol === 'https:' &&
            [
                ...(resources.imageHosts || []),
                ...(resources.fontHosts || []),
            ].includes(url.hostname)
        );
    } catch {
        return false;
    }
}

function sanitizeSnapshotMarkup(frame, html, slideIndex, resources) {
    const template = frame.contentDocument.createElement('template');
    template.innerHTML = html;
    const idMap = new Map();
    const nodes = Array.from(template.content.querySelectorAll('*'));
    if (nodes.length > 25000) {
        throw new Error(
            'La diapositiva contiene demasiados elementos para exportarse',
        );
    }

    for (const [index, node] of nodes.entries()) {
        if (!node.id) continue;
        const safeId = `pptx-${slideIndex}-${index}`;
        idMap.set(node.id, safeId);
        node.id = safeId;
    }

    for (const node of nodes) {
        if (!template.content.contains(node)) continue;
        if (!ALLOWED_ELEMENTS.has(node.localName.toLowerCase())) {
            node.remove();
            continue;
        }
        for (const attribute of Array.from(node.attributes)) {
            const name = attribute.name.toLowerCase();
            if (
                /^on/.test(name) ||
                ['srcdoc', 'srcset', 'formaction'].includes(name)
            ) {
                node.removeAttribute(attribute.name);
                continue;
            }
            if (['src', 'href', 'xlink:href', 'poster'].includes(name)) {
                const value = attribute.value;
                if (value.startsWith('#') && idMap.has(value.slice(1))) {
                    node.setAttribute(
                        attribute.name,
                        `#${idMap.get(value.slice(1))}`,
                    );
                } else if (!isAllowedUrl(value, resources)) {
                    node.removeAttribute(attribute.name);
                }
                continue;
            }
            const rewritten = attribute.value.replace(
                /url\(\s*(['"]?)#([^)'"\s]+)\1\s*\)/g,
                (match, quote, id) => `url(#${idMap.get(id) || id})`,
            );
            if (rewritten !== attribute.value) {
                node.setAttribute(attribute.name, rewritten);
            }
            if (name === 'style') {
                for (const property of Array.from(node.style)) {
                    const value = node.style.getPropertyValue(property);
                    const urls = Array.from(
                        value.matchAll(/url\((['"]?)(.*?)\1\)/gi),
                        (match) => match[2],
                    );
                    if (
                        /expression\s*\(|javascript:|behavior\s*:/i.test(
                            value,
                        ) ||
                        urls.some((url) => !isAllowedUrl(url, resources))
                    ) {
                        node.style.removeProperty(property);
                    }
                }
                continue;
            }
            if (
                rewritten.toLowerCase().includes('url(') &&
                !Array.from(
                    rewritten.matchAll(/url\((['"]?)(.*?)\1\)/gi),
                    (match) => match[2],
                ).every((url) => isAllowedUrl(url, resources))
            ) {
                node.removeAttribute(attribute.name);
            }
        }
    }
    restoreSnapshotLayout(template.content);
    return template.content;
}

function appendSnapshots(frame, snapshots, resources) {
    const doc = frame.contentDocument;
    doc.body.style.margin = '0';
    const stage = doc.createElement('main');
    Object.assign(stage.style, {
        position: 'relative',
        width: '1px',
        height: '1px',
    });
    doc.body.append(stage);

    return snapshots.map((snapshot, index) => {
        const wrapper = doc.createElement('section');
        wrapper.dataset.exportSlide = snapshot.slideId;
        const notes = doc.createElement('template');
        notes.setAttribute('data-pptx-notes', '');
        notes.content.append(doc.createTextNode(snapshot.notes || ''));
        wrapper.append(notes);
        Object.assign(wrapper.style, {
            position: 'absolute',
            left: `${index * snapshot.width}px`,
            top: '0',
            width: `${snapshot.width}px`,
            height: `${snapshot.height}px`,
            overflow: 'hidden',
        });

        wrapper.append(
            sanitizeSnapshotMarkup(frame, snapshot.html, index, resources),
        );
        stage.append(wrapper);
        return wrapper;
    });
}

async function prepareLocalFonts(frame, snapshots) {
    const faces = new Map();
    for (const snapshot of snapshots) {
        for (const face of snapshot.fontFaces || []) {
            for (const source of face.sources) {
                faces.set(
                    `${face.family}|${face.weight}|${face.style}|${source}`,
                    {
                        ...face,
                        source,
                    },
                );
            }
        }
    }

    const urls = [];
    const css = [];
    const fonts = [];
    const externalFonts = [];
    try {
        for (const face of faces.values()) {
            if (face.source.startsWith('https://')) {
                const extension = new URL(face.source).pathname
                    .split('.')
                    .pop()
                    .toLowerCase();
                if (!['otf', 'ttf', 'woff', 'woff2'].includes(extension))
                    continue;
                const name = face.family.replace(/['"\\]/g, '');
                const weight = /^\d{1,3}$/.test(face.weight)
                    ? face.weight
                    : '400';
                const style = ['normal', 'italic', 'oblique'].includes(
                    face.style,
                )
                    ? face.style
                    : 'normal';
                css.push(
                    `@font-face{font-family:"${name}";font-weight:${weight};font-style:${style};src:url("${face.source}") format("${extension}")}`,
                );
                externalFonts.push({ name, url: face.source, weight, style });
                continue;
            }
            const response = await fetch(face.source);
            if (!response.ok)
                throw new Error('No se pudo leer una fuente local');
            const blob = await response.blob();
            const extension =
                {
                    'font/otf': 'otf',
                    'font/ttf': 'ttf',
                    'font/woff': 'woff',
                    'font/woff2': 'woff2',
                }[blob.type] || 'ttf';
            const objectUrl = URL.createObjectURL(blob);
            urls.push(objectUrl);
            const url = `${objectUrl}#font.${extension}`;
            const name = face.family.replace(/['"\\]/g, '');
            const weight = /^\d{1,3}$/.test(face.weight) ? face.weight : '400';
            const style = ['normal', 'italic', 'oblique'].includes(face.style)
                ? face.style
                : 'normal';
            css.push(
                `@font-face{font-family:"${name}";font-weight:${weight};font-style:${style};src:url("${url}") format("${extension}")}`,
            );
            fonts.push({ name, url, weight, style });
        }

        if (css.length) {
            const styleElement = frame.contentDocument.createElement('style');
            styleElement.textContent = css.join('\n');
            frame.contentDocument.head.append(styleElement);
            await Promise.all(
                fonts.map((font) =>
                    frame.contentDocument.fonts.load(`16px "${font.name}"`),
                ),
            );
        }
        return { fonts: [...fonts, ...externalFonts], urls };
    } catch (error) {
        urls.forEach((url) => URL.revokeObjectURL(url));
        throw error;
    }
}

export function createPptxEncoder() {
    const jobs = new Map();

    async function encode(presentation, snapshots, { jobId, signal }) {
        if (signal.aborted) throw abortError();
        const frame = createConversionFrame();
        jobs.set(jobId, frame);
        let fontUrls = [];

        try {
            const resources = presentation.deck.externalResources || {};
            await loadRuntime(frame, signal, resources);
            if (signal.aborted) throw abortError();
            const roots = appendSnapshots(frame, snapshots, resources);
            const fontData = await prepareLocalFonts(frame, snapshots);
            fontUrls = fontData.urls;
            const { width, height } = presentation.deck.viewport;
            const generation = frame.contentWindow.domToPptx.exportToPptx(
                roots,
                {
                    fileName: 'presentation.pptx',
                    width: 10,
                    height: (10 * height) / width,
                    svgAsVector: true,
                    autoEmbedFonts: false,
                    fonts: fontData.fonts,
                    skipDownload: true,
                },
            );
            const blob = await waitForGeneration(generation, signal, 120000);
            if (signal.aborted) throw abortError();
            return await blob.arrayBuffer();
        } finally {
            fontUrls.forEach((url) => URL.revokeObjectURL(url));
            frame.remove();
            jobs.delete(jobId);
        }
    }

    function disposeJob(jobId) {
        const frame = jobs.get(jobId);
        frame?.remove();
        jobs.delete(jobId);
    }

    return { encode, disposeJob };
}
