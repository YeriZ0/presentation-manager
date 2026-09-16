import { expect, test } from '@playwright/test';

test('renders the academic sober visual catalog directly', async ({ page }) => {
    await page.goto('/catalog/academic-sober/');

    await expect(page).toHaveTitle('Catalogo visual | Academica sobria');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(
        page.getByRole('heading', { name: 'Academica sobria' }),
    ).toBeVisible();
    await expect(page.locator('.slide-frame')).toHaveCount(16);
    await expect(page.locator('table')).toHaveCount(1);
    await expect(page.locator('svg')).toHaveCount(4);
    await expect(page.locator('iframe')).toHaveCount(0);
    await expect(page.locator('button')).toHaveCount(0);
    await expect(page.locator('input')).toHaveCount(0);
    await expect(page.locator('table caption')).toHaveText(
        'Comparacion de alternativas de despliegue',
    );
    await expect(page.locator('th[scope="col"]')).toHaveCount(4);
    await expect(page.locator('th[scope="row"]')).toHaveCount(4);
    await expect(page.locator('[data-chart-runtime="echarts"]')).toHaveCount(1);
    await expect(
        page.locator('[data-slide-structure="pillars"]'),
    ).toHaveCount(3);
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
                    const icon = unit.querySelector('.thematic-icon');
                    const description = unit.querySelector(
                        '[data-unit-description]',
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
});

test('catalog remains within the viewport at narrow width', async ({ page }) => {
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
            name: 'Las graficas son evidencia, no decoracion',
        }),
    ).toBeVisible();
});
