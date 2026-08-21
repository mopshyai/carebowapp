import {
  buildBackendProfilePayload,
  mapGender,
  normalizeDateOfBirth,
  relationshipForBackend,
} from './profileSync';
import type { FamilyMember } from '../types/profile';
import { createEmptyCarePreferences, createEmptyMemberHealthInfo } from '../types/profile';

function member(overrides: Partial<FamilyMember> = {}): FamilyMember {
  return {
    id: 'local-mom',
    firstName: 'Maya',
    lastName: 'Kumar',
    relationship: 'parent',
    dateOfBirth: '1958-04-12',
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

describe('profileSync patient identity integrity', () => {
  it('never invents a date of birth when one is missing', () => {
    expect(() => normalizeDateOfBirth(undefined)).toThrow('date of birth');
    expect(() => buildBackendProfilePayload(member({ dateOfBirth: undefined }))).toThrow(
      'date of birth'
    );
  });

  it('rejects invalid and future dates instead of normalizing them into another date', () => {
    expect(() => normalizeDateOfBirth('2026-02-31')).toThrow('valid date of birth');
    expect(() => normalizeDateOfBirth('2999-01-01')).toThrow('future');
  });

  it('does not coerce prefer-not-to-say into the backend OTHER gender', () => {
    expect(() => mapGender('prefer_not_to_say')).toThrow('patient gender');
    expect(() => buildBackendProfilePayload(member({ gender: 'prefer_not_to_say' }))).toThrow(
      'patient gender'
    );
  });

  it('maps known demographics without changing their meaning', () => {
    expect(mapGender('female')).toBe('FEMALE');
    expect(mapGender('male')).toBe('MALE');
    expect(mapGender('other')).toBe('OTHER');
    expect(relationshipForBackend('parent')).toBe('Parent');
    expect(normalizeDateOfBirth('1958-04-12')).toBe('1958-04-12T00:00:00.000Z');
  });

  it('sends the latest local safety context with the backend profile', () => {
    const healthInfo = createEmptyMemberHealthInfo();
    healthInfo.bloodType = 'O+';
    healthInfo.allergies = [{ id: 'a1', name: 'Penicillin', severity: 'severe' }];
    healthInfo.conditions = [{ id: 'c1', name: 'Diabetes', status: 'managed' }];
    healthInfo.medications = [
      {
        id: 'm1',
        name: 'Metformin',
        dosage: '500 mg',
        frequency: 'twice daily',
      },
    ];

    expect(buildBackendProfilePayload(member({ healthInfo }))).toEqual({
      name: 'Maya Kumar',
      dateOfBirth: '1958-04-12T00:00:00.000Z',
      gender: 'FEMALE',
      relationship: 'Parent',
      bloodGroup: 'O+',
      allergies: 'Penicillin',
      conditions: 'Diabetes',
      medications: 'Metformin · 500 mg · twice daily',
    });
  });

  it('sends explicit empty values so removed clinical facts are cleared server-side', () => {
    expect(buildBackendProfilePayload(member())).toEqual({
      name: 'Maya Kumar',
      dateOfBirth: '1958-04-12T00:00:00.000Z',
      gender: 'FEMALE',
      relationship: 'Parent',
      bloodGroup: '',
      allergies: '',
      conditions: '',
      medications: '',
    });
  });
});
