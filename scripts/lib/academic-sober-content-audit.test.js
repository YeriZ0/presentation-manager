import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
    auditThematicIcons,
    auditThematicAlignment,
    auditCodeLayouts,
    auditSlideCounter,
} from './academic-sober-content-audit.mjs';
import { CodeSpecimen } from '../../catalog/academic-sober/specimens/CodeSpecimen.jsx';
import { ProcessSpecimen } from '../../catalog/academic-sober/specimens/ProcessSpecimen.jsx';
import { codeFixture, codeStyles } from './test-fixtures/code.mjs';
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

async function show(content, css = '', structure = 'code', attributes = '') {
    await page.setContent(
        `<body data-template="academic-sober" data-slide-structure="${structure}" ${attributes}><style>${css}</style><main data-slide-body data-vertical-align="center">${content}</main></body>`,
    );
}

describe('code layout and numbering', () => {
    it('accepts compact rows even when HTML contains formatting newlines', async () => {
        await show(codeFixture(3, '\n'), codeStyles);
        expect(await page.evaluate(auditCodeLayouts, 'code')).toEqual([]);
    });
    it.each([
        'pre { white-space: pre; }',
        'pre { font-size: 20px; line-height: 1.6; }',
        '[data-code-line] { margin-bottom: 20px; }',
        '[data-code-number] { visibility: hidden; }',
        'pre { max-height: 40px; overflow: hidden; }',
    ])('rejects spacing, small type or clipping: %s', async (css) => {
        await show(codeFixture(3, '\n'), codeStyles + css);
        expect(await page.evaluate(auditCodeLayouts, 'code')).not.toEqual([]);
    });
    it('detects the last characters cropped by a narrow block', async () => {
        await show(
            codeFixture(),
            codeStyles + 'pre { width: 80px; overflow: hidden; }',
        );
        expect(await page.evaluate(auditCodeLayouts, 'code')).not.toEqual([]);
    });
    it('validates the actual compact code specimen including line numbers', async () => {
        const html = renderToStaticMarkup(createElement(CodeSpecimen));
        const css = readFileSync(
            new URL(
                '../../catalog/academic-sober/styles/specimens.css',
                import.meta.url,
            ),
            'utf8',
        );
        await show(html, ':root { --catalog-mono:Consolas,monospace; }' + css);
        expect(await page.evaluate(auditCodeLayouts, 'catalog-code')).toEqual(
            [],
        );
        expect(() =>
            validateAuthoringPolicy(
                new Map([
                    [
                        'slides/001/index.html',
                        new TextEncoder().encode(
                            `<body data-template="academic-sober" data-slide-structure="code"><main data-slide-body data-vertical-align="center">${html}</main></body>`,
                        ),
                    ],
                ]),
            ),
        ).not.toThrow();
    });
    it('rejects an absent, clipped or incorrect slide counter', async () => {
        const context = { slideId: 'code', index: 3, total: 6 };
        await show('<footer><span data-slide-counter>04 / 06</span></footer>');
        expect(await page.evaluate(auditSlideCounter, context)).toEqual([]);
        await show(
            '<footer><span>04 / 06</span></footer>',
            'footer { position: absolute; top: 1200px; }',
        );
        expect(await page.evaluate(auditSlideCounter, context)).not.toEqual([]);
        await show('<footer><span>03 / 06</span></footer>');
        expect(await page.evaluate(auditSlideCounter, context)).not.toEqual([]);
        await show('<p>Contenido</p>');
        expect(await page.evaluate(auditSlideCounter, context)).not.toEqual([]);
    });
});

describe('default thematic icons', () => {
    const raw = readFileSync(
        new URL(
            '../../node_modules/@phosphor-icons/core/assets/bold/code-bold.svg',
            import.meta.url,
        ),
        'utf8',
    );
    const asset = `data:image/svg+xml,${encodeURIComponent(raw)}`;
    const unit = (icon = '') =>
        `<article data-thematic-unit><h2>Tema</h2>${icon}<p>Descripción</p></article>`;
    it('requires visible loaded icons, not empty spans or hidden images', async () => {
        await show(unit() + unit(), '', 'pillars');
        expect(await page.evaluate(auditThematicIcons, 'icons')).not.toEqual(
            [],
        );
        await show(
            unit('<span class="deck-icon"></span>'),
            '.deck-icon { display:block;width:96px;height:96px; }',
            'pillars',
        );
        expect(await page.evaluate(auditThematicIcons, 'icons')).not.toEqual(
            [],
        );
        await show(
            unit(
                `<img class="deck-icon" src="${asset}" width="96" height="96">`,
            ),
            'article { display:flex; flex-direction:column; align-items:center; }',
            'pillars',
        );
        await page.locator('img').evaluate((image) => image.decode());
        expect(await page.evaluate(auditThematicIcons, 'icons')).toEqual([]);
        await page.addStyleTag({
            content: '.deck-icon { width:16px; height:16px; }',
        });
        expect(
            (await page.evaluate(auditThematicIcons, 'icons')).some((failure) =>
                failure.message.includes('caja'),
            ),
        ).toBe(true);
        await page.addStyleTag({ content: '.deck-icon { opacity: 0; }' });
        expect(await page.evaluate(auditThematicIcons, 'icons')).not.toEqual(
            [],
        );
    });
    it('accepts only an explicit omission with a known reason', async () => {
        await show(unit() + unit(), '', 'pillars', 'data-icons="none"');
        expect(await page.evaluate(auditThematicIcons, 'icons')).not.toEqual(
            [],
        );
        await show(
            unit() + unit(),
            '',
            'pillars',
            'data-icons="none" data-icon-omission="user-request"',
        );
        expect(await page.evaluate(auditThematicIcons, 'icons')).toEqual([]);
    });
});

