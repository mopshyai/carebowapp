/**
 * Order Success Screen
 * Displayed after successful payment - professional confirmation
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useOrdersStore } from '../store/ordersStore';
import { formatMoney } from '../types/booking';
import { colors, spacing, radius, typography, shadows } from '../theme';

type RouteParams = {
  OrderSuccess: { orderId: string };
};

export default function OrderSuccessScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'OrderSuccess'>>();
  const orderId = route.params?.orderId;

  // Get order details
  const order = useOrdersStore((state) => state.getOrderById(orderId || ''));

  // Format date for display
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
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

  const handleViewOrders = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Tabs' }],
    });
  };

  const handleViewOrderDetails = () => {
    if (orderId) {
      navigation.navigate('OrderDetails', { id: orderId });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconBackground}>
            <Icon name="checkmark-circle" size={80} color={colors.success} />
          </View>
        </View>

        {/* Success Message */}
        <Text style={styles.title}>Booking Confirmed!</Text>
        <Text style={styles.subtitle}>
          Your booking has been successfully placed. We've sent a confirmation to your email.
        </Text>

        {/* Order Details Card */}
        {order && (
          <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <View>
                <Text style={styles.orderIdLabel}>Booking ID</Text>
                <Text style={styles.orderId}>#{order.id.slice(-8).toUpperCase()}</Text>
              </View>
              <View style={styles.confirmedBadge}>
                <Icon name="checkmark" size={12} color={colors.white} />
                <Text style={styles.confirmedText}>Confirmed</Text>
              </View>
            </View>

            <View style={styles.orderDivider} />

            <View style={styles.orderDetails}>
              <View style={styles.orderRow}>
                <View style={[styles.iconWrap, { backgroundColor: colors.medicalSoft }]}>
                  <Icon name="medical" size={16} color={colors.medical} />
                </View>
                <Text style={styles.orderText}>{order.serviceTitle}</Text>
              </View>

              {order.memberName && (
                <View style={styles.orderRow}>
                  <View style={[styles.iconWrap, { backgroundColor: colors.accentSoft }]}>
                    <Icon name="person" size={16} color={colors.accent} />
                  </View>
                  <Text style={styles.orderText}>{order.memberName}</Text>
                </View>
              )}

              <View style={styles.orderRow}>
                <View style={[styles.iconWrap, { backgroundColor: colors.infoSoft }]}>
                  <Icon name="calendar" size={16} color={colors.info} />
                </View>
                <Text style={styles.orderText}>
                  {formatDate(order.schedule.dateISO)}
                  {order.schedule.timeStart && ` at ${formatTime(order.schedule.timeStart)}`}
                </Text>
              </View>
            </View>

            <View style={styles.orderDivider} />

            <View style={styles.orderTotal}>
              <Text style={styles.totalLabel}>Total Paid</Text>
              <Text style={styles.totalValue}>{formatMoney(order.pricing.total)}</Text>
            </View>
          </View>
        )}

        {/* Info Text */}
        <View style={styles.infoContainer}>
          <Icon name="mail-outline" size={18} color={colors.accent} />
          <Text style={styles.infoText}>
            You'll receive a confirmation email with all the details and any preparation instructions.
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleViewOrders}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Back to Home</Text>
        </TouchableOpacity>

        {orderId && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleViewOrderDetails}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>View Order Details</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.successSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.displayMedium,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  orderCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderIdLabel: {
    ...typography.caption,
    marginBottom: 2,
  },
  orderId: {
    ...typography.labelLarge,
    color: colors.accent,
  },
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.xs,
  },
  confirmedText: {
    ...typography.tiny,
    color: colors.white,
  },
  orderDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md,
  },
  orderDetails: {
    gap: spacing.sm,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderText: {
    ...typography.body,
    flex: 1,
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  totalValue: {
    ...typography.h2,
    color: colors.success,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.accentMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    width: '100%',
    marginTop: spacing.lg,
  },
  infoText: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...shadows.button,
  },
  primaryButtonText: {
    ...typography.labelLarge,
    color: colors.white,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...typography.labelLarge,
    color: colors.accent,
  },
});
