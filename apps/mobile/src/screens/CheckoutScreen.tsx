/**
 * Checkout Screen
 * Professional checkout with order summary and payment
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

  // Store hooks
  const { bookingDraft, clearBookingDraft } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // If Razorpay returned but the webhook is still pending, keep the exact order
  // id locked to this checkout. The next tap checks that order; it must never
  // create a second payment for the same booking while the first is unresolved.
  const [unconfirmedOrderId, setUnconfirmedOrderId] = useState<string | null>(null);

  /**
   * Paying means leaving the app for Razorpay's page, so the outcome comes from
   * asking the server on resume — never from anything this screen observed. The
   * mechanics of that are shared with the other paid flows.
   */
  const checkout = useHostedCheckout();

  // Format date for display
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
    // A confirmed payment already produced the server booking. Remove the draft
    // immediately so this screen cannot issue a second payment for it.
    clearBookingDraft();
    Alert.alert(
      'Payment received',
      'Your booking is confirmed. The care team will be in touch with provider details.',
      [{ text: 'View schedule', onPress: () => navigation.navigate('Schedule') }],
      { cancelable: false }
    );
  };

  const recheckUnconfirmedOrder = async (orderId: string) => {
    try {
      const status = await paymentsApi.getPaymentStatus(orderId);
      if (!status.success) {
        throw new Error(status.error || 'Could not confirm payment status');
      }

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

      // The service catalog is backend-driven, so bookingDraft.serviceId is
      // already a real /v1/services row id.
      const noteParts = [
        `Requested: ${bookingDraft.serviceTitle}`,
        bookingDraft.selectedPackageLabel ? `Package: ${bookingDraft.selectedPackageLabel}` : null,
        bookingDraft.requestNotes ? bookingDraft.requestNotes : null,
      ].filter(Boolean) as string[];

      let backendProfileId: string;
      try {
        backendProfileId = await ensureBackendProfile(bookingDraft.memberId);
      } catch (error) {
        Alert.alert(
          'Could not prepare your profile',
          "Please make sure you're signed in and try again."
        );
        return;
      }

      // What the customer picked. The server prices it against its own catalog —
      // we never send an amount, so a modified client cannot name its own price.
      // Re-read the exact service at the payment boundary so the pricing model
      // comes from the live backend catalog too. A valid backend-only service
      // must not be rejected because it is absent from the bundled local catalog.
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

      const outcome = await checkout.start({
        orderId: order.orderId,
        paymentUrl: order.paymentUrl,
      });

      if (outcome.status === 'paid') {
        showPaidConfirmation();
      } else if (outcome.status === 'failed') {
        Alert.alert('Payment not completed', 'Nothing was charged. You can try again.');
      } else {
        // Lock this checkout to the same server order. A slow webhook is not a
        // reason to mint another payment link and risk charging the customer twice.
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

  // Error state
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

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 140 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Summary Card */}
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

        {/* Special Requests */}
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

        {/* Pricing Breakdown */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconWrap, { backgroundColor: colors.successSoft }]}>
              <Icon name="wallet-outline" size={20} color={colors.success} />
            </View>
            <Text style={styles.cardTitle}>Price</Text>
          </View>

          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>{bookingDraft.pricingLabel}</Text>
            <Text style={styles.pricingValue}>{formatMoney(bookingDraft.subtotal, country)}</Text>
          </View>

          {bookingDraft.discount > 0 && (
            <View style={styles.pricingRow}>
              <Text style={[styles.pricingLabel, styles.discountLabel]}>Discount</Text>
              <Text style={[styles.pricingValue, styles.discountValue]}>
                -{formatMoney(bookingDraft.discount, country)}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatMoney(bookingDraft.total, country)}</Text>
          </View>
        </View>

        {/* Confirmation behavior */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconWrap, { backgroundColor: colors.accentSoft }]}>
              <Icon name="card-outline" size={20} color={colors.accent} />
            </View>
            <Text style={styles.cardTitle}>Booking confirmation</Text>
          </View>

          <View style={styles.paymentMethodRow}>
            <View style={styles.paymentMethodLeft}>
              <Icon name="card" size={24} color={colors.accent} />
              <View>
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
              Payment is handled by Razorpay. CareBow confirms the provider and final timing
            </Text>
          </View>
        </View>

        {/* Booking notice */}
        <View style={styles.bookingNotice}>
          <Icon name="information-circle-outline" size={16} color={colors.textTertiary} />
          <Text style={styles.bookingNoticeText}>
            Submitting creates a real pending booking. It does not claim that a provider is
            assigned.
          </Text>
        </View>
      </ScrollView>

      {/* Pay Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.footerPriceRow}>
          <Text style={styles.footerPriceLabel}>Total</Text>
          <Text style={styles.footerPriceValue}>{formatMoney(bookingDraft.total, country)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.payButton, (isSubmitting || checkout.busy) && styles.buttonDisabled]}
          onPress={handleBooking}
          activeOpacity={0.8}
          disabled={isSubmitting || checkout.busy}
        >
          <Icon
            name={unconfirmedOrderId ? 'refresh' : 'calendar'}
            size={18}
            color={colors.white}
          />
          <Text style={styles.payButtonText}>
            {isSubmitting || checkout.busy
              ? unconfirmedOrderId
                ? 'Checking payment…'
                : 'Opening payment…'
              : unconfirmedOrderId
                ? 'Check payment status'
                : 'Pay and book'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface2,
  },
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
  headerTitle: {
    ...typography.h3,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
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
  errorTitle: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
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
  errorButtonText: {
    ...typography.labelLarge,
    color: colors.white,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  successIconWrap: {
    marginBottom: spacing.lg,
  },
  successTitle: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  successSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
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
  cardTitle: {
    ...typography.h4,
  },
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
  summaryLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.label,
    textAlign: 'right',
    flex: 1,
    marginLeft: spacing.md,
  },
  notesText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  pricingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    rowGap: spacing.xxs,
    columnGap: spacing.sm,
  },
  pricingLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  pricingValue: {
    ...typography.body,
  },
  discountLabel: {
    color: colors.success,
  },
  discountValue: {
    color: colors.success,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    rowGap: spacing.xxs,
    columnGap: spacing.sm,
  },
  totalLabel: {
    ...typography.h4,
  },
  totalValue: {
    ...typography.h2,
    color: colors.accent,
  },
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
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  paymentMethodText: {
    ...typography.label,
  },
  paymentMethodSubtext: {
    ...typography.caption,
    marginTop: 2,
  },
  radioSelected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  securityNoteText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  bookingNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  bookingNoticeText: {
    ...typography.caption,
    color: colors.textTertiary,
    flex: 1,
  },
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
  footerPriceLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  footerPriceValue: {
    ...typography.h3,
  },
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
  buttonDisabled: {
    opacity: 0.6,
  },
  payButtonDisabled: {
    backgroundColor: colors.textTertiary,
    ...shadows.none,
  },
  payButtonText: {
    ...typography.labelLarge,
    color: colors.white,
  },
});