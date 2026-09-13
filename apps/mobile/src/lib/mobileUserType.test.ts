import {
  canonicalizeMobileUserType,
  extractMobileUserType,
  extractOnboardingCompleted,
} from './mobileUserType';

describe('canonicalizeMobileUserType', () => {
  it('keeps the four mobile app types', () => {
    expect(canonicalizeMobileUserType('customer')).toBe('customer');
    expect(canonicalizeMobileUserType('healthcare_provider')).toBe('healthcare_provider');
    expect(canonicalizeMobileUserType('service_provider')).toBe('service_provider');
    expect(canonicalizeMobileUserType('service_partner')).toBe('service_partner');
  });

  it('maps org accounts onto provider dashboards instead of customer', () => {
    expect(canonicalizeMobileUserType('org_member')).toBe('service_provider');
    expect(canonicalizeMobileUserType('org_admin')).toBe('service_partner');
  });

  it('does not invent a type for admin or unknown slugs', () => {
    expect(canonicalizeMobileUserType('ADMIN')).toBeNull();
    expect(canonicalizeMobileUserType('super_admin')).toBeNull();
    expect(canonicalizeMobileUserType('')).toBeNull();
    expect(canonicalizeMobileUserType(undefined)).toBeNull();
  });
});

describe('extractMobileUserType', () => {
  it('reads userTypeSlug from either envelope shape', () => {
    expect(extractMobileUserType({ user: { userTypeSlug: 'org_member' } })).toBe(
      'service_provider'
    );
    expect(extractMobileUserType({ data: { user: { userTypeSlug: 'customer' } } })).toBe(
      'customer'
    );
  });
});

describe('extractOnboardingCompleted', () => {
  it('honors the server flag on the user object', () => {
    expect(extractOnboardingCompleted({ user: { onboardingCompleted: true } })).toBe(true);
    expect(extractOnboardingCompleted({ user: { onboardingCompleted: false } })).toBe(false);
    expect(extractOnboardingCompleted({ user: {} })).toBe(false);
  });

  it('treats any completed access profile as onboarded', () => {
    expect(
      extractOnboardingCompleted({
        user: { onboardingCompleted: false },
        availableProfiles: [{ userTypeSlug: 'customer', onboardingCompleted: true }],
      })
    ).toBe(true);
  });
});
