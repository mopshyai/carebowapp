import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import type { AppNavigationProp } from '../navigation/types';
import { careRequestsApi, type CareRequest } from '../services/api/endpoints/careRequests';
import { paymentsApi } from '../services/api/endpoints/payments';
import { useHostedCheckout } from '../hooks/useHostedCheckout';
import { formatMinor } from '../data/countries';
import { colors, radius, spacing, typography } from '../theme';

const DIRECT_CANCEL_STATUSES = new Set([
  'NEEDS_DETAILS',
  'SOURCING',
  'QUOTE_READY',
  'CUSTOMER_APPROVAL',
  'PAYMENT_PENDING',
]);

const humanize = (value: string) => value.toLowerCase().replace(/_/g, ' ');

const requestTitle = (request: CareRequest) =>
  request.linkedBooking?.serviceName || request.serviceHint || 'Custom care request';

const statusMessage = (request: CareRequest) => {
  switch (request.status) {
    case 'NEEDS_DETAILS':
      return 'CareBow needs a little more information before operations can source this request.';
    case 'SOURCING':
      return 'CareBow operations is sourcing the right provider or partner.';
    case 'QUOTE_READY':
      return 'Operations has prepared a quote and is moving it to customer review.';
    case 'CUSTOMER_APPROVAL':
      return 'Your quote is ready. Review it before approving payment.';
    case 'PAYMENT_PENDING':
      return 'You approved the quote. Payment is still required before this request is confirmed.';
    case 'CONFIRMED':
      return request.linkedBooking
        ? 'Your request is confirmed and has moved into the provider booking lifecycle.'
        : 'Your request is confirmed. CareBow is coordinating fulfillment.';
    case 'COMPLETED':
      return 'CareBow has marked this care request complete.';
    case 'CANCELLED':
      return 'This care request was cancelled.';
    default:
      return `Current CareBow status: ${humanize(request.status)}.`;
  }
};

