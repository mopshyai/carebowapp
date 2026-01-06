/**
 * Order Details Screen
 * Shows full details of an order with professional styling
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
import Icon from 'react-native-vector-icons/Ionicons';
import { useOrdersStore } from '../store/ordersStore';
import { Order, formatMoney } from '../types/booking';
import { colors, spacing, radius, typography, shadows } from '../theme';

// Status config
const statusConfig: Record<Order['orderStatus'], { bg: string; text: string; label: string }> = {
  created: { bg: colors.warningSoft, text: colors.warning, label: 'Pending' },
  paid: { bg: colors.successSoft, text: colors.success, label: 'Paid' },
  fulfilled: { bg: colors.accentSoft, text: colors.accent, label: 'Completed' },
  cancelled: { bg: colors.errorSoft, text: colors.error, label: 'Cancelled' },
  refunded: { bg: colors.surface2, text: colors.textTertiary, label: 'Refunded' },
};

const paymentStatusConfig: Record<string, { bg: string; text: string }> = {
  paid: { bg: colors.successSoft, text: colors.success },
  pending: { bg: colors.warningSoft, text: colors.warning },
  failed: { bg: colors.errorSoft, text: colors.error },
  refunded: { bg: colors.surface2, text: colors.textTertiary },
};

// Format date for display
const formatDate = (dateISO: string) => {
  const date = new Date(dateISO);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};

// Format time for display
const formatTime = (time: string) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

// Format ISO datetime
const formatDateTime = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export default function OrderDetailsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = (route.params as { id: string }) || {};

  const order = useOrdersStore((state) => state.getOrderById(id || ''));
  const cancelOrder = useOrdersStore((state) => state.cancelOrder);

  if (!order) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIconWrap}>
            <Icon name="alert-circle-outline" size={48} color={colors.textTertiary} />
          </View>
          <Text style={styles.errorTitle}>Order not found</Text>
          <Text style={styles.errorSubtitle}>
            This order may have been removed or doesn't exist.
          </Text>
          <TouchableOpacity style={styles.errorButton} onPress={() => navigation.goBack()}>
            <Text style={styles.errorButtonText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const status = statusConfig[order.orderStatus];
  const paymentStatus = paymentStatusConfig[order.payment.status] || { bg: colors.surface2, text: colors.textTertiary };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? This action cannot be undone.',
      [
        { text: 'Keep Order', style: 'cancel' },
        {
          text: 'Cancel Order',
          style: 'destructive',
          onPress: () => {
            cancelOrder(order.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Order ID & Status */}
        <View style={styles.card}>
          <View style={styles.orderIdRow}>
            <View>
              <Text style={styles.orderIdLabel}>Order ID</Text>
              <Text style={styles.orderId}>#{order.id.slice(-8).toUpperCase()}</Text>
            </View>
            <View style={styles.badgeRow}>
              <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Service Details */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconWrap, { backgroundColor: colors.medicalSoft }]}>
              <Icon name="medical" size={18} color={colors.medical} />
            </View>
            <Text style={styles.cardTitle}>Service Details</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Service</Text>
            <Text style={styles.infoValue}>{order.serviceTitle}</Text>
          </View>
          {order.memberName && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Patient</Text>
              <Text style={styles.infoValue}>{order.memberName}</Text>
            </View>
          )}
        </View>

        {/* Schedule */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconWrap, { backgroundColor: colors.infoSoft }]}>
              <Icon name="calendar" size={18} color={colors.info} />
            </View>
            <Text style={styles.cardTitle}>Schedule</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>{formatDate(order.schedule.dateISO)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Time</Text>
            <Text style={styles.infoValue}>{formatTime(order.schedule.timeStart)}</Text>
          </View>
          {order.schedule.durationMinutes && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Duration</Text>
              <Text style={styles.infoValue}>{order.schedule.durationMinutes} minutes</Text>
            </View>
          )}
        </View>

        {/* Notes */}
        {order.notes && order.notes.trim() && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconWrap, { backgroundColor: colors.accentSoft }]}>
                <Icon name="document-text" size={18} color={colors.accent} />
              </View>
              <Text style={styles.cardTitle}>Special Requests</Text>
            </View>
            <Text style={styles.notesText}>{order.notes}</Text>
          </View>
        )}

        {/* Pricing Breakdown */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconWrap, { backgroundColor: colors.successSoft }]}>
              <Icon name="wallet" size={18} color={colors.success} />
            </View>
            <Text style={styles.cardTitle}>Payment Details</Text>
          </View>

          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>Subtotal</Text>
            <Text style={styles.pricingValue}>{formatMoney(order.pricing.subtotal)}</Text>
          </View>

          {order.pricing.discount.amount > 0 && (
            <View style={styles.pricingRow}>
              <Text style={[styles.pricingLabel, { color: colors.success }]}>Discount</Text>
              <Text style={[styles.pricingValue, { color: colors.success }]}>
                -{formatMoney(order.pricing.discount)}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>{formatMoney(order.pricing.total)}</Text>
          </View>

          <View style={styles.paymentStatusRow}>
            <View style={[styles.paymentBadge, { backgroundColor: paymentStatus.bg }]}>
              <Icon name="card" size={12} color={paymentStatus.text} />
              <Text style={[styles.paymentBadgeText, { color: paymentStatus.text }]}>
                Payment {order.payment.status}
              </Text>
            </View>
            {order.payment.paidAtISO && (
              <Text style={styles.paidAtText}>
                {formatDateTime(order.payment.paidAtISO)}
              </Text>
            )}
          </View>
        </View>

        {/* Activity */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconWrap, { backgroundColor: colors.surface2 }]}>
              <Icon name="time" size={18} color={colors.textTertiary} />
            </View>
            <Text style={styles.cardTitle}>Activity</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Created</Text>
            <Text style={styles.infoValue}>{formatDateTime(order.createdAtISO)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Updated</Text>
            <Text style={styles.infoValue}>{formatDateTime(order.updatedAtISO)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      {order.orderStatus !== 'cancelled' && order.orderStatus !== 'refunded' && order.orderStatus !== 'fulfilled' && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Icon name="close-circle-outline" size={20} color={colors.error} />
            <Text style={styles.cancelButtonText}>Cancel Order</Text>
          </TouchableOpacity>
        </View>
      )}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    ...typography.h4,
  },
  orderIdRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    rowGap: spacing.xs,
    columnGap: spacing.sm,
  },
  orderIdLabel: {
    ...typography.caption,
    marginBottom: 2,
  },
  orderId: {
    ...typography.h3,
    color: colors.accent,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.xs,
  },
  statusText: {
    ...typography.tiny,
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    rowGap: spacing.xxs,
    columnGap: spacing.sm,
  },
  infoLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  infoValue: {
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
  paymentStatusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    rowGap: spacing.xs,
    columnGap: spacing.sm,
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.xs,
  },
  paymentBadgeText: {
    ...typography.tiny,
    textTransform: 'capitalize',
  },
  paidAtText: {
    ...typography.caption,
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
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.errorSoft,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  cancelButtonText: {
    ...typography.labelLarge,
    color: colors.error,
  },
});
