/* global Event, Node, URL, document, getComputedStyle, window */

import { chromium } from '@playwright/test';
import { pathToFileURL } from 'node:url';

export async function auditDeckContrast(sourceRoot, deck) {
    let browser;
    try {
        browser = await chromium.launch({ headless: true });
    } catch {
        throw new Error(
            'No se pudo iniciar Chromium para auditar contraste. Ejecuta: npx playwright install chromium',
        );
    }

    const page = await browser.newPage({
        viewport: deck.viewport,
        deviceScaleFactor: 1,
    });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const failures = [];

    try {
        for (const slide of deck.slides) {
            const slidePath = new URL(
                slide.source,
                pathToFileURL(`${sourceRoot}/`),
            );
            await page.goto(slidePath.href, { waitUntil: 'networkidle' });
            await page.evaluate(() => {
                document.documentElement.classList.add('is-active');
                window.dispatchEvent(new Event('web-deck:activate'));
            });
            failures.push(
                ...(await page.evaluate(auditVisibleContrast, slide.id)),
            );
            failures.push(
                ...(await page.evaluate(auditAcademicSoberLayout, slide.id)),
            );
        }
    } finally {
        await page.close();
        await browser.close();
    }

    if (failures.length > 0) {
        throw new Error(
            `Auditoria visual fallida:\n${failures
                .map((failure) =>
                    failure.message
                        ? `- ${failure.slide}: ${failure.selector} (${failure.message})`
                        : `- ${failure.slide}: ${failure.selector} (${failure.foreground} sobre ${failure.background}, ${failure.ratio}${failure.ratio === 'N/A' ? '' : ':1'}; requiere ${failure.required === 'verificacion' ? 'una superficie verificable' : `${failure.required}:1`})`,
                )
                .join('\n')}`,
        );
    }
}

function auditVisibleContrast(slideId) {
    const failures = [];
    const elements = [...document.querySelectorAll('*')];
    for (const element of elements) {
        if (element.matches('[data-contrast-exempt]')) continue;
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        const hasText = [...element.childNodes].some(
            (node) =>
                node.nodeType === Node.TEXT_NODE && node.textContent.trim(),
        );
        const isSvgText = element.matches('svg text');
        const isGraphic = element.matches(
            'svg path, svg line, svg polyline, svg polygon, svg rect, svg circle, svg ellipse, svg text, [data-contrast-role="graphic"], [data-contrast-role="icon"]',
        );
        const isMaskedIcon = element.matches(
            '.deck-icon[data-contrast-role="icon"]',
        );
        if (!hasText && !isGraphic) continue;
        if (
            rect.width === 0 ||
            rect.height === 0 ||
            style.visibility === 'hidden' ||
            Number(style.opacity) === 0
        )
            continue;

        const foregrounds = graphicColors(style, {
            hasText,
            isGraphic,
            isMaskedIcon,
            isSvgText,
        });
        const background = findBackground(
            isMaskedIcon ? element.parentElement : element,
        );
        if (foregrounds.length === 0 || !background) {
            failures.push({
                slide: slideId,
                selector: element.tagName.toLowerCase(),
                foreground: foregrounds.length
                    ? formatColor(foregrounds[0].color)
                    : 'color no verificable',
                background: 'superficie no verificable',
                ratio: 'N/A',
                required: 'verificacion',
            });
            continue;
        }
        for (const foreground of foregrounds) {
            const resolvedForeground = composite(foreground.color, background);
            const ratio = contrastRatio(resolvedForeground, background);
            const fontSize = Number.parseFloat(style.fontSize);
            const isLarge =
                hasText &&
                (fontSize >= 24 ||
                    (fontSize >= 18.66 && Number(style.fontWeight) >= 700));
            const required = foreground.graphic || isLarge ? 3 : 4.5;
            if (ratio < required) {
                failures.push({
                    slide: slideId,
                    selector: `${element.tagName.toLowerCase()}${foreground.kind ? `[${foreground.kind}]` : ''}`,
                    foreground: formatColor(resolvedForeground),
                    background: formatColor(background),
                    ratio: ratio.toFixed(2),
                    required,
                });
            }
        }
    }
    return failures;
}

