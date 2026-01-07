/**
 * StatusBadge Component
 * Healthcare-grade status badges with platform-specific polish
 *
 * Design specs:
 * - Soft, muted backgrounds
 * - No harsh colors
 * - WCAG AA compliant contrast
 */

import React from 'react';
import { View, Text, StyleSheet, Platform, ViewStyle } from 'react-native';
import { AppIcon, IconName } from '../icons';
import { colors, spacing, radius } from '../../theme';

// Badge type configuration
export type BadgeType =
  | 'available'
  | 'popular'
  | 'verified'
  | '24/7'
  | 'free-delivery'
  | 'certified'
  | 'training'
  | 'setup'
  | 'discount'
  | 'new'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

type BadgeConfig = {
  backgroundColor: string;
  textColor: string;
  icon?: IconName;
  iconSize?: number;
};

const BADGE_CONFIGS: Record<BadgeType, BadgeConfig> = {
  available: {
    backgroundColor: '#DCFCE7',
    textColor: '#15803D',
    icon: 'check-circle',
    iconSize: 10,
  },
  popular: {
    backgroundColor: '#DBEAFE',
    textColor: '#1D4ED8',
    icon: 'star-filled',
    iconSize: 10,
  },
  verified: {
    backgroundColor: '#CCFBF1',
    textColor: '#0D9488',
    icon: 'shield-check',
    iconSize: 10,
  },
  '24/7': {
    backgroundColor: '#FCE7F3',
    textColor: '#BE185D',
    icon: 'clock',
    iconSize: 10,
  },
  'free-delivery': {
    backgroundColor: '#DBEAFE',
    textColor: '#1D4ED8',
    icon: 'flash',
    iconSize: 10,
  },
  certified: {
    backgroundColor: '#DCFCE7',
    textColor: '#15803D',
    icon: 'check',
    iconSize: 10,
  },
  training: {
    backgroundColor: '#FEF3C7',
    textColor: '#B45309',
  },
  setup: {
    backgroundColor: '#EDE9FE',
    textColor: '#7C3AED',
  },
  discount: {
    backgroundColor: '#16A34A',
    textColor: '#FFFFFF',
  },
  new: {
    backgroundColor: '#EDE9FE',
    textColor: '#7C3AED',
  },
  info: {
    backgroundColor: '#DBEAFE',
    textColor: '#1D4ED8',
  },
  success: {
    backgroundColor: '#DCFCE7',
    textColor: '#15803D',
  },
  warning: {
    backgroundColor: '#FEF3C7',
    textColor: '#B45309',
  },
  error: {
    backgroundColor: '#FEE2E2',
    textColor: '#DC2626',
  },
};

interface StatusBadgeProps {
  type: BadgeType;
  label: string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  style?: ViewStyle;
}

export function StatusBadge({
  type,
  label,
  size = 'sm',
  showIcon = false,
  style,
}: StatusBadgeProps) {
  const config = BADGE_CONFIGS[type];
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        isSmall ? styles.badgeSm : styles.badgeMd,
        { backgroundColor: config.backgroundColor },
        Platform.OS === 'ios' && styles.badgeIOS,
        Platform.OS === 'android' && styles.badgeAndroid,
        style,
      ]}
    >
      {showIcon && config.icon && (
        <AppIcon
          name={config.icon}
          size={config.iconSize || 10}
          color={config.textColor}
          fillOpacity={0.2}
        />
      )}
      <Text
        style={[
          styles.label,
          isSmall ? styles.labelSm : styles.labelMd,
          { color: config.textColor },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

// Inline dot badge (smaller, simpler)
interface DotBadgeProps {
  type: BadgeType;
  label: string;
  style?: ViewStyle;
}

export function DotBadge({ type, label, style }: DotBadgeProps) {
  const config = BADGE_CONFIGS[type];

  return (
    <View style={[styles.dotBadge, { backgroundColor: `${config.textColor}10` }, style]}>
      <View style={[styles.dot, { backgroundColor: config.textColor }]} />
      <Text style={[styles.dotLabel, { color: config.textColor }]}>{label}</Text>
    </View>
  );
}

// Discount badge (positioned absolutely)
interface DiscountBadgeProps {
  percent: number;
  style?: ViewStyle;
}

export function DiscountBadge({ percent, style }: DiscountBadgeProps) {
  return (
    <View
      style={[
        styles.discountBadge,
        Platform.OS === 'ios' && styles.discountBadgeIOS,
        Platform.OS === 'android' && styles.discountBadgeAndroid,
        style,
      ]}
    >
      <Text style={styles.discountText}>{percent}% OFF</Text>
    </View>
  );
}

// Popular badge (positioned absolutely with star)
interface PopularBadgeProps {
  style?: ViewStyle;
}

export function PopularBadge({ style }: PopularBadgeProps) {
  return (
    <View
      style={[
        styles.popularBadge,
        Platform.OS === 'ios' && styles.popularBadgeIOS,
        Platform.OS === 'android' && styles.popularBadgeAndroid,
        style,
      ]}
    >
      <AppIcon name="star-filled" size={10} color="#FFFFFF" fillOpacity={1} />
      <Text style={styles.popularText}>Popular</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Base badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeMd: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeIOS: {
    // Slightly softer on iOS
  },
  badgeAndroid: {
    // Slightly firmer on Android
  },

  // Badge label
  label: {
    fontWeight: '600',
  },
  labelSm: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
  labelMd: {
    fontSize: 11,
    letterSpacing: 0.1,
  },

  // Dot badge
  dotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotLabel: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Discount badge
  discountBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    backgroundColor: '#16A34A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountBadgeIOS: {
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  discountBadgeAndroid: {
    elevation: 2,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // Popular badge
  popularBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
    backgroundColor: '#F97316',
  },
  popularBadgeIOS: {
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  popularBadgeAndroid: {
    elevation: 2,
  },
  popularText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
});
