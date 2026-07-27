/**
 * Profile Sync
 * Resolves locally-created family members (useProfileStore) to backend
 * profile ids, creating the backend profile on-demand the first time a
 * local member is used somewhere that requires a real backend id (e.g.
 * booking a service).
 */

import { useProfileStore } from '../store/useProfileStore';
import { profilesApi } from '../services/api/endpoints/profiles';

export function mapGender(g?: string): 'MALE' | 'FEMALE' | 'OTHER' {
  if (g === 'male') return 'MALE';
  if (g === 'female') return 'FEMALE';
  return 'OTHER';
}

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Resolves a local member id to a backend profile id. If the id passed in
 * doesn't match a local member (i.e. it's already a backend id, such as one
 * loaded from GET /v1/profiles), it's returned unchanged.
 */
export async function ensureBackendProfile(memberId: string): Promise<string> {
  const member = useProfileStore.getState().getMemberById(memberId);
  if (!member) {
    // Not a local member id — assume it's already a backend profile id.
    return memberId;
  }

  if (member.backendId) {
    return member.backendId;
  }

  const name = `${member.firstName} ${member.lastName}`.trim();
  const dateOfBirth = member.dateOfBirth || '1990-01-01T00:00:00.000Z';
  const gender = mapGender(member.gender);
  const relationship = capitalize(member.relationship);

  const profile = await profilesApi.createProfile({
    name,
    dateOfBirth,
    gender,
    relationship,
  });

  useProfileStore.getState().updateMember(memberId, { backendId: profile.id });

  return profile.id;
}
