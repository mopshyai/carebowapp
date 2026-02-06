/**
 * CarePathwayCard Component
 * Displays CareBow service recommendations for monetization
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../../theme';

export type ServiceType =
  | 'doctor_teleconsult'
  | 'doctor_home_visit'
  | 'nursing_care'
  | 'physiotherapy'
  | 'caregiver'
  | 'lab_tests'
  | 'medical_equipment'
  | 'ambulance';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ServiceRecommendationData {
  serviceType: ServiceType;
  serviceName: string;
  reason: string;
  urgency: UrgencyLevel;
  suggestedTiming?: string;
  estimatedPrice?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  deepLink?: string;
}

interface CarePathwayCardProps {
  service: ServiceRecommendationData;
  onBook?: () => void;
  isPrimary?: boolean;
}

const serviceIcons: Record<ServiceType, string> = {
  doctor_teleconsult: 'videocam',
  doctor_home_visit: 'home',
  nursing_care: 'heart',
  physiotherapy: 'fitness',
  caregiver: 'people',
  lab_tests: 'flask',
  medical_equipment: 'medkit',
  ambulance: 'car',
};

const urgencyStyles: Record<UrgencyLevel, { color: string; bgColor: string; label: string }> = {
  low: { color: colors.info, bgColor: colors.infoSoft, label: 'When convenient' },
  medium: { color: colors.accent, bgColor: colors.accentSoft, label: 'Within 24-48 hours' },
  high: { color: colors.warning, bgColor: colors.warningSoft, label: 'Today if possible' },
  critical: { color: colors.error, bgColor: colors.errorSoft, label: 'Immediately' },
};

export function CarePathwayCard({ service, onBook, isPrimary = false }: CarePathwayCardProps) {
  const icon = serviceIcons[service.serviceType] || 'medical';
  const urgency = urgencyStyles[service.urgency];

  const handleBook = () => {
    if (onBook) {
      onBook();
    } else if (service.deepLink) {
      Linking.openURL(service.deepLink);
    }
  };

  const formatPrice = () => {
    if (service.estimatedPrice) {
      return service.estimatedPrice;
    }
    if (service.priceRange) {
      return `$${service.priceRange.min} - $${service.priceRange.max}`;
    }
    return null;
  };

  return (
    <View style={[styles.container, isPrimary && styles.primaryContainer]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: urgency.bgColor }]}>
          <Icon name={icon} size={24} color={urgency.color} />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.serviceName}>{service.serviceName}</Text>
          <View style={[styles.urgencyBadge, { backgroundColor: urgency.bgColor }]}>
            <View style={[styles.urgencyDot, { backgroundColor: urgency.color }]} />
            <Text style={[styles.urgencyText, { color: urgency.color }]}>{urgency.label}</Text>
          </View>
        </View>
        {isPrimary && (
          <View style={styles.recommendedTag}>
            <Icon name="star" size={12} color={colors.secondary} />
          </View>
        )}
      </View>

      {/* Reason */}
      <Text style={styles.reason}>{service.reason}</Text>

      {/* Details Row */}
      <View style={styles.detailsRow}>
        {service.suggestedTiming && (
          <View style={styles.detailItem}>
            <Icon name="time-outline" size={14} color={colors.textTertiary} />
            <Text style={styles.detailText}>{service.suggestedTiming}</Text>
          </View>
        )}
        {formatPrice() && (
          <View style={styles.detailItem}>
            <Icon name="pricetag-outline" size={14} color={colors.textTertiary} />
            <Text style={styles.detailText}>{formatPrice()}</Text>
          </View>
        )}
      </View>

      {/* Book Button */}
      <TouchableOpacity
        style={[styles.bookButton, isPrimary && styles.primaryButton]}
        onPress={handleBook}
        activeOpacity={0.8}
      >
        <Text style={[styles.bookButtonText, isPrimary && styles.primaryButtonText]}>
          {service.urgency === 'critical' ? 'Book Now' : 'View & Book'}
        </Text>
        <Icon
          name="arrow-forward"
          size={18}
          color={isPrimary ? colors.textInverse : colors.accent}
        />
      </TouchableOpacity>
    </View>
  );
}

/**
 * CarePathwayList Component
 * Renders a list of service recommendations
 */
interface CarePathwayListProps {
  services: ServiceRecommendationData[];
  onBookService?: (service: ServiceRecommendationData) => void;
  maxVisible?: number;
}

export function CarePathwayList({
  services,
  onBookService,
  maxVisible = 3,
}: CarePathwayListProps) {
  const [showAll, setShowAll] = React.useState(false);
  const visibleServices = showAll ? services : services.slice(0, maxVisible);
  const hasMore = services.length > maxVisible;

  if (services.length === 0) {
    return null;
  }

  return (
    <View style={styles.listContainer}>
      <View style={styles.listHeader}>
        <View style={styles.listTitleRow}>
          <Icon name="medical" size={20} color={colors.accent} />
          <Text style={styles.listTitle}>Recommended Services</Text>
        </View>
        <Text style={styles.listSubtitle}>Based on your symptoms</Text>
      </View>

      {visibleServices.map((service, index) => (
        <CarePathwayCard
          key={`${service.serviceType}-${index}`}
          service={service}
          isPrimary={index === 0}
          onBook={() => onBookService?.(service)}
        />
      ))}

      {hasMore && !showAll && (
        <TouchableOpacity style={styles.showMoreButton} onPress={() => setShowAll(true)}>
          <Text style={styles.showMoreText}>
            Show {services.length - maxVisible} more services
          </Text>
          <Icon name="chevron-down" size={16} color={colors.accent} />
        </TouchableOpacity>
      )}
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
  primaryContainer: {
    borderColor: colors.accentSoft,
    borderWidth: 2,
    backgroundColor: colors.accentMuted,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  serviceName: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
    gap: spacing.xxs,
  },
  urgencyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  urgencyText: {
    ...typography.tiny,
  },
  recommendedTag: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.secondarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reason: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  detailText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.accent,
    gap: spacing.xs,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderWidth: 0,
    ...shadows.button,
  },
  bookButtonText: {
    ...typography.labelLarge,
    color: colors.accent,
  },
  primaryButtonText: {
    color: colors.textInverse,
  },
  // List styles
  listContainer: {
    marginVertical: spacing.sm,
  },
  listHeader: {
    marginBottom: spacing.sm,
  },
  listTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  listTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  listSubtitle: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xxs,
    marginLeft: 28,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xxs,
  },
  showMoreText: {
    ...typography.label,
    color: colors.accent,
  },
});
