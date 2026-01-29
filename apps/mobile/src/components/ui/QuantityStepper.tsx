/**
 * QuantityStepper Component
 * Stepper for hours/days selection with +/- buttons
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography } from '../../theme';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max?: number;
  step?: number;
  unit: string; // "hour" | "day" | "session"
  unitPlural?: string; // "hours" | "days" | "sessions"
  rate?: number; // price per unit
  showTotal?: boolean;
}

export function QuantityStepper({
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  unitPlural,
  rate,
  showTotal = true,
}: QuantityStepperProps) {
  const canDecrease = value > min;
  const canIncrease = max === undefined || value < max;
  const plural = unitPlural || `${unit}s`;

  const handleDecrease = () => {
    if (canDecrease) {
      onChange(Math.max(min, value - step));
    }
  };

  const handleIncrease = () => {
    if (canIncrease) {
      onChange(max !== undefined ? Math.min(max, value + step) : value + step);
    }
  };

  const total = rate ? value * rate : null;

  return (
    <View style={styles.container}>
      <View style={styles.stepperRow}>
        <TouchableOpacity
          style={[styles.stepperButton, !canDecrease && styles.stepperButtonDisabled]}
          onPress={handleDecrease}
          disabled={!canDecrease}
          activeOpacity={0.7}
        >
          <Icon
            name="remove"
            size={24}
            color={canDecrease ? colors.white : colors.textTertiary}
          />
        </TouchableOpacity>

        <View style={styles.valueContainer}>
          <Text style={styles.valueText}>{value}</Text>
          <Text style={styles.unitText}>
            {value === 1 ? unit : plural}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.stepperButton, !canIncrease && styles.stepperButtonDisabled]}
          onPress={handleIncrease}
          disabled={!canIncrease}
          activeOpacity={0.7}
        >
          <Icon
            name="add"
            size={24}
            color={canIncrease ? colors.white : colors.textTertiary}
          />
        </TouchableOpacity>
      </View>

      {showTotal && rate && (
        <View style={styles.totalRow}>
          <Text style={styles.rateText}>
            ${rate}/{unit} × {value}
          </Text>
          <Text style={styles.totalText}>${total}</Text>
        </View>
      )}

      {(min > 1 || max !== undefined) && (
        <Text style={styles.rangeText}>
          Min: {min} {min === 1 ? unit : plural}
          {max !== undefined && ` • Max: ${max} ${max === 1 ? unit : plural}`}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonDisabled: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  valueContainer: {
    alignItems: 'center',
    minWidth: 80,
  },
  valueText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  unitText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xxs,
  },
  rateText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  totalText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  rangeText: {
    ...typography.tiny,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
