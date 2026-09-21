/* global document, getComputedStyle, Image, window */

// Self-contained browser checks for Playwright page.evaluate
export async function auditThematicIcons(slideId) {
    const failures = [];
    const selectors = {
        pillars: '[data-thematic-unit]',
        comparison: '[data-comparison-option]',
        process: '[data-process-step]',
        'narrative-elements': '[data-narrative-element]',
    };
    for (const canvas of document.querySelectorAll(
        '[data-template="academic-sober"]',
    )) {
        const selector = selectors[canvas.dataset.slideStructure];
        if (!selector) continue;
        const fail = (message) =>
            failures.push({ slide: slideId, selector, message });
        const omit = canvas.dataset.icons === 'none';
        if (
            omit &&
            !['user-request', 'no-semantic-match'].includes(
                canvas.dataset.iconOmission,
            )
        )
            fail('la omisión de iconos requiere una decisión explícita');
        for (const unit of canvas.querySelectorAll(selector)) {
            const icons = [...unit.querySelectorAll('.deck-icon')];
            if (icons.length !== (omit ? 0 : 1)) {
                fail(
                    'se requiere un icono semántico por unidad salvo omisión explícita',
                );
                continue;
            }
            if (omit) continue;
            const icon = icons[0];
            const rect = icon.getBoundingClientRect();
            let visible = rect.width > 0 && rect.height > 0;
            for (let node = icon; node; node = node.parentElement) {
                const style = getComputedStyle(node);
                if (
                    style.display === 'none' ||
                    style.visibility !== 'visible' ||
                    Number(style.opacity) === 0
                )
                    visible = false;
            }
            const style = getComputedStyle(icon);
            const large = ['pillars', 'comparison'].includes(
                canvas.dataset.slideStructure,
            );
            const minimum = large ? 96 : 72;
            const maximum = large ? 128 : 104;
            if (
                [style.width, style.height].some(
                    (size) =>
                        Number.parseFloat(size) < minimum ||
                        Number.parseFloat(size) > maximum,
                )
            ) {
                fail(
                    `el icono requiere una caja de ${minimum}–${maximum}px según su estructura`,
                );
            }
            const image = icon.tagName.toLowerCase() === 'img';
            const url = (
                style.maskImage !== 'none'
                    ? style.maskImage
                    : style.backgroundImage
            ).match(/^url\(["']?(.*?)["']?\)$/)?.[1];
            const loaded = image
                ? icon.complete && icon.naturalWidth > 0
                : url
                  ? await new Promise((resolve) => {
                        const resource = new Image();
                        const timeout = window.setTimeout(
                            () => resolve(false),
                            3000,
                        );
                        resource.onload = () => {
                            window.clearTimeout(timeout);
                            resolve(resource.naturalWidth > 0);
                        };
                        resource.onerror = () => {
                            window.clearTimeout(timeout);
                            resolve(false);
                        };
                        resource.src = url;
                    })
                  : false;
            if (
                !visible ||
                !loaded ||
                (!image &&
                    style.maskImage !== 'none' &&
                    ['transparent', 'rgba(0, 0, 0, 0)'].includes(
                        style.backgroundColor,
                    ))
            ) {
                fail(
                    'el icono debe ser visible y tener una imagen o máscara cargada',
                );
            }
        }
    }
    return failures;
}

export function auditThematicAlignment(slideId) {
    const failures = [];
    const structures = {
        pillars: [
            '[data-thematic-unit]',
            '[data-unit-topic]',
            '[data-unit-description]',
        ],
        comparison: [
            '[data-comparison-option]',
            '[data-unit-topic]',
            '[data-unit-description]',
        ],
        'narrative-elements': [
            '[data-narrative-element]',
            '[data-element-topic]',
            '[data-element-description]',
        ],
        process: [
            '[data-process-step]',
            '[data-step-title]',
            '[data-step-description]',
        ],
    };
    for (const canvas of document.querySelectorAll(
        '[data-template="academic-sober"]',
    )) {
        const structure = structures[canvas.dataset.slideStructure];
        if (!structure) continue;
        const [unitSelector, topicSelector, descriptionSelector] = structure;
        for (const unit of canvas.querySelectorAll(unitSelector)) {
            const unitRect = unit.getBoundingClientRect();
            const scale = unit.offsetWidth
                ? unitRect.width / unit.offsetWidth
                : 1;
            const center = unitRect.left + unitRect.width / 2;
            const parts = [
                ['tema', topicSelector, true],
                ['descripción', descriptionSelector, true],
                ['icono', '.deck-icon', false],
            ];
            if (canvas.dataset.slideStructure === 'process')
                parts.push(['número', '[data-step-number]', true]);
            for (const [label, selector, text] of parts) {
                const element = unit.querySelector(selector);
                if (!element && !text) continue;
                const fail = (message) =>
                    failures.push({
                        slide: slideId,
                        selector: `${unitSelector} ${selector}`,
                        message: `${label}: ${message}`,
                    });
                if (!element) {
                    fail('falta el elemento de la unidad');
                    continue;
                }
                const rect = element.getBoundingClientRect();
                let visible = rect.width > 0 && rect.height > 0;
                for (let node = element; node; node = node.parentElement) {
                    const style = getComputedStyle(node);
                    if (
                        style.display === 'none' ||
                        style.visibility !== 'visible' ||
                        Number(style.opacity) === 0
                    )
                        visible = false;
                }
                if (!visible || !unitRect.width) {
                    fail('el contenido de la unidad debe ser visible');
                    continue;
                }
                if (
                    Math.abs(rect.left + rect.width / 2 - center) >
                    8 * scale + 0.1
                ) {
                    fail(
                        'la caja debe estar centrada horizontalmente en su columna',
                    );
                }
                if (text && getComputedStyle(element).textAlign !== 'center') {
                    fail('el texto debe estar centrado, además de su caja');
                }
            }
        }
    }
    return failures;
}

export function auditCodeLayouts(slideId) {
    const failures = [];
    const fail = (message) =>
        failures.push({
            slide: slideId,
            selector: '[data-code-line]',
            message,
        });
    for (const canvas of document.querySelectorAll(
        '[data-template="academic-sober"][data-slide-structure="code"]',
    )) {
        for (const pre of canvas.querySelectorAll('pre')) {
            const rows = [...pre.querySelectorAll('[data-code-line]')];
            const scale =
                pre.getBoundingClientRect().height / pre.offsetHeight || 1;
            let previous;
            for (const [index, row] of rows.entries()) {
                const number = row.querySelector('[data-code-number]');
                const content = row.querySelector('[data-code-content]');
                if (
                    !number ||
                    !content ||
                    Number(number.textContent) !==
                        Number(pre.dataset.codeStart) + index ||
                    number.getAttribute('aria-hidden') !== 'true'
                ) {
                    fail(
                        'cada fila necesita número consecutivo y contenido separados',
                    );
                    continue;
                }
                const style = getComputedStyle(content);
                const fontSize = Number.parseFloat(style.fontSize);
                const lineHeight = Number.parseFloat(style.lineHeight);
                const rect = row.getBoundingClientRect();
                if (
                    fontSize < 22 ||
                    fontSize > 28 ||
                    !Number.isFinite(lineHeight) ||
                    lineHeight / fontSize < 1.34 ||
                    lineHeight / fontSize > 1.56
                ) {
                    fail(
                        'el código requiere 22–28px e interlineado de 1.35–1.55',
                    );
                }
                if (
                    Math.abs(rect.height - lineHeight * scale) > 2 ||
                    (previous && Math.abs(rect.top - previous.bottom) > 2)
                ) {
                    fail(
                        'una línea de código debe ocupar una sola fila sin espacios accidentales entre filas',
                    );
                }
                const range = document.createRange();
                range.selectNodeContents(content);
                const textRect = range.getBoundingClientRect();
                if (textRect.height > lineHeight * scale + 2)
                    fail('una línea de código se ha envuelto en varias filas');
                if (
                    !contained(number, number.getBoundingClientRect()) ||
                    !contained(content, textRect) ||
                    !contained(row, rect)
                ) {
                    fail(
                        'el código o sus números están ocultos, recortados o fuera del lienzo',
                    );
                }
                previous = rect;
            }
            if (
                pre.scrollHeight > pre.clientHeight + 1 ||
                pre.scrollWidth > pre.clientWidth + 1
            )
                fail(
                    'el bloque de código requiere desplazamiento o recorta contenido',
                );
        }
        for (const element of canvas.querySelectorAll(
            '[data-code-note], footer, .slide-footer',
        )) {
            if (!contained(element, element.getBoundingClientRect()))
                fail(
                    'la anotación o el pie del código queda oculto o fuera del lienzo',
                );
        }
    }
    return failures;

    function contained(element, rect) {
        if (
            !rect.width ||
            !rect.height ||
            rect.left < -1 ||
            rect.top < -1 ||
            rect.right > window.innerWidth + 1 ||
            rect.bottom > window.innerHeight + 1
        )
            return false;
        for (let parent = element; parent; parent = parent.parentElement) {
            const style = getComputedStyle(parent);
            if (
                style.display === 'none' ||
                style.visibility !== 'visible' ||
                Number(style.opacity) === 0
            )
                return false;
            const box = parent.getBoundingClientRect();
            if (
                /hidden|clip|auto|scroll/.test(style.overflowX) &&
                (rect.left < box.left - 1 || rect.right > box.right + 1)
            )
                return false;
            if (
                /hidden|clip|auto|scroll/.test(style.overflowY) &&
                (rect.top < box.top - 1 || rect.bottom > box.bottom + 1)
            )
                return false;
        }
        return true;
    }
}

export function auditSlideCounter({ slideId, index, total }) {
    if (document.body.dataset.template !== 'academic-sober') return [];
    const width = Math.max(2, String(total).length);
    const expected = `${String(index + 1).padStart(width, '0')} / ${String(total).padStart(width, '0')}`;
    const marked = [...document.querySelectorAll('[data-slide-counter]')];
    const containers = marked.length
        ? marked
        : [...document.querySelectorAll('footer, .slide-footer')];
    const candidates = [...new Set(containers)];
    const matches = candidates.filter((element) =>
        (element.textContent.match(/\b\d{2,} \/ \d{2,}\b/g) || []).includes(
            expected,
        ),
    );
    let valid = matches.length === 1;
    if (valid) {
        const counter =
            [...matches[0].querySelectorAll('*')].find(
                (element) =>
                    element.textContent.trim() === expected &&
                    !element.children.length,
            ) || matches[0];
        const rect = counter.getBoundingClientRect();
        valid =
            rect.width > 0 &&
            rect.height > 0 &&
            rect.left >= 0 &&
            rect.top >= 0 &&
            rect.right <= window.innerWidth + 1 &&
            rect.bottom <= window.innerHeight + 1;
        for (let node = counter; node; node = node.parentElement) {
            const style = getComputedStyle(node);
            const box = node.getBoundingClientRect();
            if (
                style.display === 'none' ||
                style.visibility !== 'visible' ||
                Number(style.opacity) === 0 ||
                (/hidden|clip|auto|scroll/.test(style.overflowY) &&
                    (rect.top < box.top - 1 || rect.bottom > box.bottom + 1))
            )
                valid = false;
        }
    }
    return valid
        ? []
        : [
              {
                  slide: slideId,
                  selector: '[data-slide-counter]',
                  message: `falta el contador visible y completo ${expected}`,
              },
          ];
}