function graphicColors(style, { hasText, isGraphic, isMaskedIcon, isSvgText }) {
    if (isMaskedIcon) {
        const color = parseColor(style.backgroundColor);
        return color ? [{ color, graphic: true, kind: 'mask' }] : [];
    }
    if (!isGraphic) {
        const color = parseColor(style.color);
        return color ? [{ color, graphic: false, kind: '' }] : [];
    }

    const colors = [];
    const fill = style.fill !== 'none' ? parseColor(style.fill) : null;
    if (fill && fill.a > 0) {
        colors.push({ color: fill, graphic: !isSvgText, kind: 'fill' });
    }
    const stroke = style.stroke !== 'none' ? parseColor(style.stroke) : null;
    if (stroke && stroke.a > 0 && Number.parseFloat(style.strokeWidth) > 0) {
        colors.push({ color: stroke, graphic: !isSvgText, kind: 'stroke' });
    }
    if (colors.length === 0 && hasText) {
        const color = parseColor(style.color);
        if (color) colors.push({ color, graphic: false, kind: '' });
    }
    return colors;
}

function auditAcademicSoberLayout(slideId) {
    if (document.body.dataset.template !== 'academic-sober') return [];

    const failures = [];
    const structure = document.body.dataset.slideStructure;
    if (!structure) {
        return [
            {
                slide: slideId,
                selector: 'body',
                message: 'falta data-slide-structure',
            },
        ];
    }

    if (structure !== 'cover' && structure !== 'closing') {
        const slideBody = document.querySelector('[data-slide-body]');
        if (!slideBody || slideBody.dataset.verticalAlign !== 'center') {
            failures.push({
                slide: slideId,
                selector: '[data-slide-body]',
                message: 'el cuerpo debe declarar alineacion vertical centrada',
            });
        } else if (slideBody.firstElementChild) {
            const bodyRect = slideBody.getBoundingClientRect();
            const compositionRect =
                slideBody.firstElementChild.getBoundingClientRect();
            const bodyCenter = bodyRect.top + bodyRect.height / 2;
            const compositionCenter =
                compositionRect.top + compositionRect.height / 2;
            if (Math.abs(bodyCenter - compositionCenter) > 12) {
                failures.push({
                    slide: slideId,
                    selector: '[data-slide-body]',
                    message: 'la composicion no esta centrada verticalmente',
                });
            }
        }
    }

    for (const element of document.querySelectorAll('body *')) {
        if (
            element.closest('.visually-hidden') ||
            element.matches('script, style, defs, defs *, [aria-hidden="true"]')
        ) {
            continue;
        }
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        if (
            rect.width === 0 ||
            rect.height === 0 ||
            style.visibility === 'hidden' ||
            Number(style.opacity) === 0
        ) {
            continue;
        }
        const hasDirectText = [...element.childNodes].some(
            (node) =>
                node.nodeType === Node.TEXT_NODE && node.textContent.trim(),
        );
        if (hasDirectText && style.textTransform === 'uppercase') {
            failures.push({
                slide: slideId,
                selector: element.tagName.toLowerCase(),
                message:
                    'academic-sober no permite transformar texto a mayusculas',
            });
        }
        if (hasDirectText && Number.parseFloat(style.fontSize) < 20) {
            failures.push({
                slide: slideId,
                selector: element.tagName.toLowerCase(),
                message: `texto de ${style.fontSize}; requiere al menos 20px`,
            });
        }
        if (
            rect.left < -1 ||
            rect.top < -1 ||
            rect.right > window.innerWidth + 1 ||
            rect.bottom > window.innerHeight + 1
        ) {
            failures.push({
                slide: slideId,
                selector: element.tagName.toLowerCase(),
                message: 'contenido fuera del viewport',
            });
        }
    }

    if (structure === 'pillars') {
        const units = [...document.querySelectorAll('[data-thematic-unit]')];
        for (let index = 0; index < units.length - 1; index += 1) {
            const left = units[index].getBoundingClientRect();
            const right = units[index + 1].getBoundingClientRect();
            const sharesRow =
                Math.min(left.bottom, right.bottom) >
                Math.max(left.top, right.top);
            const gap = right.left - left.right;
            if (sharesRow && gap < 64) {
                failures.push({
                    slide: slideId,
                    selector: '[data-thematic-unit]',
                    message: `separacion de ${Math.round(gap)}px; requiere 64px`,
                });
            }
        }
    }

    if (structure === 'comparison' || structure === 'narrative-elements') {
        const selector =
            structure === 'comparison'
                ? '[data-comparison-option]'
                : '[data-narrative-element]';
        for (const unit of document.querySelectorAll(selector)) {
            const style = getComputedStyle(unit);
            if (
                Number.parseFloat(style.borderTopWidth) > 0 ||
                Number.parseFloat(style.borderBottomWidth) > 0
            ) {
                failures.push({
                    slide: slideId,
                    selector,
                    message:
                        'las unidades abiertas no deben usar barras o separadores',
                });
            }
        }
    }

    if (structure === 'process') {
        const steps = [...document.querySelectorAll('[data-process-step]')];
        const connectors = document.querySelector('[data-process-connectors]');
        if (!connectors) {
            failures.push({
                slide: slideId,
                selector: '[data-process-connectors]',
                message: 'falta la continuidad visual entre pasos',
            });
        }
        for (let index = 1; index < steps.length; index += 1) {
            const previous = steps[index - 1].getBoundingClientRect();
            const current = steps[index].getBoundingClientRect();
            if (
                current.left <= previous.left ||
                Math.abs(current.top - previous.top) > 12
            ) {
                failures.push({
                    slide: slideId,
                    selector: '[data-process-step]',
                    message:
                        'los pasos deben formar una progresion horizontal uniforme',
                });
                break;
            }
        }
        const arrows = [...document.querySelectorAll('[data-process-arrow]')];
        const arrowRects = arrows.map((arrow) => arrow.getBoundingClientRect());
        if (
            arrowRects.some((rect) => rect.width > 48 || rect.height > 48) ||
            arrowRects.some(
                (rect) => Math.abs(rect.top - arrowRects[0].top) > 2,
            )
        ) {
            failures.push({
                slide: slideId,
                selector: '[data-process-arrow]',
                message:
                    'las flechas deben ser conectores pequenos y alineados',
            });
        }
    }

    if (structure === 'system-diagram') {
        const diagram = document.querySelector('[data-diagram]');
        if (diagram) {
            const rect = diagram.getBoundingClientRect();
            if (
                rect.width < window.innerWidth * 0.7 ||
                rect.height < window.innerHeight * 0.4
            ) {
                failures.push({
                    slide: slideId,
                    selector: '[data-diagram]',
                    message: 'el diagrama no ocupa el cuerpo principal',
                });
            }
        }
        const nodes = [...document.querySelectorAll('[data-diagram-node]')];
        for (let leftIndex = 0; leftIndex < nodes.length; leftIndex += 1) {
            const left = nodes[leftIndex].getBoundingClientRect();
            for (
                let rightIndex = leftIndex + 1;
                rightIndex < nodes.length;
                rightIndex += 1
            ) {
                const right = nodes[rightIndex].getBoundingClientRect();
                if (
                    left.left < right.right &&
                    left.right > right.left &&
                    left.top < right.bottom &&
                    left.bottom > right.top
                ) {
                    failures.push({
                        slide: slideId,
                        selector: '[data-diagram-node]',
                        message: 'dos nodos se superponen',
                    });
                }
            }
        }
    }

    return failures;
}

