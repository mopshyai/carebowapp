/**
 * Root Navigator
 * Main navigation container with auth flow handling
 */

import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { colors } from '@/theme';

// Auth Store
import { useAuthStore } from '@/store/useAuthStore';

// Navigators
import AuthNavigator from './AuthNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import TabNavigator from './TabNavigator';
import ProfileStackNavigator from './ProfileStackNavigator';
import SafetyStackNavigator from './SafetyStackNavigator';

// Screen imports
import ConversationScreen from '../screens/ConversationScreen';
import AssessmentScreen from '../screens/AssessmentScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import ThreadScreen from '../screens/ThreadScreen';
import ServicesScreen from '../screens/ServicesScreen';
import ServiceDetailsScreen from '../screens/ServiceDetailsScreen';
import CarePlansScreen from '../screens/CarePlansScreen';
import PlanDetailsScreen from '../screens/PlanDetailsScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrderSuccessScreen from '../screens/OrderSuccessScreen';
import OrdersScreen from '../screens/OrdersScreen';
import OrderDetailsScreen from '../screens/OrderDetailsScreen';
import RequestsScreen from '../screens/RequestsScreen';
import RequestDetailsScreen from '../screens/RequestDetailsScreen';
import ModalScreen from '../screens/ModalScreen';
import HealthMemoryScreen from '../screens/HealthMemoryScreen';
import EpisodeSummaryScreen from '../screens/EpisodeSummaryScreen';
import TelemedicineBookingScreen from '../screens/TelemedicineBookingScreen';
import VideoCallScreen from '../screens/VideoCallScreen';

// Symptom Entry Screens (PRD V1)
import NewEntryScreen from '../screens/entries/NewEntryScreen';
import AssessmentResultScreen from '../screens/entries/AssessmentResultScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Loading screen shown during hydration
 */
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );
}

export default function RootNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasCompletedOnboarding = useAuthStore((state) => state.hasCompletedOnboarding);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);

  // Show loading while store is hydrating
  if (!hasHydrated) {
    return <LoadingScreen />;
  }

  // Determine initial route based on auth state
  const getInitialRoute = (): keyof RootStackParamList => {
    if (!isAuthenticated) {
      return 'Auth';
    }
    if (!hasCompletedOnboarding) {
      return 'Onboarding';
    }
    return 'MainTabs';
  };

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={getInitialRoute()}
    >
      {/* Auth Flow - shown when not authenticated */}
      {!isAuthenticated ? (
        <Stack.Screen
          name="Auth"
          component={AuthNavigator}
          options={{
            animationTypeForReplace: !isAuthenticated ? 'pop' : 'push',
          }}
        />
      ) : (
        <>
          {/* Onboarding Flow - shown after auth but before completing onboarding */}
          {!hasCompletedOnboarding && (
            <Stack.Screen
              name="Onboarding"
              component={OnboardingNavigator}
              options={{
                gestureEnabled: false,
              }}
            />
          )}

          {/* Main App - shown when authenticated and onboarding complete */}
          <Stack.Screen name="MainTabs" component={TabNavigator} />

          {/* Symptom Entry Flow (PRD V1) */}
          <Stack.Screen
            name="NewEntry"
            component={NewEntryScreen}
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="AssessmentResult"
            component={AssessmentResultScreen}
            options={{
              animation: 'slide_from_right',
            }}
          />

          {/* Conversation Flow */}
          <Stack.Screen
            name="Conversation"
            component={ConversationScreen}
            options={{
              animation: 'default',
            }}
          />
          <Stack.Screen
            name="Assessment"
            component={AssessmentScreen}
            options={{
              presentation: 'modal',
            }}
          />

          {/* Profile Stack */}
          <Stack.Screen
            name="Profile"
            component={ProfileStackNavigator}
            options={{
              animation: 'default',
            }}
          />

          {/* Schedule */}
          <Stack.Screen
            name="Schedule"
            component={ScheduleScreen}
            options={{
              animation: 'default',
            }}
          />

          {/* Thread */}
          <Stack.Screen
            name="Thread"
            component={ThreadScreen}
            options={{
              animation: 'default',
            }}
          />

          {/* Services Flow */}
          <Stack.Screen
            name="Services"
            component={ServicesScreen}
            options={{
              animation: 'default',
            }}
          />
          <Stack.Screen
            name="ServiceDetails"
            component={ServiceDetailsScreen}
            options={{
              animation: 'default',
            }}
          />
          <Stack.Screen
            name="CarePlans"
            component={CarePlansScreen}
            options={{
              animation: 'default',
            }}
          />
          <Stack.Screen
            name="PlanDetails"
            component={PlanDetailsScreen}
            options={{
              animation: 'default',
            }}
          />
          <Stack.Screen
            name="Checkout"
            component={CheckoutScreen}
            options={{
              animation: 'default',
            }}
          />
          <Stack.Screen
            name="OrderSuccess"
            component={OrderSuccessScreen}
            options={{
              presentation: 'modal',
              gestureEnabled: false,
            }}
          />

          {/* Orders */}
          <Stack.Screen
            name="Orders"
            component={OrdersScreen}
            options={{
              animation: 'default',
            }}
          />
          <Stack.Screen
            name="OrderDetails"
            component={OrderDetailsScreen}
            options={{
              animation: 'default',
            }}
          />

          {/* Requests */}
          <Stack.Screen
            name="Requests"
            component={RequestsScreen}
            options={{
              animation: 'default',
            }}
          />
          <Stack.Screen
            name="RequestDetails"
            component={RequestDetailsScreen}
            options={{
              animation: 'default',
            }}
          />

          {/* Safety Stack */}
          <Stack.Screen
            name="Safety"
            component={SafetyStackNavigator}
            options={{
              animation: 'default',
            }}
          />

          {/* Modal */}
          <Stack.Screen
            name="Modal"
            component={ModalScreen}
            options={{
              presentation: 'modal',
              title: 'Modal',
            }}
          />

          {/* Health Memory */}
          <Stack.Screen
            name="HealthMemory"
            component={HealthMemoryScreen}
            options={{
              animation: 'default',
            }}
          />

          {/* Episode Summary */}
          <Stack.Screen
            name="EpisodeSummary"
            component={EpisodeSummaryScreen}
            options={{
              animation: 'slide_from_right',
            }}
          />

          {/* Telemedicine */}
          <Stack.Screen
            name="TelemedicineBooking"
            component={TelemedicineBookingScreen}
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="VideoCall"
            component={VideoCallScreen}
            options={{
              animation: 'fade',
              gestureEnabled: false,
              presentation: 'fullScreenModal',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
