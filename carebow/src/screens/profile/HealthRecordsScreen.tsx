/**
 * Health Records Screen
 * Upload and manage health records (placeholder for file uploads)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows, components } from '../../theme';
import { useProfileStore } from '../../store/useProfileStore';
import {
  HealthRecord,
  HealthRecordType,
  HEALTH_RECORD_TYPE_LABELS,
} from '../../types/profile';

const RECORD_TYPE_OPTIONS: { value: HealthRecordType; label: string; icon: string }[] = [
  { value: 'lab_result', label: 'Lab Result', icon: 'flask' },
  { value: 'prescription', label: 'Prescription', icon: 'document-text' },
  { value: 'imaging', label: 'Imaging', icon: 'scan' },
  { value: 'visit_summary', label: 'Visit Summary', icon: 'clipboard' },
  { value: 'vaccination', label: 'Vaccination', icon: 'medkit' },
  { value: 'other', label: 'Other', icon: 'folder' },
];

export default function HealthRecordsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const healthRecords = useProfileStore((state) => state.healthRecords);
  const members = useProfileStore((state) => state.members);
  const addHealthRecord = useProfileStore((state) => state.addHealthRecord);
  const deleteHealthRecord = useProfileStore((state) => state.deleteHealthRecord);
  const selectedMemberId = useProfileStore((state) => state.selectedMemberId);

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [recordType, setRecordType] = useState<HealthRecordType>('lab_result');
  const [date, setDate] = useState('');
  const [providerName, setProviderName] = useState('');
  const [notes, setNotes] = useState('');

  const memberId = selectedMemberId || members[0]?.id || '';
  const memberRecords = healthRecords.filter((r) => r.memberId === memberId);

  const resetForm = () => {
    setTitle('');
    setRecordType('lab_result');
    setDate('');
    setProviderName('');
    setNotes('');
  };

  const handleAddRecord = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for the record');
      return;
    }
    if (!memberId) {
      Alert.alert('Error', 'Please add a family member first');
      return;
    }

    addHealthRecord({
      memberId,
      title: title.trim(),
      type: recordType,
      date: date || new Date().toISOString().split('T')[0],
      providerName: providerName.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    setShowModal(false);
    resetForm();
    Alert.alert('Success', 'Health record added');
  };

  const handleDelete = (record: HealthRecord) => {
    Alert.alert(
      'Delete Record',
      `Are you sure you want to delete "${record.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteHealthRecord(record.id),
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getRecordIcon = (type: HealthRecordType) => {
    const option = RECORD_TYPE_OPTIONS.find((o) => o.value === type);
    return option?.icon || 'document';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Records</Text>
        <TouchableOpacity style={styles.headerButton} onPress={() => setShowModal(true)}>
          <Icon name="add" size={24} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 32 + insets.bottom }]}
      >
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Icon name="folder" size={20} color={colors.accent} />
          <Text style={styles.infoText}>
            Store important health documents for quick access during care visits. File uploads
            coming soon.
          </Text>
        </View>

        {/* Records List */}
        {memberRecords.length > 0 ? (
          <View style={styles.recordsList}>
            {memberRecords.map((record) => (
              <Pressable
                key={record.id}
                style={({ pressed }) => [styles.recordCard, pressed && styles.pressed]}
              >
                <View style={styles.recordHeader}>
                  <View style={styles.recordIcon}>
                    <Icon
                      name={getRecordIcon(record.type) as any}
                      size={20}
                      color={colors.accent}
                    />
                  </View>
                  <View style={styles.recordInfo}>
                    <Text style={styles.recordTitle}>{record.title}</Text>
                    <Text style={styles.recordMeta}>
                      {HEALTH_RECORD_TYPE_LABELS[record.type]} • {formatDate(record.date)}
                    </Text>
                    {record.providerName && (
                      <Text style={styles.recordProvider}>{record.providerName}</Text>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(record)}>
                    <Icon name="trash-outline" size={20} color={colors.textTertiary} />
                  </TouchableOpacity>
                </View>
                {record.notes && (
                  <View style={styles.recordNotes}>
                    <Text style={styles.recordNotesText}>{record.notes}</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Icon name="folder-outline" size={48} color={colors.textTertiary} />
            </View>
            <Text style={styles.emptyTitle}>No Health Records</Text>
            <Text style={styles.emptyDescription}>
              Add health records to keep important documents organized and accessible
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => setShowModal(true)}>
              <Icon name="add" size={20} color={colors.textInverse} />
              <Text style={styles.emptyButtonText}>Add Record</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Health Record</Text>
            <TouchableOpacity onPress={handleAddRecord}>
              <Text style={styles.modalSave}>Add</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.modalForm}>
              {/* Title */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Title *</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g., Annual Blood Work Results"
                  placeholderTextColor={colors.textTertiary}
                  autoFocus
                />
              </View>

              {/* Record Type */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Type</Text>
                <View style={styles.typeOptions}>
                  {RECORD_TYPE_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.typeOption,
                        recordType === option.value && styles.typeOptionSelected,
                      ]}
                      onPress={() => setRecordType(option.value)}
                    >
                      <Icon
                        name={option.icon as any}
                        size={16}
                        color={recordType === option.value ? colors.accent : colors.textTertiary}
                      />
                      <Text
                        style={[
                          styles.typeOptionText,
                          recordType === option.value && styles.typeOptionTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Date */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date</Text>
                <TextInput
                  style={styles.input}
                  value={date}
                  onChangeText={setDate}
                  placeholder="MM/DD/YYYY"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>

              {/* Provider */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Provider Name (optional)</Text>
                <TextInput
                  style={styles.input}
                  value={providerName}
                  onChangeText={setProviderName}
                  placeholder="e.g., Dr. Smith, Quest Diagnostics"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>

              {/* Notes */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Notes (optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Any additional notes..."
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Upload Placeholder */}
              <View style={styles.uploadPlaceholder}>
                <Icon name="cloud-upload-outline" size={32} color={colors.textTertiary} />
                <Text style={styles.uploadText}>File upload coming soon</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  infoCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.accentMuted,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.accent,
    flex: 1,
  },
  recordsList: {
    gap: spacing.sm,
  },
  recordCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.card,
  },
  pressed: {
    opacity: 0.95,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.accentMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    ...typography.label,
    marginBottom: 2,
  },
  recordMeta: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  recordProvider: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  recordNotes: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  recordNotesText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.card,
  },
  emptyTitle: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  emptyDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    ...shadows.button,
  },
  emptyButtonText: {
    ...typography.label,
    color: colors.textInverse,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.surface2,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalCancel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  modalTitle: {
    ...typography.h4,
  },
  modalSave: {
    ...typography.label,
    color: colors.accent,
  },
  modalContent: {
    flex: 1,
  },
  modalForm: {
    padding: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    ...components.input,
    color: colors.textPrimary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  typeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  typeOptionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentMuted,
  },
  typeOptionText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  typeOptionTextSelected: {
    color: colors.accent,
  },
  uploadPlaceholder: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  uploadText: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
});
