/**
 * Profile Types
 * Comprehensive types for user profile, family members, addresses, and health data
 */

// ============================================
// USER PROFILE
// ============================================

export type UserProfile = {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: Gender;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

// ============================================
// FAMILY MEMBERS
// ============================================

export type FamilyMember = {
  id: string;
  firstName: string;
  lastName: string;
  relationship: Relationship;
  dateOfBirth?: string;
  age?: number;
  gender?: Gender;
  isDefault: boolean;
  // Health information
  healthInfo: MemberHealthInfo;
  // Care preferences
  carePreferences: CarePreferences;
  // Profile completeness
  profileCompleteness: number;
  createdAt: string;
  updatedAt: string;
};

export type Relationship =
  | 'self'
  | 'spouse'
  | 'parent'
  | 'child'
  | 'sibling'
  | 'grandparent'
  | 'grandchild'
  | 'in_law'
  | 'other';

export const RELATIONSHIP_LABELS: Record<Relationship, string> = {
  self: 'Self',
  spouse: 'Spouse',
  parent: 'Parent',
  child: 'Child',
  sibling: 'Sibling',
  grandparent: 'Grandparent',
  grandchild: 'Grandchild',
  in_law: 'In-law',
  other: 'Other',
};

// ============================================
// HEALTH INFORMATION
// ============================================

export type MemberHealthInfo = {
  allergies: Allergy[];
  conditions: Condition[];
  medications: Medication[];
  bloodType?: BloodType;
  height?: number; // in cm
  weight?: number; // in kg
  mobilityStatus: MobilityStatus;
  notes?: string;
};

export type Allergy = {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  notes?: string;
};

export type Condition = {
  id: string;
  name: string;
  diagnosedDate?: string;
  status: 'active' | 'managed' | 'resolved';
  notes?: string;
};

export type Medication = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  prescribedFor?: string;
  startDate?: string;
  notes?: string;
};

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown';

export type MobilityStatus =
  | 'fully_mobile'
  | 'needs_assistance'
  | 'wheelchair_bound'
  | 'bedridden';

export const MOBILITY_LABELS: Record<MobilityStatus, string> = {
  fully_mobile: 'Fully Mobile',
  needs_assistance: 'Needs Assistance',
  wheelchair_bound: 'Wheelchair Bound',
  bedridden: 'Bedridden',
};

// ============================================
// CARE PREFERENCES
// ============================================

export type CarePreferences = {
  preferredLanguage: string;
  preferredCareType: CareType[];
  preferredGender?: Gender;
  specialInstructions?: string;
};

export type CareType =
  | 'home_care'
  | 'clinic_visit'
  | 'video_consult'
  | 'no_preference';

export const CARE_TYPE_LABELS: Record<CareType, string> = {
  home_care: 'Home Care',
  clinic_visit: 'Clinic Visit',
  video_consult: 'Video Consultation',
  no_preference: 'No Preference',
};

// ============================================
// EMERGENCY CONTACT
// ============================================

export type EmergencyContact = {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isDefault: boolean;
};

// ============================================
// CARE ADDRESSES
// ============================================

