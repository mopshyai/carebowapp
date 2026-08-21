import type { FamilyMember } from '../../types/profile';
import { ageFromDateOfBirth } from './patientContext';

export type SavedFamilyConversationSelection = {
  memberId: string;
  memberName: string;
  relation: string;
  age: string;
};

/**
 * Only non-self saved profiles belong in the "For family" picker. The user must
 * explicitly choose one; callers should not auto-select or infer identity from
 * age/relationship because that can attach the wrong clinical record.
 */
export function getSavedFamilyMembers(members: FamilyMember[]): FamilyMember[] {
  return members.filter((member) => member.relationship !== 'self');
}

/**
 * Convert one explicit saved patient choice into the navigation context used by
 * ConversationScreen. DOB remains the source of age; an impossible/missing DOB
 * fails closed so the UI can require repair instead of guessing an age.
 */
export function selectionForSavedFamilyMember(
  member: FamilyMember,
  now = new Date()
): SavedFamilyConversationSelection | null {
  if (member.relationship === 'self') return null;

  const age = ageFromDateOfBirth(member.dateOfBirth, now);
  if (age === undefined) return null;

  const memberName = [member.firstName, member.lastName].filter(Boolean).join(' ').trim();
  if (!memberName) return null;

  return {
    memberId: member.id,
    memberName,
    relation: member.relationship,
    age: String(age),
  };
}
