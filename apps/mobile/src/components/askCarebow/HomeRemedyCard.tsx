/**
 * HomeRemedyCard Component
 * Displays individual home remedy (Gharelu Nuskhe) with Hindi names
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../../theme';

export interface HomeRemedyData {
  name: string;
  hindiName?: string;
  description: string;
  howTo: string;
  timing?: string;
  effectiveness?: 'high' | 'moderate' | 'mild';
  evidenceLevel?: 'traditional' | 'researched' | 'clinically_proven';
  contraindications?: string[];
}

interface HomeRemedyCardProps {
  remedy: HomeRemedyData;
  isExpanded?: boolean;
  onToggle?: () => void;
}

const effectivenessConfig = {
  high: { label: 'Highly Effective', color: colors.success, icon: 'star' },
  moderate: { label: 'Moderately Effective', color: colors.warning, icon: 'star-half' },
  mild: { label: 'Mild Relief', color: colors.info, icon: 'star-outline' },
};

const evidenceConfig = {
  traditional: { label: 'Traditional', icon: 'leaf' },
  researched: { label: 'Researched', icon: 'flask' },
  clinically_proven: { label: 'Clinically Proven', icon: 'checkmark-circle' },
};

export function HomeRemedyCard({ remedy, isExpanded = false, onToggle }: HomeRemedyCardProps) {
  const [expanded, setExpanded] = useState(isExpanded);
  const effectiveness = remedy.effectiveness ? effectivenessConfig[remedy.effectiveness] : null;
  const evidence = remedy.evidenceLevel ? evidenceConfig[remedy.evidenceLevel] : null;

  const toggleExpand = () => {
    setExpanded(!expanded);
    onToggle?.();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={toggleExpand} activeOpacity={0.7}>
        <View style={styles.iconContainer}>
          <Icon name="leaf" size={20} color={colors.success} />
        </View>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{remedy.name}</Text>
          {remedy.hindiName && <Text style={styles.hindiName}>{remedy.hindiName}</Text>}
        </View>
        <Icon
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textTertiary}
        />
      </TouchableOpacity>

      {/* Badges Row */}
      <View style={styles.badgesRow}>
        {effectiveness && (
          <View style={[styles.badge, { backgroundColor: `${effectiveness.color}15` }]}>
            <Icon name={effectiveness.icon} size={12} color={effectiveness.color} />
            <Text style={[styles.badgeText, { color: effectiveness.color }]}>
              {effectiveness.label}
            </Text>
          </View>
        )}
        {evidence && (
          <View style={[styles.badge, { backgroundColor: colors.infoSoft }]}>
            <Icon name={evidence.icon} size={12} color={colors.info} />
            <Text style={[styles.badgeText, { color: colors.info }]}>{evidence.label}</Text>
          </View>
        )}
      </View>

      {/* Description */}
      <Text style={styles.description}>{remedy.description}</Text>

      {/* Expanded Content */}
      {expanded && (
        <View style={styles.expandedContent}>
          {/* How To Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="list" size={16} color={colors.accent} />
              <Text style={styles.sectionTitle}>How to Prepare & Use</Text>
            </View>
            <Text style={styles.sectionText}>{remedy.howTo}</Text>
          </View>

          {/* Timing */}
          {remedy.timing && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="time" size={16} color={colors.accent} />
                <Text style={styles.sectionTitle}>When to Take</Text>
              </View>
              <Text style={styles.sectionText}>{remedy.timing}</Text>
            </View>
          )}

          {/* Contraindications */}
          {remedy.contraindications && remedy.contraindications.length > 0 && (
            <View style={styles.warningSection}>
              <View style={styles.sectionHeader}>
                <Icon name="warning" size={16} color={colors.warning} />
                <Text style={[styles.sectionTitle, { color: colors.warning }]}>Cautions</Text>
              </View>
              {remedy.contraindications.map((caution, index) => (
                <View key={index} style={styles.cautionItem}>
                  <View style={styles.cautionDot} />
                  <Text style={styles.cautionText}>{caution}</Text>
                </View>
              ))}
            </View>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.successSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  hindiName: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    borderRadius: radius.xs,
    gap: 4,
  },
  badgeText: {
    ...typography.tiny,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  expandedContent: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textPrimary,
  },
  sectionText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    paddingLeft: spacing.xl,
  },
  warningSection: {
    backgroundColor: colors.warningSoft,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  cautionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.xxs,
    paddingLeft: spacing.xl,
  },
  cautionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.warning,
    marginTop: 6,
    marginRight: spacing.xs,
  },
  cautionText: {
    ...typography.caption,
    color: colors.warning,
    flex: 1,
  },
});
