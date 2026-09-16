import { describe, expect, it } from 'vitest';
import { buildContentSecurityPolicy } from './security-policy.js';

describe('buildContentSecurityPolicy', () => {
    it('blocks network APIs and allows only declared asset hosts', () => {
        const policy = buildContentSecurityPolicy({
            externalResources: {
                imageHosts: ['images.example.com'],
                fontStylesheetHosts: ['styles.example.com'],
                fontHosts: ['fonts.example.com'],
            },
        });

        expect(policy).toContain("connect-src 'none'");
        expect(policy).toContain('https://images.example.com');
        expect(policy).toContain('https://styles.example.com');
        expect(policy).toContain('https://fonts.example.com');
        expect(policy).toContain("object-src 'none'");
    });
});
