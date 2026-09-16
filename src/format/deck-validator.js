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
        /^assets\/icons\/phosphor\/.+\.svg$/.test(path),
    );
    if (iconPaths.length === 0) return;

    for (const required of [
        'assets/icons/icons.css',
        'assets/licenses/phosphor-icons.txt',
        'assets/ATTRIBUTIONS.md',
    ]) {
        if (!files.has(required)) {
            throw new Error(`Falta el archivo requerido para iconos: ${required}`);
        }
    }

    const stylesheet = new TextDecoder().decode(
        files.get('assets/icons/icons.css'),
    );
    for (const path of iconPaths) {
        const filename = path.split('/').pop();
        if (!stylesheet.includes(`./phosphor/${filename}`)) {
            throw new Error(`El icono no esta registrado en icons.css: ${filename}`);
        }
    }
}
