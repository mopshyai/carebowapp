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
import {
  colors,
  space,
  radius,
  typography,
  shadows,
  layout,
} from '../theme/tokens';

// Status config for consistent styling
const statusConfig: Record<Order['orderStatus'], { bg: string; text: string; label: string }> = {
  created: { bg: colors.warning.muted, text: colors.warning.default, label: 'Pending' },
  paid: { bg: colors.success.muted, text: colors.success.default, label: 'Paid' },
  fulfilled: { bg: colors.primary.muted, text: colors.primary.default, label: 'Completed' },
  cancelled: { bg: colors.error.muted, text: colors.error.default, label: 'Cancelled' },
  refunded: { bg: colors.surfaceSecondary, text: colors.text.tertiary, label: 'Refunded' },
};

const paymentStatusConfig: Record<string, { color: string }> = {
  paid: { color: colors.success.default },
  pending: { color: colors.warning.default },
  failed: { color: colors.error.default },
  refunded: { color: colors.text.tertiary },
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
  const paymentStatus = paymentStatusConfig[order.payment.status] || { color: colors.text.tertiary };

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
            <Icon name="person-outline" size={16} color={colors.text.tertiary} />
            <Text style={styles.detailText}>{order.memberName}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Icon name="calendar-outline" size={16} color={colors.text.tertiary} />
          <Text style={styles.detailText}>
            {formatDate(order.schedule.dateISO)} at {formatTime(order.schedule.timeStart)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="card-outline" size={16} color={colors.text.tertiary} />
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
          <Icon name="chevron-forward" size={16} color={colors.primary.default} />
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
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
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
            <Icon name="receipt-outline" size={48} color={colors.text.tertiary} />
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
    backgroundColor: colors.background,
  },
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
  backButton: {
    width: layout.touchTargetMin,
    height: layout.touchTargetMin,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
  },
  headerTitle: {
    ...typography.sectionHeader,
    color: colors.text.primary,
  },
  headerSpacer: {
    width: 60,
  },
  clearButton: {
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
  },
  clearButtonText: {
    ...typography.labelSmall,
    color: colors.error.default,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: space.lg,
  },
  orderCount: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginBottom: space.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: space.xxl,
  },
  emptyIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: space.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  emptyTitle: {
    ...typography.sectionHeader,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: space.xs,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: space.xl,
    lineHeight: 22,
  },
  browseButton: {
    backgroundColor: colors.primary.default,
    paddingVertical: space.sm,
    paddingHorizontal: space.xl,
    borderRadius: radius.lg,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.primaryButton,
  },
  browseButtonText: {
    ...typography.buttonLarge,
    color: colors.text.inverse,
  },
  orderCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.md,
    marginBottom: space.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.card,
  },
  orderHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: space.sm,
    rowGap: space.xs,
    columnGap: space.sm,
  },
  orderInfo: {
    flex: 1,
    marginRight: space.sm,
  },
  serviceTitle: {
    ...typography.sectionHeaderSmall,
    color: colors.text.primary,
    marginBottom: 2,
  },
  orderId: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  statusBadge: {
    paddingHorizontal: space.sm,
    paddingVertical: space.xxs,
    borderRadius: radius.sm,
  },
  statusText: {
    ...typography.badge,
    textTransform: 'uppercase',
  },
  orderDetails: {
    marginBottom: space.sm,
    gap: space.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  detailText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  orderFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    rowGap: space.xs,
    columnGap: space.sm,
  },
  priceLabel: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginBottom: 2,
  },
  totalPrice: {
    ...typography.priceLarge,
    color: colors.primary.default,
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewDetailsText: {
    ...typography.labelSmall,
    color: colors.primary.default,
  },
});
