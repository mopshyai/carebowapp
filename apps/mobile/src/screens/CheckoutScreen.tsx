/**
 * Checkout Screen
 * Professional checkout with order summary and payment
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  AppState,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { AppNavigationProp } from '../navigation/types';
import Icon from 'react-native-vector-icons/Ionicons';
import { formatTime, formatDuration, getServiceById } from '../data/services';
import { useCartStore } from '../store/useCartStore';
import { useProfileStore } from '../store/useProfileStore';
import { colors, spacing, radius, typography, shadows } from '../theme';
import { formatMoney } from '../data/countries';
import { ensureBackendProfile } from '../lib/profileSync';
import { paymentsApi, selectionFromDraft } from '../services/api/endpoints/payments';

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const country = useProfileStore((state) => state.country);
  const navigation = useNavigation() as AppNavigationProp;
  const route = useRoute();
  const { serviceId } = (route.params as { serviceId: string }) || {};

  // Store hooks
  const { bookingDraft } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Order id of a hosted payment the customer has been sent away to complete.
   * A ref, not state: the AppState listener below reads it on resume, and a
   * stale closure would silently stop us checking whether they actually paid.
   */
  const pendingOrderId = useRef<string | null>(null);

  /**
   * Ask the server what happened. The app is not present when payment
   * completes — Razorpay's page is — so the webhook is what creates the
   * booking, and this only ever reads the result. PENDING for a few seconds is
   * normal while the webhook lands.
   */
  const checkPendingPayment = useCallback(async () => {
    const orderId = pendingOrderId.current;
    if (!orderId) return;

    for (let attempt = 0; attempt < 6; attempt++) {
      try {
        const res = await paymentsApi.getPaymentStatus(orderId);
        if (res.status === 'SUCCESS' && res.booking) {
          pendingOrderId.current = null;
          setIsSubmitting(false);
          Alert.alert(
            'Payment received',
            'Your booking is confirmed. The care team will be in touch with provider details.',
            [{ text: 'View schedule', onPress: () => navigation.navigate('Schedule') }]
          );
          return;
        }
        if (res.status === 'FAILED') {
          pendingOrderId.current = null;
          setIsSubmitting(false);
          Alert.alert('Payment not completed', 'Nothing was charged. You can try again.');
          return;
        }
      } catch {
        // Network blip on resume; the next attempt covers it.
      }
      await new Promise((r) => setTimeout(r, 2000));
    }

    // Still pending after ~12s. Do NOT claim failure — the webhook may simply be
    // slow, and telling someone their payment failed when it went through is the
    // worst outcome here.
    setIsSubmitting(false);
    Alert.alert(
      'Still confirming your payment',
      'If you completed payment it will appear in your schedule shortly. Check there before paying again.',
      [{ text: 'View schedule', onPress: () => navigation.navigate('Schedule') }]
    );
  }, [navigation]);

  // The customer leaves the app to pay, so resume is the only signal we get.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && pendingOrderId.current) void checkPendingPayment();
    });
    return () => sub.remove();
  }, [checkPendingPayment]);

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

  const handleBooking = async () => {
    if (!bookingDraft?.memberId || !bookingDraft.date || !bookingDraft.startTime) return;
    setIsSubmitting(true);
    try {
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
      // The pricing model comes from the catalog, not the draft — the draft
      // carries the chosen values but not which kind of pricing they belong to,
      // and inferring it from whichever field happens to be filled in is how you
      // charge someone for the wrong thing.
      const service = getServiceById(bookingDraft.serviceId);
      const selection = selectionFromDraft({
        pricingModel: service?.pricing?.type ?? null,
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

      // Remember before leaving: on resume we ask the server what happened
      // rather than assuming anything about the outcome.
      pendingOrderId.current = order.orderId;

      const opened = await Linking.canOpenURL(order.paymentUrl);
      if (!opened) throw new Error('No browser available to complete payment');
      await Linking.openURL(order.paymentUrl);
      // isSubmitting stays true until the resume handler resolves the payment.
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
          style={[styles.payButton, isSubmitting && styles.buttonDisabled]}
          onPress={handleBooking}
          activeOpacity={0.8}
          disabled={isSubmitting}
        >
          <Icon name="calendar" size={18} color={colors.white} />
          <Text style={styles.payButtonText}>
            {isSubmitting ? 'Opening payment…' : 'Pay and book'}
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
