/**
 * Triage Result Action Bar
 * Shows triage-based CTAs after AI assessment response.
 *
 * Navigation ownership rule:
 * - ConversationScreen owns care-orchestration navigation when it supplies onAction.
 * - This component only falls back to local navigation when used standalone.
 *
 * Care-plan rule:
 * - A triage result must not end as a color/label plus buttons.
 * - For non-emergency results, show the user what to do now, what to do next,
 *   and what change should trigger escalation.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../../theme';
import {
  TriageLevel,
  getCTAConfig,
  getTertiaryAction,
  CTAButton,
  EMERGENCY_NOTE,
} from '../../utils/triageCTAMapping';
import { ComingSoonSheet } from './ComingSoonSheet';
import { HomeRemediesSheet } from './HomeRemediesSheet';
import type { RootStackParamList } from '../../navigation/types';
import { scheduleFollowUpReminder } from '../../services/notifications';
import { useCartStore } from '../../store/useCartStore';

interface TriageActionBarProps {
  triageLevel: TriageLevel;
  episodeId?: string;
  symptoms?: string[];
  profileId?: string;
  onAction?: (action: string) => void;
}

type CarePlanStep = {
  icon: string;
  label: string;
  text: string;
};

function getCarePlan(triageLevel: TriageLevel): CarePlanStep[] {
  switch (triageLevel) {
    case 'emergency':
      return [];
    case 'urgent':
      return [
        {
          icon: 'medical-outline',
          label: 'Now',
          text: 'Arrange medical evaluation as soon as possible today.',
        },
        {
          icon: 'chatbubbles-outline',
          label: 'Next',
          text: 'Use the recommended doctor option below and keep this episode with the booking.',
        },
        {
          icon: 'warning-outline',
          label: 'Escalate',
          text: 'If symptoms become severe, rapidly worsen, or new red flags appear, seek emergency care.',
        },
      ];
    case 'soon':
      return [
        {
          icon: 'calendar-outline',
          label: 'Now',
          text: 'Follow the guidance above and avoid delaying care if symptoms are worsening.',
        },
        {
          icon: 'person-outline',
          label: 'Next',
          text: 'Plan a clinician review soon; CareBow can carry this assessment into the booking.',
        },
        {
          icon: 'eye-outline',
          label: 'Watch',
          text: 'Track symptom changes and escalate sooner if severity or red-flag symptoms increase.',
        },
      ];
    case 'routine':
    case 'self_care':
    default:
      return [
        {
          icon: 'home-outline',
          label: 'Now',
          text: 'Use the self-care guidance above and give your body time to recover.',
        },
        {
          icon: 'time-outline',
          label: 'Next',
          text: 'Schedule a CareBow check-in so this episode is reviewed instead of forgotten.',
        },
        {
          icon: 'trending-up-outline',
          label: 'Watch',
          text: 'Get medical help if symptoms persist, worsen, or a concerning new symptom appears.',
        },
      ];
  }
}

export function TriageActionBar({
  triageLevel,
  episodeId,
  symptoms = [],
  profileId,
  onAction,
}: TriageActionBarProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const setCareReferralContext = useCartStore((state) => state.setCareReferralContext);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingSoonAction, setComingSoonAction] = useState('');
  const [showHomeRemedies, setShowHomeRemedies] = useState(false);

  const config = getCTAConfig(triageLevel);
  const tertiary = getTertiaryAction();
  const carePlan = getCarePlan(triageLevel);

  const captureCareReferral = (action: string) => {
    const careIntent =
      action === 'connect_doctor' || action === 'schedule_teleconsult'
        ? 'teleconsult'
        : action === 'book_home_visit' || action === 'home_visit_options'
          ? 'home_visit'
          : null;

    if (!careIntent) return;

    setCareReferralContext({
      source: 'ask_carebow',
      episodeId,
      profileId,
      triageLevel,
      symptoms: symptoms.map((symptom) => symptom.trim()).filter(Boolean).slice(0, 8),
      careIntent,
      createdAt: new Date().toISOString(),
    });
  };

  const delegateCareAction = (action: string, fallback: () => void) => {
    captureCareReferral(action);
    if (onAction) {
      onAction(action);
      return;
    }
    fallback();
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'emergency_call':
        handleEmergencyCall();
        onAction?.(action);
        return;
      case 'find_er':
        handleFindER();
        onAction?.(action);
        return;
      case 'save_share':
        handleSaveShare();
        onAction?.(action);
        return;
      case 'connect_doctor':
      case 'schedule_teleconsult':
        delegateCareAction(action, handleScheduleTeleconsult);
        return;
      case 'set_reminder':
        handleSetReminder();
        onAction?.(action);
        return;
      case 'book_home_visit':
      case 'home_visit_options':
        delegateCareAction(action, handleBookHomeVisit);
        return;
      case 'home_remedies':
        setShowHomeRemedies(true);
        onAction?.(action);
        return;
      default:
        setComingSoonAction(action);
        setShowComingSoon(true);
        onAction?.(action);
    }
  };

  const handleScheduleTeleconsult = () => {
    navigation.navigate('TelemedicineBooking', {});
  };

  const handleSetReminder = () => {
    Alert.alert('Set Reminder', 'When would you like to be reminded to check your symptoms?', [
      { text: 'In 1 hour', onPress: () => scheduleReminderWithDelay(60) },
      { text: 'In 4 hours', onPress: () => scheduleReminderWithDelay(240) },
      { text: 'Tomorrow', onPress: () => scheduleReminderWithDelay(24 * 60) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const scheduleReminderWithDelay = async (minutes: number) => {
    try {
      await scheduleFollowUpReminder(
        episodeId || 'general',
        'Symptom Check-in',
        new Date(Date.now() + minutes * 60 * 1000)
      );
      Alert.alert(
        'Reminder Set',
        `We'll remind you in ${minutes >= 60 ? Math.round(minutes / 60) + ' hour(s)' : minutes + ' minutes'}.`
      );
    } catch {
      Alert.alert(
        'Unable to Set Reminder',
        'Please ensure notifications are enabled in your settings.'
      );
    }
  };

  const handleBookHomeVisit = () => {
    navigation.navigate('Services', { category: 'home_care' });
  };

  const handleSaveShare = () => {
    if (episodeId) {
      navigation.navigate('EpisodeSummary', { episodeId });
    } else {
      Alert.alert('Unable to Share', 'No episode data available to share.');
    }
  };

  const handleEmergencyCall = () => {
    const phoneNumber = Platform.OS === 'ios' ? 'telprompt:911' : 'tel:911';
    Linking.canOpenURL(phoneNumber)
      .then((supported) => {
        if (supported) {
          Linking.openURL(phoneNumber);
        } else {
          Alert.alert('Unable to make call', 'Please dial 911 directly');
        }
      })
      .catch(() => {
        Alert.alert('Unable to make call', 'Please dial 911 directly');
      });
  };

  const handleFindER = () => {
    const query = encodeURIComponent('emergency room near me');
    const url = Platform.OS === 'ios' ? `maps://?q=${query}` : `geo:0,0?q=${query}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Linking.openURL(`https://www.google.com/maps/search/${query}`);
        }
      })
      .catch(() => {
        Linking.openURL(`https://www.google.com/maps/search/${query}`);
      });
  };

  const getButtonStyle = (variant: CTAButton['variant']) => {
    switch (variant) {
      case 'emergency':
        return styles.emergencyButton;
      case 'urgent':
        return styles.urgentButton;
      case 'primary':
        return styles.primaryButton;
      case 'secondary':
        return styles.secondaryButton;
    }
  };

  const getButtonTextStyle = (variant: CTAButton['variant']) => {
    switch (variant) {
      case 'emergency':
      case 'urgent':
      case 'primary':
        return styles.buttonTextLight;
      case 'secondary':
        return styles.buttonTextDark;
    }
  };

  const getIconColor = (variant: CTAButton['variant']) => {
    switch (variant) {
      case 'emergency':
      case 'urgent':
      case 'primary':
        return colors.textInverse;
      case 'secondary':
        return colors.textSecondary;
    }
  };

  const isEmergency = triageLevel === 'emergency';

  return (
    <View style={[styles.container, isEmergency && styles.emergencyContainer]}>
      {isEmergency && (
        <View style={styles.emergencyNoteContainer}>
          <Icon name="alert-circle" size={16} color={colors.error} />
          <Text style={styles.emergencyNoteText}>{EMERGENCY_NOTE}</Text>
        </View>
      )}

      {!isEmergency && (
        <>
          <View style={styles.carePlanHeader}>
            <View style={styles.carePlanTitleRow}>
              <Icon name="clipboard-outline" size={18} color={colors.accent} />
              <Text style={styles.carePlanTitle}>Your care plan</Text>
            </View>
            <Text style={styles.carePlanSubtitle}>Keep this episode moving until you feel better or get care.</Text>
          </View>

          <View style={styles.carePlanSteps}>
            {carePlan.map((step) => (
              <View key={step.label} style={styles.carePlanStep}>
                <View style={styles.carePlanIcon}>
                  <Icon name={step.icon} size={16} color={colors.accent} />
                </View>
                <View style={styles.carePlanCopy}>
                  <Text style={styles.carePlanStepLabel}>{step.label}</Text>
                  <Text style={styles.carePlanStepText}>{step.text}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.hintRow}>
            <Icon name="time-outline" size={12} color={colors.textTertiary} />
            <Text style={styles.hintText}>{config.hint}</Text>
          </View>
        </>
      )}

      {isEmergency ? (
        <View style={styles.emergencyButtonColumn}>
          <TouchableOpacity
            style={[styles.button, styles.emergencyButton, styles.fullWidthButton]}
            onPress={() => handleAction(config.primary.action)}
            activeOpacity={0.8}
          >
            <Icon name={config.primary.icon} size={20} color={colors.textInverse} />
            <Text style={[styles.buttonText, styles.buttonTextLight, styles.emergencyButtonText]}>
              {config.primary.label}
            </Text>
          </TouchableOpacity>

          {config.secondary && (
            <TouchableOpacity
              style={[styles.button, styles.emergencySecondaryButton, styles.fullWidthButton]}
              onPress={() => handleAction(config.secondary!.action)}
              activeOpacity={0.7}
            >
              <Icon name={config.secondary.icon} size={18} color={colors.textPrimary} />
              <Text style={[styles.buttonText, styles.buttonTextDark]}>{config.secondary.label}</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, getButtonStyle(config.primary.variant), styles.primaryButtonFlex]}
            onPress={() => handleAction(config.primary.action)}
            activeOpacity={0.8}
          >
            <Icon name={config.primary.icon} size={18} color={getIconColor(config.primary.variant)} />
            <Text style={[styles.buttonText, getButtonTextStyle(config.primary.variant)]}>
              {config.primary.label}
            </Text>
          </TouchableOpacity>

          {config.secondary && (
            <TouchableOpacity
              style={[styles.button, getButtonStyle(config.secondary.variant)]}
              onPress={() => handleAction(config.secondary!.action)}
              activeOpacity={0.7}
            >
              <Icon name={config.secondary.icon} size={18} color={getIconColor(config.secondary.variant)} />
            </TouchableOpacity>
          )}
        </View>
      )}

      <TouchableOpacity style={styles.tertiaryButton} onPress={() => handleAction(tertiary.action)}>
        <Icon name={tertiary.icon} size={14} color={colors.textTertiary} />
        <Text style={styles.tertiaryText}>{tertiary.label}</Text>
      </TouchableOpacity>

      <ComingSoonSheet
        visible={showComingSoon}
        onClose={() => setShowComingSoon(false)}
        action={comingSoonAction}
      />

      <HomeRemediesSheet
        visible={showHomeRemedies}
        onClose={() => setShowHomeRemedies(false)}
        symptoms={symptoms}
        triageLevel={triageLevel}
        profileId={profileId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emergencyContainer: {
    backgroundColor: colors.errorSoft || '#FEF2F2',
    borderColor: colors.error,
    borderWidth: 2,
  },
  carePlanHeader: {
    marginBottom: spacing.sm,
  },
  carePlanTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xxs,
  },
  carePlanTitle: {
    ...typography.label,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  carePlanSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  carePlanSteps: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  carePlanStep: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  carePlanIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundSecondary || colors.surface,
  },
  carePlanCopy: {
    flex: 1,
  },
  carePlanStepLabel: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
    marginBottom: 2,
  },
  carePlanStepText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  emergencyNoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  emergencyNoteText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 20,
  },
  emergencyButtonColumn: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  fullWidthButton: { width: '100%' },
  emergencyButtonText: { fontSize: 16, fontWeight: '600' },
  emergencySecondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    marginBottom: spacing.sm,
  },
  hintText: { ...typography.caption, color: colors.textTertiary },
  buttonRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.sm },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    minHeight: 48,
  },
  primaryButtonFlex: { flex: 1 },
  emergencyButton: { backgroundColor: colors.error, ...shadows.button },
  urgentButton: { backgroundColor: colors.warning, ...shadows.button },
  primaryButton: { backgroundColor: colors.accent, ...shadows.button },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: { ...typography.label },
  buttonTextLight: { color: colors.textInverse },
  buttonTextDark: { color: colors.textSecondary },
  tertiaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    paddingVertical: spacing.xs,
  },
  tertiaryText: { ...typography.caption, color: colors.textTertiary },
});
