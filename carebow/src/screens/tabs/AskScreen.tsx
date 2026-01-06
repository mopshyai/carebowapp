/**
 * Ask CareBow Tab Screen
 * Entry point for the AI Health Assistant with Trial System
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../../theme';
import {
  useAskCarebowStore,
  useIsTrialActive,
  useTrialDaysRemaining,
  useTrialState,
  useCanAccessPremiumFeatures,
} from '../../store/askCarebowStore';
import { TrialSignupCard, TrialBanner } from '../../components/askCarebow/TrialSignupCard';
import { VoiceInput } from '../../components/askCarebow/VoiceInput';

const relationships = [
  { value: '', label: 'Select relationship...' },
  { value: 'father', label: 'Father' },
  { value: 'mother', label: 'Mother' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'child', label: 'Child' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'other', label: 'Other family member' },
];

export default function AskCareBowScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [contextType, setContextType] = useState<'me' | 'family'>('me');
  const [familyRelation, setFamilyRelation] = useState('');
  const [familyAge, setFamilyAge] = useState('');
  const [symptomInput, setSymptomInput] = useState('');
  const [showRelationshipPicker, setShowRelationshipPicker] = useState(false);
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');

  // Get subscription and trial status from store
  const { hasSubscription, clearCurrentSession } = useAskCarebowStore();
  const isTrialActive = useIsTrialActive();
  const trialDaysRemaining = useTrialDaysRemaining();
  const trialState = useTrialState();
  const canAccessPremium = useCanAccessPremiumFeatures();

  // Handle voice transcription completion
  const handleTranscriptionComplete = (text: string) => {
    setSymptomInput(text);
    setInputMode('text'); // Switch back to text mode to show the transcript
  };

  const handleStart = () => {
    if (!symptomInput.trim()) return;

    // Clear any existing session before starting a new one
    clearCurrentSession();

    navigation.navigate('Conversation' as never, {
      symptom: symptomInput,
      context: contextType,
      relation: familyRelation,
      age: familyAge,
      memberName: contextType === 'family' ? familyRelation : 'Me',
    });
  };

  const canStart =
    symptomInput.trim().length > 0 &&
    (contextType === 'me' || (familyRelation && familyAge));

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.xl, paddingBottom: 96 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Icon name="heart" size={28} color={colors.textInverse} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Ask CareBow</Text>
            <Text style={styles.headerBadge}>AI Health Assistant</Text>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>
          I'll help you understand your symptoms and guide you to the right care.
        </Text>

        {/* Trial Banner - shown during active trial */}
        {isTrialActive && (
          <TrialBanner />
        )}

        {/* Trial Signup Card - shown if trial not started */}
        {!hasSubscription && !trialState.hasUsedTrial && (
          <View style={styles.trialSection}>
            <TrialSignupCard compact />
          </View>
        )}

        {/* Premium Badge - shown for subscribers */}
        {hasSubscription && (
          <View style={styles.premiumBadge}>
            <Icon name="diamond" size={16} color={colors.accent} />
            <Text style={styles.premiumBadgeText}>Premium Member</Text>
          </View>
        )}

        {/* Context Selector */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Who is this for? <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.contextGrid}>
            <TouchableOpacity
              style={[styles.contextCard, contextType === 'me' && styles.contextCardActive]}
              onPress={() => setContextType('me')}
            >
              <View style={[styles.contextIcon, contextType === 'me' && styles.contextIconActive]}>
                <Icon
                  name="person"
                  size={24}
                  color={contextType === 'me' ? colors.accent : colors.textTertiary}
                />
              </View>
              <Text
                style={[styles.contextCardText, contextType === 'me' && styles.contextCardTextActive]}
              >
                For me
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.contextCard, contextType === 'family' && styles.contextCardActive]}
              onPress={() => setContextType('family')}
            >
              <View style={[styles.contextIcon, contextType === 'family' && styles.contextIconActive]}>
                <Icon
                  name="people"
                  size={24}
                  color={contextType === 'family' ? colors.accent : colors.textTertiary}
                />
              </View>
              <Text
                style={[
                  styles.contextCardText,
                  contextType === 'family' && styles.contextCardTextActive,
                ]}
              >
                For family
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Family Context Fields */}
        {contextType === 'family' && (
          <View style={styles.familySection}>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                Relationship <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setShowRelationshipPicker(!showRelationshipPicker)}
              >
                <Text
                  style={[
                    styles.selectButtonText,
                    !familyRelation && styles.selectButtonPlaceholder,
                  ]}
                >
                  {familyRelation
                    ? relationships.find((r) => r.value === familyRelation)?.label
                    : 'Select relationship...'}
                </Text>
                <Icon name="chevron-down" size={20} color={colors.textTertiary} />
              </TouchableOpacity>
              {showRelationshipPicker && (
                <View style={styles.pickerDropdown}>
                  {relationships.slice(1).map((rel) => (
                    <TouchableOpacity
                      key={rel.value}
                      style={[
                        styles.pickerOption,
                        familyRelation === rel.value && styles.pickerOptionActive,
                      ]}
                      onPress={() => {
                        setFamilyRelation(rel.value);
                        setShowRelationshipPicker(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          familyRelation === rel.value && styles.pickerOptionTextActive,
                        ]}
                      >
                        {rel.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                Age <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.ageInput}
                placeholder="Enter their age"
                placeholderTextColor={colors.textTertiary}
                value={familyAge}
                onChangeText={setFamilyAge}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>

            <View style={styles.infoBox}>
              <Icon name="information-circle" size={16} color={colors.accent} />
              <Text style={styles.infoText}>
                Age helps me provide safer guidance, especially for children and older adults.
              </Text>
            </View>
          </View>
        )}

        {/* Symptom Input */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.labelNoMargin}>
              What's going on? <Text style={styles.required}>*</Text>
            </Text>
            {/* Input Mode Toggle */}
            <View style={styles.inputModeToggle}>
              <TouchableOpacity
                style={[styles.modeButton, inputMode === 'text' && styles.modeButtonActive]}
                onPress={() => setInputMode('text')}
              >
                <Icon
                  name="create-outline"
                  size={16}
                  color={inputMode === 'text' ? colors.accent : colors.textTertiary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeButton, inputMode === 'voice' && styles.modeButtonActive]}
                onPress={() => setInputMode('voice')}
              >
                <Icon
                  name="mic-outline"
                  size={16}
                  color={inputMode === 'voice' ? colors.accent : colors.textTertiary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {inputMode === 'text' ? (
            <>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder={
                    contextType === 'me'
                      ? "Describe what you're experiencing..."
                      : "Describe what they're experiencing..."
                  }
                  placeholderTextColor={colors.textTertiary}
                  value={symptomInput}
                  onChangeText={setSymptomInput}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>
              <Text style={styles.inputHint}>
                Be as specific as possible. Include when it started, how severe it is, and anything
                you've tried.
              </Text>
            </>
          ) : (
            <VoiceInput
              onTranscriptionComplete={handleTranscriptionComplete}
              useMock={true} // Set to false and provide apiKey for real transcription
            />
          )}
        </View>

        {/* Example Prompts */}
        <View style={styles.examplesSection}>
          <Text style={styles.examplesTitle}>Try something like:</Text>
          <View style={styles.examplesList}>
            {[
              "I've had a headache for 2 days",
              'Stomach pain after eating',
              'Feeling tired all the time',
              'Skin rash on my arm',
            ].map((example, index) => (
              <TouchableOpacity
                key={index}
                style={styles.exampleChip}
                onPress={() => setSymptomInput(example)}
              >
                <Text style={styles.exampleChipText}>{example}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={[styles.ctaButton, !canStart && styles.ctaButtonDisabled]}
          onPress={handleStart}
          disabled={!canStart}
        >
          <Icon
            name="chatbubbles"
            size={20}
            color={canStart ? colors.textInverse : colors.textTertiary}
          />
          <Text style={[styles.ctaButtonText, !canStart && styles.ctaButtonTextDisabled]}>
            Start Conversation
          </Text>
        </TouchableOpacity>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Icon name="warning" size={16} color={colors.warning} />
          <Text style={styles.disclaimerText}>
            For emergencies, call <Text style={styles.disclaimerBold}>911</Text> immediately.
            CareBow is not a substitute for emergency services or professional medical advice.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.button,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  headerBadge: {
    ...typography.caption,
    color: colors.accent,
    marginTop: spacing.xxs,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  trialSection: {
    marginBottom: spacing.lg,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accentMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  premiumBadgeText: {
    ...typography.labelSmall,
    color: colors.accent,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  inputModeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 2,
  },
  modeButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  modeButtonActive: {
    backgroundColor: colors.accentMuted,
  },
  section: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  labelNoMargin: {
    ...typography.label,
    color: colors.textPrimary,
  },
  required: {
    color: colors.error,
  },
  contextGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  contextCard: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
  },
  contextCardActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentMuted,
    ...shadows.card,
  },
  contextIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.surface2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contextIconActive: {
    backgroundColor: colors.accentSoft,
  },
  contextCardText: {
    ...typography.label,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  contextCardTextActive: {
    color: colors.accent,
  },
  familySection: {
    backgroundColor: colors.accentMuted,
    borderWidth: 1,
    borderColor: colors.accentSoft,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  fieldContainer: {
    gap: spacing.xs,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.textPrimary,
  },
  selectButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectButtonText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  selectButtonPlaceholder: {
    color: colors.textTertiary,
  },
  pickerDropdown: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    marginTop: spacing.xxs,
    overflow: 'hidden',
    ...shadows.cardElevated,
  },
  pickerOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  pickerOptionActive: {
    backgroundColor: colors.accentMuted,
  },
  pickerOptionText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  pickerOptionTextActive: {
    color: colors.accent,
    fontWeight: '500',
  },
  ageInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.textPrimary,
  },
  infoBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accentSoft,
    borderRadius: radius.md,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  infoText: {
    flex: 1,
    ...typography.caption,
    color: colors.textSecondary,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: spacing.xs,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
    minHeight: 140,
  },
  inputHint: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  examplesSection: {
    marginBottom: spacing.lg,
  },
  examplesTitle: {
    ...typography.labelSmall,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  examplesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  exampleChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  exampleChipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
    ...shadows.button,
  },
  ctaButtonDisabled: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaButtonText: {
    ...typography.labelLarge,
    color: colors.textInverse,
  },
  ctaButtonTextDisabled: {
    color: colors.textTertiary,
  },
  disclaimer: {
    backgroundColor: colors.warningSoft,
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  disclaimerText: {
    flex: 1,
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  disclaimerBold: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
