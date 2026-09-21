import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { chromium } from '@playwright/test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import {
    auditAcademicDecorations,
    auditDonutCharts,
    auditNumberedProcesses,
} from './academic-sober-visual-audit.mjs';
import { donutFixture } from './test-fixtures/donut.mjs';
import { PieChart } from '../../catalog/academic-sober/specimens/PieChart.jsx';
import { validateAuthoringPolicy } from './deck-authoring-validator.mjs';

let browser;
let page;

beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
});
afterAll(async () => {
    await browser?.close();
});

async function show(content, css = '', structure = 'chart') {
    await page.setContent(
        `<body data-template="academic-sober" data-slide-structure="${structure}"><style>${css}</style>${content}</body>`,
    );
}

describe('rendered donut validation', () => {
    it.each([
        [40, 35, 15, 10],
        [40, 40, 10, 10],
        [52, 28, 12, 8],
    ])(
        'accepts complete coverage and derived maxima for %j',
        async (...values) => {
            await show(donutFixture(values));
            expect(await page.evaluate(auditDonutCharts, 'test')).toEqual([]);
        },
    );

    it('accepts a uniformly scaled SVG', async () => {
        await show(
            donutFixture(),
            'body { transform:scale(.8); transform-origin:top left; }',
        );
        expect(await page.evaluate(auditDonutCharts, 'test')).toEqual([]);
    });

    it('rejects the untyped circle markers used by the reported failure', async () => {
        await show(
            '<figure><svg><circle data-chart-segment data-value="40"/></svg><div data-chart-legend></div></figure>',
        );
        expect(await page.evaluate(auditDonutCharts, 'test')).not.toEqual([]);
    });

    it('rejects an extra background ring even when values sum to 100', async () => {
        await show(
            donutFixture().replace(
                '</svg>',
                '<circle cx="150" cy="150" r="90" fill="none" stroke="#ddd" stroke-width="48"/></svg>',
            ),
        );
        expect(
            (await page.evaluate(auditDonutCharts, 'test')).some((failure) =>
                failure.message.includes('formas de fondo'),
            ),
        ).toBe(true);
    });

    it('detects gaps and overlaps in otherwise correctly labelled geometry', async () => {
        await show(
            donutFixture().replace(
                '<path ',
                '<path transform="rotate(12 150 150)" ',
            ),
        );
        expect(
            (await page.evaluate(auditDonutCharts, 'test')).some((failure) =>
                failure.message.includes('geometría'),
            ),
        ).toBe(true);
    });

    it('detects wrong shared radii', async () => {
        await show(
            donutFixture().replace(
                'data-chart-inner-radius="58"',
                'data-chart-inner-radius="60"',
            ),
        );
        expect(
            (await page.evaluate(auditDonutCharts, 'test')).some((failure) =>
                failure.message.includes('geometría'),
            ),
        ).toBe(true);
    });

    it('detects different geometry despite matching total and coverage', async () => {
        await show(donutFixture());
        await page
            .locator('[data-chart-segment="part-1"]')
            .evaluate((element) => {
                element.dataset.value = '35';
            });
        await page
            .locator('[data-chart-segment="part-2"]')
            .evaluate((element) => {
                element.dataset.value = '40';
            });
        expect(
            (await page.evaluate(auditDonutCharts, 'test')).some((failure) =>
                failure.message.includes('geometría'),
            ),
        ).toBe(true);
    });

    it('rejects a legend swatch that differs from its sector', async () => {
        await show(
            donutFixture().replace('background:#111827', 'background:#ff0000'),
        );
        expect(
            (await page.evaluate(auditDonutCharts, 'test')).some((failure) =>
                failure.message.includes('color de leyenda'),
            ),
        ).toBe(true);
    });

    it('rejects a fixed total or a hidden center', async () => {
        await show(
            donutFixture().replace(
                '<strong data-chart-value style="display:block;font-size:32px">40%</strong>',
                '<strong data-chart-value style="display:block;font-size:32px">100%</strong>',
            ),
        );
        expect(
            (await page.evaluate(auditDonutCharts, 'test')).some((failure) =>
                failure.message.includes('máximos'),
            ),
        ).toBe(true);
        await show(donutFixture(), '[data-chart-center] { display: none; }');
        expect(
            (await page.evaluate(auditDonutCharts, 'test')).some((failure) =>
                failure.message.includes('máximos'),
            ),
        ).toBe(true);
    });

    it('validates the actual catalog specimen and its stylesheet without starting the app', async () => {
        const content = renderToStaticMarkup(createElement(PieChart));
        const css = readFileSync(
            new URL(
                '../../catalog/academic-sober/styles/specimens.css',
                import.meta.url,
            ),
            'utf8',
        );
        const palette =
            ':root { --catalog-accent:#1d4ed8; --catalog-frame:#111827; --catalog-series-mid:#475569; --catalog-series-warm:#92400e; --catalog-ink:#111827; --catalog-muted:#4b5563; }';
        await show(content, palette + css);
        expect(await page.evaluate(auditDonutCharts, 'catalog')).toEqual([]);
        const html = `<body data-template="academic-sober" data-slide-structure="chart"><main data-slide-body data-vertical-align="center">${content}</main></body>`;
        expect(() =>
            validateAuthoringPolicy(
                new Map([
                    ['slides/001/index.html', new TextEncoder().encode(html)],
                ]),
            ),
        ).not.toThrow();
    });

    it('rejects a center placed below the SVG despite correct values', async () => {
        await show(
            donutFixture(),
            '[data-chart-center] { position: static !important; transform: none !important; }',
        );
        expect(
            (await page.evaluate(auditDonutCharts, 'center-position')).some(
                (failure) => failure.message.includes('dentro del hueco'),
            ),
        ).toBe(true);
    });

    it('rejects unstyled legends and ineffective screen-reader classes', async () => {
        await show(
            donutFixture(),
            '[data-chart-legend] { font-size:16px; gap:0 !important; }',
        );
        expect(
            (await page.evaluate(auditDonutCharts, 'legend')).some((failure) =>
                /pequeños|separados/.test(failure.message),
            ),
        ).toBe(true);
        await show(
            donutFixture().replace(
                '</figure>',
                '<table class="sr-only"><tr><td>Datos alternativos</td></tr></table></figure>',
            ),
        );
        expect(
            (await page.evaluate(auditDonutCharts, 'alternative')).some(
                (failure) => failure.message.includes('ocultación visual'),
            ),
        ).toBe(true);
    });
});

