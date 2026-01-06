/**
 * Triage Result Card Component
 * Displays structured triage output with clinical-grade sections
 *
 * Sections:
 * 1. What You Told Me - Summary of collected data
 * 2. Safety Check - Red flag assessment
 * 3. Most Likely Causes - Differential possibilities
 * 4. What You Can Do Now - Home remedies
 * 5. Seek Immediate Care If - Warning signs
 * 6. Recommended Next Steps - Action buttons
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../../theme';
import {
  HealthContext,
  UrgencyLevel,
  urgencyConfig,
  SuggestedAction,
  ServiceRecommendation,
  durationLabels,
  DISCLAIMER,
} from '../../types/askCarebow';
import { RedFlagRule } from '@/lib/askCarebow/safetyClassifier';

// ============================================
// TYPES
// ============================================

export type TriageResult = {
  // Collected data summary
  collectedData: {
    chiefComplaint: string;
    duration?: string;
    severity?: number;
    associatedSymptoms: string[];
    additionalContext: string[];
  };

  // Safety assessment
  safetyCheck: {
    passed: boolean;
    urgencyLevel: UrgencyLevel;
    redFlagsDetected: string[];
    matchedRules: RedFlagRule[];
  };

  // Differential possibilities
  possibleCauses: {
    primary: string;
    description: string;
    secondary?: { name: string; description: string }[];
  };

  // Home care guidance
  homeRemedies: string[];

  // Warning signs to watch for
  warningSignsToWatch: string[];

  // Recommended actions
  recommendedActions: SuggestedAction[];

  // Optional service recommendations
  serviceRecommendations?: ServiceRecommendation[];
};

type TriageResultCardProps = {
  result: TriageResult;
  onActionPress?: (action: SuggestedAction) => void;
  onServicePress?: (service: ServiceRecommendation) => void;
  onDismiss?: () => void;
};

// ============================================
// SECTION COMPONENTS
// ============================================

function SectionHeader({
  icon,
  iconBg,
  iconColor,
  title,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIconWrap, { backgroundColor: iconBg }]}>
        <Icon name={icon as any} size={18} color={iconColor} />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function CollapsibleSection({
  icon,
  iconBg,
  iconColor,
  title,
  defaultExpanded = true,
  children,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.collapsibleHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={[styles.sectionIconWrap, { backgroundColor: iconBg }]}>
          <Icon name={icon as any} size={18} color={iconColor} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Icon
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textTertiary}
        />
      </TouchableOpacity>
      {expanded && <View style={styles.sectionContent}>{children}</View>}
    </View>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function TriageResultCard({
  result,
  onActionPress,
  onServicePress,
  onDismiss,
}: TriageResultCardProps) {
  const urgency = urgencyConfig[result.safetyCheck.urgencyLevel];
  const isEmergency = result.safetyCheck.urgencyLevel === 'emergency';
  const isUrgent = result.safetyCheck.urgencyLevel === 'urgent';

  const handleConnectDoctor = () => {
    Alert.alert(
      'Telemedicine Coming Soon!',
      "We're working on connecting you directly with licensed doctors.\n\nIn the meantime:\n- Book an in-home caregiver visit\n- Visit your local urgent care",
      [
        { text: 'Notify Me When Available', style: 'default' },
        { text: 'OK', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Emergency Banner */}
      {isEmergency && (
        <View style={styles.emergencyBanner}>
          <Icon name="warning" size={24} color={colors.error} />
          <View style={styles.emergencyContent}>
            <Text style={styles.emergencyTitle}>Emergency Signs Detected</Text>
            <Text style={styles.emergencyText}>
              Please call 911 or seek immediate medical attention
            </Text>
          </View>
        </View>
      )}

      {/* 1. What You Told Me */}
      <CollapsibleSection
        icon="clipboard"
        iconBg={colors.infoSoft}
        iconColor={colors.info}
        title="What You Told Me"
        defaultExpanded={true}
      >
        <View style={styles.bulletList}>
          <View style={styles.bulletRow}>
            <Text style={styles.bulletLabel}>Primary:</Text>
            <Text style={styles.bulletValue}>{result.collectedData.chiefComplaint}</Text>
          </View>
          {result.collectedData.duration && (
            <View style={styles.bulletRow}>
              <Text style={styles.bulletLabel}>Duration:</Text>
              <Text style={styles.bulletValue}>
                {durationLabels[result.collectedData.duration as keyof typeof durationLabels] ||
                  result.collectedData.duration}
              </Text>
            </View>
          )}
          {result.collectedData.severity && (
            <View style={styles.bulletRow}>
              <Text style={styles.bulletLabel}>Severity:</Text>
              <Text style={styles.bulletValue}>{result.collectedData.severity}/10</Text>
            </View>
          )}
          {result.collectedData.associatedSymptoms.length > 0 && (
            <View style={styles.bulletRow}>
              <Text style={styles.bulletLabel}>Associated:</Text>
              <Text style={styles.bulletValue}>
                {result.collectedData.associatedSymptoms.join(', ')}
              </Text>
            </View>
          )}
        </View>
      </CollapsibleSection>

      {/* 2. Safety Check */}
      <View style={styles.section}>
        <View
          style={[
            styles.safetyCheckCard,
            { backgroundColor: urgency.bgColor, borderColor: urgency.color },
          ]}
        >
          <View style={styles.safetyCheckHeader}>
            <Icon
              name={result.safetyCheck.passed ? 'checkmark-circle' : 'warning'}
              size={24}
              color={urgency.color}
            />
            <View style={styles.safetyCheckContent}>
              <Text style={[styles.safetyCheckTitle, { color: urgency.color }]}>
                {result.safetyCheck.passed ? 'Safety Check: PASSED' : `Urgency: ${urgency.label}`}
              </Text>
              <Text style={styles.safetyCheckDescription}>{urgency.description}</Text>
            </View>
          </View>

          {result.safetyCheck.redFlagsDetected.length > 0 && (
            <View style={styles.redFlagsList}>
              <Text style={styles.redFlagsLabel}>Concerns detected:</Text>
              {result.safetyCheck.redFlagsDetected.map((flag, index) => (
                <Text key={index} style={[styles.redFlagItem, { color: urgency.color }]}>
                  - {flag}
                </Text>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* 3. Most Likely Causes */}
      <CollapsibleSection
        icon="search"
        iconBg={colors.equipmentSoft}
        iconColor={colors.equipment}
        title="Most Likely Causes"
        defaultExpanded={true}
      >
        <View style={styles.causesContainer}>
          <View style={styles.primaryCause}>
            <Text style={styles.primaryCauseLabel}>1. {result.possibleCauses.primary}</Text>
            <Text style={styles.primaryCauseDesc}>{result.possibleCauses.description}</Text>
          </View>

          {result.possibleCauses.secondary?.map((cause, index) => (
            <View key={index} style={styles.secondaryCause}>
              <Text style={styles.secondaryCauseLabel}>
                {index + 2}. {cause.name}
              </Text>
              <Text style={styles.secondaryCauseDesc}>{cause.description}</Text>
            </View>
          ))}

          <View style={styles.causeDisclaimer}>
            <Icon name="information-circle" size={14} color={colors.textTertiary} />
            <Text style={styles.causeDisclaimerText}>
              A healthcare professional can confirm the actual cause
            </Text>
          </View>
        </View>
      </CollapsibleSection>

      {/* 4. What You Can Do Now */}
      {result.homeRemedies.length > 0 && (
        <CollapsibleSection
          icon="home"
          iconBg={colors.successSoft}
          iconColor={colors.success}
          title="What You Can Do Now"
          defaultExpanded={true}
        >
          <View style={styles.remediesList}>
            {result.homeRemedies.map((remedy, index) => (
              <View key={index} style={styles.remedyRow}>
                <View style={styles.remedyBullet} />
                <Text style={styles.remedyText}>{remedy}</Text>
              </View>
            ))}
          </View>
        </CollapsibleSection>
      )}

      {/* 5. Seek Immediate Care If */}
      {result.warningSignsToWatch.length > 0 && (
        <View style={styles.section}>
          <View style={styles.warningSection}>
            <SectionHeader
              icon="alert-circle"
              iconBg={colors.warningSoft}
              iconColor={colors.warning}
              title="Seek Immediate Care If"
            />
            <View style={styles.warningList}>
              {result.warningSignsToWatch.map((sign, index) => (
                <View key={index} style={styles.warningRow}>
                  <Icon name="alert" size={14} color={colors.warning} />
                  <Text style={styles.warningText}>{sign}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* 6. Recommended Next Steps */}
      <View style={styles.section}>
        <SectionHeader
          icon="arrow-forward-circle"
          iconBg={colors.accentSoft}
          iconColor={colors.accent}
          title="Recommended Next Steps"
        />
        <View style={styles.actionsContainer}>
          {/* Connect to Doctor button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonPrimary]}
            onPress={handleConnectDoctor}
          >
            <Icon name="call" size={20} color={colors.textInverse} />
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonText}>Connect to Doctor</Text>
              <Text style={styles.actionButtonSubtext}>Coming Soon</Text>
            </View>
          </TouchableOpacity>

          {/* Service recommendations */}
          {result.serviceRecommendations?.map((service, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionButton}
              onPress={() => onServicePress?.(service)}
            >
              <Icon name="medical" size={20} color={colors.accent} />
              <View style={styles.actionButtonContent}>
                <Text style={styles.actionButtonTextSecondary}>{service.serviceTitle}</Text>
                <Text style={styles.actionButtonReason}>{service.reason}</Text>
              </View>
              <Icon name="chevron-forward" size={16} color={colors.textTertiary} />
            </TouchableOpacity>
          ))}

          {/* Monitor at home option for non-urgent */}
          {!isEmergency && !isUrgent && (
            <TouchableOpacity style={styles.actionButton} onPress={onDismiss}>
              <Icon name="analytics" size={20} color={colors.accent} />
              <View style={styles.actionButtonContent}>
                <Text style={styles.actionButtonTextSecondary}>Monitor at Home</Text>
                <Text style={styles.actionButtonReason}>Track symptoms over time</Text>
              </View>
              <Icon name="chevron-forward" size={16} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>{DISCLAIMER.short}</Text>
      </View>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.card,
  },

  // Emergency banner
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.errorSoft,
    borderBottomWidth: 1,
    borderBottomColor: colors.error,
    padding: spacing.md,
    gap: spacing.sm,
  },
  emergencyContent: {
    flex: 1,
  },
  emergencyTitle: {
    ...typography.labelLarge,
    color: colors.error,
    marginBottom: spacing.xxs,
  },
  emergencyText: {
    ...typography.bodySmall,
    color: colors.error,
  },

  // Section styles
  section: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sectionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    ...typography.h4,
    flex: 1,
  },
  sectionContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },

  // Bullet list
  bulletList: {
    gap: spacing.xs,
  },
  bulletRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  bulletLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  bulletValue: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },

  // Safety check
  safetyCheckCard: {
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  safetyCheckHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  safetyCheckContent: {
    flex: 1,
  },
  safetyCheckTitle: {
    ...typography.labelLarge,
    marginBottom: spacing.xxs,
  },
  safetyCheckDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  redFlagsList: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  redFlagsLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xxs,
  },
  redFlagItem: {
    ...typography.bodySmall,
  },

  // Causes
  causesContainer: {
    gap: spacing.sm,
  },
  primaryCause: {
    backgroundColor: colors.surface2,
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  primaryCauseLabel: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  primaryCauseDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  secondaryCause: {
    paddingLeft: spacing.sm,
  },
  secondaryCauseLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  secondaryCauseDesc: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  causeDisclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    marginTop: spacing.xs,
  },
  causeDisclaimerText: {
    ...typography.caption,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },

  // Remedies
  remediesList: {
    gap: spacing.xs,
  },
  remedyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  remedyBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginTop: 7,
  },
  remedyText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },

  // Warning section
  warningSection: {
    backgroundColor: colors.warningSoft,
    padding: spacing.md,
  },
  warningList: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  warningText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    flex: 1,
  },

  // Actions
  actionsContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  actionButtonPrimary: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  actionButtonContent: {
    flex: 1,
  },
  actionButtonText: {
    ...typography.labelLarge,
    color: colors.textInverse,
  },
  actionButtonTextSecondary: {
    ...typography.label,
    color: colors.textPrimary,
  },
  actionButtonSubtext: {
    ...typography.caption,
    color: colors.accentLight,
  },
  actionButtonReason: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  // Disclaimer
  disclaimer: {
    padding: spacing.md,
    backgroundColor: colors.surface2,
  },
  disclaimerText: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default TriageResultCard;
