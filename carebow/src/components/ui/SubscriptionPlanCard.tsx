/**
 * SubscriptionPlanCard Component
 * Card for subscription plan carousel
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SubscriptionPlan } from '../../data/types';
import { Colors } from '@/constants/Colors';
import { Shadow } from '@/constants/Spacing';

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  onPress: () => void;
}

const getPlanConfig = (planId: string) => {
  const config: Record<string, { color: string; bgColor: string; icon: string; badge?: string }> = {
    monthly: {
      color: Colors.blue[600],
      bgColor: Colors.blue[50],
      icon: 'calendar-outline',
    },
    half_yearly: {
      color: Colors.purple[600],
      bgColor: Colors.purple[50],
      icon: 'layers-outline',
      badge: 'Popular',
    },
    yearly: {
      color: Colors.primary[600],
      bgColor: Colors.primary[50],
      icon: 'shield-checkmark-outline',
      badge: 'Best Value',
    },
    ask_carebow: {
      color: Colors.accent[500],
      bgColor: Colors.accent[50],
      icon: 'sparkles-outline',
    },
  };
  return config[planId] || { color: Colors.slate[600], bgColor: Colors.slate[100], icon: 'card-outline' };
};

export function SubscriptionPlanCard({ plan, onPress }: SubscriptionPlanCardProps) {
  const config = getPlanConfig(plan.id);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {config.badge && (
        <View style={[styles.badge, { backgroundColor: config.color }]}>
          <Text style={styles.badgeText}>{config.badge}</Text>
        </View>
      )}

      <View style={[styles.iconWrap, { backgroundColor: config.bgColor }]}>
        <Icon name={config.icon as any} size={24} color={config.color} />
      </View>

      <Text style={styles.periodLabel}>{plan.periodLabel}</Text>
      <Text style={styles.title} numberOfLines={2}>{plan.title}</Text>

      {plan.price !== null ? (
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: config.color }]}>
            <Text style={styles.currency}>$</Text>
            {plan.price}
          </Text>
          <Text style={styles.priceUnit}>/mo</Text>
        </View>
      ) : (
        <Text style={[styles.viewDetails, { color: config.color }]}>Learn more</Text>
      )}

      <View style={styles.featuresWrap}>
        <View style={styles.featureRow}>
          <Icon name="checkmark-circle" size={14} color={Colors.green[500]} />
          <Text style={styles.featureText}>Priority support</Text>
        </View>
        <View style={styles.featureRow}>
          <Icon name="checkmark-circle" size={14} color={Colors.green[500]} />
          <Text style={styles.featureText}>All services</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    minWidth: 150,
    maxWidth: 180,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.slate[200],
    ...Shadow.card,
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  periodLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.slate[400],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.slate[900],
    lineHeight: 18,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  price: {
    fontSize: 22,
    fontWeight: '700',
  },
  currency: {
    fontSize: 14,
    fontWeight: '600',
  },
  priceUnit: {
    fontSize: 12,
    color: Colors.slate[400],
    marginLeft: 2,
  },
  viewDetails: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  featuresWrap: {
    gap: 6,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 11,
    color: Colors.slate[500],
  },
});
