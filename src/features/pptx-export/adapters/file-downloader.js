import { createSafeFilename } from '../contracts.js';

export function createFileDownloader(dependencies = {}) {
    async function download(bytes, title, signal) {
        if (signal.aborted) throw new DOMException('Cancelado', 'AbortError');
        const documentRef = dependencies.document || globalThis.document;
        const urlRef = dependencies.URL || globalThis.URL;
        const blob = new (dependencies.Blob || globalThis.Blob)([bytes], {
            type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        });
        const url = urlRef.createObjectURL(blob);
        const anchor = documentRef.createElement('a');
        anchor.href = url;
        anchor.download = createSafeFilename(title);
        anchor.hidden = true;
        documentRef.body.append(anchor);
        try {
            anchor.click();
            await new Promise((resolve) =>
                (dependencies.setTimeout || globalThis.setTimeout)(resolve, 0),
            );
        } finally {
            anchor.remove();
            urlRef.revokeObjectURL(url);
        }
    }

    return { download };
}
