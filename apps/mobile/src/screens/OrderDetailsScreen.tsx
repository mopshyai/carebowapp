import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useBookingsStore, selectBookingById } from '../store';
import { paymentsApi } from '../services/api/endpoints/payments';
import { useHostedCheckout } from '../hooks/useHostedCheckout';
import { formatMinor } from '../data/countries';
import { colors, radius, spacing, typography } from '../theme';

// The booking's own currency, not the device's guess: a booking quoted in
// dollars stays quoted in dollars.
const money = (amountMinor: number, currency?: string) =>
  formatMinor(amountMinor, currency ?? 'INR');

export default function OrderDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const id = (route.params as { id?: string } | undefined)?.id;
  // Read through the store so a cancel here is visible on the bookings list
  // immediately, without either screen refetching.
  const booking = useBookingsStore(selectBookingById(id ?? '')) ?? null;
  const fetchOne = useBookingsStore((s) => s.fetchOne);
  const cancelBooking = useBookingsStore((s) => s.cancel);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  // Same hosted flow as the booking checkout: Razorpay's page collects, the
  // webhook records, and this screen only asks what happened.
  const checkout = useHostedCheckout();

  const load = useCallback(async () => {
    if (!id) {
      setError('Booking ID is missing.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const fetched = await fetchOne(id);
    if (!fetched) setError('Booking not found');
    setLoading(false);
  }, [id, fetchOne]);

  useEffect(() => {
    load();
  }, [load]);

  const cancel = async () => {
    if (!id) return;
    // The store reconciles from the server response, so the bookings list
    // reflects the cancellation without this screen refetching it.
    const result = await cancelBooking(id);
    if (!result.ok) {
      Alert.alert('Could not cancel', result.error);
      return;
    }

    // Say what happened to the money. Silence after cancelling something the
    // customer paid for reads as "they kept it".
    if (result.refund?.status === 'ISSUED') {
      Alert.alert(
        'Booking cancelled',
        'Your refund is on its way and usually reaches your account within 5–7 working days.'
      );
    } else if (result.refund?.status === 'PENDING') {
      Alert.alert(
        'Booking cancelled',
        'Your refund could not be processed automatically. Our team has been alerted and will complete it.'
      );
    }
  };

  /**
   * Pay for a booking that already exists — a quote priced after assessment, one
   * raised on the customer's behalf, or a checkout they abandoned. The amount is
   * never sent: the server charges what the booking was quoted at.
   */
  const payNow = async () => {
    if (!id) return;
    setPaying(true);
    try {
      const order = await paymentsApi.createSettleOrder({
        bookingId: id,
        hosted: true,
        callbackUrl: 'carebow://checkout/return',
      });

      if (!order.success || !order.paymentUrl || !order.orderId) {
        Alert.alert('Could not start payment', order.error || 'Please try again.');
        return;
      }

      const outcome = await checkout.start({
        orderId: order.orderId,
        paymentUrl: order.paymentUrl,
      });

      if (outcome.status === 'paid') {
        await fetchOne(id);
        Alert.alert('Payment received', 'This booking is now paid in full.');
      } else if (outcome.status === 'failed') {
        Alert.alert('Payment not completed', 'Nothing was charged. You can try again.');
      } else {
        // Not a failure — the webhook may still be on its way.
        await fetchOne(id);
        Alert.alert(
          'Still confirming your payment',
          'If you completed payment this booking will show as paid shortly. Check here before paying again.'
        );
      }
    } finally {
      setPaying(false);
    }
  };

  if (loading)
    return (
      <View style={styles.state}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.body}>Loading booking…</Text>
      </View>
    );
  if (!booking)
    return (
      <View style={styles.state}>
        <Icon name="alert-circle-outline" size={48} color={colors.textTertiary} />
        <Text style={styles.title}>Booking unavailable</Text>
        <Text style={styles.body}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );

  const when = new Date(booking.scheduledAt);
  const cancellable = booking.status === 'PENDING' || booking.status === 'CONFIRMED';
  const paid = booking.paymentStatus === 'PAID';
  const refunded =
    booking.paymentStatus === 'REFUNDED' || booking.paymentStatus === 'REFUND_PENDING';
  const payable =
    !paid &&
    !refunded &&
    booking.amount > 0 &&
    ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(booking.status);
  const busy = paying || checkout.busy;
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color={colors.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.title}>{booking.service?.name || 'Care booking'}</Text>
      <Text style={styles.status}>{booking.status.toLowerCase().replace(/_/g, ' ')}</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Care recipient</Text>
        <Text style={styles.value}>{booking.profile?.name || 'Not provided'}</Text>
        <Text style={styles.label}>Preferred time</Text>
        <Text style={styles.value}>{when.toLocaleString()}</Text>
        <Text style={styles.label}>Amount</Text>
        <Text style={styles.value}>
          {money(booking.amount, booking.currency)}
          {paid ? ' · Paid' : ''}
          {booking.paymentStatus === 'REFUNDED' ? ' · Refunded' : ''}
          {booking.paymentStatus === 'REFUND_PENDING' ? ' · Refund on the way' : ''}
        </Text>
        <Text style={styles.label}>Provider</Text>
        <Text style={styles.value}>{booking.provider?.name || 'Not assigned yet'}</Text>
      </View>
      {payable && (
        <TouchableOpacity
          style={[styles.payButton, busy && styles.disabled]}
          onPress={payNow}
          disabled={busy}
        >
          <Icon name="card-outline" size={18} color={colors.textInverse} />
          <Text style={styles.payText}>
            {busy ? 'Opening payment…' : `Pay ${money(booking.amount, booking.currency)}`}
          </Text>
        </TouchableOpacity>
      )}
      {cancellable && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() =>
            Alert.alert('Cancel booking?', 'This updates the real CareBow booking.', [
              { text: 'Keep booking', style: 'cancel' },
              { text: 'Cancel booking', style: 'destructive', onPress: cancel },
            ])
          }
        >
          <Text style={styles.cancelText}>Cancel booking</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface2, padding: spacing.xl, paddingTop: 64 },
  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.surface2,
  },
  back: { width: 44, height: 44, justifyContent: 'center' },
  title: { ...typography.h2, color: colors.textPrimary, textAlign: 'center' },
  body: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  status: {
    ...typography.label,
    color: colors.accent,
    textTransform: 'capitalize',
    textAlign: 'center',
    marginVertical: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  label: { ...typography.caption, color: colors.textTertiary, marginTop: spacing.sm },
  value: { ...typography.body, color: colors.textPrimary },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  buttonText: { ...typography.labelLarge, color: colors.textInverse },
  payButton: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  payText: { ...typography.labelLarge, color: colors.textInverse },
  disabled: { opacity: 0.6 },
  cancelButton: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  cancelText: { ...typography.labelLarge, color: colors.error },
});
