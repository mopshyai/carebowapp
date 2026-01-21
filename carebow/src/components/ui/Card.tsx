/**
 * Card Component
 * Reusable card container with variants
 */

import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  ViewStyle,
  PressableProps,
} from 'react-native';
import { colors, spacing, radius, shadows } from '@/theme';

// ============================================
// TYPES
// ============================================

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'flat';
export type CardPadding = 'none' | 'small' | 'medium' | 'large';

export interface CardProps {
  /** Card content */
  children: React.ReactNode;
  /** Visual variant */
  variant?: CardVariant;
  /** Internal padding */
  padding?: CardPadding;
  /** Press handler - makes card interactive */
  onPress?: () => void;
  /** Long press handler */
  onLongPress?: () => void;
  /** Disable interaction */
  disabled?: boolean;
  /** Additional style */
  style?: ViewStyle;
  /** Test ID */
  testID?: string;
  /** Accessibility label for screen readers */
  accessibilityLabel?: string;
  /** Accessibility hint for screen readers */
  accessibilityHint?: string;
}

// ============================================
// COMPONENT
// ============================================

export function Card({
  children,
  variant = 'default',
  padding = 'medium',
  onPress,
  onLongPress,
  disabled = false,
  style,
  testID,
  accessibilityLabel,
  accessibilityHint,
}: CardProps) {
  const variantStyle = getVariantStyle(variant);
  const paddingStyle = getPaddingStyle(padding);

  const containerStyle = [
    styles.base,
    variantStyle,
    paddingStyle,
    disabled && styles.disabled,
    style,
  ];

  // If interactive, wrap in Pressable
  if (onPress || onLongPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          ...containerStyle,
          pressed && !disabled && styles.pressed,
        ]}
        onPress={onPress}
        onLongPress={onLongPress}
        disabled={disabled}
        testID={testID}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled }}
      >
        {children}
      </Pressable>
    );
  }

  // Non-interactive card
  return (
    <View style={containerStyle} testID={testID}>
      {children}
    </View>
  );
}

// ============================================
// VARIANT STYLES
// ============================================

function getVariantStyle(variant: CardVariant): ViewStyle {
  const variants: Record<CardVariant, ViewStyle> = {
    default: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      ...shadows.card,
    },
    elevated: {
      backgroundColor: colors.surface,
      ...shadows.cardElevated,
    },
    outlined: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.border,
    },
    flat: {
      backgroundColor: colors.surface2,
    },
  };

  return variants[variant];
}

// ============================================
// PADDING STYLES
// ============================================

function getPaddingStyle(padding: CardPadding): ViewStyle {
  const paddings: Record<CardPadding, ViewStyle> = {
    none: {
      padding: 0,
    },
    small: {
      padding: spacing.sm,
    },
    medium: {
      padding: spacing.md,
    },
    large: {
      padding: spacing.lg,
    },
  };

  return paddings[padding];
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.5,
  },
});

// ============================================
// CARD HEADER & FOOTER SUBCOMPONENTS
// ============================================

interface CardSectionProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardHeader({ children, style }: CardSectionProps) {
  return (
    <View style={[cardSectionStyles.header, style]}>
      {children}
    </View>
  );
}

export function CardBody({ children, style }: CardSectionProps) {
  return (
    <View style={[cardSectionStyles.body, style]}>
      {children}
    </View>
  );
}

export function CardFooter({ children, style }: CardSectionProps) {
  return (
    <View style={[cardSectionStyles.footer, style]}>
      {children}
    </View>
  );
}

const cardSectionStyles = StyleSheet.create({
  header: {
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    marginBottom: spacing.sm,
  },
  body: {
    // Default body styling
  },
  footer: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    marginTop: spacing.sm,
  },
});

export default Card;
