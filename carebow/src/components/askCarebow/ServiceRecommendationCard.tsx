/**
 * ServiceRecommendationCard Component
 * Displays a recommended service with booking action
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ServiceRecommendation, urgencyConfig } from '../../types/askCarebow';
import { colors, spacing, radius, typography, shadows } from '../../theme';

interface ServiceRecommendationCardProps {
  recommendation: ServiceRecommendation;
  onBook: () => void;
}

const serviceIcons: Record<string, string> = {
  emergency: 'warning',
  urgent_care: 'medical',
  video_consult: 'videocam',
  in_person_visit: 'person',
  specialist_referral: 'people',
  mental_health: 'heart',
  pharmacy_consult: 'medkit',
  lab_test: 'flask',
  self_care_guidance: 'home',
};

export function ServiceRecommendationCard({
  recommendation,
  onBook,
}: ServiceRecommendationCardProps) {
  const urgency = urgencyConfig[recommendation.urgency];
  const icon = serviceIcons[recommendation.serviceId] || 'medical';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: urgency.bgColor }]}>
          <Icon name={icon} size={24} color={urgency.color} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{recommendation.serviceTitle}</Text>
          <View style={[styles.urgencyBadge, { backgroundColor: urgency.bgColor }]}>
            <Text style={[styles.urgencyText, { color: urgency.color }]}>{urgency.action}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.reason}>{recommendation.reason}</Text>

      <TouchableOpacity style={styles.bookButton} onPress={onBook} activeOpacity={0.8}>
        <Text style={styles.bookButtonText}>Book Now</Text>
        <Icon name="arrow-forward" size={18} color={colors.textInverse} />
      </TouchableOpacity>
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
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  titleContainer: {
    flex: 1,
    gap: spacing.xxs,
  },
  title: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  urgencyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    borderRadius: radius.xs,
  },
  urgencyText: {
    ...typography.tiny,
    textTransform: 'uppercase',
  },
  reason: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    ...shadows.button,
  },
  bookButtonText: {
    ...typography.labelLarge,
    color: colors.textInverse,
  },
});
