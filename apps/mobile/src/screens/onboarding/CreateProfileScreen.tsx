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
import { COUNTRY_LIST, type CountryCode } from '@/data/countries';
import type { OnboardingStackParamList } from '@/navigation/types';
import { createLogger } from '@/utils/logger';
import { profilesApi } from '@/services/api/endpoints/profiles';

const GENDER_TO_BACKEND: Record<GenderType, 'MALE' | 'FEMALE' | 'OTHER'> = {
  male: 'MALE',
  female: 'FEMALE',
  other: 'OTHER',
  // The backend profile schema only has three gender values; there's no
  // direct equivalent, and 'OTHER' is a closer fallback than guessing.
  prefer_not_to_say: 'OTHER',
};

const logger = createLogger('CreateProfile');

type CreateProfileNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'CreateProfile'
>;
type CreateProfileRouteProp = RouteProp<OnboardingStackParamList, 'CreateProfile'>;

type RelationshipType = 'self' | 'parent' | 'spouse' | 'child' | 'other';
type GenderType = 'male' | 'female' | 'other' | 'prefer_not_to_say';

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
  { id: 'prefer_not_to_say', label: 'Prefer not to say' },
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
  const [age, setAge] = useState('');
  const [relationship, setRelationship] = useState<RelationshipType>(
    isFamilyMember ? 'self' : 'other'
  );
  const [gender, setGender] = useState<GenderType | null>(null);
  const [country, setSelectedCountry] = useState<CountryCode>(storeCountry);

  const [errors, setErrors] = useState<{
    name?: string;
    age?: string;
    gender?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!age) {
      newErrors.age = 'Age is required';
    } else if (isNaN(Number(age)) || Number(age) < 0 || Number(age) > 120) {
      newErrors.age = 'Please enter a valid age';
    }

    if (!gender) {
      newErrors.gender = 'Please select a gender';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Create the first family member profile
      const birthYear = new Date().getFullYear() - Number(age);
      const dateOfBirth = new Date(birthYear, 0, 1).toISOString();

      // Split name into first and last name
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Real backend Profile row — required for any feature that checks
      // profile ownership server-side (e.g. the Ask CareBow orchestrator,
      // which 404s with "Profile not found" otherwise). Best-effort: a
      // failure here (offline, backend hiccup) still lets onboarding finish
      // locally rather than stranding a new user on this screen — those
      // backend-only features just won't work until the profile syncs.
      let backendId: string | undefined;
      try {
        const profile = await profilesApi.createProfile({
          name: name.trim(),
          dateOfBirth,
          gender: GENDER_TO_BACKEND[gender as GenderType],
          relationship: relationship.charAt(0).toUpperCase() + relationship.slice(1),
        });
        backendId = profile.id;
      } catch (syncError) {
        logger.warn('Backend profile sync failed; continuing with local-only profile', syncError);
      }

      addMember({
        firstName,
        lastName,
        relationship,
        dateOfBirth,
        gender: gender || undefined,
        isDefault: true,
        backendId,
        healthInfo: createEmptyMemberHealthInfo(),
        carePreferences: createEmptyCarePreferences(),
      });

      // If it's "self", also update the user profile
      if (relationship === 'self') {
        const [firstName, ...lastNameParts] = name.trim().split(' ');
        updateUser({
          firstName,
          lastName: lastNameParts.join(' '),
        });
      }

      // Persist the chosen country — drives currency/pricing across the app.
      setCountry(country);

      setOnboardingStep('complete');
      navigation.navigate('OnboardingComplete');
    } catch (error) {
      logger.error('Failed to create profile', error);
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
                  }}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
              {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
            </View>

            {/* Age Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Age</Text>
              <View style={[styles.inputContainer, errors.age && styles.inputError]}>
                <Icon name="calendar" size={20} color={colors.textTertiary} />
                <TextInput
                  style={styles.input}
                  placeholder="Age in years"
                  placeholderTextColor={colors.textTertiary}
                  value={age}
                  onChangeText={(text) => {
                    setAge(text.replace(/[^0-9]/g, ''));
                    if (errors.age) {
                      setErrors((prev) => ({ ...prev, age: undefined }));
                    }
                  }}
                  keyboardType="number-pad"
                  maxLength={3}
                />
              </View>
              {errors.age ? <Text style={styles.errorText}>{errors.age}</Text> : null}
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
                    }}
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
                    onPress={() => setSelectedCountry(option.code)}
                  >
                    <Text
                      style={[styles.chipText, country === option.code && styles.chipTextSelected]}
                    >
                      {option.name} ({option.symbol})
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {/* Continue Button */}
          <View style={styles.footer}>
            <Pressable
              style={({ pressed }) => [
                styles.continueButton,
                pressed && styles.buttonPressed,
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleContinue}
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
              You can add more profiles later from your profile settings
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
