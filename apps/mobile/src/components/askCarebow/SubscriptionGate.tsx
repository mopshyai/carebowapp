/**
 * Ask CareBow access gate.
 *
 * Pricing and allowance come from the backend. This component deliberately does
 * not quote a hardcoded price or claim recurring billing; CarePlans owns the
 * live plan catalog and Razorpay checkout.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../../theme';
import type { AskCarebowEntitlement } from '../../services/api/endpoints/askCarebowEntitlement';

interface SubscriptionGateProps {
  entitlement: AskCarebowEntitlement;
  onViewPlans: () => void;
}

export function SubscriptionGate({ entitlement, onViewPlans }: SubscriptionGateProps) {
  const usageText =
    entitlement.limit === null
      ? 'Your current Ask CareBow access is not available.'
      : `You've used ${entitlement.used} of ${entitlement.limit} Ask CareBow messages on ${entitlement.planTitle}.`;

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon name="lock-closed" size={30} color={colors.accent} />
      </View>

      <Text style={styles.title}>Ask CareBow limit reached</Text>
      <Text style={styles.description}>{usageText}</Text>

      <View style={styles.safetyNote}>
        <Icon name="medical" size={16} color={colors.error} />
        <Text style={styles.safetyText}>
          Emergency and urgent safety guidance remains available even when your normal Ask CareBow allowance is used.
        </Text>
      </View>

      <TouchableOpacity style={styles.plansButton} onPress={onViewPlans} activeOpacity={0.8}>
        <Text style={styles.plansButtonText}>View Care Plans</Text>
        <Icon name="arrow-forward" size={18} color={colors.textInverse} />
      </TouchableOpacity>

      <Text style={styles.note}>
        Plan prices, limits and access dates are shown from your CareBow account before payment.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    margin: spacing.md,
    alignItems: 'center',
    ...shadows.cardElevated,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: radius.full,
    backgroundColor: colors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  safetyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: colors.errorSoft,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.lg,
    alignSelf: 'stretch',
  },
  safetyText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  plansButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignSelf: 'stretch',
    ...shadows.button,
  },
  plansButtonText: {
    ...typography.labelLarge,
    color: colors.textInverse,
  },
  note: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
