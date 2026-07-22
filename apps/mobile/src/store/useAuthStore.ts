/**
 * Auth Store
 * Authentication state management using Zustand with AsyncStorage persistence
 * SECURITY: Tokens are stored in SecureStorage (Keychain/Keystore), not AsyncStorage
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SecureStorage } from '@/services/storage/SecureStorage';
import { authApi, extractTokens, extractUser } from '@/services/api/endpoints/auth';
import { ApiClient } from '@/services/api/ApiClient';
import { AccessProfileSummary, ApiError, UserTypeSlug } from '@/services/api/types';

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

export type { UserTypeSlug };

export const USER_TYPES: Array<{ slug: UserTypeSlug; title: string; description: string }> = [
  { slug: 'customer', title: 'Customer', description: 'Get care for yourself or family' },
  {
    slug: 'service_provider',
    title: 'Caregiver',
    description: 'Provide home care & personal support',
  },
  { slug: 'healthcare_provider', title: 'Provider', description: 'Doctors, nurses & clinicians' },
  { slug: 'service_partner', title: 'Partner', description: 'Labs, pharmacies & care businesses' },
];

/** Provider accounts use the provider dashboard and skip customer onboarding. */
export const isProviderUserType = (userType: UserTypeSlug | null): boolean =>
  userType != null && userType !== 'customer';

export type OnboardingStep = 'slides' | 'role_selection' | 'create_profile' | 'complete';

interface AuthState {
  // User
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Which of the 4 backend user types this account belongs to
  userType: UserTypeSlug;
  availableProfiles: AccessProfileSummary[];
  passwordSetupEmail: string | null;

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
  login: (email: string, password: string, userTypeSlug?: UserTypeSlug) => Promise<boolean>;
  chooseLoginProfile: (userTypeSlug: UserTypeSlug) => Promise<boolean>;
  cancelProfileSelection: () => void;
  dismissPasswordSetup: () => void;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => Promise<void>;

  // User type (backend account type, chosen at signup)
  setUserType: (userType: UserTypeSlug) => void;

  // Email verification
  sendVerificationCode: (email: string) => Promise<boolean>;
  verifyEmail: (code: string) => Promise<boolean>;
  setPendingVerificationEmail: (email: string | null) => void;
  completeVerifiedLogin: () => Promise<boolean>;

  // Password reset
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  /** Passwordless recovery: email a one-time sign-in code for an existing account. */
  requestLoginCode: (email: string) => Promise<boolean>;

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
  userType: 'customer',
  availableProfiles: [],
  passwordSetupEmail: null,
  accessToken: null,
  refreshToken: null,
  hasCompletedOnboarding: false,
  userRole: null,
  currentOnboardingStep: 'slides',
  pendingVerificationEmail: null,
  error: null,
};

// ============================================
// HELPERS
// ============================================

/**
 * Held in memory only (never persisted) so we can auto-login right after
 * OTP verification if the backend doesn't issue a session on verify.
 */
let pendingSignupPassword: string | null = null;
let pendingLoginCredentials: { email: string; password: string } | null = null;

/** Map the backend's (loosely-shaped) user object onto the store's User. */
const normalizeUser = (raw: Record<string, unknown> | null, fallbackEmail: string): User => {
  const r = raw ?? {};
  const str = (v: unknown): string => (typeof v === 'string' ? v : '');
  return {
    id: str(r.id ?? r._id ?? r.userId) || `user_${fallbackEmail}`,
    email: str(r.email) || fallbackEmail,
    firstName: str(r.firstName ?? r.first_name ?? r.name),
    lastName: str(r.lastName ?? r.last_name),
    phone: str(r.phone ?? r.mobile) || undefined,
    avatarUrl: str(r.avatarUrl ?? r.avatar_url ?? r.avatar) || undefined,
    createdAt: str(r.createdAt ?? r.created_at) || new Date().toISOString(),
    updatedAt: str(r.updatedAt ?? r.updated_at) || new Date().toISOString(),
  };
};

const VALID_USER_TYPES: UserTypeSlug[] = [
  'customer',
  'healthcare_provider',
  'service_provider',
  'service_partner',
];

