/**
 * ServiceRowCard Component
 * Horizontal card with thumbnail on left, title and rating on right
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StarRating } from './StarRating';
import { ServiceItem } from '@/data/types';

interface ServiceRowCardProps {
  service: ServiceItem;
  onPress: () => void;
}

// TODO: Replace with actual service images when available
const getServiceIcon = (imageKey: string): keyof typeof Ionicons.glyphMap => {
  const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
    companionship: 'people',
    transport: 'car',
    food: 'restaurant',
    cleaning: 'sparkles',
    culture: 'color-palette',
    barber: 'cut',
    yoga: 'body',
    nurse: 'medkit',
    transactional: 'card',
    physio: 'fitness',
    doctor: 'medical',
    lab: 'flask',
    healthcheck: 'clipboard',
    cardiac: 'heart',
    oncology: 'pulse',
    neuro: 'bulb',
    cardiac_basic: 'heart-circle',
    ortho: 'body',
    oxygen: 'cloud',
    bipap: 'hardware-chip',
    cpap: 'hardware-chip',
    cot_single: 'bed',
    cot_two: 'bed',
    alfa_bed: 'bed',
    cardiac_monitor: 'pulse',
    syringe: 'eyedrop',
    medicine: 'medical',
  };
  return iconMap[imageKey] || 'medical';
};

export function ServiceRowCard({ service, onPress }: ServiceRowCardProps) {
  const icon = getServiceIcon(service.image);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.thumbnailContainer}>
        {/* TODO: Replace icon with actual Image when assets are available */}
        <Ionicons name={icon} size={32} color="#9333ea" />
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {service.title}
        </Text>
        <StarRating rating={service.rating} size={12} />
      </View>
      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  thumbnailContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  arrowContainer: {
    paddingLeft: 8,
  },
});
