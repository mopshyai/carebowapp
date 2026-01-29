/**
 * Profile Store Tests
 * Comprehensive tests for user profile, family members, addresses, and health data
 */

import { act, renderHook } from '@testing-library/react-native';
import { useProfileStore } from './useProfileStore';
import type { FamilyMember, UserProfile } from '@/types/profile';

// Helper to reset store state between tests
const resetStore = () => {
  useProfileStore.setState({
    user: null,
    isAuthenticated: false,
    members: [],
    selectedMemberId: null,
    emergencyContacts: [],
    addresses: [],
    insuranceInfo: [],
    healthRecords: [],
    notificationPreferences: {
      pushEnabled: true,
      emailEnabled: true,
      smsEnabled: false,
      appointmentReminders: true,
      promotionalMessages: false,
      healthTips: true,
    },
    privacySettings: {
      shareDataWithProviders: true,
      shareDataForResearch: false,
      allowAnalytics: true,
    },
    appSettings: {
      theme: 'system',
      language: 'en',
      measurementUnit: 'metric',
      hapticFeedback: true,
    },
    isLoading: false,
    hasCompletedOnboarding: false,
  });
};

// Mock user data
const mockUser: UserProfile = {
  id: 'user-123',
  email: 'test@example.com',
  phone: '+919876543210',
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '1990-01-15',
  gender: 'male',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock family member data (without id, timestamps, and profileCompleteness)
const mockMemberData = {
  firstName: 'Jane',
  lastName: 'Doe',
  relationship: 'spouse' as const,
  dateOfBirth: '1992-05-20',
  gender: 'female' as const,
  isDefault: false,
  healthInfo: {
    allergies: [],
    conditions: [],
    medications: [],
    mobilityStatus: 'fully_mobile' as const,
  },
  carePreferences: {
    preferredLanguage: 'en',
    preferredCareType: ['home_care' as const],
  },
};

describe('useProfileStore', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('Initial State', () => {
    it('starts with null user', () => {
      const { result } = renderHook(() => useProfileStore());
      expect(result.current.user).toBeNull();
    });

    it('starts not authenticated', () => {
      const { result } = renderHook(() => useProfileStore());
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('starts with empty members', () => {
      const { result } = renderHook(() => useProfileStore());
      expect(result.current.members).toEqual([]);
    });

    it('starts with no selected member', () => {
      const { result } = renderHook(() => useProfileStore());
      expect(result.current.selectedMemberId).toBeNull();
    });

    it('starts with default app settings', () => {
      const { result } = renderHook(() => useProfileStore());
      expect(result.current.appSettings.theme).toBe('system');
      expect(result.current.appSettings.language).toBe('en');
    });

    it('starts with onboarding not completed', () => {
      const { result } = renderHook(() => useProfileStore());
      expect(result.current.hasCompletedOnboarding).toBe(false);
    });
  });

  describe('User Profile', () => {
    it('setUser sets user and authenticates', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.setUser(mockUser);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('updateUser updates user fields', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.setUser(mockUser);
      });

      act(() => {
        result.current.updateUser({ firstName: 'Johnny' });
      });

      expect(result.current.user?.firstName).toBe('Johnny');
      expect(result.current.user?.lastName).toBe('Doe'); // Unchanged
    });

    it('updateUser does nothing when no user', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.updateUser({ firstName: 'Test' });
      });

      expect(result.current.user).toBeNull();
    });

    it('logout clears user but keeps app settings', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.setUser(mockUser);
        result.current.updateAppSettings({ theme: 'dark' });
      });

      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.appSettings.theme).toBe('dark'); // Preserved
    });
  });

  describe('Family Members', () => {
    it('addMember creates a new member with generated ID', () => {
      const { result } = renderHook(() => useProfileStore());

      let member: FamilyMember;
      act(() => {
        member = result.current.addMember(mockMemberData);
      });

      expect(result.current.members).toHaveLength(1);
      expect(result.current.members[0].firstName).toBe('Jane');
      expect(result.current.members[0].id).toBeDefined();
      expect(result.current.members[0].createdAt).toBeDefined();
    });

    it('first member becomes selected automatically', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.addMember(mockMemberData);
      });

      expect(result.current.selectedMemberId).toBe(result.current.members[0].id);
    });

    it('updateMember updates member fields', () => {
      const { result } = renderHook(() => useProfileStore());

      let member: FamilyMember;
      act(() => {
        member = result.current.addMember(mockMemberData);
      });

      act(() => {
        result.current.updateMember(member!.id, { firstName: 'Janet' });
      });

      expect(result.current.members[0].firstName).toBe('Janet');
    });

    it('deleteMember removes member', () => {
      const { result } = renderHook(() => useProfileStore());

      let member: FamilyMember;
      act(() => {
        member = result.current.addMember(mockMemberData);
      });

      expect(result.current.members).toHaveLength(1);

      act(() => {
        result.current.deleteMember(member!.id);
      });

      expect(result.current.members).toHaveLength(0);
    });

    it('setDefaultMember sets member as default', () => {
      const { result } = renderHook(() => useProfileStore());

      let member1: FamilyMember;
      let member2: FamilyMember;
      act(() => {
        member1 = result.current.addMember({ ...mockMemberData, isDefault: true });
        member2 = result.current.addMember({ ...mockMemberData, firstName: 'Bob', isDefault: false });
      });

      act(() => {
        result.current.setDefaultMember(member2!.id);
      });

      expect(result.current.members.find((m) => m.id === member1!.id)?.isDefault).toBe(false);
      expect(result.current.members.find((m) => m.id === member2!.id)?.isDefault).toBe(true);
    });

    it('selectMember updates selected member', () => {
      const { result } = renderHook(() => useProfileStore());

      let member1: FamilyMember;
      let member2: FamilyMember;
      act(() => {
        member1 = result.current.addMember(mockMemberData);
        member2 = result.current.addMember({ ...mockMemberData, firstName: 'Bob' });
      });

      act(() => {
        result.current.selectMember(member2!.id);
      });

      expect(result.current.selectedMemberId).toBe(member2!.id);
    });

    it('getMemberById returns correct member', () => {
      const { result } = renderHook(() => useProfileStore());

      let member: FamilyMember;
      act(() => {
        member = result.current.addMember(mockMemberData);
      });

      const found = result.current.getMemberById(member!.id);
      expect(found?.firstName).toBe('Jane');
    });
  });

  describe('Member Health Info', () => {
    it('addAllergy adds allergy to member', () => {
      const { result } = renderHook(() => useProfileStore());

      let member: FamilyMember;
      act(() => {
        member = result.current.addMember(mockMemberData);
      });

      act(() => {
        result.current.addAllergy(member!.id, {
          name: 'Peanuts',
          severity: 'severe',
        });
      });

      expect(result.current.members[0].healthInfo.allergies).toHaveLength(1);
      expect(result.current.members[0].healthInfo.allergies[0].name).toBe('Peanuts');
    });

    it('removeAllergy removes allergy from member', () => {
      const { result } = renderHook(() => useProfileStore());

      let member: FamilyMember;
      act(() => {
        member = result.current.addMember(mockMemberData);
        result.current.addAllergy(member!.id, { name: 'Peanuts', severity: 'severe' });
      });

      const allergyId = result.current.members[0].healthInfo.allergies[0].id;

      act(() => {
        result.current.removeAllergy(member!.id, allergyId);
      });

      expect(result.current.members[0].healthInfo.allergies).toHaveLength(0);
    });

    it('addCondition adds condition to member', () => {
      const { result } = renderHook(() => useProfileStore());

      let member: FamilyMember;
      act(() => {
        member = result.current.addMember(mockMemberData);
      });

      act(() => {
        result.current.addCondition(member!.id, {
          name: 'Diabetes',
          status: 'managed',
        });
      });

      expect(result.current.members[0].healthInfo.conditions).toHaveLength(1);
      expect(result.current.members[0].healthInfo.conditions[0].name).toBe('Diabetes');
    });

    it('addMedication adds medication to member', () => {
      const { result } = renderHook(() => useProfileStore());

      let member: FamilyMember;
      act(() => {
        member = result.current.addMember(mockMemberData);
      });

      act(() => {
        result.current.addMedication(member!.id, {
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'twice daily',
        });
      });

      expect(result.current.members[0].healthInfo.medications).toHaveLength(1);
      expect(result.current.members[0].healthInfo.medications[0].name).toBe('Metformin');
    });
  });

  describe('Emergency Contacts', () => {
    it('addEmergencyContact creates contact', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.addEmergencyContact({
          name: 'Emergency Contact',
          phone: '+919999999999',
          relationship: 'spouse',
          isDefault: false,
        });
      });

      expect(result.current.emergencyContacts).toHaveLength(1);
      expect(result.current.emergencyContacts[0].isDefault).toBe(true); // First becomes default
    });

    it('deleteEmergencyContact removes contact', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.addEmergencyContact({
          name: 'Contact 1',
          phone: '+919999999999',
          relationship: 'spouse',
          isDefault: false,
        });
      });

      const contactId = result.current.emergencyContacts[0].id;

      act(() => {
        result.current.deleteEmergencyContact(contactId);
      });

      expect(result.current.emergencyContacts).toHaveLength(0);
    });
  });

  describe('Care Addresses', () => {
    it('addAddress creates address', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.addAddress({
          label: 'Home',
          addressLine1: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          isDefault: false,
        });
      });

      expect(result.current.addresses).toHaveLength(1);
      expect(result.current.addresses[0].isDefault).toBe(true); // First becomes default
    });

    it('setDefaultAddress updates default', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.addAddress({
          label: 'Home',
          addressLine1: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          isDefault: true,
        });
        result.current.addAddress({
          label: 'Office',
          addressLine1: '456 Work St',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400002',
          isDefault: false,
        });
      });

      const officeId = result.current.addresses[1].id;

      act(() => {
        result.current.setDefaultAddress(officeId);
      });

      expect(result.current.addresses[0].isDefault).toBe(false);
      expect(result.current.addresses[1].isDefault).toBe(true);
    });
  });

  describe('Insurance', () => {
    it('addInsurance creates insurance entry', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.addInsurance({
          provider: 'ICICI Lombard',
          policyNumber: 'POL123456',
          memberIds: [],
          validTill: '2025-12-31',
          isActive: true,
        });
      });

      expect(result.current.insuranceInfo).toHaveLength(1);
      expect(result.current.insuranceInfo[0].provider).toBe('ICICI Lombard');
    });

    it('deleteInsurance removes insurance', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.addInsurance({
          provider: 'ICICI Lombard',
          policyNumber: 'POL123456',
          memberIds: [],
          validTill: '2025-12-31',
          isActive: true,
        });
      });

      const insuranceId = result.current.insuranceInfo[0].id;

      act(() => {
        result.current.deleteInsurance(insuranceId);
      });

      expect(result.current.insuranceInfo).toHaveLength(0);
    });
  });

  describe('Health Records', () => {
    it('addHealthRecord creates record', () => {
      const { result } = renderHook(() => useProfileStore());

      let member: FamilyMember;
      act(() => {
        member = result.current.addMember(mockMemberData);
      });

      act(() => {
        result.current.addHealthRecord({
          memberId: member!.id,
          type: 'lab_report',
          title: 'Blood Test',
          date: '2024-01-15',
          fileUrl: 'https://example.com/report.pdf',
        });
      });

      expect(result.current.healthRecords).toHaveLength(1);
      expect(result.current.healthRecords[0].title).toBe('Blood Test');
    });

    it('getRecordsForMember returns correct records', () => {
      const { result } = renderHook(() => useProfileStore());

      let member1: FamilyMember;
      let member2: FamilyMember;
      act(() => {
        member1 = result.current.addMember(mockMemberData);
        member2 = result.current.addMember({ ...mockMemberData, firstName: 'Bob' });
      });

      act(() => {
        result.current.addHealthRecord({
          memberId: member1!.id,
          type: 'lab_report',
          title: 'Jane Report',
          date: '2024-01-15',
        });
        result.current.addHealthRecord({
          memberId: member2!.id,
          type: 'prescription',
          title: 'Bob Prescription',
          date: '2024-01-16',
        });
      });

      const janeRecords = result.current.getRecordsForMember(member1!.id);
      expect(janeRecords).toHaveLength(1);
      expect(janeRecords[0].title).toBe('Jane Report');
    });
  });

  describe('Preferences', () => {
    it('updateNotificationPreferences updates settings', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.updateNotificationPreferences({ pushEnabled: false });
      });

      expect(result.current.notificationPreferences.pushEnabled).toBe(false);
      expect(result.current.notificationPreferences.emailEnabled).toBe(true); // Unchanged
    });

    it('updatePrivacySettings updates settings', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.updatePrivacySettings({ shareDataForResearch: true });
      });

      expect(result.current.privacySettings.shareDataForResearch).toBe(true);
    });

    it('updateAppSettings updates settings', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.updateAppSettings({ theme: 'dark', language: 'hi' });
      });

      expect(result.current.appSettings.theme).toBe('dark');
      expect(result.current.appSettings.language).toBe('hi');
    });
  });

  describe('Care Readiness', () => {
    it('returns 0% when no data', () => {
      const { result } = renderHook(() => useProfileStore());

      const readiness = result.current.calculateCareReadiness();
      expect(readiness.score).toBe(0);
      expect(readiness.missingItems.length).toBeGreaterThan(0);
    });

    it('score increases with added data', () => {
      const { result } = renderHook(() => useProfileStore());

      // Add member (20% weight)
      act(() => {
        result.current.addMember(mockMemberData);
      });

      const readiness1 = result.current.calculateCareReadiness();
      expect(readiness1.score).toBeGreaterThan(0);

      // Add emergency contact (15% weight)
      act(() => {
        result.current.addEmergencyContact({
          name: 'Emergency',
          phone: '+919999999999',
          relationship: 'spouse',
          isDefault: false,
        });
      });

      const readiness2 = result.current.calculateCareReadiness();
      expect(readiness2.score).toBeGreaterThan(readiness1.score);
    });
  });

  describe('Onboarding', () => {
    it('completeOnboarding sets completion state', () => {
      const { result } = renderHook(() => useProfileStore());

      expect(result.current.hasCompletedOnboarding).toBe(false);

      act(() => {
        result.current.completeOnboarding();
      });

      expect(result.current.hasCompletedOnboarding).toBe(true);
    });
  });

  describe('Utils', () => {
    it('setLoading updates loading state', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('resetProfile clears all data', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.setUser(mockUser);
        result.current.addMember(mockMemberData);
        result.current.completeOnboarding();
      });

      expect(result.current.user).not.toBeNull();
      expect(result.current.members).toHaveLength(1);

      act(() => {
        result.current.resetProfile();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.members).toHaveLength(0);
      expect(result.current.hasCompletedOnboarding).toBe(false);
    });
  });
});
