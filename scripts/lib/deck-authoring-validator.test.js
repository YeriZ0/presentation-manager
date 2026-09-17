import { describe, expect, it } from 'vitest';
import { validateAuthoringPolicy } from './deck-authoring-validator.mjs';

const placeholder = new Uint8Array([1, 2, 3]);
const baseFiles = new Map([['slides/001/index.html', new Uint8Array()]]);

describe('validateAuthoringPolicy', () => {
    it('rejects emoji content in authored files', () => {
        const files = authoredHtml('<h1>Hola 🎓</h1>');

        expect(() => validateAuthoringPolicy(files, placeholder)).toThrow(
            'Los emojis no estan permitidos',
        );
    });

    it('rejects missing local references', () => {
        const files = authoredHtml('<img src="missing.png">');

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
        const files = academicSlide(
            'pillars',
            `
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
            `,
        );

        expect(() => validateAuthoringPolicy(files, placeholder)).not.toThrow();
    });

    it('rejects more than four academic-sober thematic units', () => {
        const unit =
            '<article data-thematic-unit><h2 data-unit-topic>Tema</h2><p data-unit-description>Guia breve.</p></article>';
        const files = academicSlide('pillars', unit.repeat(5));

        expect(() => validateAuthoringPolicy(files, placeholder)).toThrow(
            'requiere de 2 a 4 unidades tematicas',
        );
    });

    it('rejects inconsistent thematic icons', () => {
        const files = academicSlide(
            'pillars',
            `
                <article data-thematic-unit><h2 data-unit-topic>Uno</h2><span class="deck-icon"></span><p data-unit-description>Guia uno.</p></article>
                <article data-thematic-unit><h2 data-unit-topic>Dos</h2><p data-unit-description>Guia dos.</p></article>
            `,
        );

        expect(() => validateAuthoringPolicy(files, placeholder)).toThrow(
            'un icono cada una o ninguno',
        );
    });

    it('rejects thematic descriptions longer than 24 words', () => {
        const longDescription = Array.from(
            { length: 25 },
            () => 'palabra',
        ).join(' ');
        const files = academicSlide(
            'pillars',
            `
                <article data-thematic-unit><h2 data-unit-topic>Uno</h2><p data-unit-description>${longDescription}</p></article>
                <article data-thematic-unit><h2 data-unit-topic>Dos</h2><p data-unit-description>Guia breve.</p></article>
            `,
        );

        expect(() => validateAuthoringPolicy(files, placeholder)).toThrow(
            'descripcion supera 24 palabras',
        );
    });

    it('accepts an accessible academic-sober system diagram', () => {
        const files = academicSlide(
            'system-diagram',
            `
                <h1 id="diagram-title">Resultado trazable</h1>
                <figure data-diagram data-reading-direction="left-to-right" aria-labelledby="diagram-title" aria-describedby="diagram-description">
                    <svg data-diagram-connectors aria-hidden="true"></svg>
                    <div data-diagram-node>Entrada</div>
                    <div data-diagram-node>Proceso</div>
                    <div data-diagram-node>Salida</div>
                    <figcaption id="diagram-description">La entrada pasa al proceso y produce la salida.</figcaption>
                </figure>
            `,
        );

        expect(() => validateAuthoringPolicy(files, placeholder)).not.toThrow();
    });

    it('rejects a system diagram without a reading direction', () => {
        const files = academicSlide(
            'system-diagram',
            `
                <h1 id="diagram-title">Resultado trazable</h1>
                <figure data-diagram aria-labelledby="diagram-title" aria-describedby="diagram-description">
                    <svg data-diagram-connectors></svg>
                    <div data-diagram-node>Entrada</div>
                    <div data-diagram-node>Proceso</div>
                    <div data-diagram-node>Salida</div>
                    <figcaption id="diagram-description">Descripcion.</figcaption>
                </figure>
            `,
        );

        expect(() => validateAuthoringPolicy(files, placeholder)).toThrow(
            'Direccion de lectura invalida o ausente',
        );
    });

    it('rejects an unknown academic-sober structure', () => {
        const files = authoredHtml(
            '<body data-template="academic-sober" data-slide-structure="unknown"></body>',
        );

        expect(() => validateAuthoringPolicy(files, placeholder)).toThrow(
            'Estructura academic-sober desconocida',
        );
    });

    it('requires a centered academic-sober body', () => {
        const files = authoredHtml(`
            <body data-template="academic-sober" data-slide-structure="pillars">
                <main data-slide-body data-vertical-align="start"></main>
            </body>
        `);

        expect(() => validateAuthoringPolicy(files, placeholder)).toThrow(
            'debe estar centrado',
        );
    });

    it('accepts an open comparison with central text', () => {
        const files = academicSlide(
            'comparison',
            `
                <section data-comparison>
                    <article data-comparison-option><h2 data-unit-topic>Local</h2><span class="deck-icon"></span><p data-unit-description>Conserva el control operativo.</p></article>
                    <span data-comparison-connector>Frente a</span>
                    <article data-comparison-option><h2 data-unit-topic>Hibrido</h2><span class="deck-icon"></span><p data-unit-description>Equilibra control y escala.</p></article>
                </section>
            `,
        );

        expect(() => validateAuthoringPolicy(files, placeholder)).not.toThrow();
    });

    it('rejects a comparison without central text', () => {
        const files = academicSlide(
            'comparison',
            `
                <section data-comparison>
                    <article data-comparison-option><h2 data-unit-topic>Local</h2><p data-unit-description>Control operativo.</p></article>
                    <article data-comparison-option><h2 data-unit-topic>Hibrido</h2><p data-unit-description>Control y escala.</p></article>
                </section>
            `,
        );

        expect(() => validateAuthoringPolicy(files, placeholder)).toThrow(
            'texto central',
        );
    });

    it('accepts an ordered process with Phosphor arrows', () => {
        const step = (number) =>
            `<li data-process-step><span data-step-number>${number}</span><h2 data-step-title>Paso ${number}</h2><span class="deck-icon"></span><p data-step-description>Descripcion breve.</p></li>`;
        const files = academicSlide(
            'process',
            `
                <section data-process>
                    <div data-process-connectors>
                        <span class="deck-icon deck-icon--arrow-fat-right" data-process-arrow="arrow-fat-right"></span>
                        <span class="deck-icon deck-icon--arrow-fat-right" data-process-arrow="arrow-fat-right"></span>
                    </div>
                    <ol>${step(1)}${step(2)}${step(3)}</ol>
                </section>
            `,
        );

        expect(() => validateAuthoringPolicy(files, placeholder)).not.toThrow();
    });

    it('accepts narrative copy with open elements', () => {
        const files = academicSlide(
            'narrative-elements',
            `
                <section data-narrative>
                    <div data-narrative-copy><p>La lectura explica el contexto.</p></div>
                    <div data-narrative-elements>
                        <article data-narrative-element><h2 data-element-topic>Calidad</h2><span class="deck-icon"></span><p data-element-description>Conserva una fuente identificable.</p></article>
                        <article data-narrative-element><h2 data-element-topic>Tiempo</h2><span class="deck-icon"></span><p data-element-description>Compara un periodo equivalente.</p></article>
                    </div>
                </section>
            `,
        );

        expect(() => validateAuthoringPolicy(files, placeholder)).not.toThrow();
    });

    it('rejects donut values that do not total 100', () => {
        const files = academicSlide(
            'chart',
            `
                <figure data-chart-type="donut">
                    <svg>
                        <path data-chart-segment="one" data-value="50"></path>
                        <path data-chart-segment="two" data-value="30"></path>
                        <path data-chart-segment="three" data-value="10"></path>
                    </svg>
                    <span data-chart-legend="one">Uno</span>
                    <span data-chart-legend="two">Dos</span>
                    <span data-chart-legend="three">Tres</span>
                </figure>
            `,
        );

        expect(() => validateAuthoringPolicy(files, placeholder)).toThrow(
            'deben sumar 100',
        );
    });

    it('accepts a donut with synchronized segments and legend', () => {
        const files = academicSlide(
            'chart',
            `
                <figure data-chart-type="donut">
                    <svg>
                        <path data-chart-segment="one" data-value="50"></path>
                        <path data-chart-segment="two" data-value="30"></path>
                        <path data-chart-segment="three" data-value="20"></path>
                    </svg>
                    <span data-chart-legend="one">Uno</span>
                    <span data-chart-legend="two">Dos</span>
                    <span data-chart-legend="three">Tres</span>
                </figure>
            `,
        );

        expect(() => validateAuthoringPolicy(files, placeholder)).not.toThrow();
    });

    it('accepts code with visible lines and an associated focus', () => {
        const regularLines =
            '<span data-code-line><i data-code-token="keyword">const</i> <i data-code-token="variable">value</i> <i data-code-token="number">1</i></span>'.repeat(
                11,
            );
        const files = academicSlide(
            'code',
            `
                <pre><code>${regularLines}<span data-code-line data-code-focus aria-describedby="code-note">return value;</span></code></pre>
                <aside id="code-note" data-code-note>Devuelve el resultado.</aside>
            `,
        );

        expect(() => validateAuthoringPolicy(files, placeholder)).not.toThrow();
    });

    it('rejects code focus without an associated note', () => {
        const regularLines =
            '<span data-code-line><i data-code-token="keyword">const</i> <i data-code-token="variable">value</i> <i data-code-token="number">1</i></span>'.repeat(
                11,
            );
        const files = academicSlide(
            'code',
            `<pre><code>${regularLines}<span data-code-line data-code-focus>return value;</span></code></pre>`,
        );

        expect(() => validateAuthoringPolicy(files, placeholder)).toThrow(
            'asociado con una anotación',
        );
    });
});

function academicSlide(structure, content) {
    return authoredHtml(`
        <body data-template="academic-sober" data-slide-structure="${structure}">
            <main data-slide-body data-vertical-align="center">${content}</main>
        </body>
    `);
}

function authoredHtml(source) {
    return new Map([
        ['slides/001/index.html', new TextEncoder().encode(source)],
    ]);
}
