/* global TextDecoder */

import { posix } from 'node:path';

const TEXT_EXTENSIONS = new Set(['.html', '.js', '.json', '.mjs', '.md']);
const IMAGE_ATTRIBUTES = /\b(?:src|href|poster)\s*=\s*(["'])(.*?)\1/gi;
const CSS_URL = /url\(\s*(["']?)([^)'"\s]+)\1\s*\)/gi;
const EMOJI = /(?:[\p{Extended_Pictographic}\p{Regional_Indicator}]|[0-9#*]\uFE0F?\u20E3)/u;

export function validateAuthoringPolicy(files, placeholderBytes) {
    for (const [path, bytes] of files) {
        if (!isAuthoredPath(path)) continue;
        const source = new TextDecoder().decode(bytes);
        if (EMOJI.test(source)) {
            throw new Error(`Los emojis no estan permitidos: ${path}`);
        }
        assertLocalReferences(path, source, files);
        if (path.endsWith('.html')) {
            assertPendingResource(source, path, files, placeholderBytes);
            assertAcademicSoberStructure(source, path);
        }
    }
}

function isAuthoredPath(path) {
    return (
        path === 'deck.json' ||
        /^(slides|notes)\//.test(path) &&
            TEXT_EXTENSIONS.has(posix.extname(path).toLowerCase())
    );
}

function assertLocalReferences(path, source, files) {
    const references = [];
    for (const match of source.matchAll(IMAGE_ATTRIBUTES)) references.push(match[2]);
    if (path.endsWith('.css')) {
        for (const match of source.matchAll(CSS_URL)) references.push(match[2]);
    }

    const basePath = posix.dirname(path);
    for (const reference of references) {
        if (isExternalReference(reference)) continue;
        const resolved = posix.normalize(posix.join(basePath, reference));
        if (resolved.startsWith('../') || !files.has(resolved)) {
            throw new Error(`Recurso local inexistente en ${path}: ${reference}`);
        }
    }
}

function assertPendingResource(source, path, files, placeholderBytes) {
    if (!/data-resource-status\s*=\s*["']pending["']/i.test(source)) return;

    const placeholderPath = findPlaceholderPath(path);
    const fileBytes = files.get(placeholderPath);
    if (!fileBytes || !sameBytes(fileBytes, placeholderBytes)) {
        throw new Error(`Falta el placeholder canonico en ${path}`);
    }
    if (!/assets\/placeholders\/image-broken\.svg/i.test(source)) {
        throw new Error(`El recurso pendiente no usa image-broken.svg: ${path}`);
    }
    if (!/<img\b[^>]*\balt\s*=\s*["'][^"']+[^"']*["']/i.test(source)) {
        throw new Error(`El recurso pendiente necesita texto alternativo: ${path}`);
    }
    if (!/Recurso pendiente\s*:/i.test(source)) {
        throw new Error(`El recurso pendiente necesita feedback visible: ${path}`);
    }
}

function assertAcademicSoberStructure(source, path) {
    const body = source.match(/<body\b([^>]*)>/i);
    if (!body || attribute(body[1], 'data-template') !== 'academic-sober') return;

    const structure = attribute(body[1], 'data-slide-structure');
    if (!structure) {
        throw new Error(`Falta data-slide-structure para academic-sober: ${path}`);
    }
    if (structure === 'pillars') assertThematicUnits(source, path);
    if (structure === 'system-diagram') assertSystemDiagram(source, path);
}

function assertThematicUnits(source, path) {
    const declaredUnits = source.match(/\bdata-thematic-unit(?:\s|=|>)/gi) || [];
    const units = [
        ...source.matchAll(
            /<article\b[^>]*\bdata-thematic-unit(?:\s*=\s*["'][^"']*["'])?[^>]*>([\s\S]*?)<\/article>/gi,
        ),
    ];
    if (units.length !== declaredUnits.length) {
        throw new Error(
            `Las unidades tematicas deben usar article con cierre explicito: ${path}`,
        );
    }
    if (units.length < 2 || units.length > 4) {
        throw new Error(
            `academic-sober requiere de 2 a 4 unidades tematicas: ${path}`,
        );
    }

    const iconCounts = [];
    for (const [, unit] of units) {
        const topic = markedText(unit, 'data-unit-topic');
        const description = markedText(unit, 'data-unit-description');
        if (!topic || !description) {
            throw new Error(
                `Cada unidad tematica necesita tema y descripcion: ${path}`,
            );
        }
        if (wordCount(topic.text) > 4) {
            throw new Error(`El tema supera 4 palabras: ${path}`);
        }
        if (wordCount(description.text) > 24) {
            throw new Error(`La descripcion supera 24 palabras: ${path}`);
        }

        const icons = unit.match(/\bclass\s*=\s*["'][^"']*\bdeck-icon\b[^"']*["']/gi) || [];
        iconCounts.push(icons.length);
        const iconIndex = icons.length > 0 ? unit.search(/\bclass\s*=\s*["'][^"']*\bdeck-icon\b/i) : -1;
        if (
            topic.index >= description.index ||
            (iconIndex >= 0 && !(topic.index < iconIndex && iconIndex < description.index))
        ) {
            throw new Error(
                `El orden requerido es tema, icono y descripcion: ${path}`,
            );
        }
    }

    const unitsWithIcons = iconCounts.filter((count) => count === 1).length;
    if (
        iconCounts.some((count) => count > 1) ||
        (unitsWithIcons !== 0 && unitsWithIcons !== units.length)
    ) {
        throw new Error(
            `Las unidades equivalentes deben usar un icono cada una o ninguno: ${path}`,
        );
    }
}

function assertSystemDiagram(source, path) {
    const diagramMarkers = source.match(/\bdata-diagram(?:\s|=|>)/gi) || [];
    const diagramTag = source.match(
        /<(?:figure|section)\b[^>]*\bdata-diagram(?:\s*=\s*["'][^"']*["'])?[^>]*>/i,
    )?.[0];
    if (diagramMarkers.length !== 1 || !diagramTag) {
        throw new Error(`system-diagram requiere un solo data-diagram: ${path}`);
    }
    const direction = diagramTag.match(
        /\bdata-reading-direction\s*=\s*["'](left-to-right|top-to-bottom|radial)["']/i,
    );
    if (!direction) {
        throw new Error(`Direccion de lectura invalida o ausente: ${path}`);
    }
    const nodes = source.match(/\bdata-diagram-node(?:\s|=|>)/gi) || [];
    if (nodes.length < 3 || nodes.length > 6) {
        throw new Error(`system-diagram requiere de 3 a 6 nodos: ${path}`);
    }
    const connectors = source.match(/\bdata-diagram-connectors(?:\s|=|>)/gi) || [];
    if (connectors.length !== 1) {
        throw new Error(`system-diagram requiere un SVG de conectores: ${path}`);
    }
    const describedBy = diagramTag.match(
        /\baria-describedby\s*=\s*["']([^"']+)["']/i,
    );
    if (!describedBy) {
        throw new Error(`system-diagram requiere una descripcion textual: ${path}`);
    }
    const labelledBy = diagramTag.match(
        /\baria-labelledby\s*=\s*["']([^"']+)["']/i,
    );
    if (!labelledBy) {
        throw new Error(`system-diagram requiere un titulo asociado: ${path}`);
    }
    for (const id of `${labelledBy[1]} ${describedBy[1]}`.trim().split(/\s+/)) {
        const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (!new RegExp(`\\bid\\s*=\\s*["']${escaped}["']`, 'i').test(source)) {
            throw new Error(`No existe el texto asociado ${id} en ${path}`);
        }
    }
}

function markedText(source, marker) {
    const match = new RegExp(
        `<([a-z][a-z0-9-]*)\\b[^>]*\\b${marker}(?:\\s*=\\s*["'][^"']*["'])?[^>]*>([\\s\\S]*?)<\\/\\1>`,
        'i',
    ).exec(source);
    if (!match) return null;
    return {
        index: match.index,
        text: match[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    };
}

function attribute(source, name) {
    return source.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`, 'i'))?.[1];
}

function wordCount(value) {
    return value.trim() ? value.trim().split(/\s+/).length : 0;
}

function findPlaceholderPath(path) {
    const basePath = posix.dirname(path);
    return posix.normalize(
        posix.join(basePath, '../../assets/placeholders/image-broken.svg'),
    );
}

function isExternalReference(reference) {
    return (
        reference.startsWith('#') ||
        reference.startsWith('data:') ||
        reference.startsWith('blob:') ||
        /^[a-z][a-z\d+.-]*:/i.test(reference)
    );
}

function sameBytes(left, right) {
    return (
        left.byteLength === right.byteLength &&
        left.every((byte, index) => byte === right[index])
    );
}
