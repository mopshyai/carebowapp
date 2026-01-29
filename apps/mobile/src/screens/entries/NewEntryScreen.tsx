/**
 * New Symptom Entry Screen (PRD V1 Spec)
 * Simple form: Profile selector, description, duration, severity
 * Rule-based triage on submit
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

import { colors, spacing, radius, typography, shadows } from '@/theme';
import { useProfileStore } from '@/store/useProfileStore';
import { useSymptomEntryStore } from '@/store/symptomEntryStore';
import {
  type SymptomDuration,
  type SymptomSeverity,
  DURATION_LABELS,
  DURATION_ORDER,
  SEVERITY_LABELS,
  SEVERITY_COLORS,
  SYMPTOM_DISCLAIMER,
} from '@/types/symptomEntry';
import { RELATIONSHIP_LABELS, type FamilyMember } from '@/types/profile';

const MAX_DESCRIPTION_LENGTH = 2000;

export default function NewEntryScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // Store hooks
  const members = useProfileStore((state) => state.members);
  const addEntry = useSymptomEntryStore((state) => state.addEntry);

  // Form state
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    members.find((m) => m.relationship === 'self')?.id || members[0]?.id || null
  );
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState<SymptomDuration>('hours');
  const [severity, setSeverity] = useState<SymptomSeverity>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Computed values
  const selectedProfile = useMemo(
    () => members.find((m) => m.id === selectedProfileId),
    [members, selectedProfileId]
  );

  const isValid = useMemo(
    () => selectedProfileId && description.trim().length >= 10,
    [selectedProfileId, description]
  );

  const characterCount = description.length;
  const characterCountColor =
    characterCount > MAX_DESCRIPTION_LENGTH * 0.9
      ? colors.error
      : characterCount > MAX_DESCRIPTION_LENGTH * 0.7
        ? colors.warning
        : colors.textTertiary;

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (!isValid || !selectedProfile) {
      Alert.alert(
        'Incomplete Entry',
        'Please select a family member and describe the symptoms (at least 10 characters).'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const entry = addEntry(
        selectedProfile.id,
        `${selectedProfile.firstName} ${selectedProfile.lastName}`,
        RELATIONSHIP_LABELS[selectedProfile.relationship] || selectedProfile.relationship,
        description.trim(),
        duration,
        severity
      );

      // Navigate to assessment result
      navigation.navigate('AssessmentResult' as never, { entryId: entry.id } as never);
    } catch (error) {
      Alert.alert('Error', 'Failed to save entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [isValid, selectedProfile, description, duration, severity, addEntry, navigation]);

  // Handle back
  const handleBack = useCallback(() => {
    if (description.trim().length > 0) {
      Alert.alert('Discard Entry?', 'Your changes will not be saved.', [
        { text: 'Keep Editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
      ]);
    } else {
      navigation.goBack();
    }
  }, [description, navigation]);

  // Render profile selector
  const renderProfileSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Who is this for?</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.profileList}
      >
        {members.map((member) => (
          <TouchableOpacity
            key={member.id}
            style={[
              styles.profileChip,
              selectedProfileId === member.id && styles.profileChipSelected,
            ]}
            onPress={() => setSelectedProfileId(member.id)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.profileAvatar,
                selectedProfileId === member.id && styles.profileAvatarSelected,
              ]}
            >
              <Text style={styles.profileInitial}>
                {member.firstName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text
                style={[
                  styles.profileName,
                  selectedProfileId === member.id && styles.profileNameSelected,
                ]}
                numberOfLines={1}
              >
                {member.firstName}
              </Text>
              <Text style={styles.profileRelation}>
                {RELATIONSHIP_LABELS[member.relationship] || member.relationship}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Render description input
  const renderDescriptionInput = () => (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Describe the symptoms</Text>
      <TextInput
        style={styles.descriptionInput}
        placeholder="What symptoms are you experiencing? Include details like when they started, what makes them better or worse, and any other relevant information..."
        placeholderTextColor={colors.textTertiary}
        multiline
        maxLength={MAX_DESCRIPTION_LENGTH}
        value={description}
        onChangeText={setDescription}
        textAlignVertical="top"
      />
      <Text style={[styles.characterCount, { color: characterCountColor }]}>
        {characterCount}/{MAX_DESCRIPTION_LENGTH}
      </Text>
    </View>
  );

  // Render duration selector
  const renderDurationSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>How long have you had these symptoms?</Text>
      <View style={styles.optionList}>
        {DURATION_ORDER.map((d) => (
          <TouchableOpacity
            key={d}
            style={[styles.optionItem, duration === d && styles.optionItemSelected]}
            onPress={() => setDuration(d)}
            activeOpacity={0.7}
          >
            <View style={styles.optionRadio}>
              {duration === d && <View style={styles.optionRadioInner} />}
            </View>
            <Text style={[styles.optionLabel, duration === d && styles.optionLabelSelected]}>
              {DURATION_LABELS[d]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Render severity selector
  const renderSeveritySelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>How severe are the symptoms?</Text>
      <View style={styles.severityRow}>
        {(['low', 'medium', 'high'] as SymptomSeverity[]).map((s) => (
          <TouchableOpacity
            key={s}
            style={[
              styles.severityItem,
              severity === s && {
                backgroundColor: SEVERITY_COLORS[s] + '15',
                borderColor: SEVERITY_COLORS[s],
              },
            ]}
            onPress={() => setSeverity(s)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.severityDot,
                { backgroundColor: SEVERITY_COLORS[s] },
                severity === s && styles.severityDotSelected,
              ]}
            />
            <Text
              style={[
                styles.severityLabel,
                severity === s && { color: SEVERITY_COLORS[s], fontWeight: '600' },
              ]}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Text>
            <Text style={styles.severityDescription} numberOfLines={2}>
              {SEVERITY_LABELS[s].split(' - ')[1]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Entry</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderProfileSelector()}
          {renderDescriptionInput()}
          {renderDurationSelector()}
          {renderSeveritySelector()}

          {/* Disclaimer */}
          <View style={styles.disclaimer}>
            <Icon name="information-circle-outline" size={18} color={colors.textTertiary} />
            <Text style={styles.disclaimerText}>{SYMPTOM_DISCLAIMER.short}</Text>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity
            style={[styles.submitButton, !isValid && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!isValid || isSubmitting}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Analyzing...' : 'Get Assessment'}
            </Text>
            {!isSubmitting && (
              <Icon name="arrow-forward" size={20} color={colors.textInverse} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -spacing.xs,
  },
  headerTitle: {
    flex: 1,
    ...typography.h3,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },

  // Scroll content
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  // Sections
  section: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    ...typography.labelLarge,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },

  // Profile selector
  profileList: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  profileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface2,
    borderRadius: radius.lg,
    padding: spacing.sm,
    paddingRight: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  profileChipSelected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarSelected: {
    backgroundColor: colors.accent,
  },
  profileInitial: {
    ...typography.labelLarge,
    color: colors.textInverse,
  },
  profileInfo: {
    gap: 2,
  },
  profileName: {
    ...typography.label,
    color: colors.textPrimary,
  },
  profileNameSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
  profileRelation: {
    ...typography.caption,
    color: colors.textTertiary,
  },

  // Description input
  descriptionInput: {
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    minHeight: 140,
    maxHeight: 200,
    ...typography.body,
    color: colors.textPrimary,
  },
  characterCount: {
    ...typography.caption,
    textAlign: 'right',
    marginTop: spacing.xs,
  },

  // Duration selector
  optionList: {
    gap: spacing.xs,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  optionItemSelected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  optionRadio: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionRadioInner: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
  },
  optionLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  optionLabelSelected: {
    color: colors.accent,
    fontWeight: '600',
  },

  // Severity selector
  severityRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  severityItem: {
    flex: 1,
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    gap: spacing.xs,
  },
  severityDot: {
    width: 12,
    height: 12,
    borderRadius: radius.full,
    opacity: 0.6,
  },
  severityDotSelected: {
    opacity: 1,
    transform: [{ scale: 1.2 }],
  },
  severityLabel: {
    ...typography.label,
    color: colors.textPrimary,
  },
  severityDescription: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    fontSize: 11,
  },

  // Disclaimer
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  disclaimerText: {
    flex: 1,
    ...typography.caption,
    color: colors.textTertiary,
  },

  // Footer
  footer: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  submitButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.button,
  },
  submitButtonDisabled: {
    backgroundColor: colors.border,
    ...shadows.none,
  },
  submitButtonText: {
    ...typography.labelLarge,
    color: colors.textInverse,
  },
});
