import { describe, expect, it } from 'vitest';
import { validateAuthoringPolicy } from './deck-authoring-validator.mjs';

const placeholder = new Uint8Array([1, 2, 3]);
const baseFiles = new Map([
    ['slides/001/index.html', new Uint8Array()],
]);

describe('validateAuthoringPolicy', () => {
    it('rejects emoji content in authored files', () => {
        const files = new Map([
            ['slides/001/index.html', new TextEncoder().encode('<h1>Hola 🎓</h1>')],
        ]);

        expect(() => validateAuthoringPolicy(files, placeholder)).toThrow(
            'Los emojis no estan permitidos',
        );
    });

    it('rejects missing local references', () => {
        const files = new Map([
            ['slides/001/index.html', new TextEncoder().encode('<img src="missing.png">')],
        ]);

        expect(() => validateAuthoringPolicy(files, placeholder)).toThrow(
            'Recurso local inexistente',
        );
    });

    it('requires the canonical pending-resource feedback', () => {
        const files = new Map([
            ...baseFiles,
            ['assets/placeholders/image-broken.svg', placeholder],
        ]);
        files.set(
            'slides/001/index.html',
            new TextEncoder().encode(
                '<figure data-resource-status="pending"><img src="../../assets/placeholders/image-broken.svg" alt="Imagen pendiente"></figure>',
            ),
        );

        expect(() => validateAuthoringPolicy(files, placeholder)).toThrow(
            'feedback visible',
        );
    });

    it('accepts a complete pending-resource marker', () => {
        const files = new Map([
            ...baseFiles,
            ['assets/placeholders/image-broken.svg', placeholder],
        ]);
        files.set(
            'slides/001/index.html',
            new TextEncoder().encode(
                '<figure data-resource-status="pending"><img src="../../assets/placeholders/image-broken.svg" alt="Imagen pendiente"><figcaption>Recurso pendiente: imagen institucional</figcaption></figure>',
            ),
        );

        expect(() => validateAuthoringPolicy(files, placeholder)).not.toThrow();
    });

    it('accepts two ordered academic-sober thematic units', () => {
        const files = authoredHtml(`
            <body data-template="academic-sober" data-slide-structure="pillars">
                <article data-thematic-unit>
                    <h2 data-unit-topic>Acceso</h2>
                    <span class="deck-icon" aria-hidden="true"></span>
                    <p data-unit-description>Elimina una barrera concreta.</p>
                </article>
                <article data-thematic-unit>
                    <h2 data-unit-topic>Continuidad</h2>
                    <span class="deck-icon" aria-hidden="true"></span>
                    <p data-unit-description>Mantiene disponible el proceso.</p>
                </article>
            </body>
        `);

        expect(() => validateAuthoringPolicy(files, placeholder)).not.toThrow();
    });

    it('rejects more than four academic-sober thematic units', () => {
        const unit = '<article data-thematic-unit><h2 data-unit-topic>Tema</h2><p data-unit-description>Guia breve.</p></article>';
        const files = authoredHtml(
            `<body data-template="academic-sober" data-slide-structure="pillars">${unit.repeat(5)}</body>`,
        );

        expect(() => validateAuthoringPolicy(files, placeholder)).toThrow(
            'requiere de 2 a 4 unidades tematicas',
        );
    });

    it('rejects inconsistent thematic icons', () => {
        const files = authoredHtml(`
            <body data-template="academic-sober" data-slide-structure="pillars">
                <article data-thematic-unit><h2 data-unit-topic>Uno</h2><span class="deck-icon"></span><p data-unit-description>Guia uno.</p></article>
                <article data-thematic-unit><h2 data-unit-topic>Dos</h2><p data-unit-description>Guia dos.</p></article>
            </body>
        `);

        expect(() => validateAuthoringPolicy(files, placeholder)).toThrow(
            'un icono cada una o ninguno',
        );
    });

    it('rejects thematic descriptions longer than 24 words', () => {
        const longDescription = Array.from({ length: 25 }, () => 'palabra').join(' ');
        const files = authoredHtml(`
            <body data-template="academic-sober" data-slide-structure="pillars">
                <article data-thematic-unit><h2 data-unit-topic>Uno</h2><p data-unit-description>${longDescription}</p></article>
                <article data-thematic-unit><h2 data-unit-topic>Dos</h2><p data-unit-description>Guia breve.</p></article>
            </body>
        `);

        expect(() => validateAuthoringPolicy(files, placeholder)).toThrow(
            'descripcion supera 24 palabras',
        );
    });

    it('accepts an accessible academic-sober system diagram', () => {
        const files = authoredHtml(`
            <body data-template="academic-sober" data-slide-structure="system-diagram">
                <h1 id="diagram-title">Resultado trazable</h1>
                <figure data-diagram data-reading-direction="left-to-right" aria-labelledby="diagram-title" aria-describedby="diagram-description">
                    <svg data-diagram-connectors aria-hidden="true"></svg>
                    <div data-diagram-node>Entrada</div>
                    <div data-diagram-node>Proceso</div>
                    <div data-diagram-node>Salida</div>
                    <figcaption id="diagram-description">La entrada pasa al proceso y produce la salida.</figcaption>
                </figure>
            </body>
        `);

        expect(() => validateAuthoringPolicy(files, placeholder)).not.toThrow();
    });

    it('rejects a system diagram without a reading direction', () => {
        const files = authoredHtml(`
            <body data-template="academic-sober" data-slide-structure="system-diagram">
                <h1 id="diagram-title">Resultado trazable</h1>
                <figure data-diagram aria-labelledby="diagram-title" aria-describedby="diagram-description">
                    <svg data-diagram-connectors></svg>
                    <div data-diagram-node>Entrada</div>
                    <div data-diagram-node>Proceso</div>
                    <div data-diagram-node>Salida</div>
                    <figcaption id="diagram-description">Descripcion.</figcaption>
                </figure>
            </body>
        `);

        expect(() => validateAuthoringPolicy(files, placeholder)).toThrow(
            'Direccion de lectura invalida o ausente',
        );
    });
});

function authoredHtml(source) {
    return new Map([
        ['slides/001/index.html', new TextEncoder().encode(source)],
    ]);
}
