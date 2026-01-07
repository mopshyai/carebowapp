/**
 * Orders Screen
 * Lists all orders with status tracking and professional styling
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { AppNavigationProp } from '../navigation/types';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAllOrders, useOrdersStore } from '../store/ordersStore';
import { Order, formatMoney } from '../types/booking';
import { colors, spacing, radius, typography, shadows } from '../theme';

// Status config for consistent styling
const statusConfig: Record<Order['orderStatus'], { bg: string; text: string; label: string }> = {
  created: { bg: colors.warningSoft, text: colors.warning, label: 'Pending' },
  paid: { bg: colors.successSoft, text: colors.success, label: 'Paid' },
  fulfilled: { bg: colors.accentSoft, text: colors.accent, label: 'Completed' },
  cancelled: { bg: colors.errorSoft, text: colors.error, label: 'Cancelled' },
  refunded: { bg: colors.surface2, text: colors.textTertiary, label: 'Refunded' },
};

const paymentStatusConfig: Record<string, { color: string }> = {
  paid: { color: colors.success },
  pending: { color: colors.warning },
  failed: { color: colors.error },
  refunded: { color: colors.textTertiary },
};

// Format date for display
const formatDate = (dateISO: string) => {
  const date = new Date(dateISO);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
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

function OrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  const status = statusConfig[order.orderStatus];
  const paymentStatus = paymentStatusConfig[order.payment.status] || { color: colors.textTertiary };

  return (
    <TouchableOpacity style={styles.orderCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.serviceTitle} numberOfLines={1}>
            {order.serviceTitle}
          </Text>
          <Text style={styles.orderId}>Order #{order.id.slice(-8).toUpperCase()}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        {order.memberName && (
          <View style={styles.detailRow}>
            <Icon name="person-outline" size={16} color={colors.textTertiary} />
            <Text style={styles.detailText}>{order.memberName}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Icon name="calendar-outline" size={16} color={colors.textTertiary} />
          <Text style={styles.detailText}>
            {formatDate(order.schedule.dateISO)} at {formatTime(order.schedule.timeStart)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="card-outline" size={16} color={colors.textTertiary} />
          <Text style={[styles.detailText, { color: paymentStatus.color }]}>
            Payment {order.payment.status}
          </Text>
        </View>
      </View>

      <View style={styles.orderFooter}>
        <View>
          <Text style={styles.priceLabel}>Total Amount</Text>
          <Text style={styles.totalPrice}>{formatMoney(order.pricing.total)}</Text>
        </View>
        <View style={styles.viewDetailsBtn}>
          <Text style={styles.viewDetailsText}>View details</Text>
          <Icon name="chevron-forward" size={16} color={colors.accent} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation() as AppNavigationProp;
  const orders = useAllOrders();
  const clearOrders = useOrdersStore((state) => state.clearOrders);

  const handleOrderPress = (orderId: string) => {
    navigation.navigate('OrderDetails', { id: orderId });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        {orders.length > 0 ? (
          <TouchableOpacity style={styles.clearButton} onPress={clearOrders}>
            <Text style={styles.clearButtonText}>Clear all</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrap}>
            <Icon name="receipt-outline" size={48} color={colors.textTertiary} />
          </View>
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptySubtitle}>
            When you book a service, your orders will appear here for easy tracking
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('MainTabs')}
          >
            <Text style={styles.browseButtonText}>Browse services</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.orderCount}>
            {orders.length} order{orders.length !== 1 ? 's' : ''}
          </Text>

          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onPress={() => handleOrderPress(order.id)}
            />
          ))}
        </ScrollView>
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
    width: 60,
  },
  clearButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  clearButtonText: {
    ...typography.labelSmall,
    color: colors.error,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  orderCount: {
    ...typography.caption,
    marginBottom: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  emptyIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surface2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  browseButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    ...shadows.button,
  },
  browseButtonText: {
    ...typography.labelLarge,
    color: colors.white,
  },
  orderCard: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  orderHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    rowGap: spacing.xs,
    columnGap: spacing.sm,
  },
  orderInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  serviceTitle: {
    ...typography.h4,
    marginBottom: 2,
  },
  orderId: {
    ...typography.caption,
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
  orderDetails: {
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    ...typography.bodySmall,
  },
  orderFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    rowGap: spacing.xs,
    columnGap: spacing.sm,
  },
  priceLabel: {
    ...typography.caption,
    marginBottom: 2,
  },
  totalPrice: {
    ...typography.h3,
    color: colors.accent,
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewDetailsText: {
    ...typography.labelSmall,
    color: colors.accent,
  },
});
