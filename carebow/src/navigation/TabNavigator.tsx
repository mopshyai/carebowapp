/**
 * Tab Navigator
 * Bottom navigation with Home, Ask AI, and Messages tabs
 * Compact, centered design
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import type { MainTabParamList } from './types';
import { colors } from '../theme';

// Screen imports
import HomeScreen from '../screens/tabs/HomeScreen';
import AskScreen from '../screens/tabs/AskScreen';
import MessagesScreen from '../screens/tabs/MessagesScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Custom Tab Bar Component for better control over spacing
function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
      <View style={styles.tabBarInner}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.title || route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Icon rendering
          let iconName = 'home-outline';
          let iconSize = 24;
          let showCircle = false;

          if (route.name === 'Home') {
            iconName = isFocused ? 'home' : 'home-outline';
          } else if (route.name === 'Ask') {
            iconName = 'sparkles';
            iconSize = 20;
            showCircle = true;
          } else if (route.name === 'Messages') {
            iconName = isFocused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
          }

          const iconColor = isFocused ? colors.accent : colors.textTertiary;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              {showCircle ? (
                <View style={[styles.askIconWrap, isFocused && styles.askIconWrapActive]}>
                  <Icon
                    name={iconName}
                    size={iconSize}
                    color={isFocused ? colors.white : iconColor}
                  />
                </View>
              ) : (
                <Icon name={iconName} size={iconSize} color={iconColor} />
              )}
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="Ask"
        component={AskScreen}
        options={{ title: 'Ask AI' }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{ title: 'Messages' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  tabBarInner: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
    paddingBottom: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textTertiary,
    marginTop: 4,
  },
  tabLabelActive: {
    color: colors.accent,
  },
  askIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  askIconWrapActive: {
    backgroundColor: colors.accent,
  },
});
