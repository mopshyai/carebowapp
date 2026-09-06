import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  providerFulfillmentApi,
  type AssignedLabTest,
  type FulfillmentStatus,
  type LabResultStatus,
  type LabTestValue,
  type TripStatus,
} from '@/services/api/endpoints/providerFulfillment';
import type { V1Booking } from '@/services/api/endpoints/member';
import {
  canCancelProviderFulfillment,
  primaryProviderFulfillmentAction,
} from '@/lib/providerFulfillmentActions';
import { colors, radius, spacing, typography } from '@/theme';

type EditableLabValue = {
  name: string;
  value: string;
  unit: string;
  refRange: string;
  flag: string;
};

const prettyStatus = (value?: string | null) =>
  value ? value.toLowerCase().replace(/_/g, ' ') : 'unavailable';

const kindLabel = (kind?: string | null) => {
  if (kind === 'lab') return 'Lab fulfillment';
  if (kind === 'pharmacy') return 'Pharmacy fulfillment';
  if (kind === 'equipment') return 'Equipment fulfillment';
  if (kind === 'ambulance') return 'Ambulance trip';
  return 'Operations workflow';
};

const toEditableTests = (test: AssignedLabTest | null): EditableLabValue[] =>
  (test?.tests || []).map((row) => ({
    name: row.name,
    value: row.value == null ? '' : String(row.value),
    unit: row.unit || '',
    refRange: row.refRange || '',
    flag: row.flag || '',
  }));