describe('rendered decorations and numbered processes', () => {
    it('accepts resets, inactive pseudos and functional closed boundaries', async () => {
        await show(
            '<p>Texto</p><article data-diagram-node="a">Nodo</article><pre>Código</pre>',
            'p { border: none; } p::before { content: none; } article, pre { border: 2px solid #111; }',
        );
        expect(await page.evaluate(auditAcademicDecorations, 'test')).toEqual(
            [],
        );
    });

    it.each([
        'p { border-left: 3px solid #111; }',
        'p::before { content: ""; display: block; width: 20px; height: 3px; background: #111; }',
        'p { box-shadow: 0 -2px #111; }',
    ])('rejects visible decorative separators: %s', async (css) => {
        await show('<p>Texto</p>', css);
        expect(
            await page.evaluate(auditAcademicDecorations, 'test'),
        ).not.toEqual([]);
    });

    it('does not let a semantic boundary authorize a lateral bar', async () => {
        await show(
            '<div data-boundary="semantic">Texto</div>',
            'div { border-left: 3px solid #111; }',
        );
        expect(
            await page.evaluate(auditAcademicDecorations, 'test'),
        ).not.toEqual([]);
    });

    it.each([
        'border: 1px solid #ccc',
        'outline: 1px solid #ccc',
        'background: #f1f5f9',
    ])(
        'rejects thematic cards even with semantic markers: %s',
        async (style) => {
            await show(
                `<article data-thematic-unit data-boundary="semantic" style="padding:24px;border-radius:16px;${style}"><h2>Tema</h2><p>Descripción</p></article>`,
            );
            expect(
                await page.evaluate(auditAcademicDecorations, 'card'),
            ).not.toEqual([]);
            await show(
                `<section data-boundary="semantic" style="${style}"><article data-thematic-unit>Tema</article></section>`,
            );
            expect(
                await page.evaluate(auditAcademicDecorations, 'wrapper'),
            ).not.toEqual([]);
        },
    );

    it('accepts numbered steps and rejects added connectors and stacked layouts', async () => {
        const content = `<ol data-process>${[1, 2, 3].map((number) => `<li data-process-step><span data-step-number>0${number}</span><h2>Paso</h2><p>Descripción</p></li>`).join('')}</ol>`;
        await show(content, 'ol { display: flex; gap: 60px; }', 'process');
        expect(await page.evaluate(auditNumberedProcesses, 'test')).toEqual([]);
        await page.locator('ol').evaluate((element) => {
            element.insertAdjacentHTML(
                'afterend',
                '<div data-process-connectors></div>',
            );
        });
        expect(await page.evaluate(auditNumberedProcesses, 'test')).not.toEqual(
            [],
        );
        await show(content, '', 'process');
        expect(await page.evaluate(auditNumberedProcesses, 'test')).not.toEqual(
            [],
        );
    });
});
