/**
 * Ask CareBow Tab Screen
 * Entry point for the AI Health Assistant with Trial System
 *
 * Upgrades:
 * - Image upload with bottom sheet
 * - Health buddy starter prompts
 * - Inline red-flag warning
 * - Health Memory entry point
 */

import React, { useState, useCallback, useMemo } from 'react';
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
import type { AppNavigationProp } from '../../navigation/types';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  colors as themeColors,
  spacing as themeSpacing,
  radius as themeRadius,
  typography as themeTypography,
  shadows as themeShadows,
} from '../../theme';
import {
  colors,
  space,
  radius,
  typography,
  shadows,
  componentStyles,
  layout,
} from '../../theme/tokens';
import {
  useAskCarebowStore,
  useIsTrialActive,
  useTrialDaysRemaining,
  useTrialState,
  useCanAccessPremiumFeatures,
} from '../../store/askCarebowStore';
import { useHealthMemoryStore, useMemoryCount } from '../../store/healthMemoryStore';
import { TrialSignupCard, TrialBanner } from '../../components/askCarebow/TrialSignupCard';
import { VoiceInput } from '../../components/askCarebow/VoiceInput';
import { ImageUploadBottomSheet, ImageAttachment } from '../../components/askCarebow/ImageUploadBottomSheet';
import { ImageThumbnailRow } from '../../components/askCarebow/ImageThumbnailRow';
import { RedFlagWarning, detectRedFlags } from '../../components/askCarebow/RedFlagWarning';

const relationships = [
  { value: '', label: 'Select relationship...' },
  { value: 'father', label: 'Father' },
  { value: 'mother', label: 'Mother' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'child', label: 'Child' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'other', label: 'Other family member' },
];

// Health buddy starter prompts - improved
const STARTER_PROMPTS = [
  { text: "I'm feeling sick and worried", icon: 'sad-outline' },
  { text: 'I have a rash (photo attached)', icon: 'image-outline' },
  { text: 'Pain in my ____ for ____ days', icon: 'body-outline' },
  { text: 'My child has fever', icon: 'thermometer-outline' },
  { text: 'I feel anxious / stressed', icon: 'heart-outline' },
];

