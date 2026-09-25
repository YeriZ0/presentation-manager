/* global DOMParser, TextDecoder, TextEncoder, XMLSerializer, document, window */

import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { chromium } from '@playwright/test';
import mermaidPackage from 'mermaid/package.json' with { type: 'json' };

const require = createRequire(import.meta.url);
const mermaidRuntime = require.resolve('mermaid/dist/mermaid.min.js');
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const TYPE_COMPATIBILITY = {
    architecture: new Set(['flowchart', 'flowchart-v2']),
    workflow: new Set(['flowchart', 'flowchart-v2']),
    sequence: new Set(['sequence']),
    'data-flow': new Set(['flowchart', 'flowchart-v2']),
    lifecycle: new Set(['stateDiagram']),
    hierarchy: new Set(['flowchart', 'flowchart-v2']),
    'relationship-map': new Set(['flowchart', 'flowchart-v2']),
};

export const MERMAID_VERSION = mermaidPackage.version;
export const MERMAID_CONFIG = Object.freeze({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: 'base',
    deterministicIds: true,
    htmlLabels: false,
    flowchart: {
        curve: 'linear',
        htmlLabels: false,
        nodeSpacing: 80,
        rankSpacing: 100,
        useMaxWidth: false,
    },
    themeVariables: {
        background: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        primaryColor: '#ffffff',
        primaryTextColor: '#111827',
        primaryBorderColor: '#1f2937',
        secondaryColor: '#dce9f2',
        secondaryTextColor: '#111827',
        secondaryBorderColor: '#35658c',
        tertiaryColor: '#eef1f4',
        tertiaryTextColor: '#111827',
        tertiaryBorderColor: '#596273',
        lineColor: '#35658c',
        edgeLabelBackground: '#ffffff',
        clusterBkg: '#ffffff',
        clusterBorder: '#ffffff',
    },
    themeCSS: `
        .node rect, .node circle, .node ellipse, .node polygon, .node path {
            stroke-width: 3px;
        }
        .edgePath path, .flowchart-link {
            stroke-width: 3px;
        }
        .edgeLabel, .messageText, .labelText {
            fill: #111827;
            color: #111827;
        }
        .edgeLabel rect, .labelBkg, .labelBox {
            fill: #ffffff !important;
            opacity: 1 !important;
            fill-opacity: 0.95 !important;
            background-color: #ffffff !important;
        }
        .cluster rect {
            fill: transparent !important;
            stroke: none !important;
        }
        .cluster-label text, .cluster-label span {
            fill: #111827 !important;
            color: #111827 !important;
            font-style: italic;
        }
    `,
});

export async function createMermaidRenderer(viewport = {}) {
    const browser = await launchBrowser();

    const page = await browser.newPage({
        viewport: {
            width: viewport.width || 1920,
            height: viewport.height || 1080,
        },
    });
    await page.setContent('<!doctype html><html><body></body></html>');
    await page.addScriptTag({ path: mermaidRuntime });
    const connectorReference = await page.evaluate(async (config) => {
        window.mermaid.initialize(config);
        const { svg } = await window.mermaid.render(
            'connector-reference',
            `sequenceDiagram
                accTitle: Referencia de conector
                accDescr: Referencia de punta de flecha
                A->>B: referencia
                B-->>A: retorno
                A->>B: cierre`,
        );
        const root = new DOMParser().parseFromString(svg, 'image/svg+xml');
        const marker = root.querySelector('marker');
        return marker
            ? Object.fromEntries(
                  [
                      'viewBox',
                      'markerWidth',
                      'markerHeight',
                      'refX',
                      'refY',
                      'orient',
                      'markerUnits',
                  ].map((name) => [name, marker.getAttribute(name)]),
              )
            : null;
    }, MERMAID_CONFIG);

    return {
        render: async ({
            source,
            sourceBytes,
            type,
            renderId,
            path = 'diagram.mmd',
        }) => {
            validateMermaidDefinition(source, type, path);
            let result;
            try {
                result = await page.evaluate(
                    async ({
                        config,
                        renderId: id,
                        source: definition,
                        diagramType,
                        markerReference,
                    }) => {
                        window.mermaid.initialize(config);
                        const detectedType =
                            window.mermaid.detectType(definition);
                        const { svg } = await window.mermaid.render(
                            id,
                            definition,
                        );
                        const root = new DOMParser().parseFromString(
                            svg,
                            'image/svg+xml',
                        );
                        const rendered = root.documentElement;
                        if (markerReference) {
                            for (const marker of rendered.querySelectorAll(
                                'marker',
                            )) {
                                for (const [name, value] of Object.entries(
                                    markerReference,
                                )) {
                                    if (value) marker.setAttribute(name, value);
                                }
                            }
                        }
                        document.body.append(rendered);
                        const box = rendered.getBBox();
                        const padding = {
                            sequence: { x: 48, y: 28 },
                            hierarchy: { x: 88, y: 112 },
                        }[diagramType] || { x: 72, y: 72 };
                        rendered.removeAttribute('width');
                        rendered.removeAttribute('height');
                        rendered.style.removeProperty('width');
                        rendered.style.removeProperty('height');
                        rendered.style.removeProperty('max-width');
                        rendered.style.removeProperty('max-height');
                        rendered.setAttribute(
                            'viewBox',
                            `${box.x - padding.x} ${box.y - padding.y} ${box.width + padding.x * 2} ${box.height + padding.y * 2}`,
                        );
                        rendered.remove();
                        return {
                            detectedType,
                            svg: new XMLSerializer().serializeToString(
                                rendered,
                            ),
                        };
                    },
                    {
                        config: MERMAID_CONFIG,
                        renderId,
                        source,
                        diagramType: type,
                        markerReference: connectorReference,
                    },
                );
            } catch (error) {
                throw new Error(
                    `Mermaid no pudo compilar ${path}: ${error.message}`,
                );
            }
            if (!TYPE_COMPATIBILITY[type]?.has(result.detectedType)) {
                throw new Error(
                    `El tipo Mermaid ${result.detectedType} no corresponde a ${type}: ${path}`,
                );
            }
            const sourceHash = sha256Hex(sourceBytes || encoder.encode(source));
            return {
                detectedType: result.detectedType,
                sourceHash,
                svg: sanitizeSvg(result.svg, sourceHash, path),
            };
        },
        close: () => browser.close(),
    };
}

