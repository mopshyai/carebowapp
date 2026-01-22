/**
 * Signup Screen
 * User registration form
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

type SignupScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Signup'>;

export default function SignupScreen() {
  const navigation = useNavigation<SignupScreenNavigationProp>();
  const { signup, isLoading, error, clearError } = useAuthStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

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

  const handleSignup = async () => {
    clearError();

    if (!validateForm()) {
      return;
    }

    const success = await signup({
      email,
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });

    if (success) {
      navigation.navigate('VerifyEmail', { email });
    }
  };

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
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>
              Join CareBow to manage your family's health
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Name Row */}
            <View style={styles.nameRow}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>First name</Text>
                <View style={[
                  styles.inputContainer,
                  errors.firstName && styles.inputError,
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="First"
                    placeholderTextColor={colors.textTertiary}
                    value={firstName}
                    onChangeText={(text) => {
                      setFirstName(text);
                      if (errors.firstName) {
                        setErrors(prev => ({ ...prev, firstName: undefined }));
                      }
                    }}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>
                {errors.firstName ? (
                  <Text style={styles.errorText}>{errors.firstName}</Text>
                ) : null}
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Last name</Text>
                <View style={[
                  styles.inputContainer,
                  errors.lastName && styles.inputError,
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Last"
                    placeholderTextColor={colors.textTertiary}
                    value={lastName}
                    onChangeText={(text) => {
                      setLastName(text);
                      if (errors.lastName) {
                        setErrors(prev => ({ ...prev, lastName: undefined }));
                      }
                    }}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>
                {errors.lastName ? (
                  <Text style={styles.errorText}>{errors.lastName}</Text>
                ) : null}
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={[
                styles.inputContainer,
                errors.email && styles.inputError,
              ]}>
                <Icon name="mail" size={20} color={colors.textTertiary} />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.textTertiary}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) {
                      setErrors(prev => ({ ...prev, email: undefined }));
                    }
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                />
              </View>
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
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

            {/* Terms */}
            <Text style={styles.termsText}>
              By creating an account, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>

            {/* Signup Button */}
            <Pressable
              style={({ pressed }) => [
                styles.signupButton,
                pressed && styles.buttonPressed,
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.textInverse} />
              ) : (
                <Text style={styles.signupButtonText}>Create Account</Text>
              )}
            </Pressable>
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Pressable onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign in</Text>
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
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },

  // Form
  formContainer: {
    gap: spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfWidth: {
    flex: 1,
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

  // Terms
  termsText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: colors.accent,
    fontWeight: '500',
  },

  // Button
  signupButton: {
    height: 56,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    ...shadows.button,
  },
  signupButtonText: {
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

  // Login
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingTop: spacing.xl,
  },
  loginText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  loginLink: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '600',
  },
});
