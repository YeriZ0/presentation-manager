import Ajv from 'ajv';
import schema from './deck.schema.json' with { type: 'json' };

const ajv = new Ajv({ allErrors: true, strict: false });
const validateSchema = ajv.compile(schema);

export function validateDeck(deck, files) {
    if (!validateSchema(deck)) {
        throw new Error(formatErrors(validateSchema.errors));
    }

    const ids = new Set();
    for (const slide of deck.slides) {
        if (ids.has(slide.id))
            throw new Error(`El ID de diapositiva esta duplicado: ${slide.id}`);
        ids.add(slide.id);
        assertSafePath(slide.source);
        if (!files.has(slide.source))
            throw new Error(`Falta el archivo de diapositiva: ${slide.source}`);
        if (!slide.source.toLowerCase().endsWith('.html'))
            throw new Error(`La diapositiva debe ser HTML: ${slide.source}`);
        if (slide.notes) {
            assertSafePath(slide.notes);
            if (!files.has(slide.notes))
                throw new Error(
                    `Falta el archivo de anotaciones: ${slide.notes}`,
                );
        }
    }

    validateChartAssets(files);
    validateIconAssets(files);

    return deck;
}

export function assertSafePath(path) {
    if (
        !path ||
        path.startsWith('/') ||
        /^[a-zA-Z]:/.test(path) ||
        path.includes('\0') ||
        path.includes('\\') ||
        path.includes('//') ||
        path.split('/').includes('..')
    ) {
        throw new Error(`Ruta no segura: ${path}`);
    }
}

function formatErrors(errors = []) {
    return errors
        .map((error) => `${error.instancePath || '/'} ${error.message}`)
        .join('; ');
}

function validateChartAssets(files) {
    const runtimeFiles = {
        chartjs: 'chart.umd.min.js',
        echarts: 'echarts.min.js',
    };
    const chartAssetPaths = [...files.keys()].filter((path) =>
        /^assets\/vendor\/(chartjs|echarts)\//.test(path),
    );

    if (chartAssetPaths.length === 0) return;

    if (!files.has('assets/ATTRIBUTIONS.md')) {
        throw new Error(
            'Los runtimes de graficas requieren assets/ATTRIBUTIONS.md',
        );
    }

    const libraries = new Set(
        chartAssetPaths.map((path) => path.split('/')[2]),
    );
    for (const library of libraries) {
        if (!files.has(`assets/vendor/${library}/${runtimeFiles[library]}`)) {
            throw new Error(`Falta el runtime de graficas: ${library}`);
        }
        if (!files.has(`assets/vendor/${library}/LICENSE.txt`)) {
            throw new Error(
                `Falta la licencia del runtime de graficas: ${library}`,
            );
        }
    }
}