async function launchBrowser() {
    const attempts = [
        ['Chromium de Playwright', { headless: true }],
        ['Google Chrome', { channel: 'chrome', headless: true }],
        ['Microsoft Edge', { channel: 'msedge', headless: true }],
    ];
    const errors = [];
    for (const [name, options] of attempts) {
        try {
            return await chromium.launch(options);
        } catch (error) {
            errors.push(`${name}: ${error.message.split('\n')[0]}`);
        }
    }
    throw new Error(
        `No se pudo iniciar un navegador para compilar Mermaid. Instala Chromium con "npx playwright install chromium". ${errors.join(' | ')}`,
    );
}

export async function compileMermaidDiagrams(deck, files) {
    const slides = deck.slides.filter((slide) => slide.diagram);
    if (slides.length === 0) return { deck, files, compiled: 0 };

    files.set(
        'diagrams/config.json',
        encoder.encode(
            `${JSON.stringify(
                {
                    engine: 'mermaid',
                    engineVersion: MERMAID_VERSION,
                    template: 'academic-sober',
                    config: MERMAID_CONFIG,
                },
                null,
                4,
            )}\n`,
        ),
    );

    const renderer = await createMermaidRenderer(deck.viewport);

    try {
        for (const [index, slide] of slides.entries()) {
            await compileSlide(renderer, slide, files, index);
        }
    } finally {
        await renderer.close();
    }

    files.set(
        'deck.json',
        encoder.encode(`${JSON.stringify(deck, null, 4)}\n`),
    );
    return { deck, files, compiled: slides.length };
}

async function compileSlide(renderer, slide, files, index) {
    const diagram = slide.diagram;
    const sourceBytes = files.get(diagram.source);
    if (!sourceBytes)
        throw new Error(`Falta la fuente Mermaid: ${diagram.source}`);
    const source = decoder.decode(sourceBytes);

    const renderId = `diagram-${String(index + 1).padStart(3, '0')}-${slide.id}`;
    const { sourceHash, svg } = await renderer.render({
        source,
        sourceBytes,
        type: diagram.type,
        renderId,
        path: diagram.source,
    });
    const htmlBytes = files.get(slide.source);
    if (!htmlBytes) throw new Error(`Falta la diapositiva: ${slide.source}`);
    const html = decoder.decode(htmlBytes);
    const compiledHtml = insertSvg(html, svg, slide, sourceHash);

    diagram.engine = 'mermaid';
    diagram.engineVersion = MERMAID_VERSION;
    diagram.sourceHash = sourceHash;
    files.set(slide.source, encoder.encode(compiledHtml));
}

export function validateMermaidDefinition(source, type, path = 'diagram.mmd') {
    assertSafeMermaidSource(source, path);
    assertEditorialLimits(source, type, path);
}

