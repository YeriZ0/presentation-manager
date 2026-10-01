import Ajv from 'ajv';
import {
    EVENTS,
    PROTOCOL_VERSION,
    TIMER_POSITIONS,
    LIMITS,
} from './protocol.js';
import { RemoteError } from './errors.js';

const ajv = new Ajv({ allErrors: false });
const id = { type: 'string', minLength: 1, maxLength: 128 };
const text = (maxLength) => ({ type: 'string', maxLength });
const integer = { type: 'integer', minimum: 0 };
const boolean = { type: 'boolean' };
const positions = { enum: TIMER_POSITIONS.map((position) => position.id) };

function object(properties, required = Object.keys(properties)) {
    return {
        type: 'object',
        properties,
        required,
        additionalProperties: false,
    };
}

const command = {
    oneOf: [
        object({ type: { enum: ['next', 'previous'] }, expectedSlideId: id }),
        object({ type: { const: 'timer-enabled' }, enabled: boolean }),
        object({ type: { const: 'timer-running' }, running: boolean }),
        object({ type: { const: 'timer-reset' } }),
        object({ type: { const: 'timer-position' }, position: positions }),
    ],
};
const state = object({
    phase: { enum: ['preflight', 'stage'] },
    activeIndex: integer,
    slideId: id,
    ready: boolean,
    fullscreen: boolean,
    timerEnabled: boolean,
    timerRunning: boolean,
    timerPosition: positions,
    elapsed: { type: 'number', minimum: 0, maximum: 31536000 },
    playerError: text(1024),
});
const metadata = object({
    title: text(1024),
    slides: {
        type: 'array',
        minItems: 1,
        maxItems: 2000,
        items: object({ id, title: text(1024), notes: text(65536) }),
    },
});
const base = { protocolVersion: { const: PROTOCOL_VERSION } };
const session = { ...base, sessionId: id };
const schemas = {
    [EVENTS.create]: object(base),
    [EVENTS.regenerate]: object(session),
    [EVENTS.pair]: object({
        ...base,
        code: { type: 'string', pattern: '^\\d{6}$' },
    }),
    [EVENTS.resume]: object({
        ...session,
        role: { enum: ['presenter', 'controller'] },
        token: text(128),
    }),
    [EVENTS.release]: object(session),
    [EVENTS.close]: object(session),
    [EVENTS.synchronize]: object(session),
    [EVENTS.command]: object({ ...session, requestId: id, command }),
    [EVENTS.state]: object({ ...session, revision: integer, state }),
    [EVENTS.snapshot]: object({
        ...session,
        syncId: id,
        revision: integer,
        metadata,
        state,
    }),
};
const compiled = new Map(
    Object.entries(schemas).map(([event, schema]) => [
        event,
        ajv.compile(schema),
    ]),
);
const validateCommand = ajv.compile(command);

export function assertMessage(event, payload) {
    const validate = compiled.get(event);
    if (!validate || !validate(payload))
        throw new RemoteError('INVALID_MESSAGE');
    if (
        new TextEncoder().encode(JSON.stringify(payload)).byteLength >
        LIMITS.messageBytes
    ) {
        throw new RemoteError('PAYLOAD_TOO_LARGE');
    }
    if (
        payload.metadata &&
        (payload.state.activeIndex >= payload.metadata.slides.length ||
            payload.metadata.slides[payload.state.activeIndex].id !==
                payload.state.slideId ||
            new Set(payload.metadata.slides.map((slide) => slide.id)).size !==
                payload.metadata.slides.length)
    ) {
        throw new RemoteError('INVALID_MESSAGE');
    }
    return payload;
}

export function assertCommand(value) {
    if (!validateCommand(value)) throw new RemoteError('INVALID_MESSAGE');
    return value;
}