export default function ProviderFulfillmentCard({
  booking,
  onUpdated,
}: {
  booking: V1Booking;
  onUpdated: () => void | Promise<void>;
}) {
  const fulfillment = booking.fulfillment;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [labLoading, setLabLoading] = useState(false);
  const [labTest, setLabTest] = useState<AssignedLabTest | null>(null);
  const [labValues, setLabValues] = useState<EditableLabValue[]>([]);

  const kind = fulfillment?.kind;
  const status = fulfillment?.status;
  const primaryAction = useMemo(
    () => (kind ? primaryProviderFulfillmentAction(kind, status) : null),
    [kind, status]
  );
  const cancellable = Boolean(kind && canCancelProviderFulfillment(kind, status));

  useEffect(() => {
    let active = true;
    if (kind !== 'lab') {
      setLabTest(null);
      setLabValues([]);
      return () => {
        active = false;
      };
    }

    setLabLoading(true);
    void providerFulfillmentApi
      .getLabTests()
      .then(({ tests }) => {
        if (!active) return;
        const match = tests.find((row) => row.bookingId === booking.id) ?? null;
        setLabTest(match);
        setLabValues(toEditableTests(match));
      })
      .catch(() => {
        if (active) setError('Could not load the lab result fields.');
      })
      .finally(() => {
        if (active) setLabLoading(false);
      });

    return () => {
      active = false;
    };
  }, [booking.id, kind, status]);

  if (!fulfillment?.workflowRequired || kind === 'standard') return null;

  const runNativeStatus = async (nextStatus: string) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      let result: { error?: string };
      if (kind === 'lab') {
        result = await providerFulfillmentApi.updateLabTest(
          booking.id,
          nextStatus as LabResultStatus
        );
      } else if (kind === 'pharmacy') {
        if (!fulfillment.targetId) throw new Error('Missing pharmacy fulfillment ID');
        result = await providerFulfillmentApi.updateMedicineOrder(
          fulfillment.targetId,
          nextStatus as FulfillmentStatus
        );
      } else if (kind === 'equipment') {
        if (!fulfillment.targetId) throw new Error('Missing equipment fulfillment ID');
        result = await providerFulfillmentApi.updateRentalOrder(
          fulfillment.targetId,
          nextStatus as FulfillmentStatus
        );
      } else if (kind === 'ambulance') {
        if (!fulfillment.targetId) throw new Error('Missing ambulance fulfillment ID');
        result = await providerFulfillmentApi.updateActiveTrip(
          fulfillment.targetId,
          nextStatus as TripStatus
        );
      } else {
        setError('This fulfillment type needs operations review before it can be updated.');
        return;
      }

      if (result.error) {
        setError(result.error);
        return;
      }
      await onUpdated();
    } catch {
      setError('CareBow could not update this fulfillment. No local status was changed.');
    } finally {
      setBusy(false);
    }
  };

  const confirmCancel = () => {
    if (!cancellable || busy) return;
    Alert.alert(
      'Cancel this fulfillment?',
      'This uses the native fulfillment workflow and will reconcile the linked CareBow booking and refund rules on the server.',
      [
        { text: 'Keep assignment', style: 'cancel' },
        {
          text: 'Cancel fulfillment',
          style: 'destructive',
          onPress: () => void runNativeStatus('CANCELLED'),
        },
      ]
    );
  };

  const updateLabField = (
    index: number,
    key: Exclude<keyof EditableLabValue, 'name'>,
    value: string
  ) => {
    setLabValues((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row))
    );
  };

  const reportLabResults = async () => {
    if (busy || kind !== 'lab') return;
    const hasValue = labValues.some((row) => row.value.trim().length > 0);
    if (!hasValue) {
      setError('Enter at least one result value before marking this lab test reported.');
      return;
    }

    const tests: LabTestValue[] = labValues.map((row) => ({
      name: row.name,
      ...(row.value.trim() ? { value: row.value.trim() } : {}),
      ...(row.unit.trim() ? { unit: row.unit.trim() } : {}),
      ...(row.refRange.trim() ? { refRange: row.refRange.trim() } : {}),
      ...(row.flag.trim() ? { flag: row.flag.trim() } : {}),
    }));

    setBusy(true);
    setError(null);
    try {
      const result = await providerFulfillmentApi.updateLabTest(booking.id, 'REPORTED', { tests });
      if (result.error) {
        setError(result.error);
        return;
      }
      await onUpdated();
    } catch {
      setError('CareBow could not record these lab results. Nothing was marked reported locally.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>{kindLabel(kind)}</Text>
          <Text style={styles.hint}>
            This workflow owns the Booking status. Generic accept/start/complete controls are locked.
          </Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{prettyStatus(status)}</Text>
        </View>
      </View>

      {kind === 'unknown' ? (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            CareBow does not recognize this fulfillment owner yet. The assignment is locked instead of guessing a status transition. Operations must review it.
          </Text>
        </View>
      ) : null}

      {kind === 'lab' && status === 'PROCESSING' ? (
        <View style={styles.labSection}>
          <Text style={styles.subTitle}>Report results</Text>
          <Text style={styles.hint}>
            Lab completion requires a report file or structured result values. This form records structured values; it never marks a test reported with an empty result.
          </Text>
          {labLoading ? <ActivityIndicator size="small" color={colors.accent} /> : null}
          {!labLoading && labValues.length === 0 ? (
            <Text style={styles.hint}>No lab test fields are available yet. Refresh or contact operations.</Text>
          ) : null}
          {labValues.map((row, index) => (
            <View key={`${row.name}-${index}`} style={styles.resultBlock}>
              <Text style={styles.resultName}>{row.name}</Text>
              <TextInput
                style={styles.input}
                value={row.value}
                onChangeText={(value) => updateLabField(index, 'value', value)}
                placeholder="Result value"
                placeholderTextColor={colors.textTertiary}
              />
              <View style={styles.inlineFields}>
                <TextInput
                  style={[styles.input, styles.inlineInput]}
                  value={row.unit}
                  onChangeText={(value) => updateLabField(index, 'unit', value)}
                  placeholder="Unit"
                  placeholderTextColor={colors.textTertiary}
                />
                <TextInput
                  style={[styles.input, styles.inlineInput]}
                  value={row.refRange}
                  onChangeText={(value) => updateLabField(index, 'refRange', value)}
                  placeholder="Reference range"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
            </View>
          ))}
          {labValues.length > 0 ? (
            <TouchableOpacity
              style={[styles.primaryButton, busy && styles.disabled]}
              disabled={busy}
              onPress={() => void reportLabResults()}
            >
              {busy ? <ActivityIndicator size="small" color={colors.textInverse} /> : null}
              <Text style={styles.primaryButtonText}>{busy ? 'Saving…' : 'Record results & report'}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {primaryAction ? (
        <TouchableOpacity
          style={[styles.primaryButton, busy && styles.disabled]}
          disabled={busy}
          onPress={() => void runNativeStatus(primaryAction.status)}
        >
          {busy ? <ActivityIndicator size="small" color={colors.textInverse} /> : null}
          <Text style={styles.primaryButtonText}>{busy ? 'Updating…' : primaryAction.label}</Text>
        </TouchableOpacity>
      ) : null}

      {cancellable ? (
        <TouchableOpacity
          style={[styles.cancelButton, busy && styles.disabled]}
          disabled={busy}
          onPress={confirmCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel fulfillment</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  headerCopy: { flex: 1, gap: spacing.xs },
  title: { ...typography.h4, color: colors.textPrimary },
  subTitle: { ...typography.body, color: colors.textPrimary, fontWeight: '600' },
  hint: { ...typography.bodySmall, color: colors.textSecondary },
  badge: {
    borderRadius: radius.full,
    backgroundColor: colors.accentMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeText: { ...typography.caption, color: colors.accent, textTransform: 'capitalize' },
  warningBox: {
    borderRadius: radius.md,
    padding: spacing.sm,
    backgroundColor: colors.warningSoft,
  },
  warningText: { ...typography.bodySmall, color: colors.warning },
  labSection: { gap: spacing.sm },
  resultBlock: { gap: spacing.xs },
  resultName: { ...typography.bodySmall, color: colors.textPrimary, fontWeight: '600' },
  input: {
    ...typography.bodySmall,
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
  },
  inlineFields: { flexDirection: 'row', gap: spacing.sm },
  inlineInput: { flex: 1 },
  primaryButton: {
    minHeight: 46,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  primaryButtonText: { ...typography.bodySmall, color: colors.textInverse, fontWeight: '700' },
  cancelButton: {
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  cancelButtonText: { ...typography.bodySmall, color: colors.error, fontWeight: '600' },
  errorText: { ...typography.bodySmall, color: colors.error },
  disabled: { opacity: 0.6 },
});
