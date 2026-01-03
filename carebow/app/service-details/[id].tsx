/**
 * ServiceDetails Screen
 * Displays detailed information about a specific service
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StarRating } from '@/components/ui/StarRating';
import { getServiceById, getCategoryByServiceId } from '@/data/services';

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

export default function ServiceDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const service = getServiceById(id || '');
  const category = getCategoryByServiceId(id || '');

  if (!service) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Service not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const icon = getServiceIcon(service.image);

  const handleBookNow = () => {
    // TODO: Navigate to booking/cart flow
    console.log('Book now:', service.id);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Details</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 100 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          {/* TODO: Replace with actual Image when assets are available */}
          <Ionicons name={icon} size={80} color="#9333EA" />
        </View>

        {/* Service Info */}
        <View style={styles.infoContainer}>
          {category && (
            <Text style={styles.categoryLabel}>{category.title}</Text>
          )}
          <Text style={styles.serviceTitle}>{service.title}</Text>
          <View style={styles.ratingRow}>
            <StarRating rating={service.rating} size={16} />
            <Text style={styles.ratingText}>{service.rating.toFixed(1)}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this service</Text>
          <Text style={styles.description}>
            {service.description ||
              `Experience professional ${service.title.toLowerCase()} services delivered right to your doorstep. Our certified experts ensure the highest quality care tailored to your specific needs.`}
          </Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's included</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
              <Text style={styles.featureText}>Professional certified staff</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
              <Text style={styles.featureText}>Flexible scheduling</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
              <Text style={styles.featureText}>24/7 support available</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
              <Text style={styles.featureText}>Satisfaction guaranteed</Text>
            </View>
          </View>
        </View>

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing</Text>
          <View style={styles.pricingCard}>
            <Text style={styles.pricingLabel}>Starting from</Text>
            <Text style={styles.pricingValue}>$49.99</Text>
            <Text style={styles.pricingNote}>Per session • Varies by location</Text>
          </View>
        </View>
      </ScrollView>

      {/* Book Now Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
          <Text style={styles.bookButtonText}>Book Now</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#000000',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  shareButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  backLink: {
    color: '#9333EA',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  heroContainer: {
    height: 200,
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoContainer: {
    marginBottom: 24,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9333EA',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  serviceTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 32,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#A0A0A0',
    lineHeight: 22,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  pricingCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  pricingLabel: {
    fontSize: 12,
    color: '#A0A0A0',
    marginBottom: 4,
  },
  pricingValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  pricingNote: {
    fontSize: 12,
    color: '#666666',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#1C1C1E',
  },
  bookButton: {
    backgroundColor: '#9333EA',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
