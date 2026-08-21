import type { AgeGroup } from '@/types/askCarebow';

export type ConversationContextType = 'me' | 'family';

export type ConversationPatientMember = {
  id: string;
  backendId?: string;
  dateOfBirth?: string;
  relationship?: string;
};

/**
 * Choose the profile identifier that is safe to attach to an Ask CareBow
 * conversation.
 *
 * "Default member" is not identity. A user can make Mom the app default, so a
 * self conversation may bind only to a profile explicitly marked relationship
 * `self`. Likewise family mode may bind only to the specific saved non-self
 * profile the user selected on Ask CareBow. Ad-hoc family intake has no profile
 * id and stays on the deterministic local safety path.
 *
 * Prefer a real backend id. A local id is still acceptable because
 * ensureBackendProfile() validates/repairs that exact saved profile before the
 * orchestrator uses it.
 */
export function resolveConversationMemberId(
  context: ConversationContextType,
  selfMember?: ConversationPatientMember | null,
  selectedFamilyMember?: ConversationPatientMember | null
): string {
  if (context === 'me') {
    if (!selfMember || selfMember.relationship !== 'self') return '';
    return selfMember.backendId ?? selfMember.id ?? '';
  }

  if (!selectedFamilyMember || selectedFamilyMember.relationship === 'self') return '';
  return selectedFamilyMember.backendId ?? selectedFamilyMember.id ?? '';
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
 * first symptom is processed. Family-mode uses the age captured by AskScreen
 * (for a saved profile that value is derived from its exact DOB); self-mode
 * derives it from the saved self profile DOB.
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
