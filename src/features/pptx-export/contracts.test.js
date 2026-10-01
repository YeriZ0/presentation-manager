import { describe, expect, it } from 'vitest';
import {
    createSafeFilename,
    isExportMessage,
    validateSlideSnapshot,
} from './contracts.js';

describe('PPTX export contracts', () => {
    it('accepts only correlated snapshot messages', () => {
        const message = {
            namespace: 'web-deck:pptx',
            version: 1,
            type: 'snapshot',
            jobId: 'job-1',
            slideId: 'intro',
        };

        expect(isExportMessage(message, message)).toBe(true);
        expect(isExportMessage({ ...message, jobId: 'old-job' }, message)).toBe(
            false,
        );
        expect(isExportMessage({ ...message, version: 2 }, message)).toBe(
            false,
        );
    });

    it('creates safe ASCII download names with a fallback', () => {
        expect(createSafeFilename('Introducción: Datos & Salud')).toBe(
            'introduccion-datos-salud.pptx',
        );
        expect(createSafeFilename('')).toBe('presentation.pptx');
    });

    it('rejects oversized snapshots and fonts from undeclared hosts', () => {
        expect(() =>
            validateSlideSnapshot({
                html: '',
                width: 40000,
                height: 540,
                fontFaces: [],
            }),
        ).toThrow('captura inválida');
        expect(() =>
            validateSlideSnapshot(
                {
                    html: '<div></div>',
                    width: 960,
                    height: 540,
                    fontFaces: [
                        {
                            family: 'External',
                            weight: '400',
                            style: 'normal',
                            sources: ['https://evil.example/font.woff2'],
                        },
                    ],
                },
                [],
            ),
        ).toThrow('host no autorizado');
    });
});