function findBackground(element) {
    let current = element;
    while (current) {
        const style = getComputedStyle(current);
        const color = parseColor(style.backgroundColor);
        if (color && color.a >= 0.99) return color;
        if (style.backgroundImage !== 'none') return null;
        current = current.parentElement;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
}

function composite(foreground, background) {
    if (foreground.a >= 0.99) return foreground;
    return {
        r: foreground.r * foreground.a + background.r * (1 - foreground.a),
        g: foreground.g * foreground.a + background.g * (1 - foreground.a),
        b: foreground.b * foreground.a + background.b * (1 - foreground.a),
        a: 1,
    };
}

function parseColor(value) {
    const match = value.match(/rgba?\(([^)]+)\)/i);
    if (match) {
        const parts = match[1]
            .split(',')
            .map((part) => Number.parseFloat(part));
        if (parts.length < 3 || parts.some(Number.isNaN)) return null;
        return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 };
    }
    const hex = value.match(/^#([0-9a-f]{3,8})$/i);
    if (!hex) return null;
    const digits = hex[1].length;
    const expanded =
        digits <= 4
            ? [...hex[1]].map((digit) => digit + digit).join('')
            : hex[1];
    return {
        r: Number.parseInt(expanded.slice(0, 2), 16),
        g: Number.parseInt(expanded.slice(2, 4), 16),
        b: Number.parseInt(expanded.slice(4, 6), 16),
        a:
            expanded.length === 8
                ? Number.parseInt(expanded.slice(6), 16) / 255
                : 1,
    };
}

function contrastRatio(left, right) {
    const leftLum = luminance(left);
    const rightLum = luminance(right);
    return (
        (Math.max(leftLum, rightLum) + 0.05) /
        (Math.min(leftLum, rightLum) + 0.05)
    );
}

function luminance(color) {
    const channels = [color.r, color.g, color.b].map(
        (channel) => channel / 255,
    );
    const linear = channels.map((channel) =>
        channel <= 0.03928
            ? channel / 12.92
            : ((channel + 0.055) / 1.055) ** 2.4,
    );
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function formatColor(color) {
    return `rgb(${color.r}, ${color.g}, ${color.b})`;
}
