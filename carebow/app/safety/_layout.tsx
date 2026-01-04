/**
 * Safety Feature Layout
 * Handles navigation stack for safety screens
 */

import { Stack } from 'expo-router';
import { colors } from '@/theme';

export default function SafetyLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.surface2 },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="contacts"
        options={{
          presentation: 'card',
        }}
      />
    </Stack>
  );
}
