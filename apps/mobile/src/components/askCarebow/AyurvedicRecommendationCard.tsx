/**
 * AyurvedicRecommendationCard Component
 * Displays Ayurvedic formulations with dosage and traditional information
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../../theme';

export interface AyurvedicFormulationData {
  name: string;
  sanskritName?: string;
  description: string;
  keyIngredients?: string[];
  primaryUses?: string[];
  dosage?: {
    adult: string;
    children?: string;
    elderly?: string;
  };
  bestTime?: string;
  duration?: string;
  contraindications?: string[];
  formulations?: string[];
}

interface AyurvedicRecommendationCardProps {
  formulation: AyurvedicFormulationData;
  isExpanded?: boolean;
}

export function AyurvedicRecommendationCard({
  formulation,
  isExpanded = false,
}: AyurvedicRecommendationCardProps) {
  const [expanded, setExpanded] = useState(isExpanded);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <Icon name="flower" size={20} color={colors.secondary} />
        </View>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{formulation.name}</Text>
          {formulation.sanskritName && (
            <Text style={styles.sanskritName}>{formulation.sanskritName}</Text>
          )}
        </View>
        <View style={styles.ayurvedaBadge}>
          <Text style={styles.ayurvedaText}>Ayurveda</Text>
        </View>
        <Icon
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textTertiary}
        />
      </TouchableOpacity>

      <Text style={styles.description}>{formulation.description}</Text>

      {/* Key Ingredients Pills */}
      {formulation.keyIngredients && formulation.keyIngredients.length > 0 && (
        <View style={styles.ingredientRow}>
          {formulation.keyIngredients.slice(0, 4).map((ingredient, index) => (
            <View key={index} style={styles.ingredientPill}>
              <Text style={styles.ingredientText}>{ingredient}</Text>
            </View>
          ))}
          {formulation.keyIngredients.length > 4 && (
            <View style={styles.ingredientPill}>
              <Text style={styles.ingredientText}>+{formulation.keyIngredients.length - 4}</Text>
            </View>
          )}
        </View>
      )}

      {/* Expanded Content */}
      {expanded && (
        <View style={styles.expandedContent}>
          {/* Primary Uses */}
          {formulation.primaryUses && formulation.primaryUses.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="medical" size={16} color={colors.accent} />
                <Text style={styles.sectionTitle}>Primary Benefits</Text>
              </View>
              {formulation.primaryUses.map((use, index) => (
                <View key={index} style={styles.bulletItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.bulletText}>{use}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Dosage Section */}
          {formulation.dosage && (
            <View style={styles.dosageSection}>
              <View style={styles.sectionHeader}>
                <Icon name="flask" size={16} color={colors.accent} />
                <Text style={styles.sectionTitle}>Dosage</Text>
              </View>
              <View style={styles.dosageGrid}>
                <View style={styles.dosageItem}>
                  <Icon name="person" size={14} color={colors.textTertiary} />
                  <Text style={styles.dosageLabel}>Adults</Text>
                  <Text style={styles.dosageValue}>{formulation.dosage.adult}</Text>
                </View>
                {formulation.dosage.children && (
                  <View style={styles.dosageItem}>
                    <Icon name="happy" size={14} color={colors.textTertiary} />
                    <Text style={styles.dosageLabel}>Children</Text>
                    <Text style={styles.dosageValue}>{formulation.dosage.children}</Text>
                  </View>
                )}
                {formulation.dosage.elderly && (
                  <View style={styles.dosageItem}>
                    <Icon name="accessibility" size={14} color={colors.textTertiary} />
                    <Text style={styles.dosageLabel}>Elderly</Text>
                    <Text style={styles.dosageValue}>{formulation.dosage.elderly}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Best Time & Duration */}
          {(formulation.bestTime || formulation.duration) && (
            <View style={styles.timingRow}>
              {formulation.bestTime && (
                <View style={styles.timingItem}>
                  <Icon name="time" size={14} color={colors.info} />
                  <Text style={styles.timingText}>{formulation.bestTime}</Text>
                </View>
              )}
              {formulation.duration && (
                <View style={styles.timingItem}>
                  <Icon name="calendar" size={14} color={colors.info} />
                  <Text style={styles.timingText}>{formulation.duration}</Text>
                </View>
              )}
            </View>
          )}

          {/* Available Forms */}
          {formulation.formulations && formulation.formulations.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="cube" size={16} color={colors.accent} />
                <Text style={styles.sectionTitle}>Available Forms</Text>
              </View>
              <View style={styles.formsRow}>
                {formulation.formulations.map((form, index) => (
                  <View key={index} style={styles.formChip}>
                    <Text style={styles.formText}>{form}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Contraindications */}
          {formulation.contraindications && formulation.contraindications.length > 0 && (
            <View style={styles.warningSection}>
              <View style={styles.sectionHeader}>
                <Icon name="alert-circle" size={16} color={colors.warning} />
                <Text style={[styles.sectionTitle, { color: colors.warning }]}>
                  Not Recommended For
                </Text>
              </View>
              {formulation.contraindications.map((item, index) => (
                <View key={index} style={styles.bulletItem}>
                  <View style={[styles.bullet, { backgroundColor: colors.warning }]} />
                  <Text style={styles.cautionText}>{item}</Text>
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
    backgroundColor: colors.secondarySoft,
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
  sanskritName: {
    ...typography.caption,
    color: colors.textTertiary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  ayurvedaBadge: {
    backgroundColor: colors.secondarySoft,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    borderRadius: radius.xs,
    marginRight: spacing.xs,
  },
  ayurvedaText: {
    ...typography.tiny,
    color: colors.secondary,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  ingredientRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    gap: spacing.xxs,
  },
  ingredientPill: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  ingredientText: {
    ...typography.tiny,
    color: colors.accent,
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
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.xxs,
    paddingLeft: spacing.xl,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginTop: 6,
    marginRight: spacing.xs,
  },
  bulletText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  dosageSection: {
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  dosageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  dosageItem: {
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
    padding: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
  },
  dosageLabel: {
    ...typography.tiny,
    color: colors.textTertiary,
    marginTop: 4,
  },
  dosageValue: {
    ...typography.labelSmall,
    color: colors.textPrimary,
    marginTop: 2,
    textAlign: 'center',
  },
  timingRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  timingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  timingText: {
    ...typography.caption,
    color: colors.info,
  },
  formsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingLeft: spacing.xl,
  },
  formChip: {
    backgroundColor: colors.surface2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  warningSection: {
    backgroundColor: colors.warningSoft,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  cautionText: {
    ...typography.caption,
    color: colors.warning,
    flex: 1,
  },
});
