/**
 * Payments and receipts.
 *
 * The app's only payment surface was the moment of paying: once the sheet
 * closed there was nowhere to check what had been charged, so a customer who
 * wanted to confirm a payment went through had to look at their bank statement.
 *
 * Reads Payment rows rather than deriving history from bookings — a refund, a
 * failed attempt and a plan upgrade are all real events no booking record has
 * any way to describe.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { paymentsApi, type PaymentRecord } from '../../services/api/endpoints/payments';
import { colors, radius, spacing, typography } from '../../theme';

const money = (minor: number, currency: string) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency || 'INR',
    maximumFractionDigits: 2,
  }).format((minor || 0) / 100);

/** What each status means to somebody looking for their money. */
const STATUS: Record<PaymentRecord['status'], { label: string; color: string; icon: string }> = {
  SUCCESS: { label: 'Paid', color: colors.success, icon: 'checkmark-circle' },
  PENDING: { label: 'Processing', color: colors.warning, icon: 'time-outline' },
  FAILED: { label: 'Failed — not charged', color: colors.error, icon: 'close-circle-outline' },
  REFUNDED: { label: 'Refunded', color: colors.textSecondary, icon: 'return-down-back-outline' },
};

export default function PaymentsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await paymentsApi.listPayments();
      if (!res.success) {
        setError(res.error || 'Could not load your payments.');
        return;
      }
      setError(null);
      setPayments(res.payments ?? []);
    } catch {
      setError('No connection. Pull down to try again.');
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payments</Text>
        <View style={styles.back} />
      </View>

      {loading ? (
        <View style={styles.state}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.body}>Loading your payments…</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
        >
          {payments.length === 0 ? (
            <View style={styles.state}>
              <Icon name="receipt-outline" size={52} color={colors.textTertiary} />
              <Text style={styles.title}>No payments yet</Text>
              <Text style={styles.body}>{error ?? 'Anything you pay for will show up here.'}</Text>
            </View>
          ) : (
            payments.map((payment) => {
              const status = STATUS[payment.status] ?? STATUS.PENDING;
              return (
                <View key={payment.id} style={styles.card}>
                  <View style={styles.row}>
                    <Text style={styles.description} numberOfLines={1}>
                      {payment.description}
                    </Text>
                    <Text style={styles.amount}>{money(payment.amount, payment.currency)}</Text>
                  </View>
                  <View style={styles.row}>
                    <View style={styles.statusWrap}>
                      <Icon name={status.icon} size={15} color={status.color} />
                      <Text style={[styles.status, { color: status.color }]}>{status.label}</Text>
                    </View>
                    <Text style={styles.date}>
                      {new Date(payment.createdAt).toLocaleDateString([], {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                  {/* The processor's own reference, so a customer disputing a
                      charge with their bank has the number to quote. */}
                  {payment.reference ? (
                    <Text style={styles.reference}>Ref {payment.reference}</Text>
                  ) : null}
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface2 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  headerTitle: { ...typography.h3, color: colors.textPrimary },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.lg, gap: spacing.md },
  state: {
    flex: 1,
    minHeight: 420,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  title: { ...typography.h2, textAlign: 'center' },
  body: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  description: { ...typography.labelLarge, color: colors.textPrimary, flex: 1 },
  amount: { ...typography.labelLarge, color: colors.textPrimary },
  statusWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  status: { ...typography.caption },
  date: { ...typography.caption, color: colors.textTertiary },
  reference: { ...typography.caption, color: colors.textTertiary, marginTop: spacing.xs },
});
