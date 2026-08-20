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
import { useBookingsStore } from '../store';
import type { AppNavigationProp } from '../navigation/types';
import { colors, layout, radius, shadows, space, typography } from '../theme/tokens';

import { formatMinor } from '../data/countries';

// Formats what the server charged, in the currency it charged. Hardcoding INR
// here displayed a $270 booking as ₹270.
const formatMoney = (amountMinor: number, currency?: string) =>
  formatMinor(amountMinor, currency ?? 'INR');

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation() as AppNavigationProp;
  // Booking data lives in the store, not in screen state, so the details and
  // history screens see the same rows after a cancel instead of each holding
  // their own copy.
  const bookings = useBookingsStore((s) => s.bookings);
  const status = useBookingsStore((s) => s.status);
  const error = useBookingsStore((s) => s.error);
  const fetchBookings = useBookingsStore((s) => s.fetch);

  const [refreshing, setRefreshing] = useState(false);

  // Only a first load shows the full-screen spinner; a refetch behind existing
  // rows should not blank the list.
  const loading = status === 'loading' && bookings.length === 0;

  const load = useCallback(
    async (refresh = false) => {
      if (refresh) setRefreshing(true);
      try {
        await fetchBookings({ force: true });
      } finally {
        if (refresh) setRefreshing(false);
      }
    },
    [fetchBookings]
  );

  useEffect(() => {
    // Not forced: returning to this screen within the freshness window reuses
    // the cache instead of refetching on every mount.
    fetchBookings();
  }, [fetchBookings]);

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
            // Unpaid is an ordinary state here — a quote priced after
            // assessment, a booking raised for the customer — and until there
            // was somewhere to pay it, the list gave no hint money was owed.
            const due =
              booking.amount > 0 &&
              booking.paymentStatus !== 'PAID' &&
              booking.paymentStatus !== 'REFUNDED' &&
              booking.paymentStatus !== 'REFUND_PENDING' &&
              ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(booking.status);
            return (
              <TouchableOpacity
                key={booking.id}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('OrderDetails', { id: booking.id })}
              >
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
                  <Text style={styles.amount}>{formatMoney(booking.amount, booking.currency)}</Text>
                  {due ? (
                    <View style={styles.payChip}>
                      <Icon name="card-outline" size={14} color={colors.text.inverse} />
                      <Text style={styles.payChipText}>Pay now</Text>
                    </View>
                  ) : booking.paymentStatus === 'PAID' ? (
                    <Text style={styles.confirmation}>Paid</Text>
                  ) : (
                    <Text style={styles.confirmation}>Status comes directly from CareBow</Text>
                  )}
                </View>
              </TouchableOpacity>
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
  payChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    backgroundColor: colors.primary.default,
    borderRadius: radius.full,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
  payChipText: { ...typography.caption, color: colors.text.inverse, fontWeight: '600' },
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
