/**
 * Profile Stack Navigator
 * Handles navigation within the profile section
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from './types';
import { colors } from '../theme';

// Screen imports
import ProfileIndexScreen from '../screens/profile/ProfileIndexScreen';
import PersonalInfoScreen from '../screens/profile/PersonalInfoScreen';
import FamilyMembersScreen from '../screens/profile/FamilyMembersScreen';
import MemberDetailsScreen from '../screens/profile/MemberDetailsScreen';
import AddressesScreen from '../screens/profile/AddressesScreen';
import CareHistoryScreen from '../screens/profile/CareHistoryScreen';
import HealthRecordsScreen from '../screens/profile/HealthRecordsScreen';
import InsuranceScreen from '../screens/profile/InsuranceScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import PrivacyScreen from '../screens/profile/PrivacyScreen';
import HelpScreen from '../screens/profile/HelpScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import EmergencyContactsScreen from '../screens/profile/EmergencyContactsScreen';
import HealthInfoScreen from '../screens/profile/HealthInfoScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.surface2 },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="ProfileIndex" component={ProfileIndexScreen} />
      <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
      <Stack.Screen name="FamilyMembers" component={FamilyMembersScreen} />
      <Stack.Screen name="MemberDetails" component={MemberDetailsScreen} />
      <Stack.Screen name="Addresses" component={AddressesScreen} />
      <Stack.Screen name="CareHistory" component={CareHistoryScreen} />
      <Stack.Screen name="HealthRecords" component={HealthRecordsScreen} />
      <Stack.Screen name="Insurance" component={InsuranceScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />
      <Stack.Screen name="HealthInfo" component={HealthInfoScreen} />
    </Stack.Navigator>
  );
}
