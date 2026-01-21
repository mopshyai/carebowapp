/**
 * Button Component
 * Reusable button with multiple variants, sizes, and states
 */

import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, typography, spacing, radius, shadows } from '@/theme';

// ============================================
// TYPES
// ============================================

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps {
  /** Button text */
  title: string;
  /** Press handler */
  onPress: () => void;
  /** Visual variant */
  variant?: ButtonVariant;
  /** Size preset */
  size?: ButtonSize;
  /** Disable interaction */
  disabled?: boolean;
  /** Show loading spinner */
  loading?: boolean;
  /** Icon name (Feather icons) */
  icon?: string;
  /** Icon position */
  iconPosition?: 'left' | 'right';
  /** Full width button */
  fullWidth?: boolean;
  /** Additional container style */
  style?: ViewStyle;
  /** Additional text style */
  textStyle?: TextStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// COMPONENT
// ============================================

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  testID,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  // Get variant styles
  const variantStyles = getVariantStyles(variant, isDisabled);
  const sizeStyles = getSizeStyles(size);

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={variantStyles.textColor}
        />
      );
    }

    const iconElement = icon ? (
      <Icon
        name={icon}
        size={sizeStyles.iconSize}
        color={variantStyles.textColor}
      />
    ) : null;

    return (
      <View style={styles.contentContainer}>
        {iconPosition === 'left' && iconElement}
        <Text
          style={[
            styles.text,
            sizeStyles.textStyle,
            { color: variantStyles.textColor },
            icon && iconPosition === 'left' && styles.textWithLeftIcon,
            icon && iconPosition === 'right' && styles.textWithRightIcon,
            textStyle,
          ]}
        >
          {title}
        </Text>
        {iconPosition === 'right' && iconElement}
      </View>
    );
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        sizeStyles.container,
        variantStyles.container,
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        pressed && !isDisabled && variantStyles.pressedContainer,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      accessibilityLabel={title}
    >
      {renderContent()}
    </Pressable>
  );
}

// ============================================
// VARIANT STYLES
// ============================================

interface VariantStyle {
  container: ViewStyle;
  pressedContainer: ViewStyle;
  textColor: string;
}

function getVariantStyles(variant: ButtonVariant, disabled: boolean): VariantStyle {
  const disabledOpacity = disabled ? 0.5 : 1;

  const variants: Record<ButtonVariant, VariantStyle> = {
    primary: {
      container: {
        backgroundColor: colors.accent,
        opacity: disabledOpacity,
        ...shadows.button,
      },
      pressedContainer: {
        backgroundColor: colors.accentDark,
      },
      textColor: colors.textInverse,
    },
    secondary: {
      container: {
        backgroundColor: colors.secondary,
        opacity: disabledOpacity,
      },
      pressedContainer: {
        opacity: 0.8,
      },
      textColor: colors.textInverse,
    },
    outline: {
      container: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: disabled ? colors.border : colors.accent,
        opacity: disabledOpacity,
      },
      pressedContainer: {
        backgroundColor: colors.accentMuted,
      },
      textColor: disabled ? colors.textTertiary : colors.accent,
    },
    ghost: {
      container: {
        backgroundColor: 'transparent',
        opacity: disabledOpacity,
      },
      pressedContainer: {
        backgroundColor: colors.surface2,
      },
      textColor: disabled ? colors.textTertiary : colors.accent,
    },
    danger: {
      container: {
        backgroundColor: colors.error,
        opacity: disabledOpacity,
      },
      pressedContainer: {
        opacity: 0.8,
      },
      textColor: colors.textInverse,
    },
  };

  return variants[variant];
}

// ============================================
// SIZE STYLES
// ============================================

interface SizeStyle {
  container: ViewStyle;
  textStyle: TextStyle;
  iconSize: number;
}

function getSizeStyles(size: ButtonSize): SizeStyle {
  const sizes: Record<ButtonSize, SizeStyle> = {
    small: {
      container: {
        height: 36,
        paddingHorizontal: spacing.md,
        borderRadius: radius.sm,
      },
      textStyle: {
        fontSize: 14,
        fontWeight: '500',
      },
      iconSize: 16,
    },
    medium: {
      container: {
        height: 44,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.md,
      },
      textStyle: {
        fontSize: 15,
        fontWeight: '600',
      },
      iconSize: 18,
    },
    large: {
      container: {
        height: 52,
        paddingHorizontal: spacing.xl,
        borderRadius: radius.md,
      },
      textStyle: {
        fontSize: 16,
        fontWeight: '600',
      },
      iconSize: 20,
    },
  };

  return sizes[size];
}

// ============================================
// BASE STYLES
// ============================================

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...typography.labelLarge,
  },
  textWithLeftIcon: {
    marginLeft: spacing.xs,
  },
  textWithRightIcon: {
    marginRight: spacing.xs,
  },
  fullWidth: {
    width: '100%',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});

export default Button;
