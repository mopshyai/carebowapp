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
  VerifyEmail: { email?: string; token?: string } | undefined;
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

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  MainTabs: NavigatorScreenParams<MainTabParamList>;

  NewEntry: undefined;
  AssessmentResult: { entryId: string };

  Conversation:
    | {
        symptom: string;
        context: 'family' | 'me';
        relation: string;
        age: string;
        memberName: string;
        memberId?: string;
        caregiverPresent?: string;
        attachedImages?: string;
      }
    | undefined;
  Assessment: undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
  Schedule: undefined;
  Thread: { id: string };
  Services: { category?: string } | undefined;
  ServiceDetails: { id: string; serviceId?: string };
  CarePlans: undefined;
  PlanDetails: { id: string };
  Checkout: { serviceId?: string } | undefined;
  OrderSuccess: { orderId?: string } | undefined;
  Orders: undefined;
  OrderDetails: { id: string };
  MemberBookingDetails: { id: string };
  Requests: undefined;
  RequestDetails: { id: string };
  Safety: NavigatorScreenParams<SafetyStackParamList>;
  Modal: undefined;
  HealthMemory: undefined;
  EpisodeSummary: { episodeId: string };
  TelemedicineBooking: { doctorId?: string } | undefined;
  VideoCall: { appointmentId: string; doctorName: string; doctorSpecialty?: string };
};

export type MainTabParamList = {
  Home: undefined;
  Ask: undefined;
  Messages: undefined;
};

export type ProfileStackParamList = {
  ProfileIndex: undefined;
  PersonalInfo: undefined;
  FamilyMembers: undefined;
  MemberDetails: { id?: string };
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
  NotificationInbox: undefined;
  Vitals: undefined;
  Payments: undefined;
};

export type SafetyStackParamList = {
  SafetyIndex: undefined;
  SafetySettings: undefined;
  SafetyContacts: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>;

export type OnboardingStackScreenProps<T extends keyof OnboardingStackParamList> =
  NativeStackScreenProps<OnboardingStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

export type SafetyStackScreenProps<T extends keyof SafetyStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<SafetyStackParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type AppNavigationProp = {
  navigate: (screen: string, params?: Record<string, unknown>) => void;
  goBack: () => void;
  reset: (state: {
    index: number;
    routes: { name: string; params?: Record<string, unknown> }[];
  }) => void;
};
