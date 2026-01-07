/**
 * GuidanceCard Component
 * Displays health guidance with structured sections
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { GuidanceResponse, UrgencyLevel, urgencyConfig } from '../../types/askCarebow';
import { colors, spacing, radius, typography, shadows } from '../../theme';

interface GuidanceCardProps {
  guidance: GuidanceResponse;
  urgencyLevel?: UrgencyLevel;
}

export function GuidanceCard({ guidance, urgencyLevel = 'monitor' }: GuidanceCardProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['immediateActions'])
  );
  const urgency = urgencyConfig[urgencyLevel];

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  return (
    <View style={styles.container}>
      {/* Urgency Badge */}
      <View style={[styles.urgencyBadge, { backgroundColor: urgency.bgColor }]}>
        <View style={[styles.urgencyDot, { backgroundColor: urgency.color }]} />
        <Text style={[styles.urgencyText, { color: urgency.color }]}>{urgency.label}</Text>
      </View>

      {/* Possible Causes Section */}
      {guidance.possibleCauses.length > 0 && (
        <GuidanceSection
          title="What this may be related to"
          icon="help-circle"
          iconColor={colors.info}
          items={guidance.possibleCauses}
          isExpanded={expandedSections.has('possibleCauses')}
          onToggle={() => toggleSection('possibleCauses')}
        />
      )}

      {/* Immediate Actions Section */}
      {guidance.immediateActions.length > 0 && (
        <GuidanceSection
          title="What you can do right now"
          icon="medkit"
          iconColor={colors.accent}
          items={guidance.immediateActions}
          isExpanded={expandedSections.has('immediateActions')}
          onToggle={() => toggleSection('immediateActions')}
          highlighted
        />
      )}

      {/* When to Seek Help Section */}
      {guidance.whenToSeekHelp.length > 0 && (
        <GuidanceSection
          title="When to seek medical help"
          icon="warning"
          iconColor={colors.warning}
          items={guidance.whenToSeekHelp}
          isExpanded={expandedSections.has('whenToSeekHelp')}
          onToggle={() => toggleSection('whenToSeekHelp')}
        />
      )}

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Icon name="information-circle" size={16} color={colors.textTertiary} />
        <Text style={styles.disclaimerText}>
          This is general guidance only, not a diagnosis. Please consult a healthcare provider for
          medical advice.
        </Text>
      </View>
    </View>
  );
}

interface GuidanceSectionProps {
  title: string;
  icon: string;
  iconColor: string;
  items: string[];
  isExpanded: boolean;
  onToggle: () => void;
  highlighted?: boolean;
}

function GuidanceSection({
  title,
  icon,
  iconColor,
  items,
  isExpanded,
  onToggle,
  highlighted,
}: GuidanceSectionProps) {
  return (
    <View style={[styles.section, highlighted && styles.sectionHighlighted]}>
      <TouchableOpacity style={styles.sectionHeader} onPress={onToggle} activeOpacity={0.7}>
        <View style={styles.sectionTitleContainer}>
          <View style={[styles.sectionIcon, { backgroundColor: `${iconColor}20` }]}>
            <Icon name={icon} size={18} color={iconColor} />
          </View>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <Icon
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textTertiary}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.sectionContent}>
          {items.map((item, index) => (
            <View key={index} style={styles.item}>
              <View style={styles.bulletPoint} />
              <Text style={styles.itemText}>{item}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginVertical: spacing.xs,
    ...shadows.card,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
    marginBottom: spacing.md,
    gap: spacing.xxs,
  },
  urgencyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  urgencyText: {
    ...typography.labelSmall,
  },
  section: {
    marginBottom: spacing.sm,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  sectionHighlighted: {
    backgroundColor: colors.accentMuted,
    borderWidth: 1,
    borderColor: colors.accentSoft,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textPrimary,
    flex: 1,
  },
  sectionContent: {
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.xs,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.xs,
    paddingLeft: 40, // Align with title text
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginTop: 7,
    marginRight: spacing.xs,
  },
  itemText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: spacing.xs,
  },
  disclaimerText: {
    ...typography.caption,
    color: colors.textTertiary,
    flex: 1,
  },
});
