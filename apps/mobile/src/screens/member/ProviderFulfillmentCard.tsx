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
  type AssignedAmbulanceTrip,
  type AssignedLabTest,
  type AssignedMedicineOrder,
  type AssignedRentalOrder,
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

const dateLabel = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

function ContextRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View style={styles.contextRow}>
      <Text style={styles.contextLabel}>{label}</Text>
      <Text style={styles.contextValue}>{value}</Text>
    </View>
  );
}

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
  const [nativeLoading, setNativeLoading] = useState(false);
  const [labTest, setLabTest] = useState<AssignedLabTest | null>(null);
  const [labValues, setLabValues] = useState<EditableLabValue[]>([]);
  const [medicineOrder, setMedicineOrder] = useState<AssignedMedicineOrder | null>(null);
  const [rentalOrder, setRentalOrder] = useState<AssignedRentalOrder | null>(null);
  const [ambulanceTrip, setAmbulanceTrip] = useState<AssignedAmbulanceTrip | null>(null);

  const kind = fulfillment?.kind;
  const status = fulfillment?.status;
  const primaryAction = useMemo(
    () => (kind ? primaryProviderFulfillmentAction(kind, status) : null),
    [kind, status]
  );

  useEffect(() => {
    let active = true;
    setLabTest(null);
    setLabValues([]);
    setMedicineOrder(null);
    setRentalOrder(null);
    setAmbulanceTrip(null);

    if (!fulfillment?.workflowRequired || kind === 'standard' || kind === 'unknown') {
      setNativeLoading(false);
      return () => {
        active = false;
      };
    }

    setNativeLoading(true);
    setError(null);

    const loadNative = async () => {
      if (kind === 'lab') {
        const { tests } = await providerFulfillmentApi.getLabTests();
        const match = tests.find((row) => row.bookingId === booking.id) ?? null;
        if (!active) return;
        setLabTest(match);
        setLabValues(toEditableTests(match));
        return;
      }

      if (!fulfillment.targetId) return;

      if (kind === 'pharmacy') {
        const { orders } = await providerFulfillmentApi.getMedicineOrders();
        if (active) {
          setMedicineOrder(orders.find((row) => row.id === fulfillment.targetId) ?? null);
        }
      } else if (kind === 'equipment') {
        const { orders } = await providerFulfillmentApi.getRentalOrders();
        if (active) {
          setRentalOrder(orders.find((row) => row.id === fulfillment.targetId) ?? null);
        }
      } else if (kind === 'ambulance') {
        const { trips } = await providerFulfillmentApi.getActiveTrips();
        if (active) {
          setAmbulanceTrip(trips.find((row) => row.id === fulfillment.targetId) ?? null);
        }
      }
    };

    void loadNative()
      .catch(() => {
        if (active) setError('Could not load the native fulfillment details. Refresh before acting.');
      })
      .finally(() => {
        if (active) setNativeLoading(false);
      });

    return () => {
      active = false;
    };
  }, [booking.id, fulfillment?.targetId, fulfillment?.workflowRequired, kind, status]);

  if (!fulfillment?.workflowRequired || kind === 'standard') return null;

  const contextReady =
    kind === 'lab'
      ? Boolean(labTest)
      : kind === 'pharmacy'
        ? Boolean(medicineOrder)
        : kind === 'equipment'
          ? Boolean(rentalOrder)
          : kind === 'ambulance'
            ? Boolean(ambulanceTrip)
            : false;
  const actionable = contextReady && !nativeLoading;
  const cancellable = Boolean(
    actionable && kind && canCancelProviderFulfillment(kind, status)
  );

  const runNativeStatus = async (nextStatus: string) => {
    if (busy || !actionable) return;
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
    if (busy || kind !== 'lab' || !actionable) return;
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

      {nativeLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={colors.accent} />
          <Text style={styles.hint}>Loading fulfillment details…</Text>
        </View>
      ) : null}

      {kind === 'unknown' ? (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            CareBow does not recognize this fulfillment owner yet. The assignment is locked instead of guessing a status transition. Operations must review it.
          </Text>
        </View>
      ) : null}

      {!nativeLoading && kind !== 'unknown' && !contextReady ? (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            The specialized fulfillment record is missing or is no longer assigned to this account. Actions are locked until operations repairs the link.
          </Text>
        </View>
      ) : null}

      {labTest ? (
        <View style={styles.contextBlock}>
          <Text style={styles.subTitle}>Ordered tests</Text>
          {labTest.tests.map((test, index) => (
            <Text key={`${test.name}-${index}`} style={styles.contextValue}>
              • {test.name}
              {test.value == null || String(test.value).trim() === ''
                ? ''
                : ` — ${String(test.value)}${test.unit ? ` ${test.unit}` : ''}`}
            </Text>
          ))}
        </View>
      ) : null}

      {medicineOrder ? (
        <View style={styles.contextBlock}>
          <Text style={styles.subTitle}>Medication order</Text>
          <ContextRow label="Patient" value={medicineOrder.patientName} />
          <ContextRow label="Delivery" value={medicineOrder.deliveryAddress} />
          {medicineOrder.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemMeta}>
                {[
                  item.dosage || null,
                  `Qty ${item.quantity}`,
                ].filter(Boolean).join(' · ')}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {rentalOrder ? (
        <View style={styles.contextBlock}>
          <Text style={styles.subTitle}>Equipment order</Text>
          <ContextRow label="Equipment" value={rentalOrder.equipmentName} />
          <ContextRow label="Customer" value={rentalOrder.customer} />
          <ContextRow label="Delivery" value={rentalOrder.deliveryAddress} />
          <ContextRow label="Start" value={dateLabel(rentalOrder.startDate)} />
          <ContextRow label="Return due" value={dateLabel(rentalOrder.endDate)} />
          <ContextRow
            label="Available units"
            value={rentalOrder.availableUnits == null ? null : String(rentalOrder.availableUnits)}
          />
        </View>
      ) : null}

      {ambulanceTrip ? (
        <View style={styles.contextBlock}>
          <View style={styles.tripHeader}>
            <Text style={styles.subTitle}>Trip details</Text>
            {ambulanceTrip.isEmergency ? (
              <View style={styles.emergencyBadge}>
                <Text style={styles.emergencyBadgeText}>Emergency</Text>
              </View>
            ) : null}
          </View>
          <ContextRow label="Patient" value={ambulanceTrip.patient} />
          <ContextRow label="Pickup" value={ambulanceTrip.pickupAddress} />
          <ContextRow label="Destination" value={ambulanceTrip.destination} />
          <ContextRow label="Requested" value={dateLabel(ambulanceTrip.requestedAt)} />
        </View>
      ) : null}

      {kind === 'lab' && status === 'PROCESSING' && labTest ? (
        <View style={styles.labSection}>
          <Text style={styles.subTitle}>Report results</Text>
          <Text style={styles.hint}>
            Lab completion requires a report file or structured result values. This form records structured values; it never marks a test reported with an empty result.
          </Text>
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

      {primaryAction && actionable ? (
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
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
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
  contextBlock: {
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  contextRow: { gap: 2 },
  contextLabel: { ...typography.caption, color: colors.textTertiary },
  contextValue: { ...typography.bodySmall, color: colors.textPrimary },
  itemRow: {
    borderRadius: radius.md,
    backgroundColor: colors.surface2,
    padding: spacing.sm,
    gap: 2,
  },
  itemName: { ...typography.bodySmall, color: colors.textPrimary, fontWeight: '600' },
  itemMeta: { ...typography.caption, color: colors.textSecondary },
  tripHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  emergencyBadge: {
    borderRadius: radius.full,
    backgroundColor: colors.errorSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  emergencyBadgeText: { ...typography.caption, color: colors.error, fontWeight: '700' },
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
