import { describe, expect, it } from 'vitest';
import { validateAuthoringPolicy } from './deck-authoring-validator.mjs';
import { donutFixture } from './test-fixtures/donut.mjs';
import { codeFixture } from './test-fixtures/code.mjs';

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
            'Dirección de lectura inválida o ausente',
        );
    });

    it.each([
        [
            'architecture',
            'left-to-right',
            ['a', 'b', 'c'],
            [
                ['ab', 'a', 'b'],
                ['bc', 'b', 'c'],
            ],
            {},
        ],
        [
            'workflow',
            'left-to-right',
            ['a', 'b', 'c', 'd'],
            [
                ['ab', 'a', 'b'],
                ['bc', 'b', 'c'],
                ['cd', 'c', 'd'],
                ['cb', 'c', 'b'],
            ],
            { nodeMarkers: { c: 'data-diagram-decision' } },
        ],
        [
            'sequence',
            'top-to-bottom',
            ['caller', 'service'],
            [
                ['request', 'caller', 'service'],
                ['response', 'service', 'caller'],
                ['confirm', 'caller', 'service'],
            ],
            {
                allNodeMarker: 'data-diagram-participant',
                allEdgeMarker: 'data-diagram-message',
            },
        ],
        [
            'data-flow',
            'left-to-right',
            ['source', 'process', 'store'],
            [
                ['raw', 'source', 'process'],
                ['clean', 'process', 'store'],
            ],
            {
                extra: '<span data-diagram-stage>Etapa</span>'.repeat(3),
                labelAll: true,
            },
        ],
        [
            'lifecycle',
            'left-to-right',
            ['draft', 'review', 'done'],
            [
                ['submit', 'draft', 'review'],
                ['approve', 'review', 'done'],
                ['revise', 'review', 'draft'],
            ],
            { allNodeMarker: 'data-diagram-state', labelAll: true },
        ],
        [
            'hierarchy',
            'top-to-bottom',
            ['root', 'left', 'right'],
            [
                ['root-left', 'root', 'left'],
                ['root-right', 'root', 'right'],
            ],
            { nodeMarkers: { root: 'data-diagram-root' } },
        ],
        [
            'relationship-map',
            'radial',
            ['center', 'one', 'two'],
            [
                ['center-one', 'center', 'one'],
                ['center-two', 'center', 'two'],
            ],
            { nodeMarkers: { center: 'data-diagram-center' } },
        ],
    ])(
        'accepts a typed %s diagram',
        (type, direction, nodes, edges, options) => {
            const files = academicSlide(
                'system-diagram',
                typedDiagram(type, direction, nodes, edges, options),
            );

            expect(() =>
                validateAuthoringPolicy(files, placeholder),
            ).not.toThrow();
        },
    );

    it('rejects an unknown diagram type', () => {
        const files = academicSlide(
            'system-diagram',
            typedDiagram(
                'network',
                'left-to-right',
                ['a', 'b', 'c'],
                [
                    ['ab', 'a', 'b'],
                    ['bc', 'b', 'c'],
                ],
            ),
        );

        expect(() => validateAuthoringPolicy(files, placeholder)).toThrow(
            'Tipo de diagrama desconocido',
        );
    });

    it('rejects an incompatible typed-diagram direction', () => {
        const files = academicSlide(
            'system-diagram',
            typedDiagram(
                'hierarchy',
                'radial',
                ['root', 'left', 'right'],
                [
                    ['root-left', 'root', 'left'],
                    ['root-right', 'root', 'right'],
                ],
                { nodeMarkers: { root: 'data-diagram-root' } },
            ),
        );

        expect(() => validateAuthoringPolicy(files, placeholder)).toThrow(
            'incompatible con hierarchy',
        );
    });

    it('rejects a typed relationship with an unknown endpoint', () => {
        const files = academicSlide(
            'system-diagram',
            typedDiagram(
                'architecture',
                'left-to-right',
                ['a', 'b', 'c'],
                [
                    ['ab', 'a', 'b'],
                    ['missing', 'b', 'unknown'],
                ],
            ),
        );

        expect(() => validateAuthoringPolicy(files, placeholder)).toThrow(
            'referencia nodos inválidos',
        );
    });

    it('rejects isolated nodes in a typed diagram', () => {
        const files = academicSlide(
            'system-diagram',
            typedDiagram(
                'architecture',
                'left-to-right',
                ['a', 'b', 'isolated'],
                [['ab', 'a', 'b']],
            ),
        );

        expect(() => validateAuthoringPolicy(files, placeholder)).toThrow(
            'contiene nodos aislados',
        );
    });

    it('requires labels for every data-flow relationship', () => {
        const files = academicSlide(
            'system-diagram',
            typedDiagram(
                'data-flow',
                'left-to-right',
                ['source', 'process', 'store'],
                [
                    ['raw', 'source', 'process'],
                    ['clean', 'process', 'store'],
                ],
                {
                    extra: '<span data-diagram-stage>Etapa</span>'.repeat(3),
                    labelAll: false,
                },
            ),
        );

        expect(() => validateAuthoringPolicy(files, placeholder)).toThrow(
            'requiere una etiqueta HTML por relación',
        );
    });

    it('rejects data-flow stages without visible text', () => {
        const files = academicSlide(
            'system-diagram',
            typedDiagram(
                'data-flow',
                'left-to-right',
                ['source', 'process', 'store'],
                [
                    ['raw', 'source', 'process'],
                    ['clean', 'process', 'store'],
                ],
                { extra: '<span data-diagram-stage></span>'.repeat(3) },
            ),
        );

        expect(() => validateAuthoringPolicy(files, placeholder)).toThrow(
            'etapas con texto visible',
        );
    });

    it('rejects a workflow with fewer than four nodes', () => {
        const files = academicSlide(
            'system-diagram',
            typedDiagram(
                'workflow',
                'left-to-right',
                ['start', 'decision', 'done'],
                [
                    ['review', 'start', 'decision'],
                    ['approve', 'decision', 'done'],
                ],
                { nodeMarkers: { decision: 'data-diagram-decision' } },
            ),
        );

        expect(() => validateAuthoringPolicy(files, placeholder)).toThrow(
            'workflow requiere de 4 a 7 nodos',
        );
    });

    it('rejects a workflow decision with only one destination', () => {
        const files = academicSlide(
            'system-diagram',
            typedDiagram(
                'workflow',
                'left-to-right',
                ['start', 'review', 'decision', 'done'],
                [
                    ['submit', 'start', 'review'],
                    ['evaluate', 'review', 'decision'],
                    ['approve', 'decision', 'done'],
                ],
                { nodeMarkers: { decision: 'data-diagram-decision' } },
            ),
        );

        expect(() => validateAuthoringPolicy(files, placeholder)).toThrow(
            'decisión de workflow necesita dos destinos',
        );
    });

    it('rejects an empty diagram relationship label', () => {
        const files = academicSlide(
            'system-diagram',
            typedDiagram(
                'architecture',
                'left-to-right',
                ['a', 'b', 'c'],
                [
                    ['ab', 'a', 'b'],
                    ['bc', 'b', 'c'],
                ],
            ).replace('>ab</span>', '></span>'),
        );

        expect(() => validateAuthoringPolicy(files, placeholder)).toThrow(
            'etiqueta HTML visible',
        );
    });

    it('rejects an oversized diagram arrowhead', () => {
        const diagram = typedDiagram(
            'architecture',
            'left-to-right',
            ['a', 'b', 'c'],
            [
                ['ab', 'a', 'b'],
                ['bc', 'b', 'c'],
            ],
        ).replace(
            '<svg data-diagram-connectors aria-hidden="true">',
            '<svg data-diagram-connectors aria-hidden="true"><defs><marker markerWidth="12" markerHeight="12" refX="10"></marker></defs>',
        );
        const files = academicSlide('system-diagram', diagram);

        expect(() => validateAuthoringPolicy(files, placeholder)).toThrow(
            'puntas de flecha deben ser compactas',
        );
    });

    it('rejects nodes and edges declared outside the diagram', () => {
        const diagram = typedDiagram(
            'architecture',
            'left-to-right',
            ['a', 'b', 'c'],
            [
                ['ab', 'a', 'b'],
                ['bc', 'b', 'c'],
            ],
        )
            .replace('<article data-diagram-node="c"', '<article data-node="c"')
            .replace(
                '<path data-diagram-edge="bc" data-from="b" data-to="c" ></path>',
                '',
            );
        const files = academicSlide(
            'system-diagram',
            `${diagram}<article data-diagram-node="c"></article><svg><path data-diagram-edge="bc" data-from="b" data-to="c"></path></svg>`,
        );

        expect(() => validateAuthoringPolicy(files, placeholder)).toThrow(
            'Hay nodos fuera del diagrama',
        );
    });

    it('rejects a linear lifecycle without a cycle or alternative', () => {
        const files = academicSlide(
            'system-diagram',
            typedDiagram(
                'lifecycle',
                'left-to-right',
                ['draft', 'review', 'done'],
                [
                    ['submit', 'draft', 'review'],
                    ['approve', 'review', 'done'],
                ],
                { allNodeMarker: 'data-diagram-state' },
            ),
        );

        expect(() => validateAuthoringPolicy(files, placeholder)).toThrow(
            'un ciclo o transición alternativa',
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

    it('rejects thematic-unit markers on comparisons', () => {
        const files = academicSlide(
            'comparison',
            `
                <section data-comparison>
                    <article data-comparison-option data-thematic-unit><h2 data-unit-topic>Local</h2><p data-unit-description>Control operativo.</p></article>
                    <span data-comparison-connector>Frente a</span>
                    <article data-comparison-option><h2 data-unit-topic>Hibrido</h2><p data-unit-description>Control y escala.</p></article>
                </section>
            `,
        );

        expect(() => validateAuthoringPolicy(files, placeholder)).toThrow(
            'no debe usar data-thematic-unit',
        );
    });

    it('does not reject border resets before rendered inspection', () => {
        const files = academicSlideFiles(
            'pillars',
            '<article data-thematic-unit><h2 data-unit-topic>Uno</h2><span class="deck-icon"></span><p data-unit-description>Guia breve.</p></article><article data-thematic-unit><h2 data-unit-topic>Dos</h2><span class="deck-icon"></span><p data-unit-description>Guia breve.</p></article>',
            '.pillar { border: none; }',
        );

        expect(() => validateAuthoringPolicy(files, placeholder)).not.toThrow();
    });

    it('does not reject inactive pseudo-elements before rendered inspection', () => {
        const files = academicSlideFiles(
            'pillars',
            '<article data-thematic-unit><h2 data-unit-topic>Uno</h2><span class="deck-icon"></span><p data-unit-description>Guia breve.</p></article><article data-thematic-unit><h2 data-unit-topic>Dos</h2><span class="deck-icon"></span><p data-unit-description>Guia breve.</p></article>',
            '.pillar::before { content: none; }',
        );

        expect(() => validateAuthoringPolicy(files, placeholder)).not.toThrow();
    });

    it.each([3, 4, 5])(
        'accepts %i numbered steps without arrow assets',
        (count) => {
            const step = (number) =>
                `<li data-process-step><span data-step-number>${number}</span><h2 data-step-title>Paso ${number}</h2><span class="deck-icon"></span><p data-step-description>Descripcion breve.</p></li>`;
            const files = academicSlide(
                'process',
                `
                <section data-process>
                    <ol>${Array.from({ length: count }, (_, index) => step(String(index + 1).padStart(2, '0'))).join('')}</ol>
                </section>
            `,
            );

            expect(() =>
                validateAuthoringPolicy(files, placeholder),
            ).not.toThrow();
        },
    );

    it('rejects separator arrows even from an approved library', () => {
        const step = (number) =>
            `<li data-process-step><span data-step-number>${number}</span><h2 data-step-title>Paso ${number}</h2><span class="deck-icon"></span><p data-step-description>Descripcion breve.</p></li>`;
        const files = academicSlide(
            'process',
            `
                <section data-process>
                    <div data-process-connectors>
                        <span class="deck-icon deck-icon--arrow-right" data-process-arrow="arrow-right"></span>
                        <span class="deck-icon deck-icon--arrow-right" data-process-arrow="arrow-right"></span>
                    </div>
                    <ol>${step(1)}${step(2)}${step(3)}</ol>
                </section>
            `,
        );
        expect(() => validateAuthoringPolicy(files, placeholder)).toThrow(
            'sin flechas ni conectores',
        );
    });

    it('rejects process arrows outside the connector layer', () => {
        const step = (number) =>
            `<li data-process-step><span data-step-number>${number}</span><h2 data-step-title>Paso ${number}</h2><p data-step-description>Descripcion breve.</p></li>`;
        const files = academicSlide(
            'process',
            `
                <section data-process>
                    <div data-process-connectors></div>
                    <span class="deck-icon deck-icon--arrow-right" data-process-arrow="arrow-right"></span>
                    <span class="deck-icon deck-icon--arrow-right" data-process-arrow="arrow-right"></span>
                    <ol>${step(1)}${step(2)}${step(3)}</ol>
                </section>
            `,
        );

        expect(() => validateAuthoringPolicy(files, placeholder)).toThrow(
            'sin flechas ni conectores',
        );
    });

    it.each([
        [1, 1, 3],
        [1, 3, 4],
        [0, 1, 2],
    ])('rejects invalid step sequence %j', (...numbers) => {
        const content = `<ol data-process>${numbers.map((number) => `<li data-process-step><span data-step-number>${number}</span><h2 data-step-title>Paso</h2><p data-step-description>Detalle.</p></li>`).join('')}</ol>`;
        expect(() =>
            validateAuthoringPolicy(
                academicSlide('process', content),
                placeholder,
            ),
        ).toThrow('numeración consecutiva');
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
        const files = academicSlide('chart', donutFixture());

        expect(() => validateAuthoringPolicy(files, placeholder)).not.toThrow();
    });

    it.each([
        ['data-chart-type="donut"', '', 'data-chart-type'],
        ['data-chart-legend="part-2"', 'data-chart-legend="part-1"', 'leyenda'],
        ['data-chart-inner-radius="58"', '', 'radios válidos'],
        ['<path ', '<circle ', 'sectores path'],
        [
            '<strong data-chart-value style="display:block;font-size:32px">40%</strong>',
            '<strong data-chart-value style="display:block;font-size:32px">100%</strong>',
            'máximos',
        ],
        [
            'data-chart-center-item="part-1"',
            'data-chart-center-item="part-2"',
            'máximos',
        ],
    ])('rejects invalid donut contract: %s', (from, to, message) => {
        const files = academicSlide('chart', donutFixture().replace(from, to));
        expect(() => validateAuthoringPolicy(files, placeholder)).toThrow(
            message,
        );
    });

    it('accepts all tied maxima and requires the tie label', () => {
        const content = donutFixture([40, 40, 10, 10]);
        expect(() =>
            validateAuthoringPolicy(
                academicSlide('chart', content),
                placeholder,
            ),
        ).not.toThrow();
        expect(() =>
            validateAuthoringPolicy(
                academicSlide(
                    'chart',
                    content.replace('data-chart-tie', 'data-unmarked'),
                ),
                placeholder,
            ),
        ).toThrow('máximos');
    });

    it.each([1, 3, 16])(
        'accepts %i numbered code lines without filler',
        (count) => {
            expect(() =>
                validateAuthoringPolicy(
                    academicSlide('code', codeFixture(count)),
                    placeholder,
                ),
            ).not.toThrow();
        },
    );

    it.each([
        ['data-code-number', 'data-unmarked'],
        ['data-code-end="20"', 'data-code-end="32"'],
        ['Líneas 18–20', 'Líneas 1–15'],
        ['aria-hidden="true"', 'aria-hidden="false"'],
    ])('rejects missing or inconsistent code numbering: %s', (from, to) => {
        expect(() =>
            validateAuthoringPolicy(
                academicSlide('code', codeFixture().replace(from, to)),
                placeholder,
            ),
        ).toThrow('rango y números');
    });

    it.each(['pillars', 'comparison', 'narrative-elements', 'process'])(
        'requires default icons for %s and an explicit omission policy',
        (structure) => {
            const content = {
                pillars:
                    '<article data-thematic-unit><h2 data-unit-topic>Uno</h2><p data-unit-description>Detalle.</p></article><article data-thematic-unit><h2 data-unit-topic>Dos</h2><p data-unit-description>Detalle.</p></article>',
                comparison:
                    '<section data-comparison><article data-comparison-option><h2 data-unit-topic>Uno</h2><p data-unit-description>Detalle.</p></article><article data-comparison-option><h2 data-unit-topic>Dos</h2><p data-unit-description>Detalle.</p></article><span data-comparison-connector>Frente a</span></section>',
                'narrative-elements':
                    '<section data-narrative><div data-narrative-copy>Contexto.</div><div data-narrative-elements><article data-narrative-element><h2 data-element-topic>Uno</h2><p data-element-description>Detalle.</p></article><article data-narrative-element><h2 data-element-topic>Dos</h2><p data-element-description>Detalle.</p></article></div></section>',
                process: `<ol data-process>${[1, 2, 3].map((number) => `<li data-process-step><span data-step-number>${number}</span><h2 data-step-title>Paso</h2><p data-step-description>Detalle.</p></li>`).join('')}</ol>`,
            }[structure];
            expect(() =>
                validateAuthoringPolicy(
                    academicSlide(structure, content),
                    placeholder,
                ),
            ).toThrow('salvo omisión explícita');
            expect(() =>
                validateAuthoringPolicy(
                    academicSlide(structure, content, 'data-icons="none"'),
                    placeholder,
                ),
            ).toThrow('motivo explícito');
            expect(() =>
                validateAuthoringPolicy(
                    academicSlide(
                        structure,
                        content,
                        'data-icons="none" data-icon-omission="user-request"',
                    ),
                    placeholder,
                ),
            ).not.toThrow();
        },
    );

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

function academicSlide(structure, content, attributes = '') {
    return authoredHtml(`
        <body data-template="academic-sober" data-slide-structure="${structure}" ${attributes}>
            <main data-slide-body data-vertical-align="center">${content}</main>
        </body>
    `);
}

function academicSlideFiles(structure, content, css) {
    const files = academicSlide(structure, content);
    files.set('slides/001/styles.css', new TextEncoder().encode(css));
    return files;
}

function typedDiagram(type, direction, nodes, edges, options = {}) {
    const nodeTags = nodes
        .map((id) => {
            const markers = [options.allNodeMarker, options.nodeMarkers?.[id]]
                .filter(Boolean)
                .join(' ');
            return `<article data-diagram-node="${id}" ${markers}>${id}</article>`;
        })
        .join('');
    const edgeTags = edges
        .map(
            ([id, from, to]) =>
                `<path data-diagram-edge="${id}" data-from="${from}" data-to="${to}" ${options.allEdgeMarker || ''}></path>`,
        )
        .join('');
    const labels =
        options.labelAll !== false
            ? edges
                  .map(
                      ([id]) =>
                          `<span data-diagram-label data-for-edge="${id}">${id}</span>`,
                  )
                  .join('')
            : '';
    return `
        <h1 id="typed-diagram-title">Diagrama tipado</h1>
        <figure data-diagram data-diagram-type="${type}" data-reading-direction="${direction}" aria-labelledby="typed-diagram-title" aria-describedby="typed-diagram-description">
            <svg data-diagram-connectors aria-hidden="true">${edgeTags}</svg>
            ${nodeTags}
            ${labels}
            ${options.extra || ''}
            <figcaption id="typed-diagram-description">Descripcion equivalente.</figcaption>
        </figure>
    `;
}

function authoredHtml(source) {
    return new Map([
        ['slides/001/index.html', new TextEncoder().encode(source)],
    ]);
}