function validateIconAssets(files) {
    const iconPaths = [...files.keys()].filter((path) =>
        /^assets\/icons\/.*\.svg$/i.test(path),
    );
    const hasIconMarkup = [...files].some(
        ([path, bytes]) =>
            path.toLowerCase().endsWith('.html') &&
            /\bclass\s*=\s*["'][^"']*\bdeck-icon\b/i.test(
                new TextDecoder().decode(bytes),
            ),
    );
    if (iconPaths.length === 0) {
        if (hasIconMarkup || files.has('assets/icons/icons.css')) {
            throw new Error('Los iconos requieren activos SVG locales');
        }
        return;
    }

    for (const path of iconPaths) {
        const [, , library] = path.split('/');
        if (!library || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(library)) {
            throw new Error(`Ruta de icono inválida: ${path}`);
        }
    }

    for (const required of [
        'assets/icons/icons.css',
        'assets/ATTRIBUTIONS.md',
    ]) {
        if (!files.has(required)) {
            throw new Error(
                `Falta el archivo requerido para iconos: ${required}`,
            );
        }
    }
    const attribution = decodedText(files.get('assets/ATTRIBUTIONS.md'));
    if (!attribution) {
        throw new Error('assets/ATTRIBUTIONS.md no puede estar vacío');
    }
    const libraries = new Set(iconPaths.map((path) => path.split('/')[2]));
    if (
        libraries.has('phosphor') &&
        !files.has('assets/licenses/phosphor-icons.txt')
    ) {
        throw new Error(
            'Falta el archivo requerido para iconos: assets/licenses/phosphor-icons.txt',
        );
    }
    if (
        libraries.has('phosphor') &&
        !hasSubstantialText(files.get('assets/licenses/phosphor-icons.txt'))
    ) {
        throw new Error('La licencia de Phosphor está incompleta');
    }
    if (
        libraries.has('phosphor') &&
        !attributionIncludes(attribution, [
            'phosphor',
            'https://',
            'assets/icons/phosphor/',
        ])
    ) {
        throw new Error('La atribución de Phosphor está incompleta');
    }
    const externalLibraries = [...libraries].filter(
        (library) => library !== 'phosphor' && library !== 'user',
    );
    for (const library of externalLibraries) {
        if (!files.has(`assets/licenses/${library}.txt`)) {
            throw new Error(
                `Falta la licencia de la biblioteca de iconos: ${library}`,
            );
        }
        if (!hasSubstantialText(files.get(`assets/licenses/${library}.txt`))) {
            throw new Error(
                `La licencia de la biblioteca de iconos está incompleta: ${library}`,
            );
        }
    }
    const needsManifest = [...libraries].some(
        (library) => library !== 'phosphor',
    );
    if (needsManifest && !files.has('assets/icons/manifest.json')) {
        throw new Error(
            'Los iconos alternativos requieren assets/icons/manifest.json',
        );
    }

    const stylesheet = new TextDecoder().decode(
        files.get('assets/icons/icons.css'),
    );
    assertLocalIconStylesheet(stylesheet, files);
    const manifest = needsManifest
        ? parseIconManifest(files.get('assets/icons/manifest.json'))
        : new Map();
    for (const path of iconPaths) {
        const library = path.split('/')[2];
        const stylesheetPath = `./${path.slice('assets/icons/'.length)}`;
        if (!cssReferences(stylesheet, stylesheetPath)) {
            throw new Error(
                `El icono no esta registrado en icons.css: ${path}`,
            );
        }
        if (library !== 'phosphor') {
            const entry = manifest.get(path);
            const validLibraryEntry =
                library !== 'user' &&
                entry?.source === 'library' &&
                entry.library === library &&
                typeof entry.version === 'string' &&
                entry.version.trim().length > 0 &&
                typeof entry.license === 'string' &&
                entry.license.trim().length > 0 &&
                typeof entry.sourceUrl === 'string' &&
                /^https:\/\//.test(entry.sourceUrl) &&
                attributionIncludes(attribution, [
                    library,
                    entry.version,
                    entry.license,
                    entry.sourceUrl,
                    path,
                ]);
            const validUserEntry =
                library === 'user' &&
                entry?.source === 'user' &&
                entry.providedByUser === true &&
                /^[a-f\d]{64}$/i.test(entry.sha256) &&
                entry.sha256.toLowerCase() === sha256Hex(files.get(path)) &&
                attribution.includes(path);
            if (!validLibraryEntry && !validUserEntry) {
                throw new Error(
                    `El icono no tiene procedencia válida en manifest.json: ${path}`,
                );
            }
        }
    }
}

function decodedText(bytes) {
    return bytes ? new TextDecoder().decode(bytes).trim() : '';
}

function hasSubstantialText(bytes) {
    return decodedText(bytes).length >= 80;
}

function attributionIncludes(attribution, values) {
    const normalized = attribution.toLowerCase();
    return values.every((value) =>
        normalized.includes(String(value).toLowerCase()),
    );
}

