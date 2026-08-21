/**
 * Profile Sync
 *
 * The mobile profile store still contains UI/offline state, but anything used
 * by a clinical or booking backend path must resolve to a real server Profile.
 * This module is the boundary: it validates identity-critical demographics,
 * creates the server row when necessary, and refreshes an existing server row
 * from the latest local health context before that row is used.
 */

import { useProfileStore } from '../store/useProfileStore';
import { profilesApi } from '../services/api/endpoints/profiles';
import { FamilyMember, Gender, Relationship, RELATIONSHIP_LABELS } from '../types/profile';

export type BackendGender = 'MALE' | 'FEMALE' | 'OTHER';

export function mapGender(g?: Gender | string): BackendGender {
  if (g === 'male') return 'MALE';
  if (g === 'female') return 'FEMALE';
  if (g === 'other') return 'OTHER';

  // "Prefer not to say" is not the same thing as OTHER. The current backend
  // schema has no UNKNOWN/UNSPECIFIED value, so silently coercing it would write
  // false clinical data. Fail closed until the schema can represent it honestly.
  throw new Error('Please add the patient gender before continuing.');
}

export function relationshipForBackend(relationship: Relationship): string {
  return RELATIONSHIP_LABELS[relationship];
}

/**
 * Validate and normalize a DOB without guessing one. The old sync path wrote
 * 1990-01-01 whenever DOB was absent, which could turn a child or senior into a
 * 36-year-old adult in backend clinical context.
 */
export function normalizeDateOfBirth(value?: string): string {
  if (!value) {
    throw new Error('Please add the patient date of birth before continuing.');
  }

  const datePart = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    throw new Error('Date of birth must use YYYY-MM-DD.');
  }

  const [year, month, day] = datePart.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new Error('Please enter a valid date of birth.');
  }

  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  if (parsed.getTime() > todayUtc) {
    throw new Error('Date of birth cannot be in the future.');
  }

  const oldestAllowed = new Date(
    Date.UTC(now.getUTCFullYear() - 125, now.getUTCMonth(), now.getUTCDate())
  );
  if (parsed.getTime() < oldestAllowed.getTime()) {
    throw new Error('Please enter a valid date of birth.');
  }

  return parsed.toISOString();
}

function joinNames(items: Array<{ name: string }>): string {
  return items
    .map((item) => item.name.trim())
    .filter(Boolean)
    .join(', ');
}

function joinMedications(member: FamilyMember): string {
  return member.healthInfo.medications
    .map((medication) =>
      [medication.name.trim(), medication.dosage.trim(), medication.frequency.trim()]
        .filter(Boolean)
        .join(' · ')
    )
    .filter(Boolean)
    .join(', ');
}

/**
 * The exact patient fields that may be sent to the backend.
 *
 * Clinical text fields are deliberately sent even when empty. Omitting an empty
 * field on PUT means Prisma leaves the previous value untouched, so removing
 * "Penicillin" locally could leave "Penicillin" on the server forever. Empty
 * strings are the current API's explicit clear value until those columns/API
 * accept null.
 */
export function buildBackendProfilePayload(member: FamilyMember) {
  const name = `${member.firstName} ${member.lastName}`.trim();
  if (!name) throw new Error('Please add the patient name before continuing.');

  const bloodType = member.healthInfo.bloodType;

  return {
    name,
    dateOfBirth: normalizeDateOfBirth(member.dateOfBirth),
    gender: mapGender(member.gender),
    relationship: relationshipForBackend(member.relationship),
    bloodGroup: bloodType && bloodType !== 'unknown' ? bloodType : '',
    allergies: joinNames(member.healthInfo.allergies),
    conditions: joinNames(member.healthInfo.conditions),
    medications: joinMedications(member),
  };
}

/**
 * Resolve a local member id to a backend Profile id.
 *
 * If the member already has a backend id we still push the latest local
 * demographics/health context before using it. That prevents Ask CareBow or a
 * booking from operating on a stale server profile after the user edited or
 * removed an allergy, condition, medication, DOB, or name on-device.
 *
 * If the id does not match a local member, it is already a backend Profile id
 * (for example one returned directly by GET /v1/profiles), so it is returned as
 * is.
 */
export async function ensureBackendProfile(memberId: string): Promise<string> {
  const member = useProfileStore.getState().getMemberById(memberId);
  if (!member) return memberId;

  const payload = buildBackendProfilePayload(member);

  if (member.backendId) {
    const response = await profilesApi.updateProfile(member.backendId, payload);
    if (!response.success || !response.profile) {
      throw new Error(response.error || 'Unable to sync the patient profile.');
    }
    return member.backendId;
  }

  const profile = await profilesApi.createProfile(payload);
  useProfileStore.getState().updateMember(memberId, { backendId: profile.id });
  return profile.id;
}
