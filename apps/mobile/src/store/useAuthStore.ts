/**
 * Auth Store
 * Authentication state management using Zustand with AsyncStorage persistence
 * SECURITY: Tokens are stored in SecureStorage (Keychain/Keystore), not AsyncStorage
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SecureStorage } from '@/services/storage/SecureStorage';

// ============================================
// TYPES
// ============================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export type UserRole = 'family_member' | 'caregiver';

export type OnboardingStep =
  | 'slides'
  | 'role_selection'
  | 'create_profile'
  | 'complete';

interface AuthState {
  // User
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Session
  accessToken: string | null;
  refreshToken: string | null;

  // Onboarding
  hasCompletedOnboarding: boolean;
  userRole: UserRole | null;
  currentOnboardingStep: OnboardingStep;

  // Email verification
  pendingVerificationEmail: string | null;

  // Error handling
  error: string | null;
}

interface AuthActions {
  // Auth actions
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => Promise<void>;

  // Email verification
  sendVerificationCode: (email: string) => Promise<boolean>;
  verifyEmail: (code: string) => Promise<boolean>;
  setPendingVerificationEmail: (email: string | null) => void;

  // Password reset
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;

  // Onboarding
  setUserRole: (role: UserRole) => void;
  setOnboardingStep: (step: OnboardingStep) => void;
  completeOnboarding: () => void;

  // User management
  updateUser: (updates: Partial<User>) => void;
  refreshUser: () => Promise<void>;

  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Hydration
  setHasHydrated: (hasHydrated: boolean) => void;
  _hasHydrated: boolean;

  // Secure storage hydration
  hydrateTokensFromSecureStorage: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

// ============================================
// INITIAL STATE
// ============================================

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  accessToken: null,
  refreshToken: null,
  hasCompletedOnboarding: false,
  userRole: null,
  currentOnboardingStep: 'slides',
  pendingVerificationEmail: null,
  error: null,
};

// ============================================
// MOCK API HELPERS (Replace with real API calls)
// ============================================

// Simulated delay for mock API calls
const mockApiDelay = () => new Promise(resolve => setTimeout(resolve, 1000));

// Generate mock user ID
const generateUserId = () => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// ============================================
// STORE
// ============================================

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      _hasHydrated: false,

      // ========================================
      // AUTH ACTIONS
      // ========================================

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          await mockApiDelay();

          // TODO: Replace with real API call
          // const response = await api.auth.login({ email, password });

          // Mock successful login
          if (email && password.length >= 8) {
            const mockUser: User = {
              id: generateUserId(),
              email,
              firstName: 'Priya',
              lastName: 'Sharma',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            const accessToken = 'mock_access_token';
            const refreshToken = 'mock_refresh_token';

            // SECURITY: Store tokens in secure storage (Keychain/Keystore)
            await SecureStorage.setAuthTokens(accessToken, refreshToken);

            set({
              user: mockUser,
              isAuthenticated: true,
              accessToken, // Keep in memory for API calls
              refreshToken, // Keep in memory for token refresh
              isLoading: false,
              error: null,
            });

            return true;
          } else {
            set({
              isLoading: false,
              error: 'Invalid email or password'
            });
            return false;
          }
        } catch (error) {
          const errorMessage = error instanceof Error
            ? error.message
            : 'An unexpected error occurred';
          set({ isLoading: false, error: errorMessage });
          return false;
        }
      },

      signup: async (data: SignupData) => {
        set({ isLoading: true, error: null });

        try {
          await mockApiDelay();

          // TODO: Replace with real API call
          // const response = await api.auth.signup(data);

          // Mock successful signup
          if (data.email && data.password.length >= 8) {
            // Set pending verification email
            set({
              pendingVerificationEmail: data.email,
              isLoading: false,
              error: null,
            });

            return true;
          } else {
            set({
              isLoading: false,
              error: 'Please provide valid email and password (min 8 characters)'
            });
            return false;
          }
        } catch (error) {
          const errorMessage = error instanceof Error
            ? error.message
            : 'An unexpected error occurred';
          set({ isLoading: false, error: errorMessage });
          return false;
        }
      },

      logout: async () => {
        // SECURITY: Clear tokens from secure storage
        await SecureStorage.clearAuthTokens();

        set({
          ...initialState,
          _hasHydrated: true, // Keep hydration state
        });
      },

      // ========================================
      // EMAIL VERIFICATION
      // ========================================

      sendVerificationCode: async (email: string) => {
        set({ isLoading: true, error: null });

        try {
          await mockApiDelay();

          // TODO: Replace with real API call
          // await api.auth.sendVerificationCode(email);

          set({
            pendingVerificationEmail: email,
            isLoading: false
          });
          return true;
        } catch (error) {
          const errorMessage = error instanceof Error
            ? error.message
            : 'Failed to send verification code';
          set({ isLoading: false, error: errorMessage });
          return false;
        }
      },

      verifyEmail: async (code: string) => {
        set({ isLoading: true, error: null });

        try {
          await mockApiDelay();

          // TODO: Replace with real API call
          // const response = await api.auth.verifyEmail(code);

          // Mock verification - accept any 6-digit code
          if (code.length === 6) {
            const pendingEmail = get().pendingVerificationEmail;

            const mockUser: User = {
              id: generateUserId(),
              email: pendingEmail || 'user@example.com',
              firstName: '',
              lastName: '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            const accessToken = 'mock_access_token';
            const refreshToken = 'mock_refresh_token';

            // SECURITY: Store tokens in secure storage (Keychain/Keystore)
            await SecureStorage.setAuthTokens(accessToken, refreshToken);

            set({
              user: mockUser,
              isAuthenticated: true,
              accessToken,
              refreshToken,
              pendingVerificationEmail: null,
              isLoading: false,
              error: null,
            });

            return true;
          } else {
            set({
              isLoading: false,
              error: 'Invalid verification code'
            });
            return false;
          }
        } catch (error) {
          const errorMessage = error instanceof Error
            ? error.message
            : 'Verification failed';
          set({ isLoading: false, error: errorMessage });
          return false;
        }
      },

      setPendingVerificationEmail: (email: string | null) => {
        set({ pendingVerificationEmail: email });
      },

      // ========================================
      // PASSWORD RESET
      // ========================================

      requestPasswordReset: async (email: string) => {
        set({ isLoading: true, error: null });

        try {
          await mockApiDelay();

          // TODO: Replace with real API call
          // await api.auth.requestPasswordReset(email);

          set({ isLoading: false });
          return true;
        } catch (error) {
          const errorMessage = error instanceof Error
            ? error.message
            : 'Failed to send reset email';
          set({ isLoading: false, error: errorMessage });
          return false;
        }
      },

      resetPassword: async (token: string, newPassword: string) => {
        set({ isLoading: true, error: null });

        try {
          await mockApiDelay();

          // TODO: Replace with real API call
          // await api.auth.resetPassword(token, newPassword);

          if (newPassword.length >= 8) {
            set({ isLoading: false });
            return true;
          } else {
            set({
              isLoading: false,
              error: 'Password must be at least 8 characters'
            });
            return false;
          }
        } catch (error) {
          const errorMessage = error instanceof Error
            ? error.message
            : 'Password reset failed';
          set({ isLoading: false, error: errorMessage });
          return false;
        }
      },

      // ========================================
      // ONBOARDING
      // ========================================

      setUserRole: (role: UserRole) => {
        set({ userRole: role });
      },

      setOnboardingStep: (step: OnboardingStep) => {
        set({ currentOnboardingStep: step });
      },

      completeOnboarding: () => {
        set({
          hasCompletedOnboarding: true,
          currentOnboardingStep: 'complete',
        });
      },

      // ========================================
      // USER MANAGEMENT
      // ========================================

      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              ...updates,
              updatedAt: new Date().toISOString(),
            },
          });
        }
      },

      refreshUser: async () => {
        const accessToken = get().accessToken;
        if (!accessToken) return;

        set({ isLoading: true });

        try {
          await mockApiDelay();

          // TODO: Replace with real API call
          // const response = await api.auth.me();
          // set({ user: response.user, isLoading: false });

          set({ isLoading: false });
        } catch (error) {
          console.error('Failed to refresh user:', error);
          set({ isLoading: false });
        }
      },

      // ========================================
      // UTILITY
      // ========================================

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      setHasHydrated: (hasHydrated: boolean) => {
        set({ _hasHydrated: hasHydrated });
      },

      // Restore tokens from secure storage on app start
      hydrateTokensFromSecureStorage: async () => {
        try {
          const { accessToken, refreshToken } = await SecureStorage.getAuthTokens();

          if (accessToken && refreshToken) {
            set({
              accessToken,
              refreshToken,
              // Only set authenticated if we have a user from AsyncStorage
              isAuthenticated: get().user !== null,
            });

            if (__DEV__) {
              console.log('[AuthStore] Tokens hydrated from secure storage');
            }
          } else if (get().isAuthenticated) {
            // User data exists but no tokens - need to re-authenticate
            if (__DEV__) {
              console.log('[AuthStore] No tokens found - clearing auth state');
            }
            set({
              isAuthenticated: false,
              user: null,
              accessToken: null,
              refreshToken: null,
            });
          }
        } catch (error) {
          console.error('[AuthStore] Failed to hydrate tokens:', error);
        }
      },
    }),
    {
      name: 'carebow-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // SECURITY: Do NOT persist tokens to AsyncStorage - they go to SecureStorage
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // accessToken and refreshToken are stored in SecureStorage, not here
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        userRole: state.userRole,
        currentOnboardingStep: state.currentOnboardingStep,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        // After AsyncStorage hydration, also hydrate tokens from SecureStorage
        state?.hydrateTokensFromSecureStorage();
      },
    }
  )
);

// ============================================
// SELECTORS
// ============================================

export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated;
export const selectUser = (state: AuthStore) => state.user;
export const selectIsLoading = (state: AuthStore) => state.isLoading;
export const selectError = (state: AuthStore) => state.error;
export const selectHasCompletedOnboarding = (state: AuthStore) => state.hasCompletedOnboarding;
export const selectUserRole = (state: AuthStore) => state.userRole;
export const selectCurrentOnboardingStep = (state: AuthStore) => state.currentOnboardingStep;

export default useAuthStore;
