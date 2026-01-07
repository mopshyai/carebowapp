/**
 * SubscriptionPlanCard Component
 * Card for subscription plan carousel with discount badges
 * Uses healthcare-grade SVG icons from the icon system
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SubscriptionPlan } from '../../data/subscriptions';
import { colors, spacing, radius } from '../../theme';
import { AppIcon, IconContainer, IconName } from '../icons';

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  onPress: () => void;
}

const getPlanConfig = (planId: string): { color: string; bgColor: string; icon: IconName } => {
  const config: Record<string, { color: string; bgColor: string; icon: IconName }> = {
    monthly: {
      color: '#3B82F6',
      bgColor: '#DBEAFE',
      icon: 'calendar',
    },
    half_yearly: {
      color: '#22C55E',
      bgColor: '#DCFCE7',
      icon: 'leaf',
    },
    yearly: {
      color: '#F59E0B',
      bgColor: '#FEF3C7',
      icon: 'trophy',
    },
    ask_carebow: {
      color: '#8B5CF6',
      bgColor: '#EDE9FE',
      icon: 'sparkles',
    },
  };
  return config[planId] || { color: '#64748B', bgColor: '#F1F5F9', icon: 'calendar' };
};

export function SubscriptionPlanCard({ plan, onPress }: SubscriptionPlanCardProps) {
  const config = getPlanConfig(plan.id);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Discount Badge */}
      {plan.discountPercent > 0 && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{plan.discountPercent}% OFF</Text>
        </View>
      )}

      {/* Icon */}
      <IconContainer
        size="md"
        variant="soft"
        backgroundColor={config.bgColor}
        style={styles.iconWrap}
      >
        <AppIcon name={config.icon} size={22} color={config.color} fillOpacity={0.2} />
      </IconContainer>

      {/* Period Label */}
      <Text style={styles.periodLabel}>{plan.periodLabel}</Text>

      {/* Title */}
      <Text style={styles.title} numberOfLines={2}>{plan.title}</Text>

      {/* Price */}
      <View style={styles.priceContainer}>
        <Text style={[styles.price, { color: config.color }]}>
          ${plan.price}
        </Text>
        {plan.originalPrice > plan.price && (
          <Text style={styles.originalPrice}>${plan.originalPrice}</Text>
        )}
      </View>

      {/* Rating */}
      <View style={styles.ratingRow}>
        <AppIcon name="star-filled" size={12} color="#F59E0B" fillOpacity={1} />
        <Text style={styles.ratingText}>{plan.rating}</Text>
        <Text style={styles.reviewText}>({plan.reviewCount})</Text>
      </View>

      {/* CTA */}
      <View style={[styles.ctaButton, { borderColor: config.color }]}>
        <Text style={[styles.ctaText, { color: config.color }]}>{plan.ctaLabel}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  discountBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
  iconWrap: {
    marginBottom: spacing.sm,
  },
  periodLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: spacing.xs,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
  },
  originalPrice: {
    fontSize: 12,
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.sm,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  reviewText: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  ctaButton: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 8,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
