import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useBookingsStore, selectBookingById } from '../store';
import { paymentsApi } from '../services/api/endpoints/payments';
import { useHostedCheckout } from '../hooks/useHostedCheckout';
import { formatMinor } from '../data/countries';
import { colors, radius, spacing, typography } from '../theme';

const money = (amountMinor: number, currency?: string) =>
  formatMinor(amountMinor, currency ?? 'INR');

export default function OrderDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const id = (route.params as { id?: string } | undefined)?.id;
  const booking = useBookingsStore(selectBookingById(id ?? '')) ?? null;
  const fetchOne = useBookingsStore((s) => s.fetchOne);
  const cancelBooking = useBookingsStore((s) => s.cancel);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [unconfirmedOrderId, setUnconfirmedOrderId] = useState<string | null>(null);
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
    void load();
  }, [load]);

  const cancel = async () => {
    if (!id) return;
    const result = await cancelBooking(id);
    if (!result.ok) {
      Alert.alert('Could not cancel', result.error);
      return;
    }

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

  const reconcileSettlementStatus = async (orderId: string) => {
    if (!id) return;

    try {
      const status = await paymentsApi.getPaymentStatus(orderId);
      if (!status.success) throw new Error(status.error || 'Could not confirm payment status');

      if (status.status === 'SUCCESS') {
        setUnconfirmedOrderId(null);
        await fetchOne(id);
        Alert.alert('Payment received', 'This booking is now paid in full.');
        return;
      }

      if (status.status === 'FAILED' || status.status === 'REFUNDED') {
        setUnconfirmedOrderId(null);
        await fetchOne(id);
        Alert.alert(
          status.status === 'REFUNDED' ? 'Payment refunded' : 'Payment not completed',
          status.status === 'REFUNDED'
            ? 'This payment was refunded. You can start a new payment if a balance is still due.'
            : 'Nothing was confirmed for this order. You can try payment again.'
        );
        return;
      }

      await fetchOne(id);
      Alert.alert(
        'Still confirming your payment',
        'CareBow is still waiting for Razorpay confirmation. This booking is locked to the existing payment so you cannot accidentally pay twice.'
      );
    } catch {
      Alert.alert(
        'Could not confirm payment yet',
        'Do not pay again. Check your connection, then use “Check payment status” again.'
      );
    }
  };

  const payNow = async () => {
    if (!id) return;
    setPaying(true);
    try {
      if (unconfirmedOrderId) {
        await reconcileSettlementStatus(unconfirmedOrderId);
        return;
      }

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
        setUnconfirmedOrderId(order.orderId);
        await fetchOne(id);
        Alert.alert(
          'Still confirming your payment',
          'If you completed payment this booking will show as paid shortly. This screen will only recheck the same payment until CareBow knows the result.'
        );
      }
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.state}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.body}>Loading booking…</Text>
      </View>
    );
  }

  if (!booking) {
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
  }

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

  const medicines = Array.isArray(booking.prescription?.medicines)
    ? booking.prescription.medicines
    : [];
  const labTests = Array.isArray(booking.prescription?.labTests)
    ? booking.prescription.labTests
    : [];
  const hasOutcome = Boolean(booking.consultationNote || booking.prescription);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
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

      {hasOutcome && (
        <View style={styles.outcomeCard}>
          <View style={styles.sectionHeader}>
            <Icon name="document-text-outline" size={20} color={colors.accent} />
            <Text style={styles.sectionTitle}>Care outcome</Text>
          </View>

          {booking.consultationNote && (
            <>
              <Text style={styles.label}>Chief complaint</Text>
              <Text style={styles.value}>{booking.consultationNote.chiefComplaint}</Text>
              {booking.consultationNote.findings ? (
                <>
                  <Text style={styles.label}>Provider findings</Text>
                  <Text style={styles.value}>{booking.consultationNote.findings}</Text>
                </>
              ) : null}
              <Text style={styles.label}>Provider assessment</Text>
              <Text style={styles.value}>{booking.consultationNote.diagnosis}</Text>
              {booking.consultationNote.treatmentPlan ? (
                <>
                  <Text style={styles.label}>Care plan</Text>
                  <Text style={styles.value}>{booking.consultationNote.treatmentPlan}</Text>
                </>
              ) : null}
            </>
          )}

          {booking.prescription && (
            <View style={styles.prescriptionBlock}>
              <Text style={styles.subheading}>Prescription / next steps</Text>
              {medicines.map((medicine, index) => {
                const name = typeof medicine?.name === 'string' ? medicine.name : 'Medicine';
                const details = [medicine?.dose, medicine?.frequency, medicine?.duration]
                  .filter((value): value is string => typeof value === 'string' && value.length > 0)
                  .join(' · ');
                return (
                  <View key={`${name}-${index}`} style={styles.listRow}>
                    <Icon name="medical-outline" size={16} color={colors.accent} />
                    <View style={styles.listCopy}>
                      <Text style={styles.value}>{name}</Text>
                      {details ? <Text style={styles.secondaryValue}>{details}</Text> : null}
                    </View>
                  </View>
                );
              })}

              {labTests.length > 0 ? (
                <>
                  <Text style={styles.label}>Tests</Text>
                  <Text style={styles.value}>{labTests.join(', ')}</Text>
                </>
              ) : null}
              {booking.prescription.advice ? (
                <>
                  <Text style={styles.label}>Advice</Text>
                  <Text style={styles.value}>{booking.prescription.advice}</Text>
                </>
              ) : null}
              {booking.prescription.nextReview ? (
                <>
                  <Text style={styles.label}>Next review</Text>
                  <Text style={styles.value}>
                    {new Date(booking.prescription.nextReview).toLocaleDateString()}
                  </Text>
                </>
              ) : null}
            </View>
          )}
        </View>
      )}

      {booking.status === 'COMPLETED' && !hasOutcome && (
        <View style={styles.pendingOutcome}>
          <Icon name="time-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.pendingOutcomeText}>
            Care is marked complete. Provider notes will appear here when they are recorded.
          </Text>
        </View>
      )}

      {payable && (
        <TouchableOpacity
          style={[styles.payButton, busy && styles.disabled]}
          onPress={payNow}
          disabled={busy}
        >
          <Icon
            name={unconfirmedOrderId ? 'refresh' : 'card-outline'}
            size={18}
            color={colors.textInverse}
          />
          <Text style={styles.payText}>
            {busy
              ? unconfirmedOrderId
                ? 'Checking payment…'
                : 'Opening payment…'
              : unconfirmedOrderId
                ? 'Check payment status'
                : `Pay ${money(booking.amount, booking.currency)}`}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface2 },
  content: { padding: spacing.xl, paddingTop: 64, paddingBottom: 80 },
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
  outcomeCard: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.accentSoft,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  sectionTitle: { ...typography.h4, color: colors.textPrimary },
  subheading: { ...typography.labelLarge, color: colors.textPrimary, marginTop: spacing.sm },
  prescriptionBlock: { marginTop: spacing.sm, gap: spacing.xs },
  listRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  listCopy: { flex: 1 },
  secondaryValue: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  pendingOutcome: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  pendingOutcomeText: { ...typography.bodySmall, color: colors.textSecondary, flex: 1 },
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
