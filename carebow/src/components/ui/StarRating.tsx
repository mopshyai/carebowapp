/**
 * StarRating Component
 * Displays a row of stars with partial fill support and optional review count
 * Uses healthcare-grade SVG icons from the icon system
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../theme';
import { AppIcon } from '../icons';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  color?: string;
  emptyColor?: string;
  showRating?: boolean;
  reviewCount?: number;
  showReviewCount?: boolean;
}

export function StarRating({
  rating,
  maxStars = 5,
  size = 14,
  color = colors.warning,
  emptyColor = colors.border,
  showRating = false,
  reviewCount,
  showReviewCount = false,
}: StarRatingProps) {
  const stars = [];

  for (let i = 1; i <= maxStars; i++) {
    if (i <= Math.floor(rating)) {
      // Full star
      stars.push(
        <AppIcon key={i} name="star-filled" size={size} color={color} fillOpacity={1} />
      );
    } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
      // Half star - show as filled for simplicity (SVG doesn't have half)
      stars.push(
        <AppIcon key={i} name="star-filled" size={size} color={color} fillOpacity={0.5} />
      );
    } else {
      // Empty star
      stars.push(
        <AppIcon key={i} name="star" size={size} color={emptyColor} fillOpacity={0} />
      );
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>{stars}</View>
      {showRating && (
        <Text style={[styles.ratingText, { fontSize: size }]}>{rating.toFixed(1)}</Text>
      )}
      {showReviewCount && reviewCount !== undefined && (
        <Text style={[styles.reviewCount, { fontSize: size - 2 }]}>({reviewCount})</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontWeight: '600',
    color: colors.warning,
  },
  reviewCount: {
    color: colors.textTertiary,
  },
});
