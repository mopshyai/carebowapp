/**
 * SubscriptionPlanCard Component
 * Card for subscription plan carousel with image, rating, title, price
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StarRating } from './StarRating';
import { SubscriptionPlan } from '@/data/types';

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  onPress: () => void;
}

// TODO: Replace with actual plan images when available
const getPlanIcon = (imageKey: string): keyof typeof Ionicons.glyphMap => {
  const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
    one_month: 'calendar',
    six_month: 'calendar',
    twelve_month: 'calendar',
    ask_carebow: 'heart',
  };
  return iconMap[imageKey] || 'card';
};

const getPlanGradientColors = (planId: string): string[] => {
  const colorMap: Record<string, string[]> = {
    monthly: ['#3B82F6', '#1D4ED8'],
    half_yearly: ['#8B5CF6', '#6D28D9'],
    yearly: ['#EC4899', '#BE185D'],
    ask_carebow: ['#9333EA', '#7C3AED'],
  };
  return colorMap[planId] || ['#6B7280', '#4B5563'];
};

export function SubscriptionPlanCard({ plan, onPress }: SubscriptionPlanCardProps) {
  const icon = getPlanIcon(plan.image);
  const colors = getPlanGradientColors(plan.id);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardContent}>
        {/* Image/Icon Section */}
        <View style={[styles.imageContainer, { backgroundColor: colors[0] }]}>
          <Ionicons name={icon} size={48} color="#FFFFFF" />
          <Text style={styles.periodLabel}>{plan.periodLabel}</Text>
        </View>

        {/* Info Section */}
        <View style={styles.infoContainer}>
          <StarRating rating={plan.rating} size={12} />
          <Text style={styles.title} numberOfLines={2}>
            {plan.title}
          </Text>
          {plan.price !== null ? (
            <Text style={styles.price}>
              <Text style={styles.currency}>$</Text>
              {plan.price}
            </Text>
          ) : (
            <Text style={styles.viewDetails}>View details</Text>
          )}
        </View>
      </View>

      {/* Arrow CTA Panel */}
      <View style={[styles.ctaPanel, { backgroundColor: colors[0] }]}>
        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 180,
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
    flexDirection: 'row',
  },
  cardContent: {
    flex: 1,
  },
  imageContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 16,
  },
  periodLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 4,
    opacity: 0.9,
  },
  infoContainer: {
    padding: 12,
    gap: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  currency: {
    fontSize: 14,
    fontWeight: '500',
  },
  viewDetails: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9333EA',
  },
  ctaPanel: {
    width: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
});
