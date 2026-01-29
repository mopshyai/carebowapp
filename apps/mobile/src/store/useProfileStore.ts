/**
 * Profile Store
 * Comprehensive state management for user profile, family members, addresses, and health data
 * Uses Zustand with AsyncStorage persistence
 */

import React from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UserProfile,
  FamilyMember,
  EmergencyContact,
  CareAddress,
  InsuranceInfo,
  HealthRecord,
  NotificationPreferences,
  PrivacySettings,
  AppSettings,
  CareReadinessScore,
  CareReadinessItem,
  MemberHealthInfo,
  CarePreferences,
  Allergy,
  Condition,
  Medication,
  generateId,
  createEmptyMemberHealthInfo,
  createEmptyCarePreferences,
  createDefaultNotificationPreferences,
  createDefaultPrivacySettings,
  createDefaultAppSettings,
} from '@/types/profile';

// ============================================
// STORE TYPES
// ============================================

type ProfileState = {
  // User profile
  user: UserProfile | null;
  isAuthenticated: boolean;

  // Family members
  members: FamilyMember[];
  selectedMemberId: string | null;

  // Emergency contacts
  emergencyContacts: EmergencyContact[];

  // Care addresses
  addresses: CareAddress[];

  // Insurance
  insuranceInfo: InsuranceInfo[];

  // Health records
  healthRecords: HealthRecord[];

  // Preferences
  notificationPreferences: NotificationPreferences;
  privacySettings: PrivacySettings;
  appSettings: AppSettings;

  // UI state
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
};

