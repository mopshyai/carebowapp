import {
  ageFromDateOfBirth,
  ageToAgeGroup,
  resolveConversationAgeGroup,
  resolveConversationMemberId,
} from './patientContext';

describe('Ask CareBow patient context', () => {
  it('never binds an ad-hoc family conversation to the account holder profile', () => {
    expect(
      resolveConversationMemberId('family', {
        id: 'local-self',
        backendId: 'backend-self',
        dateOfBirth: '1990-01-01T00:00:00.000Z',
      })
    ).toBe('');
  });

  it('uses the backend self profile when it exists', () => {
    expect(
      resolveConversationMemberId('me', {
        id: 'local-self',
        backendId: 'backend-self',
      })
    ).toBe('backend-self');
  });

  it('uses the local self id when backend sync still needs repair', () => {
    expect(resolveConversationMemberId('me', { id: 'local-self' })).toBe('local-self');
  });

  it.each([
    [0, 'infant'],
    [1, 'infant'],
    [2, 'child'],
    [12, 'child'],
    [13, 'teen'],
    [17, 'teen'],
    [18, 'adult'],
    [64, 'adult'],
    [65, 'senior'],
    [120, 'senior'],
  ] as const)('maps age %s to %s', (age, expected) => {
    expect(ageToAgeGroup(age)).toBe(expected);
  });

  it('rejects impossible age values instead of guessing', () => {
    expect(ageToAgeGroup(-1)).toBeUndefined();
    expect(ageToAgeGroup(121)).toBeUndefined();
    expect(ageToAgeGroup(Number.NaN)).toBeUndefined();
  });

  it('uses the entered family age for safety context', () => {
    expect(resolveConversationAgeGroup('family', '6')).toBe('child');
    expect(resolveConversationAgeGroup('family', '70')).toBe('senior');
  });

  it('derives self age from date of birth without off-by-one around birthdays', () => {
    const now = new Date('2026-08-20T12:00:00.000Z');
    expect(ageFromDateOfBirth('2008-08-20T00:00:00.000Z', now)).toBe(18);
    expect(ageFromDateOfBirth('2008-08-21T00:00:00.000Z', now)).toBe(17);
    expect(resolveConversationAgeGroup('me', undefined, '2008-08-21T00:00:00.000Z', now)).toBe(
      'teen'
    );
  });
});
