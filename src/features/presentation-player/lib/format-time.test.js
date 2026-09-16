import { describe, expect, it } from 'vitest';
import { formatTime } from './format-time.js';

describe('formatTime', () => {
    it('formats elapsed seconds as hours, minutes and seconds', () => {
        expect(formatTime(0)).toBe('00:00:00');
        expect(formatTime(65.9)).toBe('00:01:05');
        expect(formatTime(3661)).toBe('01:01:01');
    });
});
