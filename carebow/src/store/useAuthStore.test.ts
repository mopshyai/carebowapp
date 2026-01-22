/**
 * Auth Store Tests
 * Unit tests for authentication state management
 */

import { act } from '@testing-library/react-native';
import { useAuthStore } from './useAuthStore';

// Reset store before each test
beforeEach(async () => {
  const { logout, setHasHydrated } = useAuthStore.getState();
  await logout();
  setHasHydrated(true);
});

// ============================================
// INITIAL STATE
// ============================================

describe('AuthStore Initial State', () => {
  it('starts with null user', () => {
    const { user } = useAuthStore.getState();
    expect(user).toBeNull();
  });

  it('starts not authenticated', () => {
    const { isAuthenticated } = useAuthStore.getState();
    expect(isAuthenticated).toBe(false);
  });

  it('starts not loading', () => {
    const { isLoading } = useAuthStore.getState();
    expect(isLoading).toBe(false);
  });

  it('starts without tokens', () => {
    const { accessToken, refreshToken } = useAuthStore.getState();
    expect(accessToken).toBeNull();
    expect(refreshToken).toBeNull();
  });

  it('starts with onboarding not completed', () => {
    const { hasCompletedOnboarding } = useAuthStore.getState();
    expect(hasCompletedOnboarding).toBe(false);
  });

  it('starts at slides onboarding step', () => {
    const { currentOnboardingStep } = useAuthStore.getState();
    expect(currentOnboardingStep).toBe('slides');
  });
});

// ============================================
// LOGIN
// ============================================

describe('AuthStore Login', () => {
  it('sets loading state during login', async () => {
    const store = useAuthStore.getState();

    // Start login (don't await)
    const loginPromise = store.login('test@example.com', 'password123');

    // Check loading state
    expect(useAuthStore.getState().isLoading).toBe(true);

    await loginPromise;
  });

  it('successful login sets user and tokens', async () => {
    const store = useAuthStore.getState();
    const result = await store.login('test@example.com', 'password123');

    expect(result).toBe(true);

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).not.toBeNull();
    expect(state.user?.email).toBe('test@example.com');
    expect(state.accessToken).toBe('mock_access_token');
    expect(state.refreshToken).toBe('mock_refresh_token');
    expect(state.isLoading).toBe(false);
  });

  it('failed login sets error', async () => {
    const store = useAuthStore.getState();
    const result = await store.login('test@example.com', 'short'); // password < 8 chars

    expect(result).toBe(false);

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.error).toBeDefined();
    expect(state.isLoading).toBe(false);
  });
});

// ============================================
// SIGNUP
// ============================================