/** Pull a valid userTypeSlug out of the auth response user object. */
const extractUserType = (
  payload:
    | { user?: Record<string, unknown>; data?: { user?: Record<string, unknown> } }
    | null
    | undefined
): UserTypeSlug | null => {
  const raw = payload?.user?.userTypeSlug ?? payload?.data?.user?.userTypeSlug;
  return typeof raw === 'string' && (VALID_USER_TYPES as string[]).includes(raw)
    ? (raw as UserTypeSlug)
    : null;
};

/**
 * Mirror the authenticated account into the profile store so Profile/Settings
 * screens show the REAL logged-in user instead of stale local data. Uses a lazy
 * require to avoid a circular import between the two stores.
 */
const syncProfileStore = (u: User) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useProfileStore } = require('@/store/useProfileStore');
    const existing = useProfileStore.getState().user;
    useProfileStore.getState().setUser({
      id: u.id,
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      email: u.email || '',
      phone: u.phone || existing?.phone || '',
      dateOfBirth: existing?.dateOfBirth,
      gender: existing?.gender,
      createdAt: u.createdAt || existing?.createdAt || new Date().toISOString(),
      updatedAt: u.updatedAt || new Date().toISOString(),
    });
  } catch {
    // profile store unavailable — non-fatal
  }
};

