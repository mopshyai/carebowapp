/**
 * IconContainer Component
 * Healthcare-grade icon container with platform-specific polish
 *
 * Design specs:
 * - 44x44 touch target (default)
 * - Border radius: 12
 * - iOS: subtle shadow
 * - Android: elevation
 */

import React from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';

export type IconContainerSize = 'sm' | 'md' | 'lg' | 'xl';
export type IconContainerVariant = 'filled' | 'soft' | 'outline' | 'ghost';

interface IconContainerProps {
  children: React.ReactNode;
  size?: IconContainerSize;
  variant?: IconContainerVariant;
  backgroundColor?: string;
  borderColor?: string;
  style?: ViewStyle;
  // Platform polish
  withShadow?: boolean;
}

const SIZES: Record<IconContainerSize, { container: number; icon: number }> = {
  sm: { container: 32, icon: 16 },
  md: { container: 44, icon: 20 },
  lg: { container: 52, icon: 24 },
  xl: { container: 64, icon: 32 },
};

const BORDER_RADIUS: Record<IconContainerSize, number> = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 16,
};

export function IconContainer({
  children,
  size = 'md',
  variant = 'soft',
  backgroundColor,
  borderColor,
  style,
  withShadow = false,
}: IconContainerProps) {
  const dimensions = SIZES[size];
  const borderRadius = BORDER_RADIUS[size];

  const containerStyle: ViewStyle[] = [
    styles.container,
    {
      width: dimensions.container,
      height: dimensions.container,
      borderRadius,
    },
  ];

  // Variant styles
  switch (variant) {
    case 'filled':
      containerStyle.push({
        backgroundColor: backgroundColor || '#0D9488',
      });
      break;
    case 'soft':
      containerStyle.push({
        backgroundColor: backgroundColor || '#F0FDFA',
      });
      break;
    case 'outline':
      containerStyle.push({
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: borderColor || '#E2E8F0',
      });
      break;
    case 'ghost':
      containerStyle.push({
        backgroundColor: 'transparent',
      });
      break;
  }

  // Platform-specific shadow
  if (withShadow && variant !== 'ghost') {
    if (Platform.OS === 'ios') {
      containerStyle.push(styles.shadowIOS);
    } else {
      containerStyle.push(styles.shadowAndroid);
    }
  }

  if (style) {
    containerStyle.push(style);
  }

  return <View style={containerStyle}>{children}</View>;
}

// Helper to get icon size for a container size
export function getIconSizeForContainer(containerSize: IconContainerSize): number {
  return SIZES[containerSize].icon;
}

// Helper to get container dimensions
export function getContainerDimensions(containerSize: IconContainerSize) {
  return SIZES[containerSize];
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadowIOS: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  shadowAndroid: {
    elevation: 3,
  },
});

export default IconContainer;
