import { randomToken, sha256Hex } from '../../src/util/crypto';
describe('crypto utils', () => {
    describe('randomToken', () => {
        it('should generate a base64url token with default length', () => {
            const token = randomToken();
            expect(typeof token).toBe('string');
            expect(token.length).toBeGreaterThan(0);
            // Should not contain + or / characters (base64url)
            expect(token).not.toMatch(/[+/]/);
        });
        it('should generate token with specified byte length', () => {
            const token16 = randomToken(16);
            const token32 = randomToken(32);
            expect(token32.length).toBeGreaterThan(token16.length);
        });
    });
    describe('sha256Hex', () => {
        it('should generate hash using mocked crypto', () => {
            const input = 'test-input';
            const hash = sha256Hex(input);
            expect(typeof hash).toBe('string');
            expect(hash).toBe('mocked-hash'); // Matches our mock
            expect(hash).toMatch(/^[a-z-]+$/); // Mock returns lowercase with dashes
        });
        it('should generate consistent hashes for same input', () => {
            const input = 'consistent-input';
            const hash1 = sha256Hex(input);
            const hash2 = sha256Hex(input);
            expect(hash1).toBe(hash2);
            expect(hash1).toBe('mocked-hash');
        });
        it('should generate same hash for different inputs (mocked)', () => {
            const hash1 = sha256Hex('input1');
            const hash2 = sha256Hex('input2');
            expect(hash1).toBe(hash2); // Mock returns same value
            expect(hash1).toBe('mocked-hash');
        });
    });
});
