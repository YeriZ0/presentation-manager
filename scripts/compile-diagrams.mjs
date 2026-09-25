import {
    existsSync,
    mkdirSync,
    readFileSync,
    readdirSync,
    statSync,
    writeFileSync,
} from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import process from 'node:process';
import { compileMermaidDiagrams } from './lib/mermaid-compiler.mjs';

const [sourceArg] = process.argv.slice(2);
if (!sourceArg) {
    throw new Error('Uso: npm run compile:diagrams -- <presentacion>');
}

const sourceRoot = resolve(sourceArg);
if (!existsSync(sourceRoot) || !statSync(sourceRoot).isDirectory()) {
    throw new Error(`No existe la carpeta origen: ${sourceRoot}`);
}

const files = new Map();
for (const path of collectFiles(sourceRoot)) {
    const relativePath = relative(sourceRoot, path).replaceAll('\\', '/');
    if (
        relativePath === 'deck.json' ||
        /^(assets|diagrams|slides|notes)\//.test(relativePath)
    ) {
        files.set(relativePath, readFileSync(path));
    }
}

const deckBytes = files.get('deck.json');
if (!deckBytes) throw new Error('Falta deck.json en la carpeta origen');
const deck = JSON.parse(deckBytes.toString('utf8'));
const result = await compileMermaidDiagrams(deck, files);

for (const path of ['deck.json', 'diagrams/config.json']) {
    const bytes = files.get(path);
    if (bytes) {
        const output = resolve(sourceRoot, path);
        mkdirSync(dirname(output), { recursive: true });
        writeFileSync(output, bytes);
    }
}
for (const slide of deck.slides.filter((item) => item.diagram)) {
    writeFileSync(resolve(sourceRoot, slide.source), files.get(slide.source));
}

process.stdout.write(`${result.compiled} diagramas Mermaid compilados\n`);

function collectFiles(root) {
    const paths = [];
    for (const entry of readdirSync(root, { withFileTypes: true })) {
        const path = resolve(root, entry.name);
        if (entry.isDirectory()) paths.push(...collectFiles(path));
        else if (entry.isFile()) paths.push(path);
    }
    return paths;
}
