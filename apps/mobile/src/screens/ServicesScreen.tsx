/**
 * Services Screen
 * Displays all service categories with horizontal service cards
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { AppNavigationProp } from '../navigation/types';
import Icon from 'react-native-vector-icons/Ionicons';
import { CategorySection } from '../components/ui/CategorySection';
import { serviceCategories } from '../data/services';
import type { ServiceCategory } from '../data/types';
import { servicesApi } from '../services/api/endpoints/services';
import { groupLiveServices } from '../lib/liveServiceCatalog';
import { colors, space, radius, typography, layout } from '../theme/tokens';

export default function ServicesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation() as AppNavigationProp;
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
        {categories.map((category) => (
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
