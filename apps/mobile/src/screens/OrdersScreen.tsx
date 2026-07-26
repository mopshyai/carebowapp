import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { memberApi, V1Booking } from '../services/api/endpoints/member';
import { colors, layout, radius, shadows, space, typography } from '../theme/tokens';

const formatMoney = (paise: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format((paise || 0) / 100);

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [bookings, setBookings] = useState<V1Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const response = await memberApi.getBookings();
      if (!response.success) throw new Error(response.error || 'Unable to load bookings');
      setBookings(response.bookings ?? []);
    } catch {
      setError('We could not load your bookings. Check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.header, { paddingTop: insets.top + space.sm }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.xl }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
      >
        {loading ? (
          <View style={styles.state}>
            <ActivityIndicator size="large" color={colors.primary.default} />
            <Text style={styles.stateText}>Loading your bookings…</Text>
          </View>
        ) : error ? (
          <View style={styles.state}>
            <Icon name="cloud-offline-outline" size={48} color={colors.text.tertiary} />
            <Text style={styles.stateTitle}>Bookings unavailable</Text>
            <Text style={styles.stateText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => load()}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : bookings.length === 0 ? (
          <View style={styles.state}>
            <Icon name="calendar-outline" size={48} color={colors.text.tertiary} />
            <Text style={styles.stateTitle}>No bookings yet</Text>
            <Text style={styles.stateText}>
              Confirmed and pending CareBow bookings will appear here.
            </Text>
          </View>
        ) : (
          bookings.map((booking) => {
            const date = new Date(booking.scheduledAt);
            return (
              <View key={booking.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleWrap}>
                    <Text style={styles.serviceName}>
                      {booking.service?.name || 'Care service'}
                    </Text>
                    <Text style={styles.bookingId}>
                      Booking #{booking.id.slice(-8).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>
                      {booking.status.toLowerCase().replace(/_/g, ' ')}
                    </Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="person-outline" size={17} color={colors.text.tertiary} />
                  <Text style={styles.detailText}>{booking.profile?.name || 'Care recipient'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="calendar-outline" size={17} color={colors.text.tertiary} />
                  <Text style={styles.detailText}>
                    {date.toLocaleDateString([], {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                    {' at '}
                    {date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </Text>
                </View>
                <View style={styles.cardFooter}>
                  <Text style={styles.amount}>{formatMoney(booking.amount)}</Text>
                  <Text style={styles.confirmation}>Status comes directly from CareBow</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
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
  headerButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.sectionHeader, color: colors.text.primary },
  content: { flexGrow: 1, padding: space.lg, gap: space.md },
  state: {
    flex: 1,
    minHeight: 420,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    paddingHorizontal: space.xl,
  },
  stateTitle: { ...typography.sectionHeader, color: colors.text.primary, textAlign: 'center' },
  stateText: { ...typography.body, color: colors.text.secondary, textAlign: 'center' },
  retryButton: {
    marginTop: space.sm,
    backgroundColor: colors.primary.default,
    borderRadius: radius.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  retryText: { ...typography.label, color: colors.text.inverse },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    gap: space.sm,
    ...shadows.card,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: space.sm },
  cardTitleWrap: { flex: 1 },
  serviceName: { ...typography.sectionHeaderSmall, color: colors.text.primary },
  bookingId: { ...typography.caption, color: colors.text.tertiary, marginTop: 2 },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: space.sm,
    paddingVertical: space.xxs,
    backgroundColor: colors.primary.muted,
  },
  statusText: { ...typography.caption, color: colors.primary.default, textTransform: 'capitalize' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  detailText: { ...typography.body, color: colors.text.secondary, flex: 1 },
  cardFooter: {
    marginTop: space.xs,
    paddingTop: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: space.sm,
  },
  amount: { ...typography.sectionHeaderSmall, color: colors.text.primary },
  confirmation: { ...typography.caption, color: colors.text.tertiary, flex: 1, textAlign: 'right' },
});
