/**
 * ServiceRowCard Component
 * Horizontal card with icon on left, title and rating on right
 * Uses healthcare-grade SVG icons from the icon system
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StarRating } from './StarRating';
import { ServiceItem } from '../../data/types';
import { colors, spacing, radius, typography, shadows } from '../../theme';
import { AppIcon, IconContainer, getIconForService, getIconColors } from '../icons';

interface ServiceRowCardProps {
  service: ServiceItem;
  onPress: () => void;
}

export function ServiceRowCard({ service, onPress }: ServiceRowCardProps) {
  const iconName = getIconForService(service.image);
  const iconColors = getIconColors(iconName);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <IconContainer
        size="lg"
        variant="soft"
        backgroundColor={iconColors.background}
        style={styles.thumbnailContainer}
      >
        <AppIcon name={iconName} size={24} color={iconColors.primary} fillOpacity={0.2} />
      </IconContainer>
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
        <AppIcon name="chevron-right" size={20} color={colors.textTertiary} />
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
