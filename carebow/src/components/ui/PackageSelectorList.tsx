/**
 * PackageSelectorList Component
 * Displays a list of selectable service packages with pricing
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ServicePackage } from '../../data/types';
import { getDiscountPercentage } from '../../data/services';
import { colors, spacing, radius, typography, shadows } from '../../theme';

interface PackageSelectorListProps {
  packages: ServicePackage[];
  selectedPackageId: string | null;
  onSelectPackage: (pkg: ServicePackage) => void;
}

export function PackageSelectorList({
  packages,
  selectedPackageId,
  onSelectPackage,
}: PackageSelectorListProps) {
  return (
    <View style={styles.container}>
      {packages.map((pkg) => {
        const isSelected = selectedPackageId === pkg.id;
        const discount = getDiscountPercentage(pkg.price, pkg.originalPrice);

        return (
          <TouchableOpacity
            key={pkg.id}
            style={[styles.packageRow, isSelected && styles.packageRowSelected]}
            onPress={() => onSelectPackage(pkg)}
            activeOpacity={0.7}
          >
            <View style={styles.packageInfo}>
              <View style={styles.labelRow}>
                <Text
                  style={[styles.packageLabel, isSelected && styles.packageLabelSelected]}
                  numberOfLines={1}
                >
                  {pkg.label}
                </Text>
                {discount && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{discount}% off</Text>
                  </View>
                )}
              </View>
              {pkg.notes && (
                <Text
                  style={[styles.packageNotes, isSelected && styles.packageNotesSelected]}
                  numberOfLines={1}
                >
                  {pkg.notes}
                </Text>
              )}
            </View>

            <View style={styles.priceContainer}>
              <Text style={[styles.price, isSelected && styles.priceSelected]}>
                ${pkg.price}
              </Text>
              {pkg.originalPrice && (
                <Text style={styles.originalPrice}>${pkg.originalPrice}</Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  packageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    rowGap: spacing.xs,
    ...shadows.card,
  },
  packageRowSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  packageInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
    rowGap: spacing.xxs,
  },
  packageLabel: {
    ...typography.label,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  packageLabelSelected: {
    color: colors.white,
  },
  discountBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.xxs,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.white,
  },
  packageNotes: {
    ...typography.tiny,
    color: colors.textSecondary,
    marginTop: 2,
  },
  packageNotesSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  priceContainer: {
    alignItems: 'flex-end',
    flexShrink: 0,
    minWidth: 60,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  priceSelected: {
    color: colors.white,
  },
  originalPrice: {
    ...typography.tiny,
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
});
