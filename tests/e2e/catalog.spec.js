import { expect, test } from '@playwright/test';

test('renders the academic sober visual catalog directly', async ({ page }) => {
    await page.goto('/catalog/academic-sober/');

    await expect(page).toHaveTitle('Catálogo visual | Académica sobria');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(
        page.getByRole('heading', { name: 'Académica sobria' }),
    ).toBeVisible();
    await expect(page.locator('.slide-frame')).toHaveCount(16);
    await expect(page.locator('[data-slide-body]')).toHaveCount(14);
    await expect(page.locator('[data-frame="none"]')).toHaveCount(16);
    await expect(page.locator('table')).toHaveCount(1);
    await expect(page.locator('iframe')).toHaveCount(0);
    await expect(page.locator('button')).toHaveCount(0);
    await expect(page.locator('input')).toHaveCount(0);
    await expect(page.locator('table caption')).toHaveText(
        'Comparación de alternativas de despliegue',
    );
    await expect(page.locator('th[scope="col"]')).toHaveCount(4);
    await expect(page.locator('th[scope="row"]')).toHaveCount(4);
    await expect(page.locator('[data-chart-runtime="echarts"]')).toHaveCount(1);
    await expect(page.locator('[data-slide-structure="pillars"]')).toHaveCount(
        3,
    );
    await expect(page.locator('[data-thematic-unit]')).toHaveCount(9);
    await expect(page.locator('[data-diagram]')).toHaveCount(1);
    await expect(page.locator('[data-diagram-node]')).toHaveCount(4);
    await expect(page.locator('[data-diagram-connectors]')).toHaveCount(1);
    await expect(
        page.locator('[data-reading-direction="left-to-right"]'),
    ).toHaveCount(1);
    await expect
        .poll(() =>
            page.locator('[data-thematic-unit]').evaluateAll((units) =>
                units.every((unit) => {
                    const topic = unit.querySelector('[data-unit-topic]');
                    const icon = unit.querySelector('.deck-icon');
                    const description = unit.querySelector(
                        '[data-unit-description]',
                    );
                    const children = [...unit.children];
                    return Boolean(
                        topic &&
                        icon &&
                        description &&
                        children.indexOf(topic) < children.indexOf(icon) &&
                        children.indexOf(icon) < children.indexOf(description),
                    );
                }),
            ),
        )
        .toBe(true);
});

test('uses open centered compositions without default frames', async ({
    page,
}) => {
    await page.goto('/catalog/academic-sober/');

    await expect
        .poll(() =>
            page.locator('.slide-context').evaluateAll((contexts) =>
                contexts.every((context) => {
                    const style = getComputedStyle(context);
                    return (
                        style.fontStyle === 'italic' &&
                        Number(style.fontWeight) === 400 &&
                        style.textTransform === 'none'
                    );
                }),
            ),
        )
        .toBe(true);
    await expect
        .poll(() =>
            page.locator('[data-slide-body]').evaluateAll((bodies) =>
                bodies.every((body) => {
                    const composition = body.firstElementChild;
                    if (!composition) return false;
                    const bodyRect = body.getBoundingClientRect();
                    const compositionRect = composition.getBoundingClientRect();
                    const bodyCenter = bodyRect.top + bodyRect.height / 2;
                    const compositionCenter =
                        compositionRect.top + compositionRect.height / 2;
                    return Math.abs(bodyCenter - compositionCenter) <= 2;
                }),
            ),
        )
        .toBe(true);
    await expect
        .poll(() =>
            page
                .locator('.slide-canvas')
                .evaluateAll((slides) =>
                    slides.every(
                        (slide) =>
                            getComputedStyle(slide, '::before').content ===
                            'none',
                    ),
                ),
        )
        .toBe(true);
    await expect
        .poll(() =>
            page.locator('[data-process-arrow]').evaluateAll((arrows) => {
                const rects = arrows.map((arrow) =>
                    arrow.getBoundingClientRect(),
                );
                return arrows.every(
                    (arrow, index) =>
                        Number.parseFloat(getComputedStyle(arrow).width) <=
                            48 &&
                        Number.parseFloat(getComputedStyle(arrow).height) <=
                            48 &&
                        Math.abs(rects[index].top - rects[0].top) <= 2,
                );
            }),
        )
        .toBe(true);
    await expect
        .poll(() =>
            page
                .locator('.slide-canvas *')
                .evaluateAll((elements) =>
                    elements.every(
                        (element) =>
                            getComputedStyle(element).textTransform !==
                            'uppercase',
                    ),
                ),
        )
        .toBe(true);
});

