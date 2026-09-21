/* global document, getComputedStyle, DOMPoint */

// These functions are self-contained for Playwright page.evaluate
export function auditAcademicDecorations(slideId) {
    const failures = [];
    const fail = (element, message) =>
        failures.push({
            slide: slideId,
            selector: element.tagName.toLowerCase(),
            message,
        });
    for (const element of document.querySelectorAll(
        '[data-template="academic-sober"], [data-template="academic-sober"] *',
    )) {
        if (
            element.closest('defs, .visually-hidden, .sr-only') ||
            element.matches('script, style')
        )
            continue;
        const style = getComputedStyle(element);
        if (
            style.display === 'none' ||
            style.visibility === 'hidden' ||
            Number(style.opacity) === 0
        )
            continue;
        const sides = ['Top', 'Right', 'Bottom', 'Left'];
        const widths = sides.map((side) =>
            Number.parseFloat(style[`border${side}Width`]),
        );
        const closed = widths.every((width) => width > 0);
        const peerSelector =
            '[data-thematic-unit], [data-comparison-option], [data-narrative-element], [data-process-step]';
        const openContent =
            element.closest(peerSelector) ||
            element.querySelector(peerSelector);
        const frame =
            element.matches('[data-frame="graphite"], [data-frame="accent"]') &&
            !element.closest(peerSelector);
        const tableCell = element.matches('td, th') && element.closest('table');
        const boundary = element.matches(
            '[data-diagram-node], pre, [data-boundary="semantic"], [data-frame="graphite"], [data-frame="accent"]',
        );
        if (
            widths.some((width) => width > 0) &&
            !tableCell &&
            !(boundary && closed && (!openContent || frame))
        ) {
            fail(
                element,
                'academic-sober no permite bordes decorativos; solo contornos funcionales',
            );
        }
        if (
            Number.parseFloat(style.outlineWidth) > 0 &&
            style.outlineStyle !== 'none' &&
            openContent &&
            !frame
        ) {
            fail(
                element,
                'las unidades abiertas no admiten recuadros mediante outline',
            );
        }
        const canvas = element.closest('[data-template="academic-sober"]');
        const canvasBackground = getComputedStyle(canvas).backgroundColor;
        const background = style.backgroundColor;
        if (
            openContent &&
            !frame &&
            background !== 'transparent' &&
            background !== 'rgba(0, 0, 0, 0)' &&
            background !== canvasBackground &&
            background !== 'rgb(255, 255, 255)'
        ) {
            fail(
                element,
                'las unidades abiertas no admiten superficies de tarjeta',
            );
        }
        if (element.matches('hr, [role="separator"]'))
            fail(element, 'academic-sober no permite separadores decorativos');
        if (style.boxShadow !== 'none')
            fail(element, 'academic-sober no permite sombras decorativas');
        if (/gradient\(/i.test(style.backgroundImage))
            fail(
                element,
                'academic-sober no permite fondos con separadores o gradientes decorativos',
            );
        for (const pseudo of ['::before', '::after']) {
            const decoration = getComputedStyle(element, pseudo);
            if (
                ['none', 'normal'].includes(decoration.content) ||
                decoration.display === 'none' ||
                Number(decoration.opacity) === 0
            )
                continue;
            const text = !['', '""', "''"].includes(decoration.content);
            const border = sides.some(
                (side) =>
                    Number.parseFloat(decoration[`border${side}Width`]) > 0,
            );
            const surface =
                decoration.backgroundImage !== 'none' ||
                (decoration.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
                    decoration.backgroundColor !== 'transparent');
            if (
                text ||
                border ||
                decoration.boxShadow !== 'none' ||
                (surface &&
                    Number.parseFloat(decoration.width) > 0 &&
                    Number.parseFloat(decoration.height) > 0)
            ) {
                fail(
                    element,
                    `academic-sober no permite contenido o separadores decorativos en ${pseudo}`,
                );
            }
        }
    }
    return failures;
}

export function auditNumberedProcesses(slideId) {
    const failures = [];
    for (const process of document.querySelectorAll(
        '[data-template="academic-sober"][data-slide-structure="process"]',
    )) {
        const fail = (message) =>
            failures.push({
                slide: slideId,
                selector: '[data-process]',
                message,
            });
        if (
            process.querySelector(
                '[data-process-connectors], [data-process-arrow], svg, [role="separator"]',
            )
        ) {
            fail('process usa numeración, sin flechas ni conectores');
        }
        const steps = [
            ...process.querySelectorAll('ol > li[data-process-step]'),
        ];
        if (steps.length < 3 || steps.length > 5)
            fail('process requiere de tres a cinco pasos');
        const rects = steps.map((step) => step.getBoundingClientRect());
        for (let index = 0; index < steps.length; index++) {
            const number = steps[index].querySelector('[data-step-number]');
            const text = number?.textContent.trim();
            if (
                !/^\d+$/.test(text ?? '') ||
                Number(text) !== index + 1 ||
                !number.getBoundingClientRect().width ||
                getComputedStyle(number).visibility === 'hidden' ||
                Number(getComputedStyle(number).opacity) === 0
            )
                fail('la numeración debe ser visible y consecutiva desde 1');
            if (
                index > 0 &&
                (rects[index].left < rects[index - 1].right ||
                    Math.abs(rects[index].top - rects[0].top) > 12)
            ) {
                fail(
                    'los pasos deben formar una progresión horizontal sin solapamientos',
                );
            }
        }
    }
    return failures;
}

export function auditDonutCharts(slideId) {
    const failures = [];
    const fail = (message) =>
        failures.push({
            slide: slideId,
            selector: '[data-chart-type="donut"]',
            message,
        });
    const visible = (element) => {
        if (
            !element ||
            !element.getBoundingClientRect().width ||
            !element.getBoundingClientRect().height
        )
            return false;
        for (let node = element; node; node = node.parentElement) {
            const style = getComputedStyle(node);
            if (
                style.display === 'none' ||
                style.visibility !== 'visible' ||
                Number(style.opacity) === 0
            )
                return false;
        }
        return true;
    };
    for (const marker of document.querySelectorAll(
        '[data-chart-segment], [data-chart-legend], [data-chart-center]',
    )) {
        if (
            marker.closest('[data-template="academic-sober"]') &&
            !marker.closest('figure[data-chart-type="donut"]')
        ) {
            fail(
                'los marcadores de dona requieren un figure con tipo explícito',
            );
        }
    }
    for (const chart of document.querySelectorAll(
        '[data-template="academic-sober"] figure[data-chart-type="donut"]',
    )) {
        const svg = chart.querySelector('svg');
        const segments = [...chart.querySelectorAll('[data-chart-segment]')];
        const entries = [...chart.querySelectorAll('[data-chart-legend]')];
        const ids = segments.map((segment) => segment.dataset.chartSegment);
        const values = segments.map((segment) => Number(segment.dataset.value));
        const cx = Number(chart.dataset.chartCx);
        const cy = Number(chart.dataset.chartCy);
        const inner = Number(chart.dataset.chartInnerRadius);
        const outer = Number(chart.dataset.chartOuterRadius);
        if (
            !svg ||
            chart.querySelectorAll('svg').length !== 1 ||
            segments.length < 3 ||
            segments.length > 5 ||
            new Set(ids).size !== ids.length ||
            ids.some((id) => !id) ||
            ![cx, cy, inner, outer, ...values].every(Number.isFinite) ||
            inner <= 0 ||
            outer <= inner ||
            values.some((value) => value <= 0) ||
            Math.abs(values.reduce((sum, value) => sum + value, 0) - 100) >
                0.001 ||
            segments.some(
                (segment) =>
                    segment.tagName.toLowerCase() !== 'path' ||
                    segment.ownerSVGElement !== svg,
            )
        ) {
            fail(
                'la dona necesita sectores path, IDs, valores, centro y radios válidos',
            );
            continue;
        }
        const shapes = [
            ...svg.querySelectorAll(
                'path, circle, ellipse, rect, polygon, polyline, line, use, image, foreignObject, text',
            ),
        ].filter((shape) => !shape.closest('defs'));
        if (shapes.some((shape) => !segments.includes(shape)))
            fail(
                'la dona no admite formas de fondo ni marcas SVG ajenas a sus sectores',
            );
        const styles = segments.map((segment) => getComputedStyle(segment));
        if (
            segments.some((segment, index) => {
                const style = styles[index];
                return (
                    !visible(segment) ||
                    style.fill === 'none' ||
                    style.fill === 'transparent' ||
                    (/^rgba\(/.test(style.fill) &&
                        Number.parseFloat(style.fill.split(',').at(-1)) < 1) ||
                    /url\(/.test(style.fill) ||
                    Number(style.fillOpacity) !== 1 ||
                    (style.stroke !== 'none' &&
                        Number.parseFloat(style.strokeWidth) > 0) ||
                    [segment, ...ancestors(segment, svg)].some((node) => {
                        const computed = getComputedStyle(node);
                        return (
                            Number(computed.opacity) !== 1 ||
                            computed.filter !== 'none' ||
                            computed.clipPath !== 'none' ||
                            computed.maskImage !== 'none'
                        );
                    })
                );
            })
        )
            fail(
                'los sectores deben ser visibles, opacos y sin trazos, efectos ni recortes',
            );
        if (new Set(styles.map((style) => style.fill)).size !== segments.length)
            fail('cada categoría necesita un color distinguible en la dona');
        const entryIds = entries.map((entry) => entry.dataset.chartLegend);
        if (
            entries.length !== segments.length ||
            new Set(entryIds).size !== entries.length ||
            entryIds.some((id) => !ids.includes(id))
        ) {
            fail('la leyenda debe corresponder uno a uno con los sectores');
        }
        for (const [index, segment] of segments.entries()) {
            const entry = entries.find(
                (item) => item.dataset.chartLegend === ids[index],
            );
            const swatch = entry?.querySelector('[data-chart-swatch]');
            if (
                !matchesText(entry, segment) ||
                !visible(swatch) ||
                getComputedStyle(swatch).backgroundColor !== styles[index].fill
            ) {
                fail(
                    'etiqueta, porcentaje o color de leyenda no coincide con su sector',
                );
            }
        }
        const maximum = Math.max(...values);
        const maxima = segments.filter(
            (segment) => Number(segment.dataset.value) === maximum,
        );
        const center = chart.querySelector('[data-chart-center]');
        const items = [
            ...(center?.querySelectorAll('[data-chart-center-item]') ?? []),
        ];
        if (
            !visible(center) ||
            center.closest('svg') ||
            items.length !== maxima.length ||
            new Set(items.map((item) => item.dataset.chartCenterItem)).size !==
                maxima.length ||
            maxima.some(
                (segment) =>
                    !matchesText(
                        items.find(
                            (item) =>
                                item.dataset.chartCenterItem ===
                                segment.dataset.chartSegment,
                        ),
                        segment,
                    ),
            ) ||
            segments.some(
                (segment) =>
                    segment.hasAttribute('data-chart-highlight') !==
                    maxima.includes(segment),
            ) ||
            (maxima.length > 1 &&
                (!visible(center?.querySelector('[data-chart-tie]')) ||
                    !center
                        .querySelector('[data-chart-tie]')
                        .textContent.trim()))
        ) {
            fail(
                'el centro y el énfasis deben identificar todos los máximos, con sus categorías y porcentajes',
            );
        }
        const matrix = svg.getScreenCTM();
        const inverses = segments.map((segment) =>
            segment.getScreenCTM()?.inverse(),
        );
        if (!matrix || inverses.some((inverse) => !inverse)) {
            fail('no se pudo medir la geometría de la dona');
            continue;
        }
        const canvas = chart.closest('[data-template="academic-sober"]');
        const canvasScale =
            canvas.getBoundingClientRect().width / canvas.offsetWidth || 1;
        const diameter =
            (outer * 2 * Math.hypot(matrix.a, matrix.b)) / canvasScale;
        if (diameter < 319 || diameter > 561)
            fail(
                'el diámetro visible de la dona debe estar entre 320 y 560px de autoría',
            );
        const centerText = [
            ...(center?.querySelectorAll(
                '[data-chart-label], [data-chart-value], [data-chart-tie]',
            ) ?? []),
        ];
        if (centerText.length) {
            const rects = centerText.map((element) =>
                element.getBoundingClientRect(),
            );
            const inverse = matrix.inverse();
            const outside = rects.some((rect) =>
                [
                    [rect.left, rect.top],
                    [rect.right, rect.top],
                    [rect.left, rect.bottom],
                    [rect.right, rect.bottom],
                ].some(([x, y]) => {
                    const point = new DOMPoint(x, y).matrixTransform(inverse);
                    return Math.hypot(point.x - cx, point.y - cy) > inner + 1;
                }),
            );
            const expected = new DOMPoint(cx, cy).matrixTransform(matrix);
            const midX =
                (Math.min(...rects.map((rect) => rect.left)) +
                    Math.max(...rects.map((rect) => rect.right))) /
                2;
            const midY =
                (Math.min(...rects.map((rect) => rect.top)) +
                    Math.max(...rects.map((rect) => rect.bottom))) /
                2;
            if (
                outside ||
                Math.abs(midX - expected.x) > 8 * canvasScale ||
                Math.abs(midY - expected.y) > 8 * canvasScale
            ) {
                fail(
                    'el texto central debe quedar centrado y completo dentro del hueco de la dona',
                );
            }
        }
        for (const text of chart.querySelectorAll(
            '[data-chart-label], [data-chart-value]',
        )) {
            const minimum =
                text.closest('[data-chart-center]') &&
                text.hasAttribute('data-chart-value')
                    ? 28
                    : 24;
            if (Number.parseFloat(getComputedStyle(text).fontSize) < minimum)
                fail(
                    'la dona contiene etiquetas o porcentajes demasiado pequeños',
                );
        }
        let previousEntry;
        for (const entry of entries) {
            const fields = [
                '[data-chart-swatch]',
                '[data-chart-label]',
                '[data-chart-value]',
            ].map((selector) =>
                entry.querySelector(selector)?.getBoundingClientRect(),
            );
            if (
                fields.every(Boolean) &&
                (fields[1].left - fields[0].right < 11 * canvasScale ||
                    fields[2].left - fields[1].right < 11 * canvasScale)
            ) {
                fail('la leyenda requiere campos separados al menos 12px');
            }
            const rect = entry.getBoundingClientRect();
            if (
                previousEntry &&
                rect.top - previousEntry.bottom < 11 * canvasScale
            )
                fail(
                    'las filas de leyenda requieren separación vertical de 12px',
                );
            previousEntry = rect;
        }
        for (const alternative of chart.querySelectorAll(
            '.sr-only, .visually-hidden',
        )) {
            const rect = alternative.getBoundingClientRect();
            const style = getComputedStyle(alternative);
            if (
                style.display === 'none' ||
                style.visibility === 'hidden' ||
                alternative.getAttribute('aria-hidden') === 'true' ||
                rect.width > 2 ||
                rect.height > 2 ||
                (style.clip === 'auto' && style.clipPath === 'none')
            ) {
                fail(
                    'la alternativa textual requiere ocultación visual accesible efectiva, no solo una clase',
                );
            }
        }
        const samples = 1440;
        let invalidGeometry = false;
        for (const fraction of [0.01, 0.25, 0.5, 0.75, 0.99]) {
            const radius = inner + (outer - inner) * fraction;
            const counts = segments.map(() => 0);
            for (let sample = 0; sample < samples; sample++) {
                const angle =
                    ((((sample + 0.37) / samples) * 360 - 90) * Math.PI) / 180;
                const point = new DOMPoint(
                    cx + radius * Math.cos(angle),
                    cy + radius * Math.sin(angle),
                ).matrixTransform(matrix);
                let covering = 0;
                for (let index = 0; index < segments.length; index++) {
                    if (
                        segments[index].isPointInFill(
                            point.matrixTransform(inverses[index]),
                        )
                    ) {
                        covering++;
                        counts[index]++;
                    }
                }
                if (covering !== 1) invalidGeometry = true;
            }
            if (
                counts.some(
                    (count, index) =>
                        Math.abs((count / samples) * 100 - values[index]) >
                        100 / samples + 0.01,
                )
            )
                invalidGeometry = true;
        }
        // Probe outside the ring to detect incorrect shared radii or a filled center
        for (const radius of [0, inner * 0.99, outer * 1.01]) {
            for (let sample = 0; sample < 360; sample++) {
                const angle = ((sample + 0.37) * Math.PI) / 180;
                const point = new DOMPoint(
                    cx + radius * Math.cos(angle),
                    cy + radius * Math.sin(angle),
                ).matrixTransform(matrix);
                if (
                    segments.some((segment, index) =>
                        segment.isPointInFill(
                            point.matrixTransform(inverses[index]),
                        ),
                    )
                )
                    invalidGeometry = true;
            }
        }
        if (invalidGeometry)
            fail(
                'la geometría de la dona tiene huecos, solapamientos, radios o porcentajes incorrectos',
            );
    }
    return failures;

    function ancestors(element, stop) {
        const nodes = [];
        for (
            let node = element.parentElement;
            node;
            node = node.parentElement
        ) {
            nodes.push(node);
            if (node === stop) break;
        }
        return nodes;
    }
    function matchesText(entry, segment) {
        const label = entry?.querySelector('[data-chart-label]');
        const value = entry?.querySelector('[data-chart-value]');
        const match = value?.textContent
            .trim()
            .match(/^(\d+(?:[.,]\d+)?)\s*%$/);
        return (
            visible(entry) &&
            visible(label) &&
            visible(value) &&
            label.textContent.trim() === segment.dataset.label &&
            match &&
            Math.abs(
                Number(match[1].replace(',', '.')) -
                    Number(segment.dataset.value),
            ) < 0.001
        );
    }
}
