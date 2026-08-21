import type { FamilyMember } from '../types/profile';

/**
 * Vitals are clinical data, so the active patient must be explicit.
 *
 * Never fall back to "the first profile returned by the server": profile order
 * is not patient identity. A locally cached member without a backendId is not
 * safe to write vitals for until that member has been reconciled with the
 * server-backed profile repository.
 */
export function backendProfileIdForVitals(
  member: Pick<FamilyMember, 'backendId'> | null | undefined
): string | null {
  const id = member?.backendId?.trim();
  return id ? id : null;
}
