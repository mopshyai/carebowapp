/**
 * Triage Result Action Bar
 * Shows triage-based CTAs after AI assessment response.
 *
 * Navigation ownership rule:
 * - ConversationScreen owns care-orchestration navigation when it supplies onAction.
 * - This component only falls back to local navigation when used standalone.
 *
 * This prevents the previous double-navigation bug where the action bar navigated
 * and then the parent navigated again for the same clinical recommendation.
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

interface TriageActionBarProps {
  triageLevel: TriageLevel;
  episodeId?: string;
  /** Symptoms for home remedies recommendations */
  symptoms?: string[];
  /** Profile the remedies request is filtered for (pregnancy, diabetes, age, allergies) */
  profileId?: string;
  /**
   * When present, the parent owns service navigation so the clinical episode can
   * be carried into the booking flow. Local navigation is only a fallback for
   * standalone usages of this component.
   */
  onAction?: (action: string) => void;
}

export function TriageActionBar({
  triageLevel,
  episodeId,
  symptoms = [],
  profileId,
  onAction,
}: TriageActionBarProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingSoonAction, setComingSoonAction] = useState('');
  const [showHomeRemedies, setShowHomeRemedies] = useState(false);

  const config = getCTAConfig(triageLevel);
  const tertiary = getTertiaryAction();

  const delegateCareAction = (action: string, fallback: () => void) => {
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
      {
        text: 'In 1 hour',
        onPress: () => scheduleReminderWithDelay(60),
      },
      {
        text: 'In 4 hours',
        onPress: () => scheduleReminderWithDelay(240),
      },
      {
        text: 'Tomorrow',
        onPress: () => scheduleReminderWithDelay(24 * 60),
      },
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
        <View style={styles.hintRow}>
          <Icon name="time-outline" size={12} color={colors.textTertiary} />
          <Text style={styles.hintText}>{config.hint}</Text>
        </View>
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
              <Text style={[styles.buttonText, styles.buttonTextDark]}>
                {config.secondary.label}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.button,
              getButtonStyle(config.primary.variant),
              styles.primaryButtonFlex,
            ]}
            onPress={() => handleAction(config.primary.action)}
            activeOpacity={0.8}
          >
            <Icon
              name={config.primary.icon}
              size={18}
              color={getIconColor(config.primary.variant)}
            />
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
              <Icon
                name={config.secondary.icon}
                size={18}
                color={getIconColor(config.secondary.variant)}
              />
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
  fullWidthButton: {
    width: '100%',
  },
  emergencyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
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
  hintText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
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
  primaryButtonFlex: {
    flex: 1,
  },
  emergencyButton: {
    backgroundColor: colors.error,
    ...shadows.button,
  },
  urgentButton: {
    backgroundColor: colors.warning,
    ...shadows.button,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    ...shadows.button,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: {
    ...typography.label,
  },
  buttonTextLight: {
    color: colors.textInverse,
  },
  buttonTextDark: {
    color: colors.textSecondary,
  },
  tertiaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    paddingVertical: spacing.xs,
  },
  tertiaryText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});
