/**
 * Auth Navigator
 * Stack navigator for authentication flow
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParamList } from './types';

// Auth Screens
import {
  WelcomeScreen,
  LoginScreen,
  SignupScreen,
  VerifyEmailScreen,
  ForgotPasswordScreen,
  ResetPasswordScreen,
} from '@/screens/auth';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
      initialRouteName="Welcome"
    >
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{
          animation: 'fade',
        }}
      />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}
