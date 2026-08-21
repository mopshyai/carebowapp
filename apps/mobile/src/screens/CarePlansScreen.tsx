/**
 * Care plans.
 *
 * This screen used to be a wall: "Care plans are not published", with nothing
 * behind it. Plans did exist — the web has sold them since launch — but the
 * purchase route authenticated by cookie session and the app holds a JWT, so
 * there was no way to buy one from a phone at all.
 *
 * Plans come from the server's config, never from a bundled list, and the
 * customer is charged through Razorpay's hosted page exactly like a booking:
 * the app opens the URL, the webhook applies the upgrade, and this screen asks
 * the server what happened rather than assuming.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { paymentsApi, type Plan } from '../services/api/endpoints/payments';
import { useHostedCheckout } from '../hooks/useHostedCheckout';
import { useAuthStore } from '../store/useAuthStore';
import { formatMinor } from '../data/countries';
import { colors, radius, spacing, typography } from '../theme';

// Plans arrive priced in the currency this account is charged in — INR for
// India, USD elsewhere — so the card and the Razorpay page agree.
const money = (amountMinor: number, currency: string) => formatMinor(amountMinor, currency);

type UnconfirmedPlanPayment = {
  orderId: string;
  planId: string;
  planTitle: string;
};

export default function CarePlansScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const refreshUser = useAuthStore((s) => s.refreshUser);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [unconfirmedPayment, setUnconfirmedPayment] = useState<UnconfirmedPlanPayment | null>(
    null
  );

  const checkout = useHostedCheckout();

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await paymentsApi.getPlans();
      if (!res.success) {
        setError(res.error || 'Plans are unavailable right now.');
        setPlans([]);
        return;
      }
      setError(null);
      setPlans(res.plans ?? []);
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

  const refreshPlanTruth = async () => {
    await refreshUser();
    await load();
  };

  const recheckPlanPayment = async (pending: UnconfirmedPlanPayment) => {
    try {
      const status = await paymentsApi.getPaymentStatus(pending.orderId);
      if (!status.success) {
        throw new Error(status.error || 'Could not confirm payment status');
      }

      if (status.status === 'SUCCESS') {
        setUnconfirmedPayment(null);
        await refreshPlanTruth();
        Alert.alert('You are on the new plan', `${pending.planTitle} is now active on your account.`);
        return;
      }

      if (status.status === 'FAILED' || status.status === 'REFUNDED') {
        setUnconfirmedPayment(null);
        await refreshPlanTruth();
        Alert.alert(
          status.status === 'REFUNDED' ? 'Payment refunded' : 'Payment not completed',
          status.status === 'REFUNDED'
            ? 'This payment was refunded. You can start a new purchase if you still want the plan.'
            : 'Nothing was confirmed for this order. You can try again.'
        );
        return;
      }

      await refreshPlanTruth();
      Alert.alert(
        'Still confirming your payment',
        'CareBow is still waiting for Razorpay confirmation. Plan purchases are locked to this payment so you cannot accidentally pay twice.'
      );
    } catch {
      Alert.alert(
        'Could not confirm payment yet',
        'Do not pay again. Check your connection, then use “Check payment status” again.'
      );
    }
  };

  const buy = async (plan: Plan) => {
    setBuyingId(plan.id);
    try {
      if (unconfirmedPayment) {
        await recheckPlanPayment(unconfirmedPayment);
        return;
      }

      const order = await paymentsApi.createPlanOrder({
        planSlug: plan.id,
        hosted: true,
        callbackUrl: 'carebow://checkout/return',
      });

      if (!order.success || !order.paymentUrl || !order.orderId) {
        Alert.alert('Could not start payment', order.error || 'Please try again.');
        return;
      }

      const outcome = await checkout.start({
        orderId: order.orderId,
        paymentUrl: order.paymentUrl,
      });

      if (outcome.status === 'paid') {
        // The upgrade lands on the user record, so refresh it before saying so.
        await refreshPlanTruth();
        Alert.alert('You are on the new plan', `${plan.title} is now active on your account.`);
      } else if (outcome.status === 'failed') {
        Alert.alert('Payment not completed', 'Nothing was charged. You can try again.');
      } else {
        setUnconfirmedPayment({
          orderId: order.orderId,
          planId: plan.id,
          planTitle: plan.title,
        });
        await refreshPlanTruth();
        Alert.alert(
          'Still confirming your payment',
          'If you completed payment your plan will update shortly. CareBow will only recheck this same payment until the result is known.'
        );
      }
    } finally {
      setBuyingId(null);
    }
  };

  const busy = (planId: string) =>
    buyingId === planId || checkout.busy || (!!unconfirmedPayment && unconfirmedPayment.planId !== planId);

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Care plans</Text>
        <View style={styles.back} />
      </View>

      {loading ? (
        <View style={styles.state}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.body}>Loading plans…</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
        >
          {/* An empty list is a real answer, not an error: CareBow may simply
              not publish plans for this account type. */}
          {plans.length === 0 ? (
            <View style={styles.state}>
              <Icon name="shield-checkmark-outline" size={56} color={colors.accent} />
              <Text style={styles.title}>No plans published</Text>
              <Text style={styles.body}>
                {error ?? 'CareBow has not published plans for your account type yet.'}
              </Text>
            </View>
          ) : (
            plans.map((plan) => (
              <View key={plan.id} style={[styles.card, plan.isCurrent && styles.cardCurrent]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.planTitle}>{plan.title}</Text>
                  {plan.isCurrent && (
                    <View style={styles.currentChip}>
                      <Text style={styles.currentChipText}>Current</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.price}>
                  {plan.amount === 0 ? 'Free' : money(plan.amount, plan.currency)}
                  {plan.period ? <Text style={styles.period}> / {plan.period}</Text> : null}
                </Text>

                {plan.description ? <Text style={styles.body}>{plan.description}</Text> : null}

                {plan.features.map((feature) => (
                  <View key={feature} style={styles.featureRow}>
                    <Icon name="checkmark-circle-outline" size={18} color={colors.accent} />
                    <Text style={styles.feature}>{feature}</Text>
                  </View>
                ))}

                {plan.isCurrent ? (
                  <View style={[styles.button, styles.buttonMuted]}>
                    <Text style={styles.buttonMutedText}>Your current plan</Text>
                  </View>
                ) : plan.amount === 0 ? null : (
                  <TouchableOpacity
                    style={[styles.button, busy(plan.id) && styles.disabled]}
                    onPress={() => buy(plan)}
                    disabled={busy(plan.id)}
                  >
                    <Text style={styles.buttonText}>
                      {buyingId === plan.id || checkout.busy
                        ? unconfirmedPayment?.planId === plan.id
                          ? 'Checking payment…'
                          : 'Opening payment…'
                        : unconfirmedPayment?.planId === plan.id
                          ? 'Check payment status'
                          : `Subscribe · ${money(plan.amount, plan.currency)}`}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
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
  content: { padding: spacing.lg, gap: spacing.lg },
  state: {
    flex: 1,
    minHeight: 420,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  title: { ...typography.h2, textAlign: 'center' },
  body: { ...typography.body, color: colors.textSecondary },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardCurrent: { borderColor: colors.accent },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  planTitle: { ...typography.h3, color: colors.textPrimary },
  currentChip: {
    backgroundColor: colors.accentMuted,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  currentChipText: { ...typography.caption, color: colors.accent },
  price: { ...typography.h2, color: colors.textPrimary },
  period: { ...typography.body, color: colors.textSecondary },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  feature: { ...typography.body, color: colors.textSecondary, flex: 1 },
  button: {
    marginTop: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonText: { ...typography.labelLarge, color: colors.textInverse },
  buttonMuted: { backgroundColor: colors.surface2 },
  buttonMutedText: { ...typography.labelLarge, color: colors.textSecondary },
  disabled: { opacity: 0.6 },
});