test('comparison, process and narrative follow the shared hierarchy', async ({
    page,
}) => {
    await page.goto('/catalog/academic-sober/');

    await expect(page.locator('[data-comparison-option]')).toHaveCount(2);
    await expect(page.locator('[data-comparison-connector]')).toHaveText(
        'Frente a',
    );
    await expect(page.locator('[data-process-step]')).toHaveCount(4);
    await expect(page.locator('[data-process-connectors]')).toHaveCount(1);
    await expect(page.locator('[data-process-arrow]')).toHaveCount(3);
    await expect
        .poll(() =>
            page
                .locator('[data-process-arrow]')
                .evaluateAll((arrows) =>
                    arrows.every((arrow) =>
                        arrow
                            .getAttribute('src')
                            ?.includes('arrow-fat-right-bold'),
                    ),
                ),
        )
        .toBe(true);
    await expect(page.locator('[data-narrative-element]')).toHaveCount(3);
    await expect
        .poll(() =>
            page
                .locator(
                    '[data-comparison-option], [data-process-step], [data-narrative-element]',
                )
                .evaluateAll((units) =>
                    units.every((unit) => {
                        const topic = unit.querySelector(
                            '[data-unit-topic], [data-step-title], [data-element-topic]',
                        );
                        const icon = unit.querySelector('.deck-icon');
                        const description = unit.querySelector(
                            '[data-unit-description], [data-step-description], [data-element-description]',
                        );
                        const children = [...unit.children];
                        return Boolean(
                            topic &&
                            icon &&
                            description &&
                            children.indexOf(topic) < children.indexOf(icon) &&
                            children.indexOf(icon) <
                                children.indexOf(description),
                        );
                    }),
                ),
        )
        .toBe(true);
    await expect
        .poll(() =>
            page.locator('[data-process-step]').evaluateAll((steps) => {
                const positions = steps.map((step) =>
                    step.getBoundingClientRect(),
                );
                return positions.every(
                    (position, index) =>
                        index === 0 ||
                        (position.left > positions[index - 1].left &&
                            Math.abs(position.top - positions[index - 1].top) <=
                                2),
                );
            }),
        )
        .toBe(true);
    await expect
        .poll(() =>
            page
                .locator(
                    '[data-comparison-option], [data-process-step], [data-narrative-element]',
                )
                .evaluateAll((units) =>
                    units.every((unit) => {
                        const style = getComputedStyle(unit);
                        return (
                            style.borderTopWidth === '0px' &&
                            style.borderBottomWidth === '0px'
                        );
                    }),
                ),
        )
        .toBe(true);
});

test('donut data and legend remain synchronized', async ({ page }) => {
    await page.goto('/catalog/academic-sober/');

    await expect(page.locator('[data-chart-segment]')).toHaveCount(4);
    await expect(page.locator('[data-chart-legend]')).toHaveCount(4);
    await expect
        .poll(() =>
            page.locator('[data-chart-type="donut"]').evaluate((chart) => {
                const segments = [
                    ...chart.querySelectorAll('[data-chart-segment]'),
                ];
                const values = segments.reduce(
                    (sum, segment) => sum + Number(segment.dataset.value),
                    0,
                );
                return (
                    values === 100 &&
                    segments.every((segment) => {
                        const id = segment.dataset.chartSegment;
                        const legend = chart.querySelector(
                            `[data-chart-legend="${id}"]`,
                        );
                        const swatch = legend?.querySelector('.legend-swatch');
                        const path = segment.getAttribute('d') ?? '';
                        return (
                            legend &&
                            swatch &&
                            getComputedStyle(segment).fill ===
                                getComputedStyle(swatch).backgroundColor &&
                            path.includes('A 190 190') &&
                            path.includes('A 88 88')
                        );
                    })
                );
            }),
        )
        .toBe(true);
});

test('code specimen exposes syntax tokens and an associated focus', async ({
    page,
}) => {
    await page.goto('/catalog/academic-sober/');

    await expect(page.locator('[data-code-line]')).toHaveCount(12);
    await expect(page.locator('[data-code-focus]')).toHaveCount(5);
    await expect(page.locator('[data-code-token="keyword"]')).not.toHaveCount(
        0,
    );
    await expect(page.locator('[data-code-token="function"]')).not.toHaveCount(
        0,
    );
    await expect(page.locator('[data-code-token="variable"]')).not.toHaveCount(
        0,
    );
    await expect(page.locator('[data-code-token="property"]')).not.toHaveCount(
        0,
    );
    await expect(page.locator('[data-code-token="string"]')).not.toHaveCount(0);
    await expect(page.locator('[data-code-token="number"]')).not.toHaveCount(0);
    await expect
        .poll(() =>
            page
                .locator('[data-code-focus]')
                .evaluateAll((lines) =>
                    lines.every(
                        (line) =>
                            line.getAttribute('aria-describedby') ===
                            'code-focus-note',
                    ),
                ),
        )
        .toBe(true);
});

test('catalog remains within the viewport at narrow width', async ({
    page,
}) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/catalog/academic-sober/');

    await expect
        .poll(() =>
            page.evaluate(
                () =>
                    document.documentElement.scrollWidth <=
                    document.documentElement.clientWidth,
            ),
        )
        .toBe(true);
    await expect(
        page.getByRole('heading', {
            name: 'Las gráficas son evidencia, no decoración',
        }),
    ).toBeVisible();
});
