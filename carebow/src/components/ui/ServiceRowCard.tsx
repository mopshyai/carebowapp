/**
 * ServiceRowCard Component
 * Horizontal card with icon on left, title and rating on right
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { StarRating } from './StarRating';
import { ServiceItem } from '../../data/types';
import { colors, spacing, radius, typography, shadows } from '../../theme';

interface ServiceRowCardProps {
  service: ServiceItem;
  onPress: () => void;
}

// Map service image keys to icons with category-appropriate colors
const getServiceIconConfig = (imageKey: string): { icon: keyof typeof Ionicons.glyphMap; color: string; bgColor: string } => {
  const iconMap: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string; bgColor: string }> = {
    companionship: { icon: 'people', color: colors.nursing, bgColor: colors.nursingSoft },
    transport: { icon: 'car', color: colors.accent, bgColor: colors.accentSoft },
    food: { icon: 'restaurant', color: colors.secondary, bgColor: colors.secondarySoft },
    cleaning: { icon: 'sparkles', color: colors.accent, bgColor: colors.accentSoft },
    culture: { icon: 'color-palette', color: colors.equipment, bgColor: colors.equipmentSoft },
    barber: { icon: 'cut', color: colors.accent, bgColor: colors.accentSoft },
    yoga: { icon: 'body', color: colors.success, bgColor: colors.successSoft },
    nurse: { icon: 'medkit', color: colors.nursing, bgColor: colors.nursingSoft },
    transactional: { icon: 'card', color: colors.info, bgColor: colors.infoSoft },
    physio: { icon: 'fitness', color: colors.success, bgColor: colors.successSoft },
    doctor: { icon: 'medical', color: colors.medical, bgColor: colors.medicalSoft },
    lab: { icon: 'flask', color: colors.lab, bgColor: colors.labSoft },
    healthcheck: { icon: 'clipboard', color: colors.accent, bgColor: colors.accentSoft },
    cardiac: { icon: 'heart', color: colors.error, bgColor: colors.errorSoft },
    oncology: { icon: 'pulse', color: colors.equipment, bgColor: colors.equipmentSoft },
    neuro: { icon: 'bulb', color: colors.warning, bgColor: colors.warningSoft },
    cardiac_basic: { icon: 'heart-circle', color: colors.error, bgColor: colors.errorSoft },
    ortho: { icon: 'body', color: colors.info, bgColor: colors.infoSoft },
    oxygen: { icon: 'cloud', color: colors.info, bgColor: colors.infoSoft },
    bipap: { icon: 'hardware-chip', color: colors.equipment, bgColor: colors.equipmentSoft },
    cpap: { icon: 'hardware-chip', color: colors.equipment, bgColor: colors.equipmentSoft },
    cot_single: { icon: 'bed', color: colors.accent, bgColor: colors.accentSoft },
    cot_two: { icon: 'bed', color: colors.accent, bgColor: colors.accentSoft },
    alfa_bed: { icon: 'bed', color: colors.accent, bgColor: colors.accentSoft },
    cardiac_monitor: { icon: 'pulse', color: colors.error, bgColor: colors.errorSoft },
    syringe: { icon: 'eyedrop', color: colors.medical, bgColor: colors.medicalSoft },
    medicine: { icon: 'medical', color: colors.medical, bgColor: colors.medicalSoft },
  };
  return iconMap[imageKey] || { icon: 'medical', color: colors.accent, bgColor: colors.accentSoft };
};

export function ServiceRowCard({ service, onPress }: ServiceRowCardProps) {
  const iconConfig = getServiceIconConfig(service.image);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.thumbnailContainer, { backgroundColor: iconConfig.bgColor }]}>
        <Icon name={iconConfig.icon} size={24} color={iconConfig.color} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {service.title}
        </Text>
        <StarRating
          rating={service.rating}
          size={12}
          showReviewCount={!!service.reviewCount}
          reviewCount={service.reviewCount}
        />
      </View>
      <View style={styles.arrowContainer}>
        <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  thumbnailContainer: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xxs,
  },
  title: {
    ...typography.label,
    lineHeight: 18,
  },
  arrowContainer: {
    paddingLeft: spacing.xs,
  },
});
