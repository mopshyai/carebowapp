/**
 * Onboarding Navigator
 * Stack navigator for onboarding flow
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from './types';

// Onboarding Screens
import {
  OnboardingSlidesScreen,
  RoleSelectionScreen,
  CreateProfileScreen,
  OnboardingCompleteScreen,
} from '@/screens/onboarding';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
      initialRouteName="OnboardingSlides"
    >
      <Stack.Screen
        name="OnboardingSlides"
        component={OnboardingSlidesScreen}
        options={{
          animation: 'fade',
        }}
      />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="CreateProfile" component={CreateProfileScreen} />
      <Stack.Screen
        name="OnboardingComplete"
        component={OnboardingCompleteScreen}
        options={{
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}
