/**
 * Member Details Screen
 * View and edit individual family member's server-backed health data.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows, components } from '../../theme';
import { useProfileStore } from '../../store/useProfileStore';
import {
  RELATIONSHIP_LABELS,
  WHY_WE_ASK,
  generateId,
  type MemberHealthInfo,
} from '../../types/profile';
import { persistMemberSnapshot } from '../../lib/profileRepository';

type ModalType = 'allergy' | 'condition' | 'medication' | null;

export default function MemberDetailsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = (route.params as { id: string }) || {};

  const getMemberById = useProfileStore((state) => state.getMemberById);
  const updateMember = useProfileStore((state) => state.updateMember);
  const member = getMemberById(id || '');

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [modalInput, setModalInput] = useState('');
  const [modalSecondInput, setModalSecondInput] = useState('');
  const [modalThirdInput, setModalThirdInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!member) {
    return (
      <View style={[styles.container, styles.notFound]}>
        <Text style={styles.notFoundText}>Member not found</Text>
        <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
          <Text style={styles.backLinkText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const resetModal = () => {
    setActiveModal(null);
    setModalInput('');
    setModalSecondInput('');
    setModalThirdInput('');
  };

  const persistHealthInfo = async (healthInfo: MemberHealthInfo): Promise<boolean> => {
    if (isSaving) return false;
    setIsSaving(true);

    try {
      const nextMember = { ...member, healthInfo };
      const backendId = await persistMemberSnapshot(nextMember);
      // Server succeeded: only now mutate the device cache.
      updateMember(member.id, { healthInfo, backendId });
      return true;
    } catch (error) {
      Alert.alert(
        'Could not save health information',
        error instanceof Error
          ? error.message
          : 'CareBow could not save this change. Your profile was not changed.'
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAllergy = async () => {
    if (!modalInput.trim()) {
      Alert.alert('Missing allergy', 'Please enter an allergy name.');
      return;
    }

    const saved = await persistHealthInfo({
      ...member.healthInfo,
      allergies: [
        ...member.healthInfo.allergies,
        {
          id: generateId(),
          name: modalInput.trim(),
          // The form does not ask for severity, so do not invent one.
          severity: 'unknown',
          notes: modalSecondInput.trim() || undefined,
        },
      ],
    });

    if (saved) resetModal();
  };

  const handleAddCondition = async () => {
    if (!modalInput.trim()) {
      Alert.alert('Missing condition', 'Please enter a condition name.');
      return;
    }

    const saved = await persistHealthInfo({
      ...member.healthInfo,
      conditions: [
        ...member.healthInfo.conditions,
        {
          id: generateId(),
          name: modalInput.trim(),
          // The form does not ask current status, so do not invent "active".
          status: 'unknown',
          notes: modalSecondInput.trim() || undefined,
        },
      ],
    });

    if (saved) resetModal();
  };

  const handleAddMedication = async () => {
    if (!modalInput.trim()) {
      Alert.alert('Missing medication', 'Please enter a medication name.');
      return;
    }

    const saved = await persistHealthInfo({
      ...member.healthInfo,
      medications: [
        ...member.healthInfo.medications,
        {
          id: generateId(),
          name: modalInput.trim(),
          dosage: modalSecondInput.trim(),
          // Blank means unknown. "As directed" would be an invented medication instruction.
          frequency: modalThirdInput.trim(),
        },
      ],
    });

    if (saved) resetModal();
  };

  const handleRemoveAllergy = (allergyId: string, name: string) => {
    Alert.alert('Remove Allergy', `Remove "${name}" from allergies?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await persistHealthInfo({
            ...member.healthInfo,
            allergies: member.healthInfo.allergies.filter((allergy) => allergy.id !== allergyId),
          });
        },
      },
    ]);
  };

  const handleRemoveCondition = (conditionId: string, name: string) => {
    Alert.alert('Remove Condition', `Remove "${name}" from conditions?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await persistHealthInfo({
            ...member.healthInfo,
            conditions: member.healthInfo.conditions.filter(
              (condition) => condition.id !== conditionId
            ),
          });
        },
      },
    ]);
  };

  const handleRemoveMedication = (medicationId: string, name: string) => {
    Alert.alert('Remove Medication', `Remove "${name}" from medications?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await persistHealthInfo({
            ...member.healthInfo,
            medications: member.healthInfo.medications.filter(
              (medication) => medication.id !== medicationId
            ),
          });
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{member.firstName}'s Profile</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 32 + insets.bottom }]}
      >
        {/* Member Card */}
        <View style={styles.memberCard}>
          <View style={styles.memberAvatar}>
            <Text style={styles.memberAvatarText}>
              {member.firstName.charAt(0)}
              {member.lastName?.charAt(0) || ''}
            </Text>
          </View>
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>
              {member.firstName} {member.lastName}
            </Text>
            <Text style={styles.memberRelationship}>
              {RELATIONSHIP_LABELS[member.relationship]}
            </Text>
          </View>
          <View style={styles.completenessCircle}>
            <Text style={styles.completenessText}>{member.profileCompleteness}%</Text>
          </View>
        </View>

        <View style={styles.cloudNote}>
          <Icon name="cloud-done-outline" size={18} color={colors.info} />
          <Text style={styles.cloudNoteText}>
            Changes below are saved to your CareBow account before this device is updated.
          </Text>
        </View>

        {/* Allergies Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Allergies</Text>
              <Text style={styles.sectionDescription}>{WHY_WE_ASK.allergies}</Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setActiveModal('allergy')}
              disabled={isSaving}
            >
              <Icon name="add" size={20} color={colors.accent} />
            </TouchableOpacity>
          </View>

          {member.healthInfo.allergies.length > 0 ? (
            <View style={styles.itemsList}>
              {member.healthInfo.allergies.map((allergy) => (
                <View key={allergy.id} style={styles.itemCard}>
                  <View style={[styles.itemIcon, { backgroundColor: colors.errorSoft }]}>
                    <Icon name="warning" size={16} color={colors.error} />
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemName}>{allergy.name}</Text>
                    <Text style={styles.itemMeta}>
                      Severity: {allergy.severity === 'unknown' ? 'Not specified' : allergy.severity}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveAllergy(allergy.id, allergy.name)}
                    disabled={isSaving}
                  >
                    <Icon name="close-circle" size={24} color={colors.textTertiary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyList}>
              <Text style={styles.emptyListText}>No allergies recorded</Text>
            </View>
          )}
        </View>

        {/* Conditions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Health Conditions</Text>
              <Text style={styles.sectionDescription}>{WHY_WE_ASK.conditions}</Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setActiveModal('condition')}
              disabled={isSaving}
            >
              <Icon name="add" size={20} color={colors.accent} />
            </TouchableOpacity>
          </View>

          {member.healthInfo.conditions.length > 0 ? (
            <View style={styles.itemsList}>
              {member.healthInfo.conditions.map((condition) => (
                <View key={condition.id} style={styles.itemCard}>
                  <View style={[styles.itemIcon, { backgroundColor: colors.nursingSoft }]}>
                    <Icon name="heart" size={16} color={colors.nursing} />
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemName}>{condition.name}</Text>
                    <Text style={styles.itemMeta}>
                      Status: {condition.status === 'unknown' ? 'Not specified' : condition.status}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveCondition(condition.id, condition.name)}
                    disabled={isSaving}
                  >
                    <Icon name="close-circle" size={24} color={colors.textTertiary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyList}>
              <Text style={styles.emptyListText}>No conditions recorded</Text>
            </View>
          )}
        </View>

        {/* Medications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Medications</Text>
              <Text style={styles.sectionDescription}>{WHY_WE_ASK.medications}</Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setActiveModal('medication')}
              disabled={isSaving}
            >
              <Icon name="add" size={20} color={colors.accent} />
            </TouchableOpacity>
          </View>

          {member.healthInfo.medications.length > 0 ? (
            <View style={styles.itemsList}>
              {member.healthInfo.medications.map((medication) => {
                const instructions = [medication.dosage, medication.frequency]
                  .filter(Boolean)
                  .join(' - ');
                return (
                  <View key={medication.id} style={styles.itemCard}>
                    <View style={[styles.itemIcon, { backgroundColor: colors.infoSoft }]}>
                      <Icon name="medical" size={16} color={colors.info} />
                    </View>
                    <View style={styles.itemContent}>
                      <Text style={styles.itemName}>{medication.name}</Text>
                      <Text style={styles.itemMeta}>
                        {instructions || 'Dose and frequency not specified'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveMedication(medication.id, medication.name)}
                      disabled={isSaving}
                    >
                      <Icon name="close-circle" size={24} color={colors.textTertiary} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyList}>
              <Text style={styles.emptyListText}>No medications recorded</Text>
            </View>
          )}
        </View>

        {/* Mobility intentionally omitted for launch. The current Profile API
            has no mobility field; showing an editable control here would imply
            cloud persistence that does not exist. */}
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={activeModal !== null} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={resetModal} disabled={isSaving}>
              <Text style={[styles.modalCancel, isSaving && styles.disabledText]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {activeModal === 'allergy' && 'Add Allergy'}
              {activeModal === 'condition' && 'Add Condition'}
              {activeModal === 'medication' && 'Add Medication'}
            </Text>
            <TouchableOpacity
              disabled={isSaving}
              onPress={() => {
                if (activeModal === 'allergy') void handleAddAllergy();
                if (activeModal === 'condition') void handleAddCondition();
                if (activeModal === 'medication') void handleAddMedication();
              }}
            >
              <Text style={[styles.modalSave, isSaving && styles.disabledText]}>
                {isSaving ? 'Saving…' : 'Add'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {activeModal === 'allergy' && 'Allergy Name *'}
                {activeModal === 'condition' && 'Condition Name *'}
                {activeModal === 'medication' && 'Medication Name *'}
              </Text>
              <TextInput
                style={styles.input}
                value={modalInput}
                onChangeText={setModalInput}
                placeholder={
                  activeModal === 'allergy'
                    ? 'e.g., Penicillin, Peanuts'
                    : activeModal === 'condition'
                      ? 'e.g., Diabetes, Hypertension'
                      : 'e.g., Lisinopril, Metformin'
                }
                placeholderTextColor={colors.textTertiary}
                autoFocus
                editable={!isSaving}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {activeModal === 'medication' ? 'Dosage' : 'Notes (optional)'}
              </Text>
              <TextInput
                style={styles.input}
                value={modalSecondInput}
                onChangeText={setModalSecondInput}
                placeholder={
                  activeModal === 'medication' ? 'e.g., 10mg, 500mg' : 'Any additional notes'
                }
                placeholderTextColor={colors.textTertiary}
                editable={!isSaving}
              />
            </View>

            {activeModal === 'medication' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Frequency</Text>
                <TextInput
                  style={styles.input}
                  value={modalThirdInput}
                  onChangeText={setModalThirdInput}
                  placeholder="e.g., Once daily, Twice daily"
                  placeholderTextColor={colors.textTertiary}
                  editable={!isSaving}
                />
              </View>
            )}

            {(activeModal === 'allergy' || activeModal === 'condition') && (
              <Text style={styles.fieldNote}>
                Severity/status is shown as “Not specified” until CareBow has a backend field to
                store that qualifier without losing it across devices.
              </Text>
            )}
          </View>
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
  notFound: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    ...typography.h3,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  backLink: {
    padding: spacing.sm,
  },
  backLinkText: {
    ...typography.label,
    color: colors.accent,
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
    ...typography.h3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
    ...shadows.card,
  },
  memberAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textInverse,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    ...typography.h3,
    marginBottom: spacing.xxs,
  },
  memberRelationship: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  completenessCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accentMuted,
    borderWidth: 2,
    borderColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completenessText: {
    ...typography.labelSmall,
    color: colors.accent,
  },
  cloudNote: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    backgroundColor: colors.infoSoft,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cloudNoteText: {
    ...typography.caption,
    color: colors.info,
    flex: 1,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    marginBottom: spacing.xxs,
  },
  sectionDescription: {
    ...typography.caption,
    color: colors.textTertiary,
    maxWidth: '85%',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemsList: {
    gap: spacing.xs,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface2,
  },
  itemIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    ...typography.label,
  },
  itemMeta: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  emptyList: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  emptyListText: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
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
  disabledText: {
    opacity: 0.45,
  },
  modalContent: {
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
  fieldNote: {
    ...typography.caption,
    color: colors.textTertiary,
    lineHeight: 18,
  },
});