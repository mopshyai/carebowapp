/**
 * Member Details Screen
 * View and edit individual family member's information and health data
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Pressable,
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
  FamilyMember,
  Relationship,
  RELATIONSHIP_LABELS,
  MOBILITY_LABELS,
  MobilityStatus,
  Gender,
  Allergy,
  Condition,
  Medication,
  WHY_WE_ASK,
} from '../../types/profile';

type ModalType = 'allergy' | 'condition' | 'medication' | null;

export default function MemberDetailsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = (route.params as { id: string }) || {};

  const getMemberById = useProfileStore((state) => state.getMemberById);
  const updateMember = useProfileStore((state) => state.updateMember);
  const addAllergy = useProfileStore((state) => state.addAllergy);
  const removeAllergy = useProfileStore((state) => state.removeAllergy);
  const addCondition = useProfileStore((state) => state.addCondition);
  const removeCondition = useProfileStore((state) => state.removeCondition);
  const addMedication = useProfileStore((state) => state.addMedication);
  const removeMedication = useProfileStore((state) => state.removeMedication);

  const member = getMemberById(id || '');

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [modalInput, setModalInput] = useState('');
  const [modalSecondInput, setModalSecondInput] = useState('');
  const [modalThirdInput, setModalThirdInput] = useState('');

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

  const handleAddAllergy = () => {
    if (!modalInput.trim()) {
      Alert.alert('Error', 'Please enter an allergy name');
      return;
    }
    addAllergy(member.id, {
      name: modalInput.trim(),
      severity: 'moderate',
      notes: modalSecondInput.trim(),
    });
    setActiveModal(null);
    setModalInput('');
    setModalSecondInput('');
  };

  const handleAddCondition = () => {
    if (!modalInput.trim()) {
      Alert.alert('Error', 'Please enter a condition name');
      return;
    }
    addCondition(member.id, {
      name: modalInput.trim(),
      status: 'active',
      notes: modalSecondInput.trim(),
    });
    setActiveModal(null);
    setModalInput('');
    setModalSecondInput('');
  };

  const handleAddMedication = () => {
    if (!modalInput.trim()) {
      Alert.alert('Error', 'Please enter a medication name');
      return;
    }
    addMedication(member.id, {
      name: modalInput.trim(),
      dosage: modalSecondInput.trim(),
      frequency: modalThirdInput.trim() || 'As directed',
    });
    setActiveModal(null);
    setModalInput('');
    setModalSecondInput('');
    setModalThirdInput('');
  };

  const handleRemoveAllergy = (allergyId: string, name: string) => {
    Alert.alert('Remove Allergy', `Remove "${name}" from allergies?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeAllergy(member.id, allergyId) },
    ]);
  };

  const handleRemoveCondition = (conditionId: string, name: string) => {
    Alert.alert('Remove Condition', `Remove "${name}" from conditions?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeCondition(member.id, conditionId) },
    ]);
  };

  const handleRemoveMedication = (medicationId: string, name: string) => {
    Alert.alert('Remove Medication', `Remove "${name}" from medications?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeMedication(member.id, medicationId) },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
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
                    <Text style={styles.itemMeta}>Severity: {allergy.severity}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveAllergy(allergy.id, allergy.name)}
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
                    <Text style={styles.itemMeta}>Status: {condition.status}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveCondition(condition.id, condition.name)}
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
            >
              <Icon name="add" size={20} color={colors.accent} />
            </TouchableOpacity>
          </View>

          {member.healthInfo.medications.length > 0 ? (
            <View style={styles.itemsList}>
              {member.healthInfo.medications.map((medication) => (
                <View key={medication.id} style={styles.itemCard}>
                  <View style={[styles.itemIcon, { backgroundColor: colors.infoSoft }]}>
                    <Icon name="medical" size={16} color={colors.info} />
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemName}>{medication.name}</Text>
                    <Text style={styles.itemMeta}>
                      {medication.dosage ? `${medication.dosage} - ` : ''}
                      {medication.frequency}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveMedication(medication.id, medication.name)}
                  >
                    <Icon name="close-circle" size={24} color={colors.textTertiary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyList}>
              <Text style={styles.emptyListText}>No medications recorded</Text>
            </View>
          )}
        </View>

        {/* Mobility Status */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Mobility Status</Text>
              <Text style={styles.sectionDescription}>{WHY_WE_ASK.mobility}</Text>
            </View>
          </View>

          <View style={styles.mobilityOptions}>
            {(Object.keys(MOBILITY_LABELS) as MobilityStatus[]).map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.mobilityOption,
                  member.healthInfo.mobilityStatus === status && styles.mobilityOptionSelected,
                ]}
                onPress={() =>
                  updateMember(member.id, {
                    healthInfo: { ...member.healthInfo, mobilityStatus: status },
                  })
                }
              >
                <Text
                  style={[
                    styles.mobilityOptionText,
                    member.healthInfo.mobilityStatus === status && styles.mobilityOptionTextSelected,
                  ]}
                >
                  {MOBILITY_LABELS[status]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={activeModal !== null} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {activeModal === 'allergy' && 'Add Allergy'}
              {activeModal === 'condition' && 'Add Condition'}
              {activeModal === 'medication' && 'Add Medication'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (activeModal === 'allergy') handleAddAllergy();
                if (activeModal === 'condition') handleAddCondition();
                if (activeModal === 'medication') handleAddMedication();
              }}
            >
              <Text style={styles.modalSave}>Add</Text>
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
                />
              </View>
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
    ...typography.h4,
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
    marginBottom: spacing.lg,
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
  mobilityOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  mobilityOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  mobilityOptionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentMuted,
  },
  mobilityOptionText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  mobilityOptionTextSelected: {
    color: colors.accent,
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
});
