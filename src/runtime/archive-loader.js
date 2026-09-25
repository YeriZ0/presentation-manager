import { strFromU8, unzip } from 'fflate';
import { assertSafePath, validateDeck } from '../format/deck-validator.js';

const MAX_ARCHIVE_SIZE = 100 * 1024 * 1024;
const MAX_UNPACKED_SIZE = 300 * 1024 * 1024;
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_FILES = 1000;
const ALLOWED_EXTENSIONS = new Set([
    '.avif',
    '.css',
    '.gif',
    '.html',
    '.jpeg',
    '.jpg',
    '.js',
    '.json',
    '.md',
    '.mmd',
    '.mjs',
    '.otf',
    '.png',
    '.svg',
    '.ttf',
    '.txt',
    '.webp',
    '.woff',
    '.woff2',
]);

export async function loadArchive(file) {
    if (!file.name.toLowerCase().endsWith('.zip'))
        throw new Error('Selecciona un archivo ZIP');
    if (file.size > MAX_ARCHIVE_SIZE)
        throw new Error('El archivo ZIP supera el limite de 100 MB');

    let archive;
    try {
        archive = await unzipArchive(new Uint8Array(await file.arrayBuffer()));
    } catch {
        throw new Error('El archivo seleccionado no es un paquete ZIP valido');
    }
    const files = new Map();
    let unpackedSize = 0;

    for (const [rawPath, bytes] of Object.entries(archive)) {
        const path = rawPath.replace(/^\.\//, '');
        assertSafePath(path);
        if (path.endsWith('/')) continue;
        if (bytes.byteLength > MAX_FILE_SIZE)
            throw new Error(`El archivo supera el limite de 50 MB: ${path}`);
        unpackedSize += bytes.byteLength;
        if (unpackedSize > MAX_UNPACKED_SIZE || files.size >= MAX_FILES)
            throw new Error('El ZIP contiene demasiados datos');
        const extension = getExtension(path);
        if (!ALLOWED_EXTENSIONS.has(extension))
            throw new Error(`Tipo de archivo no permitido: ${path}`);
        files.set(path, bytes);
    }

    if (!files.has('deck.json'))
        throw new Error('deck.json debe estar en la raiz del ZIP');
    let deck;
    try {
        deck = JSON.parse(strFromU8(files.get('deck.json')));
    } catch {
        throw new Error('deck.json no contiene JSON valido');
    }
    validateDeck(deck, files);
    return { deck, files };
}

function unzipArchive(bytes) {
    return new Promise((resolve, reject) => {
        unzip(bytes, (error, archive) => {
            if (error) reject(error);
            else resolve(archive);
        });
    });
}

function getExtension(path) {
    const dotIndex = path.lastIndexOf('.');
    return dotIndex === -1 ? '' : path.slice(dotIndex).toLowerCase();
}
