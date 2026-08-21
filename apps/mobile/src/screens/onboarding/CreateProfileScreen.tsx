/**
 * Create Profile Screen
 * First profile creation during onboarding
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
import { useProfileStore } from '@/store/useProfileStore';
import { createEmptyMemberHealthInfo, createEmptyCarePreferences } from '@/types/profile';
import {
  COUNTRY_LIST,
  SETTLEMENT,
  settlementCurrencyFor,
  type CountryCode,
} from '@/data/countries';
import type { OnboardingStackParamList } from '@/navigation/types';
import { createLogger } from '@/utils/logger';
import { profilesApi } from '@/services/api/endpoints/profiles';
import {
  mapGender,
  normalizeDateOfBirth,
  relationshipForBackend,
} from '@/lib/profileSync';

const logger = createLogger('CreateProfile');

type CreateProfileNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'CreateProfile'
>;
type CreateProfileRouteProp = RouteProp<OnboardingStackParamList, 'CreateProfile'>;

type RelationshipType = 'self' | 'parent' | 'spouse' | 'child' | 'other';
type GenderType = 'male' | 'female' | 'other';

interface RelationshipOption {
  id: RelationshipType;
  label: string;
  icon: string;
}

const relationshipOptions: RelationshipOption[] = [
  { id: 'self', label: 'Myself', icon: 'user' },
  { id: 'parent', label: 'Parent', icon: 'users' },
  { id: 'spouse', label: 'Spouse', icon: 'heart' },
  { id: 'child', label: 'Child', icon: 'smile' },
  { id: 'other', label: 'Other', icon: 'user-plus' },
];

const genderOptions: { id: GenderType; label: string }[] = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'other', label: 'Other' },
];

export default function CreateProfileScreen() {
  const navigation = useNavigation<CreateProfileNavigationProp>();
  const route = useRoute<CreateProfileRouteProp>();
  const { updateUser, setOnboardingStep } = useAuthStore();
  const { addMember, setCountry } = useProfileStore();
  const storeCountry = useProfileStore((state) => state.country);

  const role = route.params?.role || 'family_member';
  const isFamilyMember = role === 'family_member';

  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [relationship, setRelationship] = useState<RelationshipType>(
    isFamilyMember ? 'self' : 'other'
  );
  const [gender, setGender] = useState<GenderType | null>(null);
  const [country, setSelectedCountry] = useState<CountryCode>(storeCountry);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [errors, setErrors] = useState<{
    name?: string;
    dateOfBirth?: string;
    gender?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    try {
      normalizeDateOfBirth(dateOfBirth.trim());
    } catch (error) {
      newErrors.dateOfBirth =
        error instanceof Error ? error.message : 'Please enter a valid date of birth';
    }

    if (!gender) {
      newErrors.gender = 'Please select a gender';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validateForm() || !gender) return;

    setIsLoading(true);
    setSubmitError(null);
    let createdBackendId: string | null = null;

    try {
      // Never turn an approximate age into a fake January 1 birthday. The
      // backend clinical profile stores an exact DOB, so onboarding asks for the
      // exact value and validates it before anything is persisted.
      const normalizedDateOfBirth = normalizeDateOfBirth(dateOfBirth.trim());

      const nameParts = name.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ');

      // Server first. Onboarding cannot report a completed account profile when
      // only one device's AsyncStorage knows the patient exists.
      const profile = await profilesApi.createProfile({
        name: name.trim(),
        dateOfBirth: normalizedDateOfBirth,
        gender: mapGender(gender),
        relationship: relationshipForBackend(relationship),
      });
      createdBackendId = profile.id;

      addMember({
        firstName,
        lastName,
        relationship,
        dateOfBirth: normalizedDateOfBirth,
        gender,
        isDefault: true,
        backendId: profile.id,
        healthInfo: createEmptyMemberHealthInfo(),
        carePreferences: createEmptyCarePreferences(),
      });

      if (relationship === 'self') {
        updateUser({
          firstName,
          lastName,
        });
      }

      // Persist the chosen country — drives currency/pricing across the app.
      setCountry(country);

      setOnboardingStep('complete');
      navigation.navigate('OnboardingComplete');
    } catch (error) {
      // If the backend row was created but a later local write unexpectedly
      // failed, undo it rather than leave an invisible orphan profile.
      if (createdBackendId) {
        try {
          await profilesApi.deleteProfile(createdBackendId);
        } catch (rollbackError) {
          logger.error('Failed to roll back orphaned onboarding profile', rollbackError);
        }
      }

      logger.error('Failed to create profile', error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'CareBow could not save this profile. Check your connection and try again.'
      );
    } finally {
      setIsLoading(false);
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
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={colors.textPrimary} />
          </Pressable>

          <View style={styles.headerContainer}>
            <Text style={styles.title}>
              {isFamilyMember ? 'Create your first profile' : 'Add care recipient'}
            </Text>
            <Text style={styles.subtitle}>
              {isFamilyMember
                ? 'Start by adding yourself or a family member'
                : "Add the person you'll be caring for"}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <View style={[styles.inputContainer, errors.name && styles.inputError]}>
                <Icon name="user" size={20} color={colors.textTertiary} />
                <TextInput
                  style={styles.input}
                  placeholder="Full name"
                  placeholderTextColor={colors.textTertiary}
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (errors.name) {
                      setErrors((prev) => ({ ...prev, name: undefined }));
                    }
                    if (submitError) setSubmitError(null);
                  }}
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
              {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
            </View>

            {/* Exact DOB Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of birth</Text>
              <Text style={styles.helperText}>
                Used for age-appropriate safety checks. CareBow does not guess birthdays.
              </Text>
              <View style={[styles.inputContainer, errors.dateOfBirth && styles.inputError]}>
                <Icon name="calendar" size={20} color={colors.textTertiary} />
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textTertiary}
                  value={dateOfBirth}
                  onChangeText={(text) => {
                    setDateOfBirth(text);
                    if (errors.dateOfBirth) {
                      setErrors((prev) => ({ ...prev, dateOfBirth: undefined }));
                    }
                    if (submitError) setSubmitError(null);
                  }}
                  keyboardType="numbers-and-punctuation"
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={10}
                  editable={!isLoading}
                />
              </View>
              {errors.dateOfBirth ? (
                <Text style={styles.errorText}>{errors.dateOfBirth}</Text>
              ) : null}
            </View>

            {/* Relationship */}
            {isFamilyMember && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Relationship</Text>
                <View style={styles.chipsContainer}>
                  {relationshipOptions.map((option) => (
                    <Pressable
                      key={option.id}
                      style={[styles.chip, relationship === option.id && styles.chipSelected]}
                      onPress={() => setRelationship(option.id)}
                      disabled={isLoading}
                    >
                      <Icon
                        name={option.icon}
                        size={16}
                        color={relationship === option.id ? colors.accent : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.chipText,
                          relationship === option.id && styles.chipTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Gender */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.chipsContainer}>
                {genderOptions.map((option) => (
                  <Pressable
                    key={option.id}
                    style={[
                      styles.chip,
                      gender === option.id && styles.chipSelected,
                      errors.gender && !gender && styles.chipError,
                    ]}
                    onPress={() => {
                      setGender(option.id);
                      if (errors.gender) {
                        setErrors((prev) => ({ ...prev, gender: undefined }));
                      }
                      if (submitError) setSubmitError(null);
                    }}
                    disabled={isLoading}
                  >
                    <Text
                      style={[styles.chipText, gender === option.id && styles.chipTextSelected]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}
            </View>

            {/* Country */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Country</Text>
              <Text style={styles.helperText}>Sets your currency and service pricing</Text>
              <View style={styles.chipsContainer}>
                {COUNTRY_LIST.map((option) => (
                  <Pressable
                    key={option.code}
                    style={[styles.chip, country === option.code && styles.chipSelected]}
                    onPress={() => {
                      setSelectedCountry(option.code);
                      if (submitError) setSubmitError(null);
                    }}
                    disabled={isLoading}
                  >
                    <Text
                      style={[styles.chipText, country === option.code && styles.chipTextSelected]}
                    >
                      {/* The symbol shown is the one this country is CHARGED
                          in — two currencies, not six. Showing "£" to a UK
                          customer who pays in dollars is a promise we break at
                          checkout. */}
                      {option.name} ({SETTLEMENT[settlementCurrencyFor(option.code)].symbol})
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {/* Continue Button */}
          <View style={styles.footer}>
            {submitError ? <Text style={styles.submitErrorText}>{submitError}</Text> : null}
            <Pressable
              style={({ pressed }) => [
                styles.continueButton,
                pressed && styles.buttonPressed,
                isLoading && styles.buttonDisabled,
              ]}
              onPress={() => void handleContinue()}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.textInverse} />
              ) : (
                <>
                  <Text style={styles.continueButtonText}>Continue</Text>
                  <Icon name="arrow-right" size={20} color={colors.textInverse} />
                </>
              )}
            </Pressable>

            <Text style={styles.hintText}>
              Your patient profile is saved to your CareBow account before onboarding completes.
            </Text>
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
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
  },
  helperText: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.xxs,
  },
  chipFlag: {
    fontSize: 16,
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
  submitErrorText: {
    ...typography.bodySmall,
    color: colors.error,
    textAlign: 'center',
  },

  // Chips
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentMuted,
  },
  chipError: {
    borderColor: colors.error,
  },
  chipText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.accent,
  },

  // Footer
  footer: {
    marginTop: 'auto',
    paddingTop: spacing.xxl,
    gap: spacing.md,
  },
  continueButton: {
    height: 56,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.button,
  },
  continueButtonText: {
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
  hintText: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});