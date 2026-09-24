import {
  localGenderFromBackend,
  localRelationshipFromBackend,
  memberInputFromBackend,
  selfMemberSnapshotFromUser,
  hydrateOwnedProfilesFromServer,
} from './profileRepository';
import {
  createEmptyCarePreferences,
  createEmptyMemberHealthInfo,
  type FamilyMember,
} from '../types/profile';
import type { V1Profile } from '../services/api/endpoints/profiles';
import { profilesApi } from '../services/api/endpoints/profiles';
import { useProfileStore } from '../store/useProfileStore';

jest.mock('../services/api/endpoints/profiles', () => ({
  profilesApi: {
    getProfiles: jest.fn(),
    createProfile: jest.fn(),
    updateProfile: jest.fn(),
    deleteProfile: jest.fn(),
  },
}));

function serverProfile(overrides: Partial<V1Profile> = {}): V1Profile {
  return {
    id: 'profile-1',
    userId: 'user-1',
    name: 'Maya Kumar',
    dateOfBirth: '1958-04-12T00:00:00.000Z',
    gender: 'FEMALE',
    relationship: 'Mother',
    bloodGroup: 'O+',
    allergies: 'Penicillin, Peanuts',
    conditions: 'Diabetes',
    medications: 'Metformin · 500 mg · twice daily, Vitamin D',
    ...overrides,
  };
}

function existingMember(): FamilyMember {
  return {
    id: 'local-1',
    backendId: 'profile-1',
    firstName: 'Old',
    lastName: 'Name',
    relationship: 'parent',
    dateOfBirth: '1958-04-12T00:00:00.000Z',
    gender: 'female',
    isDefault: true,
    healthInfo: {
      ...createEmptyMemberHealthInfo(),
      mobilityStatus: 'needs_assistance',
      height: 160,
    },
    carePreferences: createEmptyCarePreferences(),
    profileCompleteness: 60,
    createdAt: '2026-08-20T00:00:00.000Z',
    updatedAt: '2026-08-20T00:00:00.000Z',
  };
}

describe('profileRepository backend mapping', () => {
  it('maps backend identity fields without changing their meaning', () => {
    expect(localGenderFromBackend('FEMALE')).toBe('female');
    expect(localGenderFromBackend('MALE')).toBe('male');
    expect(localGenderFromBackend('OTHER')).toBe('other');
    expect(localRelationshipFromBackend('Mother')).toBe('parent');
    expect(localRelationshipFromBackend('grand-father')).toBe('grandparent');
    expect(localRelationshipFromBackend('Brother')).toBe('sibling');
    expect(localRelationshipFromBackend('Uncle')).toBe('other');
  });

  it('hydrates server clinical names without inventing severity or condition status', () => {
    const input = memberInputFromBackend(serverProfile());

    expect(input.firstName).toBe('Maya');
    expect(input.lastName).toBe('Kumar');
    expect(input.relationship).toBe('parent');
    expect(input.healthInfo.bloodType).toBe('O+');
    expect(input.healthInfo.allergies.map((item) => [item.name, item.severity])).toEqual([
      ['Penicillin', 'unknown'],
      ['Peanuts', 'unknown'],
    ]);
    expect(input.healthInfo.conditions.map((item) => [item.name, item.status])).toEqual([
      ['Diabetes', 'unknown'],
    ]);
    expect(input.healthInfo.medications[0]).toEqual(
      expect.objectContaining({
        name: 'Metformin',
        dosage: '500 mg',
        frequency: 'twice daily',
      })
    );
    expect(input.healthInfo.medications[1]).toEqual(
      expect.objectContaining({ name: 'Vitamin D', dosage: '', frequency: '' })
    );
  });

  it('preserves device-only fields for an existing cache row', () => {
    const input = memberInputFromBackend(serverProfile(), existingMember());

    expect(input.isDefault).toBe(true);
    expect(input.healthInfo.mobilityStatus).toBe('needs_assistance');
    expect(input.healthInfo.height).toBe(160);
  });

  it('does not fabricate a name when a corrupt server row has an empty name', () => {
    const input = memberInputFromBackend(serverProfile({ name: '   ' }));
    expect(input.firstName).toBe('');
    expect(input.lastName).toBe('');
  });

  it('bridges saved Personal Information into a self patient profile', () => {
    const snapshot = selfMemberSnapshotFromUser({
      id: 'user-1',
      firstName: 'Asha',
      lastName: 'Patel',
      email: 'asha@example.com',
      phone: '+1 555 0100',
      dateOfBirth: '1984-06-15',
      gender: 'female',
      createdAt: '2026-08-20T00:00:00.000Z',
      updatedAt: '2026-08-21T00:00:00.000Z',
    });

    expect(snapshot).toEqual(
      expect.objectContaining({
        firstName: 'Asha',
        lastName: 'Patel',
        relationship: 'self',
        dateOfBirth: '1984-06-15',
        gender: 'female',
      })
    );
  });

  it('preserves self health context while refreshing personal demographics', () => {
    const existing = { ...existingMember(), relationship: 'self' as const };
    const snapshot = selfMemberSnapshotFromUser(
      {
        id: 'user-1',
        firstName: 'Maya',
        lastName: 'Kumar',
        email: 'maya@example.com',
        phone: '',
        dateOfBirth: '1960-01-02',
        gender: 'female',
        createdAt: '2026-08-20T00:00:00.000Z',
        updatedAt: '2026-08-21T00:00:00.000Z',
      },
      existing
    );

    expect(snapshot.id).toBe(existing.id);
    expect(snapshot.backendId).toBe(existing.backendId);
    expect(snapshot.healthInfo.height).toBe(160);
    expect(snapshot.dateOfBirth).toBe('1960-01-02');
  });
});

