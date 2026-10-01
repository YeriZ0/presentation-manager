export const EXPORT_STATES = Object.freeze([
    'idle',
    'capturing',
    'encoding',
    'downloading',
    'success',
    'error',
    'cancelled',
]);

export function createJobId() {
    return (
        globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`
    );
}

export function isExportMessage(data, { type, jobId, slideId }) {
    return (
        data?.namespace === 'web-deck:pptx' &&
        data.version === 1 &&
        data.type === type &&
        data.jobId === jobId &&
        (slideId === undefined || data.slideId === slideId)
    );
}

export function createSafeFilename(title) {
    const slug = String(title || '')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80);
    return `${slug || 'presentation'}.pptx`;
}

export function validateSlideSnapshot(snapshot, fontHosts = []) {
    if (
        !snapshot ||
        typeof snapshot.html !== 'string' ||
        snapshot.html.length > 20 * 1024 * 1024 ||
        !Number.isFinite(snapshot.width) ||
        !Number.isFinite(snapshot.height) ||
        snapshot.width < 1 ||
        snapshot.height < 1 ||
        snapshot.width > 32768 ||
        snapshot.height > 32768
    ) {
        throw new Error(
            'La diapositiva devolvió una captura inválida o demasiado grande',
        );
    }

    if (!Array.isArray(snapshot.fontFaces) || snapshot.fontFaces.length > 256) {
        throw new Error(
            'La diapositiva devolvió una lista de fuentes no válida',
        );
    }

    for (const face of snapshot.fontFaces) {
        if (
            typeof face.family !== 'string' ||
            face.family.length > 128 ||
            !/^[a-z0-9 _-]+$/i.test(face.family) ||
            typeof face.weight !== 'string' ||
            !/^(?:normal|bold|[1-9]\d{0,2})(?:\s+(?:normal|bold|[1-9]\d{0,2}))?$/i.test(
                face.weight,
            ) ||
            typeof face.style !== 'string' ||
            !/^(?:normal|italic|oblique)$/i.test(face.style) ||
            !Array.isArray(face.sources) ||
            face.sources.length > 16
        ) {
            throw new Error(
                'La diapositiva devolvió metadatos de fuente no válidos',
            );
        }

        for (const source of face.sources) {
            if (
                typeof source !== 'string' ||
                source.length > 24 * 1024 * 1024
            ) {
                throw new Error(
                    'La diapositiva devolvió una fuente demasiado grande',
                );
            }
            if (
                /^data:font\/(?:otf|ttf|woff|woff2);base64,[a-z0-9+/]+=*$/i.test(
                    source,
                )
            ) {
                continue;
            }
            let url;
            try {
                url = new URL(source);
            } catch {
                throw new Error(
                    'La diapositiva devolvió una fuente no permitida',
                );
            }
            if (
                url.protocol !== 'https:' ||
                !fontHosts.includes(url.hostname)
            ) {
                throw new Error(
                    'La diapositiva devolvió una fuente de un host no autorizado',
                );
            }
        }
    }

    return snapshot;
}
