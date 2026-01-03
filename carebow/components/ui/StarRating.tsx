/**
 * StarRating Component
 * Displays a row of stars with partial fill support
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  color?: string;
  emptyColor?: string;
}

export function StarRating({
  rating,
  maxStars = 5,
  size = 14,
  color = '#FFD700',
  emptyColor = '#4A4A4A',
}: StarRatingProps) {
  const stars = [];

  for (let i = 1; i <= maxStars; i++) {
    if (i <= Math.floor(rating)) {
      // Full star
      stars.push(
        <Ionicons key={i} name="star" size={size} color={color} />
      );
    } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
      // Half star
      stars.push(
        <Ionicons key={i} name="star-half" size={size} color={color} />
      );
    } else {
      // Empty star
      stars.push(
        <Ionicons key={i} name="star-outline" size={size} color={emptyColor} />
      );
    }
  }

  return <View style={styles.container}>{stars}</View>;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});