type ProfileActions = {
  // User profile
  setUser: (user: UserProfile) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  logout: () => void;

  // Family members
  addMember: (member: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt' | 'profileCompleteness'>) => FamilyMember;
  updateMember: (id: string, updates: Partial<FamilyMember>) => void;
  deleteMember: (id: string) => void;
  setDefaultMember: (id: string) => void;
  selectMember: (id: string | null) => void;
  getMemberById: (id: string) => FamilyMember | undefined;

  // Member health info
  updateMemberHealthInfo: (memberId: string, updates: Partial<MemberHealthInfo>) => void;
  addAllergy: (memberId: string, allergy: Omit<Allergy, 'id'>) => void;
  removeAllergy: (memberId: string, allergyId: string) => void;
  addCondition: (memberId: string, condition: Omit<Condition, 'id'>) => void;
  removeCondition: (memberId: string, conditionId: string) => void;
  addMedication: (memberId: string, medication: Omit<Medication, 'id'>) => void;
  removeMedication: (memberId: string, medicationId: string) => void;

  // Member care preferences
  updateMemberCarePreferences: (memberId: string, updates: Partial<CarePreferences>) => void;

  // Emergency contacts
  addEmergencyContact: (contact: Omit<EmergencyContact, 'id'>) => EmergencyContact;
  updateEmergencyContact: (id: string, updates: Partial<EmergencyContact>) => void;
  deleteEmergencyContact: (id: string) => void;
  setDefaultEmergencyContact: (id: string) => void;

  // Care addresses
  addAddress: (address: Omit<CareAddress, 'id' | 'createdAt' | 'updatedAt'>) => CareAddress;
  updateAddress: (id: string, updates: Partial<CareAddress>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;

  // Insurance
  addInsurance: (insurance: Omit<InsuranceInfo, 'id' | 'createdAt' | 'updatedAt'>) => InsuranceInfo;
  updateInsurance: (id: string, updates: Partial<InsuranceInfo>) => void;
  deleteInsurance: (id: string) => void;

  // Health records
  addHealthRecord: (record: Omit<HealthRecord, 'id' | 'createdAt' | 'updatedAt'>) => HealthRecord;
  updateHealthRecord: (id: string, updates: Partial<HealthRecord>) => void;
  deleteHealthRecord: (id: string) => void;
  getRecordsForMember: (memberId: string) => HealthRecord[];

  // Preferences
  updateNotificationPreferences: (updates: Partial<NotificationPreferences>) => void;
  updatePrivacySettings: (updates: Partial<PrivacySettings>) => void;
  updateAppSettings: (updates: Partial<AppSettings>) => void;

  // Care readiness
  calculateCareReadiness: (memberId?: string) => CareReadinessScore;

  // Onboarding
  completeOnboarding: () => void;

  // Utils
  setLoading: (loading: boolean) => void;
  resetProfile: () => void;
};

// ============================================
// INITIAL STATE
// ============================================

const initialState: ProfileState = {
  user: null,
  isAuthenticated: false,
  members: [],
  selectedMemberId: null,
  emergencyContacts: [],
  addresses: [],
  insuranceInfo: [],
  healthRecords: [],
  notificationPreferences: createDefaultNotificationPreferences(),
  privacySettings: createDefaultPrivacySettings(),
  appSettings: createDefaultAppSettings(),
  isLoading: false,
  hasCompletedOnboarding: false,
};

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useProfileStore = create<ProfileState & ProfileActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ========== USER PROFILE ==========
      setUser: (user) => {
        set({ user, isAuthenticated: true });
      },

      updateUser: (updates) => {
        set((state) => ({
          user: state.user
            ? { ...state.user, ...updates, updatedAt: new Date().toISOString() }
            : null,
        }));
      },

      logout: () => {
        set({
          ...initialState,
          // Keep app settings
          appSettings: get().appSettings,
        });
      },

      // ========== FAMILY MEMBERS ==========
      addMember: (memberData) => {
        const now = new Date().toISOString();
        const member: FamilyMember = {
          ...memberData,
          id: generateId(),
          profileCompleteness: calculateMemberCompleteness(memberData),
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          members: [...state.members, member],
          selectedMemberId: state.members.length === 0 ? member.id : state.selectedMemberId,
        }));

        return member;
      },

      updateMember: (id, updates) => {
        set((state) => ({
          members: state.members.map((m) => {
            if (m.id !== id) return m;
            const updated = { ...m, ...updates, updatedAt: new Date().toISOString() };
            updated.profileCompleteness = calculateMemberCompleteness(updated);
            return updated;
          }),
        }));
      },

      deleteMember: (id) => {
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
          selectedMemberId:
            state.selectedMemberId === id
              ? state.members.find((m) => m.id !== id)?.id || null
              : state.selectedMemberId,
          // Also delete associated addresses and records
          addresses: state.addresses.filter((a) => a.memberId !== id),
          healthRecords: state.healthRecords.filter((r) => r.memberId !== id),
        }));
      },

      setDefaultMember: (id) => {
        set((state) => ({
          members: state.members.map((m) => ({
            ...m,
            isDefault: m.id === id,
          })),
        }));
      },

      selectMember: (id) => {
        set({ selectedMemberId: id });
      },

      getMemberById: (id) => {
        return get().members.find((m) => m.id === id);
      },

      // ========== MEMBER HEALTH INFO ==========
      updateMemberHealthInfo: (memberId, updates) => {
        set((state) => ({
          members: state.members.map((m) => {
            if (m.id !== memberId) return m;
            const updated = {
              ...m,
              healthInfo: { ...m.healthInfo, ...updates },
              updatedAt: new Date().toISOString(),
            };
            updated.profileCompleteness = calculateMemberCompleteness(updated);
            return updated;
          }),
        }));
      },

      addAllergy: (memberId, allergyData) => {
        const allergy: Allergy = { ...allergyData, id: generateId() };
        set((state) => ({
          members: state.members.map((m) => {
            if (m.id !== memberId) return m;
            const updated = {
              ...m,
              healthInfo: {
                ...m.healthInfo,
                allergies: [...m.healthInfo.allergies, allergy],
              },
              updatedAt: new Date().toISOString(),
            };
            updated.profileCompleteness = calculateMemberCompleteness(updated);
            return updated;
          }),
        }));
      },

      removeAllergy: (memberId, allergyId) => {
        set((state) => ({
          members: state.members.map((m) => {
            if (m.id !== memberId) return m;
            return {
              ...m,
              healthInfo: {
                ...m.healthInfo,
                allergies: m.healthInfo.allergies.filter((a) => a.id !== allergyId),
              },
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      addCondition: (memberId, conditionData) => {
        const condition: Condition = { ...conditionData, id: generateId() };
        set((state) => ({
          members: state.members.map((m) => {
            if (m.id !== memberId) return m;
            const updated = {
              ...m,
              healthInfo: {
                ...m.healthInfo,
                conditions: [...m.healthInfo.conditions, condition],
              },
              updatedAt: new Date().toISOString(),
            };
            updated.profileCompleteness = calculateMemberCompleteness(updated);
            return updated;
          }),
        }));
      },

      removeCondition: (memberId, conditionId) => {
        set((state) => ({
          members: state.members.map((m) => {
            if (m.id !== memberId) return m;
            return {
              ...m,
              healthInfo: {
                ...m.healthInfo,
                conditions: m.healthInfo.conditions.filter((c) => c.id !== conditionId),
              },
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      addMedication: (memberId, medicationData) => {
        const medication: Medication = { ...medicationData, id: generateId() };
        set((state) => ({
          members: state.members.map((m) => {
            if (m.id !== memberId) return m;
            const updated = {
              ...m,
              healthInfo: {
                ...m.healthInfo,
                medications: [...m.healthInfo.medications, medication],
              },
              updatedAt: new Date().toISOString(),
            };
            updated.profileCompleteness = calculateMemberCompleteness(updated);
            return updated;
          }),
        }));
      },

      removeMedication: (memberId, medicationId) => {
        set((state) => ({
          members: state.members.map((m) => {
            if (m.id !== memberId) return m;
            return {
              ...m,
              healthInfo: {
                ...m.healthInfo,
                medications: m.healthInfo.medications.filter((med) => med.id !== medicationId),
              },
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      // ========== MEMBER CARE PREFERENCES ==========
      updateMemberCarePreferences: (memberId, updates) => {
        set((state) => ({
          members: state.members.map((m) => {
            if (m.id !== memberId) return m;
            return {
              ...m,
              carePreferences: { ...m.carePreferences, ...updates },
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      // ========== EMERGENCY CONTACTS ==========
      addEmergencyContact: (contactData) => {
        const contact: EmergencyContact = {
          ...contactData,
          id: generateId(),
          isDefault: get().emergencyContacts.length === 0,
        };

        set((state) => ({
          emergencyContacts: [...state.emergencyContacts, contact],
        }));

        return contact;
      },

      updateEmergencyContact: (id, updates) => {
        set((state) => ({
          emergencyContacts: state.emergencyContacts.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
      },

      deleteEmergencyContact: (id) => {
        set((state) => ({
          emergencyContacts: state.emergencyContacts.filter((c) => c.id !== id),
        }));
      },

      setDefaultEmergencyContact: (id) => {
        set((state) => ({
          emergencyContacts: state.emergencyContacts.map((c) => ({
            ...c,
            isDefault: c.id === id,
          })),
        }));
      },

      // ========== CARE ADDRESSES ==========
      addAddress: (addressData) => {
        const now = new Date().toISOString();
        const address: CareAddress = {
          ...addressData,
          id: generateId(),
          isDefault: get().addresses.length === 0,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          addresses: [...state.addresses, address],
        }));

        return address;
      },

      updateAddress: (id, updates) => {
        set((state) => ({
          addresses: state.addresses.map((a) =>
            a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
          ),
        }));
      },

      deleteAddress: (id) => {
        set((state) => ({
          addresses: state.addresses.filter((a) => a.id !== id),
        }));
      },

      setDefaultAddress: (id) => {
        set((state) => ({
          addresses: state.addresses.map((a) => ({
            ...a,
            isDefault: a.id === id,
          })),
        }));
      },

      // ========== INSURANCE ==========
      addInsurance: (insuranceData) => {
        const now = new Date().toISOString();
        const insurance: InsuranceInfo = {
          ...insuranceData,
          id: generateId(),
          isActive: true,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          insuranceInfo: [...state.insuranceInfo, insurance],
        }));

        return insurance;
      },

      updateInsurance: (id, updates) => {
        set((state) => ({
          insuranceInfo: state.insuranceInfo.map((i) =>
            i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i
          ),
        }));
      },

      deleteInsurance: (id) => {
        set((state) => ({
          insuranceInfo: state.insuranceInfo.filter((i) => i.id !== id),
        }));
      },

      // ========== HEALTH RECORDS ==========
      addHealthRecord: (recordData) => {
        const now = new Date().toISOString();
        const record: HealthRecord = {
          ...recordData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          healthRecords: [...state.healthRecords, record],
        }));

        return record;
      },

      updateHealthRecord: (id, updates) => {
        set((state) => ({
          healthRecords: state.healthRecords.map((r) =>
            r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
          ),
        }));
      },

      deleteHealthRecord: (id) => {
        set((state) => ({
          healthRecords: state.healthRecords.filter((r) => r.id !== id),
        }));
      },

      getRecordsForMember: (memberId) => {
        return get().healthRecords.filter((r) => r.memberId === memberId);
      },

      // ========== PREFERENCES ==========
      updateNotificationPreferences: (updates) => {
        set((state) => ({
          notificationPreferences: { ...state.notificationPreferences, ...updates },
        }));
      },

      updatePrivacySettings: (updates) => {
        set((state) => ({
          privacySettings: { ...state.privacySettings, ...updates },
        }));
      },

      updateAppSettings: (updates) => {
        set((state) => ({
          appSettings: { ...state.appSettings, ...updates },
        }));
      },

      // ========== CARE READINESS ==========
      calculateCareReadiness: (memberId) => {
        const state = get();
        const member = memberId
          ? state.members.find((m) => m.id === memberId)
          : state.members.find((m) => m.isDefault) || state.members[0];

        const items: CareReadinessItem[] = [
          {
            id: 'member_basics',
            label: 'Add family member',
            description: 'Add at least one family member to care for',
            isComplete: state.members.length > 0,
            weight: 20,
            screen: 'FamilyMembers',
            whyWeAsk: 'We need to know who you are caring for.',
          },
          {
            id: 'allergies',
            label: 'Add allergies',
            description: 'List any known allergies',
            isComplete: member ? member.healthInfo.allergies.length > 0 : false,
            weight: 15,
            screen: 'HealthInfo',
            params: { tab: 'allergies' },
            whyWeAsk: 'Helps prevent unsafe recommendations.',
          },
          {
            id: 'conditions',
            label: 'Add health conditions',
            description: 'List any chronic conditions',
            isComplete: member ? member.healthInfo.conditions.length > 0 : false,
            weight: 15,
            screen: 'HealthInfo',
            params: { tab: 'conditions' },
            whyWeAsk: 'Improves triage accuracy.',
          },
          {
            id: 'medications',
            label: 'Add medications',
            description: 'List current medications',
            isComplete: member ? member.healthInfo.medications.length > 0 : false,
            weight: 15,
            screen: 'HealthInfo',
            params: { tab: 'medications' },
            whyWeAsk: 'Avoids drug interactions.',
          },
          {
            id: 'emergency_contact',
            label: 'Add emergency contact',
            description: 'Someone we can reach in emergencies',
            isComplete: state.emergencyContacts.length > 0,
            weight: 15,
            screen: 'EmergencyContacts',
            whyWeAsk: 'For urgent coordination.',
          },
          {
            id: 'care_address',
            label: 'Add care address',
            description: 'Where should care be provided',
            isComplete: state.addresses.length > 0,
            weight: 15,
            screen: 'Addresses',
            whyWeAsk: 'So providers can reach you.',
          },
          {
            id: 'insurance',
            label: 'Add insurance (optional)',
            description: 'May help with coverage',
            isComplete: state.insuranceInfo.length > 0,
            weight: 5,
            screen: 'Insurance',
            whyWeAsk: 'May reduce out-of-pocket costs.',
          },
        ];

        const totalPoints = items.reduce((sum, item) => sum + item.weight, 0);
        const earnedPoints = items
          .filter((item) => item.isComplete)
          .reduce((sum, item) => sum + item.weight, 0);

        return {
          score: Math.round((earnedPoints / totalPoints) * 100),
          totalPoints,
          earnedPoints,
          missingItems: items.filter((item) => !item.isComplete),
          completedItems: items.filter((item) => item.isComplete),
        };
      },

      // ========== ONBOARDING ==========
      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true });
      },

      // ========== UTILS ==========
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      resetProfile: () => {
        set(initialState);
      },
    }),
    {
      name: 'carebow-profile-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        members: state.members,
        selectedMemberId: state.selectedMemberId,
        emergencyContacts: state.emergencyContacts,
        addresses: state.addresses,
        insuranceInfo: state.insuranceInfo,
        healthRecords: state.healthRecords,
        notificationPreferences: state.notificationPreferences,
        privacySettings: state.privacySettings,
        appSettings: state.appSettings,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
    }
  )
);

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculateMemberCompleteness(member: Partial<FamilyMember>): number {
  let score = 0;
  const weights = {
    firstName: 10,
    lastName: 10,
    dateOfBirth: 10,
    gender: 5,
    relationship: 10,
    allergies: 15,
    conditions: 15,
    medications: 15,
    mobility: 5,
    carePreferences: 5,
  };

  if (member.firstName) score += weights.firstName;
  if (member.lastName) score += weights.lastName;
  if (member.dateOfBirth) score += weights.dateOfBirth;
  if (member.gender) score += weights.gender;
  if (member.relationship) score += weights.relationship;
  if (member.healthInfo?.allergies && member.healthInfo.allergies.length > 0)
    score += weights.allergies;
  if (member.healthInfo?.conditions && member.healthInfo.conditions.length > 0)
    score += weights.conditions;
  if (member.healthInfo?.medications && member.healthInfo.medications.length > 0)
    score += weights.medications;
  if (member.healthInfo?.mobilityStatus) score += weights.mobility;
  if (member.carePreferences?.preferredCareType && member.carePreferences.preferredCareType.length > 0)
    score += weights.carePreferences;

  return score;
}

// ============================================
// SELECTOR HOOKS
// ============================================

export const useUser = () => useProfileStore((state) => state.user);

export const useMembers = () => useProfileStore((state) => state.members);

export const useSelectedMember = () =>
  useProfileStore((state) => {
    if (!state.selectedMemberId) return state.members[0];
    return state.members.find((m) => m.id === state.selectedMemberId);
  });

export const useDefaultMember = () =>
  useProfileStore((state) => state.members.find((m) => m.isDefault) || state.members[0]);

export const useEmergencyContacts = () =>
  useProfileStore((state) => state.emergencyContacts);

export const useAddresses = () => useProfileStore((state) => state.addresses);

export const useInsuranceInfo = () => useProfileStore((state) => state.insuranceInfo);

export const useCareReadiness = (memberId?: string): CareReadinessScore => {
  const members = useProfileStore((state) => state.members);
  const emergencyContacts = useProfileStore((state) => state.emergencyContacts);
  const addresses = useProfileStore((state) => state.addresses);
  const insuranceInfo = useProfileStore((state) => state.insuranceInfo);

  return React.useMemo(() => {
    const member = memberId
      ? members.find((m) => m.id === memberId)
      : members.find((m) => m.isDefault) || members[0];

    const items: CareReadinessItem[] = [
      {
        id: 'member_basics',
        label: 'Add family member',
        description: 'Add at least one family member to care for',
        isComplete: members.length > 0,
        weight: 20,
        screen: 'FamilyMembers',
        whyWeAsk: 'We need to know who you are caring for.',
      },
      {
        id: 'allergies',
        label: 'Add allergies',
        description: 'List any known allergies',
        isComplete: member ? member.healthInfo.allergies.length > 0 : false,
        weight: 15,
        screen: 'HealthInfo',
        params: { tab: 'allergies' },
        whyWeAsk: 'Helps prevent unsafe recommendations.',
      },
      {
        id: 'conditions',
        label: 'Add health conditions',
        description: 'List any chronic conditions',
        isComplete: member ? member.healthInfo.conditions.length > 0 : false,
        weight: 15,
        screen: 'HealthInfo',
        params: { tab: 'conditions' },
        whyWeAsk: 'Improves triage accuracy.',
      },
      {
        id: 'medications',
        label: 'Add medications',
        description: 'List current medications',
        isComplete: member ? member.healthInfo.medications.length > 0 : false,
        weight: 15,
        screen: 'HealthInfo',
        params: { tab: 'medications' },
        whyWeAsk: 'Avoids drug interactions.',
      },
      {
        id: 'emergency_contact',
        label: 'Add emergency contact',
        description: 'Someone we can reach in emergencies',
        isComplete: emergencyContacts.length > 0,
        weight: 15,
        screen: 'EmergencyContacts',
        whyWeAsk: 'For urgent coordination.',
      },
      {
        id: 'care_address',
        label: 'Add care address',
        description: 'Where should care be provided',
        isComplete: addresses.length > 0,
        weight: 15,
        screen: 'Addresses',
        whyWeAsk: 'So providers can reach you.',
      },
      {
        id: 'insurance',
        label: 'Add insurance (optional)',
        description: 'May help with coverage',
        isComplete: insuranceInfo.length > 0,
        weight: 5,
        screen: 'Insurance',
        whyWeAsk: 'May reduce out-of-pocket costs.',
      },
    ];

    const totalPoints = items.reduce((sum, item) => sum + item.weight, 0);
    const earnedPoints = items
      .filter((item) => item.isComplete)
      .reduce((sum, item) => sum + item.weight, 0);

    return {
      score: Math.round((earnedPoints / totalPoints) * 100),
      totalPoints,
      earnedPoints,
      missingItems: items.filter((item) => !item.isComplete),
      completedItems: items.filter((item) => item.isComplete),
    };
  }, [members, emergencyContacts, addresses, insuranceInfo, memberId]);
};

export const useNotificationPreferences = () =>
  useProfileStore((state) => state.notificationPreferences);

export const usePrivacySettings = () =>
  useProfileStore((state) => state.privacySettings);

export const useAppSettings = () => useProfileStore((state) => state.appSettings);
