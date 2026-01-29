/**
 * Assessment Result Screen (PRD V1 Spec)
 * Displays triage results: risk level, care suggestion, reasoning
 * Emergency banner if emergency keywords detected
 */

import React, { useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

import { colors, spacing, radius, typography, shadows } from '@/theme';
import { useSymptomEntryStore } from '@/store/symptomEntryStore';
import {
  RISK_LEVEL_LABELS,
  RISK_LEVEL_COLORS,
  CARE_SUGGESTION_LABELS,
  CARE_SUGGESTION_DESCRIPTIONS,
  DURATION_LABELS,
  SEVERITY_LABELS,
  SYMPTOM_DISCLAIMER,
  type RiskLevel,
  type CareSuggestion,
} from '@/types/symptomEntry';
import { getUrgencyAdvice } from '@/utils/triageEngine';

type RouteParams = {
  AssessmentResult: { entryId: string };
};

const RISK_ICONS: Record<RiskLevel, string> = {
  low: 'checkmark-circle',
  medium: 'alert-circle',
  high: 'warning',
  emergency: 'medical',
};

const SUGGESTION_ICONS: Record<CareSuggestion, string> = {
  monitor: 'home',
  doctor_visit: 'calendar',
  urgent_care: 'medical',
  emergency: 'call',
};

export default function AssessmentResultScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'AssessmentResult'>>();
  const { entryId } = route.params;

  // Store
  const getEntry = useSymptomEntryStore((state) => state.getEntry);
  const entry = useMemo(() => getEntry(entryId), [entryId, getEntry]);

  // If entry not found, go back
  useEffect(() => {
    if (!entry) {
      Alert.alert('Error', 'Entry not found', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  }, [entry, navigation]);

  if (!entry) {
    return null;
  }

  const riskColors = RISK_LEVEL_COLORS[entry.riskLevel];
  const isEmergency = entry.riskLevel === 'emergency';

  // Handle emergency call
  const handleEmergencyCall = useCallback(() => {
    Alert.alert(
      'Call Emergency Services',
      'This will dial 911. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call 911',
          style: 'destructive',
          onPress: () => {
            Linking.openURL('tel:911');
          },
        },
      ]
    );
  }, []);

  // Handle done
  const handleDone = useCallback(() => {
    navigation.navigate('MainTabs' as never, { screen: 'Home' } as never);
  }, [navigation]);

  // Handle view history
  const handleViewHistory = useCallback(() => {
    navigation.navigate('MainTabs' as never, { screen: 'History' } as never);
  }, [navigation]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Emergency Banner */}
      {isEmergency && (
        <TouchableOpacity
          style={styles.emergencyBanner}
          onPress={handleEmergencyCall}
          activeOpacity={0.8}
        >
          <Icon name="call" size={24} color={colors.white} />
          <View style={styles.emergencyBannerText}>
            <Text style={styles.emergencyBannerTitle}>Emergency Detected</Text>
            <Text style={styles.emergencyBannerSubtitle}>Tap to call 911</Text>
          </View>
          <Icon name="chevron-forward" size={24} color={colors.white} />
        </TouchableOpacity>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assessment</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Risk Level Card */}
        <View
          style={[
            styles.riskCard,
            {
              backgroundColor: riskColors.bg,
              borderColor: riskColors.border,
            },
          ]}
        >
          <View style={styles.riskIconWrap}>
            <Icon
              name={RISK_ICONS[entry.riskLevel]}
              size={40}
              color={riskColors.text}
            />
          </View>
          <Text style={[styles.riskLevel, { color: riskColors.text }]}>
            {RISK_LEVEL_LABELS[entry.riskLevel]}
          </Text>
          <Text style={styles.riskDescription}>{entry.triageReason}</Text>
        </View>

        {/* Care Suggestion Card */}
        <View style={styles.suggestionCard}>
          <View style={styles.suggestionHeader}>
            <View style={[styles.suggestionIcon, { backgroundColor: colors.accentSoft }]}>
              <Icon
                name={SUGGESTION_ICONS[entry.careSuggestion]}
                size={24}
                color={colors.accent}
              />
            </View>
            <View style={styles.suggestionHeaderText}>
              <Text style={styles.suggestionLabel}>Recommended Action</Text>
              <Text style={styles.suggestionTitle}>
                {CARE_SUGGESTION_LABELS[entry.careSuggestion]}
              </Text>
            </View>
          </View>
          <Text style={styles.suggestionDescription}>
            {CARE_SUGGESTION_DESCRIPTIONS[entry.careSuggestion]}
          </Text>
          <View style={styles.urgencyRow}>
            <Icon name="time-outline" size={16} color={colors.textTertiary} />
            <Text style={styles.urgencyText}>
              {getUrgencyAdvice(entry.careSuggestion)}
            </Text>
          </View>
        </View>

        {/* Emergency Keywords Found */}
        {entry.emergencyKeywordsFound.length > 0 && (
          <View style={styles.keywordsCard}>
            <Text style={styles.keywordsTitle}>Emergency Keywords Detected</Text>
            <View style={styles.keywordsList}>
              {entry.emergencyKeywordsFound.map((keyword, index) => (
                <View key={index} style={styles.keywordChip}>
                  <Icon name="alert" size={12} color={colors.error} />
                  <Text style={styles.keywordText}>{keyword}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Entry Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Entry Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>For</Text>
            <Text style={styles.detailValue}>
              {entry.profileName} ({entry.profileRelationship})
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>{DURATION_LABELS[entry.duration]}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Severity</Text>
            <Text style={styles.detailValue}>
              {entry.severity.charAt(0).toUpperCase() + entry.severity.slice(1)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Recorded</Text>
            <Text style={styles.detailValue}>{formatDate(entry.createdAt)}</Text>
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.detailLabel}>Description</Text>
            <Text style={styles.descriptionText}>{entry.description}</Text>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Icon name="information-circle" size={20} color={colors.textTertiary} />
          <Text style={styles.disclaimerText}>{SYMPTOM_DISCLAIMER.full}</Text>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {isEmergency ? (
          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={handleEmergencyCall}
            activeOpacity={0.8}
          >
            <Icon name="call" size={20} color={colors.white} />
            <Text style={styles.emergencyButtonText}>Call 911</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.doneButton}
            onPress={handleDone}
            activeOpacity={0.8}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.historyButton}
          onPress={handleViewHistory}
          activeOpacity={0.7}
        >
          <Text style={styles.historyButtonText}>View History</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Emergency Banner
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  emergencyBannerText: {
    flex: 1,
  },
  emergencyBannerTitle: {
    ...typography.labelLarge,
    color: colors.white,
  },
  emergencyBannerSubtitle: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
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

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },

  // Risk Card
  riskCard: {
    borderRadius: radius.lg,
    borderWidth: 2,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  riskIconWrap: {
    marginBottom: spacing.xs,
  },
  riskLevel: {
    ...typography.h1,
    textAlign: 'center',
  },
  riskDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Suggestion Card
  suggestionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  suggestionIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionHeaderText: {
    flex: 1,
    gap: 2,
  },
  suggestionLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  suggestionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  suggestionDescription: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  urgencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  urgencyText: {
    ...typography.labelSmall,
    color: colors.textTertiary,
  },

  // Keywords Card
  keywordsCard: {
    backgroundColor: colors.errorSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.error,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  keywordsTitle: {
    ...typography.label,
    color: colors.error,
  },
  keywordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  keywordChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    gap: spacing.xxs,
    borderWidth: 1,
    borderColor: colors.error,
  },
  keywordText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '500',
  },

  // Details Card
  detailsCard: {
    backgroundColor: colors.surface2,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  detailsTitle: {
    ...typography.label,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  detailLabel: {
    ...typography.body,
    color: colors.textTertiary,
  },
  detailValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  descriptionSection: {
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  descriptionText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Disclaimer
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  disclaimerText: {
    flex: 1,
    ...typography.caption,
    color: colors.textTertiary,
    lineHeight: 18,
  },

  // Footer
  footer: {
    padding: spacing.lg,
    gap: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  doneButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.button,
  },
  doneButtonText: {
    ...typography.labelLarge,
    color: colors.textInverse,
  },
  emergencyButton: {
    backgroundColor: colors.error,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.button,
  },
  emergencyButtonText: {
    ...typography.labelLarge,
    color: colors.white,
  },
  historyButton: {
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyButtonText: {
    ...typography.label,
    color: colors.textSecondary,
  },
});
