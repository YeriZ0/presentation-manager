import Ajv from 'ajv';
import schema from './deck.schema.json';

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
