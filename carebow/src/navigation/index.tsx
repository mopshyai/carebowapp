/**
 * Root Navigator
 * Main navigation container with all screens
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';

// Navigators
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

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
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
      <Stack.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          animation: 'default',
        }}
      />
      <Stack.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{
          animation: 'default',
        }}
      />
      <Stack.Screen
        name="Thread"
        component={ThreadScreen}
        options={{
          animation: 'default',
        }}
      />
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
      <Stack.Screen
        name="Safety"
        component={SafetyStackNavigator}
        options={{
          animation: 'default',
        }}
      />
      <Stack.Screen
        name="Modal"
        component={ModalScreen}
        options={{
          presentation: 'modal',
          title: 'Modal',
        }}
      />
      <Stack.Screen
        name="HealthMemory"
        component={HealthMemoryScreen}
        options={{
          animation: 'default',
        }}
      />
      <Stack.Screen
        name="EpisodeSummary"
        component={EpisodeSummaryScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
}
