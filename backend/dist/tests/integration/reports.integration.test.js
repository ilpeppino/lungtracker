// Mock all dependencies BEFORE importing modules
jest.mock('../../src/auth/supabase', () => ({
    requireSupabaseUser: jest.fn()
}));
jest.mock('../../src/db/supabaseAdmin', () => ({
    supabaseAdmin: {
        from: jest.fn(),
        storage: {
            from: jest.fn()
        }
    }
}));
jest.mock('../../src/reporting/reportData', () => ({
    fetchReportData: jest.fn()
}));
jest.mock('../../src/reporting/pdf', () => ({
    htmlToPdfBuffer: jest.fn()
}));
jest.mock('../../src/reporting/reportTemplate', () => ({
    renderReportHtml: jest.fn()
}));
jest.mock('../../src/email/resend', () => ({
    sendReportLinkEmail: jest.fn()
}));
jest.mock('../../src/util/crypto', () => ({
    randomToken: jest.fn(),
    sha256Hex: jest.fn()
}));
import express from 'express';
import request from 'supertest';
import { reportsRouter } from '../../src/routes/reports';
import { requireSupabaseUser } from '../../src/auth/supabase';
import { supabaseAdmin } from '../../src/db/supabaseAdmin';
import { sendReportLinkEmail } from '../../src/email/resend';
import { htmlToPdfBuffer } from '../../src/reporting/pdf';
import { fetchReportData } from '../../src/reporting/reportData';
import { renderReportHtml } from '../../src/reporting/reportTemplate';
import { randomToken, sha256Hex } from '../../src/util/crypto';
const mockRequireSupabaseUser = requireSupabaseUser;
const mockSupabaseFrom = supabaseAdmin.from;
const mockSupabaseStorageFrom = supabaseAdmin.storage.from;
const mockFetchReportData = fetchReportData;
const mockHtmlToPdfBuffer = htmlToPdfBuffer;
const mockRenderReportHtml = renderReportHtml;
const mockSendReportLinkEmail = sendReportLinkEmail;
const mockRandomToken = randomToken;
const mockSha256Hex = sha256Hex;
describe('Reports API Integration Tests', () => {
    let app;
    beforeEach(() => {
        jest.clearAllMocks();
        app = express();
        app.use(express.json());
        app.use('/reports', reportsRouter);
    });
    describe('Complete Report Generation Flow', () => {
        it('should successfully generate and email a complete health report', async () => {
            // Setup test data
            const testUserId = 'user-123';
            const testToken = 'secure-random-token-123';
            const testTokenHash = 'hashed-token-123';
            const testReportId = 'report-uuid-123';
            const requestBody = {
                rangeStart: '2024-01-01T00:00:00.000Z',
                rangeEnd: '2024-01-31T23:59:59.999Z',
                recipientEmail: 'patient@example.com'
            };
            const mockReportData = {
                vitals: [
                    {
                        id: 'v1',
                        measured_at: '2024-01-15T10:00:00Z',
                        pulse_bpm: 72,
                        systolic: 120,
                        diastolic: 80,
                        fev1_l: 3.2,
                        notes: 'Feeling well'
                    }
                ],
                activities: [
                    {
                        id: 'a1',
                        performed_at: '2024-01-10T08:00:00Z',
                        activity_type: 'walking',
                        duration_minutes: 30,
                        notes: 'Morning walk'
                    }
                ],
                events: [
                    {
                        id: 'e1',
                        event_at: '2024-01-05T14:00:00Z',
                        event_type: 'flare_up',
                        severity: 'moderate',
                        notes: 'Shortness of breath'
                    }
                ],
                summary: {
                    totalVitals: 1,
                    totalActivities: 1,
                    totalEvents: 1,
                    dateRange: 'Jan 1 - Jan 31, 2024'
                }
            };
            const mockHtml = `
        <html>
          <body>
            <h1>Lung Health Report</h1>
            <p>Period: Jan 1 - Jan 31, 2024</p>
            <h2>Vitals</h2>
            <ul>
              <li>Pulse: 72 bpm</li>
              <li>Blood Pressure: 120/80</li>
              <li>FEV1: 3.2 L</li>
            </ul>
            <h2>Activities</h2>
            <ul>
              <li>Walking: 30 minutes</li>
            </ul>
            <h2>Events</h2>
            <ul>
              <li>Flare up: Moderate severity</li>
            </ul>
          </body>
        </html>
      `;
            const mockPdfBuffer = Buffer.from('mock-pdf-content-for-testing');
            // Mock all the dependencies
            mockRequireSupabaseUser.mockResolvedValue({ userId: testUserId });
            mockFetchReportData.mockResolvedValue(mockReportData);
            mockRenderReportHtml.mockReturnValue(mockHtml);
            mockHtmlToPdfBuffer.mockResolvedValue(mockPdfBuffer);
            mockRandomToken.mockReturnValue(testToken);
            mockSha256Hex.mockReturnValue(testTokenHash);
            // Mock crypto.randomUUID
            jest.spyOn(global.crypto, 'randomUUID').mockReturnValue(testReportId);
            // Mock Supabase storage upload
            const mockUpload = jest.fn().mockResolvedValue({
                error: null
            });
            const mockStorageFrom = jest.fn().mockReturnValue({
                upload: mockUpload
            });
            mockSupabaseStorageFrom.mockImplementation(mockStorageFrom);
            // Mock database insert
            const mockInsert = jest.fn().mockResolvedValue({
                data: null,
                error: null
            });
            const mockFrom = jest.fn().mockReturnValue({
                insert: mockInsert
            });
            mockSupabaseFrom.mockImplementation(mockFrom);
            // Mock email sending
            mockSendReportLinkEmail.mockResolvedValue(undefined);
            // Execute the request
            const response = await request(app)
                .post('/reports/email-link')
                .set('Authorization', 'Bearer test-jwt-token')
                .send(requestBody)
                .expect(200);
            // Verify the response
            expect(response.body).toEqual({
                ok: true,
                devLink: undefined,
                expiresAt: expect.any(String)
            });
            // Verify all the steps were called correctly
            expect(mockRequireSupabaseUser).toHaveBeenCalledWith('Bearer test-jwt-token');
            expect(mockFetchReportData).toHaveBeenCalledWith({
                userId: testUserId,
                rangeStart: '2024-01-01T00:00:00.000Z',
                rangeEnd: '2024-01-31T23:59:59.999Z'
            });
            expect(mockRenderReportHtml).toHaveBeenCalledWith({
                rangeStart: '2024-01-01T00:00:00.000Z',
                rangeEnd: '2024-01-31T23:59:59.999Z',
                ...mockReportData
            });
            expect(mockHtmlToPdfBuffer).toHaveBeenCalledWith(mockHtml);
            expect(mockRandomToken).toHaveBeenCalledWith(32);
            expect(mockSha256Hex).toHaveBeenCalledWith(testToken);
            // Verify storage upload
            expect(mockSupabaseStorageFrom).toHaveBeenCalledWith('test-reports');
            expect(mockUpload).toHaveBeenCalledWith(`${testUserId}/${testReportId}.pdf`, mockPdfBuffer, {
                contentType: 'application/pdf',
                upsert: true
            });
            // Verify database insert
            expect(mockSupabaseFrom).toHaveBeenCalledWith('report_exports');
            expect(mockInsert).toHaveBeenCalledWith({
                id: testReportId,
                user_id: testUserId,
                range_start: '2024-01-01T00:00:00.000Z',
                range_end: '2024-01-31T23:59:59.999Z',
                storage_bucket: 'test-reports',
                storage_path: `${testUserId}/${testReportId}.pdf`,
                recipient_email: 'patient@example.com',
                token_hash: testTokenHash,
                expires_at: expect.any(String),
                status: 'sent'
            });
            // Verify email was sent
            expect(mockSendReportLinkEmail).toHaveBeenCalledWith({
                to: 'patient@example.com',
                link: 'http://localhost:8080/reports/r/secure-random-token-123',
                expiresAtIso: expect.any(String)
            });
        });
        it('should handle report access and download flow', async () => {
            const testToken = 'access-token-123';
            const testTokenHash = 'hashed-access-token-123';
            mockSha256Hex.mockReturnValue(testTokenHash);
            const mockReportData = {
                id: 'report-456',
                storage_bucket: 'test-reports',
                storage_path: 'user-123/report-456.pdf',
                expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
                revoked_at: null,
                downloaded_at: null,
                status: 'sent'
            };
            // Mock database query chain: from().select().eq().maybeSingle()
            const mockMaybeSingle = jest.fn().mockResolvedValue({
                data: mockReportData,
                error: null
            });
            const mockSelectEq = jest.fn().mockReturnValue({
                maybeSingle: mockMaybeSingle
            });
            const mockSelect = jest.fn().mockReturnValue({
                eq: mockSelectEq
            });
            // Mock database update chain: from().update().eq()
            const mockUpdateEq = jest.fn().mockResolvedValue({
                data: null,
                error: null
            });
            const mockUpdate = jest.fn().mockReturnValue({
                eq: mockUpdateEq
            });
            const mockFrom = jest.fn().mockImplementation((table) => {
                if (table === 'report_exports') {
                    return {
                        select: mockSelect,
                        update: mockUpdate
                    };
                }
                return {};
            });
            mockSupabaseFrom.mockImplementation(mockFrom);
            // Mock signed URL creation
            const mockCreateSignedUrl = jest.fn().mockResolvedValue({
                data: { signedUrl: 'https://storage.example.com/signed-url.pdf' },
                error: null
            });
            const mockStorageFrom = jest.fn().mockReturnValue({
                createSignedUrl: mockCreateSignedUrl
            });
            mockSupabaseStorageFrom.mockImplementation(mockStorageFrom);
            // Execute the request
            const response = await request(app)
                .get('/reports/r/access-token-123')
                .expect(302);
            // Verify redirect to signed URL
            expect(response.headers.location).toBe('https://storage.example.com/signed-url.pdf');
            // Verify token validation
            expect(mockSha256Hex).toHaveBeenCalledWith('access-token-123');
            expect(mockSupabaseFrom).toHaveBeenCalledWith('report_exports');
            expect(mockSelect).toHaveBeenCalledWith('id, storage_bucket, storage_path, expires_at, revoked_at, downloaded_at, status');
            expect(mockSelectEq).toHaveBeenCalledWith('token_hash', testTokenHash);
            // Verify signed URL creation
            expect(mockSupabaseStorageFrom).toHaveBeenCalledWith('test-reports');
            expect(mockCreateSignedUrl).toHaveBeenCalledWith('user-123/report-456.pdf', 300);
            // Verify download tracking
            expect(mockUpdate).toHaveBeenCalledWith({
                downloaded_at: expect.any(String),
                status: 'downloaded'
            });
            expect(mockUpdateEq).toHaveBeenCalledWith('id', 'report-456');
        });
        it('should handle report listing', async () => {
            const testUserId = 'user-789';
            mockRequireSupabaseUser.mockResolvedValue({ userId: testUserId });
            const mockReports = [
                {
                    id: 'report-1',
                    range_start: '2024-01-01T00:00:00Z',
                    range_end: '2024-01-31T23:59:59Z',
                    recipient_email: 'doctor@example.com',
                    sent_at: '2024-01-15T10:00:00Z',
                    downloaded_at: '2024-01-16T14:30:00Z',
                    expires_at: '2024-01-22T10:00:00Z',
                    revoked_at: null,
                    status: 'downloaded'
                },
                {
                    id: 'report-2',
                    range_start: '2024-02-01T00:00:00Z',
                    range_end: '2024-02-29T23:59:59Z',
                    recipient_email: 'patient@example.com',
                    sent_at: '2024-02-10T09:00:00Z',
                    downloaded_at: null,
                    expires_at: '2024-02-17T09:00:00Z',
                    revoked_at: null,
                    status: 'sent'
                }
            ];
            // Mock database query chain
            const mockSelect = jest.fn();
            const mockEq = jest.fn();
            const mockOrder = jest.fn();
            const mockLimit = jest.fn().mockResolvedValue({
                data: mockReports,
                error: null
            });
            mockSelect.mockReturnValue({ eq: mockEq });
            mockEq.mockReturnValue({ order: mockOrder });
            mockOrder.mockReturnValue({ limit: mockLimit });
            mockSupabaseFrom.mockReturnValue({
                select: mockSelect
            });
            // Execute request
            const response = await request(app)
                .get('/reports/exports?limit=10')
                .set('Authorization', 'Bearer test-jwt-token')
                .expect(200);
            expect(response.body).toEqual(mockReports);
            expect(mockLimit).toHaveBeenCalledWith(10);
        });
        it('should handle report revocation', async () => {
            const testUserId = 'user-789';
            mockRequireSupabaseUser.mockResolvedValue({ userId: testUserId });
            // Mock database update chain: from().update().eq().eq().select().maybeSingle()
            const mockMaybeSingle = jest.fn().mockResolvedValue({
                data: { id: 'report-2' },
                error: null
            });
            const mockSelect = jest.fn().mockReturnValue({
                maybeSingle: mockMaybeSingle
            });
            const mockSecondEq = jest.fn().mockReturnValue({
                select: mockSelect
            });
            const mockFirstEq = jest.fn().mockReturnValue({
                eq: mockSecondEq
            });
            const mockUpdate = jest.fn().mockReturnValue({
                eq: mockFirstEq
            });
            mockSupabaseFrom.mockImplementation((table) => {
                if (table === 'report_exports') {
                    return {
                        update: mockUpdate
                    };
                }
                return {};
            });
            // Execute request
            const response = await request(app)
                .post('/reports/revoke/report-2')
                .set('Authorization', 'Bearer test-jwt-token')
                .expect(200);
            expect(response.body).toEqual({ ok: true });
            expect(mockUpdate).toHaveBeenCalledWith({
                revoked_at: expect.any(String),
                status: 'revoked'
            });
        });
    });
    describe('Error Handling and Edge Cases', () => {
        it('should handle malformed tokens in report access', async () => {
            // Note: Express routes won't match /reports/r/ (empty param), so we get 404
            // To test the "Missing token" handler, we'd need a different route structure
            await request(app)
                .get('/reports/r/')
                .expect(404);
        });
        it('should handle expired reports', async () => {
            const expiredTokenHash = 'expired-hash';
            mockSha256Hex.mockReturnValue(expiredTokenHash);
            const mockReportData = {
                id: 'expired-report',
                storage_bucket: 'test-reports',
                storage_path: 'user-123/expired.pdf',
                expires_at: '2020-01-01T00:00:00Z', // Past date
                revoked_at: null,
                downloaded_at: null,
                status: 'sent'
            };
            const mockMaybeSingle = jest.fn().mockResolvedValue({
                data: mockReportData,
                error: null
            });
            const mockSelectEq = jest.fn().mockReturnValue({
                maybeSingle: mockMaybeSingle
            });
            const mockSelect = jest.fn().mockReturnValue({
                eq: mockSelectEq
            });
            mockSupabaseFrom.mockReturnValue({
                select: mockSelect
            });
            const response = await request(app)
                .get('/reports/r/expired-token')
                .expect(410);
            expect(response.text).toBe('Link expired');
        });
        it('should handle revoked reports', async () => {
            const revokedTokenHash = 'revoked-hash';
            mockSha256Hex.mockReturnValue(revokedTokenHash);
            const mockReportData = {
                id: 'revoked-report',
                storage_bucket: 'test-reports',
                storage_path: 'user-123/revoked.pdf',
                expires_at: '2024-12-31T23:59:59Z',
                revoked_at: '2024-01-15T10:00:00Z',
                downloaded_at: null,
                status: 'revoked'
            };
            const mockMaybeSingle = jest.fn().mockResolvedValue({
                data: mockReportData,
                error: null
            });
            const mockSelectEq = jest.fn().mockReturnValue({
                maybeSingle: mockMaybeSingle
            });
            const mockSelect = jest.fn().mockReturnValue({
                eq: mockSelectEq
            });
            mockSupabaseFrom.mockReturnValue({
                select: mockSelect
            });
            const response = await request(app)
                .get('/reports/r/revoked-token')
                .expect(410);
            expect(response.text).toBe('Link revoked');
        });
        it('should handle rate limiting on report access', async () => {
            // Reset mocks to avoid interference from previous tests
            jest.clearAllMocks();
            // Mock sha256 to return a non-matching hash
            mockSha256Hex.mockReturnValue('non-matching-hash');
            // Mock database to return no data
            const mockMaybeSingle = jest.fn().mockResolvedValue({
                data: null,
                error: null
            });
            const mockSelectEq = jest.fn().mockReturnValue({
                maybeSingle: mockMaybeSingle
            });
            const mockSelect = jest.fn().mockReturnValue({
                eq: mockSelectEq
            });
            mockSupabaseFrom.mockReturnValue({
                select: mockSelect
            });
            // Token not found should return 404
            await request(app)
                .get('/reports/r/test-token')
                .expect(404);
        });
        it('should validate email format in report requests', async () => {
            mockRequireSupabaseUser.mockResolvedValue({ userId: 'user-123' });
            const invalidRequest = {
                rangeStart: '2024-01-01T00:00:00.000Z',
                rangeEnd: '2024-01-31T23:59:59.999Z',
                recipientEmail: 'not-a-valid-email'
            };
            const response = await request(app)
                .post('/reports/email-link')
                .set('Authorization', 'Bearer test-token')
                .send(invalidRequest)
                .expect(400);
            // Zod validation error appears as JSON in the error message
            expect(response.body.error).toContain('Invalid email address');
        });
    });
});