const messageFromError = (error: unknown, fallback: string): string => {
  if (error instanceof ApiError) {
    if (error.code === 'RATE_LIMITED') {
      return 'Too many attempts. Please wait a minute and try again.';
    }
    if (error.code === 'NETWORK_ERROR') {
      return 'Cannot reach CareBow servers. Check your connection and try again.';
    }
    return error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
};

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

      login: async (email: string, password: string, userTypeSlug?: UserTypeSlug) => {
        set({ isLoading: true, error: null });

        try {
          const envelope = await authApi.login({
            method: 'email-password',
            email,
            password,
            userTypeSlug,
          });

          if (envelope.success === false) {
            set({ isLoading: false, error: envelope.error || 'Invalid email or password' });
            return false;
          }

          if (envelope.requiresProfileSelection && envelope.availableProfiles?.length) {
            pendingLoginCredentials = { email, password };
            set({
              availableProfiles: envelope.availableProfiles,
              isLoading: false,
              error: null,
            });
            return false;
          }

          const user = normalizeUser(extractUser(envelope), email);
          const tokens = extractTokens(envelope);

          if (tokens) {
            // SECURITY: Store tokens in secure storage (Keychain/Keystore)
            await SecureStorage.setAuthTokens(tokens.accessToken, tokens.refreshToken);
          }

          set({
            user,
            isAuthenticated: true,
            // The login response is authoritative for account type. Never inherit
            // a stale persisted type (would show e.g. a provider dashboard to a
            // customer); default to 'customer' if the field is somehow absent.
            userType: extractUserType(envelope) ?? 'customer',
            accessToken: tokens?.accessToken ?? null,
            refreshToken: tokens?.refreshToken ?? null,
            isLoading: false,
            error: null,
            availableProfiles: [],
            passwordSetupEmail: null,
          });
          pendingLoginCredentials = null;
          syncProfileStore(user);

          return true;
        } catch (error) {
          if (error instanceof ApiError && error.status === 409) {
            set({
              isLoading: false,
              error: null,
              passwordSetupEmail: email.trim().toLowerCase(),
            });
            return false;
          }
          set({
            isLoading: false,
            error: messageFromError(error, 'Login failed. Please try again.'),
          });
          return false;
        }
      },

      chooseLoginProfile: async (userTypeSlug: UserTypeSlug) => {
        if (!pendingLoginCredentials) {
          set({
            error: 'Your login session expired. Please enter your password again.',
            availableProfiles: [],
          });
          return false;
        }
        const { email, password } = pendingLoginCredentials;
        return get().login(email, password, userTypeSlug);
      },

      cancelProfileSelection: () => {
        pendingLoginCredentials = null;
        set({ availableProfiles: [], error: null });
      },

      dismissPasswordSetup: () => {
        set({ passwordSetupEmail: null, error: null });
      },

      signup: async (data: SignupData) => {
        set({ isLoading: true, error: null });

        try {
          const envelope = await authApi.signup({
            method: 'email-password',
            email: data.email,
            password: data.password,
            userTypeSlug: get().userType,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
          });

          if (envelope.success === false) {
            set({ isLoading: false, error: envelope.error || 'Signup failed. Please try again.' });
            return false;
          }

          // v1 email-password signup AUTO-VERIFIES and returns tokens immediately.
          // If tokens are present, log the user straight in (no OTP screen).
          const tokens = extractTokens(envelope);
          if (tokens) {
            await SecureStorage.setAuthTokens(tokens.accessToken, tokens.refreshToken);
            const su = normalizeUser(extractUser(envelope), data.email);
            set({
              user: su,
              isAuthenticated: true,
              userType: extractUserType(envelope) ?? get().userType,
              accessToken: tokens.accessToken,
              refreshToken: tokens.refreshToken,
              pendingVerificationEmail: null,
              isLoading: false,
              error: null,
            });
            syncProfileStore(su);
            return true;
          }

          // Fallback (e.g. email-otp method): backend sent an OTP; keep the
          // password in memory only, so we can auto-login after verification.
          pendingSignupPassword = data.password;
          set({
            pendingVerificationEmail: data.email,
            isLoading: false,
            error: null,
          });

          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: messageFromError(error, 'Signup failed. Please try again.'),
          });
          return false;
        }
      },

      logout: async () => {
        pendingSignupPassword = null;
        pendingLoginCredentials = null;

        // SECURITY: Clear tokens from secure storage and the API client
        await Promise.all([SecureStorage.clearAuthTokens(), ApiClient.clearTokens()]);

        // Also clear the local profile store so no account data lingers.
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const { useProfileStore } = require('@/store/useProfileStore');
          useProfileStore.getState().logout?.();
        } catch {
          // profile store unavailable — non-fatal
        }

        set({
          ...initialState,
          _hasHydrated: true, // Keep hydration state
        });
      },

      setUserType: (userType: UserTypeSlug) => {
        set({ userType });
      },

      // ========================================
      // EMAIL VERIFICATION
      // ========================================

      sendVerificationCode: async (email: string) => {
        set({ isLoading: true, error: null });

        try {
          // NOTE: /auth/resend-verification is not yet verified against the live
          // backend (signup itself auto-sends the first OTP). If the endpoint is
          // missing server-side this surfaces as a clear error instead of a mock success.
          await authApi.resendVerificationCode(email);

          set({
            pendingVerificationEmail: email,
            isLoading: false,
          });
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: messageFromError(error, 'Failed to send verification code'),
          });
          return false;
        }
      },

      verifyEmail: async (code: string) => {
        set({ isLoading: true, error: null });

        try {
          const pendingEmail = get().pendingVerificationEmail;

          const envelope = await authApi.verifyEmail({ token: code });

          if (envelope.success === false) {
            set({ isLoading: false, error: envelope.error || 'Invalid verification code' });
            return false;
          }

          let user = extractUser(envelope);
          let tokens = extractTokens(envelope);

          // If verification succeeded but didn't issue a session, log in with
          // the credentials from the just-completed signup.
          if (!tokens && pendingEmail && pendingSignupPassword) {
            const loginEnvelope = await authApi.login({
              method: 'email-password',
              email: pendingEmail,
              password: pendingSignupPassword,
              userTypeSlug: get().userType,
            });
            if (loginEnvelope.success !== false) {
              user = extractUser(loginEnvelope) ?? user;
              tokens = extractTokens(loginEnvelope);
            }
          }

          pendingSignupPassword = null;

          if (tokens) {
            // SECURITY: Store tokens in secure storage (Keychain/Keystore)
            await SecureStorage.setAuthTokens(tokens.accessToken, tokens.refreshToken);
            const vu = normalizeUser(user, pendingEmail || '');
            set({
              user: vu,
              isAuthenticated: true,
              userType: extractUserType({ user: user ?? undefined }) ?? get().userType,
              accessToken: tokens.accessToken,
              refreshToken: tokens.refreshToken,
              pendingVerificationEmail: null,
              isLoading: false,
              error: null,
            });
            syncProfileStore(vu);
          } else {
            // Verified, but no session (e.g. deep link on a cold start where the
            // signup password is gone). Caller should route to Login.
            set({
              pendingVerificationEmail: null,
              isLoading: false,
              error: null,
            });
          }

          return true;
        } catch (error) {
          set({ isLoading: false, error: messageFromError(error, 'Verification failed') });
          return false;
        }
      },

      setPendingVerificationEmail: (email: string | null) => {
        set({ pendingVerificationEmail: email });
      },

      /**
       * The backend verifies via an emailed link (not an in-app code). After
       * the user taps that link, this logs them in with the credentials held
       * in memory from the just-completed signup.
       */
      completeVerifiedLogin: async () => {
        const pendingEmail = get().pendingVerificationEmail;

        if (!pendingEmail || !pendingSignupPassword) {
          set({
            error: 'Session expired. Please sign in with your email and password.',
          });
          return false;
        }

        set({ isLoading: true, error: null });

        try {
          const envelope = await authApi.login({
            method: 'email-password',
            email: pendingEmail,
            password: pendingSignupPassword,
            userTypeSlug: get().userType,
          });

          if (envelope.success === false) {
            set({
              isLoading: false,
              // Most common cause: they haven't actually clicked the link yet.
              error:
                envelope.error ||
                'Please tap the verification link in your email first, then try again.',
            });
            return false;
          }

          const user = extractUser(envelope);
          const tokens = extractTokens(envelope);

          if (tokens) {
            await SecureStorage.setAuthTokens(tokens.accessToken, tokens.refreshToken);
          }

          pendingSignupPassword = null;

          set({
            user: normalizeUser(user, pendingEmail),
            isAuthenticated: true,
            accessToken: tokens?.accessToken ?? null,
            refreshToken: tokens?.refreshToken ?? null,
            pendingVerificationEmail: null,
            isLoading: false,
            error: null,
          });

          return true;
        } catch (error) {
          set({ isLoading: false, error: messageFromError(error, 'Login failed') });
          return false;
        }
      },

      // ========================================
      // PASSWORD RESET
      // ========================================

      requestLoginCode: async (email: string) => {
        set({ isLoading: true, error: null });

        try {
          const envelope = await authApi.requestEmailCode(email);

          if (envelope.success === false) {
            set({
              isLoading: false,
              error:
                envelope.error ||
                "We couldn't send a code to that email. Check the address and try again.",
            });
            return false;
          }

          // Code login has no password to fall back on; clear any stale one so
          // verifyEmail() takes the token-issuing path rather than a password login.
          pendingSignupPassword = null;
          set({ pendingVerificationEmail: email, isLoading: false, error: null });
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: messageFromError(error, "Couldn't send a sign-in code. Please try again."),
          });
          return false;
        }
      },

      requestPasswordReset: async (email: string) => {
        set({ isLoading: true, error: null });

        try {
          // NOTE: endpoint not yet verified against the live backend.
          await authApi.requestPasswordReset(email);
          set({ isLoading: false });
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: messageFromError(error, 'Failed to send reset email'),
          });
          return false;
        }
      },

      resetPassword: async (token: string, newPassword: string) => {
        set({ isLoading: true, error: null });

        try {
          // NOTE: endpoint not yet verified against the live backend.
          await authApi.resetPassword(token, newPassword);
          set({ isLoading: false });
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: messageFromError(error, 'Password reset failed'),
          });
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
          // NOTE: /auth/me not yet verified against the live backend; keeps
          // the cached user on failure rather than logging out.
          const response = await authApi.getCurrentUser();
          const raw = response as unknown as Record<string, unknown>;
          const user = normalizeUser(
            (raw.user as Record<string, unknown>) ?? raw,
            get().user?.email || ''
          );
          set({ user, isLoading: false });
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
            const hydratedUser = get().user;
            set({
              accessToken,
              refreshToken,
              // Only set authenticated if we have a user from AsyncStorage
              isAuthenticated: hydratedUser !== null,
            });
            // Overwrite any stale local profile data with the real account.
            if (hydratedUser) syncProfileStore(hydratedUser);

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
        userType: state.userType,
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
