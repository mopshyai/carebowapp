/**
 * PriceText Component
 * Flexible price display that handles wrapping gracefully
 * Prevents price overflow on small screens and with long prices
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, typography } from '../../theme';

// =============================================================================
// TYPES
// =============================================================================

interface PriceTextProps {
  /** Price amount (number or string for formatted prices) */
  amount: number | string;
  /** Optional prefix like "From" */
  prefix?: string;
  /** Currency symbol (default: "$") */
  currencySymbol?: string;
  /** Optional suffix like "/month", "/4h", "/hr" */
  suffix?: string;
  /** Original price for showing strikethrough */
  originalAmount?: number | string;
  /** Size variant */
  size?: 'tiny' | 'small' | 'medium' | 'large' | 'display';
  /** Main price color */
  color?: string;
  /** Secondary text color (prefix, suffix, original price) */
  secondaryColor?: string;
  /** Container style */
  style?: ViewStyle;
  /** Whether to show the price inline or as a block */
  inline?: boolean;
}

// =============================================================================
// SIZE CONFIGURATIONS
// =============================================================================

const sizeConfig = {
  tiny: {
    prefixSize: 10,
    currencySize: 10,
    amountSize: 11,
    suffixSize: 10,
    originalSize: 9,
    lineHeight: 14,
  },
  small: {
    prefixSize: 11,
    currencySize: 12,
    amountSize: 13,
    suffixSize: 11,
    originalSize: 10,
    lineHeight: 16,
  },
  medium: {
    prefixSize: 12,
    currencySize: 14,
    amountSize: 16,
    suffixSize: 12,
    originalSize: 12,
    lineHeight: 20,
  },
  large: {
    prefixSize: 13,
    currencySize: 16,
    amountSize: 22,
    suffixSize: 13,
    originalSize: 14,
    lineHeight: 26,
  },
  display: {
    prefixSize: 14,
    currencySize: 18,
    amountSize: 28,
    suffixSize: 14,
    originalSize: 16,
    lineHeight: 32,
  },
};

// =============================================================================
// PRICE TEXT COMPONENT
// =============================================================================

export function PriceText({
  amount,
  prefix,
  currencySymbol = '$',
  suffix,
  originalAmount,
  size = 'medium',
  color = colors.textPrimary,
  secondaryColor = colors.textTertiary,
  style,
  inline = false,
}: PriceTextProps) {
  const config = sizeConfig[size];

  // Format amount - handle both numbers and strings
  const formattedAmount = typeof amount === 'number'
    ? amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    : amount;

  const formattedOriginal = originalAmount
    ? typeof originalAmount === 'number'
      ? originalAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
      : originalAmount
    : null;

  const containerStyle: ViewStyle = inline
    ? styles.inlineContainer
    : styles.wrapContainer;

  return (
    <View style={[containerStyle, style]}>
      {/* Main price row */}
      <View style={styles.priceRow}>
        {prefix && (
          <Text
            style={[
              styles.prefix,
              {
                fontSize: config.prefixSize,
                lineHeight: config.lineHeight,
                color: secondaryColor,
              },
            ]}
          >
            {prefix}{' '}
          </Text>
        )}
        <Text
          style={[
            styles.currency,
            {
              fontSize: config.currencySize,
              lineHeight: config.lineHeight,
              color: color,
            },
          ]}
        >
          {currencySymbol}
        </Text>
        <Text
          style={[
            styles.amount,
            {
              fontSize: config.amountSize,
              lineHeight: config.lineHeight,
              color: color,
            },
          ]}
        >
          {formattedAmount}
        </Text>
        {suffix && (
          <Text
            style={[
              styles.suffix,
              {
                fontSize: config.suffixSize,
                lineHeight: config.lineHeight,
                color: secondaryColor,
              },
            ]}
          >
            {suffix}
          </Text>
        )}
      </View>

      {/* Original price (strikethrough) */}
      {formattedOriginal && (
        <Text
          style={[
            styles.originalPrice,
            {
              fontSize: config.originalSize,
              color: secondaryColor,
            },
          ]}
        >
          {currencySymbol}{formattedOriginal}
        </Text>
      )}
    </View>
  );
}

// =============================================================================
// PRICE ROW COMPONENT (for badge + price combinations)
// =============================================================================

interface PriceRowProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * A row container that wraps its children (badges + price)
 * Use this when you need badges and price on the same line with wrapping support
 */
export function PriceRow({ children, style }: PriceRowProps) {
  return <View style={[styles.priceRowContainer, style]}>{children}</View>;
}

// =============================================================================
// DISCOUNT BADGE COMPONENT
// =============================================================================

interface DiscountBadgeProps {
  percentage: number | string;
  style?: ViewStyle;
}

export function DiscountBadge({ percentage, style }: DiscountBadgeProps) {
  return (
    <View style={[styles.discountBadge, style]}>
      <Text style={styles.discountText}>
        {typeof percentage === 'number' ? `${percentage}%` : percentage}
      </Text>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  // Container styles
  wrapContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    flexShrink: 1,
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    flexShrink: 1,
  },

  // Price row that wraps
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    flexShrink: 1,
  },

  // Price row container (for badge + price)
  priceRowContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    rowGap: spacing.xxs,
    columnGap: spacing.xs,
  },

  // Text styles
  prefix: {
    fontWeight: '500',
  },
  currency: {
    fontWeight: '600',
  },
  amount: {
    fontWeight: '700',
  },
  suffix: {
    fontWeight: '500',
    marginLeft: 1,
  },
  originalPrice: {
    fontWeight: '500',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },

  // Discount badge
  discountBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
});
