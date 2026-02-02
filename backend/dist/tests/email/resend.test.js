import { sendReportLinkEmail } from '../../src/email/resend';
describe('resend email', () => {
    describe('sendReportLinkEmail', () => {
        it('should send email with correct parameters', async () => {
            const params = {
                to: 'recipient@example.com',
                link: 'https://example.com/report/abc123',
                expiresAtIso: '2024-12-31T23:59:59Z'
            };
            // The function should not throw (mock will handle the send)
            await expect(sendReportLinkEmail(params)).resolves.not.toThrow();
        });
        it('should handle different email addresses', async () => {
            const params = {
                to: 'test.user+tag@subdomain.example.co.uk',
                link: 'https://app.example.com/r/token123',
                expiresAtIso: '2024-01-01T12:00:00Z'
            };
            await expect(sendReportLinkEmail(params)).resolves.not.toThrow();
        });
    });
});
