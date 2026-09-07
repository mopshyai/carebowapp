import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  memberApi,
  type ProviderConsultationNoteInput,
  type ProviderPrescriptionInput,
  type V1Booking,
} from '@/services/api/endpoints/member';
import { colors, radius, shadows, spacing, typography } from '@/theme';

type MedicineDraft = {
  name: string;
  dose: string;
  frequency: string;
  duration: string;
};

const emptyMedicine = (): MedicineDraft => ({
  name: '',
  dose: '',
  frequency: '',
  duration: '',
});

const trimOrUndefined = (value: string) => value.trim() || undefined;

export default function ProviderClinicalDocumentationCard({
  booking,
  onSaved,
}: {
  booking: V1Booking;
  onSaved: () => Promise<void> | void;
}) {
  const capabilities = booking.documentationCapabilities;
  const canWriteNow = booking.status === 'IN_PROGRESS' || booking.status === 'COMPLETED';
  const canWriteNote = Boolean(capabilities?.consultationNote && canWriteNow);
  const canWritePrescription = Boolean(capabilities?.prescription && canWriteNow);

  const [noteOpen, setNoteOpen] = useState(false);
  const [prescriptionOpen, setPrescriptionOpen] = useState(false);
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [findings, setFindings] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [medicines, setMedicines] = useState<MedicineDraft[]>([emptyMedicine()]);
  const [labTests, setLabTests] = useState('');
  const [advice, setAdvice] = useState('');
  const [saving, setSaving] = useState<'note' | 'prescription' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    setChiefComplaint(booking.consultationNote?.chiefComplaint ?? '');
    setDiagnosis(booking.consultationNote?.diagnosis ?? '');
    setFindings(booking.consultationNote?.findings ?? '');
    setTreatmentPlan(booking.consultationNote?.treatmentPlan ?? '');

    const existingMedicines = booking.prescription?.medicines
      ?.filter((item) => item?.name)
      .map((item) => ({
        name: item.name ?? '',
        dose: item.dose ?? '',
        frequency: item.frequency ?? '',
        duration: item.duration ?? '',
      }));
    setMedicines(existingMedicines?.length ? existingMedicines : [emptyMedicine()]);
    setLabTests(booking.prescription?.labTests?.join('\n') ?? '');
    setAdvice(booking.prescription?.advice ?? '');
  }, [booking.consultationNote, booking.prescription]);

  const anyCapability = Boolean(capabilities?.consultationNote || capabilities?.prescription);
  const hasOutcome = Boolean(booking.consultationNote || booking.prescription);
  const statusHint = useMemo(() => {
    if (canWriteNow) return null;
    if (booking.status === 'PENDING' || booking.status === 'CONFIRMED') {
      return 'Clinical documentation unlocks after care has started.';
    }
    if (booking.status === 'CANCELLED') return 'Cancelled care cannot be documented here.';
    return null;
  }, [booking.status, canWriteNow]);

  if (!anyCapability && !hasOutcome) return null;

  const saveNote = async () => {
    const input: ProviderConsultationNoteInput = {
      chiefComplaint: chiefComplaint.trim(),
      diagnosis: diagnosis.trim(),
      findings: trimOrUndefined(findings),
      treatmentPlan: trimOrUndefined(treatmentPlan),
    };
    if (!input.chiefComplaint || !input.diagnosis) {
      setError('Chief complaint and assessment / diagnosis are required.');
      return;
    }

    setSaving('note');
    setError(null);
    setSavedMessage(null);
    try {
      const result = await memberApi.saveProviderConsultationNote(booking.id, input);
      if (!result.success) {
        setError(result.error || 'CareBow could not save the consultation note.');
        return;
      }
      setSavedMessage('Consultation note saved to this CareBow booking.');
      setNoteOpen(false);
      await onSaved();
    } catch {
      setError('Cannot reach CareBow servers. Nothing was marked saved locally.');
    } finally {
      setSaving(null);
    }
  };

  const savePrescription = async () => {
    const normalizedMedicines = medicines
      .map((item) => ({
        name: item.name.trim(),
        dose: trimOrUndefined(item.dose),
        frequency: trimOrUndefined(item.frequency),
        duration: trimOrUndefined(item.duration),
      }))
      .filter((item) => item.name);
    const tests = labTests
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);
    const input: ProviderPrescriptionInput = {
      medicines: normalizedMedicines,
      labTests: tests,
      advice: trimOrUndefined(advice),
    };

    setSaving('prescription');
    setError(null);
    setSavedMessage(null);
    try {
      const result = await memberApi.saveProviderPrescription(booking.id, input);
      if (!result.success) {
        setError(result.error || 'CareBow could not save the prescription / plan.');
        return;
      }
      setSavedMessage('Prescription / plan saved to this CareBow booking.');
      setPrescriptionOpen(false);
      await onSaved();
    } catch {
      setError('Cannot reach CareBow servers. Nothing was marked saved locally.');
    } finally {
      setSaving(null);
    }
  };

  const updateMedicine = (index: number, field: keyof MedicineDraft, value: string) => {
    setMedicines((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  };

  const removeMedicine = (index: number) => {
    setMedicines((current) => {
      const next = current.filter((_, itemIndex) => itemIndex !== index);
      return next.length ? next : [emptyMedicine()];
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconWrap}>
          <Icon name="document-text-outline" size={19} color={colors.accent} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Care documentation</Text>
          <Text style={styles.hint}>
            Saved on the canonical booking and visible to the family after CareBow reloads it.
          </Text>
        </View>
      </View>

      {statusHint ? <Text style={styles.statusHint}>{statusHint}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {savedMessage ? <Text style={styles.success}>{savedMessage}</Text> : null}

      {capabilities?.consultationNote ? (
        <View style={styles.section}>
          <View style={styles.sectionHeadingRow}>
            <View style={styles.sectionHeadingCopy}>
              <Text style={styles.sectionTitle}>Consultation note</Text>
              <Text style={styles.hint}>
                Clinical assessment only. Ask CareBow referral context is not a diagnosis.
              </Text>
            </View>
            {canWriteNote ? (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  setError(null);
                  setSavedMessage(null);
                  setNoteOpen((value) => !value);
                }}
                accessibilityRole="button"
                accessibilityLabel={booking.consultationNote ? 'Edit consultation note' : 'Add consultation note'}
              >
                <Text style={styles.secondaryButtonText}>
                  {noteOpen ? 'Close' : booking.consultationNote ? 'Edit' : 'Add'}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {booking.consultationNote && !noteOpen ? (
            <View style={styles.summary}>
              <Text style={styles.summaryLabel}>Assessment / diagnosis</Text>
              <Text style={styles.summaryValue}>{booking.consultationNote.diagnosis}</Text>
            </View>
          ) : null}

          {noteOpen && canWriteNote ? (
            <View style={styles.form}>
              <LabeledInput
                label="Chief complaint *"
                value={chiefComplaint}
                onChangeText={setChiefComplaint}
                placeholder="What the patient is being seen for"
                multiline
              />
              <LabeledInput
                label="Assessment / diagnosis *"
                value={diagnosis}
                onChangeText={setDiagnosis}
                placeholder="Your clinical assessment"
                multiline
              />
              <LabeledInput
                label="Findings"
                value={findings}
                onChangeText={setFindings}
                placeholder="Relevant examination or visit findings"
                multiline
              />
              <LabeledInput
                label="Treatment / care plan"
                value={treatmentPlan}
                onChangeText={setTreatmentPlan}
                placeholder="Plan, monitoring and follow-up"
                multiline
              />
              <SaveButton
                label={booking.consultationNote ? 'Update consultation note' : 'Save consultation note'}
                busy={saving === 'note'}
                onPress={() => void saveNote()}
              />
            </View>
          ) : null}
        </View>
      ) : null}

      {capabilities?.prescription ? (
        <View style={styles.section}>
          <View style={styles.sectionHeadingRow}>
            <View style={styles.sectionHeadingCopy}>
              <Text style={styles.sectionTitle}>Prescription / plan</Text>
              <Text style={styles.hint}>Available only when the backend authorizes your provider role.</Text>
            </View>
            {canWritePrescription ? (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  setError(null);
                  setSavedMessage(null);
                  setPrescriptionOpen((value) => !value);
                }}
                accessibilityRole="button"
                accessibilityLabel={booking.prescription ? 'Edit prescription' : 'Add prescription'}
              >
                <Text style={styles.secondaryButtonText}>
                  {prescriptionOpen ? 'Close' : booking.prescription ? 'Edit' : 'Add'}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {booking.prescription && !prescriptionOpen ? (
            <View style={styles.summary}>
              <Text style={styles.summaryLabel}>Recorded plan</Text>
              <Text style={styles.summaryValue}>
                {booking.prescription.medicines?.length
                  ? `${booking.prescription.medicines.length} medicine item${booking.prescription.medicines.length === 1 ? '' : 's'}`
                  : booking.prescription.advice || 'Prescription saved'}
              </Text>
            </View>
          ) : null}

          {prescriptionOpen && canWritePrescription ? (
            <View style={styles.form}>
              <Text style={styles.fieldLabel}>Medicines</Text>
              {medicines.map((medicine, index) => (
                <View key={`medicine-${index}`} style={styles.medicineCard}>
                  <View style={styles.medicineHeader}>
                    <Text style={styles.medicineTitle}>Medicine {index + 1}</Text>
                    <TouchableOpacity
                      onPress={() => removeMedicine(index)}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove medicine ${index + 1}`}
                    >
                      <Icon name="trash-outline" size={18} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                  <LabeledInput
                    label="Name"
                    value={medicine.name}
                    onChangeText={(value) => updateMedicine(index, 'name', value)}
                    placeholder="Medicine name"
                  />
                  <View style={styles.twoColumn}>
                    <View style={styles.column}>
                      <LabeledInput
                        label="Dose"
                        value={medicine.dose}
                        onChangeText={(value) => updateMedicine(index, 'dose', value)}
                        placeholder="e.g. 500 mg"
                      />
                    </View>
                    <View style={styles.column}>
                      <LabeledInput
                        label="Frequency"
                        value={medicine.frequency}
                        onChangeText={(value) => updateMedicine(index, 'frequency', value)}
                        placeholder="e.g. twice daily"
                      />
                    </View>
                  </View>
                  <LabeledInput
                    label="Duration"
                    value={medicine.duration}
                    onChangeText={(value) => updateMedicine(index, 'duration', value)}
                    placeholder="e.g. 5 days"
                  />
                </View>
              ))}
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setMedicines((current) => [...current, emptyMedicine()])}
                accessibilityRole="button"
                accessibilityLabel="Add another medicine"
              >
                <Icon name="add-circle-outline" size={18} color={colors.accent} />
                <Text style={styles.addButtonText}>Add medicine</Text>
              </TouchableOpacity>
              <LabeledInput
                label="Lab tests"
                value={labTests}
                onChangeText={setLabTests}
                placeholder="One test per line"
                multiline
              />
              <LabeledInput
                label="Advice / follow-up"
                value={advice}
                onChangeText={setAdvice}
                placeholder="Care instructions or follow-up advice"
                multiline
              />
              <SaveButton
                label={booking.prescription ? 'Update prescription / plan' : 'Save prescription / plan'}
                busy={saving === 'prescription'}
                onPress={() => void savePrescription()}
              />
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function LabeledInput({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[styles.input, multiline && styles.multilineInput]}
      />
    </View>
  );
}

function SaveButton({ label, busy, onPress }: { label: string; busy: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.primaryButton, busy && styles.disabled]}
      disabled={busy}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {busy ? <ActivityIndicator size="small" color={colors.textInverse} /> : null}
      <Text style={styles.primaryButtonText}>{busy ? 'Saving…' : label}</Text>
    </TouchableOpacity>
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
    ...shadows.card,
  },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: { flex: 1 },
  title: { ...typography.h4, color: colors.textPrimary },
  hint: { ...typography.caption, color: colors.textTertiary, marginTop: 2 },
  statusHint: { ...typography.bodySmall, color: colors.textSecondary },
  error: { ...typography.bodySmall, color: colors.error },
  success: { ...typography.bodySmall, color: colors.accent },
  section: { gap: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  sectionHeadingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  sectionHeadingCopy: { flex: 1 },
  sectionTitle: { ...typography.label, color: colors.textPrimary },
  summary: { backgroundColor: colors.surface2, borderRadius: radius.md, padding: spacing.sm },
  summaryLabel: { ...typography.caption, color: colors.textTertiary },
  summaryValue: { ...typography.bodySmall, color: colors.textPrimary, marginTop: 2 },
  form: { gap: spacing.sm },
  field: { gap: spacing.xs },
  fieldLabel: { ...typography.caption, color: colors.textSecondary },
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
  multilineInput: { minHeight: 88 },
  medicineCard: {
    gap: spacing.sm,
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  medicineHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  medicineTitle: { ...typography.label, color: colors.textPrimary },
  twoColumn: { flexDirection: 'row', gap: spacing.sm },
  column: { flex: 1 },
  secondaryButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: { ...typography.label, color: colors.accent },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xs },
  addButtonText: { ...typography.label, color: colors.accent },
  primaryButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  primaryButtonText: { ...typography.label, color: colors.textInverse },
  disabled: { opacity: 0.65 },
});
