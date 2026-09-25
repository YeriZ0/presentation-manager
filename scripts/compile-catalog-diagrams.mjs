import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import process from 'node:process';
import {
    MERMAID_CONFIG,
    MERMAID_VERSION,
    createMermaidRenderer,
} from './lib/mermaid-compiler.mjs';

const catalogRoot = resolve('catalog/academic-sober');
const sourceRoot = resolve(catalogRoot, 'diagrams');
const outputRoot = resolve(catalogRoot, 'generated');
const diagrams = [
    ['architecture', 'architecture.mmd'],
    ['workflow', 'workflow.mmd'],
    ['sequence', 'sequence.mmd'],
    ['data-flow', 'data-flow.mmd'],
    ['lifecycle', 'lifecycle.mmd'],
    ['hierarchy', 'hierarchy.mmd'],
    ['relationship-map', 'relationship-map.mmd'],
];

rmSync(outputRoot, { force: true, recursive: true });
mkdirSync(outputRoot, { recursive: true });

const renderer = await createMermaidRenderer({ width: 1680, height: 620 });
const manifest = {
    engine: 'mermaid',
    engineVersion: MERMAID_VERSION,
    config: MERMAID_CONFIG,
    diagrams: [],
};

try {
    for (const [type, filename] of diagrams) {
        const sourcePath = resolve(sourceRoot, filename);
        const sourceBytes = readFileSync(sourcePath);
        const source = sourceBytes.toString('utf8');
        const result = await renderer.render({
            source,
            sourceBytes,
            type,
            renderId: `catalog-${type}`,
            path: `catalog/academic-sober/diagrams/${filename}`,
        });
        const output = `${result.svg}\n`;
        writeFileSync(resolve(outputRoot, `${type}.svg`), output, 'utf8');
        manifest.diagrams.push({
            type,
            source: basename(sourcePath),
            output: `${type}.svg`,
            detectedType: result.detectedType,
            sourceHash: result.sourceHash,
        });
    }
} finally {
    await renderer.close();
}

writeFileSync(
    resolve(outputRoot, 'manifest.json'),
    `${JSON.stringify(manifest, null, 4)}\n`,
    'utf8',
);
process.stdout.write(`${diagrams.length} diagramas del catalogo compilados\n`);