function assertSafeMermaidSource(source, path) {
    if (
        !/^\s*(?:%%[^\n]*\n\s*)*(?:flowchart|graph|sequenceDiagram|stateDiagram-v2)\b/m.test(
            source,
        )
    ) {
        throw new Error(`Tipo Mermaid no permitido: ${path}`);
    }
    if (!/^\s*accTitle\s*:\s*\S.+$/m.test(source)) {
        throw new Error(`Mermaid requiere accTitle: ${path}`);
    }
    if (!/^\s*accDescr(?:\s*:|\s*\{)/m.test(source)) {
        throw new Error(`Mermaid requiere accDescr: ${path}`);
    }
    const forbidden = [
        /%%\s*\{\s*init\s*:/i,
        /^\s*click\s+/im,
        /\b(?:href|javascript:)\b/i,
        /<\/?(?:script|iframe|object|embed|form|img|a)\b/i,
        /^\s*(?:style|classDef)\s+/im,
    ];
    if (forbidden.some((pattern) => pattern.test(source))) {
        throw new Error(
            `La fuente Mermaid contiene configuracion no permitida: ${path}`,
        );
    }
}

function assertEditorialLimits(source, type, path) {
    if (type === 'sequence') {
        const participants = new Set();
        for (const match of source.matchAll(
            /^\s*(?:participant|actor)\s+([a-zA-Z][\w-]*)/gm,
        )) {
            participants.add(match[1]);
        }
        const messages = [
            ...source.matchAll(
                /^\s*([a-zA-Z][\w-]*?)\s*(?:-->>|->>|-->|->|--x|-x|--\)|-\))\s*([a-zA-Z][\w-]*)\s*:/gm,
            ),
        ];
        for (const [, from, to] of messages) {
            participants.add(from);
            participants.add(to);
        }
        if (
            participants.size < 2 ||
            participants.size > 6 ||
            messages.length < 3 ||
            messages.length > 10
        ) {
            throw new Error(
                `sequence requiere de 2 a 6 participantes y de 3 a 10 mensajes: ${path}`,
            );
        }
        return;
    }

    const edges = directedEdges(source);
    const nodes = new Set(edges.flat());
    if (type === 'lifecycle') {
        const transitions = stateTransitions(source);
        const states = new Set(
            transitions.flat().filter((state) => state !== '[*]'),
        );
        if (states.size < 3 || states.size > 7) {
            throw new Error(`lifecycle requiere de 3 a 7 estados: ${path}`);
        }
        const hasTerminal = transitions.some(([, to]) => to === '[*]');
        const outgoing = new Map([...states].map((node) => [node, new Set()]));
        for (const [from, to] of transitions) {
            if (outgoing.has(from) && to !== '[*]') outgoing.get(from).add(to);
        }
        const hasAlternative = [...outgoing.values()].some(
            (destinations) => destinations.size > 1,
        );
        const hasCycle = graphHasCycle(outgoing);
        if (!hasTerminal || (!hasAlternative && !hasCycle)) {
            throw new Error(
                `lifecycle requiere un estado terminal y un ciclo o alternativa: ${path}`,
            );
        }
        return;
    }
    const minimum = type === 'workflow' ? 4 : 3;
    if (nodes.size < minimum || nodes.size > 7) {
        throw new Error(`${type} requiere de ${minimum} a 7 nodos: ${path}`);
    }
    if (type === 'workflow') {
        const decisionIds = [...source.matchAll(/\b([a-zA-Z][\w-]*)\s*\{/g)]
            .map((match) => match[1])
            .filter((id) => id !== 'accDescr');
        if (decisionIds.length < 1 || decisionIds.length > 2) {
            throw new Error(`workflow requiere una o dos decisiones: ${path}`);
        }
        if (
            decisionIds.some(
                (id) =>
                    new Set(
                        edges
                            .filter(([from]) => from === id)
                            .map(([, to]) => to),
                    ).size < 2,
            )
        ) {
            throw new Error(
                `Cada decision de workflow requiere dos destinos: ${path}`,
            );
        }
    }
    if (type === 'architecture') {
        const boundaries = (source.match(/^\s*subgraph\b/gim) || []).length;
        if (boundaries > 2) {
            throw new Error(`architecture admite hasta dos limites: ${path}`);
        }
    }
    if (type === 'data-flow') {
        const stages = nodes.size;
        if (stages < 3 || stages > 5) {
            throw new Error(`data-flow requiere de 3 a 5 etapas: ${path}`);
        }
    }
    if (type === 'hierarchy') {
        const incoming = new Map([...nodes].map((node) => [node, 0]));
        for (const [, to] of edges) incoming.set(to, incoming.get(to) + 1);
        const roots = [...incoming.values()].filter((count) => count === 0);
        if (
            edges.length !== nodes.size - 1 ||
            roots.length !== 1 ||
            [...incoming.values()].some((count) => count > 1)
        ) {
            throw new Error(
                `hierarchy requiere una raiz y un padre por nodo: ${path}`,
            );
        }
    }
    if (type === 'relationship-map') {
        const degree = new Map([...nodes].map((node) => [node, 0]));
        for (const [from, to] of edges) {
            degree.set(from, degree.get(from) + 1);
            degree.set(to, degree.get(to) + 1);
        }
        const centers = [...degree.values()].filter(
            (count) => count === nodes.size - 1,
        );
        if (edges.length !== nodes.size - 1 || centers.length !== 1) {
            throw new Error(
                `relationship-map requiere un centro conectado con cada nodo: ${path}`,
            );
        }
    }
}

function graphHasCycle(outgoing) {
    const visiting = new Set();
    const visited = new Set();
    const visit = (node) => {
        if (visiting.has(node)) return true;
        if (visited.has(node)) return false;
        visiting.add(node);
        for (const destination of outgoing.get(node) || []) {
            if (visit(destination)) return true;
        }
        visiting.delete(node);
        visited.add(node);
        return false;
    };
    return [...outgoing.keys()].some(visit);
}

function directedEdges(source) {
    const edges = [];
    const lines = source.split(/\r?\n/);
    for (const line of lines) {
        if (!/(?:-->|---|-.->|==>|--x|--o)/.test(line)) continue;
        const withoutLabels = line.replace(/\|[^|]*\|/g, ' ');
        const ids = withoutLabels
            .split(/(?:-->|---|-.->|==>|--x|--o)/)
            .map((segment) => segment.trim().match(/^([a-zA-Z][\w-]*)/)?.[1])
            .filter(Boolean);
        for (let index = 0; index < ids.length - 1; index += 1) {
            edges.push([ids[index], ids[index + 1]]);
        }
    }
    return edges;
}

function stateTransitions(source) {
    return [
        ...source.matchAll(
            /^\s*(\[\*\]|[a-zA-Z][\w-]*)\s*-->\s*(\[\*\]|[a-zA-Z][\w-]*)/gm,
        ),
    ].map(([, from, to]) => [from, to]);
}

function sanitizeSvg(svg, sourceHash, path) {
    const forbiddenElements =
        /<(?:script|foreignObject|iframe|object|embed|form|a)\b/i;
    const forbiddenAttributes = /\s(?:on[a-z]+|href|xlink:href)\s*=\s*["']/i;
    const externalUrls = /url\(\s*["']?(?:https?:|data:|\/\/)/i;
    if (
        forbiddenElements.test(svg) ||
        forbiddenAttributes.test(svg) ||
        externalUrls.test(svg)
    ) {
        throw new Error(`Mermaid genero SVG no seguro: ${path}`);
    }
    if (!/^\s*<svg\b/i.test(svg)) {
        throw new Error(`Mermaid no genero un SVG valido: ${path}`);
    }
    return svg.replace(/^\s*<svg\b([^>]*)>/i, (_, attributes) => {
        const cleanAttributes = attributes.replace(
            /\s(?:data-diagram-static|data-engine|data-source-hash|role|preserveAspectRatio)\s*=\s*(?:["'][^"']*["']|[^\s>]+)/gi,
            '',
        );
        return `<svg data-diagram-static data-engine="mermaid" data-source-hash="${sourceHash}" role="img" preserveAspectRatio="xMidYMid meet"${cleanAttributes}>`;
    });
}

function insertSvg(html, svg, slide, sourceHash) {
    const figures = html.match(
        /<figure\b[^>]*\bdata-diagram(?:\s|=|>)[\s\S]*?<\/figure\s*>/gi,
    );
    if (!figures || figures.length !== 1) {
        throw new Error(
            `La diapositiva requiere un solo figure data-diagram: ${slide.source}`,
        );
    }
    let figure = figures[0];
    if (!/data-diagram-engine\s*=\s*["']mermaid["']/i.test(figure)) {
        throw new Error(`Falta data-diagram-engine="mermaid": ${slide.source}`);
    }
    const typeMatch = figure.match(/data-diagram-type\s*=\s*["']([^"']+)["']/i);
    if (typeMatch?.[1] !== slide.diagram.type) {
        throw new Error(
            `data-diagram-type no coincide con deck.json: ${slide.source}`,
        );
    }
    const output =
        /<div\b[^>]*\bdata-diagram-output(?:\s|=|>)[^>]*>[\s\S]*?<\/div\s*>/i;
    if (!output.test(figure)) {
        throw new Error(`Falta data-diagram-output: ${slide.source}`);
    }
    figure = figure.replace(
        output,
        `<div data-diagram-output data-source-hash="${sourceHash}">${svg}</div>`,
    );
    return html.replace(figures[0], figure);
}

function sha256Hex(bytes) {
    return createHash('sha256').update(bytes).digest('hex');
}
