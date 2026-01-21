/**
 * Input Component
 * Reusable text input with label, error, and helper text support
 */

import React, { useState, forwardRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  Pressable,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, typography, spacing, radius } from '@/theme';

// ============================================
// TYPES
// ============================================

export type InputType = 'text' | 'email' | 'password' | 'phone' | 'number';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  /** Input label */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text shown below input */
  helper?: string;
  /** Input type for keyboard and behavior */
  type?: InputType;
  /** Left icon (Feather icon name) */
  leftIcon?: string;
  /** Right icon (Feather icon name) */
  rightIcon?: string;
  /** Right icon press handler */
  onRightIconPress?: () => void;
  /** Disable input */
  disabled?: boolean;
  /** Required field indicator */
  required?: boolean;
  /** Container style */
  containerStyle?: ViewStyle;
  /** Input container style */
  inputContainerStyle?: ViewStyle;
}

// ============================================
// COMPONENT
// ============================================

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      helper,
      type = 'text',
      leftIcon,
      rightIcon,
      onRightIconPress,
      disabled = false,
      required = false,
      containerStyle,
      inputContainerStyle,
      value,
      onChangeText,
      placeholder,
      multiline,
      numberOfLines,
      maxLength,
      ...restProps
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const isPassword = type === 'password';
    const showPassword = isPassword && isPasswordVisible;

    // Determine keyboard type based on input type
    const getKeyboardType = (): TextInputProps['keyboardType'] => {
      switch (type) {
        case 'email':
          return 'email-address';
        case 'phone':
          return 'phone-pad';
        case 'number':
          return 'numeric';
        default:
          return 'default';
      }
    };

    // Determine auto-capitalize based on input type
    const getAutoCapitalize = (): TextInputProps['autoCapitalize'] => {
      switch (type) {
        case 'email':
        case 'password':
          return 'none';
        default:
          return 'sentences';
      }
    };

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    const togglePasswordVisibility = () => {
      setIsPasswordVisible(!isPasswordVisible);
    };

    const hasError = !!error;
    const showHelper = !hasError && !!helper;

    return (
      <View style={[styles.container, containerStyle]}>
        {/* Label */}
        {label && (
          <View style={styles.labelContainer}>
            <Text style={styles.label}>{label}</Text>
            {required && <Text style={styles.required}>*</Text>}
          </View>
        )}

        {/* Input Container */}
        <View
          style={[
            styles.inputContainer,
            multiline && styles.inputContainerMultiline,
            isFocused && styles.inputContainerFocused,
            hasError && styles.inputContainerError,
            disabled && styles.inputContainerDisabled,
            inputContainerStyle,
          ]}
        >
          {/* Left Icon */}
          {leftIcon && (
            <Icon
              name={leftIcon}
              size={20}
              color={hasError ? colors.error : colors.textTertiary}
              style={styles.leftIcon}
            />
          )}

          {/* Text Input */}
          <TextInput
            ref={ref}
            style={[
              styles.input,
              multiline && styles.inputMultiline,
              disabled && styles.inputDisabled,
            ]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textTertiary}
            keyboardType={getKeyboardType()}
            autoCapitalize={getAutoCapitalize()}
            autoCorrect={type !== 'email' && type !== 'password'}
            secureTextEntry={isPassword && !showPassword}
            editable={!disabled}
            multiline={multiline}
            numberOfLines={numberOfLines}
            maxLength={maxLength}
            onFocus={handleFocus}
            onBlur={handleBlur}
            accessible={true}
            accessibilityLabel={label ? `${label}${required ? ', required' : ''}${hasError ? `, error: ${error}` : ''}` : placeholder}
            accessibilityHint={helper}
            accessibilityState={{
              disabled,
            }}
            {...restProps}
          />

          {/* Right Icon / Password Toggle */}
          {isPassword ? (
            <Pressable
              onPress={togglePasswordVisibility}
              hitSlop={8}
              style={styles.rightIconButton}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              accessibilityHint="Double tap to toggle password visibility"
            >
              <Icon
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={colors.textTertiary}
              />
            </Pressable>
          ) : rightIcon ? (
            <Pressable
              onPress={onRightIconPress}
              hitSlop={8}
              style={styles.rightIconButton}
              disabled={!onRightIconPress}
              accessible={!!onRightIconPress}
              accessibilityRole="button"
            >
              <Icon
                name={rightIcon}
                size={20}
                color={colors.textTertiary}
              />
            </Pressable>
          ) : null}
        </View>

        {/* Character Count for multiline */}
        {multiline && maxLength && (
          <Text style={styles.charCount}>
            {value?.length || 0}/{maxLength}
          </Text>
        )}

        {/* Error Message */}
        {hasError && (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={14} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Helper Text */}
        {showHelper && <Text style={styles.helperText}>{helper}</Text>}
      </View>
    );
  }
);

Input.displayName = 'Input';

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  labelContainer: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
  },
  required: {
    ...typography.label,
    color: colors.error,
    marginLeft: spacing.xxs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputContainerMultiline: {
    height: 'auto',
    minHeight: 100,
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  inputContainerFocused: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  inputContainerDisabled: {
    backgroundColor: colors.borderLight,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  inputMultiline: {
    textAlignVertical: 'top',
    paddingTop: 0,
  },
  inputDisabled: {
    color: colors.textTertiary,
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  rightIconButton: {
    marginLeft: spacing.sm,
    padding: spacing.xxs,
  },
  charCount: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'right',
    marginTop: spacing.xxs,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xxs,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    flex: 1,
  },
  helperText: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
});

export default Input;
