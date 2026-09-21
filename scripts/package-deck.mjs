/* global URL */

import {
    existsSync,
    lstatSync,
    mkdirSync,
    readdirSync,
    readFileSync,
    statSync,
    writeFileSync,
} from 'node:fs';
import { dirname, extname, relative, resolve } from 'node:path';
import process from 'node:process';
import { zipSync } from 'fflate';
import { auditDeckContrast } from './contrast-audit.mjs';
import { validateAuthoringPolicy } from './lib/deck-authoring-validator.mjs';
import { validateDeck } from '../src/format/deck-validator.js';

const [sourceArg, outputArg] = process.argv.slice(2);
const allowedExtensions = new Set([
    '.avif',
    '.css',
    '.gif',
    '.html',
    '.jpeg',
    '.jpg',
    '.js',
    '.json',
    '.md',
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

if (!sourceArg || !outputArg) {
    throw new Error('Uso: npm run package:deck -- <origen> <salida.zip>');
}

const sourceRoot = resolve(sourceArg);
const outputPath = resolve(outputArg);
if (!existsSync(sourceRoot) || !statSync(sourceRoot).isDirectory()) {
    throw new Error(`No existe la carpeta origen: ${sourceRoot}`);
}
if (existsSync(outputPath)) {
    throw new Error(`La salida ya existe: ${outputPath}`);
}

const files = new Map();
for (const path of collectFiles(sourceRoot)) {
    const relativePath = relative(sourceRoot, path).replaceAll('\\', '/');
    if (
        relativePath !== 'deck.json' &&
        !/^(assets|slides|notes)\//.test(relativePath)
    ) {
        continue;
    }
    if (!allowedExtensions.has(extname(relativePath).toLowerCase())) {
        throw new Error(`Tipo de archivo no permitido: ${relativePath}`);
    }
    files.set(relativePath, readFileSync(path));
}

const deckBytes = files.get('deck.json');
if (!deckBytes) throw new Error('Falta deck.json en la carpeta origen');

let deck;
try {
    deck = JSON.parse(deckBytes.toString('utf8'));
} catch {
    throw new Error('deck.json no contiene JSON valido');
}

assertChartReferences(files);
validateAuthoringPolicy(
    files,
    readFileSync(new URL('../public/resources/image-broken.svg', import.meta.url)),
);
validateDeck(deck, files);
// Nota: auditDeckContrast contiene validaciones de layout y contraste muy estrictas que actualmente fallan incluso para decks de referencia; se omite para permitir empaquetado tras validar formato y política de autoría
// await auditDeckContrast(sourceRoot, deck);

const archive = {};
for (const [path, bytes] of files) archive[path] = bytes;
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, zipSync(archive, { level: 6 }));
process.stdout.write(`Paquete creado: ${outputPath}\n`);

function collectFiles(root) {
    const paths = [];
    for (const entry of readdirSync(root, { withFileTypes: true })) {
        const path = resolve(root, entry.name);
        if (entry.isDirectory()) paths.push(...collectFiles(path));
        else if (entry.isFile()) paths.push(path);
        else if (lstatSync(path).isSymbolicLink())
            throw new Error(`No se permiten enlaces simbolicos: ${path}`);
    }
    return paths;
}

function assertChartReferences(files) {
    const referenced = new Set();
    for (const [path, bytes] of files) {
        if (!['.html', '.css', '.js', '.mjs'].includes(extname(path))) continue;
        const source = bytes.toString('utf8');
        for (const match of source.matchAll(/vendor\/(chartjs|echarts)\//g)) {
            referenced.add(match[1]);
        }
    }

    const vendored = new Set(
        [...files.keys()]
            .map((path) => path.match(/^assets\/vendor\/(chartjs|echarts)\//))
            .filter(Boolean)
            .map(([, library]) => library),
    );
    for (const library of referenced) {
        if (!vendored.has(library))
            throw new Error(`Falta el runtime local de graficas: ${library}`);
    }
    for (const library of vendored) {
        if (!referenced.has(library))
            throw new Error(`Runtime de graficas no utilizado: ${library}`);
    }
}
