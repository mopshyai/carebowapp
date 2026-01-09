/**
 * TriageActionBar Component
 * Shows triage-based CTAs after AI assessment response
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
import type { AppNavigationProp } from '../../navigation/types';

interface TriageActionBarProps {
  triageLevel: TriageLevel;
  episodeId?: string;
  onAction?: (action: string) => void;
}

export function TriageActionBar({ triageLevel, episodeId, onAction }: TriageActionBarProps) {
  const navigation = useNavigation() as AppNavigationProp;
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingSoonAction, setComingSoonAction] = useState('');

  const config = getCTAConfig(triageLevel);
  const tertiary = getTertiaryAction();

  const handleAction = (action: string) => {
    switch (action) {
      case 'emergency_call':
        handleEmergencyCall();
        break;
      case 'find_er':
        handleFindER();
        break;
      case 'save_share':
        handleSaveShare();
        break;
      default:
        // Show coming soon sheet for stub actions
        setComingSoonAction(action);
        setShowComingSoon(true);
    }

    onAction?.(action);
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
    const url =
      Platform.OS === 'ios'
        ? `maps://?q=${query}`
        : `geo:0,0?q=${query}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          // Fallback to Google Maps web
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
      {/* Emergency note - calm, clear guidance */}
      {isEmergency && (
        <View style={styles.emergencyNoteContainer}>
          <Icon name="alert-circle" size={16} color={colors.error} />
          <Text style={styles.emergencyNoteText}>{EMERGENCY_NOTE}</Text>
        </View>
      )}

      {/* Hint text (non-emergency) */}
      {!isEmergency && (
        <View style={styles.hintRow}>
          <Icon name="time-outline" size={12} color={colors.textTertiary} />
          <Text style={styles.hintText}>{config.hint}</Text>
        </View>
      )}

      {/* Primary & Secondary buttons */}
      {isEmergency ? (
        // Emergency layout: stacked full-width buttons
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
        // Default layout: row with icon-only secondary
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, getButtonStyle(config.primary.variant), styles.primaryButtonFlex]}
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

      {/* Tertiary link */}
      <TouchableOpacity
        style={styles.tertiaryButton}
        onPress={() => handleAction(tertiary.action)}
      >
        <Icon name={tertiary.icon} size={14} color={colors.textTertiary} />
        <Text style={styles.tertiaryText}>{tertiary.label}</Text>
      </TouchableOpacity>

      {/* Coming Soon Sheet */}
      <ComingSoonSheet
        visible={showComingSoon}
        onClose={() => setShowComingSoon(false)}
        action={comingSoonAction}
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