export default function AskCareBowScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation() as AppNavigationProp;
  const [contextType, setContextType] = useState<'me' | 'family'>('me');
  const [familyRelation, setFamilyRelation] = useState('');
  const [familyAge, setFamilyAge] = useState('');
  const [caregiverPresent, setCaregiverPresent] = useState<boolean>(true);
  const [symptomInput, setSymptomInput] = useState('');
  const [showRelationshipPicker, setShowRelationshipPicker] = useState(false);
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');

  // New state for image upload
  const [attachedImages, setAttachedImages] = useState<ImageAttachment[]>([]);
  const [showImageSheet, setShowImageSheet] = useState(false);

  // Get subscription and trial status from store
  const { hasSubscription, clearCurrentSession } = useAskCarebowStore();
  const isTrialActive = useIsTrialActive();
  const trialDaysRemaining = useTrialDaysRemaining();
  const trialState = useTrialState();
  const canAccessPremium = useCanAccessPremiumFeatures();

  // Health memory
  const memoryCount = useMemoryCount();

  // Red flag detection
  const showRedFlagWarning = useMemo(() => {
    return detectRedFlags(symptomInput);
  }, [symptomInput]);

  // Emotional keyword detection for reassurance message
  const EMOTIONAL_KEYWORDS = ['worried', 'scared', 'anxious', 'stressed', 'nervous', 'afraid', 'frightened', 'panicking', 'overwhelmed', 'terrified'];
  const showEmotionalReassurance = useMemo(() => {
    const lowerInput = symptomInput.toLowerCase();
    return EMOTIONAL_KEYWORDS.some(keyword => lowerInput.includes(keyword));
  }, [symptomInput]);

  // Image handlers
  const handleImagesSelected = useCallback((images: ImageAttachment[]) => {
    setAttachedImages((prev) => [...prev, ...images].slice(0, 3));
  }, []);

  const handleRemoveImage = useCallback((id: string) => {
    setAttachedImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

  // Handle voice transcription completion
  const handleTranscriptionComplete = (text: string) => {
    setSymptomInput(text);
    setInputMode('text'); // Switch back to text mode to show the transcript
  };

  const handleStart = () => {
    if (!symptomInput.trim()) return;

    // Clear any existing session before starting a new one
    clearCurrentSession();

    // Navigate with all context including images
    navigation.navigate('Conversation' as never, {
      symptom: symptomInput,
      context: contextType,
      relation: familyRelation,
      age: familyAge,
      memberName: contextType === 'family' ? familyRelation : 'Me',
      // Pass caregiver presence for family mode
      caregiverPresent: contextType === 'family' ? String(caregiverPresent) : undefined,
      // Pass image URIs as JSON string (navigation params must be serializable)
      attachedImages: JSON.stringify(attachedImages),
    });
  };

  // Navigate to Health Memory screen
  const handleOpenHealthMemory = () => {
    navigation.navigate('HealthMemory' as never);
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
          { paddingTop: insets.top + space.xl, paddingBottom: 96 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header with Health Memory entry point */}
        <View style={styles.headerRow}>
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Icon name="heart" size={26} color={colors.text.inverse} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Ask CareBow</Text>
              <Text style={styles.headerBadge}>AI Health Assistant</Text>
            </View>
          </View>
          {/* Health Memory Entry Point */}
          <TouchableOpacity
            style={styles.memoryButton}
            onPress={handleOpenHealthMemory}
          >
            <Icon name="leaf" size={18} color={colors.primary.default} />
            {memoryCount > 0 && (
              <View style={styles.memoryBadge}>
                <Text style={styles.memoryBadgeText}>{memoryCount}</Text>
              </View>
            )}
          </TouchableOpacity>
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
            <Icon name="diamond" size={16} color={colors.primary.default} />
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
                  color={contextType === 'me' ? colors.primary.default : colors.text.tertiary}
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
                  color={contextType === 'family' ? colors.primary.default : colors.text.tertiary}
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
                <Icon name="chevron-down" size={20} color={colors.text.tertiary} />
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
                placeholderTextColor={colors.text.tertiary}
                value={familyAge}
                onChangeText={setFamilyAge}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>

            {/* Caregiver Presence Toggle */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Are you with them right now?</Text>
              <View style={styles.presenceToggle}>
                <TouchableOpacity
                  style={[
                    styles.presenceOption,
                    caregiverPresent && styles.presenceOptionActive,
                  ]}
                  onPress={() => setCaregiverPresent(true)}
                >
                  <Icon
                    name="checkmark-circle"
                    size={16}
                    color={caregiverPresent ? colors.primary.default : colors.text.tertiary}
                  />
                  <Text
                    style={[
                      styles.presenceOptionText,
                      caregiverPresent && styles.presenceOptionTextActive,
                    ]}
                  >
                    Yes, I'm with them
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.presenceOption,
                    !caregiverPresent && styles.presenceOptionActive,
                  ]}
                  onPress={() => setCaregiverPresent(false)}
                >
                  <Icon
                    name="call"
                    size={16}
                    color={!caregiverPresent ? colors.primary.default : colors.text.tertiary}
                  />
                  <Text
                    style={[
                      styles.presenceOptionText,
                      !caregiverPresent && styles.presenceOptionTextActive,
                    ]}
                  >
                    No, asking remotely
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.infoBox}>
              <Icon name="information-circle" size={16} color={colors.info.default} />
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
              Tell me what's been bothering you. <Text style={styles.required}>*</Text>
            </Text>
            {/* Input Mode Toggle with Image */}
            <View style={styles.inputModeToggle}>
              <TouchableOpacity
                style={[styles.modeButton, inputMode === 'text' && styles.modeButtonActive]}
                onPress={() => setInputMode('text')}
              >
                <Icon
                  name="create-outline"
                  size={16}
                  color={inputMode === 'text' ? colors.primary.default : colors.text.tertiary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeButton, inputMode === 'voice' && styles.modeButtonActive]}
                onPress={() => setInputMode('voice')}
              >
                <Icon
                  name="mic-outline"
                  size={16}
                  color={inputMode === 'voice' ? colors.primary.default : colors.text.tertiary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modeButton}
                onPress={() => setShowImageSheet(true)}
              >
                <Icon
                  name="camera-outline"
                  size={16}
                  color={attachedImages.length > 0 ? colors.primary.default : colors.text.tertiary}
                />
                {attachedImages.length > 0 && (
                  <View style={styles.imageCountBadge}>
                    <Text style={styles.imageCountText}>{attachedImages.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Helper text */}
          <Text style={styles.inputHelperText}>
            You can start anywhere — symptoms, worries, or something that feels small.
          </Text>

          {/* Image Permission Clarity */}
          <Text style={styles.imagePermissionText}>
            You can safely share photos (like rashes, swelling, or wounds) if that helps explain things.
          </Text>

          {inputMode === 'text' ? (
            <>
              {/* Emotional Acknowledgement (shown ABOVE input when emotional keywords detected) */}
              {showEmotionalReassurance && (
                <View style={styles.emotionalReassurance}>
                  <Icon name="heart" size={14} color={colors.primary.default} />
                  <Text style={styles.emotionalReassuranceText}>
                    Thanks for telling me — I'm here with you. We'll take this one step at a time.
                  </Text>
                </View>
              )}

              {/* Image Thumbnail Row (if images attached) */}
              {attachedImages.length > 0 && (
                <ImageThumbnailRow
                  images={attachedImages}
                  onRemove={handleRemoveImage}
                  onAddMore={() => setShowImageSheet(true)}
                  maxImages={3}
                />
              )}

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder={
                    contextType === 'me'
                      ? "Describe what you're experiencing..."
                      : "Describe what they're experiencing..."
                  }
                  placeholderTextColor={colors.text.tertiary}
                  value={symptomInput}
                  onChangeText={setSymptomInput}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>

              {/* Red Flag Warning (inline, below input) */}
              <RedFlagWarning visible={showRedFlagWarning} />

              {/* Safe Space + Memory Signal */}
              <Text style={styles.safeSpaceSignal}>
                Private • Judgment-free • I remember helpful details (like allergies or past issues) to personalize care — you can edit or delete them anytime.
              </Text>

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

        {/* Image Invitation Hints (non-interactive) */}
        <View style={styles.imageInvitationSection}>
          <Text style={styles.imageInvitationTitle}>You can also share:</Text>
          <View style={styles.imageInvitationList}>
            <Text style={styles.imageInvitationItem}>📸 Rash / skin issue</Text>
            <Text style={styles.imageInvitationItem}>🤕 Pain or swelling</Text>
            <Text style={styles.imageInvitationItem}>🫁 Breathing or chest issue</Text>
            <Text style={styles.imageInvitationItem}>🧠 Stress or anxiety</Text>
          </View>
        </View>

        {/* Health Buddy Starter Prompts (improved) */}
        <View style={styles.examplesSection}>
          <Text style={styles.examplesTitle}>Try something like:</Text>
          <View style={styles.examplesList}>
            {STARTER_PROMPTS.map((prompt, index) => (
              <TouchableOpacity
                key={index}
                style={styles.exampleChip}
                onPress={() => setSymptomInput(prompt.text)}
              >
                <Icon name={prompt.icon} size={12} color={colors.text.tertiary} />
                <Text style={styles.exampleChipText}>{prompt.text}</Text>
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
            color={canStart ? colors.text.inverse : colors.text.tertiary}
          />
          <Text style={[styles.ctaButtonText, !canStart && styles.ctaButtonTextDisabled]}>
            Start Conversation
          </Text>
        </TouchableOpacity>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Icon name="warning" size={16} color={colors.warning.default} />
          <Text style={styles.disclaimerText}>
            For emergencies, call <Text style={styles.disclaimerBold}>911</Text> immediately.
            CareBow is not a substitute for emergency services or professional medical advice.
          </Text>
        </View>
      </ScrollView>

      {/* Image Upload Bottom Sheet */}
      <ImageUploadBottomSheet
        visible={showImageSheet}
        onClose={() => setShowImageSheet(false)}
        onImagesSelected={handleImagesSelected}
        currentImageCount={attachedImages.length}
        maxImages={3}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  memoryButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.primary.muted,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  memoryBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary.default,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  memoryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.primary.default,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.primaryButton,
  },
  headerTitle: {
    ...typography.screenTitle,
    color: colors.text.primary,
  },
  headerBadge: {
    ...typography.captionSmall,
    color: colors.primary.default,
    marginTop: 2,
  },
  headerSubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: space.md,
  },
  trialSection: {
    marginBottom: space.lg,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    backgroundColor: colors.primary.muted,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
    marginBottom: space.lg,
  },
  premiumBadgeText: {
    ...typography.labelSmall,
    color: colors.primary.default,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.sm,
  },
  inputModeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: 2,
  },
  modeButton: {
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
    borderRadius: radius.full,
    position: 'relative',
  },
  modeButtonActive: {
    backgroundColor: colors.primary.muted,
  },
  imageCountBadge: {
    position: 'absolute',
    top: -2,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCountText: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  section: {
    marginBottom: space.lg,
  },
  label: {
    ...typography.label,
    color: colors.text.primary,
    marginBottom: space.sm,
  },
  labelNoMargin: {
    ...typography.label,
    color: colors.text.primary,
  },
  required: {
    color: colors.error.default,
  },
  contextGrid: {
    flexDirection: 'row',
    gap: space.sm,
  },
  contextCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.xl,
    padding: space.md,
    alignItems: 'center',
    gap: space.xs,
    backgroundColor: colors.surface,
  },
  contextCardActive: {
    borderColor: colors.primary.default,
    backgroundColor: colors.primary.muted,
    ...shadows.card,
  },
  contextIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contextIconActive: {
    backgroundColor: colors.primary.soft,
  },
  contextCardText: {
    ...typography.label,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  contextCardTextActive: {
    color: colors.primary.default,
  },
  familySection: {
    backgroundColor: colors.primary.muted,
    borderWidth: 1,
    borderColor: colors.primary.soft,
    borderRadius: radius.xl,
    padding: space.md,
    marginBottom: space.lg,
    gap: space.md,
  },
  fieldContainer: {
    gap: space.xs,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.text.primary,
  },
  selectButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectButtonText: {
    ...typography.body,
    color: colors.text.primary,
  },
  selectButtonPlaceholder: {
    color: colors.text.tertiary,
  },
  pickerDropdown: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    marginTop: space.xxs,
    overflow: 'hidden',
    ...shadows.elevated,
  },
  pickerOption: {
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  pickerOptionActive: {
    backgroundColor: colors.primary.muted,
  },
  pickerOptionText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  pickerOptionTextActive: {
    color: colors.primary.default,
    fontWeight: '500',
  },
  ageInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    ...typography.body,
    color: colors.text.primary,
    height: 52,
  },
  presenceToggle: {
    flexDirection: 'row',
    gap: space.xs,
  },
  presenceOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xxs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    paddingHorizontal: space.sm,
    paddingVertical: space.sm,
    minHeight: 44,
  },
  presenceOptionActive: {
    backgroundColor: colors.primary.muted,
    borderColor: colors.primary.default,
  },
  presenceOptionText: {
    ...typography.captionSmall,
    color: colors.text.secondary,
  },
  presenceOptionTextActive: {
    color: colors.primary.default,
    fontWeight: '500',
  },
  infoBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.info.soft,
    borderRadius: radius.lg,
    padding: space.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.xs,
  },
  infoText: {
    flex: 1,
    ...typography.caption,
    color: colors.text.secondary,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: space.xs,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.xl,
    paddingHorizontal: space.md,
    paddingTop: space.md,
    paddingBottom: space.md,
    ...typography.body,
    color: colors.text.primary,
    minHeight: 140,
  },
  inputHint: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  inputHelperText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: space.xs,
    fontStyle: 'italic',
  },
  imagePermissionText: {
    ...typography.captionSmall,
    color: colors.text.tertiary,
    marginBottom: space.sm,
  },
  safeSpaceSignal: {
    ...typography.captionSmall,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: space.sm,
    marginBottom: space.xs,
    lineHeight: 16,
  },
  emotionalReassurance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    backgroundColor: colors.primary.muted,
    borderRadius: radius.lg,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
    marginTop: space.xs,
  },
  emotionalReassuranceText: {
    ...typography.caption,
    color: colors.primary.default,
    flex: 1,
  },
  imageInvitationSection: {
    marginBottom: space.md,
  },
  imageInvitationTitle: {
    ...typography.labelSmall,
    color: colors.text.tertiary,
    marginBottom: space.xs,
  },
  imageInvitationList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  imageInvitationItem: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  examplesSection: {
    marginBottom: space.lg,
  },
  examplesTitle: {
    ...typography.labelSmall,
    color: colors.text.tertiary,
    marginBottom: space.xs,
  },
  examplesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
  },
  exampleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xxs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.full,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
  },
  exampleChipText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.default,
    borderRadius: radius.lg,
    paddingVertical: space.md,
    marginBottom: space.md,
    gap: space.xs,
    height: 52,
    ...shadows.primaryButton,
  },
  ctaButtonDisabled: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaButtonText: {
    ...typography.buttonLarge,
    color: colors.text.inverse,
  },
  ctaButtonTextDisabled: {
    color: colors.text.tertiary,
  },
  disclaimer: {
    backgroundColor: colors.warning.muted,
    borderWidth: 1,
    borderColor: colors.warning.default,
    borderRadius: radius.lg,
    padding: space.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.xs,
  },
  disclaimerText: {
    flex: 1,
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  disclaimerBold: {
    fontWeight: '700',
    color: colors.text.primary,
  },
});
