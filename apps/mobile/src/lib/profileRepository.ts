import {
  createEmptyCarePreferences,
  createEmptyMemberHealthInfo,
  generateId,
  type BloodType,
  type FamilyMember,
  type Gender,
  type Relationship,
} from '../types/profile';
import { useProfileStore } from '../store/useProfileStore';
import { profilesApi, type V1Profile } from '../services/api/endpoints/profiles';
import { buildBackendProfilePayload } from './profileSync';

type MemberInput = Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt' | 'profileCompleteness'>;

const BLOOD_TYPES = new Set<BloodType>([
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
  'unknown',
]);

export function localGenderFromBackend(value: V1Profile['gender']): Gender {
  if (value === 'MALE') return 'male';
  if (value === 'FEMALE') return 'female';
  return 'other';
}

export function localRelationshipFromBackend(value: string): Relationship {
  const normalized = value.trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
  const compact = normalized.replace(/\s+/g, '');

  if (normalized === 'self' || normalized === 'myself') return 'self';
  if (
    normalized === 'spouse' ||
    normalized === 'partner' ||
    normalized === 'wife' ||
    normalized === 'husband'
  ) {
    return 'spouse';
  }
  if (['parent', 'mother', 'father', 'mom', 'dad'].includes(normalized)) return 'parent';
  if (['child', 'son', 'daughter'].includes(normalized)) return 'child';
  if (['sibling', 'brother', 'sister'].includes(normalized)) return 'sibling';
  if (['grandparent', 'grandmother', 'grandfather'].includes(compact)) return 'grandparent';
  if (['grandchild', 'grandson', 'granddaughter'].includes(compact)) return 'grandchild';
  if (compact.includes('inlaw')) return 'in_law';
  return 'other';
}

function splitName(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' '),
  };
}

function splitCommaList(value?: string | null): string[] {
  return (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseBloodType(value?: string | null): BloodType | undefined {
  if (!value) return undefined;
  return BLOOD_TYPES.has(value as BloodType) ? (value as BloodType) : undefined;
}

function parseMedications(value?: string | null) {
  return splitCommaList(value).map((entry) => {
    const [name = '', dosage = '', frequency = ''] = entry.split('·').map((part) => part.trim());
    return {
      id: generateId(),
      name,
      dosage,
      frequency,
    };
  });
}

/**
 * Convert the server Profile into the mobile cache shape.
 *
 * Server-backed clinical fields replace the cache. The backend currently stores
 * allergy/condition names but not their severity/status, so imported entries
 * are explicitly `unknown` rather than fabricated as moderate/active.
 *
 * Fields the current backend cannot represent (height/weight/mobility/notes/care
 * preferences) are preserved only on an existing device and are never presented
 * as cloud-synced data.
 */
export function memberInputFromBackend(
  profile: V1Profile,
  existing?: FamilyMember
): MemberInput {
  const { firstName, lastName } = splitName(profile.name);
  const emptyHealth = createEmptyMemberHealthInfo();

  return {
    backendId: profile.id,
    firstName,
    lastName,
    relationship: localRelationshipFromBackend(profile.relationship),
    dateOfBirth: profile.dateOfBirth,
    gender: localGenderFromBackend(profile.gender),
    isDefault: existing?.isDefault ?? false,
    healthInfo: {
      ...emptyHealth,
      mobilityStatus: existing?.healthInfo.mobilityStatus ?? emptyHealth.mobilityStatus,
      height: existing?.healthInfo.height,
      weight: existing?.healthInfo.weight,
      notes: existing?.healthInfo.notes,
      bloodType: parseBloodType(profile.bloodGroup),
      allergies: splitCommaList(profile.allergies).map((name) => ({
        id: generateId(),
        name,
        severity: 'unknown' as const,
      })),
      conditions: splitCommaList(profile.conditions).map((name) => ({
        id: generateId(),
        name,
        status: 'unknown' as const,
      })),
      medications: parseMedications(profile.medications),
    },
    carePreferences: existing?.carePreferences ?? createEmptyCarePreferences(),
  };
}

/**
 * Persist one complete mobile member snapshot before changing the local cache.
 * The caller updates Zustand only after this resolves, making the server the
 * source of truth instead of treating AsyncStorage as a successful save.
 */
export async function persistMemberSnapshot(member: FamilyMember): Promise<string> {
  const payload = buildBackendProfilePayload(member);

  if (member.backendId) {
    const response = await profilesApi.updateProfile(member.backendId, payload);
    if (!response.success || !response.profile) {
      throw new Error(response.error || 'CareBow could not save this patient profile.');
    }
    return member.backendId;
  }

  const profile = await profilesApi.createProfile(payload);
  return profile.id;
}

/**
 * Reconcile the Family Members cache from the authenticated user's owned server
 * Profiles. This is intentionally not a blind replacement: device-only fields
 * that have no backend representation are preserved on an existing member.
 *
 * A successful server read is authoritative for which cloud-backed members
 * still exist. Local legacy members with no backendId are preserved so the user
 * can repair/sync them instead of losing data during an upgrade.
 */
export async function hydrateOwnedProfilesFromServer(userId: string): Promise<void> {
  const profiles = await profilesApi.getProfiles();
  const ownedProfiles = profiles.filter((profile) => profile.userId === userId);
  const serverIds = new Set(ownedProfiles.map((profile) => profile.id));

  for (const profile of ownedProfiles) {
    const state = useProfileStore.getState();
    const existing = state.members.find(
      (member) => member.backendId === profile.id || member.id === profile.id
    );
    const input = memberInputFromBackend(profile, existing);

    if (existing) {
      state.updateMember(existing.id, input);
    } else {
      const hasDefault = state.members.some((member) => member.isDefault);
      state.addMember({ ...input, isDefault: !hasDefault });
    }
  }

  // If a cloud-backed member was deleted on another device, remove the stale
  // cache entry after (and only after) a successful server list response.
  const afterHydration = useProfileStore.getState();
  for (const member of afterHydration.members) {
    if (member.backendId && !serverIds.has(member.backendId)) {
      afterHydration.deleteMember(member.id);
    }
  }
}