describe('hydrateOwnedProfilesFromServer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useProfileStore.getState().logout();
  });

  it('hydrates server profiles for the matching user into profile store', async () => {
    (profilesApi.getProfiles as jest.Mock).mockResolvedValueOnce([
      serverProfile({ id: 'profile-user1', userId: 'user-1', name: 'Maya Kumar' }),
      serverProfile({ id: 'profile-other', userId: 'user-other', name: 'Other Person' }),
    ]);

    const applied = await hydrateOwnedProfilesFromServer('user-1');

    expect(applied).toBe(true);
    const members = useProfileStore.getState().members;
    expect(members).toHaveLength(1);
    expect(members[0].backendId).toBe('profile-user1');
    expect(members[0].firstName).toBe('Maya');
  });

  it('aborts hydration and does not alter store if shouldApply returns false', async () => {
    (profilesApi.getProfiles as jest.Mock).mockResolvedValueOnce([
      serverProfile({ id: 'profile-user1', userId: 'user-1', name: 'Maya Kumar' }),
    ]);

    const applied = await hydrateOwnedProfilesFromServer('user-1', {
      shouldApply: () => false,
    });

    expect(applied).toBe(false);
    expect(useProfileStore.getState().members).toHaveLength(0);
  });

  it('guards against stale Account A profile hydration race when Account B logs in before response', async () => {
    let currentUser = 'user-A';
    let resolveProfiles: (profiles: V1Profile[]) => void = () => {};
    const deferredPromise = new Promise<V1Profile[]>((resolve) => {
      resolveProfiles = resolve;
    });

    (profilesApi.getProfiles as jest.Mock).mockReturnValueOnce(deferredPromise);

    // 1. Account A initiates hydration
    const hydrationPromiseA = hydrateOwnedProfilesFromServer('user-A', {
      shouldApply: () => currentUser === 'user-A',
    });

    // 2. Account A logs out before network returns; store is cleared
    useProfileStore.getState().logout();
    expect(useProfileStore.getState().members).toHaveLength(0);

    // 3. Account B logs in
    currentUser = 'user-B';

    // 4. Account A's network call finally resolves
    resolveProfiles([
      serverProfile({ id: 'profile-A', userId: 'user-A', name: 'Account A Member' }),
    ]);

    const appliedA = await hydrationPromiseA;

    // 5. Account A's hydration must be discarded
    expect(appliedA).toBe(false);
    expect(useProfileStore.getState().members).toHaveLength(0);

    // 6. Account B now hydrates their own profile
    (profilesApi.getProfiles as jest.Mock).mockResolvedValueOnce([
      serverProfile({ id: 'profile-B', userId: 'user-B', name: 'Account B Member' }),
    ]);

    const appliedB = await hydrateOwnedProfilesFromServer('user-B', {
      shouldApply: () => currentUser === 'user-B',
    });

    expect(appliedB).toBe(true);
    const finalMembers = useProfileStore.getState().members;
    expect(finalMembers).toHaveLength(1);
    expect(finalMembers[0].backendId).toBe('profile-B');
    expect(finalMembers[0].firstName).toBe('Account');
  });
});
