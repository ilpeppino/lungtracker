// Mock the supabase client first
const mockSupabase = {
  auth: {
    getSession: jest.fn(),
    onAuthStateChange: jest.fn()
  }
};

jest.mock('@/src/services/supabase', () => ({
  supabase: mockSupabase
}));

import { useAuth } from '@/src/hooks/useAuth';
import { act, renderHook, waitFor } from '@testing-library/react-native';

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    });

    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.session).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthed).toBe(false);
  });

  it('should set session when user is authenticated', async () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
      access_token: 'access-token-123'
    };

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null
    });

    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.session).toEqual(mockSession);
    expect(result.current.user).toEqual(mockSession.user);
    expect(result.current.isAuthed).toBe(true);
  });

  it('should handle session changes', async () => {
    const initialSession = null;
    const newSession = {
      user: { id: 'user-456', email: 'new@example.com' },
      access_token: 'new-access-token'
    };

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: initialSession },
      error: null
    });

    let authStateChangeCallback: (event: string, session: any) => void;

    mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
      authStateChangeCallback = callback;
      return {
        data: { subscription: { unsubscribe: jest.fn() } }
      };
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Simulate auth state change
    act(() => {
      authStateChangeCallback('SIGNED_IN', newSession);
    });

    expect(result.current.session).toEqual(newSession);
    expect(result.current.user).toEqual(newSession.user);
    expect(result.current.isAuthed).toBe(true);
  });

  it('should handle sign out', async () => {
    const initialSession = {
      user: { id: 'user-123', email: 'test@example.com' },
      access_token: 'access-token-123'
    };

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: initialSession },
      error: null
    });

    let authStateChangeCallback: (event: string, session: any) => void;

    mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
      authStateChangeCallback = callback;
      return {
        data: { subscription: { unsubscribe: jest.fn() } }
      };
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isAuthed).toBe(true);
    });

    // Simulate sign out
    act(() => {
      authStateChangeCallback('SIGNED_OUT', null);
    });

    expect(result.current.session).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthed).toBe(false);
  });

  it('should handle getSession errors gracefully', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: { message: 'Network error' }
    });

    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    });

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(consoleSpy).toHaveBeenCalledWith('getSession:', 'Network error');
    expect(result.current.session).toBeNull();
    expect(result.current.isAuthed).toBe(false);

    consoleSpy.mockRestore();
  });

  it('should unsubscribe on unmount', () => {
    const mockUnsubscribe = jest.fn();

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    });

    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } }
    });

    const { unmount } = renderHook(() => useAuth());

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});