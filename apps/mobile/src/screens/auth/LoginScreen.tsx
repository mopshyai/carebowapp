/**
 * Login Screen
 * Email/password login form
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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';
import { CareBowLogo } from '@/components/icons/CareBowLogo';
import { colors, typography, spacing, radius, shadows } from '@/theme';
import { USER_TYPES, useAuthStore } from '@/store/useAuthStore';
import type { AuthStackParamList } from '@/navigation/types';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const {
    login,
    chooseLoginProfile,
    cancelProfileSelection,
    availableProfiles,
    isLoading,
    error,
    clearError,
  } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

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

  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError('Password is required');
      return false;
    }
    if (value.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleLogin = async () => {
    clearError();

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    await login(email, password);
    // Navigation will be handled by RootNavigator based on auth state
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Modal
        visible={availableProfiles.length > 0}
        transparent
        animationType="slide"
        onRequestClose={cancelProfileSelection}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.profileSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.profileSheetHeader}>
              <View>
                <Text style={styles.profileSheetTitle}>Choose how to sign in</Text>
                <Text style={styles.profileSheetSubtitle}>
                  This email has more than one CareBow profile.
                </Text>
              </View>
              <Pressable
                style={styles.closeButton}
                onPress={cancelProfileSelection}
                accessibilityRole="button"
                accessibilityLabel="Close profile chooser"
              >
                <Icon name="x" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.profileOptions}>
              {availableProfiles.map((profile) => {
                const type = USER_TYPES.find((item) => item.slug === profile.userTypeSlug);
                return (
                  <Pressable
                    key={profile.userTypeSlug}
                    style={({ pressed }) => [
                      styles.profileOption,
                      pressed && styles.profileOptionPressed,
                    ]}
                    onPress={() => chooseLoginProfile(profile.userTypeSlug)}
                    disabled={isLoading}
                    accessibilityRole="button"
                    accessibilityLabel={`Continue as ${type?.title ?? profile.userTypeSlug}`}
                  >
                    <View style={styles.profileIcon}>
                      <Icon
                        name={profile.userTypeSlug === 'customer' ? 'heart' : 'briefcase'}
                        size={20}
                        color={colors.accent}
                      />
                    </View>
                    <View style={styles.profileOptionText}>
                      <Text style={styles.profileOptionTitle}>
                        {type?.title ?? profile.userTypeSlug}
                      </Text>
                      <Text style={styles.profileOptionDescription}>{type?.description}</Text>
                    </View>
                    {isLoading ? (
                      <ActivityIndicator size="small" color={colors.accent} />
                    ) : (
                      <Icon name="chevron-right" size={20} color={colors.textTertiary} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
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
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Icon name="arrow-left" size={24} color={colors.textPrimary} />
          </Pressable>

          <View style={styles.headerContainer}>
            <View style={styles.logoIcon}>
              <CareBowLogo size={48} />
            </View>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputContainer, emailError && styles.inputError]}>
                <Icon name="mail" size={20} color={colors.textTertiary} />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.textTertiary}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) validateEmail(text);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                />
              </View>
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputContainer, passwordError && styles.inputError]}>
                <Icon name="lock" size={20} color={colors.textTertiary} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textTertiary}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) validatePassword(text);
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                  <Icon
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={colors.textTertiary}
                  />
                </Pressable>
              </View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            </View>

            {/* Forgot Password */}
            <Pressable
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </Pressable>

            {/* API Error */}
            {error ? (
              <View style={styles.apiErrorContainer}>
                <Icon name="alert-circle" size={16} color={colors.error} />
                <Text style={styles.apiErrorText}>{error}</Text>
              </View>
            ) : null}

            {/* Login Button */}
            <Pressable
              style={({ pressed }) => [
                styles.loginButton,
                pressed && styles.buttonPressed,
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.textInverse} />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </Pressable>
          </View>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <Pressable onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>Sign up</Text>
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
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.48)',
  },
  profileSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  profileSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  profileSheetTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  profileSheetSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileOptions: {
    gap: spacing.sm,
  },
  profileOption: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  profileOptionPressed: {
    borderColor: colors.accent,
    backgroundColor: colors.accentMuted,
  },
  profileIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentMuted,
    marginRight: spacing.md,
  },
  profileOptionText: {
    flex: 1,
  },
  profileOptionTitle: {
    ...typography.label,
    color: colors.textPrimary,
  },
  profileOptionDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
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
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
  },
  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadows.card,
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

  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -spacing.xs,
  },
  forgotPasswordText: {
    ...typography.label,
    color: colors.accent,
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
  loginButton: {
    height: 56,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    ...shadows.button,
  },
  loginButtonText: {
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

  // Sign Up
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingTop: spacing.xxl,
  },
  signupText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  signupLink: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '600',
  },
});
