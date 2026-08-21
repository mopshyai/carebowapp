/**
 * Vitals Screen
 * Log a new vital reading and review history for the active profile.
 * Backed by `/v1/vitals` via `vitalsApi`.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '@/theme';
import { vitalsApi, Vital } from '@/services/api/endpoints/vitals';
import { useSelectedMember } from '@/store/useProfileStore';
import { backendProfileIdForVitals } from '@/lib/vitalsPatientBinding';

type VitalTypeKey = 'blood_pressure' | 'heart_rate' | 'blood_sugar' | 'weight' | 'temperature';

const VITAL_TYPES: Record<
  VitalTypeKey,
  {
    label: string;
    unit: string;
    placeholder: string;
    keyboardType: 'default' | 'numeric' | 'decimal-pad';
  }
> = {
  blood_pressure: {
    label: 'Blood Pressure',
    unit: 'mmHg',
    placeholder: 'e.g., 120/80',
    keyboardType: 'default',
  },
  heart_rate: {
    label: 'Heart Rate',
    unit: 'bpm',
    placeholder: 'e.g., 72',
    keyboardType: 'numeric',
  },
  blood_sugar: {
    label: 'Blood Sugar',
    unit: 'mg/dL',
    placeholder: 'e.g., 95',
    keyboardType: 'numeric',
  },
  weight: {
    label: 'Weight',
    unit: 'kg',
    placeholder: 'e.g., 68',
    keyboardType: 'decimal-pad',
  },
  temperature: {
    label: 'Temperature',
    unit: '°F',
    placeholder: 'e.g., 98.6',
    keyboardType: 'decimal-pad',
  },
};

const typeLabel = (type: string) => VITAL_TYPES[type as VitalTypeKey]?.label ?? type;

const whenLabel = (iso: string) =>
  new Date(iso).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function VitalsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const selectedMember = useSelectedMember();
  const profileId = backendProfileIdForVitals(selectedMember);
  const activeProfileIdRef = useRef(profileId);
  const loadRequestRef = useRef(0);
  activeProfileIdRef.current = profileId;

  const [selectedType, setSelectedType] = useState<VitalTypeKey>('blood_pressure');
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [vitals, setVitals] = useState<Vital[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Read only the exact selected patient's backend profile. A previous version
   * fetched every profile and silently used profiles[0], which could show or
   * write another family member's clinical readings.
   */
  const loadHistory = useCallback(async () => {
    const requestId = ++loadRequestRef.current;
    const requestedProfileId = profileId;

    if (!requestedProfileId) {
      setVitals([]);
      setLoading(false);
      setRefreshing(false);
      setError(null);
      return;
    }

    try {
      setError(null);
      const res = await vitalsApi.list({ profileId: requestedProfileId, limit: 30 });
      if (!res.success) throw new Error(res.error || 'Unable to load vitals');
      if (requestId !== loadRequestRef.current) return;
      setVitals(res.vitals ?? []);
    } catch {
      if (requestId !== loadRequestRef.current) return;
      setError('Cannot reach CareBow servers. Pull to retry.');
    } finally {
      if (requestId === loadRequestRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [profileId]);

  useEffect(() => {
    setVitals([]);
    setLoading(Boolean(profileId));
    setRefreshing(false);
    setError(null);
    void loadHistory();

    return () => {
      loadRequestRef.current += 1;
    };
  }, [profileId, loadHistory]);

  const handleLog = async () => {
    if (!profileId || !value.trim() || submitting) return;
    const targetProfileId = profileId;
    const cfg = VITAL_TYPES[selectedType];
    setSubmitting(true);
    try {
      const res = await vitalsApi.record({
        profileId: targetProfileId,
        type: selectedType,
        value: value.trim(),
        unit: cfg.unit,
      });
      if (!res.success) throw new Error(res.error || 'Unable to save vital');

      // If the selected patient changed while the request was in flight, do not
      // let the old patient's response mutate the new patient's screen state.
      if (activeProfileIdRef.current !== targetProfileId) return;
      setValue('');
      await loadHistory();
    } catch {
      if (activeProfileIdRef.current === targetProfileId) {
        setError('Could not save this reading. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const showFullScreenLoading = loading && !refreshing && vitals.length === 0 && !error;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vitals</Text>
        <View style={styles.headerButton} />
      </View>

      {!profileId ? (
        <View style={styles.centerFill}>
          <Icon name="pulse-outline" size={48} color={colors.textTertiary} />
          <Text style={styles.emptyText}>
            {selectedMember
              ? `${selectedMember.firstName}'s profile is not synced yet. Reopen Family Members and save the profile before logging vitals.`
              : 'Select or add a patient before logging vitals.'}
          </Text>
        </View>
      ) : showFullScreenLoading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={insets.top}
        >
          <FlatList
            data={vitals}
            keyExtractor={(v) => v.id}
            contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  void loadHistory();
                }}
                tintColor={colors.accent}
              />
            }
            ListHeaderComponent={
              <View style={styles.formCard}>
                <Text style={styles.formLabel}>Log a reading</Text>
                <View style={styles.typeRow}>
                  {(Object.keys(VITAL_TYPES) as VitalTypeKey[]).map((key) => (
                    <TouchableOpacity
                      key={key}
                      style={[styles.typeChip, selectedType === key && styles.typeChipActive]}
                      onPress={() => setSelectedType(key)}
                    >
                      <Text
                        style={[
                          styles.typeChipText,
                          selectedType === key && styles.typeChipTextActive,
                        ]}
                      >
                        {VITAL_TYPES[key].label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={setValue}
                    placeholder={VITAL_TYPES[selectedType].placeholder}
                    placeholderTextColor={colors.textTertiary}
                    keyboardType={VITAL_TYPES[selectedType].keyboardType}
                  />
                  <Text style={styles.unitText}>{VITAL_TYPES[selectedType].unit}</Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.logButton,
                    (!value.trim() || submitting) && styles.logButtonDisabled,
                  ]}
                  onPress={handleLog}
                  disabled={!value.trim() || submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color={colors.textInverse} />
                  ) : (
                    <Text style={styles.logButtonText}>Log</Text>
                  )}
                </TouchableOpacity>

                <Text style={styles.historyLabel}>History</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.row}>
                <View style={styles.rowIcon}>
                  <Icon name="pulse-outline" size={18} color={colors.accent} />
                </View>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowTitle}>{typeLabel(item.type)}</Text>
                  <Text style={styles.rowSubtitle}>{whenLabel(item.recordedAt)}</Text>
                </View>
                <Text style={styles.rowValue}>
                  {item.value} {item.unit}
                </Text>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Icon name="pulse-outline" size={40} color={colors.textTertiary} />
                <Text style={styles.emptyText}>{error || 'No vitals logged yet'}</Text>
              </View>
            }
          />
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface2 },
  flex: { flex: 1 },
  centerFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h3,
  },
  content: { padding: spacing.lg, flexGrow: 1 },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  formLabel: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  typeChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface2,
  },
  typeChipActive: {
    backgroundColor: colors.accentMuted,
  },
  typeChipText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  typeChipTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.textPrimary,
  },
  unitText: {
    ...typography.label,
    color: colors.textTertiary,
    minWidth: 56,
  },
  logButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.button,
  },
  logButtonDisabled: {
    backgroundColor: colors.textTertiary,
    ...shadows.none,
  },
  logButtonText: {
    ...typography.label,
    color: colors.textInverse,
  },
  historyLabel: {
    ...typography.label,
    color: colors.textPrimary,
    marginTop: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowInfo: { flex: 1 },
  rowTitle: { ...typography.label, color: colors.textPrimary },
  rowSubtitle: { ...typography.caption, color: colors.textSecondary },
  rowValue: {
    ...typography.label,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxxl,
    gap: spacing.sm,
  },
  emptyText: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
});