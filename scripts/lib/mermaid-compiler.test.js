import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
    MERMAID_CONFIG,
    MERMAID_VERSION,
    validateMermaidDefinition,
} from './mermaid-compiler.mjs';

describe('Mermaid compiler policy', () => {
    it('uses a fixed safe rendering configuration', () => {
        expect(MERMAID_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
        expect(MERMAID_CONFIG).toMatchObject({
            startOnLoad: false,
            securityLevel: 'strict',
            htmlLabels: false,
        });
        expect(MERMAID_CONFIG.themeCSS).toContain('opacity: 1 !important');
        expect(MERMAID_CONFIG.themeCSS).toContain('fill-opacity: 0.95');
        expect(MERMAID_CONFIG.themeCSS).toContain('.labelBkg');
    });

    it('accepts a bounded workflow with one decision', () => {
        const source = `flowchart LR
    accTitle: Revision
    accDescr: La entrada se revisa antes de publicarse
    input[Entrada] --> review{Valida}
    review -->|Si| result[Resultado]
    review -->|No| correction[Correccion]
    correction --> review
`;

        expect(() =>
            validateMermaidDefinition(source, 'workflow'),
        ).not.toThrow();
    });

    it('rejects embedded Mermaid configuration', () => {
        const source = `%%{init: {"theme": "dark"}}%%
flowchart LR
    accTitle: Revision
    accDescr: Flujo de revision
    A --> B
    B --> C
`;

        expect(() => validateMermaidDefinition(source, 'architecture')).toThrow(
            'configuracion no permitida',
        );
    });

    it('enforces the sequence participant and message limits', () => {
        const source = `sequenceDiagram
    accTitle: Saludo
    accDescr: Dos participantes intercambian pocos mensajes
    A->>B: Uno
    B->>A: Dos
`;

        expect(() => validateMermaidDefinition(source, 'sequence')).toThrow(
            '3 a 10 mensajes',
        );
    });

    it.each([
        ['architecture', 'architecture.mmd'],
        ['workflow', 'workflow.mmd'],
        ['sequence', 'sequence.mmd'],
        ['data-flow', 'data-flow.mmd'],
        ['lifecycle', 'lifecycle.mmd'],
        ['hierarchy', 'hierarchy.mmd'],
        ['relationship-map', 'relationship-map.mmd'],
    ])('validates the catalog %s source', (type, filename) => {
        const source = readFileSync(
            new URL(
                `../../catalog/academic-sober/diagrams/${filename}`,
                import.meta.url,
            ),
            'utf8',
        );

        expect(() =>
            validateMermaidDefinition(source, type, filename),
        ).not.toThrow();
    });
});
