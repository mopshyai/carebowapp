/**
 * Selected Person Context Hook
 * Manages the global currently selected care recipient across the entire app.
 * Ensures consistent person scoping for:
 * - Today Screen
 * - Care Screen (Tasks, Timeline, Episode, Services, Appointments, Medications)
 * - Ask CareBow (Person & Episode awareness)
 * - Family Screen
 */

import { useEffect, useMemo, useCallback } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import { useCareStore } from '../store/useCareStore';
import type { FamilyMember } from '../types/profile';
import type { CareEpisode } from '../types/care';

export interface SelectedPersonContext {
  selectedPerson: FamilyMember | null;
  selectedPersonId: string | null;
  displayName: string;
  relationshipLabel: string;
  allPersons: FamilyMember[];
  selectPerson: (id: string) => void;
  activeEpisode: CareEpisode | undefined;
}

export function useSelectedPersonContext(): SelectedPersonContext {
  const members = useProfileStore((state) => state.members);
  const selectedMemberId = useProfileStore((state) => state.selectedMemberId);
  const selectMember = useProfileStore((state) => state.selectMember);
  const user = useProfileStore((state) => state.user);

  const getActiveEpisodeForPerson = useCareStore((state) => state.getActiveEpisodeForPerson);
  const fetchCareForPerson = useCareStore((state) => state.fetchCareForPerson);

  // Fallback: If no members exist yet, create a default self/recipient
  useEffect(() => {
    if (members.length === 0 && user) {
      const defaultMember = useProfileStore.getState().addMember({
        firstName: user.firstName || 'Myself',
        lastName: user.lastName || '',
        relationship: 'self',
        isDefault: true,
        healthInfo: {
          allergies: [],
          conditions: [],
          medications: [],
          mobilityStatus: 'fully_mobile',
        },
        carePreferences: {
          preferredLanguage: 'English',
          preferredCareType: ['home_care'],
        },
      });
      selectMember(defaultMember.id);
    }
  }, [members.length, user, selectMember]);

  // Determine current active person
  const selectedPerson = useMemo(() => {
    if (!members.length) return null;
    if (selectedMemberId) {
      const found = members.find((m) => m.id === selectedMemberId);
      if (found) return found;
    }
    // Default to default member or first member
    const defaultM = members.find((m) => m.isDefault);
    return defaultM || members[0];
  }, [members, selectedMemberId]);

  const selectedPersonId = selectedPerson?.id || null;

  // Server synchronization: Load authoritative care state from server
  useEffect(() => {
    if (selectedPersonId) {
      fetchCareForPerson(selectedPersonId);
    }
  }, [selectedPersonId, fetchCareForPerson]);

  const selectPerson = useCallback(
    (id: string) => {
      selectMember(id);
    },
    [selectMember]
  );

  const displayName = useMemo(() => {
    if (!selectedPerson) return 'Care Recipient';
    if (selectedPerson.relationship === 'self') return 'Myself';
    if (selectedPerson.relationship === 'parent') {
      return selectedPerson.firstName.toLowerCase().includes('mom') ||
        selectedPerson.gender === 'female'
        ? 'Mom'
        : 'Dad';
    }
    return selectedPerson.firstName;
  }, [selectedPerson]);

  const relationshipLabel = useMemo(() => {
    if (!selectedPerson) return '';
    if (selectedPerson.relationship === 'self') return 'You';
    return (
      selectedPerson.relationship.charAt(0).toUpperCase() + selectedPerson.relationship.slice(1)
    );
  }, [selectedPerson]);

  const activeEpisode = useMemo(() => {
    if (!selectedPersonId) return undefined;
    return getActiveEpisodeForPerson(selectedPersonId);
  }, [selectedPersonId, getActiveEpisodeForPerson]);

  return {
    selectedPerson,
    selectedPersonId,
    displayName,
    relationshipLabel,
    allPersons: members,
    selectPerson,
    activeEpisode,
  };
}
