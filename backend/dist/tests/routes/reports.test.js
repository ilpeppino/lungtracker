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
// Mock all external dependencies
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
const mockRequireSupabaseUser = requireSupabaseUser;
const mockSupabaseFrom = supabaseAdmin.from;
const mockSupabaseStorageFrom = supabaseAdmin.storage.from;
const mockFetchReportData = fetchReportData;
const mockHtmlToPdfBuffer = htmlToPdfBuffer;
const mockRenderReportHtml = renderReportHtml;
const mockSendReportLinkEmail = sendReportLinkEmail;
const mockRandomToken = randomToken;
const mockSha256Hex = sha256Hex;
describe('reports router', () => {
    let app;
    beforeEach(() => {
        jest.clearAllMocks();
        app = express();
        app.use(express.json());
        app.use('/reports', reportsRouter);
    });
    describe('GET /reports/exports', () => {
        it('should return user report exports', async () => {
            mockRequireSupabaseUser.mockResolvedValue({ userId: 'user-123' });
            const mockExports = [
                {
                    id: 'export-1',
                    range_start: '2024-01-01T00:00:00Z',
                    range_end: '2024-01-31T23:59:59Z',
                    recipient_email: 'test@example.com',
                    sent_at: '2024-01-15T10:00:00Z',
                    downloaded_at: null,
                    expires_at: '2024-01-16T10:00:00Z',
                    revoked_at: null,
                    status: 'sent'
                }
            ];
            const mockSelect = jest.fn().mockReturnThis();
            const mockEq = jest.fn().mockReturnThis();
            const mockOrder = jest.fn().mockReturnThis();
            const mockLimit = jest.fn().mockResolvedValue({
                data: mockExports,
                error: null
            });
            mockSupabaseFrom.mockReturnValue({
                select: mockSelect,
                eq: mockEq,
                order: mockOrder,
                limit: mockLimit
            });
            const response = await request(app)
                .get('/reports/exports')
                .set('Authorization', 'Bearer test-token')
                .expect(200);
            expect(response.body).toEqual(mockExports);
            expect(mockRequireSupabaseUser).toHaveBeenCalledWith('Bearer test-token');
            expect(mockSupabaseFrom).toHaveBeenCalledWith('report_exports');
        });
        it('should handle limit parameter', async () => {
            mockRequireSupabaseUser.mockResolvedValue({ userId: 'user-123' });
            const mockSelect = jest.fn().mockReturnThis();
            const mockEq = jest.fn().mockReturnThis();
            const mockOrder = jest.fn().mockReturnThis();
            const mockLimit = jest.fn().mockResolvedValue({
                data: [],
                error: null
            });
            mockSupabaseFrom.mockReturnValue({
                select: mockSelect,
                eq: mockEq,
                order: mockOrder,
                limit: mockLimit
            });
            await request(app)
                .get('/reports/exports?limit=50')
                .set('Authorization', 'Bearer test-token')
                .expect(200);
            expect(mockLimit).toHaveBeenCalledWith(50);
        });
        it('should clamp limit to maximum of 100', async () => {
            mockRequireSupabaseUser.mockResolvedValue({ userId: 'user-123' });
            const mockSelect = jest.fn().mockReturnThis();
            const mockEq = jest.fn().mockReturnThis();
            const mockOrder = jest.fn().mockReturnThis();
            const mockLimit = jest.fn().mockResolvedValue({
                data: [],
                error: null
            });
            mockSupabaseFrom.mockReturnValue({
                select: mockSelect,
                eq: mockEq,
                order: mockOrder,
                limit: mockLimit
            });
            await request(app)
                .get('/reports/exports?limit=200')
                .set('Authorization', 'Bearer test-token')
                .expect(200);
            expect(mockLimit).toHaveBeenCalledWith(100);
        });
        it('should return 401 for invalid auth', async () => {
            mockRequireSupabaseUser.mockRejectedValue(new Error('Invalid token'));
            const response = await request(app)
                .get('/reports/exports')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);
            expect(response.body).toEqual({ error: 'Invalid token' });
        });
    });
    describe('POST /reports/email-link', () => {
        const validRequestBody = {
            rangeStart: '2024-01-01T00:00:00.000Z',
            rangeEnd: '2024-01-31T23:59:59.999Z',
            recipientEmail: 'recipient@example.com'
        };
        beforeEach(() => {
            // Setup mocks for successful flow
            mockRequireSupabaseUser.mockResolvedValue({ userId: 'user-123' });
            mockFetchReportData.mockResolvedValue({
                vitals: [],
                activities: [],
                events: []
            });
            mockRenderReportHtml.mockReturnValue('<html>Test Report</html>');
            mockHtmlToPdfBuffer.mockResolvedValue(Buffer.from('pdf-content'));
            mockRandomToken.mockReturnValue('test-token-123');
            mockSha256Hex.mockReturnValue('hashed-token-123');
            // Mock storage upload
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
            // Mock email send
            mockSendReportLinkEmail.mockResolvedValue(undefined);
        });
        it('should create and email report link successfully', async () => {
            const response = await request(app)
                .post('/reports/email-link')
                .set('Authorization', 'Bearer test-token')
                .send(validRequestBody)
                .expect(200);
            expect(response.body).toEqual({
                ok: true,
                devLink: undefined,
                expiresAt: expect.any(String)
            });
            expect(mockRequireSupabaseUser).toHaveBeenCalledWith('Bearer test-token');
            expect(mockFetchReportData).toHaveBeenCalledWith({
                userId: 'user-123',
                rangeStart: '2024-01-01T00:00:00.000Z',
                rangeEnd: '2024-01-31T23:59:59.999Z'
            });
            expect(mockSendReportLinkEmail).toHaveBeenCalled();
        });
        it('should return dev link when DEV_RETURN_REPORT_LINK is set', async () => {
            process.env.DEV_RETURN_REPORT_LINK = 'true';
            const response = await request(app)
                .post('/reports/email-link')
                .set('Authorization', 'Bearer test-token')
                .send(validRequestBody)
                .expect(200);
            expect(response.body.devLink).toBe('http://localhost:8080/reports/r/test-token-123');
            delete process.env.DEV_RETURN_REPORT_LINK;
        });
        it('should validate request body', async () => {
            const invalidBody = {
                rangeStart: 'invalid-date',
                rangeEnd: '2024-01-31T23:59:59.999Z',
                recipientEmail: 'not-an-email'
            };
            const response = await request(app)
                .post('/reports/email-link')
                .set('Authorization', 'Bearer test-token')
                .send(invalidBody)
                .expect(400);
            expect(response.body).toHaveProperty('error');
            expect(typeof response.body.error).toBe('string');
            expect(response.body.error).toContain('recipientEmail');
        });
        it('should handle storage upload failure', async () => {
            const mockUpload = jest.fn().mockResolvedValue({
                error: { message: 'Storage error' }
            });
            const mockStorageFrom = jest.fn().mockReturnValue({
                upload: mockUpload
            });
            mockSupabaseStorageFrom.mockImplementation(mockStorageFrom);
            const response = await request(app)
                .post('/reports/email-link')
                .set('Authorization', 'Bearer test-token')
                .send(validRequestBody)
                .expect(400);
            expect(response.body.error).toBe('Storage error');
        });
        it('should handle database insert failure', async () => {
            const mockInsert = jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Database error' }
            });
            const mockFrom = jest.fn().mockReturnValue({
                insert: mockInsert
            });
            mockSupabaseFrom.mockImplementation(mockFrom);
            const response = await request(app)
                .post('/reports/email-link')
                .set('Authorization', 'Bearer test-token')
                .send(validRequestBody)
                .expect(400);
            expect(response.body.error).toBe('Database error');
        });
    });
    describe('POST /reports/revoke/:id', () => {
        it('should revoke report successfully', async () => {
            mockRequireSupabaseUser.mockResolvedValue({ userId: 'user-123' });
            mockSupabaseFrom.mockReturnValue({
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            select: jest.fn().mockReturnValue({
                                maybeSingle: jest.fn().mockResolvedValue({
                                    data: { id: 'report-123' },
                                    error: null
                                })
                            })
                        })
                    })
                })
            });
            const response = await request(app)
                .post('/reports/revoke/report-123')
                .set('Authorization', 'Bearer test-token')
                .expect(200);
            expect(response.body).toEqual({ ok: true });
        });
        it('should return 404 for non-existent report', async () => {
            mockRequireSupabaseUser.mockResolvedValue({ userId: 'user-123' });
            mockSupabaseFrom.mockReturnValue({
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            select: jest.fn().mockReturnValue({
                                maybeSingle: jest.fn().mockResolvedValue({
                                    data: null,
                                    error: null
                                })
                            })
                        })
                    })
                })
            });
            const response = await request(app)
                .post('/reports/revoke/non-existent')
                .set('Authorization', 'Bearer test-token')
                .expect(404);
            expect(response.body).toEqual({ error: 'Not found' });
        });
    });
    describe('GET /reports/r/:token', () => {
        it('should redirect to signed URL for valid token', async () => {
            const token = 'valid-token-123';
            const tokenHash = 'hashed-token-123';
            mockSha256Hex.mockReturnValue(tokenHash);
            const mockReportData = {
                id: 'report-123',
                storage_bucket: 'reports',
                storage_path: 'user-123/report-123.pdf',
                expires_at: '2024-12-31T23:59:59Z',
                revoked_at: null,
                downloaded_at: null,
                status: 'sent'
            };
            const mockSelect = jest.fn().mockReturnThis();
            const mockEq = jest.fn().mockResolvedValue({
                data: mockReportData,
                error: null
            });
            const mockUpdate = jest.fn().mockResolvedValue({
                data: null,
                error: null
            });
            const mockCreateSignedUrl = jest.fn().mockResolvedValue({
                data: { signedUrl: 'https://signed-url.example.com' },
                error: null
            });
            mockSupabaseFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        maybeSingle: jest.fn().mockResolvedValue({
                            data: {
                                id: 'report-123',
                                storage_bucket: 'reports',
                                storage_path: 'user-123/report-123.pdf',
                                expires_at: new Date(Date.now() + 3600000).toISOString(),
                                revoked_at: null,
                                downloaded_at: null,
                                status: 'sent'
                            },
                            error: null
                        })
                    })
                }),
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({
                        data: null,
                        error: null
                    })
                })
            });
            mockSupabaseStorageFrom.mockReturnValue({
                createSignedUrl: mockCreateSignedUrl
            });
            const response = await request(app)
                .get('/reports/r/valid-token-123')
                .expect(302);
            expect(response.headers.location).toBe('https://signed-url.example.com');
            expect(mockSha256Hex).toHaveBeenCalledWith('valid-token-123');
            expect(mockCreateSignedUrl).toHaveBeenCalledWith('user-123/report-123.pdf', 300);
        });
        it('should return 404 for invalid token', async () => {
            mockSha256Hex.mockReturnValue('invalid-hash');
            mockSupabaseFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        maybeSingle: jest.fn().mockResolvedValue({
                            data: null,
                            error: null
                        })
                    })
                })
            });
            const response = await request(app)
                .get('/reports/r/invalid-token')
                .expect(404);
            expect(response.text).toBe('Link not found');
        });
        it('should return 410 for revoked link', async () => {
            const tokenHash = 'revoked-token-hash';
            mockSha256Hex.mockReturnValue(tokenHash);
            const mockReportData = {
                id: 'report-123',
                storage_bucket: 'reports',
                storage_path: 'user-123/report-123.pdf',
                expires_at: '2024-12-31T23:59:59Z',
                revoked_at: '2024-01-15T10:00:00Z',
                downloaded_at: null,
                status: 'revoked'
            };
            mockSupabaseFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        maybeSingle: jest.fn().mockResolvedValue({
                            data: mockReportData,
                            error: null
                        })
                    })
                })
            });
            const response = await request(app)
                .get('/reports/r/revoked-token')
                .expect(410);
            expect(response.text).toBe('Link revoked');
        });
        it('should return 410 for expired link', async () => {
            const tokenHash = 'expired-token-hash';
            mockSha256Hex.mockReturnValue(tokenHash);
            const mockReportData = {
                id: 'report-123',
                storage_bucket: 'reports',
                storage_path: 'user-123/report-123.pdf',
                expires_at: '2024-01-01T00:00:00Z', // Past date
                revoked_at: null,
                downloaded_at: null,
                status: 'sent'
            };
            mockSupabaseFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        maybeSingle: jest.fn().mockResolvedValue({
                            data: mockReportData,
                            error: null
                        })
                    })
                })
            });
            const response = await request(app)
                .get('/reports/r/expired-token')
                .expect(410);
            expect(response.text).toBe('Link expired');
        });
    });
});
