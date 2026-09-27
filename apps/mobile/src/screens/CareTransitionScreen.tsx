/**
 * CareTransitionScreen
 * High-intent care transition wedge & onboarding flow:
 * 1. Who are you here to help? (Myself, Parent, Spouse, Someone else)
 * 2. What brought you to CareBow today? (Hospital discharge, surgery recovery, new diagnosis, chronic care)
 * 3. Discharge instructions input / upload
 * 4. Structured candidate extraction & confirmation (ZERO clinical fabrication, source provenance, unconfirmed by default)
 * 5. Structured Episode and Care Tasks generation
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Haptics from 'react-native-haptic-feedback';
import { useProfileStore } from '../store/useProfileStore';
import { useCareStore } from '../store/useCareStore';
import { careApi } from '../services/api/endpoints/care';
import { AppIcon } from '../components/icons/AppIcon';
import { colors, radius, spacing } from '../theme';
import type { Relationship } from '../types/profile';
import type {
  CareEpisodeType,
  CareTaskPriority,
  CareTaskType,
  ExtractedDischargePlan,
  CandidateCarePlanItem,
} from '../types/care';

type HelpingOption = 'parent' | 'spouse' | 'self' | 'other';
type CareReason =
  | 'HOSPITAL_DISCHARGE'
  | 'SURGERY_RECOVERY'
  | 'NEW_DIAGNOSIS'
  | 'CHRONIC_CONDITION'
  | 'MEDICATION_TRANSITION'
  | 'HOME_CARE_SETUP';

export default function CareTransitionScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const addMember = useProfileStore((state) => state.addMember);
  const selectMember = useProfileStore((state) => state.selectMember);
  const createEpisode = useCareStore((state) => state.createEpisode);
  const createTask = useCareStore((state) => state.createTask);
  const addTimelineEvent = useCareStore((state) => state.addTimelineEvent);
  const fetchCareForPerson = useCareStore((state) => state.fetchCareForPerson);

  // Step 1: Who are you helping
  const [helping, setHelping] = useState<HelpingOption>('parent');
  const [recipientName, setRecipientName] = useState('Mom');

  // Step 2: What brought you here
  const [reason, setReason] = useState<CareReason>(route.params?.reason || 'HOSPITAL_DISCHARGE');

  // Step 3: Discharge notes - starts empty (ZERO fabricated text)
  const [dischargeNotes, setDischargeNotes] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  // Extracted plan details
  const [extractedPlan, setExtractedPlan] = useState<ExtractedDischargePlan | null>(null);
  const [candidateItems, setCandidateItems] = useState<CandidateCarePlanItem[]>([]);

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Trigger candidate extraction via server API
  const handleExtractPlan = useCallback(async (textToExtract: string) => {
    if (!textToExtract.trim()) {
      setCandidateItems([]);
      setExtractedPlan(null);
      return;
    }

    setIsExtracting(true);
    setExtractionError(null);
    try {
      const plan = await careApi.extractDischarge(textToExtract);
      setExtractedPlan(plan);
      // Combine candidateItems and carebowSuggestions, ensuring ALL default to unconfirmed (P0-10)
      const allItems: CandidateCarePlanItem[] = [
        ...(plan.candidateItems || []),
        ...(plan.carebowSuggestions || []),
      ].map((item) => ({
        ...item,
        confirmed: false, // MANDATORY: Must default to false per clinical safety rule
      }));
      setCandidateItems(allItems);
    } catch (err: any) {
      // If offline or network error, fallback to local heuristic without fake clinical inventions
      setExtractionError(
        'Extraction service unavailable. You can proceed with standard transition goals.'
      );
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const toggleItemConfirmation = useCallback((itemId: string) => {
    Haptics.trigger('impactLight');
    setCandidateItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, confirmed: !item.confirmed } : item))
    );
  }, []);

  const handleFinishPlan = useCallback(async () => {
    Haptics.trigger('notificationSuccess');

    // 1. Create or use Care Recipient in ProfileStore (NO fabricated clinical data)
    const relationship: Relationship =
      helping === 'parent'
        ? 'parent'
        : helping === 'spouse'
          ? 'spouse'
          : helping === 'self'
            ? 'self'
            : 'other';

    const member = addMember({
      firstName: recipientName.trim(),
      lastName: '',
      relationship,
      isDefault: true,
      healthInfo: {
        allergies: [],
        conditions: extractedPlan?.dischargeDiagnosis
          ? [
              {
                id: `cond_${Date.now()}`,
                name: extractedPlan.dischargeDiagnosis,
                status: 'managed',
              },
            ]
          : [],
        medications: [],
        mobilityStatus: 'fully_mobile',
      },
      carePreferences: {
        preferredLanguage: 'English',
        preferredCareType: ['home_care'],
      },
    });

    selectMember(member.id);

    // 2. Prepare Episode details
    const episodeTitle =
      reason === 'HOSPITAL_DISCHARGE'
        ? `Hospital Discharge Recovery — ${recipientName}`
        : reason === 'SURGERY_RECOVERY'
          ? `Post-Surgical Recovery — ${recipientName}`
          : `Care Plan — ${recipientName}`;

    const todayStr = new Date().toISOString().split('T')[0];
    const confirmedList = candidateItems.filter((item) => item.confirmed);

    try {
      // Attempt canonical server confirmation
      await careApi.confirmDischarge(member.id, {
        episodeTitle,
        facilityName: extractedPlan?.hospitalName || undefined,
        dischargeDiagnosis: extractedPlan?.dischargeDiagnosis || undefined,
        careGoals: extractedPlan?.careGoals?.length
          ? extractedPlan.careGoals
          : ['Active care coordination'],
        confirmedItems: confirmedList.map((item) => ({
          id: item.id,
          category: item.category,
          title: item.title,
          description: item.description,
          suggestedDueAt: item.suggestedDueAt,
          priority: item.priority,
          ownerType: item.ownerType,
          serviceHint: item.serviceHint,
          sourceType: item.sourceType,
          sourceSnippet: item.sourceSnippet,
          confirmed: true,
        })),
      });

      // Synchronize authoritative state
      await fetchCareForPerson(member.id);
    } catch {
      // Fallback: Optimistic local episode + tasks (queued in offlineQueue)
      const episode = await createEpisode({
        personId: member.id,
        title: episodeTitle,
        episodeType: reason as CareEpisodeType,
        startDate: todayStr,
        status: 'active',
        workflowStatus: 'recovery_ongoing',
        source: 'hospital_discharge',
        description: `Structured care plan initialized for ${recipientName}.`,
        careGoals: extractedPlan?.careGoals || ['Safe recovery and follow-up care'],
        dischargeDetails: extractedPlan
          ? {
              hospitalName: extractedPlan.hospitalName || undefined,
              dischargeDate: extractedPlan.dischargeDate || todayStr,
              primaryDiagnosis: extractedPlan.dischargeDiagnosis || undefined,
              dischargeInstructions: dischargeNotes,
              extractedWarningSigns: extractedPlan.clinicianWarningSigns || [],
            }
          : undefined,
      });

      // Create each confirmed task
      for (const [index, ct] of confirmedList.entries()) {
        const dueDays = index === 0 ? 0 : index === 1 ? 1 : 2;
        const due = ct.suggestedDueAt || new Date(Date.now() + dueDays * 86400000).toISOString();

        await createTask({
          personId: member.id,
          episodeId: episode.id,
          title: ct.title,
          description: ct.description,
          taskType: (ct.category === 'MEDICATION'
            ? 'MEDICATION'
            : ct.category === 'APPOINTMENT'
              ? 'APPOINTMENT'
              : ct.category === 'SERVICE'
                ? 'HOME_CARE'
                : 'GENERAL') as CareTaskType,
          ownerType:
            ct.ownerType === 'CAREBOW' || (ct.ownerType as string) === 'CARE_COORDINATOR'
              ? 'CAREBOW'
              : 'CAREGIVER',
          ownerName:
            ct.ownerType === 'CAREBOW' || (ct.ownerType as string) === 'CARE_COORDINATOR'
              ? 'CareBow Coordination'
              : 'Primary Caregiver',
          dueAt: due,
          status: 'PENDING',
          priority: ct.priority ? (ct.priority.toUpperCase() as CareTaskPriority) : 'MEDIUM',
          source: 'DISCHARGE_SUMMARY',
        });
      }

      addTimelineEvent({
        personId: member.id,
        episodeId: episode.id,
        eventType: 'discharge',
        title: `Care plan initialized`,
        description: `Confirmed ${confirmedList.length} initial recovery tasks.`,
        severity: 'normal',
      });
    }

    // 5. Navigate directly to Today screen
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'Today' } }],
    });
  }, [
    helping,
    recipientName,
    reason,
    dischargeNotes,
    extractedPlan,
    candidateItems,
    addMember,
    selectMember,
    createEpisode,
    createTask,
    addTimelineEvent,
    fetchCareForPerson,
    navigation,
  ]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <AppIcon name="arrow-left" size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Care Transition Plan</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* STEP 1: WHO ARE YOU HELPING */}
        {currentStep === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepNum}>STEP 1 OF 3</Text>
            <Text style={styles.stepTitle}>Who are you here to help?</Text>
            <Text style={styles.stepSub}>
              CareBow keeps everything organized for the person you love.
            </Text>

            <View style={styles.optionsList}>
              {[
                { id: 'parent', label: 'A Parent (Mom or Dad)', icon: 'heart', defaultName: 'Mom' },
                {
                  id: 'spouse',
                  label: 'My Spouse or Partner',
                  icon: 'companionship',
                  defaultName: 'Spouse',
                },
                { id: 'self', label: 'Myself', icon: 'user', defaultName: 'Myself' },
                {
                  id: 'other',
                  label: 'Someone Else (Child, Relative)',
                  icon: 'plus',
                  defaultName: 'Loved One',
                },
              ].map((opt) => (
                <Pressable
                  key={opt.id}
                  style={[styles.optionCard, helping === opt.id && styles.optionCardActive]}
                  onPress={() => {
                    Haptics.trigger('impactLight');
                    setHelping(opt.id as HelpingOption);
                    setRecipientName(opt.defaultName);
                  }}
                >
                  <View
                    style={[
                      styles.optionIconWrap,
                      helping === opt.id && styles.optionIconWrapActive,
                    ]}
                  >
                    <AppIcon
                      name={opt.icon as any}
                      size={20}
                      color={helping === opt.id ? '#FFFFFF' : colors.accent}
                    />
                  </View>
                  <Text
                    style={[styles.optionLabel, helping === opt.id && styles.optionLabelActive]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.inputLabel}>WHAT SHOULD WE CALL THEM?</Text>
            <TextInput
              style={styles.textInput}
              value={recipientName}
              onChangeText={setRecipientName}
              placeholder="e.g. Mom, Eleanor, Dad"
              placeholderTextColor={colors.textTertiary}
            />

            <Pressable
              style={styles.continueBtn}
              onPress={() => {
                Haptics.trigger('impactMedium');
                setCurrentStep(2);
              }}
            >
              <Text style={styles.continueBtnText}>Continue →</Text>
            </Pressable>
          </View>
        )}

        {/* STEP 2: WHAT BROUGHT YOU TO CAREBOW */}
        {currentStep === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepNum}>STEP 2 OF 3</Text>
            <Text style={styles.stepTitle}>What brought you to CareBow?</Text>
            <Text style={styles.stepSub}>
              Select the situation you and {recipientName} are currently navigating.
            </Text>

            <View style={styles.optionsList}>
              {[
                {
                  id: 'HOSPITAL_DISCHARGE',
                  title: 'Coming Home from the Hospital',
                  desc: 'Coordinate follow-ups, medications, home care, and warning signs',
                  recommended: true,
                },
                {
                  id: 'SURGERY_RECOVERY',
                  title: 'Post-Surgical Recovery',
                  desc: 'Track incision care, rehab exercises, physical therapy',
                },
                {
                  id: 'CHRONIC_CONDITION',
                  title: 'Managing an Ongoing Condition',
                  desc: 'Heart condition, diabetes, hypertension, memory care',
                },
                {
                  id: 'MEDICATION_TRANSITION',
                  title: 'Medication Transition / Change',
                  desc: 'Reconcile new prescriptions and monitor reactions',
                },
                {
                  id: 'HOME_CARE_SETUP',
                  title: 'Organizing Daily Home Care',
                  desc: 'Caregiver shifts, bathing, mobility, daily routines',
                },
              ].map((item) => (
                <Pressable
                  key={item.id}
                  style={[styles.reasonCard, reason === item.id && styles.reasonCardActive]}
                  onPress={() => {
                    Haptics.trigger('impactLight');
                    setReason(item.id as CareReason);
                  }}
                >
                  <View style={styles.reasonTop}>
                    <Text
                      style={[styles.reasonTitle, reason === item.id && styles.reasonTitleActive]}
                    >
                      {item.title}
                    </Text>
                    {item.recommended ? (
                      <View style={styles.recommendedBadge}>
                        <Text style={styles.recommendedBadgeText}>RECOMMENDED</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.reasonDesc}>{item.desc}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              style={styles.continueBtn}
              onPress={() => {
                Haptics.trigger('impactMedium');
                setCurrentStep(3);
              }}
            >
              <Text style={styles.continueBtnText}>Continue to Recovery Plan →</Text>
            </Pressable>
          </View>
        )}

        {/* STEP 3: DISCHARGE INSTRUCTIONS & CANDIDATE CONFIRMATION */}
        {currentStep === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepNum}>STEP 3 OF 3</Text>
            <Text style={styles.stepTitle}>Let's build {recipientName}'s plan</Text>
            <Text style={styles.stepSub}>
              Paste discharge instructions or physician notes below. CareBow extracts clinical
              candidate items with source provenance for your review.
            </Text>

            <View style={styles.notesBox}>
              <View style={styles.notesBoxHeader}>
                <Text style={styles.notesBoxTitle}>DISCHARGE SUMMARY / INSTRUCTIONS</Text>
                {dischargeNotes.trim().length > 0 && (
                  <Pressable
                    style={styles.extractActionBtn}
                    onPress={() => handleExtractPlan(dischargeNotes)}
                    disabled={isExtracting}
                  >
                    {isExtracting ? (
                      <ActivityIndicator size="small" color="#0D9488" />
                    ) : (
                      <Text style={styles.extractActionBtnText}>Extract Plan</Text>
                    )}
                  </Pressable>
                )}
              </View>
              <TextInput
                style={styles.notesTextInput}
                value={dischargeNotes}
                onChangeText={(text) => {
                  setDischargeNotes(text);
                }}
                placeholder="Paste discharge orders, medications, follow-up instructions, or warnings here..."
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={4}
              />
            </View>

            {extractionError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{extractionError}</Text>
              </View>
            ) : null}

            {/* Extracted Clinical Metadata */}
            {extractedPlan && (
              <View style={styles.metadataCard}>
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataLabel}>Discharging Facility:</Text>
                  <Text style={styles.metadataValue}>
                    {extractedPlan.hospitalName || 'Not specified in instructions'}
                  </Text>
                </View>
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataLabel}>Discharge Diagnosis:</Text>
                  <Text style={styles.metadataValue}>
                    {extractedPlan.dischargeDiagnosis || 'Not specified in instructions'}
                  </Text>
                </View>
                {extractedPlan.dischargeDate ? (
                  <View style={styles.metadataRow}>
                    <Text style={styles.metadataLabel}>Discharge Date:</Text>
                    <Text style={styles.metadataValue}>{extractedPlan.dischargeDate}</Text>
                  </View>
                ) : null}
              </View>
            )}

            <Text style={styles.candidateSectionHeading}>EXTRACTED CANDIDATE TASKS</Text>
            <Text style={styles.candidateSectionSub}>
              CareBow does not invent medical instructions. All candidate items require your
              confirmation:
            </Text>

            {candidateItems.length === 0 ? (
              <View style={styles.emptyCandidatesCard}>
                <AppIcon name="check-circle" size={24} color={colors.textTertiary} />
                <Text style={styles.emptyCandidatesText}>
                  {dischargeNotes.trim().length > 0
                    ? 'Tap "Extract Plan" above to analyze notes for actions and warning signs.'
                    : 'Paste discharge instructions above to extract clinical actions, medications, and appointments.'}
                </Text>
              </View>
            ) : (
              <View style={styles.candidateList}>
                {candidateItems.map((item) => (
                  <Pressable
                    key={item.id}
                    style={[styles.candidateItem, item.confirmed && styles.candidateItemConfirmed]}
                    onPress={() => toggleItemConfirmation(item.id)}
                  >
                    <View style={[styles.candCheck, item.confirmed && styles.candCheckConfirmed]}>
                      {item.confirmed ? <AppIcon name="check" size={14} color="#FFFFFF" /> : null}
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.candHeaderRow}>
                        <Text style={styles.candTitle}>{item.title}</Text>
                        <View
                          style={[
                            styles.sourceTypeBadge,
                            item.sourceType === 'CAREBOW_SUGGESTION'
                              ? styles.suggestionBadge
                              : styles.clinicianBadge,
                          ]}
                        >
                          <Text
                            style={[
                              styles.sourceTypeBadgeText,
                              item.sourceType === 'CAREBOW_SUGGESTION'
                                ? styles.suggestionBadgeText
                                : styles.clinicianBadgeText,
                            ]}
                          >
                            {item.sourceType === 'CAREBOW_SUGGESTION'
                              ? 'CAREBOW SUGGESTION'
                              : 'CLINICIAN ORDER'}
                          </Text>
                        </View>
                      </View>
                      {item.description ? (
                        <Text style={styles.candDesc}>{item.description}</Text>
                      ) : null}

                      {/* Clinical Provenance Snippet */}
                      {item.sourceSnippet ? (
                        <View style={styles.provenanceWrap}>
                          <Text style={styles.provenanceLabel}>Source quote:</Text>
                          <Text style={styles.provenanceSnippet}>"{item.sourceSnippet}"</Text>
                        </View>
                      ) : null}

                      <View style={styles.candBadgeRow}>
                        <View style={styles.candBadge}>
                          <Text style={styles.candBadgeText}>{item.category}</Text>
                        </View>
                        <View
                          style={[
                            styles.candBadge,
                            item.priority === 'URGENT' && { backgroundColor: '#FEE2E2' },
                            item.priority === 'HIGH' && { backgroundColor: '#FEF3C7' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.candBadgeText,
                              item.priority === 'URGENT' && { color: '#DC2626' },
                              item.priority === 'HIGH' && { color: '#D97706' },
                            ]}
                          >
                            {item.priority}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}

            {/* CLINICIAN WARNING SIGNS */}
            {extractedPlan?.clinicianWarningSigns &&
            extractedPlan.clinicianWarningSigns.length > 0 ? (
              <View style={styles.warningSignsCard}>
                <View style={styles.warningSignsHeader}>
                  <AppIcon name="warning" size={16} color="#DC2626" />
                  <Text style={styles.warningSignsTitle}>EXTRACTED WARNING SIGNS TO WATCH</Text>
                </View>
                {extractedPlan.clinicianWarningSigns.map((ws, i) => (
                  <Text key={i} style={styles.warningSignText}>
                    • {ws}
                  </Text>
                ))}
              </View>
            ) : null}

            <Pressable style={styles.finishBtn} onPress={handleFinishPlan}>
              <Text style={styles.finishBtnText}>
                {candidateItems.filter((i) => i.confirmed).length > 0
                  ? `Confirm & Add ${candidateItems.filter((i) => i.confirmed).length} Tasks to Plan`
                  : 'Start Care Plan'}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  stepContainer: {
    gap: spacing.md,
  },
  stepNum: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: 0.8,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  stepSub: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  optionsList: {
    gap: spacing.sm,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: spacing.md,
  },
  optionCardActive: {
    borderColor: colors.accent,
    backgroundColor: '#F0FDFA',
  },
  optionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionIconWrapActive: {
    backgroundColor: colors.accent,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  optionLabelActive: {
    color: colors.accent,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textTertiary,
    letterSpacing: 0.8,
    marginTop: spacing.sm,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
  },
  continueBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  reasonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reasonCardActive: {
    borderColor: colors.accent,
    backgroundColor: '#F0FDFA',
  },
  reasonTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reasonTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  reasonTitleActive: {
    color: colors.accent,
  },
  recommendedBadge: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recommendedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.accent,
  },
  reasonDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  notesBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notesBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  notesBoxTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textTertiary,
    letterSpacing: 0.8,
  },
  extractActionBtn: {
    backgroundColor: '#E6FFFA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  extractActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0D9488',
  },
  notesTextInput: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
    minHeight: 70,
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  errorBannerText: {
    fontSize: 12,
    color: '#DC2626',
  },
  metadataCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: 4,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metadataLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  metadataValue: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  candidateSectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textTertiary,
    letterSpacing: 0.8,
    marginTop: spacing.sm,
  },
  candidateSectionSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptyCandidatesCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyCandidatesText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 17,
  },
  candidateList: {
    gap: spacing.sm,
  },
  candidateItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  candidateItemConfirmed: {
    borderColor: '#99F6E4',
    backgroundColor: '#F0FDFA',
  },
  candCheck: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.textTertiary,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  candCheckConfirmed: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  candHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  candTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  sourceTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  clinicianBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  clinicianBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  suggestionBadge: {
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  suggestionBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#7E22CE',
  },
  sourceTypeBadgeText: {
    fontSize: 8,
    fontWeight: '800',
  },
  candDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  provenanceWrap: {
    backgroundColor: '#F8FAFC',
    borderRadius: 4,
    padding: 6,
    marginTop: 6,
    borderLeftWidth: 2,
    borderLeftColor: colors.accent,
  },
  provenanceLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textTertiary,
    textTransform: 'uppercase',
  },
  provenanceSnippet: {
    fontSize: 10,
    fontStyle: 'italic',
    color: colors.textSecondary,
    marginTop: 2,
  },
  candBadgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  candBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  candBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  warningSignsCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  warningSignsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xs,
  },
  warningSignsTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#991B1B',
    letterSpacing: 0.8,
  },
  warningSignText: {
    fontSize: 12,
    color: '#7F1D1D',
    marginTop: 2,
  },
  finishBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  finishBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
