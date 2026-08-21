/**
 * Checkout Screen
 * Server-driven booking review. Paid services use Razorpay; quote-only services
 * create a real pending booking without pretending a payment is required.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { AppNavigationProp } from '../navigation/types';
import Icon from 'react-native-vector-icons/Ionicons';
import { formatTime, formatDuration } from '../data/services';
import { useCartStore } from '../store/useCartStore';
import { useProfileStore } from '../store/useProfileStore';
import { useBookingsStore } from '../store';
import { colors, spacing, radius, typography, shadows } from '../theme';
import { formatMoney } from '../data/countries';
import { ensureBackendProfile } from '../lib/profileSync';
import { paymentsApi, selectionFromDraft } from '../services/api/endpoints/payments';
import { servicesApi } from '../services/api/endpoints/services';
import { toBookingService } from '../lib/liveServiceCatalog';
import { useHostedCheckout } from '../hooks/useHostedCheckout';

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const country = useProfileStore((state) => state.country);
  const navigation = useNavigation() as AppNavigationProp;
  const route = useRoute();
  const { serviceId } = (route.params as { serviceId: string }) || {};

  const { bookingDraft, clearBookingDraft } = useCartStore();
  const createDirectBooking = useBookingsStore((state) => state.create);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unconfirmedOrderId, setUnconfirmedOrderId] = useState<string | null>(null);
  const checkout = useHostedCheckout();

  // calculatePrice uses this exact label only for a quote service with no
  // booking fee. The backend still makes the final eligibility decision.
  const isQuoteOnlyRequest =
    bookingDraft?.total === 0 && bookingDraft?.pricingLabel === 'Price confirmed by CareBow';

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const showPaidConfirmation = () => {
    setUnconfirmedOrderId(null);
    clearBookingDraft();
    Alert.alert(
      'Payment received',
      'Your booking is confirmed. The care team will be in touch with provider details.',
      [{ text: 'View schedule', onPress: () => navigation.navigate('Schedule') }],
      { cancelable: false }
    );
  };

  const showRequestConfirmation = (bookingId: string) => {
    clearBookingDraft();
    Alert.alert(
      'Request submitted',
      'CareBow received your request. The care team will review the details, confirm the price if needed, and assign a provider before the visit.',
      [
        {
          text: 'View booking',
          onPress: () => navigation.navigate('OrderDetails', { id: bookingId }),
        },
      ],
      { cancelable: false }
    );
  };

  const recheckUnconfirmedOrder = async (orderId: string) => {
    try {
      const status = await paymentsApi.getPaymentStatus(orderId);
      if (!status.success) throw new Error(status.error || 'Could not confirm payment status');

      if (status.status === 'SUCCESS') {
        showPaidConfirmation();
        return;
      }

      if (status.status === 'FAILED' || status.status === 'REFUNDED') {
        setUnconfirmedOrderId(null);
        Alert.alert(
          status.status === 'REFUNDED' ? 'Payment refunded' : 'Payment not completed',
          status.status === 'REFUNDED'
            ? 'This payment was refunded. You can start a new payment if you still want the booking.'
            : 'Nothing was confirmed for this order. You can try payment again.'
        );
        return;
      }

      Alert.alert(
        'Still confirming your payment',
        'CareBow is still waiting for Razorpay confirmation. This checkout is locked so you cannot accidentally pay twice.',
        [{ text: 'View schedule', onPress: () => navigation.navigate('Schedule') }]
      );
    } catch {
      Alert.alert(
        'Could not confirm payment yet',
        'Do not pay again. Check your connection or your schedule, then use “Check payment status” again.'
      );
    }
  };

  const handleBooking = async () => {
    if (!bookingDraft?.memberId || !bookingDraft.date || !bookingDraft.startTime) return;
    setIsSubmitting(true);

    try {
      if (unconfirmedOrderId) {
        await recheckUnconfirmedOrder(unconfirmedOrderId);
        return;
      }

      const scheduledAt = new Date(
        `${bookingDraft.date}T${bookingDraft.startTime}:00`
      ).toISOString();

      const noteParts = [
        `Requested: ${bookingDraft.serviceTitle}`,
        bookingDraft.selectedPackageLabel ? `Package: ${bookingDraft.selectedPackageLabel}` : null,
        bookingDraft.requestNotes ? bookingDraft.requestNotes : null,
      ].filter(Boolean) as string[];

      let backendProfileId: string;
      try {
        backendProfileId = await ensureBackendProfile(bookingDraft.memberId);
      } catch {
        Alert.alert(
          'Could not prepare your profile',
          "Please make sure you're signed in and try again."
        );
        return;
      }

      let liveService;
      try {
        const v1Service = await servicesApi.getServiceDetails(bookingDraft.serviceId);
        liveService = toBookingService(v1Service);
      } catch {
        Alert.alert(
          'Service changed',
          'CareBow could not verify this service with the live catalog. Please go back and choose it again.'
        );
        return;
      }

      // A quote with no booking fee has nothing to charge today. Create the
      // real PENDING booking through the server's direct-booking gate instead
      // of opening a zero-value Razorpay checkout. The server independently
      // verifies that this exact service is allowed to be requested for free.
      if (
        isQuoteOnlyRequest &&
        liveService.pricing.type === 'quote' &&
        !liveService.pricing.bookingFee
      ) {
        const result = await createDirectBooking({
          serviceId: bookingDraft.serviceId,
          profileId: backendProfileId,
          scheduledAt,
          notes: noteParts.join(' · ') || undefined,
          careContext: bookingDraft.referralContext ?? undefined,
        });

        if (!result.ok) throw new Error(result.error);
        showRequestConfirmation(result.booking.id);
        return;
      }

      const selection = selectionFromDraft({
        pricingModel: liveService.pricing.type,
        selectedPackageId: bookingDraft.selectedPackageId,
        hours: bookingDraft.hours,
        days: bookingDraft.days,
      });

      if (!selection) {
        Alert.alert(
          'Choose an option first',
          'Pick a package or duration before continuing to payment.'
        );
        return;
      }

      const order = await paymentsApi.createBookingOrder({
        serviceId: bookingDraft.serviceId,
        profileId: backendProfileId,
        scheduledAt,
        notes: noteParts.join(' · ') || undefined,
        selection,
        hosted: true,
        callbackUrl: 'carebow://checkout/return',
      });

      if (!order.success || !order.paymentUrl || !order.orderId) {
        throw new Error(order.error || 'Could not start payment');
      }

      const outcome = await checkout.start({ orderId: order.orderId, paymentUrl: order.paymentUrl });

      if (outcome.status === 'paid') {
        showPaidConfirmation();
      } else if (outcome.status === 'failed') {
        Alert.alert('Payment not completed', 'Nothing was charged. You can try again.');
      } else {
        setUnconfirmedOrderId(order.orderId);
        Alert.alert(
          'Still confirming your payment',
          'If you completed payment it will appear in your schedule shortly. This checkout will only recheck the same payment until CareBow knows the result.',
          [{ text: 'View schedule', onPress: () => navigation.navigate('Schedule') }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Could not submit booking',
        error instanceof Error ? error.message : 'Check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!bookingDraft || bookingDraft.serviceId !== serviceId) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIconWrap}>
            <Icon name="alert-circle-outline" size={48} color={colors.textTertiary} />
          </View>
          <Text style={styles.errorTitle}>Booking not found</Text>
          <Text style={styles.errorSubtitle}>
            Your booking information may have expired. Please try again.
          </Text>
          <TouchableOpacity style={styles.errorButton} onPress={() => navigation.goBack()}>
            <Text style={styles.errorButtonText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review booking</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 140 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconWrap}>
              <Icon name="receipt-outline" size={20} color={colors.accent} />
            </View>
            <Text style={styles.cardTitle}>Order Summary</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service</Text>
            <Text style={styles.summaryValue}>{bookingDraft.serviceTitle}</Text>
          </View>

          {bookingDraft.memberName && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Patient</Text>
              <Text style={styles.summaryValue}>{bookingDraft.memberName}</Text>
            </View>
          )}

          {bookingDraft.date && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Date</Text>
              <Text style={styles.summaryValue}>{formatDate(bookingDraft.date)}</Text>
            </View>
          )}

          {bookingDraft.startTime && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Time</Text>
              <Text style={styles.summaryValue}>{formatTime(bookingDraft.startTime)}</Text>
            </View>
          )}

          {bookingDraft.selectedPackageLabel && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Package</Text>
              <Text style={styles.summaryValue}>{bookingDraft.selectedPackageLabel}</Text>
            </View>
          )}

          {bookingDraft.hours && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Duration</Text>
              <Text style={styles.summaryValue}>
                {bookingDraft.hours} hour{bookingDraft.hours > 1 ? 's' : ''}
              </Text>
            </View>
          )}

          {bookingDraft.days && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Duration</Text>
              <Text style={styles.summaryValue}>
                {bookingDraft.days} day{bookingDraft.days > 1 ? 's' : ''}
              </Text>
            </View>
          )}

          {bookingDraft.durationMinutes && !bookingDraft.hours && !bookingDraft.days && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Duration</Text>
              <Text style={styles.summaryValue}>
                {formatDuration(bookingDraft.durationMinutes)}
              </Text>
            </View>
          )}
        </View>

        {bookingDraft.requestNotes.trim() && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconWrap, { backgroundColor: colors.infoSoft }]}>
                <Icon name="document-text-outline" size={20} color={colors.info} />
              </View>
              <Text style={styles.cardTitle}>Special Requests</Text>
            </View>
            <Text style={styles.notesText}>{bookingDraft.requestNotes}</Text>
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconWrap, { backgroundColor: colors.successSoft }]}>
              <Icon name="wallet-outline" size={20} color={colors.success} />
            </View>
            <Text style={styles.cardTitle}>{isQuoteOnlyRequest ? 'Pricing' : 'Price'}</Text>
          </View>

          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>{bookingDraft.pricingLabel}</Text>
            <Text style={styles.pricingValue}>
              {isQuoteOnlyRequest ? 'No payment today' : formatMoney(bookingDraft.subtotal, country)}
            </Text>
          </View>

          {!isQuoteOnlyRequest && bookingDraft.discount > 0 && (
            <View style={styles.pricingRow}>
              <Text style={[styles.pricingLabel, styles.discountLabel]}>Discount</Text>
              <Text style={[styles.pricingValue, styles.discountValue]}>
                -{formatMoney(bookingDraft.discount, country)}
              </Text>
            </View>
          )}

          {!isQuoteOnlyRequest && (
            <>
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatMoney(bookingDraft.total, country)}</Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconWrap, { backgroundColor: colors.accentSoft }]}>
              <Icon
                name={isQuoteOnlyRequest ? 'clipboard-outline' : 'card-outline'}
                size={20}
                color={colors.accent}
              />
            </View>
            <Text style={styles.cardTitle}>
              {isQuoteOnlyRequest ? 'Request confirmation' : 'Booking confirmation'}
            </Text>
          </View>

          {isQuoteOnlyRequest ? (
            <View style={styles.requestMethodRow}>
              <Icon name="people-outline" size={24} color={colors.accent} />
              <View style={styles.methodCopy}>
                <Text style={styles.paymentMethodText}>Care team review</Text>
                <Text style={styles.paymentMethodSubtext}>
                  Submit now. CareBow will confirm pricing, provider, and final timing afterward.
                </Text>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.paymentMethodRow}>
                <View style={styles.paymentMethodLeft}>
                  <Icon name="card" size={24} color={colors.accent} />
                  <View style={styles.methodCopy}>
                    <Text style={styles.paymentMethodText}>Secure payment via Razorpay</Text>
                    <Text style={styles.paymentMethodSubtext}>
                      You'll finish payment in your browser, then come back here
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.securityNote}>
                <Icon name="shield-checkmark" size={14} color={colors.success} />
                <Text style={styles.securityNoteText}>
                  Payment is handled by Razorpay. CareBow confirms the provider and final timing.
                </Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.bookingNotice}>
          <Icon name="information-circle-outline" size={16} color={colors.textTertiary} />
          <Text style={styles.bookingNoticeText}>
            {isQuoteOnlyRequest
              ? 'Submitting creates a real pending request. It does not claim that a provider, final price, or final timing is confirmed.'
              : 'Payment creates a real booking after server confirmation. Provider assignment may follow separately.'}
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.footerPriceRow}>
          <Text style={styles.footerPriceLabel}>
            {isQuoteOnlyRequest ? 'Payment today' : 'Total'}
          </Text>
          <Text style={styles.footerPriceValue}>
            {isQuoteOnlyRequest ? 'None' : formatMoney(bookingDraft.total, country)}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.payButton, (isSubmitting || checkout.busy) && styles.buttonDisabled]}
          onPress={handleBooking}
          activeOpacity={0.8}
          disabled={isSubmitting || checkout.busy}
        >
          <Icon
            name={
              unconfirmedOrderId
                ? 'refresh'
                : isQuoteOnlyRequest
                  ? 'send-outline'
                  : 'calendar'
            }
            size={18}
            color={colors.white}
          />
          <Text style={styles.payButtonText}>
            {isSubmitting || checkout.busy
              ? unconfirmedOrderId
                ? 'Checking payment…'
                : isQuoteOnlyRequest
                  ? 'Submitting request…'
                  : 'Opening payment…'
              : unconfirmedOrderId
                ? 'Check payment status'
                : isQuoteOnlyRequest
                  ? 'Submit request'
                  : 'Pay and book'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface2 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
  },
  headerTitle: { ...typography.h3 },
  headerSpacer: { width: 40 },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  errorIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  errorTitle: { ...typography.h2, textAlign: 'center', marginBottom: spacing.xs },
  errorSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  errorButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
  },
  errorButtonText: { ...typography.labelLarge, color: colors.white },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  cardIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: { ...typography.h4 },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    rowGap: spacing.xxs,
    columnGap: spacing.sm,
  },
  summaryLabel: { ...typography.bodySmall, color: colors.textSecondary },
  summaryValue: { ...typography.label, textAlign: 'right', flex: 1, marginLeft: spacing.md },
  notesText: { ...typography.body, color: colors.textSecondary, lineHeight: 22 },
  pricingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    rowGap: spacing.xxs,
    columnGap: spacing.sm,
  },
  pricingLabel: { ...typography.body, color: colors.textSecondary },
  pricingValue: { ...typography.body },
  discountLabel: { color: colors.success },
  discountValue: { color: colors.success, fontWeight: '600' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  totalRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    rowGap: spacing.xxs,
    columnGap: spacing.sm,
  },
  totalLabel: { ...typography.h4 },
  totalValue: { ...typography.h2, color: colors.accent },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  requestMethodRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paymentMethodLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  methodCopy: { flex: 1 },
  paymentMethodText: { ...typography.label },
  paymentMethodSubtext: { ...typography.caption, marginTop: 2, color: colors.textSecondary },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  securityNoteText: { ...typography.caption, color: colors.textSecondary, flex: 1 },
  bookingNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  bookingNoticeText: { ...typography.caption, color: colors.textTertiary, flex: 1 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.card,
  },
  footerPriceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    rowGap: spacing.xxs,
    columnGap: spacing.sm,
  },
  footerPriceLabel: { ...typography.body, color: colors.textSecondary },
  footerPriceValue: { ...typography.h3 },
  payButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    ...shadows.button,
  },
  buttonDisabled: { opacity: 0.6 },
  payButtonText: { ...typography.labelLarge, color: colors.white },
});
