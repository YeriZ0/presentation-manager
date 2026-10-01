import { createSlideBridge } from '../../../runtime/slide-bridge.js';

function installSnapshotBridge(slideId) {
    let jobId = null;
    const send = (type, payload = {}) =>
        window.parent.postMessage(
            {
                namespace: 'web-deck:pptx',
                version: 1,
                type,
                jobId,
                slideId,
                ...payload,
            },
            '*',
        );

    function waitForPreparation() {
        return new Promise((resolve, reject) => {
            const waits = [];
            const event = new CustomEvent('web-deck:export-prepare', {
                detail: {
                    waitUntil: (promise) =>
                        waits.push(Promise.resolve(promise)),
                },
            });
            window.dispatchEvent(event);

            const timeout = window.setTimeout(
                () =>
                    reject(
                        new Error(
                            'La preparación para exportar superó el tiempo límite',
                        ),
                    ),
                20000,
            );
            Promise.all(waits).then(
                () => {
                    window.clearTimeout(timeout);
                    resolve();
                },
                (error) => {
                    window.clearTimeout(timeout);
                    reject(error);
                },
            );
        });
    }

    function withTimeout(promise, timeoutMs, message) {
        return new Promise((resolve, reject) => {
            const timeout = window.setTimeout(
                () => finish(reject, new Error(message)),
                timeoutMs,
            );
            function finish(callback, value) {
                window.clearTimeout(timeout);
                callback(value);
            }
            promise.then(
                (value) => finish(resolve, value),
                (error) => finish(reject, error),
            );
        });
    }

    async function waitForAssets() {
        await withTimeout(
            document.fonts?.ready || Promise.resolve(),
            1500,
            'Tiempo de espera agotado al cargar las fuentes',
        ).catch(() => {});
        await Promise.all(
            Array.from(document.images, async (image) => {
                try {
                    await withTimeout(
                        image.decode(),
                        10000,
                        'Tiempo de espera agotado al cargar una imagen',
                    );
                } catch {
                    if (!image.complete || !image.naturalWidth) {
                        throw new Error('No se pudo cargar una imagen');
                    }
                }
            }),
        );
        await new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
        );
    }

    async function finishAnimations() {
        const animations = document.getAnimations();
        const infinite = animations.filter(
            (animation) =>
                animation.effect?.getTiming().iterations === Infinity,
        );
        infinite.forEach((animation) => animation.cancel());

        await Promise.race([
            Promise.all(
                animations
                    .filter((animation) => !infinite.includes(animation))
                    .map((animation) => animation.finished.catch(() => {})),
            ),
            new Promise((resolve) => window.setTimeout(resolve, 8000)),
        ]);

        animations
            .filter(
                (animation) =>
                    !infinite.includes(animation) &&
                    animation.playState !== 'finished',
            )
            .forEach((animation) => {
                try {
                    animation.finish();
                } catch {
                    animation.cancel();
                }
            });
    }

    async function inlineTree(root) {
        let clone = root.cloneNode(true);
        if (root.localName === 'body') {
            const container = document.createElement('div');
            for (const attribute of Array.from(clone.attributes)) {
                container.setAttribute(attribute.name, attribute.value);
            }
            container.append(...clone.childNodes);
            clone = container;
        }
        const originals = [root, ...root.querySelectorAll('*')];
        const copies = [clone, ...clone.querySelectorAll('*')];
        const idMap = new Map();
        const rootRect = root.getBoundingClientRect();

        function rewriteReferences(value) {
            return value.replace(
                /url\(\s*(['"]?)(.*?)\1\s*\)/g,
                (match, quote, url) => {
                    const fragment = url.slice(url.lastIndexOf('#') + 1);
                    return url.includes('#') && idMap.has(fragment)
                        ? `url(#${idMap.get(fragment)})`
                        : match;
                },
            );
        }

        function recordBox(source, target, computed) {
            if (source !== root && source.parentElement?.closest('svg, table'))
                return;
            const parent = source.parentElement;
            const parentDisplay = parent
                ? getComputedStyle(parent).display
                : '';
            const inline =
                computed.display === 'inline' &&
                !/flex|grid/.test(parentDisplay) &&
                !['img', 'canvas'].includes(source.localName);
            if (inline && source !== root) return;
            const rect = source.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            target.setAttribute(
                'data-export-box',
                JSON.stringify([
                    rect.left - rootRect.left,
                    rect.top - rootRect.top,
                    rect.width,
                    rect.height,
                ]),
            );
        }

        async function convertMaskedIcon(source, target, computed) {
            const mask =
                computed.maskImage !== 'none'
                    ? computed.maskImage
                    : computed.webkitMaskImage;
            const match = mask?.match(/^url\((['"]?)(.*?)\1\)$/);
            if (!match)
                throw new Error(
                    'La máscara del icono no tiene un recurso exportable',
                );
            const image = new Image();
            image.crossOrigin = 'anonymous';
            image.src = match[2];
            await withTimeout(
                image.decode(),
                10000,
                'No se pudo cargar la máscara del icono',
            );
            const rect = source.getBoundingClientRect();
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.ceil(rect.width * 3));
            canvas.height = Math.max(1, Math.ceil(rect.height * 3));
            const context = canvas.getContext('2d');
            const scale = Math.min(
                canvas.width / image.naturalWidth,
                canvas.height / image.naturalHeight,
            );
            const width = image.naturalWidth * scale;
            const height = image.naturalHeight * scale;
            context.drawImage(
                image,
                (canvas.width - width) / 2,
                (canvas.height - height) / 2,
                width,
                height,
            );
            context.globalCompositeOperation = 'source-in';
            context.fillStyle = computed.backgroundColor;
            context.fillRect(0, 0, canvas.width, canvas.height);
            const replacement = document.createElement('img');
            for (const attribute of Array.from(target.attributes)) {
                replacement.setAttribute(attribute.name, attribute.value);
            }
            replacement.src = canvas.toDataURL('image/png');
            replacement.removeAttribute('srcset');
            replacement.style.mask = 'none';
            replacement.style.webkitMask = 'none';
            replacement.style.background = 'transparent';
            replacement.style.objectFit = 'contain';
            replacement.setAttribute('data-export-mask-icon', '');
            target.replaceWith(replacement);
        }

        for (let index = 0; index < originals.length; index += 1) {
            for (const pseudo of ['::before', '::after']) {
                const style = getComputedStyle(originals[index], pseudo);
                const content = style.content;
                if (
                    !content ||
                    ['none', 'normal', '""', "''"].includes(content)
                ) {
                    continue;
                }
                const match = content.match(/^(['"])(.*)\1$/s);
                if (!match) continue;
                const element = document.createElement('span');
                element.setAttribute('aria-hidden', 'true');
                element.setAttribute('data-export-pseudo', pseudo.slice(2));
                element.textContent = match[2];
                let cssText = '';
                for (
                    let propertyIndex = 0;
                    propertyIndex < style.length;
                    propertyIndex += 1
                ) {
                    const property = style[propertyIndex];
                    if (property === 'content') continue;
                    cssText += `${property}:${style.getPropertyValue(property)};`;
                }
                element.setAttribute('style', cssText);
                if (pseudo === '::before') copies[index].prepend(element);
                else copies[index].append(element);
            }
        }

        originals.forEach((source) => {
            if (source.id) idMap.set(source.id, `${slideId}-${source.id}`);
        });

        for (let index = 0; index < originals.length; index += 1) {
            const source = originals[index];
            const target = copies[index];
            if (!target) continue;
            const tag = source.localName;
            if (
                [
                    'script',
                    'style',
                    'link',
                    'meta',
                    'base',
                    'form',
                    'iframe',
                    'object',
                    'embed',
                    'animate',
                    'animatemotion',
                    'animatetransform',
                    'set',
                ].includes(tag)
            ) {
                target.remove();
                continue;
            }

            for (const attribute of Array.from(target.attributes)) {
                if (attribute.name.startsWith('data-export-')) {
                    target.removeAttribute(attribute.name);
                    continue;
                }
                if (
                    /^on/i.test(attribute.name) ||
                    attribute.name === 'srcdoc'
                ) {
                    target.removeAttribute(attribute.name);
                } else if (
                    ['href', 'src', 'xlink:href'].includes(attribute.name) &&
                    attribute.value
                        .trimStart()
                        .toLowerCase()
                        .startsWith('javascript:')
                ) {
                    target.removeAttribute(attribute.name);
                } else {
                    target.setAttribute(
                        attribute.name,
                        rewriteReferences(attribute.value),
                    );
                }
            }

            if (target.id && idMap.has(source.id)) {
                target.id = idMap.get(source.id);
            }
            for (const attribute of ['href', 'xlink:href']) {
                const value = target.getAttribute(attribute);
                if (value?.startsWith('#') && idMap.has(value.slice(1))) {
                    target.setAttribute(
                        attribute,
                        `#${idMap.get(value.slice(1))}`,
                    );
                }
            }

            const computed = getComputedStyle(source);
            let cssText = '';
            for (let index = 0; index < computed.length; index += 1) {
                const property = computed[index];
                const value = rewriteReferences(
                    computed.getPropertyValue(property),
                );
                cssText += `${property}:${value};`;
            }
            target.setAttribute('style', cssText);
            recordBox(source, target, computed);

            if (
                source.namespaceURI !== 'http://www.w3.org/2000/svg' &&
                ((computed.maskImage && computed.maskImage !== 'none') ||
                    (computed.webkitMaskImage &&
                        computed.webkitMaskImage !== 'none'))
            ) {
                await convertMaskedIcon(source, target, computed);
                continue;
            }

            if (tag === 'canvas') {
                try {
                    const image = document.createElement('img');
                    image.src = source.toDataURL('image/png');
                    image.setAttribute('style', cssText);
                    const box = target.getAttribute('data-export-box');
                    if (box) image.setAttribute('data-export-box', box);
                    target.replaceWith(image);
                } catch {
                    throw new Error(
                        'No se puede exportar un canvas con contenido de otro origen',
                    );
                }
            }
        }

        return clone.outerHTML;
    }

    function collectLocalFontFaces() {
        const faces = [];
        for (const sheet of document.styleSheets) {
            let rules;
            try {
                rules = sheet.cssRules;
            } catch {
                continue;
            }

            for (const rule of rules) {
                if (rule.type !== CSSRule.FONT_FACE_RULE) continue;
                const family = rule.style
                    .getPropertyValue('font-family')
                    .trim();
                const sources = Array.from(
                    rule.style
                        .getPropertyValue('src')
                        .matchAll(
                            /url\((['"]?)((?:data:|https:\/\/)[^'")]+)\1\)/g,
                        ),
                    (match) => match[2],
                );
                if (!family || sources.length === 0) continue;
                faces.push({
                    family: family.replace(/^['"]|['"]$/g, ''),
                    weight:
                        rule.style.getPropertyValue('font-weight').trim() ||
                        '400',
                    style:
                        rule.style.getPropertyValue('font-style').trim() ||
                        'normal',
                    sources,
                });
            }
        }
        return faces;
    }

    window.addEventListener('message', async (event) => {
        if (
            event.source !== window.parent ||
            event.data?.namespace !== 'web-deck:pptx' ||
            event.data.version !== 1 ||
            event.data.type !== 'capture' ||
            event.data.slideId !== slideId
        ) {
            return;
        }

        jobId = event.data.jobId;
        try {
            await waitForPreparation();
            await waitForAssets();
            await finishAnimations();
            await waitForAssets();

            const roots = Array.from(document.querySelectorAll('.slide'));
            if (roots.length > 1) {
                throw new Error(
                    'Se encontró más de una raíz .slide en la diapositiva',
                );
            }
            const root = roots[0] || document.body;
            if (!root)
                throw new Error('No se encontró contenido para exportar');

            const rect = root.getBoundingClientRect();
            if (!rect.width || !rect.height) {
                throw new Error('La diapositiva no tiene dimensiones visibles');
            }
            send('snapshot', {
                snapshot: {
                    html: await inlineTree(root),
                    width: rect.width,
                    height: rect.height,
                    fontFaces: collectLocalFontFaces(),
                },
            });
        } catch (error) {
            send('error', {
                error: error.message || 'Error al preparar la diapositiva',
            });
        }
    });
}

export function createSnapshotBridge(slideId) {
    const script = `<script>(${installSnapshotBridge.toString()})(${JSON.stringify(slideId)})</script>`;
    return `${createSlideBridge(slideId)}${script}`;
}
