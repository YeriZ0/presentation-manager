import {
    randomBytes,
    randomInt,
    randomUUID,
    createHash,
    timingSafeEqual,
} from 'node:crypto';

export function createTokenFactory() {
    return {
        id: () => randomUUID(),
        code: () => String(randomInt(0, 1000000)).padStart(6, '0'),
        token: () => randomBytes(32).toString('hex'),
        hash: (value) => createHash('sha256').update(value).digest('hex'),
        matches(value, hash) {
            const candidate = createHash('sha256').update(value).digest();
            const expected = Buffer.from(hash, 'hex');
            return (
                candidate.length === expected.length &&
                timingSafeEqual(candidate, expected)
            );
        },
    };
}
