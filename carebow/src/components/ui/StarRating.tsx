/**
 * StarRating Component
 * Displays a row of stars with partial fill support and optional review count
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography } from '../../theme';

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
        <Icon key={i} name="star" size={size} color={color} />
      );
    } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
      // Half star - for any decimal value
      stars.push(
        <Icon key={i} name="star-half" size={size} color={color} />
      );
    } else {
      // Empty star
      stars.push(
        <Icon key={i} name="star-outline" size={size} color={emptyColor} />
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
