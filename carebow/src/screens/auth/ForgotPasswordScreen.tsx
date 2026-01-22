/**
 * Forgot Password Screen
 * Request password reset email
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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';
import { colors, typography, spacing, radius, shadows } from '@/theme';
import { useAuthStore } from '@/store/useAuthStore';
import type { AuthStackParamList } from '@/navigation/types';

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const { requestPasswordReset, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = async () => {
    clearError();

    if (!validateEmail(email)) {
      return;
    }

    const success = await requestPasswordReset(email);
    if (success) {
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color={colors.textPrimary} />
          </Pressable>

          <View style={styles.successContainer}>
            <View style={styles.successIconContainer}>
              <Icon name="check-circle" size={48} color={colors.success} />
            </View>
            <Text style={styles.successTitle}>Check your email</Text>
            <Text style={styles.successText}>
              We've sent password reset instructions to{'\n'}
              <Text style={styles.emailText}>{email}</Text>
            </Text>
            <Text style={styles.successHint}>
              If you don't see the email, check your spam folder.
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.backToLoginButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.backToLoginText}>Back to Sign In</Text>
            </Pressable>

            <Pressable
              style={styles.resendButton}
              onPress={() => {
                setIsSubmitted(false);
                handleSubmit();
              }}
              disabled={isLoading}
            >
              <Text style={styles.resendText}>
                Didn't receive it? <Text style={styles.resendLink}>Resend</Text>
              </Text>
            </Pressable>
          </View>
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
              <Icon name="lock" size={32} color={colors.accent} />
            </View>
            <Text style={styles.title}>Forgot password?</Text>
            <Text style={styles.subtitle}>
              No worries, we'll send you reset instructions.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={[
                styles.inputContainer,
                emailError && styles.inputError,
              ]}>
                <Icon name="mail" size={20} color={colors.textTertiary} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.textTertiary}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) validateEmail(text);
                    clearError();
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  autoFocus
                />
              </View>
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
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

          {/* Back to Login */}
          <Pressable
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Icon name="arrow-left" size={16} color={colors.textSecondary} />
            <Text style={styles.loginLinkText}>Back to Sign In</Text>
          </Pressable>
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
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
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

  // Login Link
  loginLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xxl,
  },
  loginLinkText: {
    ...typography.label,
    color: colors.textSecondary,
  },

  // Success State
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
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
  emailText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  successHint: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  backToLoginButton: {
    height: 56,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    marginTop: spacing.xxl,
    ...shadows.button,
  },
  backToLoginText: {
    ...typography.labelLarge,
    color: colors.textInverse,
    fontWeight: '600',
  },
  resendButton: {
    marginTop: spacing.lg,
  },
  resendText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  resendLink: {
    color: colors.accent,
    fontWeight: '600',
  },
});
