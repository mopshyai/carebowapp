import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import type { AppNavigationProp } from '../../navigation/types';
import {
  askCarebowEntitlementApi,
  type AskCarebowEntitlement,
} from '../../services/api/endpoints/askCarebowEntitlement';
import { colors, radius, spacing, typography } from '../../theme';

function formatDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function accessCopy(entitlement: AskCarebowEntitlement): { title: string; detail: string } {
  if (entitlement.source === 'trial_available') {
    return {
      title: `${entitlement.trialDays}-day Ask CareBow trial available`,
      detail: 'Your trial starts with your first Ask CareBow conversation. No device-local timer is used.',
    };
  }

  if (entitlement.trialActive) {
    const end = formatDate(entitlement.trialEndsAt);
    return {
      title: 'Ask CareBow trial active',
      detail: end ? `Your ${entitlement.trialDays}-day trial runs through ${end}.` : 'Your trial is active.',
    };
  }

  if (entitlement.limit === null) {
    const expiry = formatDate(entitlement.planExpiresAt);
    return {
      title: entitlement.planTitle,
      detail: expiry
        ? `Unlimited Ask CareBow messages through ${expiry}. This access does not auto-renew.`
        : 'Unlimited Ask CareBow messages are available on your current plan.',
    };
  }

  const remaining = entitlement.remaining ?? Math.max(0, entitlement.limit - entitlement.used);
  return {
    title: entitlement.canAsk ? entitlement.planTitle : 'Ask CareBow limit reached',
    detail: entitlement.canAsk
      ? `${remaining} of ${entitlement.limit} Ask CareBow messages remain on your current plan.`
      : `You've used ${entitlement.used} of ${entitlement.limit} Ask CareBow messages. Emergency guidance remains available.`,
  };
}

export function AskAccessStatusCard() {
  const navigation = useNavigation() as AppNavigationProp;
  const [entitlement, setEntitlement] = useState<AskCarebowEntitlement | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      askCarebowEntitlementApi
        .get()
        .then((value) => {
          if (!active) return;
          setEntitlement(value);
          setLoadFailed(false);
        })
        .catch(() => {
          if (!active) return;
          setLoadFailed(true);
        });
      return () => {
        active = false;
      };
    }, [])
  );

  if (!entitlement && !loadFailed) return null;

  if (loadFailed && !entitlement) {
    return (
      <View style={styles.card}>
        <Icon name="cloud-offline-outline" size={18} color={colors.textSecondary} />
        <View style={styles.copy}>
          <Text style={styles.title}>Access status unavailable</Text>
          <Text style={styles.detail}>CareBow will verify your Ask access before a normal health-guidance turn.</Text>
        </View>
      </View>
    );
  }

  if (!entitlement) return null;
  const copy = accessCopy(entitlement);

  return (
    <View style={styles.card}>
      <Icon
        name={entitlement.canAsk ? 'shield-checkmark-outline' : 'lock-closed-outline'}
        size={20}
        color={entitlement.canAsk ? colors.accent : colors.textSecondary}
      />
      <View style={styles.copy}>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.detail}>{copy.detail}</Text>
      </View>
      {(!entitlement.canAsk || entitlement.planSlug === 'customer_free') && (
        <TouchableOpacity
          style={styles.plansButton}
          onPress={() => navigation.navigate('CarePlans')}
          accessibilityRole="button"
          accessibilityLabel="View Care Plans"
        >
          <Text style={styles.plansText}>Plans</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.accentMuted,
    borderWidth: 1,
    borderColor: colors.accentSoft,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  copy: {
    flex: 1,
  },
  title: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  detail: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  plansButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  plansText: {
    ...typography.labelSmall,
    color: colors.accent,
  },
});
