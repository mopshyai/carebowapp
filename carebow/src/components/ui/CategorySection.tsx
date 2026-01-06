/**
 * CategorySection Component
 * Renders a category title and list of service cards
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ServiceRowCard } from './ServiceRowCard';
import { ServiceCategory } from '../../data/types';
import { colors, spacing, typography } from '../../theme';

interface CategorySectionProps {
  category: ServiceCategory;
  onServicePress: (serviceId: string) => void;
}

export function CategorySection({ category, onServicePress }: CategorySectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.categoryTitle}>{category.title}</Text>
      <View style={styles.servicesList}>
        {category.items.map((service) => (
          <ServiceRowCard
            key={service.id}
            service={service}
            onPress={() => onServicePress(service.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  categoryTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
    paddingLeft: spacing.xxs,
  },
  servicesList: {
    gap: spacing.xs,
  },
});
