/**
 * StickyCheckoutBar Component
 * Fixed bottom bar with pricing and action button
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getDiscountPercentage } from '../../data/services';
import { colors, spacing, radius, typography, shadows } from '../../theme';

interface StickyCheckoutBarProps {
  price: number;
  originalPrice?: number;
  buttonLabel: string;
  onPress: () => void;
  disabled?: boolean;
  isOnRequest?: boolean;
}

export function StickyCheckoutBar({
  price,
  originalPrice,
  buttonLabel,
  onPress,
  disabled = false,
  isOnRequest = false,
}: StickyCheckoutBarProps) {
  const insets = useSafeAreaInsets();
  const discount = getDiscountPercentage(price, originalPrice);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.priceSection}>
        {discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}%</Text>
          </View>
        )}
        <View style={styles.priceInfo}>
          {isOnRequest ? (
            <Text style={styles.onRequestLabel}>On Request</Text>
          ) : (
            <>
              <Text style={styles.currentPrice}>${price}</Text>
              {originalPrice && (
                <Text style={styles.originalPrice}>${originalPrice}</Text>
              )}
            </>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.actionButton, disabled && styles.actionButtonDisabled]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Text style={[styles.actionButtonText, disabled && styles.actionButtonTextDisabled]}>
          {buttonLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    rowGap: spacing.xs,
    ...shadows.card,
  },
  priceSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
    minWidth: 80,
  },
  discountBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    borderRadius: radius.sm,
  },
  discountText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  priceInfo: {
    alignItems: 'flex-start',
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    flexShrink: 1,
  },
  originalPrice: {
    ...typography.caption,
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  onRequestLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  actionButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    minWidth: 140,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: colors.surface2,
  },
  actionButtonText: {
    ...typography.label,
    fontWeight: '600',
    color: colors.white,
  },
  actionButtonTextDisabled: {
    color: colors.textTertiary,
  },
});
