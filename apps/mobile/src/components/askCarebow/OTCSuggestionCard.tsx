/**
 * OTCSuggestionCard Component
 * Displays OTC medication suggestions with Indian brand names
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../../theme';

export interface OTCMedicationData {
  generic: string;
  commonBrands: string[];
  use: string;
  howToTake: string;
  adultDose: string;
  childrenDose?: string;
  cautions: string[];
  forChildren: boolean;
  elderlyConsideration?: string;
}

interface OTCSuggestionCardProps {
  medication: OTCMedicationData;
  priority?: 'primary' | 'alternative';
  isExpanded?: boolean;
}

export function OTCSuggestionCard({
  medication,
  priority = 'primary',
  isExpanded = false,
}: OTCSuggestionCardProps) {
  const [expanded, setExpanded] = useState(isExpanded);

  const isPrimary = priority === 'primary';

  return (
    <View style={[styles.container, isPrimary && styles.primaryContainer]}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, isPrimary && styles.primaryIcon]}>
          <Icon name="medical" size={20} color={isPrimary ? colors.accent : colors.textTertiary} />
        </View>
        <View style={styles.titleSection}>
          <Text style={styles.genericName}>{medication.generic}</Text>
          <View style={styles.brandsRow}>
            {medication.commonBrands.slice(0, 3).map((brand, index) => (
              <Text key={index} style={styles.brandName}>
                {brand}
                {index < Math.min(medication.commonBrands.length, 3) - 1 ? ', ' : ''}
              </Text>
            ))}
          </View>
        </View>
        {isPrimary && (
          <View style={styles.recommendedBadge}>
            <Icon name="checkmark-circle" size={14} color={colors.success} />
            <Text style={styles.recommendedText}>Recommended</Text>
          </View>
        )}
        <Icon
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textTertiary}
        />
      </TouchableOpacity>

      <Text style={styles.use}>{medication.use}</Text>

      {/* Quick Info Badges */}
      <View style={styles.quickInfoRow}>
        {medication.forChildren && (
          <View style={styles.safetyBadge}>
            <Icon name="happy" size={12} color={colors.success} />
            <Text style={styles.safetyText}>Child-safe options</Text>
          </View>
        )}
        {medication.elderlyConsideration && (
          <View style={[styles.safetyBadge, { backgroundColor: colors.infoSoft }]}>
            <Icon name="information-circle" size={12} color={colors.info} />
            <Text style={[styles.safetyText, { color: colors.info }]}>Elderly note</Text>
          </View>
        )}
      </View>

      {/* Expanded Content */}
      {expanded && (
        <View style={styles.expandedContent}>
          {/* Dosage Section */}
          <View style={styles.dosageCard}>
            <View style={styles.sectionHeader}>
              <Icon name="flask" size={16} color={colors.accent} />
              <Text style={styles.sectionTitle}>Dosage</Text>
            </View>

            <View style={styles.dosageRow}>
              <View style={styles.dosageItem}>
                <Text style={styles.dosageLabel}>Adults</Text>
                <Text style={styles.dosageValue}>{medication.adultDose}</Text>
              </View>
              {medication.childrenDose && (
                <View style={styles.dosageItem}>
                  <Text style={styles.dosageLabel}>Children</Text>
                  <Text style={styles.dosageValue}>{medication.childrenDose}</Text>
                </View>
              )}
            </View>
          </View>

          {/* How to Take */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="time" size={16} color={colors.accent} />
              <Text style={styles.sectionTitle}>How to Take</Text>
            </View>
            <Text style={styles.howToText}>{medication.howToTake}</Text>
          </View>

          {/* Elderly Consideration */}
          {medication.elderlyConsideration && (
            <View style={styles.elderlyNote}>
              <Icon name="accessibility" size={16} color={colors.info} />
              <Text style={styles.elderlyText}>{medication.elderlyConsideration}</Text>
            </View>
          )}

          {/* Cautions */}
          {medication.cautions.length > 0 && (
            <View style={styles.cautionsSection}>
              <View style={styles.sectionHeader}>
                <Icon name="warning" size={16} color={colors.warning} />
                <Text style={[styles.sectionTitle, { color: colors.warning }]}>Cautions</Text>
              </View>
              {medication.cautions.map((caution, index) => (
                <View key={index} style={styles.cautionItem}>
                  <View style={styles.cautionDot} />
                  <Text style={styles.cautionText}>{caution}</Text>
                </View>
              ))}
            </View>
          )}

          {/* All Available Brands */}
          {medication.commonBrands.length > 3 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="pricetag" size={16} color={colors.accent} />
                <Text style={styles.sectionTitle}>All Brand Options</Text>
              </View>
              <View style={styles.allBrandsRow}>
                {medication.commonBrands.map((brand, index) => (
                  <View key={index} style={styles.brandChip}>
                    <Text style={styles.brandChipText}>{brand}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Pharmacy Note */}
          <View style={styles.pharmacyNote}>
            <Icon name="storefront" size={14} color={colors.textTertiary} />
            <Text style={styles.pharmacyText}>
              Available at any pharmacy. No prescription needed.
            </Text>
          </View>
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
  primaryContainer: {
    borderColor: colors.accentSoft,
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surface2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  primaryIcon: {
    backgroundColor: colors.accentSoft,
  },
  titleSection: {
    flex: 1,
  },
  genericName: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  brandsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  brandName: {
    ...typography.caption,
    color: colors.accent,
  },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successSoft,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    borderRadius: radius.xs,
    marginRight: spacing.xs,
    gap: 4,
  },
  recommendedText: {
    ...typography.tiny,
    color: colors.success,
  },
  use: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  quickInfoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  safetyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successSoft,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
    gap: 4,
  },
  safetyText: {
    ...typography.tiny,
    color: colors.success,
  },
  expandedContent: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  dosageCard: {
    backgroundColor: colors.accentMuted,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  dosageRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  dosageItem: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.xs,
    alignItems: 'center',
  },
  dosageLabel: {
    ...typography.tiny,
    color: colors.textTertiary,
  },
  dosageValue: {
    ...typography.labelSmall,
    color: colors.accent,
    marginTop: 2,
    textAlign: 'center',
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
  howToText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    paddingLeft: spacing.xl,
  },
  elderlyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.infoSoft,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  elderlyText: {
    ...typography.bodySmall,
    color: colors.info,
    flex: 1,
  },
  cautionsSection: {
    backgroundColor: colors.warningSoft,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
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
  allBrandsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingLeft: spacing.xl,
  },
  brandChip: {
    backgroundColor: colors.surface2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  brandChipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  pharmacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: spacing.xs,
  },
  pharmacyText: {
    ...typography.caption,
    color: colors.textTertiary,
    flex: 1,
  },
});
