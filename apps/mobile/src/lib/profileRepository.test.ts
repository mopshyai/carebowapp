import {
  localGenderFromBackend,
  localRelationshipFromBackend,
  memberInputFromBackend,
} from './profileRepository';
import {
  createEmptyCarePreferences,
  createEmptyMemberHealthInfo,
  type FamilyMember,
} from '../types/profile';
import type { V1Profile } from '../services/api/endpoints/profiles';

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
});