export type CareAddress = {
  id: string;
  label: string; // "Home", "Office", "Parent's House"
  memberId?: string; // Associated member, or null for general
  streetAddress: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  accessInstructions?: string;
  parkingInfo?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

// ============================================
// INSURANCE
// ============================================

export type InsuranceInfo = {
  id: string;
  providerName: string;
  memberId: string;
  groupNumber?: string;
  planType: InsurancePlanType;
  policyHolderName: string;
  policyHolderRelationship: string;
  effectiveDate?: string;
  expirationDate?: string;
  frontImageUrl?: string;
  backImageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type InsurancePlanType =
  | 'hmo'
  | 'ppo'
  | 'epo'
  | 'pos'
  | 'hdhp'
  | 'medicare'
  | 'medicaid'
  | 'other';

export const INSURANCE_PLAN_LABELS: Record<InsurancePlanType, string> = {
  hmo: 'HMO',
  ppo: 'PPO',
  epo: 'EPO',
  pos: 'POS',
  hdhp: 'HDHP',
  medicare: 'Medicare',
  medicaid: 'Medicaid',
  other: 'Other',
};

// ============================================
// HEALTH RECORDS
// ============================================

export type HealthRecord = {
  id: string;
  memberId: string;
  title: string;
  type: HealthRecordType;
  date: string;
  providerName?: string;
  notes?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  createdAt: string;
  updatedAt: string;
};

export type HealthRecordType =
  | 'lab_result'
  | 'prescription'
  | 'imaging'
  | 'visit_summary'
  | 'vaccination'
  | 'other';

export const HEALTH_RECORD_TYPE_LABELS: Record<HealthRecordType, string> = {
  lab_result: 'Lab Result',
  prescription: 'Prescription',
  imaging: 'Imaging',
  visit_summary: 'Visit Summary',
  vaccination: 'Vaccination Record',
  other: 'Other',
};

// ============================================
// NOTIFICATION PREFERENCES
// ============================================

export type NotificationPreferences = {
  // Push notifications
  pushEnabled: boolean;
  orderUpdates: boolean;
  appointmentReminders: boolean;
  promotions: boolean;
  careAlerts: boolean;
  // Email notifications
  emailEnabled: boolean;
  emailOrderUpdates: boolean;
  emailNewsletter: boolean;
  // SMS notifications
  smsEnabled: boolean;
  smsAppointmentReminders: boolean;
  smsUrgentAlerts: boolean;
};

// ============================================
// PRIVACY & SECURITY
// ============================================

export type PrivacySettings = {
  biometricEnabled: boolean;
  twoFactorEnabled: boolean;
  shareDataWithProviders: boolean;
  allowAnalytics: boolean;
  dataExportRequestedAt?: string;
  accountDeletionRequestedAt?: string;
};

// ============================================
// APP SETTINGS
// ============================================

export type AppSettings = {
  theme: 'light' | 'dark' | 'system';
  hapticFeedback: boolean;
  language: string;
  currency: 'USD';
  measurementUnit: 'imperial' | 'metric';
};

// ============================================
// CARE READINESS
// ============================================

export type CareReadinessItem = {
  id: string;
  label: string;
  description: string;
  isComplete: boolean;
  weight: number; // Points towards total
  screen: string; // Screen name for navigation
  params?: Record<string, string>; // Optional navigation params
  whyWeAsk?: string;
};

export type CareReadinessScore = {
  score: number; // 0-100
  totalPoints: number;
  earnedPoints: number;
  missingItems: CareReadinessItem[];
  completedItems: CareReadinessItem[];
};

// ============================================
// WHY WE ASK - EXPLANATIONS
// ============================================

export const WHY_WE_ASK = {
  allergies: 'Helps prevent unsafe recommendations and ensures providers are aware of potential reactions.',
  conditions: 'Improves triage accuracy and helps us recommend appropriate care.',
  medications: 'Avoids harmful drug interactions and ensures safe treatment.',
  emergencyContact: 'For urgent coordination and to keep your loved ones informed.',
  address: 'Ensures care providers can reach you quickly when needed.',
  insurance: 'Helps verify coverage and may reduce your out-of-pocket costs.',
  bloodType: 'Critical information in emergency situations.',
  mobility: 'Helps us recommend appropriate care and equipment.',
  dateOfBirth: 'Age-appropriate care recommendations and safety checks.',
  preferredLanguage: 'Ensures you can communicate comfortably with care providers.',
  carePreferences: 'Helps match you with the right type of care.',
} as const;

// ============================================
// HELPERS
// ============================================

export function createEmptyMemberHealthInfo(): MemberHealthInfo {
  return {
    allergies: [],
    conditions: [],
    medications: [],
    mobilityStatus: 'fully_mobile',
  };
}

export function createEmptyCarePreferences(): CarePreferences {
  return {
    preferredLanguage: 'English',
    preferredCareType: ['no_preference'],
  };
}

export function createDefaultNotificationPreferences(): NotificationPreferences {
  return {
    pushEnabled: true,
    orderUpdates: true,
    appointmentReminders: true,
    promotions: false,
    careAlerts: true,
    emailEnabled: true,
    emailOrderUpdates: true,
    emailNewsletter: false,
    smsEnabled: true,
    smsAppointmentReminders: true,
    smsUrgentAlerts: true,
  };
}

export function createDefaultPrivacySettings(): PrivacySettings {
  return {
    biometricEnabled: false,
    twoFactorEnabled: false,
    shareDataWithProviders: true,
    allowAnalytics: true,
  };
}

export function createDefaultAppSettings(): AppSettings {
  return {
    theme: 'system',
    hapticFeedback: true,
    language: 'en',
    currency: 'USD',
    measurementUnit: 'imperial',
  };
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
