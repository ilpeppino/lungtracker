import { jest } from '@jest/globals';

// Set up React Native bridge for testing BEFORE importing testing-library
if (!global.__fbBatchedBridgeConfig) {
  global.__fbBatchedBridgeConfig = {};
}

import '@testing-library/jest-native/extend-expect';

// Suppress react-test-renderer deprecation warning from @testing-library/react-native
const originalError = console.error;
console.error = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('react-test-renderer is deprecated')
  ) {
    return;
  }
  originalError.call(console, ...args);
};

declare global {
  var __fbBatchedBridgeConfig: any;
  var testUser: {
    id: string;
    email: string;
  };
  var testSession: {
    user: {
      id: string;
      email: string;
    };
    access_token: string;
    refresh_token: string;
  };
}

// Mock Expo modules
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      supabaseUrl: 'https://test.supabase.co',
      supabaseAnonKey: 'test-anon-key'
    }
  }
}));

// Mock other Expo modules
jest.mock('expo-router', () => ({
  Link: 'Link',
  Stack: 'Stack',
  Tabs: 'Tabs',
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn()
  })
}));

jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(),
  WebBrowserPresentationStyle: {}
}));

jest.mock('expo-symbols', () => ({
  SymbolView: 'SymbolView',
  SymbolWeight: {}
}));

jest.mock('expo-image', () => ({
  Image: 'Image'
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar'
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn()
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn()
}));

jest.mock('expo-font', () => ({
  loadAsync: jest.fn()
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn()
}));

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      }))
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn()
    }))
  }))
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn()
  }),
  useRoute: () => ({
    params: {}
  })
}));

// Mock Expo Haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn()
}));

// Mock React Query
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  QueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn()
  })),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children
}));

// Mock the Supabase service instance
jest.mock('src/services/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      }))
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn()
    }))
  }
}));

// Global test utilities
global.testUser = {
  id: 'test-user-123',
  email: 'test@example.com'
};

global.testSession = {
  user: global.testUser,
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token'
};