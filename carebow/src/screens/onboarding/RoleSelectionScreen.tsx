/**
 * Role Selection Screen
 * Choose between Family Member or Caregiver roles
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';
import { colors, typography, spacing, radius, shadows } from '@/theme';
import { useAuthStore, UserRole } from '@/store/useAuthStore';
import type { OnboardingStackParamList } from '@/navigation/types';

type RoleSelectionNavigationProp = NativeStackNavigationProp<OnboardingStackParamList, 'RoleSelection'>;

interface RoleOption {
  id: UserRole;
  emoji: string;
  title: string;
  description: string;
  features: string[];
}

const roleOptions: RoleOption[] = [
  {
    id: 'family_member',
    emoji: '👨‍👩‍👧‍👦',
    title: 'Family Member',
    description: 'I want to manage health for myself and my family',
    features: [
      'Create profiles for family members',
      'Track symptoms and health concerns',
      'Get AI-powered health guidance',
      'Book healthcare services',
    ],
  },
  {
    id: 'caregiver',
    emoji: '🩺',
    title: 'Professional Caregiver',
    description: 'I provide care for elderly or patients',
    features: [
      'Manage multiple care recipients',
      'Detailed health tracking',
      'Emergency alerts & safety features',
      'Communicate with family members',
    ],
  },
];

export default function RoleSelectionScreen() {
  const navigation = useNavigation<RoleSelectionNavigationProp>();
  const { setUserRole } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleContinue = () => {
    if (selectedRole) {
      setUserRole(selectedRole);
      navigation.navigate('CreateProfile', { role: selectedRole });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>How will you use CareBow?</Text>
          <Text style={styles.subtitle}>
            This helps us personalize your experience
          </Text>
        </View>

        {/* Role Options */}
        <View style={styles.optionsContainer}>
          {roleOptions.map((role) => (
            <Pressable
              key={role.id}
              style={[
                styles.roleCard,
                selectedRole === role.id && styles.roleCardSelected,
              ]}
              onPress={() => setSelectedRole(role.id)}
            >
              {/* Selection Indicator */}
              <View style={styles.cardHeader}>
                <View style={styles.emojiContainer}>
                  <Text style={styles.emoji}>{role.emoji}</Text>
                </View>
                <View style={[
                  styles.radioOuter,
                  selectedRole === role.id && styles.radioOuterSelected,
                ]}>
                  {selectedRole === role.id && (
                    <View style={styles.radioInner} />
                  )}
                </View>
              </View>

              {/* Role Info */}
              <Text style={styles.roleTitle}>{role.title}</Text>
              <Text style={styles.roleDescription}>{role.description}</Text>

              {/* Features */}
              <View style={styles.featuresContainer}>
                {role.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Icon
                      name="check"
                      size={14}
                      color={selectedRole === role.id ? colors.accent : colors.textTertiary}
                    />
                    <Text style={[
                      styles.featureText,
                      selectedRole === role.id && styles.featureTextSelected,
                    ]}>
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
            </Pressable>
          ))}
        </View>

        {/* Continue Button */}
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.continueButton,
              !selectedRole && styles.continueButtonDisabled,
              pressed && selectedRole && styles.buttonPressed,
            ]}
            onPress={handleContinue}
            disabled={!selectedRole}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <Icon name="arrow-right" size={20} color={colors.textInverse} />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
  },

  // Header
  header: {
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

  // Options
  optionsContainer: {
    flex: 1,
    gap: spacing.md,
  },
  roleCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  roleCardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentMuted,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  emojiContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.accent,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
  },
  roleTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  roleDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  featuresContainer: {
    gap: spacing.xs,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  featureText: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
  featureTextSelected: {
    color: colors.textSecondary,
  },

  // Footer
  footer: {
    paddingVertical: spacing.xl,
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
  continueButtonDisabled: {
    backgroundColor: colors.border,
    ...shadows.none,
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
});