describe('AuthStore Signup', () => {
  it('successful signup sets pending verification email', async () => {
    const store = useAuthStore.getState();
    const result = await store.signup({
      email: 'new@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    });

    expect(result).toBe(true);

    const state = useAuthStore.getState();
    expect(state.pendingVerificationEmail).toBe('new@example.com');
    expect(state.isLoading).toBe(false);
  });

  it('failed signup with short password sets error', async () => {
    const store = useAuthStore.getState();
    const result = await store.signup({
      email: 'new@example.com',
      password: 'short',
      firstName: 'John',
      lastName: 'Doe',
    });

    expect(result).toBe(false);

    const state = useAuthStore.getState();
    expect(state.error).toBeDefined();
    expect(state.isLoading).toBe(false);
  });
});

// ============================================
// LOGOUT
// ============================================

describe('AuthStore Logout', () => {
  it('logout clears all auth state', async () => {
    // First login
    const store = useAuthStore.getState();
    await store.login('test@example.com', 'password123');

    // Verify logged in
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    // Logout (now async)
    await store.logout();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
  });

  it('logout preserves hydration state', async () => {
    const store = useAuthStore.getState();
    await store.login('test@example.com', 'password123');
    store.setHasHydrated(true);

    await store.logout();

    expect(useAuthStore.getState()._hasHydrated).toBe(true);
  });
});

// ============================================
// EMAIL VERIFICATION
// ============================================

describe('AuthStore Email Verification', () => {
  it('sendVerificationCode sets pending email', async () => {
    const store = useAuthStore.getState();
    const result = await store.sendVerificationCode('verify@example.com');

    expect(result).toBe(true);
    expect(useAuthStore.getState().pendingVerificationEmail).toBe('verify@example.com');
  });

  it('verifyEmail with valid code logs user in', async () => {
    const store = useAuthStore.getState();
    store.setPendingVerificationEmail('verify@example.com');

    const result = await store.verifyEmail('123456');

    expect(result).toBe(true);

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.email).toBe('verify@example.com');
    expect(state.pendingVerificationEmail).toBeNull();
  });

  it('verifyEmail with invalid code sets error', async () => {
    const store = useAuthStore.getState();
    store.setPendingVerificationEmail('verify@example.com');

    const result = await store.verifyEmail('12345'); // 5 digits

    expect(result).toBe(false);
    expect(useAuthStore.getState().error).toBeDefined();
  });

  it('setPendingVerificationEmail updates state', () => {
    const store = useAuthStore.getState();

    store.setPendingVerificationEmail('test@example.com');
    expect(useAuthStore.getState().pendingVerificationEmail).toBe('test@example.com');

    store.setPendingVerificationEmail(null);
    expect(useAuthStore.getState().pendingVerificationEmail).toBeNull();
  });
});

// ============================================
// PASSWORD RESET
// ============================================

describe('AuthStore Password Reset', () => {
  it('requestPasswordReset succeeds for any email', async () => {
    const store = useAuthStore.getState();
    const result = await store.requestPasswordReset('reset@example.com');

    expect(result).toBe(true);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('resetPassword succeeds with valid password', async () => {
    const store = useAuthStore.getState();
    const result = await store.resetPassword('token123', 'newpassword123');

    expect(result).toBe(true);
  });

  it('resetPassword fails with short password', async () => {
    const store = useAuthStore.getState();
    const result = await store.resetPassword('token123', 'short');

    expect(result).toBe(false);
    expect(useAuthStore.getState().error).toBeDefined();
  });
});

// ============================================
// ONBOARDING
// ============================================

describe('AuthStore Onboarding', () => {
  it('setUserRole updates role', () => {
    const store = useAuthStore.getState();

    store.setUserRole('family_member');
    expect(useAuthStore.getState().userRole).toBe('family_member');

    store.setUserRole('caregiver');
    expect(useAuthStore.getState().userRole).toBe('caregiver');
  });

  it('setOnboardingStep updates step', () => {
    const store = useAuthStore.getState();

    store.setOnboardingStep('role_selection');
    expect(useAuthStore.getState().currentOnboardingStep).toBe('role_selection');

    store.setOnboardingStep('create_profile');
    expect(useAuthStore.getState().currentOnboardingStep).toBe('create_profile');
  });

  it('completeOnboarding sets completion state', () => {
    const store = useAuthStore.getState();

    store.completeOnboarding();

    const state = useAuthStore.getState();
    expect(state.hasCompletedOnboarding).toBe(true);
    expect(state.currentOnboardingStep).toBe('complete');
  });
});

// ============================================
// USER MANAGEMENT
// ============================================

describe('AuthStore User Management', () => {
  it('updateUser merges user updates', async () => {
    const store = useAuthStore.getState();
    await store.login('test@example.com', 'password123');

    store.updateUser({ firstName: 'Updated', lastName: 'Name' });

    const state = useAuthStore.getState();
    expect(state.user?.firstName).toBe('Updated');
    expect(state.user?.lastName).toBe('Name');
    expect(state.user?.email).toBe('test@example.com');
    // updatedAt should be set (a valid ISO date string)
    expect(state.user?.updatedAt).toBeDefined();
    expect(new Date(state.user?.updatedAt || '').getTime()).not.toBeNaN();
  });

  it('updateUser does nothing when no user', () => {
    const store = useAuthStore.getState();

    // Should not throw
    store.updateUser({ firstName: 'Test' });

    expect(useAuthStore.getState().user).toBeNull();
  });
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

describe('AuthStore Utility Functions', () => {
  it('setLoading updates loading state', () => {
    const store = useAuthStore.getState();

    store.setLoading(true);
    expect(useAuthStore.getState().isLoading).toBe(true);

    store.setLoading(false);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('setError updates error state', () => {
    const store = useAuthStore.getState();

    store.setError('Test error');
    expect(useAuthStore.getState().error).toBe('Test error');

    store.setError(null);
    expect(useAuthStore.getState().error).toBeNull();
  });

  it('clearError clears error', () => {
    const store = useAuthStore.getState();

    store.setError('Test error');
    store.clearError();

    expect(useAuthStore.getState().error).toBeNull();
  });

  it('setHasHydrated updates hydration state', () => {
    const store = useAuthStore.getState();

    store.setHasHydrated(false);
    expect(useAuthStore.getState()._hasHydrated).toBe(false);

    store.setHasHydrated(true);
    expect(useAuthStore.getState()._hasHydrated).toBe(true);
  });
});

// ============================================
// SELECTORS
// ============================================

describe('AuthStore Selectors', () => {
  it('selectors return correct values', async () => {
    const store = useAuthStore.getState();
    await store.login('test@example.com', 'password123');
    store.setUserRole('family_member');
    store.setOnboardingStep('create_profile');

    const state = useAuthStore.getState();

    // Test selector-like access
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).not.toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.hasCompletedOnboarding).toBe(false);
    expect(state.userRole).toBe('family_member');
    expect(state.currentOnboardingStep).toBe('create_profile');
  });
});
