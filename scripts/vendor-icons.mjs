/* global URL */

import {
    cpSync,
    existsSync,
    mkdirSync,
    readFileSync,
    writeFileSync,
} from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import { normalizeIconSelection } from './lib/icon-selection.mjs';

const [presentationRoot, selectionArg] = process.argv.slice(2);
if (!presentationRoot) {
    throw new Error(
        'Uso: npm run vendor:icons -- presentations/<slug> [seleccion.json]',
    );
}

const root = resolve(presentationRoot);
const selectionPath = resolve(selectionArg || `${root}/_working/icons.json`);
const catalog = JSON.parse(
    readFileSync(new URL('./icon-catalog.json', import.meta.url), 'utf8'),
);
const selection = existsSync(selectionPath)
    ? JSON.parse(readFileSync(selectionPath, 'utf8'))
    : { icons: [] };
const icons = normalizeIconSelection(selection.icons || [], catalog);
if (icons.length === 0) {
    throw new Error('No hay iconos aprobados en la seleccion');
}
const destination = resolve(root, 'assets/icons');
const iconDestination = resolve(destination, 'phosphor');
const sourceRoot = resolve('node_modules/@phosphor-icons/core/assets');

for (const icon of icons) {
    const source = resolve(
        sourceRoot,
        icon.weight,
        `${icon.name}${suffix(icon.weight)}.svg`,
    );
    if (!existsSync(source)) {
        throw new Error(
            `No existe el icono de Phosphor: ${icon.name} (${icon.weight})`,
        );
    }
}
mkdirSync(iconDestination, { recursive: true });
for (const icon of icons) {
    const source = resolve(
        sourceRoot,
        icon.weight,
        `${icon.name}${suffix(icon.weight)}.svg`,
    );
    cpSync(source, resolve(iconDestination, outputName(icon)));
}

writeFileSync(
    resolve(destination, 'icons.css'),
    createStylesheet(icons, catalog),
    'utf8',
);
const licenseSource = resolve('node_modules/@phosphor-icons/core/LICENSE');
mkdirSync(resolve(root, 'assets/licenses'), { recursive: true });
cpSync(licenseSource, resolve(root, 'assets/licenses/phosphor-icons.txt'));
updateAttributions(root, catalog);

process.stdout.write(`${icons.length} iconos copiados a ${iconDestination}\n`);

function createStylesheet(icons, catalog) {
    const lines = [
        '/* Generated from @phosphor-icons/core */',
        ':where(.deck-icon) {',
        '    display: inline-block;',
        '    width: var(--icon-size, 1em);',
        '    height: var(--icon-size, 1em);',
        '    flex: 0 0 auto;',
        '    vertical-align: middle;',
        '    background-color: var(--icon-color, currentColor);',
        '    -webkit-mask: var(--icon-source) center / contain no-repeat;',
        '    mask: var(--icon-source) center / contain no-repeat;',
        '}',
        '',
    ];

    for (const icon of icons) {
        const source = `url("./phosphor/${outputName(icon)}")`;
        lines.push(
            `.deck-icon[data-icon="${icon.name}"][data-icon-weight="${icon.weight}"],`,
            `.deck-icon[data-icon="${icon.name}"]:not([data-icon-weight]) {`,
            `    --icon-source: ${source};`,
            '}',
            `.deck-icon--${icon.role}[data-icon-weight="${icon.weight}"],`,
            `.deck-icon--${icon.role}:not([data-icon-weight]) {`,
            `    --icon-source: ${source};`,
            '}',
            '',
        );
    }

    lines.push(
        `/* ${Object.keys(catalog.roles).length} semantic roles available */`,
        '',
    );
    return lines.join('\n');
}

function updateAttributions(root, catalog) {
    const path = resolve(root, 'assets/ATTRIBUTIONS.md');
    const section = `### ${catalog.library}\n\n- Version: ${catalog.version}\n- Source: ${catalog.source}\n- License: MIT\n- Copied assets: assets/icons/phosphor/\n- Stylesheet: assets/icons/icons.css\n`;
    const existing = existsSync(path)
        ? readFileSync(path, 'utf8')
        : '# Asset attributions\n\n';
    const pattern = new RegExp(
        `\\n?### ${catalog.library}\\n[\\s\\S]*?(?=\\n### |$)`,
        'g',
    );
    writeFileSync(
        path,
        `${existing.replace(pattern, '').trimEnd()}\n\n${section}`,
        'utf8',
    );
}

function suffix(weight) {
    return weight === 'regular' ? '' : `-${weight}`;
}

function outputName(icon) {
    return `${icon.name}${suffix(icon.weight)}.svg`;
}
