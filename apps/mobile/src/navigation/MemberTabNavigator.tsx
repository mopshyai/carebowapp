/**
 * MemberTabNavigator — bottom tabs for the 3 non-customer user types.
 *
 * Home (shared adaptive dashboard) + a type-specific work tab + Messages +
 * Profile. The work tab's variant is chosen from the authenticated userType.
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme';
import { useAuthStore } from '@/store/useAuthStore';
import MemberHomeScreen from '../screens/member/MemberHomeScreen';
import MemberListScreen, { MemberListVariant } from '../screens/member/MemberListScreen';
import MessagesScreen from '../screens/tabs/MessagesScreen';
import ProfileStackNavigator from './ProfileStackNavigator';

const Tab = createBottomTabNavigator();

// Which work-tab variant + label/icon each member type gets.
const WORK_TAB: Record<string, { variant: MemberListVariant; label: string; icon: string }> = {
  healthcare_provider: { variant: 'patients', label: 'Patients', icon: 'people-outline' },
  service_provider: { variant: 'assignments', label: 'Work', icon: 'briefcase-outline' },
  service_partner: { variant: 'tests', label: 'Orders', icon: 'flask-outline' },
};

export default function MemberTabNavigator() {
  const userType = useAuthStore((s) => s.userType);
  const work = WORK_TAB[userType] ?? WORK_TAB.service_provider;
  const WorkScreen = () => <MemberListScreen variant={work.variant} />;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: { borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={MemberHomeScreen}
        options={{ tabBarLabel: 'Home', tabBarIcon: ({ color, size }) => <Icon name="home-outline" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="Work"
        component={WorkScreen}
        options={{ tabBarLabel: work.label, tabBarIcon: ({ color, size }) => <Icon name={work.icon} size={size} color={color} /> }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{ tabBarLabel: 'Messages', tabBarIcon: ({ color, size }) => <Icon name="chatbubbles-outline" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{ tabBarLabel: 'Profile', tabBarIcon: ({ color, size }) => <Icon name="person-outline" size={size} color={color} /> }}
      />
    </Tab.Navigator>
  );
}
