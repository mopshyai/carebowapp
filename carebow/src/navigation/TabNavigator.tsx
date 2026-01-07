/**
 * Tab Navigator
 * Premium healthcare bottom navigation with custom SVG icons
 * Platform-specific polish for iOS and Android
 */

import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
  Animated,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MainTabParamList } from './types';
import { colors, shadows } from '../theme';
import { AppIcon, IconName } from '../components/icons';

// Screen imports
import HomeScreen from '../screens/tabs/HomeScreen';
import AskScreen from '../screens/tabs/AskScreen';
import MessagesScreen from '../screens/tabs/MessagesScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab configuration with icon mapping
const TAB_CONFIG: Record<string, {
  icon: IconName;
  iconFilled: IconName;
  label: string;
  isSpecial?: boolean;
  specialColor?: string;
}> = {
  Home: {
    icon: 'home',
    iconFilled: 'home-filled',
    label: 'Home',
  },
  Ask: {
    icon: 'sparkles',
    iconFilled: 'sparkles',
    label: 'Ask AI',
    isSpecial: true,
    specialColor: '#8B5CF6',
  },
  Messages: {
    icon: 'messages',
    iconFilled: 'messages-filled',
    label: 'Messages',
  },
};

// Animated tab button for press feedback
function TabButton({
  onPress,
  isFocused,
  routeName,
}: {
  onPress: () => void;
  isFocused: boolean;
  routeName: string;
}) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const config = TAB_CONFIG[routeName];

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  };

  const iconName = isFocused ? config.iconFilled : config.icon;
  const iconColor = config.isSpecial
    ? (isFocused ? '#FFFFFF' : config.specialColor!)
    : (isFocused ? colors.accent : colors.textTertiary);
  const iconSize = config.isSpecial ? 20 : 22;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={config.label}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabItem}
      activeOpacity={1}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        {config.isSpecial ? (
          <View style={[
            styles.specialIconWrap,
            isFocused && styles.specialIconWrapActive,
            Platform.OS === 'ios' && styles.specialIconWrapIOS,
            Platform.OS === 'android' && styles.specialIconWrapAndroid,
          ]}>
            <AppIcon
              name={iconName}
              size={iconSize}
              color={iconColor}
              fillOpacity={isFocused ? 0.3 : 0.15}
            />
          </View>
        ) : (
          <View style={styles.iconWrap}>
            <AppIcon
              name={iconName}
              size={iconSize}
              color={iconColor}
              fillOpacity={isFocused ? 0.2 : 0}
            />
          </View>
        )}
      </Animated.View>
      <Text style={[
        styles.tabLabel,
        isFocused && styles.tabLabelActive,
        config.isSpecial && isFocused && { color: config.specialColor },
      ]}>
        {config.label}
      </Text>
    </TouchableOpacity>
  );
}

// Custom Tab Bar Component with platform-specific styling
function CustomTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.tabBar,
      Platform.OS === 'ios' && styles.tabBarIOS,
      Platform.OS === 'android' && styles.tabBarAndroid,
      { paddingBottom: Math.max(insets.bottom, 8) },
    ]}>
      <View style={styles.tabBarInner}>
        {state.routes.map((route: any, index: number) => {
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

          return (
            <TabButton
              key={route.key}
              onPress={onPress}
              isFocused={isFocused}
              routeName={route.name}
            />
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
  // Tab Bar Container
  tabBar: {
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  tabBarIOS: {
    ...shadows.tabBar,
    borderTopWidth: 0,
    shadowOpacity: 0.08,
  },
  tabBarAndroid: {
    elevation: 8,
    borderTopWidth: 1,
  },

  // Tab Bar Inner Container
  tabBarInner: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 36,
    paddingBottom: 6,
  },

  // Individual Tab Item
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    minWidth: 64,
  },

  // Regular Icon Wrapper
  iconWrap: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Special (Ask AI) Icon Wrapper
  specialIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  specialIconWrapActive: {
    backgroundColor: '#8B5CF6',
  },
  specialIconWrapIOS: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  specialIconWrapAndroid: {
    elevation: 2,
  },

  // Tab Labels
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textTertiary,
    marginTop: 4,
    letterSpacing: 0.1,
  },
  tabLabelActive: {
    color: colors.accent,
    fontWeight: '600',
  },
});
