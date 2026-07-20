/**
 * Checkout Screen
 * Professional checkout with order summary and payment
 */

import React from 'react';
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
import { getServiceById, formatTime, formatDuration } from '../data/services';
import { useCartStore } from '../store/useCartStore';
import { colors, spacing, radius, typography, shadows } from '../theme';
import { formatPrice } from '../data/catalog';

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation() as AppNavigationProp;
  const route = useRoute();
  const { serviceId } = (route.params as { serviceId: string }) || {};

  // Store hooks
  const { bookingDraft } = useCartStore();

  // Get service data
  const service = getServiceById(serviceId || '');

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

  const handlePayment = () => {
    Alert.alert(
      'Secure checkout unavailable',
      'Mobile payment is not connected to the production payment service yet. No order was created and you have not been charged.'
    );
  };

  // Error state
  if (!bookingDraft || !service) {
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
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
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
            <Text style={styles.cardTitle}>Payment Details</Text>
          </View>

          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>{bookingDraft.pricingLabel}</Text>
            <Text style={styles.pricingValue}>{formatPrice(bookingDraft.subtotal)}</Text>
          </View>

          {bookingDraft.discount > 0 && (
            <View style={styles.pricingRow}>
              <Text style={[styles.pricingLabel, styles.discountLabel]}>Discount</Text>
              <Text style={[styles.pricingValue, styles.discountValue]}>
                -{formatPrice(bookingDraft.discount)}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(bookingDraft.total)}</Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconWrap, { backgroundColor: colors.accentSoft }]}>
              <Icon name="card-outline" size={20} color={colors.accent} />
            </View>
            <Text style={styles.cardTitle}>Secure Checkout</Text>
          </View>

          <View style={styles.paymentMethodRow}>
            <View style={styles.paymentMethodLeft}>
              <Icon name="card" size={24} color={colors.accent} />
              <View>
                <Text style={styles.paymentMethodText}>Mobile payment unavailable</Text>
                <Text style={styles.paymentMethodSubtext}>No payment method will be charged</Text>
              </View>
            </View>
          </View>

          <View style={styles.securityNote}>
            <Icon name="shield-checkmark" size={14} color={colors.success} />
            <Text style={styles.securityNoteText}>
              Checkout will be enabled after the production payment connection is complete
            </Text>
          </View>
        </View>

        {/* Payment availability notice */}
        <View style={styles.demoNotice}>
          <Icon name="information-circle-outline" size={16} color={colors.textTertiary} />
          <Text style={styles.demoNoticeText}>
            This screen will not create an order or simulate a successful payment.
          </Text>
        </View>
      </ScrollView>

      {/* Pay Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.footerPriceRow}>
          <Text style={styles.footerPriceLabel}>Total</Text>
          <Text style={styles.footerPriceValue}>{formatPrice(bookingDraft.total)}</Text>
        </View>
        <TouchableOpacity style={styles.payButton} onPress={handlePayment} activeOpacity={0.8}>
          <Icon name="information-circle" size={18} color={colors.white} />
          <Text style={styles.payButtonText}>Payment unavailable</Text>
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
  demoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  demoNoticeText: {
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
  payButtonDisabled: {
    backgroundColor: colors.textTertiary,
    ...shadows.none,
  },
  payButtonText: {
    ...typography.labelLarge,
    color: colors.white,
  },
});
