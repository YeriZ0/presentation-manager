import { expect, test } from '@playwright/test';

test('renders the academic sober visual catalog directly', async ({ page }) => {
    await page.goto('/catalog/academic-sober/');

    await expect(page).toHaveTitle('Catálogo visual | Académica sobria');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(
        page.getByRole('heading', { name: 'Académica sobria' }),
    ).toBeVisible();
    await expect(page.locator('.slide-frame')).toHaveCount(22);
    await expect(page.locator('[data-slide-body]')).toHaveCount(20);
    await expect(page.locator('[data-frame="none"]')).toHaveCount(22);
    await expect(page.locator('table')).toHaveCount(2);
    await expect(page.locator('table:not(.chart-data-table)')).toHaveCount(1);
    await expect(page.locator('table.chart-data-table')).toHaveCount(1);
    await expect(page.locator('iframe')).toHaveCount(0);
    await expect(page.locator('button')).toHaveCount(0);
    await expect(page.locator('input')).toHaveCount(0);
    await expect(
        page.locator('table:not(.chart-data-table) caption'),
    ).toHaveText('Comparación de alternativas de despliegue');
    await expect(
        page.locator('table:not(.chart-data-table) th[scope="col"]'),
    ).toHaveCount(4);
    await expect(
        page.locator('table:not(.chart-data-table) th[scope="row"]'),
    ).toHaveCount(4);
    await expect(page.locator('[data-chart-runtime="echarts"]')).toHaveCount(1);
    await expect(page.locator('[data-slide-structure="pillars"]')).toHaveCount(
        3,
    );
    await expect(page.locator('[data-thematic-unit]')).toHaveCount(9);
    await expect(page.locator('[data-diagram]')).toHaveCount(7);
    await expect(page.locator('[data-diagram-node]')).toHaveCount(37);
    await expect(page.locator('[data-diagram-connectors]')).toHaveCount(7);
    await expect(page.locator('[data-diagram-edge]')).toHaveCount(35);
    await expect(page.locator('[data-diagram-label]')).toHaveCount(35);
    await expect(
        page.locator('[data-reading-direction="left-to-right"]'),
    ).toHaveCount(4);
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

test('diagram variants expose verifiable topology and accessible text', async ({
    page,
}) => {
    await page.goto('/catalog/academic-sober/');

    await expect
        .poll(() =>
            page.locator('[data-diagram]').evaluateAll((diagrams) => {
                const types = diagrams.map(
                    (diagram) => diagram.dataset.diagramType,
                );
                return (
                    new Set(types).size === 7 &&
                    [
                        'architecture',
                        'workflow',
                        'sequence',
                        'data-flow',
                        'lifecycle',
                        'hierarchy',
                        'relationship-map',
                    ].every((type) => types.includes(type))
                );
            }),
        )
        .toBe(true);
    await expect
        .poll(() =>
            page.locator('[data-diagram]').evaluateAll((diagrams) =>
                diagrams.every((diagram) => {
                    const slide = diagram.closest('[data-slide-structure]');
                    const connector = diagram.querySelector(
                        'svg[data-diagram-connectors]',
                    );
                    const nodeIds = [
                        ...diagram.querySelectorAll('[data-diagram-node]'),
                    ].map((node) => node.dataset.diagramNode);
                    const nodes = new Set(nodeIds);
                    const edges = connector
                        ? [
                              ...connector.querySelectorAll(
                                  'path[data-diagram-edge]',
                              ),
                          ]
                        : [];
                    const edgeIds = edges.map(
                        (edge) => edge.dataset.diagramEdge,
                    );
                    const labels = [
                        ...diagram.querySelectorAll(
                            '[data-diagram-label][data-for-edge]',
                        ),
                    ];
                    const labelledBy = diagram.getAttribute('aria-labelledby');
                    const describedBy =
                        diagram.getAttribute('aria-describedby');
                    const hasReferencedText = (value) =>
                        Boolean(value) &&
                        value
                            .trim()
                            .split(/\s+/)
                            .every((id) =>
                                [...slide.querySelectorAll('[id]')].some(
                                    (element) => element.id === id,
                                ),
                            );
                    return (
                        slide?.dataset.slideStructure === 'system-diagram' &&
                        diagram.querySelectorAll('svg[data-diagram-connectors]')
                            .length === 1 &&
                        nodeIds.length > 1 &&
                        nodes.size === nodeIds.length &&
                        edges.length >= nodeIds.length - 1 &&
                        edgeIds.every(Boolean) &&
                        new Set(edgeIds).size === edgeIds.length &&
                        diagram.querySelectorAll('[data-diagram-edge]')
                            .length === edges.length &&
                        edges.every(
                            (edge) =>
                                nodes.has(edge.dataset.from) &&
                                nodes.has(edge.dataset.to) &&
                                edge.dataset.from !== edge.dataset.to,
                        ) &&
                        labels.length === edges.length &&
                        labels.every(
                            (label) =>
                                edgeIds.includes(label.dataset.forEdge) &&
                                !label.closest('svg'),
                        ) &&
                        new Set(labels.map((label) => label.dataset.forEdge))
                            .size === labels.length &&
                        hasReferencedText(labelledBy) &&
                        hasReferencedText(describedBy)
                    );
                }),
            ),
        )
        .toBe(true);
    await expect
        .poll(() =>
            page.locator('[data-diagram]').evaluateAll((diagrams) =>
                diagrams.every((diagram) => {
                    const nodes = [
                        ...diagram.querySelectorAll('[data-diagram-node]'),
                    ].map((node) => node.getBoundingClientRect());
                    return nodes.every((left, leftIndex) =>
                        nodes.every(
                            (right, rightIndex) =>
                                leftIndex === rightIndex ||
                                left.right <= right.left ||
                                left.left >= right.right ||
                                left.bottom <= right.top ||
                                left.top >= right.bottom,
                        ),
                    );
                }),
            ),
        )
        .toBe(true);
    await expect
        .poll(() =>
            page.locator('[data-diagram]').evaluateAll((diagrams) =>
                diagrams.every((diagram) => {
                    const nodes = [
                        ...diagram.querySelectorAll('[data-diagram-node]'),
                    ];
                    const edges = [
                        ...diagram.querySelectorAll('[data-diagram-edge]'),
                    ];
                    const labels = [
                        ...diagram.querySelectorAll('[data-diagram-label]'),
                    ];
                    const markers = [...diagram.querySelectorAll('marker')];
                    const stages = [
                        ...diagram.querySelectorAll('[data-diagram-stage]'),
                    ];
                    const labelsAreClear = labels.every((label) => {
                        const edge = edges.find(
                            (candidate) =>
                                candidate.dataset.diagramEdge ===
                                label.dataset.forEdge,
                        );
                        if (!edge) return false;
                        const labelRect = label.getBoundingClientRect();
                        const overlapsNode = nodes.some((node) => {
                            const nodeRect = node.getBoundingClientRect();
                            return (
                                labelRect.left < nodeRect.right &&
                                labelRect.right > nodeRect.left &&
                                labelRect.top < nodeRect.bottom &&
                                labelRect.bottom > nodeRect.top
                            );
                        });
                        if (overlapsNode) return false;
                        for (const candidate of edges) {
                            const matrix = candidate.getScreenCTM();
                            if (!matrix) return false;
                            const point =
                                candidate.ownerSVGElement.createSVGPoint();
                            const length = candidate.getTotalLength();
                            for (
                                let distance = 0;
                                distance <= length;
                                distance += 2
                            ) {
                                const pathPoint =
                                    candidate.getPointAtLength(distance);
                                point.x = pathPoint.x;
                                point.y = pathPoint.y;
                                const screenPoint =
                                    point.matrixTransform(matrix);
                                if (
                                    screenPoint.x >= labelRect.left - 3 &&
                                    screenPoint.x <= labelRect.right + 3 &&
                                    screenPoint.y >= labelRect.top - 3 &&
                                    screenPoint.y <= labelRect.bottom + 3
                                ) {
                                    return false;
                                }
                            }
                            if (candidate.getAttribute('marker-end')) {
                                const endpoint =
                                    candidate.getPointAtLength(length);
                                point.x = endpoint.x;
                                point.y = endpoint.y;
                                const screenPoint =
                                    point.matrixTransform(matrix);
                                const scale = Math.max(
                                    Math.hypot(matrix.a, matrix.b),
                                    Math.hypot(matrix.c, matrix.d),
                                );
                                const markerId = candidate
                                    .getAttribute('marker-end')
                                    .match(/^url\(#(.+)\)$/)?.[1];
                                const marker = markerId
                                    ? candidate.ownerSVGElement.querySelector(
                                          `[id="${markerId}"]`,
                                      )
                                    : null;
                                const markerUnits =
                                    marker?.getAttribute('markerUnits') ||
                                    'strokeWidth';
                                const unitScale =
                                    markerUnits === 'userSpaceOnUse'
                                        ? 1
                                        : Number.parseFloat(
                                              getComputedStyle(candidate)
                                                  .strokeWidth,
                                          );
                                const radius =
                                    Math.max(
                                        Number(
                                            marker?.getAttribute('markerWidth'),
                                        ) || 0,
                                        Number(
                                            marker?.getAttribute(
                                                'markerHeight',
                                            ),
                                        ) || 0,
                                    ) *
                                    unitScale *
                                    scale;
                                if (
                                    labelRect.left < screenPoint.x + radius &&
                                    labelRect.right > screenPoint.x - radius &&
                                    labelRect.top < screenPoint.y + radius &&
                                    labelRect.bottom > screenPoint.y - radius
                                ) {
                                    return false;
                                }
                            }
                        }
                        return (
                            getComputedStyle(label).color ===
                            getComputedStyle(edge).stroke
                        );
                    });
                    const compactMarkers = markers.every((marker) => {
                        const width = Number(
                            marker.getAttribute('markerWidth'),
                        );
                        return (
                            width === 7.2 &&
                            Number(marker.getAttribute('markerHeight')) ===
                                7.2 &&
                            Number(marker.getAttribute('refX')) === 7.2 &&
                            Number(marker.getAttribute('refY')) === 3.6
                        );
                    });
                    const arrowheadsAreClear =
                        ['sequence', 'hierarchy', 'relationship-map'].includes(
                            diagram.dataset.diagramType,
                        ) ||
                        edges.every((edge) => {
                            if (!edge.getAttribute('marker-end')) return true;
                            const target = diagram.querySelector(
                                `[data-diagram-node="${edge.dataset.to}"]`,
                            );
                            const matrix = edge.getScreenCTM();
                            if (!target || !matrix) return false;
                            const point = edge.ownerSVGElement.createSVGPoint();
                            const endpoint = edge.getPointAtLength(
                                edge.getTotalLength(),
                            );
                            point.x = endpoint.x;
                            point.y = endpoint.y;
                            const screenPoint = point.matrixTransform(matrix);
                            const targetRect = target.getBoundingClientRect();
                            return !(
                                screenPoint.x > targetRect.left &&
                                screenPoint.x < targetRect.right &&
                                screenPoint.y > targetRect.top &&
                                screenPoint.y < targetRect.bottom
                            );
                        });
                    const inkProbe = document.createElement('span');
                    inkProbe.style.color = 'var(--catalog-ink)';
                    diagram.appendChild(inkProbe);
                    const inkColor = getComputedStyle(inkProbe).color;
                    inkProbe.remove();
                    const stagesArePlain = stages.every((stage) => {
                        const style = getComputedStyle(stage);
                        const before = getComputedStyle(stage, '::before');
                        const after = getComputedStyle(stage, '::after');
                        return (
                            Boolean(stage.textContent.trim()) &&
                            style.fontStyle === 'italic' &&
                            style.textDecorationLine === 'none' &&
                            Number.parseFloat(style.borderBottomWidth) === 0 &&
                            ['none', 'normal'].includes(before.content) &&
                            ['none', 'normal'].includes(after.content) &&
                            style.color === inkColor
                        );
                    });
                    const requiresUniformRoutes = [
                        'architecture',
                        'workflow',
                        'data-flow',
                    ].includes(diagram.dataset.diagramType);
                    const lengths = edges.map((edge) => edge.getTotalLength());
                    const routesAreUniform =
                        !requiresUniformRoutes ||
                        Math.max(...lengths) - Math.min(...lengths) <= 2;
                    const diagramRect = diagram.getBoundingClientRect();
                    const nodeRects = nodes.map((node) =>
                        node.getBoundingClientRect(),
                    );
                    const nodeCenter =
                        (Math.min(...nodeRects.map((rect) => rect.left)) +
                            Math.max(...nodeRects.map((rect) => rect.right))) /
                        2;
                    const diagramCenter =
                        (diagramRect.left + diagramRect.right) / 2;
                    const nodesAreCentered =
                        !requiresUniformRoutes ||
                        Math.abs(nodeCenter - diagramCenter) <= 24;
                    const workflowIsStaggered =
                        diagram.dataset.diagramType !== 'workflow' ||
                        diagram.dataset.readingDirection !== 'left-to-right' ||
                        new Set(
                            nodeRects.map((rect) => Math.round(rect.top / 12)),
                        ).size >= 2;
                    return (
                        labelsAreClear &&
                        compactMarkers &&
                        arrowheadsAreClear &&
                        stagesArePlain &&
                        routesAreUniform &&
                        nodesAreCentered &&
                        workflowIsStaggered
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
                    arrows.every(
                        (arrow) => arrow.complete && arrow.naturalWidth > 0,
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
