import { requireSupabaseUser } from '../../src/auth/supabase';

import { supabaseAdmin } from '../../src/db/supabaseAdmin';

// Mock supabaseAdmin
jest.mock('../../src/db/supabaseAdmin', () => ({
  supabaseAdmin: {
    auth: {
      getUser: jest.fn()
    }
  }
}));

const mockGetUser = supabaseAdmin.auth.getUser as jest.MockedFunction<typeof supabaseAdmin.auth.getUser>;

describe('supabase auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requireSupabaseUser', () => {
    it('should return user ID for valid token', async () => {
      const mockUser = { id: 'user-123', app_metadata: {}, user_metadata: {}, aud: 'test', created_at: '2024-01-01' };
      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const result = await requireSupabaseUser('Bearer valid-token');

      expect(result).toEqual({ userId: 'user-123' });
      expect(mockGetUser).toHaveBeenCalledWith('valid-token');
    });

    it('should throw error for missing bearer token', async () => {
      await expect(requireSupabaseUser()).rejects.toThrow('Missing bearer token');
      await expect(requireSupabaseUser('')).rejects.toThrow('Missing bearer token');
      await expect(requireSupabaseUser('Basic token')).rejects.toThrow('Missing bearer token');
    });

    it('should throw error for invalid token', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' } as any
      });

      await expect(requireSupabaseUser('Bearer invalid-token')).rejects.toThrow('Invalid or expired token');
    });

    it('should throw error when no user in token', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null
      } as any);

      await expect(requireSupabaseUser('Bearer token-no-user')).rejects.toThrow('No user in token');
    });

    it('should throw error when getUser fails', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Network error' } as any
      });

      await expect(requireSupabaseUser('Bearer failing-token')).rejects.toThrow('Invalid or expired token');
    });
  });
});