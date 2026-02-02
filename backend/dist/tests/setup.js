import { jest } from '@jest/globals';
// Mock environment variables for testing
process.env.PORT = '8080';
process.env.PUBLIC_BASE_URL = 'http://localhost:8080';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.SUPABASE_REPORTS_BUCKET = 'test-reports';
process.env.RESEND_API_KEY = 'test-resend-key';
process.env.REPORT_FROM_EMAIL = 'test@example.com';
process.env.REPORT_LINK_TTL_SECONDS = '3600';
process.env.SIGNED_URL_TTL_SECONDS = '300';
// Mock crypto for consistent testing
jest.mock('crypto', () => ({
    randomUUID: jest.fn(() => 'test-uuid-123'),
    randomBytes: jest.fn((size) => Buffer.alloc(size, 'a')),
    createHash: jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn(() => 'mocked-hash')
    }))
}));
// Mock puppeteer
jest.mock('puppeteer', () => ({
    launch: jest.fn(() => Promise.resolve({
        newPage: jest.fn(() => Promise.resolve({
            setContent: jest.fn(),
            pdf: jest.fn(() => Promise.resolve(Buffer.from('mock-pdf-content')))
        })),
        close: jest.fn()
    }))
}));
// Mock resend
jest.mock('resend', () => ({
    Resend: jest.fn(() => ({
        emails: {
            send: jest.fn()
        }
    }))
}));
global.testUserId = 'test-user-123';
global.testToken = 'test-jwt-token';
