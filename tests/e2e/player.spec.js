import { expect, test } from '@playwright/test';
import { strToU8, zipSync } from 'fflate';

function createDeck() {
    const deck = JSON.stringify({
        format: 'web-deck',
        version: 1,
        title: 'E2E deck',
        viewport: { width: 1920, height: 1080 },
        slides: [
            {
                id: 'one',
                title: 'First slide',
                source: 'slides/one/index.html',
            },
            {
                id: 'two',
                title: 'Second slide',
                source: 'slides/two/index.html',
            },
        ],
    });
    const activationScript = strToU8(`
        let activations = 0;
        window.addEventListener('web-deck:activate', () => {
            activations += 1;
            document.body.dataset.activations = String(activations);
        });
    `);

    return zipSync({
        'deck.json': strToU8(deck),
        'slides/one/index.html': strToU8(
            '<html><head><script src="script.js" defer></script></head><body style="background:#fff">First slide</body></html>',
        ),
        'slides/one/script.js': activationScript,
        'slides/two/index.html': strToU8(
            '<html><head><script src="script.js" defer></script></head><body style="background:#fff">Second slide</body></html>',
        ),
        'slides/two/script.js': activationScript,
    });
}

test('imports and navigates a web deck', async ({ page }) => {
    await page.goto('/');
    await page.locator('input[type="file"]').setInputFiles({
        name: 'deck.zip',
        mimeType: 'application/zip',
        buffer: Buffer.from(createDeck()),
    });

    await page.getByRole('button', { name: 'Empezar a presentar' }).click();

    const firstFrame = page.frameLocator(
        'iframe[aria-label="Diapositiva 1: First slide"]',
    );
    await expect(firstFrame.locator('body')).toContainText('First slide');
    await expect(firstFrame.locator('body')).toHaveAttribute(
        'data-activations',
        '1',
    );

    await expect(page.locator('iframe[title]')).toHaveCount(0);

    await page.keyboard.press('ArrowRight');
    await expect(
        page.locator(
            '[data-slide-state="waiting"] iframe[aria-label="Diapositiva 1: First slide"]',
        ),
    ).toHaveCount(1);
    await expect(page.locator('[data-slide-state="waiting"]')).toHaveAttribute(
        'inert',
        '',
    );

    const secondFrame = page.frameLocator(
        'iframe[aria-label="Diapositiva 2: Second slide"]',
    );
    await expect(secondFrame.locator('body')).toContainText('Second slide');
    await expect(secondFrame.locator('body')).toHaveAttribute(
        'data-activations',
        '1',
    );
    await expect(
        page.locator('iframe[aria-label="Diapositiva 1: First slide"]'),
    ).toHaveCount(0);
    await expect
        .poll(() =>
            page
                .locator('iframe[aria-label="Diapositiva 2: Second slide"]')
                .evaluate((frame) => document.activeElement === frame),
        )
        .toBe(true);

    await page.getByRole('button', { name: 'Abrir controles' }).click();
    await page.getByRole('button', { name: 'Mostrar timer' }).click();
    await expect(page.locator('time')).toHaveText('00:00:00');

    const positionButton = page.getByRole('button', {
        name: 'Posición del timer',
    });
    await positionButton.click();
    await expect(
        page.getByRole('button', { name: 'Abajo izquierda' }),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(
        page.getByRole('button', { name: 'Abajo izquierda' }),
    ).toHaveCount(0);
    await expect(positionButton).toBeFocused();

    await positionButton.click();
    await page.getByRole('button', { name: 'Abajo izquierda' }).click();
    await positionButton.click();
    await expect(
        page.getByRole('button', { name: 'Abajo izquierda' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: 'Ocultar timer' }).focus();
    await page.keyboard.press('ArrowLeft');
    await expect(
        page.locator('iframe[aria-label="Diapositiva 1: First slide"]'),
    ).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Abrir controles' })).toBeVisible();
    await expect
        .poll(() =>
            page
                .locator('iframe[aria-label="Diapositiva 1: First slide"]')
                .evaluate((frame) => document.activeElement === frame),
        )
        .toBe(true);

    await page.getByRole('button', { name: 'Abrir controles' }).click();
    await page.getByRole('button', { name: 'Pantalla completa' }).click();
    await expect
        .poll(() => page.evaluate(() => Boolean(document.fullscreenElement)))
        .toBe(true);
    await expect
        .poll(() =>
            page
                .locator('iframe[aria-label="Diapositiva 1: First slide"]')
                .evaluate((frame) => document.activeElement === frame),
        )
        .toBe(true);
    await page.evaluate(() => document.exitFullscreen());
    await expect
        .poll(() => page.evaluate(() => Boolean(document.fullscreenElement)))
        .toBe(false);

    await page.getByRole('button', { name: 'Abrir controles' }).click();
    await page.getByRole('button', { name: 'Ocultar timer' }).focus();
    await page.keyboard.press('Space');
    await expect(
        page.getByRole('button', { name: 'Mostrar timer' }),
    ).toBeVisible();
});
