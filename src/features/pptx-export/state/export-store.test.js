import { describe, expect, it } from 'vitest';
import { createExportStore } from './export-store.js';

describe('createExportStore', () => {
    it('tracks capture progress and terminal states', () => {
        const store = createExportStore();
        store.getState().setCapturing(3);
        store.getState().setProgress(2);
        expect(store.getState()).toMatchObject({
            status: 'capturing',
            active: true,
            currentSlide: 2,
            slideCount: 3,
        });

        store.getState().setEncoding();
        store.getState().setSuccess();
        expect(store.getState()).toMatchObject({
            status: 'success',
            active: false,
        });
    });
});
