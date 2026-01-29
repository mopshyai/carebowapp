/**
 * FormInput Component
 * Text input with validation error display and accessibility
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
  AccessibilityInfo,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography } from '../../theme';

// ============================================
// TYPES
// ============================================

export interface FormInputProps extends Omit<TextInputProps, 'style'> {
  /** Field label */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text shown below input */
  helperText?: string;
  /** Left icon name */
  leftIcon?: string;
  /** Right icon name */
  rightIcon?: string;
  /** Callback when right icon is pressed */
  onRightIconPress?: () => void;
  /** Whether field is required */
  required?: boolean;
  /** Whether field is disabled */
  disabled?: boolean;
  /** Input container style */
  containerStyle?: ViewStyle;
  /** Character counter (shows X/max) */
  showCharacterCount?: boolean;
  /** Success state */
  isSuccess?: boolean;
  /** Success message */
  successMessage?: string;
}

// ============================================
// COMPONENT
// ============================================

export function FormInput({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  required = false,
  disabled = false,
  containerStyle,
  showCharacterCount = false,
  maxLength,
  isSuccess = false,
  successMessage,
  value,
  onFocus,
  onBlur,
  secureTextEntry,
  ...textInputProps
}: FormInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const errorAnimation = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  // Animate error appearance
  useEffect(() => {
    Animated.timing(errorAnimation, {
      toValue: error ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [error, errorAnimation]);

  // Announce errors to screen readers
  useEffect(() => {
    if (error) {
      AccessibilityInfo.announceForAccessibility(`Error: ${error}`);
    }
  }, [error]);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  // Determine border color
  const getBorderColor = () => {
    if (error) return colors.error;
    if (isSuccess) return colors.success;
    if (isFocused) return colors.accent;
    return colors.border;
  };

  // Determine if using password visibility toggle
  const showPasswordToggle = secureTextEntry && !rightIcon;
  const actualSecureTextEntry = secureTextEntry && !isPasswordVisible;

  const characterCount = typeof value === 'string' ? value.length : 0;

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label */}
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, error && styles.labelError]}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>
      )}

      {/* Input Container */}
      <View
        style={[
          styles.inputContainer,
          { borderColor: getBorderColor() },
          isFocused && styles.inputContainerFocused,
          disabled && styles.inputContainerDisabled,
        ]}
      >
        {/* Left Icon */}
        {leftIcon && (
          <Icon
            name={leftIcon}
            size={20}
            color={error ? colors.error : colors.textTertiary}
            style={styles.leftIcon}
          />
        )}

        {/* Text Input */}
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || showPasswordToggle) && styles.inputWithRightIcon,
            disabled && styles.inputDisabled,
          ]}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          maxLength={maxLength}
          secureTextEntry={actualSecureTextEntry}
          placeholderTextColor={colors.textTertiary}
          selectionColor={colors.accent}
          accessibilityLabel={label}
          accessibilityHint={helperText}
          accessibilityState={{
            disabled,
            selected: isFocused,
          }}
          {...textInputProps}
        />

        {/* Right Icon / Password Toggle */}
        {showPasswordToggle ? (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.rightIconButton}
            accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
            accessibilityRole="button"
          >
            <Icon
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={20}
              color={colors.textTertiary}
            />
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            style={styles.rightIconButton}
            accessibilityRole={onRightIconPress ? 'button' : 'none'}
          >
            <Icon
              name={rightIcon}
              size={20}
              color={error ? colors.error : colors.textTertiary}
            />
          </TouchableOpacity>
        ) : null}

        {/* Success Icon */}
        {isSuccess && !error && !rightIcon && !showPasswordToggle && (
          <Icon
            name="checkmark-circle"
            size={20}
            color={colors.success}
            style={styles.successIcon}
          />
        )}
      </View>

      {/* Error / Helper / Success Row */}
      <View style={styles.bottomRow}>
        <View style={styles.messageContainer}>
          {/* Error Message */}
          {error && (
            <Animated.View
              style={[
                styles.errorContainer,
                {
                  opacity: errorAnimation,
                  transform: [
                    {
                      translateY: errorAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-4, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Icon name="alert-circle" size={14} color={colors.error} />
              <Text style={styles.errorText} accessibilityRole="alert">
                {error}
              </Text>
            </Animated.View>
          )}

          {/* Success Message */}
          {!error && isSuccess && successMessage && (
            <View style={styles.successContainer}>
              <Icon name="checkmark-circle" size={14} color={colors.success} />
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          )}

          {/* Helper Text */}
          {!error && !successMessage && helperText && (
            <Text style={styles.helperText}>{helperText}</Text>
          )}
        </View>

        {/* Character Count */}
        {showCharacterCount && maxLength && (
          <Text
            style={[
              styles.characterCount,
              characterCount >= maxLength && styles.characterCountMax,
            ]}
          >
            {characterCount}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
  },
  labelError: {
    color: colors.error,
  },
  required: {
    color: colors.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    minHeight: 48,
  },
  inputContainerFocused: {
    borderWidth: 2,
    backgroundColor: colors.background,
  },
  inputContainerDisabled: {
    backgroundColor: colors.surface2,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  inputDisabled: {
    color: colors.textTertiary,
  },
  leftIcon: {
    marginLeft: spacing.md,
    marginRight: spacing.xs,
  },
  rightIconButton: {
    padding: spacing.md,
  },
  successIcon: {
    marginRight: spacing.md,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: spacing.xxs,
    minHeight: 18,
  },
  messageContainer: {
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    flex: 1,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  successText: {
    ...typography.caption,
    color: colors.success,
  },
  helperText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  characterCount: {
    ...typography.caption,
    color: colors.textTertiary,
    marginLeft: spacing.sm,
  },
  characterCountMax: {
    color: colors.error,
  },
});

export default FormInput;