describe('horizontal alignment of open units', () => {
    const markers = {
        pillars: [
            'article',
            'data-thematic-unit',
            'data-unit-topic',
            'data-unit-description',
        ],
        comparison: [
            'article',
            'data-comparison-option',
            'data-unit-topic',
            'data-unit-description',
        ],
        'narrative-elements': [
            'article',
            'data-narrative-element',
            'data-element-topic',
            'data-element-description',
        ],
        process: [
            'li',
            'data-process-step',
            'data-step-title',
            'data-step-description',
        ],
    };
    const base = `
        article, li { width:480px; }
        h2, p { margin:0; }
        h2 { font:32px/1.2 Arial; }
        p { max-width:240px; font:24px/1.4 Arial; }
        .deck-icon { display:inline-block; width:96px; height:96px; }
    `;
    const center = `
        [data-thematic-unit], [data-comparison-option], [data-narrative-element], [data-process-step] {
            display:flex; flex-direction:column; align-items:center; text-align:center;
        }
    `;
    function peer(structure, icon = true) {
        const [tag, unit, topic, description] = markers[structure];
        return `<${tag} ${unit}>${structure === 'process' ? '<span data-step-number>1</span>' : ''}<h2 ${topic}>Un tema breve</h2>${icon ? '<span class="deck-icon"></span>' : ''}<p ${description}>Descripción que ocupa varias líneas dentro de una caja limitada.</p></${tag}>`;
    }

    it.each(Object.keys(markers))(
        'centers topic, icon and description in %s, including explicit icon omissions',
        async (structure) => {
            await show(peer(structure), base + center, structure);
            expect(
                await page.evaluate(auditThematicAlignment, 'aligned'),
            ).toEqual([]);
            await show(
                peer(structure, false),
                base + center,
                structure,
                'data-icons="none" data-icon-omission="user-request"',
            );
            expect(
                await page.evaluate(auditThematicAlignment, 'omitted'),
            ).toEqual([]);
        },
    );

    it('detects CSS targeting an absent class instead of the existing data marker', async () => {
        await show(
            peer('comparison'),
            base +
                '.comparison-option { display:flex; flex-direction:column; align-items:center; text-align:center; }',
            'comparison',
        );
        expect(
            await page.evaluate(auditThematicAlignment, 'missing-class'),
        ).not.toEqual([]);
        await page.addStyleTag({ content: center });
        expect(
            await page.evaluate(auditThematicAlignment, 'data-selector'),
        ).toEqual([]);
    });

    it('rejects left-aligned text even when all boxes and the icon are centered', async () => {
        await show(
            peer('comparison'),
            base + center + 'h2, p { text-align:left; }',
            'comparison',
        );
        const failures = await page.evaluate(auditThematicAlignment, 'text');
        expect(failures).toHaveLength(2);
        expect(
            failures.every((failure) =>
                failure.message.includes('texto debe estar centrado'),
            ),
        ).toBe(true);
    });

    it('rejects a left-anchored narrow description even when its text is centered', async () => {
        await show(
            peer('pillars'),
            base +
                center +
                '[data-thematic-unit] { display:block; } .deck-icon { display:block; margin-inline:auto; }',
            'pillars',
        );
        const failures = await page.evaluate(auditThematicAlignment, 'box');
        expect(
            failures.some((failure) =>
                failure.message.startsWith('descripción: la caja'),
            ),
        ).toBe(true);
    });

    it('still checks text alignment when icons were explicitly omitted', async () => {
        await show(
            peer('pillars', false),
            base + center + 'p { text-align:left; }',
            'pillars',
            'data-icons="none" data-icon-omission="user-request"',
        );
        expect(
            await page.evaluate(auditThematicAlignment, 'omitted-text'),
        ).not.toEqual([]);
    });

    it('keeps narrative copy independent from the alignment of its peer units', async () => {
        await show(
            `<p data-narrative-copy style="text-align:left">Explicación narrativa.</p>${peer('narrative-elements')}`,
            base + center,
            'narrative-elements',
        );
        expect(
            await page.evaluate(auditThematicAlignment, 'narrative'),
        ).toEqual([]);
    });

    it('measures optical tolerance in authoring pixels on a scaled canvas', async () => {
        await show(
            peer('pillars'),
            base +
                center +
                'body { transform:scale(.25); transform-origin:top left; } p { position:relative; left:12px; }',
            'pillars',
        );
        expect(
            (await page.evaluate(auditThematicAlignment, 'scaled')).some(
                (failure) => failure.message.includes('caja'),
            ),
        ).toBe(true);
    });

    it('keeps the catalog process number and content on the same center axis', async () => {
        const css = readFileSync(
            new URL(
                '../../catalog/academic-sober/styles/specimens.css',
                import.meta.url,
            ),
            'utf8',
        );
        await show(
            renderToStaticMarkup(createElement(ProcessSpecimen)),
            css,
            'process',
        );
        expect(
            await page.evaluate(auditThematicAlignment, 'catalog-process'),
        ).toEqual([]);
    });
});
