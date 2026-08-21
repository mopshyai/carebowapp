import { createEmptyCarePreferences, createEmptyMemberHealthInfo, type FamilyMember } from '../../types/profile';
import { getSavedFamilyMembers, selectionForSavedFamilyMember } from './familyProfileSelection';

function member(overrides: Partial<FamilyMember> = {}): FamilyMember {
  return {
    id: 'local-mom',
    backendId: 'backend-mom',
    firstName: 'Maya',
    lastName: 'Kumar',
    relationship: 'parent',
    dateOfBirth: '1958-04-12T00:00:00.000Z',
    gender: 'female',
    isDefault: false,
    healthInfo: createEmptyMemberHealthInfo(),
    carePreferences: createEmptyCarePreferences(),
    profileCompleteness: 50,
    createdAt: '2026-08-20T00:00:00.000Z',
    updatedAt: '2026-08-20T00:00:00.000Z',
    ...overrides,
  };
}

describe('Ask CareBow saved family profile selection', () => {
  it('never offers the self profile as a family patient', () => {
    const self = member({ id: 'self', relationship: 'self' });
    const mom = member();
    expect(getSavedFamilyMembers([self, mom])).toEqual([mom]);
  });

  it('uses the exact selected saved member id and DOB-derived age', () => {
    expect(
      selectionForSavedFamilyMember(member(), new Date('2026-08-20T12:00:00.000Z'))
    ).toEqual({
      memberId: 'local-mom',
      memberName: 'Maya Kumar',
      relation: 'parent',
      age: '68',
    });
  });

  it('fails closed when a saved patient has no usable DOB', () => {
    expect(selectionForSavedFamilyMember(member({ dateOfBirth: undefined }))).toBeNull();
  });

  it('refuses a self profile even if it is passed directly', () => {
    expect(selectionForSavedFamilyMember(member({ relationship: 'self' }))).toBeNull();
  });
});
