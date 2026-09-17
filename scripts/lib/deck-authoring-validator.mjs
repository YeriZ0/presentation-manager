/* global TextDecoder */

import { posix } from 'node:path';

const TEXT_EXTENSIONS = new Set([
    '.css',
    '.html',
    '.js',
    '.json',
    '.mjs',
    '.md',
]);
const IMAGE_ATTRIBUTES = /\b(?:src|href|poster)\s*=\s*(["'])(.*?)\1/gi;
const CSS_URL = /url\(\s*(["']?)([^)'"\s]+)\1\s*\)/gi;
const EMOJI =
    /(?:[\p{Extended_Pictographic}\p{Regional_Indicator}]|[0-9#*]\uFE0F?\u20E3)/u;
const ACADEMIC_SOBER_STRUCTURES = new Set([
    'cover',
    'closing',
    'pillars',
    'comparison',
    'process',
    'mixed-content',
    'narrative-elements',
    'system-diagram',
    'references',
    'table',
    'chart',
    'code',
]);

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
        (/^(slides|notes)\//.test(path) &&
            TEXT_EXTENSIONS.has(posix.extname(path).toLowerCase()))
    );
}

function assertLocalReferences(path, source, files) {
    const references = [];
    for (const match of source.matchAll(IMAGE_ATTRIBUTES))
        references.push(match[2]);
    if (path.endsWith('.css')) {
        for (const match of source.matchAll(CSS_URL)) references.push(match[2]);
    }

    const basePath = posix.dirname(path);
    for (const reference of references) {
        if (isExternalReference(reference)) continue;
        const resolved = posix.normalize(posix.join(basePath, reference));
        if (resolved.startsWith('../') || !files.has(resolved)) {
            throw new Error(
                `Recurso local inexistente en ${path}: ${reference}`,
            );
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
        throw new Error(
            `El recurso pendiente no usa image-broken.svg: ${path}`,
        );
    }
    if (!/<img\b[^>]*\balt\s*=\s*["'][^"']+[^"']*["']/i.test(source)) {
        throw new Error(
            `El recurso pendiente necesita texto alternativo: ${path}`,
        );
    }
    if (!/Recurso pendiente\s*:/i.test(source)) {
        throw new Error(
            `El recurso pendiente necesita feedback visible: ${path}`,
        );
    }
}

function assertAcademicSoberStructure(source, path) {
    const body = source.match(/<body\b([^>]*)>/i);
    if (!body || attribute(body[1], 'data-template') !== 'academic-sober')
        return;

    const structure = attribute(body[1], 'data-slide-structure');
    if (!structure) {
        throw new Error(
            `Falta data-slide-structure para academic-sober: ${path}`,
        );
    }
    if (!ACADEMIC_SOBER_STRUCTURES.has(structure)) {
        throw new Error(
            `Estructura academic-sober desconocida: ${structure} en ${path}`,
        );
    }
    if (structure !== 'cover' && structure !== 'closing') {
        assertCenteredBody(source, path);
    }
    if (structure === 'pillars') assertThematicUnits(source, path);
    if (structure === 'comparison') assertComparison(source, path);
    if (structure === 'process') assertProcess(source, path);
    if (structure === 'narrative-elements')
        assertNarrativeElements(source, path);
    if (structure === 'system-diagram') assertSystemDiagram(source, path);
    if (structure === 'chart') assertChart(source, path);
    if (structure === 'code') assertCode(source, path);
}

function assertCenteredBody(source, path) {
    const bodyTag = source.match(
        /<[a-z][a-z0-9-]*\b[^>]*\bdata-slide-body(?:\s*=\s*["'][^"']*["'])?[^>]*>/i,
    )?.[0];
    if (!bodyTag || attribute(bodyTag, 'data-vertical-align') !== 'center') {
        throw new Error(
            `El cuerpo de academic-sober debe estar centrado: ${path}`,
        );
    }
}

function assertThematicUnits(source, path) {
    const declaredUnits =
        source.match(/\bdata-thematic-unit(?:\s|=|>)/gi) || [];
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

        const icons =
            unit.match(/\bclass\s*=\s*["'][^"']*\bdeck-icon\b[^"']*["']/gi) ||
            [];
        iconCounts.push(icons.length);
        const iconIndex =
            icons.length > 0
                ? unit.search(/\bclass\s*=\s*["'][^"']*\bdeck-icon\b/i)
                : -1;
        if (
            topic.index >= description.index ||
            (iconIndex >= 0 &&
                !(topic.index < iconIndex && iconIndex < description.index))
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

function assertComparison(source, path) {
    if (!/\bdata-comparison(?:\s|=|>)/i.test(source)) {
        throw new Error(`Falta data-comparison: ${path}`);
    }
    const declaredOptions =
        source.match(/\bdata-comparison-option(?:\s|=|>)/gi) || [];
    const options = [
        ...source.matchAll(
            /<article\b[^>]*\bdata-comparison-option(?:\s*=\s*["'][^"']*["'])?[^>]*>([\s\S]*?)<\/article>/gi,
        ),
    ];
    if (options.length !== declaredOptions.length || options.length !== 2) {
        throw new Error(
            `comparison requiere exactamente dos opciones en article: ${path}`,
        );
    }

    assertOrderedPeers(
        options,
        'data-unit-topic',
        'data-unit-description',
        path,
    );
    const connector = markedText(source, 'data-comparison-connector');
    if (!connector || wordCount(connector.text) > 3) {
        throw new Error(
            `comparison requiere un texto central de hasta tres palabras: ${path}`,
        );
    }
}

function assertProcess(source, path) {
    if (!/\bdata-process(?:\s|=|>)/i.test(source)) {
        throw new Error(`Falta data-process: ${path}`);
    }
    const list = source.match(/<ol\b[^>]*>([\s\S]*?)<\/ol>/i)?.[1];
    if (!list) throw new Error(`process requiere una lista ordenada: ${path}`);

    const declaredSteps = source.match(/\bdata-process-step(?:\s|=|>)/gi) || [];
    const steps = [
        ...list.matchAll(
            /<li\b[^>]*\bdata-process-step(?:\s*=\s*["'][^"']*["'])?[^>]*>([\s\S]*?)<\/li>/gi,
        ),
    ];
    if (
        steps.length !== declaredSteps.length ||
        steps.length < 3 ||
        steps.length > 5
    ) {
        throw new Error(
            `process requiere de tres a cinco pasos en li: ${path}`,
        );
    }
    const iconCounts = [];
    for (const [, step] of steps) {
        const number = markedText(step, 'data-step-number');
        const title = markedText(step, 'data-step-title');
        const description = markedText(step, 'data-step-description');
        if (!number || !title || !description) {
            throw new Error(
                `Cada paso necesita número, título y descripción: ${path}`,
            );
        }
        if (wordCount(title.text) > 4 || wordCount(description.text) > 24) {
            throw new Error(`Un paso supera los límites de contenido: ${path}`);
        }
        const icons =
            step.match(/\bclass\s*=\s*["'][^"']*\bdeck-icon\b[^"']*["']/gi) ||
            [];
        iconCounts.push(icons.length);
        const iconIndex =
            icons.length > 0
                ? step.search(/\bclass\s*=\s*["'][^"']*\bdeck-icon\b/i)
                : -1;
        if (
            title.index >= description.index ||
            (iconIndex >= 0 &&
                !(title.index < iconIndex && iconIndex < description.index))
        ) {
            throw new Error(
                `El orden del paso debe ser título, icono y descripción: ${path}`,
            );
        }
    }
    const stepsWithIcons = iconCounts.filter((count) => count === 1).length;
    if (
        iconCounts.some((count) => count > 1) ||
        (stepsWithIcons !== 0 && stepsWithIcons !== steps.length)
    ) {
        throw new Error(
            `Los pasos deben usar iconos de forma consistente: ${path}`,
        );
    }
    const connectors =
        source.match(/\bdata-process-connectors(?:\s|=|>)/gi) || [];
    if (connectors.length !== 1) {
        throw new Error(`process requiere una capa de conectores: ${path}`);
    }
    const arrows = [
        ...source.matchAll(
            /<[a-z][a-z0-9-]*\b[^>]*\bdata-process-arrow\s*=\s*["']arrow-fat-right["'][^>]*>/gi,
        ),
    ].map((match) => match[0]);
    if (
        arrows.length !== steps.length - 1 ||
        arrows.some(
            (tag) =>
                !/\bclass\s*=\s*["'][^"']*\bdeck-icon\b[^"']*["']/i.test(tag),
        )
    ) {
        throw new Error(
            `process requiere arrow-fat-right entre cada par de pasos: ${path}`,
        );
    }
}

function assertNarrativeElements(source, path) {
    if (!/\bdata-narrative(?:\s|=|>)/i.test(source)) {
        throw new Error(`Falta data-narrative: ${path}`);
    }
    const copy = markedText(source, 'data-narrative-copy');
    if (!copy || wordCount(copy.text) > 70) {
        throw new Error(
            `La explicación narrativa debe contener hasta 70 palabras: ${path}`,
        );
    }
    if (!/\bdata-narrative-elements(?:\s|=|>)/i.test(source)) {
        throw new Error(`Falta data-narrative-elements: ${path}`);
    }

    const declaredElements =
        source.match(/\bdata-narrative-element(?:\s|=|>)/gi) || [];
    const elements = [
        ...source.matchAll(
            /<article\b[^>]*\bdata-narrative-element(?:\s*=\s*["'][^"']*["'])?[^>]*>([\s\S]*?)<\/article>/gi,
        ),
    ];
    if (
        elements.length !== declaredElements.length ||
        elements.length < 2 ||
        elements.length > 4
    ) {
        throw new Error(
            `narrative-elements requiere de dos a cuatro elementos: ${path}`,
        );
    }
    assertOrderedPeers(
        elements,
        'data-element-topic',
        'data-element-description',
        path,
    );
}

function assertOrderedPeers(peers, topicMarker, descriptionMarker, path) {
    const iconCounts = [];
    for (const [, peer] of peers) {
        const topic = markedText(peer, topicMarker);
        const description = markedText(peer, descriptionMarker);
        if (!topic || !description) {
            throw new Error(
                `Cada unidad necesita título y descripción: ${path}`,
            );
        }
        if (wordCount(topic.text) > 4 || wordCount(description.text) > 24) {
            throw new Error(
                `Una unidad supera los límites de contenido: ${path}`,
            );
        }
        const icons =
            peer.match(/\bclass\s*=\s*["'][^"']*\bdeck-icon\b[^"']*["']/gi) ||
            [];
        iconCounts.push(icons.length);
        const iconIndex =
            icons.length > 0
                ? peer.search(/\bclass\s*=\s*["'][^"']*\bdeck-icon\b/i)
                : -1;
        if (
            topic.index >= description.index ||
            (iconIndex >= 0 &&
                !(topic.index < iconIndex && iconIndex < description.index))
        ) {
            throw new Error(
                `El orden requerido es título, icono y descripción: ${path}`,
            );
        }
    }
    const peersWithIcons = iconCounts.filter((count) => count === 1).length;
    if (
        iconCounts.some((count) => count > 1) ||
        (peersWithIcons !== 0 && peersWithIcons !== peers.length)
    ) {
        throw new Error(
            `Las unidades equivalentes deben usar iconos de forma consistente: ${path}`,
        );
    }
}

function assertSystemDiagram(source, path) {
    const diagramMarkers = source.match(/\bdata-diagram(?:\s|=|>)/gi) || [];
    const diagramTag = source.match(
        /<(?:figure|section)\b[^>]*\bdata-diagram(?:\s*=\s*["'][^"']*["'])?[^>]*>/i,
    )?.[0];
    if (diagramMarkers.length !== 1 || !diagramTag) {
        throw new Error(
            `system-diagram requiere un solo data-diagram: ${path}`,
        );
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
    const connectors =
        source.match(/\bdata-diagram-connectors(?:\s|=|>)/gi) || [];
    if (connectors.length !== 1) {
        throw new Error(
            `system-diagram requiere un SVG de conectores: ${path}`,
        );
    }
    const describedBy = diagramTag.match(
        /\baria-describedby\s*=\s*["']([^"']+)["']/i,
    );
    if (!describedBy) {
        throw new Error(
            `system-diagram requiere una descripcion textual: ${path}`,
        );
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

function assertChart(source, path) {
    const chartTag = source.match(
        /<[a-z][a-z0-9-]*\b[^>]*\bdata-chart-type\s*=\s*["']donut["'][^>]*>/i,
    )?.[0];
    if (!chartTag) return;

    const segmentTags = [
        ...source.matchAll(
            /<path\b[^>]*\bdata-chart-segment\s*=\s*["'][^"']+["'][^>]*>/gi,
        ),
    ].map((match) => match[0]);
    if (segmentTags.length < 3 || segmentTags.length > 5) {
        throw new Error(`La dona requiere de tres a cinco segmentos: ${path}`);
    }
    const segments = new Map();
    for (const tag of segmentTags) {
        const id = attribute(tag, 'data-chart-segment');
        const value = Number(attribute(tag, 'data-value'));
        if (!id || !Number.isFinite(value) || value <= 0 || segments.has(id)) {
            throw new Error(`La dona contiene un segmento inválido: ${path}`);
        }
        segments.set(id, value);
    }
    const total = [...segments.values()].reduce((sum, value) => sum + value, 0);
    if (Math.abs(total - 100) > 0.001) {
        throw new Error(`Los segmentos de la dona deben sumar 100: ${path}`);
    }

    const legendIds = [
        ...source.matchAll(/\bdata-chart-legend\s*=\s*["']([^"']+)["']/gi),
    ].map((match) => match[1]);
    if (
        legendIds.length !== segments.size ||
        legendIds.some((id) => !segments.has(id))
    ) {
        throw new Error(
            `La leyenda de la dona no coincide con sus segmentos: ${path}`,
        );
    }
}

function assertCode(source, path) {
    if (
        !/<pre\b[^>]*>[\s\S]*<code\b[^>]*>[\s\S]*<\/code>[\s\S]*<\/pre>/i.test(
            source,
        )
    ) {
        throw new Error(`code requiere un bloque pre y code: ${path}`);
    }
    const lineTags = [
        ...source.matchAll(
            /<[a-z][a-z0-9-]*\b[^>]*\bdata-code-line(?:\s*=\s*["'][^"']*["'])?[^>]*>/gi,
        ),
    ].map((match) => match[0]);
    if (lineTags.length < 12 || lineTags.length > 16) {
        throw new Error(`code requiere de 12 a 16 líneas visibles: ${path}`);
    }
    const focusIndexes = lineTags.flatMap((tag, index) =>
        /\bdata-code-focus(?:\s|=|>)/i.test(tag) ? [index] : [],
    );
    const focusTags = focusIndexes.map((index) => lineTags[index]);
    const noteTag = source.match(
        /<[a-z][a-z0-9-]*\b[^>]*\bdata-code-note(?:\s*=\s*["'][^"']*["'])?[^>]*>/i,
    )?.[0];
    const noteId = noteTag ? attribute(noteTag, 'id') : null;
    if (
        focusTags.length === 0 ||
        !noteId ||
        lineTags
            .slice(focusIndexes[0], focusIndexes[focusIndexes.length - 1] + 1)
            .some((tag) => !/\bdata-code-focus(?:\s|=|>)/i.test(tag)) ||
        focusTags.some((tag) => attribute(tag, 'aria-describedby') !== noteId)
    ) {
        throw new Error(
            `El foco de código debe estar asociado con una anotación: ${path}`,
        );
    }
    const tokenKinds = new Set(
        [...source.matchAll(/\bdata-code-token\s*=\s*["']([^"']+)["']/gi)].map(
            (match) => match[1],
        ),
    );
    if (tokenKinds.size < 3) {
        throw new Error(
            `code requiere resaltado sintáctico para al menos tres tipos de token: ${path}`,
        );
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
        text: match[2]
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim(),
    };
}

function attribute(source, name) {
    return source.match(
        new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`, 'i'),
    )?.[1];
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
