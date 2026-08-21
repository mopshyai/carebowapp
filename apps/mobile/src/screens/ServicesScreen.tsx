/**
 * Services Screen
 * Displays the live service catalog and honors care-intent routing from Ask CareBow.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { AppNavigationProp } from '../navigation/types';
import Icon from 'react-native-vector-icons/Ionicons';
import { CategorySection } from '../components/ui/CategorySection';
import { serviceCategories } from '../data/services';
import type { Service, ServiceCategory } from '../data/types';
import { servicesApi } from '../services/api/endpoints/services';
import { groupLiveServices } from '../lib/liveServiceCatalog';
import { useCartStore } from '../store/useCartStore';
import { colors, space, radius, typography, layout } from '../theme/tokens';

const normalize = (value: string) => value.toLowerCase().replace(/[_\s]+/g, '-');

const serviceSearchText = (service: Service) =>
  [service.id, service.title, service.categoryId, service.image, service.shortTagline]
    .join(' ')
    .toLowerCase();

function asRecommendationGroup(id: string, title: string, items: Service[]): ServiceCategory[] {
  return items.length > 0 ? [{ id, title, items }] : [];
}

function filterForCareIntent(
  categories: ServiceCategory[],
  requestedCategory?: string
): ServiceCategory[] {
  if (!requestedCategory) return categories;

  const requested = normalize(requestedCategory);

  // First honor a real catalog category id. This preserves normal Services
  // navigation while also supporting Ask CareBow intent aliases below.
  const exact = categories.filter((category) => normalize(category.id) === requested);
  if (exact.length > 0) return exact;

  const allServices = categories.flatMap((category) => category.items);

  if (requested === 'video-consult' || requested === 'teleconsult') {
    const liveConsults = allServices.filter((service) => {
      const text = serviceSearchText(service);
      return /video|teleconsult|telemedicine|virtual|online consult/.test(text);
    });
    if (liveConsults.length > 0) {
      return asRecommendationGroup('carebow_video_consult', 'Live doctor consultations', liveConsults);
    }

    // If no dedicated virtual service exists yet, show actual doctor services
    // rather than unrelated nursing, cleaning, food, or generic "care" items.
    const doctorAlternatives = allServices.filter((service) => {
      const text = serviceSearchText(service);
      return /doctor|physician/.test(text);
    });
    if (doctorAlternatives.length > 0) {
      return asRecommendationGroup(
        'carebow_doctor_alternatives',
        'Available doctor options',
        doctorAlternatives
      );
    }
  }

  if (
    requested === 'doctor-visit' ||
    requested === 'home-care' ||
    requested === 'home-visit'
  ) {
    const homeDoctorServices = allServices.filter((service) => {
      const text = serviceSearchText(service);
      return /doctor|physician|home visit|medical visit/.test(text);
    });
    if (homeDoctorServices.length > 0) {
      return asRecommendationGroup(
        'carebow_home_doctor',
        'Doctor & home visit options',
        homeDoctorServices
      );
    }
  }

  // The live catalog may use a broad healthcare category rather than explicit
  // doctor tags. Restrict fallback to health/medical/doctor wording only. Do
  // not match generic "care", which previously pulled daily-care categories in.
  if (
    requested === 'video-consult' ||
    requested === 'teleconsult' ||
    requested === 'doctor-visit' ||
    requested === 'home-care' ||
    requested === 'home-visit'
  ) {
    const healthcare = categories.filter((category) => {
      const text = `${category.id} ${category.title}`.toLowerCase();
      return /health|medical|doctor/.test(text);
    });
    if (healthcare.length > 0) return healthcare;
  }

  // Unknown category requests fail open to the catalog rather than producing
  // an empty screen.
  return categories;
}

export default function ServicesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation() as AppNavigationProp;
  const route = useRoute();
  const requestedCategory = (route.params as { category?: string } | undefined)?.category;
  const referralContext = useCartStore((state) => state.pendingReferralContext);
  const [categories, setCategories] = useState<ServiceCategory[]>(serviceCategories);
  const [, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);

    servicesApi
      .getServices()
      .then((services) => {
        if (!active) return;
        const live = groupLiveServices(services);
        // Fall back to the local catalog if the backend has no rich services yet,
        // so the user never sees an empty screen.
        setCategories(live.length > 0 ? live : serviceCategories);
      })
      .catch(() => {
        if (!active) return;
        setCategories(serviceCategories);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const visibleCategories = useMemo(
    () => filterForCareIntent(categories, requestedCategory),
    [categories, requestedCategory]
  );

  const handleServicePress = (serviceId: string) => {
    navigation.navigate('ServiceDetails', { id: serviceId });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + space.sm }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Services</Text>
        <TouchableOpacity
          style={styles.searchButton}
          accessibilityRole="button"
          accessibilityLabel="Search services"
        >
          <Icon name="search" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Services List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 32 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {referralContext?.source === 'ask_carebow' && (
          <View style={styles.referralBanner}>
            <View style={styles.referralIcon}>
              <Icon name="medical" size={18} color={colors.primary.default} />
            </View>
            <View style={styles.referralCopy}>
              <Text style={styles.referralTitle}>Recommended from Ask CareBow</Text>
              <Text style={styles.referralText}>
                Your recent assessment will stay attached when you choose a service, so the care
                team receives the relevant context.
              </Text>
            </View>
          </View>
        )}

        {visibleCategories.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            onServicePress={handleServicePress}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: space.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    width: layout.touchTargetMin,
    height: layout.touchTargetMin,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
  },
  headerTitle: {
    ...typography.sectionHeader,
    color: colors.text.primary,
  },
  searchButton: {
    width: layout.touchTargetMin,
    height: layout.touchTargetMin,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: -8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: space.lg,
  },
  referralBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.sm,
    padding: space.md,
    marginBottom: space.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  referralIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  referralCopy: {
    flex: 1,
    gap: space.xs,
  },
  referralTitle: {
    ...typography.label,
    color: colors.text.primary,
  },
  referralText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  stateContainer: {
    minHeight: 360,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xl,
    gap: space.sm,
  },
  stateTitle: {
    ...typography.sectionHeader,
    color: colors.text.primary,
    textAlign: 'center',
  },
  stateText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: space.sm,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primary.default,
  },
  retryText: {
    ...typography.label,
    color: colors.text.inverse,
  },
});
