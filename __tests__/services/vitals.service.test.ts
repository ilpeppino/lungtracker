// Mock supabase first
jest.mock('@/src/services/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn()
    },
    from: jest.fn()
  }
}));

import { supabase } from '@/src/services/supabase';
import { createVitalsEntry } from '@/src/services/vitals.service';

const mockSupabase = supabase as any;

describe('vitals service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createVitalsEntry', () => {
    it('should create vitals entry successfully', async () => {
      const mockUser = { id: 'user-123' };
      const input = {
        measured_at: '2024-01-15T10:30:00Z',
        pulse_bpm: 72,
        systolic: 120,
        diastolic: 80,
        fev1_l: 3.2,
        notes: 'Feeling good'
      };

      const expectedPayload = {
        user_id: 'user-123',
        measured_at: '2024-01-15T10:30:00Z',
        pulse_bpm: 72,
        systolic: 120,
        diastolic: 80,
        fev1_l: 3.2,
        fev1_predicted_l: null,
        fev1_percent: null,
        pef_l_min: null,
        pef_predicted_l_min: null,
        pef_percent: null,
        notes: 'Feeling good',
        source: 'mobile'
      };

      const mockCreatedEntry = {
        id: 'vitals-123',
        ...expectedPayload,
        created_at: '2024-01-15T10:30:00Z'
      };

      // Mock auth.getUser
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock the database operation chain
      const mockInsert = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: mockCreatedEntry,
        error: null
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle
      });

      const result = await createVitalsEntry(input);

      expect(mockSupabase.auth.getUser).toHaveBeenCalled();
      expect(mockSupabase.from).toHaveBeenCalledWith('vitals_entries');
      expect(mockInsert).toHaveBeenCalledWith(expectedPayload);
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockSingle).toHaveBeenCalled();
      expect(result).toEqual(mockCreatedEntry);
    });

    it('should handle null/undefined optional fields', async () => {
      const mockUser = { id: 'user-456' };
      const input = {
        measured_at: '2024-01-15T10:30:00Z'
        // All other fields are optional and not provided
      };

      const expectedPayload = {
        user_id: 'user-456',
        measured_at: '2024-01-15T10:30:00Z',
        pulse_bpm: null,
        systolic: null,
        diastolic: null,
        fev1_l: null,
        fev1_predicted_l: null,
        fev1_percent: null,
        pef_l_min: null,
        pef_predicted_l_min: null,
        pef_percent: null,
        notes: null,
        source: 'mobile'
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const mockInsert = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: { id: 'vitals-456', ...expectedPayload },
        error: null
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle
      });

      await createVitalsEntry(input);

      expect(mockInsert).toHaveBeenCalledWith(expectedPayload);
    });

    it('should allow custom source', async () => {
      const mockUser = { id: 'user-789' };
      const input = {
        measured_at: '2024-01-15T10:30:00Z',
        source: 'web'
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const mockInsert = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: { id: 'vitals-789' },
        error: null
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle
      });

      await createVitalsEntry(input);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ source: 'web' })
      );
    });

    it('should throw error when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' }
      });

      const input = {
        measured_at: '2024-01-15T10:30:00Z'
      };

      await expect(createVitalsEntry(input)).rejects.toThrow('Not authenticated');
    });

    it('should throw error when getUser fails', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Network error' }
      });

      const input = {
        measured_at: '2024-01-15T10:30:00Z'
      };

      await expect(createVitalsEntry(input)).rejects.toThrow('Network error');
    });

    it('should throw error when database operation fails', async () => {
      const mockUser = { id: 'user-123' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const mockInsert = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database constraint violation' }
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle
      });

      const input = {
        measured_at: '2024-01-15T10:30:00Z'
      };

      await expect(createVitalsEntry(input)).rejects.toThrow('Database constraint violation');
    });
  });
});