export default function RequestDetailsScreen() {
  const navigation = useNavigation() as AppNavigationProp;
  const route = useRoute();
  const id = (route.params as { id?: string } | undefined)?.id;
  const [request, setRequest] = useState<CareRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState(false);
  const [paying, setPaying] = useState(false);
  const [unconfirmedOrderId, setUnconfirmedOrderId] = useState<string | null>(null);
  const checkout = useHostedCheckout();

  const load = useCallback(async () => {
    if (!id) {
      setError('Care request ID is missing.');
      setLoading(false);
      return null;
    }

    setError(null);
    try {
      const next = await careRequestsApi.get(id);
      if (!next) {
        setRequest(null);
        setError('Care request not found or you no longer have access to its patient profile.');
      } else {
        setRequest(next);
      }
      return next;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load this care request.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void load();
    }, [load])
  );

  const approveQuote = async () => {
    if (!id || !request) return;
    setActing(true);
    try {
      const result = await careRequestsApi.approveQuote(id);
      setRequest(result.careRequest);
      if (result.careRequest.status === 'CONFIRMED') {
        Alert.alert('Quote approved', 'This request is confirmed. No payment was required.');
      } else {
        Alert.alert(
          'Quote approved',
          'The quote is approved. Complete payment when you are ready; CareBow will confirm only after Razorpay and the server do.'
        );
      }
    } catch (cause) {
      Alert.alert(
        'Could not approve quote',
        cause instanceof Error ? cause.message : 'Refresh the request and try again.'
      );
      await load();
    } finally {
      setActing(false);
    }
  };

  const cancelRequest = async () => {
    if (!id) return;
    setActing(true);
    try {
      const result = await careRequestsApi.cancel(id);
      setRequest(result.careRequest);
      if (result.refund?.pending) {
        Alert.alert(
          'Request cancelled',
          'Cancellation is recorded. The automatic refund could not be completed yet, so CareBow operations must finish it.'
        );
      } else if (result.refund?.refunded) {
        Alert.alert('Request cancelled', 'The linked payment is being returned to you.');
      } else {
        Alert.alert('Request cancelled', 'CareBow has recorded the cancellation.');
      }
    } catch (cause) {
      Alert.alert(
        'Could not cancel',
        cause instanceof Error ? cause.message : 'Refresh the request and try again.'
      );
      await load();
    } finally {
      setActing(false);
    }
  };

  const reconcilePayment = async (orderId: string) => {
    if (!id) return;
    try {
      const status = await paymentsApi.getPaymentStatus(orderId);
      if (!status.success) throw new Error(status.error || 'Could not confirm payment status');
      if (status.kind && status.kind !== 'care_request') {
        throw new Error('CareBow returned the wrong payment type for this request.');
      }
      if (status.careRequest?.id && status.careRequest.id !== id) {
        throw new Error('CareBow returned payment status for a different request.');
      }

      if (status.status === 'SUCCESS') {
        setUnconfirmedOrderId(null);
        await load();
        Alert.alert(
          'Payment received',
          'Razorpay and CareBow confirmed the payment. Your care request is now moving forward.'
        );
        return;
      }

      if (status.status === 'FAILED' || status.status === 'REFUNDED') {
        setUnconfirmedOrderId(null);
        await load();
        Alert.alert(
          status.status === 'REFUNDED' ? 'Payment refunded' : 'Payment not completed',
          status.status === 'REFUNDED'
            ? 'This payment was refunded. Refresh the request before trying anything else.'
            : 'CareBow did not confirm this payment. You can try again after refreshing the request.'
        );
        return;
      }

      await load();
      Alert.alert(
        'Still confirming your payment',
        'CareBow is still waiting for processor confirmation. Do not start another payment; check this same payment again.'
      );
    } catch {
      Alert.alert(
        'Could not confirm payment yet',
        'Do not pay again. Check your connection, then use “Check payment status” again.'
      );
    }
  };

  const payNow = async () => {
    if (!id || !request) return;
    setPaying(true);
    try {
      if (unconfirmedOrderId) {
        await reconcilePayment(unconfirmedOrderId);
        return;
      }

      const order = await paymentsApi.createCareRequestOrder(id);
      if (!order.success || !order.orderId || !order.paymentUrl) {
        Alert.alert('Could not start payment', order.error || 'Refresh this request and try again.');
        await load();
        return;
      }

      const outcome = await checkout.start({
        orderId: order.orderId,
        paymentUrl: order.paymentUrl,
      });

      if (outcome.status === 'paid') {
        setUnconfirmedOrderId(null);
        await load();
        Alert.alert(
          'Payment received',
          'Razorpay and CareBow confirmed the payment. Your care request is now moving forward.'
        );
      } else if (outcome.status === 'failed') {
        await load();
        Alert.alert('Payment not completed', 'CareBow did not confirm a charge. You can try again.');
      } else {
        setUnconfirmedOrderId(order.orderId);
        await load();
        Alert.alert(
          'Still confirming your payment',
          'If you completed payment, CareBow will show it after the webhook arrives. Do not create another payment; recheck this one.'
        );
      }
    } finally {
      setPaying(false);
    }
  };

  if (loading && !request) {
    return (
      <View style={styles.state}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.body}>Loading care request…</Text>
      </View>
    );
  }

  if (!request) {
    return (
      <View style={styles.state}>
        <Icon name="alert-circle-outline" size={48} color={colors.textTertiary} />
        <Text style={styles.title}>Care request unavailable</Text>
        <Text style={styles.body}>{error || 'This request could not be loaded.'}</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryButtonText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const quote = request.quote
    ? formatMinor(request.quote.amountMinor, request.quote.currency)
    : null;
  const canApprove = request.status === 'CUSTOMER_APPROVAL' && Boolean(request.quote);
  const payable =
    request.status === 'PAYMENT_PENDING' &&
    Boolean(request.quote && request.quote.amountMinor > 0);
  const linkedBookingCancellable =
    request.linkedBooking && ['PENDING', 'CONFIRMED'].includes(request.linkedBooking.status);
  const cancellable =
    DIRECT_CANCEL_STATUSES.has(request.status) || Boolean(linkedBookingCancellable);
  const busy = acting || paying || checkout.busy;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        style={styles.back}
        onPress={() => navigation.goBack()}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Icon name="arrow-back" size={24} color={colors.textPrimary} />
      </TouchableOpacity>

      <Text style={styles.eyebrow}>CARE REQUEST</Text>
      <Text style={styles.title}>{requestTitle(request)}</Text>
      <Text style={styles.status}>{humanize(request.status)}</Text>
      <Text style={styles.statusMessage}>{statusMessage(request)}</Text>

      {error ? (
        <View style={styles.warningCard}>
          <Icon name="warning-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.warningText}>{error}</Text>
        </View>
      ) : null}

      {request.escalation ? (
        <View style={styles.urgentCard}>
          <Icon name="alert-circle-outline" size={20} color={colors.accent} />
          <View style={styles.flex}>
            <Text style={styles.cardHeading}>Urgent operations handling</Text>
            <Text style={styles.secondaryValue}>
              {request.escalation.acknowledgedAt
                ? 'A CareBow operations team member has acknowledged this escalation.'
                : 'This request is escalated in the CareBow operations queue and still awaits human acknowledgement.'}
            </Text>
          </View>
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.label}>What you asked for</Text>
        <Text style={styles.value}>{request.requestText}</Text>

        <Text style={styles.label}>Care recipient</Text>
        <Text style={styles.value}>{request.profile?.name || 'Not provided'}</Text>

        {request.preferredDate ? (
          <>
            <Text style={styles.label}>Preferred date</Text>
            <Text style={styles.value}>{new Date(request.preferredDate).toLocaleDateString()}</Text>
          </>
        ) : null}

        {request.preferredWindow ? (
          <>
            <Text style={styles.label}>Preferred time</Text>
            <Text style={styles.value}>{request.preferredWindow}</Text>
          </>
        ) : null}

        {request.location ? (
          <>
            <Text style={styles.label}>Location</Text>
            <Text style={styles.value}>{request.location}</Text>
          </>
        ) : null}

        <Text style={styles.label}>Last updated</Text>
        <Text style={styles.value}>{new Date(request.updatedAt).toLocaleString()}</Text>
      </View>

      {request.quote ? (
        <View style={styles.quoteCard}>
          <View style={styles.sectionHeader}>
            <Icon name="receipt-outline" size={20} color={colors.accent} />
            <Text style={styles.cardHeading}>CareBow quote</Text>
          </View>
          <Text style={styles.quoteAmount}>{quote}</Text>
          <Text style={styles.secondaryValue}>
            This amount comes from the canonical CareRequest quote. The app cannot alter it.
          </Text>

          {canApprove ? (
            <TouchableOpacity
              style={[styles.primaryButton, busy && styles.disabled]}
              onPress={approveQuote}
              disabled={busy}
            >
              <Icon name="checkmark-circle-outline" size={18} color={colors.textInverse} />
              <Text style={styles.primaryButtonText}>
                {acting ? 'Approving…' : 'Approve quote'}
              </Text>
            </TouchableOpacity>
          ) : null}

          {payable ? (
            <TouchableOpacity
              style={[styles.primaryButton, busy && styles.disabled]}
              onPress={payNow}
              disabled={busy}
            >
              <Icon
                name={unconfirmedOrderId ? 'refresh' : 'card-outline'}
                size={18}
                color={colors.textInverse}
              />
              <Text style={styles.primaryButtonText}>
                {busy
                  ? unconfirmedOrderId
                    ? 'Checking payment…'
                    : 'Opening payment…'
                  : unconfirmedOrderId
                    ? 'Check payment status'
                    : `Pay ${quote}`}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      {request.linkedBooking ? (
        <View style={styles.bookingCard}>
          <View style={styles.sectionHeader}>
            <Icon name="calendar-outline" size={20} color={colors.accent} />
            <Text style={styles.cardHeading}>Provider booking</Text>
          </View>
          <Text style={styles.value}>{request.linkedBooking.serviceName}</Text>
          <Text style={styles.secondaryValue}>
            {humanize(request.linkedBooking.status)} ·{' '}
            {new Date(request.linkedBooking.scheduledAt).toLocaleString()}
          </Text>
          <Text style={styles.secondaryValue}>
            {request.linkedBooking.providerName || 'Provider not assigned yet'}
          </Text>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() =>
              navigation.navigate('OrderDetails', { id: request.linkedBooking!.bookingId })
            }
          >
            <Text style={styles.secondaryButtonText}>Open booking</Text>
            <Icon name="arrow-forward" size={17} color={colors.accent} />
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.truthCard}>
        <Icon name="shield-checkmark-outline" size={18} color={colors.textSecondary} />
        <Text style={styles.truthText}>
          Status, quote, payment and provider progress shown here come from CareBow's server. The
          app does not mark care or payment complete on its own.
        </Text>
      </View>

      {cancellable && request.status !== 'CANCELLED' ? (
        <TouchableOpacity
          style={[styles.cancelButton, busy && styles.disabled]}
          disabled={busy}
          onPress={() =>
            Alert.alert(
              request.linkedBooking ? 'Cancel this care?' : 'Cancel care request?',
              request.linkedBooking
                ? 'CareBow will cancel the linked provider booking through the canonical cancellation/refund flow.'
                : 'This updates the real CareBow request and cannot be undone from this screen.',
              [
                { text: 'Keep request', style: 'cancel' },
                { text: 'Cancel request', style: 'destructive', onPress: cancelRequest },
              ]
            )
          }
        >
          <Text style={styles.cancelText}>{acting ? 'Cancelling…' : 'Cancel request'}</Text>
        </TouchableOpacity>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface2 },
  content: { padding: spacing.xl, paddingTop: 64, paddingBottom: 80, gap: spacing.md },
  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.surface2,
  },
  flex: { flex: 1 },
  back: { width: 44, height: 44, justifyContent: 'center' },
  eyebrow: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    letterSpacing: 1.2,
  },
  title: { ...typography.h2, color: colors.textPrimary, textAlign: 'center' },
  body: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  status: {
    ...typography.label,
    color: colors.accent,
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  statusMessage: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  quoteCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.accentSoft,
  },
  bookingCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  urgentCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.accentSoft,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  warningText: { ...typography.bodySmall, color: colors.textSecondary, flex: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  cardHeading: { ...typography.h4, color: colors.textPrimary },
  quoteAmount: { ...typography.h2, color: colors.textPrimary },
  label: { ...typography.caption, color: colors.textTertiary, marginTop: spacing.sm },
  value: { ...typography.body, color: colors.textPrimary },
  secondaryValue: { ...typography.bodySmall, color: colors.textSecondary },
  primaryButton: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  primaryButtonText: { ...typography.labelLarge, color: colors.textInverse },
  secondaryButton: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  secondaryButtonText: { ...typography.labelLarge, color: colors.accent },
  truthCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  truthText: { ...typography.bodySmall, color: colors.textSecondary, flex: 1 },
  cancelButton: {
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  cancelText: { ...typography.labelLarge, color: colors.error },
  disabled: { opacity: 0.6 },
});
