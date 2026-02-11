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

import Voice from '@react-native-voice/voice';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Tts from 'react-native-tts';
import Icon from 'react-native-vector-icons/Ionicons';
import { ImageThumbnailRow } from '../../components/askCarebow/ImageThumbnailRow';
import {
  ImageAttachment,
  ImageUploadBottomSheet,
} from '../../components/askCarebow/ImageUploadBottomSheet';
import { RedFlagWarning, detectRedFlags } from '../../components/askCarebow/RedFlagWarning';
import { TrialBanner, TrialSignupCard } from '../../components/askCarebow/TrialSignupCard';
import type { AppNavigationProp } from '../../navigation/types';
import { useAskCarebowStore, useIsTrialActive, useTrialState } from '../../store/askCarebowStore';
import { useMemoryCount } from '../../store/healthMemoryStore';
import { colors, radius, shadows, spacing, typography } from '../../theme';
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
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [, setBaseText] = useState(''); // Text before voice recognition started
  const symptomInputRef = useRef(symptomInput);
  const baseTextRef = useRef('');
  const inputModeRef = useRef(inputMode);

  useEffect(() => {
    symptomInputRef.current = symptomInput;
    inputModeRef.current = inputMode;
  }, [symptomInput, inputMode]);

  // New state for image upload
  const [attachedImages, setAttachedImages] = useState<ImageAttachment[]>([]);
  const [showImageSheet, setShowImageSheet] = useState(false);

  // Get subscription and trial status from store
  const { hasSubscription, clearCurrentSession } = useAskCarebowStore();
  const isTrialActive = useIsTrialActive();
  const trialState = useTrialState();
  useEffect(() => {
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechPartialResults = onSpeechPartialResults;

    return () => {
      Voice.destroy()
        .then(() => {
          Voice.removeAllListeners();
        })
        .catch(() => {});
    };
  }, []);

  const onSpeechStart = (e: any) => {
    console.log('onSpeechStart:', e);
    setIsListening(true);
    setRecognizedText('');
    // In text mode only: save existing input as base to append speech-to-text
    if (inputModeRef.current === 'text') {
      const current = symptomInputRef.current.trim();
      baseTextRef.current = current;
      setBaseText(current);
    } else {
      baseTextRef.current = '';
    }
  };

  const onSpeechEnd = (e: any) => {
    console.log('onSpeechEnd:', e);
    setIsListening(false);
    setRecognizedText('');
    setBaseText('');
    // Don't clear baseTextRef here — onSpeechResults may fire after onSpeechEnd,
    // and it needs baseTextRef to append correctly. It gets overwritten on next start.
  };

  const onSpeechResults = (e: any) => {
    console.log('onSpeechResults:', e);
    if (e.value && e.value.length > 0) {
      const text = e.value[0];
      const trimmedNew = text.trim();
      if (inputModeRef.current === 'text') {
        // Text mode: append to input field only
        const base = baseTextRef.current;
        const newText = base ? `${base} ${trimmedNew}` : trimmedNew;
        setSymptomInput(newText);
      } else {
        // Voice mode: update recognized text only (for "You said" display)
        setRecognizedText(trimmedNew);
        handleVoice(text);
      }
    }
  };

  const onSpeechPartialResults = (e: any) => {
    console.log('onSpeechPartialResults:', e);
    if (e.value && e.value.length > 0) {
      const partialText = e.value[0];
      const trimmedPartial = partialText.trim();
      if (inputModeRef.current === 'text') {
        // Text mode: append to input field only
        const base = baseTextRef.current;
        const newText = base ? `${base} ${trimmedPartial}` : trimmedPartial;
        setSymptomInput(newText);
      } else {
        // Voice mode: update recognized text only
        setRecognizedText(trimmedPartial);
      }
    }
  };

  const onSpeechError = (e: any) => {
    console.log('onSpeechError:', e);
    setIsListening(false);
  };

  const requestMicrophonePermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'CareBow needs access to your microphone for voice input.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else {
          Alert.alert(
            'Permission Required',
            'Microphone permission is needed for voice input. Please enable it in your device settings.',
            [{ text: 'OK' }]
          );
          return false;
        }
      } catch (err) {
        console.warn('Permission request error:', err);
        return false;
      }
    }
    // iOS permissions are handled via Info.plist
    return true;
  };
  const handleVoice = (text: any) => {
    const normalizedText = text.toLowerCase().trim();
    if (normalizedText === 'what is your name') {
      Tts.speak('I am Carebow');
    } else if (normalizedText === 'how are you') {
      Tts.speak('I am functioning normally.');
    } else if (normalizedText === 'what can you do') {
      Tts.speak('I can answer all your questions for testing.');
    } else {
      Tts.speak('Sorry, I did not understand that.');
    }
  };
  const startRecognizing = async () => {
    try {
      setRecognizedText('');

      // Request permissions first
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        return;
      }

      // Check if speech recognition is available
      const isAvailable = await Voice.isAvailable();
      if (!isAvailable) {
        return;
      }

      await Voice.start('en-US');
    } catch (error: any) {
      console.log('startRecognizing error:', error);
      setIsListening(false);
    }
  };

  const stopRecognizing = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (error: any) {
      console.log('stopRecognizing error:', error);
    }
  };
  // Health memory
  const memoryCount = useMemoryCount();

  // Red flag detection
  const showRedFlagWarning = useMemo(() => {
    return detectRedFlags(symptomInput);
  }, [symptomInput]);

  // Emotional keyword detection for reassurance message
  const EMOTIONAL_KEYWORDS = [
    'worried',
    'scared',
    'anxious',
    'stressed',
    'nervous',
    'afraid',
    'frightened',
    'panicking',
    'overwhelmed',
    'terrified',
  ];
  const showEmotionalReassurance = useMemo(() => {
    const lowerInput = symptomInput.toLowerCase();
    return EMOTIONAL_KEYWORDS.some((keyword) => lowerInput.includes(keyword));
  }, [symptomInput]);

  // Image handlers
  const handleImagesSelected = useCallback((images: ImageAttachment[]) => {
    setAttachedImages((prev) => [...prev, ...images].slice(0, 3));
  }, []);

  const handleRemoveImage = useCallback((id: string) => {
    setAttachedImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

  const handleStart = () => {
    const symptom = inputMode === 'voice' ? recognizedText : symptomInput;
    if (!symptom.trim()) return;

    // Clear any existing session before starting a new one
    clearCurrentSession();

    // Navigate with all context including images
    navigation.navigate('Conversation' as never, {
      symptom,
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

  const effectiveSymptom = inputMode === 'voice' ? recognizedText : symptomInput;
  const canStart =
    effectiveSymptom.trim().length > 0 && (contextType === 'me' || (familyRelation && familyAge));

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
        {/* Header with Health Memory entry point */}
        <View style={styles.headerRow}>
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Icon name="heart" size={28} color={colors.textInverse} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Ask CareBow</Text>
              <Text style={styles.headerBadge}>AI Health Assistant</Text>
            </View>
          </View>
          {/* Health Memory Entry Point */}
          <TouchableOpacity style={styles.memoryButton} onPress={handleOpenHealthMemory}>
            <Icon name="leaf" size={18} color={colors.accent} />
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
        {isTrialActive && <TrialBanner />}

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
                style={[
                  styles.contextCardText,
                  contextType === 'me' && styles.contextCardTextActive,
                ]}
              >
                For me
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.contextCard, contextType === 'family' && styles.contextCardActive]}
              onPress={() => setContextType('family')}
            >
              <View
                style={[styles.contextIcon, contextType === 'family' && styles.contextIconActive]}
              >
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

            {/* Caregiver Presence Toggle */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Are you with them right now?</Text>
              <View style={styles.presenceToggle}>
                <TouchableOpacity
                  style={[styles.presenceOption, caregiverPresent && styles.presenceOptionActive]}
                  onPress={() => setCaregiverPresent(true)}
                >
                  <Icon
                    name="checkmark-circle"
                    size={16}
                    color={caregiverPresent ? colors.accent : colors.textTertiary}
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
                  style={[styles.presenceOption, !caregiverPresent && styles.presenceOptionActive]}
                  onPress={() => setCaregiverPresent(false)}
                >
                  <Icon
                    name="call"
                    size={16}
                    color={!caregiverPresent ? colors.accent : colors.textTertiary}
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
              <TouchableOpacity style={styles.modeButton} onPress={() => setShowImageSheet(true)}>
                <Icon
                  name="camera-outline"
                  size={16}
                  color={attachedImages.length > 0 ? colors.accent : colors.textTertiary}
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
            You can safely share photos (like rashes, swelling, or wounds) if that helps explain
            things.
          </Text>

          {inputMode === 'text' ? (
            <>
              {/* Emotional Acknowledgement (shown ABOVE input when emotional keywords detected) */}
              {showEmotionalReassurance && (
                <View style={styles.emotionalReassurance}>
                  <Icon name="heart" size={14} color={colors.accent} />
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
                  placeholderTextColor={colors.textTertiary}
                  value={symptomInput}
                  onChangeText={setSymptomInput}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
                <TouchableOpacity
                  style={[styles.voiceInputButton, isListening && styles.voiceInputButtonActive]}
                  onPress={isListening ? stopRecognizing : startRecognizing}
                  activeOpacity={0.7}
                >
                  <Icon
                    name={isListening ? 'stop-circle' : 'mic'}
                    size={20}
                    color={isListening ? colors.error : colors.accent}
                  />
                </TouchableOpacity>
              </View>

              {/* Red Flag Warning (inline, below input) */}
              <RedFlagWarning visible={showRedFlagWarning} />

              {/* Safe Space + Memory Signal */}
              <Text style={styles.safeSpaceSignal}>
                Private • Judgment-free • I remember helpful details (like allergies or past issues)
                to personalize care — you can edit or delete them anytime.
              </Text>

              <Text style={styles.inputHint}>
                Be as specific as possible. Include when it started, how severe it is, and anything
                you've tried.
              </Text>
            </>
          ) : (
            <View style={styles.voiceInputContainer}>
              {/* Real-time speech recognition display */}
              {isListening && (
                <View style={styles.listeningIndicator}>
                  <View style={styles.listeningDot} />
                  <Text style={styles.listeningText}>Listening... Speak now</Text>
                </View>
              )}

              {/* Display recognized text in real-time */}
              {recognizedText ? (
                <View style={styles.recognizedTextContainer}>
                  <Text style={styles.recognizedTextLabel}>You said:</Text>
                  <Text style={styles.recognizedText}>{recognizedText}</Text>
                </View>
              ) : isListening ? (
                <Text style={styles.waitingText}>Waiting for speech...</Text>
              ) : null}

              {/* Alternative: Use VoiceInput component */}
              <View style={styles.voiceInputDivider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>
              <TouchableOpacity
                style={styles.micContainer}
                onPress={isListening ? stopRecognizing : startRecognizing}
              >
                <Icon
                  name={isListening ? 'stop-circle' : 'mic'}
                  size={20}
                  color={isListening ? colors.error : colors.accent}
                />
                <Text style={styles.dividerText}>Press To Speak</Text>
              </TouchableOpacity>
              {/* <VoiceInput
                onTranscriptionComplete={(text) => { setSymptomInput(text); setInputMode('text'); }}
                useMock={true} // Set to false and provide apiKey for real transcription
              /> */}
            </View>
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
                <Icon name={prompt.icon} size={12} color={colors.textTertiary} />
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
    backgroundColor: colors.surface2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  memoryButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.accentMuted,
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
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface2,
  },
  memoryBadgeText: {
    ...typography.tiny,
    color: colors.textInverse,
    fontSize: 10,
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
    flexDirection: 'column',
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
    position: 'relative',
  },
  modeButtonActive: {
    backgroundColor: colors.accentMuted,
  },
  imageCountBadge: {
    position: 'absolute',
    top: -2,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCountText: {
    ...typography.tiny,
    color: colors.textInverse,
    fontSize: 9,
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
  presenceToggle: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  presenceOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  presenceOptionActive: {
    backgroundColor: colors.accentMuted,
    borderColor: colors.accent,
  },
  presenceOptionText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  presenceOptionTextActive: {
    color: colors.accent,
    fontWeight: '500',
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
    paddingBottom: spacing.md + 40, // Extra padding for voice button
    paddingRight: spacing.md + 50, // Extra padding on right for voice button
    ...typography.body,
    color: colors.textPrimary,
    minHeight: 140,
  },
  voiceInputButton: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.accentMuted,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.accent,
    ...shadows.button,
  },
  voiceInputButtonActive: {
    backgroundColor: colors.errorSoft,
    borderColor: colors.error,
  },
  inputHint: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  inputHelperText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontStyle: 'italic',
  },
  imagePermissionText: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },
  safeSpaceSignal: {
    ...typography.tiny,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    lineHeight: 16,
  },
  emotionalReassurance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accentMuted,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginTop: spacing.xs,
  },
  emotionalReassuranceText: {
    ...typography.caption,
    color: colors.accent,
    flex: 1,
  },
  imageInvitationSection: {
    marginBottom: spacing.md,
  },
  imageInvitationTitle: {
    ...typography.labelSmall,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  imageInvitationList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  imageInvitationItem: {
    ...typography.caption,
    color: colors.textSecondary,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
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
  voiceInputContainer: {
    gap: spacing.md,
  },
  listeningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.errorSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.error,
  },
  listeningDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.error,
  },
  listeningText: {
    ...typography.label,
    color: colors.error,
    fontWeight: '600',
  },
  recognizedTextContainer: {
    backgroundColor: colors.accentMuted,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  recognizedTextLabel: {
    ...typography.caption,
    color: colors.accent,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  recognizedText: {
    ...typography.body,
    color: colors.textPrimary,
    fontStyle: 'italic',
  },
  waitingText: {
    ...typography.body,
    color: colors.textTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: spacing.sm,
  },
  voiceInputDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  micContainer: {
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
});
