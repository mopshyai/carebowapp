/**
 * Navigation Types
 * Type definitions for React Navigation
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { UserRole } from '@/store/useAuthStore';

// ============================================
// AUTH STACK
// ============================================

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  VerifyEmail: { email: string };
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

// ============================================
// ONBOARDING STACK
// ============================================

export type OnboardingStackParamList = {
  OnboardingSlides: undefined;
  RoleSelection: undefined;
  CreateProfile: { role: UserRole };
  OnboardingComplete: undefined;
};

// ============================================
// ROOT STACK
// ============================================

// Root Stack Navigator
export type RootStackParamList = {
  // Auth & Onboarding
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;

  // Main App
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Conversation: {
    symptom: string;
    context: 'family' | 'me';
    relation: string;
    age: string;
    memberName: string;
    attachedImages?: string; // JSON string of ImageAttachment[]
  } | undefined;
  Assessment: undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
  Schedule: undefined;
  Thread: { id: string };
  Services: { category?: string } | undefined;
  ServiceDetails: { id: string; serviceId?: string };
  PlanDetails: { id: string };
  Checkout: { serviceId?: string } | undefined;
  OrderSuccess: { orderId?: string } | undefined;
  Orders: undefined;
  OrderDetails: { id: string };
  Requests: undefined;
  RequestDetails: { id: string };
  Safety: NavigatorScreenParams<SafetyStackParamList>;
  Modal: undefined;
  // New screens
  HealthMemory: undefined;
  EpisodeSummary: { episodeId: string };
  // Telemedicine
  TelemedicineBooking: { doctorId?: string } | undefined;
  VideoCall: { appointmentId: string; doctorName: string; doctorSpecialty?: string };
};

// Main Tab Navigator
export type MainTabParamList = {
  Home: undefined;
  Ask: undefined;
  Messages: undefined;
};

// Profile Stack Navigator
export type ProfileStackParamList = {
  ProfileIndex: undefined;
  PersonalInfo: undefined;
  FamilyMembers: undefined;
  MemberDetails: { memberId?: string };
  Addresses: undefined;
  CareHistory: undefined;
  HealthRecords: undefined;
  Insurance: undefined;
  Notifications: undefined;
  Privacy: undefined;
  Help: undefined;
  Settings: undefined;
  EmergencyContacts: undefined;
  HealthInfo: undefined;
};

// Safety Stack Navigator
export type SafetyStackParamList = {
  SafetyIndex: undefined;
  SafetySettings: undefined;
  SafetyContacts: undefined;
};

// Screen Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type OnboardingStackScreenProps<T extends keyof OnboardingStackParamList> =
  NativeStackScreenProps<OnboardingStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<ProfileStackParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type SafetyStackScreenProps<T extends keyof SafetyStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<SafetyStackParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

// Declaration merging for useNavigation hook
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

// Helper type for dynamic navigation
export type AppNavigationProp = {
  navigate: (screen: string, params?: Record<string, unknown>) => void;
  goBack: () => void;
  reset: (state: { index: number; routes: { name: string; params?: Record<string, unknown> }[] }) => void;
};
