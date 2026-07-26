/**
 * Services Screen
 * Displays all service categories with horizontal service cards
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { AppNavigationProp } from '../navigation/types';
import Icon from 'react-native-vector-icons/Ionicons';
import { CategorySection } from '../components/ui/CategorySection';
import { servicesApi, V1Service } from '../services/api/endpoints/services';
import { groupLiveServices } from '../lib/liveServiceCatalog';
import { colors, space, radius, typography, layout } from '../theme/tokens';

export default function ServicesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation() as AppNavigationProp;
  const [services, setServices] = useState<V1Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const categories = useMemo(() => groupLiveServices(services), [services]);

  const loadServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setServices(await servicesApi.getServices());
    } catch {
      setError('We could not load the live service catalog. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const handleServicePress = (serviceId: string) => {
    navigation.navigate('ServiceDetails', { id: serviceId });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + space.sm }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Services</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Icon name="search" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Services List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 32 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="large" color={colors.primary.default} />
            <Text style={styles.stateText}>Loading available services…</Text>
          </View>
        ) : error ? (
          <View style={styles.stateContainer}>
            <Icon name="cloud-offline-outline" size={48} color={colors.text.tertiary} />
            <Text style={styles.stateTitle}>Services unavailable</Text>
            <Text style={styles.stateText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadServices}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : categories.length === 0 ? (
          <View style={styles.stateContainer}>
            <Icon name="medical-outline" size={48} color={colors.text.tertiary} />
            <Text style={styles.stateTitle}>No services available</Text>
            <Text style={styles.stateText}>
              The care team has not published any bookable services yet.
            </Text>
          </View>
        ) : (
          categories.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              onServicePress={handleServicePress}
            />
          ))
        )}
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
