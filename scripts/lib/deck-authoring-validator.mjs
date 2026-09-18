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
const DIAGRAM_TYPES = new Set([
    'architecture',
    'workflow',
    'sequence',
    'data-flow',
    'lifecycle',
    'hierarchy',
    'relationship-map',
]);
const DIAGRAM_DIRECTIONS = {
    architecture: new Set(['left-to-right', 'top-to-bottom']),
    workflow: new Set(['left-to-right', 'top-to-bottom']),
    sequence: new Set(['top-to-bottom']),
    'data-flow': new Set(['left-to-right', 'top-to-bottom']),
    lifecycle: new Set(['left-to-right', 'radial']),
    hierarchy: new Set(['top-to-bottom']),
    'relationship-map': new Set(['radial']),
};

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
            assertAcademicSoberStructure(source, path, files);
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

function assertAcademicSoberStructure(source, path, files) {
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
    if (structure === 'process') assertProcess(source, path, files);
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

function assertProcess(source, path, files) {
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
    const connectorTags = tagsWithMarker(source, 'data-process-connectors');
    const connectorLayers = pairedElementsWithMarker(
        source,
        '[a-z][a-z0-9-]*',
        'data-process-connectors',
    );
    if (connectorTags.length !== 1 || connectorLayers.length !== 1) {
        throw new Error(`process requiere una capa de conectores: ${path}`);
    }
    const arrows = tagsWithMarker(
        connectorLayers[0].content,
        'data-process-arrow',
    );
    if (tagsWithMarker(source, 'data-process-arrow').length !== arrows.length) {
        throw new Error(
            `Las flechas deben estar en la capa de process: ${path}`,
        );
    }
    const arrowNames = arrows.map((tag) =>
        attribute(tag, 'data-process-arrow'),
    );
    if (
        arrows.length !== steps.length - 1 ||
        arrowNames.some(
            (name) => !name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name),
        ) ||
        new Set(arrowNames).size !== 1 ||
        arrows.some((tag, index) => {
            const classes = attribute(tag, 'class')?.split(/\s+/) || [];
            const usesAssetName =
                classes.includes(`deck-icon--${arrowNames[index]}`) ||
                attribute(tag, 'data-icon') === arrowNames[index];
            return !classes.includes('deck-icon') || !usesAssetName;
        })
    ) {
        throw new Error(
            `process requiere una misma flecha aprobada entre cada par de pasos: ${path}`,
        );
    }
    assertProcessArrowAsset(files, arrowNames[0], path);
}

