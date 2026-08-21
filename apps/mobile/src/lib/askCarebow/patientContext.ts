import type { AgeGroup } from '@/types/askCarebow';

export type ConversationContextType = 'me' | 'family';

export type ConversationSelfMember = {
  id: string;
  backendId?: string;
  dateOfBirth?: string;
};

/**
 * Choose the profile identifier that is safe to attach to an Ask CareBow
 * conversation.
 *
 * Family-mode intake currently collects relationship + age, not a specific
 * saved family profile. Reusing the account holder's default profile in that
 * case is unsafe: the backend would load the wrong patient's conditions,
 * medications, allergies and age. Return an empty id instead so family turns
 * stay on the deterministic local safety path until a real patient profile is
 * explicitly selected/resolved.
 *
 * For self-mode, prefer the real backend id. If onboarding only created the
 * local member, return that local id so ensureBackendProfile() can repair the
 * sync before the orchestrator is called.
 */
export function resolveConversationMemberId(
  context: ConversationContextType,
  selfMember?: ConversationSelfMember | null
): string {
  if (context === 'family') return '';
  return selfMember?.backendId ?? selfMember?.id ?? '';
}

export function ageToAgeGroup(age: number): AgeGroup | undefined {
  if (!Number.isFinite(age) || age < 0 || age > 120) return undefined;
  if (age <= 1) return 'infant';
  if (age <= 12) return 'child';
  if (age <= 17) return 'teen';
  if (age <= 64) return 'adult';
  return 'senior';
}

export function ageFromDateOfBirth(dateOfBirth?: string, now = new Date()): number | undefined {
  if (!dateOfBirth) return undefined;
  const birth = new Date(dateOfBirth);
  if (Number.isNaN(birth.getTime()) || birth > now) return undefined;

  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const birthdayHasOccurred =
    now.getUTCMonth() > birth.getUTCMonth() ||
    (now.getUTCMonth() === birth.getUTCMonth() && now.getUTCDate() >= birth.getUTCDate());
  if (!birthdayHasOccurred) age -= 1;

  return age >= 0 && age <= 120 ? age : undefined;
}

/**
 * Seed the on-device safety engine with the patient's age band before the
 * first symptom is processed. Family-mode uses the age the user just entered;
 * self-mode derives it from the saved profile DOB.
 */
export function resolveConversationAgeGroup(
  context: ConversationContextType,
  familyAge?: string,
  selfDateOfBirth?: string,
  now = new Date()
): AgeGroup | undefined {
  if (context === 'family') {
    if (!familyAge?.trim()) return undefined;
    const age = Number(familyAge);
    return ageToAgeGroup(age);
  }

  const age = ageFromDateOfBirth(selfDateOfBirth, now);
  return age === undefined ? undefined : ageToAgeGroup(age);
}
