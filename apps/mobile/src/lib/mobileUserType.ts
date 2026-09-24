import type { AccessProfileSummary, UserTypeSlug } from '@/services/api/types';

const MOBILE_USER_TYPES: UserTypeSlug[] = [
  'customer',
  'healthcare_provider',
  'service_provider',
  'service_partner',
];

/**
 * Backend accounts still use org_* slugs. Mobile only has four app-facing
 * types; map the org roles onto the closest provider dashboard rather than
 * silently treating them as customers.
 */
const BACKEND_TO_MOBILE: Record<string, UserTypeSlug> = {
  customer: 'customer',
  healthcare_provider: 'healthcare_provider',
  service_provider: 'service_provider',
  service_partner: 'service_partner',
  org_member: 'service_provider',
  org_admin: 'service_partner',
};

type AuthUserEnvelope = {
  user?: Record<string, unknown>;
  data?: { user?: Record<string, unknown> };
  availableProfiles?: AccessProfileSummary[];
} | null;

export function canonicalizeMobileUserType(raw: unknown): UserTypeSlug | null {
  if (typeof raw !== 'string' || !raw) return null;
  if (BACKEND_TO_MOBILE[raw]) return BACKEND_TO_MOBILE[raw];
  return (MOBILE_USER_TYPES as string[]).includes(raw) ? (raw as UserTypeSlug) : null;
}

export function extractMobileUserType(payload: AuthUserEnvelope): UserTypeSlug | null {
  const raw = payload?.user?.userTypeSlug ?? payload?.data?.user?.userTypeSlug;
  return canonicalizeMobileUserType(raw);
}

export function extractOnboardingCompleted(payload: AuthUserEnvelope): boolean {
  const user = payload?.user ?? payload?.data?.user;
  if (user?.onboardingCompleted === true) return true;
  const profiles = payload?.availableProfiles;
  return (
    Array.isArray(profiles) && profiles.some((profile) => profile?.onboardingCompleted === true)
  );
}