function assertProcessArrowAsset(files, arrowName, path) {
    const stylesheetPath = 'assets/icons/icons.css';
    const stylesheetBytes = files.get(stylesheetPath);
    if (!stylesheetBytes) {
        throw new Error(`Falta el activo aprobado para process: ${path}`);
    }
    const stylesheet = new TextDecoder()
        .decode(stylesheetBytes)
        .replace(/\/\*[\s\S]*?\*\//g, '');
    const escaped = arrowName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const classSelector = new RegExp(`\\.deck-icon--${escaped}(?![a-z0-9_-])`);
    const dataSelector = new RegExp(
        `\\[data-icon\\s*=\\s*["']${escaped}["']\\]`,
    );
    const declarations = [...stylesheet.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
        .filter(
            ([, selectors]) =>
                classSelector.test(selectors) || dataSelector.test(selectors),
        )
        .map((match) => match[2]);
    const reference = declarations.map(iconCssReference).find((value) => value);
    if (!reference || isExternalReference(reference)) {
        throw new Error(`Falta el activo aprobado para process: ${path}`);
    }
    const resolved = posix.normalize(
        posix.join(posix.dirname(stylesheetPath), reference),
    );
    if (!/^assets\/icons\//.test(resolved) || !files.has(resolved)) {
        throw new Error(`Falta el activo aprobado para process: ${path}`);
    }
}

function iconCssReference(declarations) {
    return declarations.match(
        /(?:^|;)\s*(?:--icon-source|-webkit-mask(?:-image)?|mask(?:-image)?|background-image)\s*:\s*[^;{}]*?url\(\s*(["']?)([^)'"\s]+)\1\s*\)/i,
    )?.[2];
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
    const diagramTags = tagsWithMarker(source, 'data-diagram');
    const diagrams = pairedElementsWithMarker(
        source,
        'figure|section',
        'data-diagram',
    );
    if (diagramTags.length !== 1 || diagrams.length !== 1) {
        throw new Error(
            `system-diagram requiere un solo data-diagram: ${path}`,
        );
    }
    const [{ openingTag: diagramTag, content: diagramContent }] = diagrams;
    const direction = attribute(diagramTag, 'data-reading-direction');
    if (!direction) {
        throw new Error(`Dirección de lectura inválida o ausente: ${path}`);
    }
    if (!['left-to-right', 'top-to-bottom', 'radial'].includes(direction)) {
        throw new Error(`Dirección de lectura inválida o ausente: ${path}`);
    }
    const connectors = pairedElementsWithMarker(
        diagramContent,
        'svg',
        'data-diagram-connectors',
    );
    if (
        tagsWithMarker(source, 'data-diagram-connectors').length !== 1 ||
        (diagramContent.match(/<svg\b[^>]*>/gi) || []).length !== 1 ||
        connectors.length !== 1
    ) {
        throw new Error(
            `system-diagram requiere un SVG de conectores: ${path}`,
        );
    }
    const [connector] = connectors;
    const htmlContent = diagramContent.replace(connector.full, '');
    const nodeTags = tagsWithMarker(htmlContent, 'data-diagram-node');
    if (
        tagsWithMarker(source, 'data-diagram-node').length !== nodeTags.length
    ) {
        throw new Error(`Hay nodos fuera del diagrama: ${path}`);
    }
    if (
        tagsWithMarker(source, 'data-diagram-edge').length !==
        tagsWithMarker(connector.content, 'data-diagram-edge').length
    ) {
        throw new Error(`Hay relaciones fuera del SVG de conectores: ${path}`);
    }
    if (
        tagsWithMarker(source, 'data-diagram-label').length !==
        tagsWithMarker(htmlContent, 'data-diagram-label').length
    ) {
        throw new Error(`Hay etiquetas fuera del diagrama HTML: ${path}`);
    }
    const diagramType = attribute(diagramTag, 'data-diagram-type');
    if (!diagramType) {
        if (nodeTags.length < 3 || nodeTags.length > 6) {
            throw new Error(`system-diagram requiere de 3 a 6 nodos: ${path}`);
        }
    } else {
        if (!/^<figure\b/i.test(diagramTag)) {
            throw new Error(`El diagrama tipado debe usar figure: ${path}`);
        }
        assertTypedDiagram(
            htmlContent,
            connector.content,
            path,
            diagramType,
            direction,
            nodeTags,
        );
    }
    const describedBy = attribute(diagramTag, 'aria-describedby');
    if (!describedBy) {
        throw new Error(
            `system-diagram requiere una descripcion textual: ${path}`,
        );
    }
    const labelledBy = attribute(diagramTag, 'aria-labelledby');
    if (!labelledBy) {
        throw new Error(`system-diagram requiere un titulo asociado: ${path}`);
    }
    for (const id of `${labelledBy} ${describedBy}`.trim().split(/\s+/)) {
        if (
            !tagsWithMarker(source, 'id').some(
                (tag) => attribute(tag, 'id') === id,
            )
        ) {
            throw new Error(`No existe el texto asociado ${id} en ${path}`);
        }
    }
}

function assertTypedDiagram(
    source,
    connectorSource,
    path,
    diagramType,
    direction,
    nodeTags,
) {
    if (!DIAGRAM_TYPES.has(diagramType)) {
        throw new Error(
            `Tipo de diagrama desconocido: ${diagramType} en ${path}`,
        );
    }
    if (!DIAGRAM_DIRECTIONS[diagramType].has(direction)) {
        throw new Error(
            `Dirección ${direction} incompatible con ${diagramType}: ${path}`,
        );
    }
    const markers = connectorSource.match(/<marker\b[^>]*>/gi) || [];
    if (
        markers.some((marker) => {
            const width = Number(attribute(marker, 'markerWidth') || 0);
            const height = Number(attribute(marker, 'markerHeight') || 0);
            const refX = Number(attribute(marker, 'refX') || 0);
            const refY = Number(attribute(marker, 'refY') || 0);
            return (
                width !== 7.2 || height !== 7.2 || refX !== 7.2 || refY !== 3.6
            );
        })
    ) {
        throw new Error(
            `Las puntas de flecha deben ser compactas y terminar antes del nodo: ${path}`,
        );
    }

    const minimumNodes =
        diagramType === 'sequence' ? 2 : diagramType === 'workflow' ? 4 : 3;
    const maximumNodes = diagramType === 'sequence' ? 6 : 7;
    if (nodeTags.length < minimumNodes || nodeTags.length > maximumNodes) {
        throw new Error(
            `${diagramType} requiere de ${minimumNodes} a ${maximumNodes} nodos: ${path}`,
        );
    }

    const nodeIds = nodeTags.map((tag) => attribute(tag, 'data-diagram-node'));
    assertUniqueDiagramIds(nodeIds, 'nodo', path);

    const markedEdgeTags = tagsWithMarker(connectorSource, 'data-diagram-edge');
    const edgeTags = markedEdgeTags.filter((tag) => /^<path\b/i.test(tag));
    if (edgeTags.length !== markedEdgeTags.length) {
        throw new Error(
            `Las relaciones deben usar path dentro del SVG: ${path}`,
        );
    }
    const edgeIds = edgeTags.map((tag) => attribute(tag, 'data-diagram-edge'));
    assertUniqueDiagramIds(edgeIds, 'relación', path);
    if (edgeTags.length === 0) {
        throw new Error(`El diagrama tipado necesita relaciones: ${path}`);
    }

    const nodes = new Set(nodeIds);
    const edges = edgeTags.map((tag) => {
        const from = attribute(tag, 'data-from');
        const to = attribute(tag, 'data-to');
        if (!nodes.has(from) || !nodes.has(to) || from === to) {
            throw new Error(`Una relación referencia nodos inválidos: ${path}`);
        }
        return {
            id: attribute(tag, 'data-diagram-edge'),
            from,
            to,
            tag,
        };
    });
    assertConnectedDiagram(nodeIds, edges, path);

    const labelTags = tagsWithMarker(source, 'data-diagram-label');
    const labelElements = pairedElementsWithMarker(
        source,
        '[a-z][a-z0-9-]*',
        'data-diagram-label',
    );
    if (
        labelElements.length !== labelTags.length ||
        labelElements.some(({ openingTag, content }) => {
            const classes = attribute(openingTag, 'class')?.split(/\s+/) || [];
            const text = content
                .replace(/<[^>]+>/g, ' ')
                .replace(/&(?:nbsp|#160);/gi, ' ')
                .trim();
            return (
                !text ||
                hasAttribute(openingTag, 'hidden') ||
                attribute(openingTag, 'aria-hidden') === 'true' ||
                classes.includes('visually-hidden')
            );
        })
    ) {
        throw new Error(
            `Cada relación necesita una etiqueta HTML visible: ${path}`,
        );
    }
    const labelledEdges = new Set();
    for (const tag of labelTags) {
        const edgeId = attribute(tag, 'data-for-edge');
        if (!edgeIds.includes(edgeId) || labelledEdges.has(edgeId)) {
            throw new Error(
                `Una etiqueta referencia una relación inválida o duplicada: ${path}`,
            );
        }
        labelledEdges.add(edgeId);
    }
    assertEveryEdgeLabelled(edges, labelledEdges, diagramType, path);

    if (diagramType === 'workflow') {
        assertTagMarkerRange(nodeTags, 'data-diagram-decision', 1, 2, path);
        if (edges.length < nodeTags.length - 1) {
            throw new Error(
                `workflow necesita continuidad suficiente: ${path}`,
            );
        }
        const decisions = new Map(
            nodeTags
                .filter((tag) => hasAttribute(tag, 'data-diagram-decision'))
                .map((tag) => [attribute(tag, 'data-diagram-node'), new Set()]),
        );
        for (const edge of edges) decisions.get(edge.from)?.add(edge.to);
        if (
            [...decisions.values()].some(
                (destinations) => destinations.size < 2,
            )
        ) {
            throw new Error(
                `Cada decisión de workflow necesita dos destinos: ${path}`,
            );
        }
    }
    if (diagramType === 'sequence') {
        assertTagMarkerRange(
            nodeTags,
            'data-diagram-participant',
            nodeTags.length,
            nodeTags.length,
            path,
        );
        const messages = edgeTags.filter((tag) =>
            hasAttribute(tag, 'data-diagram-message'),
        );
        if (
            messages.length !== edgeTags.length ||
            messages.length < 3 ||
            messages.length > 10
        ) {
            throw new Error(`sequence requiere de 3 a 10 mensajes: ${path}`);
        }
    }
    if (diagramType === 'data-flow') {
        const stageTags = tagsWithMarker(source, 'data-diagram-stage');
        const stageElements = pairedElementsWithMarker(
            source,
            '[a-z][a-z0-9-]*',
            'data-diagram-stage',
        );
        if (
            stageTags.length < 3 ||
            stageTags.length > 5 ||
            stageElements.length !== stageTags.length ||
            stageElements.some(({ openingTag, content }) => {
                const classes =
                    attribute(openingTag, 'class')?.split(/\s+/) || [];
                return (
                    !content.replace(/<[^>]+>/g, ' ').trim() ||
                    hasAttribute(openingTag, 'hidden') ||
                    attribute(openingTag, 'aria-hidden') === 'true' ||
                    classes.includes('visually-hidden')
                );
            })
        ) {
            throw new Error(
                `data-flow requiere de 3 a 5 etapas con texto visible: ${path}`,
            );
        }
    }
    if (diagramType === 'lifecycle') {
        assertTagMarkerRange(
            nodeTags,
            'data-diagram-state',
            nodeTags.length,
            nodeTags.length,
            path,
        );
        assertLifecycleTopology(nodeIds, edges, path);
    }
    if (diagramType === 'hierarchy') {
        assertTagMarkerRange(nodeTags, 'data-diagram-root', 1, 1, path);
        if (edges.length !== nodeTags.length - 1) {
            throw new Error(
                `hierarchy requiere una relación por nivel: ${path}`,
            );
        }
        const rootTag = nodeTags.find((tag) =>
            hasAttribute(tag, 'data-diagram-root'),
        );
        const rootId = attribute(rootTag, 'data-diagram-node');
        const parentCounts = new Map(nodeIds.map((id) => [id, 0]));
        for (const edge of edges) {
            parentCounts.set(edge.to, parentCounts.get(edge.to) + 1);
        }
        if (
            parentCounts.get(rootId) !== 0 ||
            [...parentCounts].some(
                ([id, count]) => id !== rootId && count !== 1,
            )
        ) {
            throw new Error(
                `hierarchy necesita una sola raíz y un padre por nodo: ${path}`,
            );
        }
    }
    if (diagramType === 'relationship-map') {
        assertTagMarkerRange(nodeTags, 'data-diagram-center', 1, 1, path);
        const centerTag = nodeTags.find((tag) =>
            hasAttribute(tag, 'data-diagram-center'),
        );
        const centerId = attribute(centerTag, 'data-diagram-node');
        if (
            edges.length !== nodeTags.length - 1 ||
            edges.some((edge) => edge.from !== centerId && edge.to !== centerId)
        ) {
            throw new Error(
                `relationship-map debe conectar cada nodo con el centro: ${path}`,
            );
        }
    }
}

function assertLifecycleTopology(nodeIds, edges, path) {
    const outgoing = new Map(nodeIds.map((id) => [id, new Set()]));
    for (const edge of edges) outgoing.get(edge.from).add(edge.to);
    const hasTerminal = [...outgoing.values()].some(
        (destinations) => destinations.size === 0,
    );
    const hasAlternative = [...outgoing.values()].some(
        (destinations) => destinations.size > 1,
    );
    const visiting = new Set();
    const visited = new Set();
    const hasCycleFrom = (node) => {
        if (visiting.has(node)) return true;
        if (visited.has(node)) return false;
        visiting.add(node);
        for (const destination of outgoing.get(node)) {
            if (hasCycleFrom(destination)) return true;
        }
        visiting.delete(node);
        visited.add(node);
        return false;
    };
    const hasCycle = nodeIds.some((node) => hasCycleFrom(node));
    if (!hasTerminal || (!hasCycle && !hasAlternative)) {
        throw new Error(
            `lifecycle requiere un estado terminal y un ciclo o transición alternativa: ${path}`,
        );
    }
}

function assertUniqueDiagramIds(ids, kind, path) {
    if (
        ids.some((id) => !id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) ||
        new Set(ids).size !== ids.length
    ) {
        throw new Error(`ID de ${kind} inválido o duplicado: ${path}`);
    }
}

function assertConnectedDiagram(nodeIds, edges, path) {
    const neighbors = new Map(nodeIds.map((id) => [id, new Set()]));
    for (const edge of edges) {
        neighbors.get(edge.from).add(edge.to);
        neighbors.get(edge.to).add(edge.from);
    }
    const visited = new Set([nodeIds[0]]);
    const pending = [nodeIds[0]];
    while (pending.length > 0) {
        const current = pending.pop();
        for (const neighbor of neighbors.get(current)) {
            if (visited.has(neighbor)) continue;
            visited.add(neighbor);
            pending.push(neighbor);
        }
    }
    if (visited.size !== nodeIds.length) {
        throw new Error(`El diagrama tipado contiene nodos aislados: ${path}`);
    }
}

function assertTagMarkerRange(tags, marker, minimum, maximum, path) {
    const count = tags.filter((tag) => hasAttribute(tag, marker)).length;
    if (count < minimum || count > maximum) {
        throw new Error(
            `${marker} requiere de ${minimum} a ${maximum} elementos: ${path}`,
        );
    }
}

function assertEveryEdgeLabelled(edges, labelledEdges, diagramType, path) {
    if (edges.some((edge) => !labelledEdges.has(edge.id))) {
        throw new Error(
            `${diagramType} requiere una etiqueta HTML por relación: ${path}`,
        );
    }
}

function tagsWithMarker(source, marker) {
    return (source.match(/<[a-z][a-z0-9-]*\b[^>]*>/gi) || []).filter((tag) =>
        hasAttribute(tag, marker),
    );
}

function pairedElementsWithMarker(source, tagNames, marker) {
    const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return [
        ...source.matchAll(
            new RegExp(
                `<(${tagNames})\\b(?=[^>]*\\s${escaped}(?=\\s|=|/?>))([^>]*)>([\\s\\S]*?)<\\/\\1>`,
                'gi',
            ),
        ),
    ].map((match) => ({
        openingTag: match[0].slice(0, match[0].indexOf('>') + 1),
        content: match[3],
        full: match[0],
    }));
}

function hasAttribute(source, name) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\s${escaped}(?=\\s|=|/?>)`, 'i').test(source);
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
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return source.match(
        new RegExp(`\\s${escaped}\\s*=\\s*["']([^"']+)["']`, 'i'),
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
