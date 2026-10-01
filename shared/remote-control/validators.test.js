import { describe, expect, it } from 'vitest';
import { assertMessage } from './validators.js';
import { EVENTS, message } from './protocol.js';

describe('remote protocol boundaries', () => {
    it('rejects arbitrary state setters, extra resources and incompatible versions', () => {
        expect(() =>
            assertMessage(
                EVENTS.command,
                message({
                    sessionId: 'one',
                    requestId: 'two',
                    command: { type: 'set-state', files: [] },
                }),
            ),
        ).toThrow();
        expect(() =>
            assertMessage(EVENTS.create, { protocolVersion: 2 }),
        ).toThrow();
        expect(() =>
            assertMessage(
                EVENTS.pair,
                message({ code: '123456', html: '<script />' }),
            ),
        ).toThrow();
    });
});
