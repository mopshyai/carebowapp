/**
 * CategorySection Component
 * Renders a category title and list of service cards
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ServiceRowCard } from './ServiceRowCard';
import { ServiceCategory } from '@/data/types';

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
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    paddingLeft: 4,
  },
  servicesList: {
    gap: 0,
  },
});