function cssReferences(stylesheet, path) {
    const activeCss = stylesheet.replace(/\/\*[\s\S]*?\*\//g, '');
    const declarations = activeCss.matchAll(
        /(?:^|[;{])\s*(?:--icon-source|-webkit-mask(?:-image)?|mask(?:-image)?|background-image)\s*:\s*[^;{}]*?url\(\s*(["']?)([^)'"\s]+)\1\s*\)/gi,
    );
    return [...declarations].some((match) => match[2] === path);
}

function assertLocalIconStylesheet(stylesheet, files) {
    const activeCss = stylesheet.replace(/\/\*[\s\S]*?\*\//g, '');
    for (const match of activeCss.matchAll(
        /url\(\s*(["']?)([^)'"\s]+)\1\s*\)/gi,
    )) {
        const reference = match[2];
        if (
            !/^\.\/[a-z0-9-]+\/(?:[a-zA-Z0-9._-]+\/)*[a-zA-Z0-9._-]+$/.test(
                reference,
            ) ||
            !reference.toLowerCase().endsWith('.svg') ||
            reference.split('/').includes('..') ||
            !files.has(`assets/icons/${reference.slice(2)}`)
        ) {
            throw new Error(
                `icons.css contiene un recurso no local o inexistente: ${reference}`,
            );
        }
    }
}

function sha256Hex(bytes) {
    const constants = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
        0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
        0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
        0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
        0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
        0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
        0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
        0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
        0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
    ];
    const bitLength = bytes.length * 8;
    const paddedLength = Math.ceil((bytes.length + 9) / 64) * 64;
    const padded = new Uint8Array(paddedLength);
    padded.set(bytes);
    padded[bytes.length] = 0x80;
    const view = new DataView(padded.buffer);
    view.setUint32(paddedLength - 8, Math.floor(bitLength / 0x100000000));
    view.setUint32(paddedLength - 4, bitLength >>> 0);

    const hash = [
        0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
        0x1f83d9ab, 0x5be0cd19,
    ];
    const words = new Uint32Array(64);
    for (let offset = 0; offset < paddedLength; offset += 64) {
        for (let index = 0; index < 16; index += 1) {
            words[index] = view.getUint32(offset + index * 4);
        }
        for (let index = 16; index < 64; index += 1) {
            const previous = words[index - 15];
            const recent = words[index - 2];
            const sigma0 =
                rotateRight(previous, 7) ^
                rotateRight(previous, 18) ^
                (previous >>> 3);
            const sigma1 =
                rotateRight(recent, 17) ^
                rotateRight(recent, 19) ^
                (recent >>> 10);
            words[index] =
                (words[index - 16] + sigma0 + words[index - 7] + sigma1) >>> 0;
        }

        let [a, b, c, d, e, f, g, h] = hash;
        for (let index = 0; index < 64; index += 1) {
            const sum1 =
                rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
            const choice = (e & f) ^ (~e & g);
            const temporary1 =
                (h + sum1 + choice + constants[index] + words[index]) >>> 0;
            const sum0 =
                rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22);
            const majority = (a & b) ^ (a & c) ^ (b & c);
            const temporary2 = (sum0 + majority) >>> 0;
            h = g;
            g = f;
            f = e;
            e = (d + temporary1) >>> 0;
            d = c;
            c = b;
            b = a;
            a = (temporary1 + temporary2) >>> 0;
        }
        hash[0] = (hash[0] + a) >>> 0;
        hash[1] = (hash[1] + b) >>> 0;
        hash[2] = (hash[2] + c) >>> 0;
        hash[3] = (hash[3] + d) >>> 0;
        hash[4] = (hash[4] + e) >>> 0;
        hash[5] = (hash[5] + f) >>> 0;
        hash[6] = (hash[6] + g) >>> 0;
        hash[7] = (hash[7] + h) >>> 0;
    }
    return hash.map((value) => value.toString(16).padStart(8, '0')).join('');
}

function rotateRight(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
}

function parseIconManifest(bytes) {
    try {
        const value = JSON.parse(new TextDecoder().decode(bytes));
        if (!Array.isArray(value.icons)) throw new Error('icons');
        const entries = value.icons.map((icon) => [icon.path, icon]);
        if (new Set(entries.map(([path]) => path)).size !== entries.length) {
            throw new Error('duplicate paths');
        }
        return new Map(entries);
    } catch {
        throw new Error('assets/icons/manifest.json no es válido');
    }
}
