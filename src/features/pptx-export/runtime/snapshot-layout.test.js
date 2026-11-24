import { describe, expect, it } from 'vitest';
import { runInNewContext } from 'node:vm';
import {
    isSingleLineTextRects,
    restoreSnapshotLayout,
} from './snapshot-layout.js';

function rect(top, bottom, width = 100) {
    return { top, bottom, width, height: bottom - top };
}

describe('isSingleLineTextRects', () => {
    it('runs independently when serialized into the sandboxed slide', () => {
        const isolated = runInNewContext(
            `(${isSingleLineTextRects.toString()})`,
        );
        expect(isolated([rect(10, 40)])).toBe(true);
        expect(isolated([rect(10, 40), rect(40, 70)])).toBe(false);
    });

    it('recognizes one line with mixed inline font sizes', () => {
        expect(isSingleLineTextRects([rect(10, 40), rect(18, 38)])).toBe(true);
    });

    it('does not merge wrapped text or explicit line breaks', () => {
        expect(isSingleLineTextRects([rect(10, 40), rect(40, 70)])).toBe(false);
    });

    it('ignores invisible ranges and empty text', () => {
        expect(isSingleLineTextRects([])).toBe(false);
        expect(isSingleLineTextRects([rect(10, 40, 0)])).toBe(false);
        expect(isSingleLineTextRects([rect(10, 40, 0), rect(40, 70)])).toBe(
            true,
        );
    });
});

function createNode(singleLine) {
    const style = {
        display: 'block',
        whiteSpace: 'normal',
        [Symbol.iterator]: function* () {
            yield 'display';
            yield 'white-space';
        },
    };
    return {
        style,
        getAttribute: () => '[10,20,100,30]',
        hasAttribute: (name) =>
            name === 'data-export-single-line' && singleLine,
    };
}

describe('restoreSnapshotLayout', () => {
    it('disables wrapping only for text captured on a single line', () => {
        const single = createNode(true);
        const multiline = createNode(false);
        restoreSnapshotLayout({ querySelectorAll: () => [single, multiline] });

        expect(single.style.whiteSpace).toBe('nowrap');
        expect(multiline.style.whiteSpace).toBe('normal');
        expect(single.style.width).toBe('100px');
        expect(single.style.left).toBe('10px');
        expect(single.style.top).toBe('20px');
    });
});
