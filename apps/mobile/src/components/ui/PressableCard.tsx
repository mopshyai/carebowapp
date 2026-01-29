/**
 * PressableCard Component
 * Healthcare-grade pressable card with platform-specific feedback
 *
 * Design specs:
 * - Press: scale to 0.97 on iOS, opacity 0.9 on Android
 * - No bounce, no flashy animations
 * - Calm and intentional feel
 */

import React, { useRef } from 'react';
import {
  Pressable,
  Animated,
  StyleSheet,
  Platform,
  ViewStyle,
  PressableProps,
} from 'react-native';
import { colors, shadows, radius } from '../../theme';

interface PressableCardProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'flat';
  disabled?: boolean;
}

export function PressableCard({
  children,
  style,
  variant = 'default',
  disabled = false,
  onPress,
  ...props
}: PressableCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;

    if (Platform.OS === 'ios') {
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        useNativeDriver: true,
        friction: 10,
        tension: 100,
      }).start();
    } else {
      Animated.timing(opacityAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (disabled) return;

    if (Platform.OS === 'ios') {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 10,
        tension: 100,
      }).start();
    } else {
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  };

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          ...styles.card,
          ...(Platform.OS === 'ios' ? shadows.cardElevated : { elevation: 4 }),
        };
      case 'flat':
        return {
          ...styles.card,
          ...shadows.none,
          borderWidth: 1,
          borderColor: colors.border,
        };
      default:
        return styles.card;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      {...props}
    >
      <Animated.View
        style={[
          getVariantStyles(),
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
          disabled && styles.disabled,
          style,
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

// Compact pressable for grid items
interface PressableGridItemProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  style?: ViewStyle;
  width?: number | 'auto' | '50%';
}

export function PressableGridItem({
  children,
  style,
  width = 'auto',
  onPress,
  ...props
}: PressableGridItemProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (Platform.OS === 'ios') {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        friction: 10,
        tension: 100,
      }).start();
    } else {
      Animated.timing(opacityAnim, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (Platform.OS === 'ios') {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 10,
        tension: 100,
      }).start();
    } else {
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...props}
    >
      <Animated.View
        style={[
          styles.gridItem,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
            width: typeof width === 'number' ? width : undefined,
            flex: width === '50%' ? undefined : undefined,
          },
          style,
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

// Horizontal scroll item pressable
interface PressableScrollItemProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  style?: ViewStyle;
  width: number;
}

export function PressableScrollItem({
  children,
  style,
  width,
  onPress,
  ...props
}: PressableScrollItemProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      friction: 10,
      tension: 100,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 10,
      tension: 100,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...props}
    >
      <Animated.View
        style={[
          styles.scrollItem,
          { width, transform: [{ scale: scaleAnim }] },
          style,
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  disabled: {
    opacity: 0.6,
  },
  gridItem: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  scrollItem: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
});
