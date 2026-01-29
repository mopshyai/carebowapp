/**
 * Safety Stack Navigator
 * Handles navigation stack for safety screens
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { SafetyStackParamList } from './types';
import { colors } from '../theme';

// Screen imports
import SafetyIndexScreen from '../screens/safety/SafetyIndexScreen';
import SafetySettingsScreen from '../screens/safety/SafetySettingsScreen';
import SafetyContactsScreen from '../screens/safety/SafetyContactsScreen';

const Stack = createNativeStackNavigator<SafetyStackParamList>();

export default function SafetyStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.surface2 },
      }}
    >
      <Stack.Screen
        name="SafetyIndex"
        component={SafetyIndexScreen}
        options={{
          animation: 'default',
        }}
      />
      <Stack.Screen
        name="SafetySettings"
        component={SafetySettingsScreen}
        options={{
          animation: 'default',
        }}
      />
      <Stack.Screen
        name="SafetyContacts"
        component={SafetyContactsScreen}
        options={{
          animation: 'default',
        }}
      />
    </Stack.Navigator>
  );
}
