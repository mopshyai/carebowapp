/**
 * Reset Password Screen
 * Set new password after email verification
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';
import { colors, typography, spacing, radius, shadows } from '@/theme';
import { useAuthStore } from '@/store/useAuthStore';
import type { AuthStackParamList } from '@/navigation/types';

type ResetPasswordScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ResetPassword'>;
type ResetPasswordScreenRouteProp = RouteProp<AuthStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen() {
  const navigation = useNavigation<ResetPasswordScreenNavigationProp>();
  const route = useRoute<ResetPasswordScreenRouteProp>();
  const { resetPassword, isLoading, error, clearError } = useAuthStore();

  const token = route.params?.token || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    clearError();

    if (!validateForm()) {
      return;
    }

    const success = await resetPassword(token, password);
    if (success) {
      setIsSuccess(true);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: '', color: colors.border };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    const labels = ['Weak', 'Fair', 'Good', 'Strong'];
    const colorsList = [colors.error, colors.warning, colors.info, colors.success];

    return {
      strength,
      label: labels[strength - 1] || '',
      color: colorsList[strength - 1] || colors.border,
    };
  };

  const passwordStrength = getPasswordStrength();

  if (isSuccess) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <Icon name="check-circle" size={48} color={colors.success} />
          </View>
          <Text style={styles.successTitle}>Password reset!</Text>
          <Text style={styles.successText}>
            Your password has been successfully reset.{'\n'}
            You can now sign in with your new password.
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.signInButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color={colors.textPrimary} />
          </Pressable>

          <View style={styles.headerContainer}>
            <View style={styles.iconContainer}>
              <Icon name="key" size={32} color={colors.accent} />
            </View>
            <Text style={styles.title}>Set new password</Text>
            <Text style={styles.subtitle}>
              Create a strong password for your account
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New password</Text>
              <View style={[
                styles.inputContainer,
                errors.password && styles.inputError,
              ]}>
                <Icon name="lock" size={20} color={colors.textTertiary} />
                <TextInput
                  style={styles.input}
                  placeholder="Min. 8 characters"
                  placeholderTextColor={colors.textTertiary}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) {
                      setErrors(prev => ({ ...prev, password: undefined }));
                    }
                    clearError();
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={8}
                >
                  <Icon
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={colors.textTertiary}
                  />
                </Pressable>
              </View>
              {errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : password ? (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBar}>
                    {[1, 2, 3, 4].map((level) => (
                      <View
                        key={level}
                        style={[
                          styles.strengthSegment,
                          {
                            backgroundColor:
                              level <= passwordStrength.strength
                                ? passwordStrength.color
                                : colors.border,
                          },
                        ]}
                      />
                    ))}
                  </View>
                  {passwordStrength.label ? (
                    <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>
                      {passwordStrength.label}
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm password</Text>
              <View style={[
                styles.inputContainer,
                errors.confirmPassword && styles.inputError,
              ]}>
                <Icon name="lock" size={20} color={colors.textTertiary} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  placeholderTextColor={colors.textTertiary}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) {
                      setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                    }
                    clearError();
                  }}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  hitSlop={8}
                >
                  <Icon
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={colors.textTertiary}
                  />
                </Pressable>
              </View>
              {errors.confirmPassword ? (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              ) : null}
            </View>

            {/* API Error */}
            {error ? (
              <View style={styles.apiErrorContainer}>
                <Icon name="alert-circle" size={16} color={colors.error} />
                <Text style={styles.apiErrorText}>{error}</Text>
              </View>
            ) : null}

            {/* Submit Button */}
            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                pressed && styles.buttonPressed,
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.textInverse} />
              ) : (
                <Text style={styles.submitButtonText}>Reset Password</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },

  // Header
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -spacing.sm,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Form
  formContainer: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
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
    gap: spacing.sm,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
  },

  // Password Strength
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  strengthBar: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xxs,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    ...typography.caption,
    fontWeight: '500',
  },

  // API Error
  apiErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    backgroundColor: colors.errorSoft,
    borderRadius: radius.sm,
  },
  apiErrorText: {
    ...typography.bodySmall,
    color: colors.error,
    flex: 1,
  },

  // Button
  submitButton: {
    height: 56,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    ...shadows.button,
  },
  submitButtonText: {
    ...typography.labelLarge,
    color: colors.textInverse,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.7,
  },

  // Success State
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  successIconContainer: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    backgroundColor: colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  successTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  successText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  signInButton: {
    height: 56,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    marginTop: spacing.xxl,
    ...shadows.button,
  },
  signInButtonText: {
    ...typography.labelLarge,
    color: colors.textInverse,
    fontWeight: '600',
  },
});
