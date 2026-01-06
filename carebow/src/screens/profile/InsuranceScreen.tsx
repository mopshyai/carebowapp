/**
 * Insurance Screen
 * Manage insurance information
 */

import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows, components } from '../../theme';
import { useProfileStore } from '../../store/useProfileStore';
import { InsuranceInfo, InsurancePlanType, INSURANCE_PLAN_LABELS, WHY_WE_ASK } from '../../types/profile';

const PLAN_TYPE_OPTIONS: { value: InsurancePlanType; label: string }[] = [
  { value: 'ppo', label: 'PPO' },
  { value: 'hmo', label: 'HMO' },
  { value: 'epo', label: 'EPO' },
  { value: 'pos', label: 'POS' },
  { value: 'hdhp', label: 'HDHP' },
  { value: 'medicare', label: 'Medicare' },
  { value: 'medicaid', label: 'Medicaid' },
  { value: 'other', label: 'Other' },
];

export default function InsuranceScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const insuranceInfo = useProfileStore((state) => state.insuranceInfo);
  const addInsurance = useProfileStore((state) => state.addInsurance);
  const updateInsurance = useProfileStore((state) => state.updateInsurance);
  const deleteInsurance = useProfileStore((state) => state.deleteInsurance);

  const [showModal, setShowModal] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState<InsuranceInfo | null>(null);

  // Form state
  const [providerName, setProviderName] = useState('');
  const [memberId, setMemberId] = useState('');
  const [groupNumber, setGroupNumber] = useState('');
  const [planType, setPlanType] = useState<InsurancePlanType>('ppo');
  const [policyHolderName, setPolicyHolderName] = useState('');
  const [policyHolderRelationship, setPolicyHolderRelationship] = useState('Self');

  const resetForm = () => {
    setProviderName('');
    setMemberId('');
    setGroupNumber('');
    setPlanType('ppo');
    setPolicyHolderName('');
    setPolicyHolderRelationship('Self');
    setEditingInsurance(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (insurance: InsuranceInfo) => {
    setEditingInsurance(insurance);
    setProviderName(insurance.providerName);
    setMemberId(insurance.memberId);
    setGroupNumber(insurance.groupNumber || '');
    setPlanType(insurance.planType);
    setPolicyHolderName(insurance.policyHolderName);
    setPolicyHolderRelationship(insurance.policyHolderRelationship);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!providerName.trim() || !memberId.trim()) {
      Alert.alert('Error', 'Please fill in the required fields');
      return;
    }

    const insuranceData = {
      providerName: providerName.trim(),
      memberId: memberId.trim(),
      groupNumber: groupNumber.trim() || undefined,
      planType,
      policyHolderName: policyHolderName.trim() || 'Self',
      policyHolderRelationship: policyHolderRelationship.trim() || 'Self',
      isActive: true,
    };

    if (editingInsurance) {
      updateInsurance(editingInsurance.id, insuranceData);
      Alert.alert('Success', 'Insurance information updated');
    } else {
      addInsurance(insuranceData);
      Alert.alert('Success', 'Insurance added');
    }

    setShowModal(false);
    resetForm();
  };

  const handleDelete = (insurance: InsuranceInfo) => {
    Alert.alert(
      'Delete Insurance',
      `Are you sure you want to remove ${insurance.providerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteInsurance(insurance.id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Insurance</Text>
        <TouchableOpacity style={styles.headerButton} onPress={openAddModal}>
          <Icon name="add" size={24} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 32 + insets.bottom }]}
      >
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Icon name="shield-checkmark" size={20} color={colors.accent} />
          <Text style={styles.infoText}>{WHY_WE_ASK.insurance}</Text>
        </View>

        {/* Insurance List */}
        {insuranceInfo.length > 0 ? (
          <View style={styles.insuranceList}>
            {insuranceInfo.map((insurance) => (
              <Pressable
                key={insurance.id}
                style={({ pressed }) => [styles.insuranceCard, pressed && styles.pressed]}
                onPress={() => openEditModal(insurance)}
              >
                <View style={styles.insuranceHeader}>
                  <View style={styles.insuranceIcon}>
                    <Icon name="shield-checkmark" size={24} color={colors.accent} />
                  </View>
                  <View style={styles.insuranceInfo}>
                    <Text style={styles.insuranceName}>{insurance.providerName}</Text>
                    <View style={styles.planBadge}>
                      <Text style={styles.planBadgeText}>
                        {INSURANCE_PLAN_LABELS[insurance.planType]}
                      </Text>
                    </View>
                  </View>
                  <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
                </View>

                <View style={styles.insuranceDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Member ID</Text>
                    <Text style={styles.detailValue}>{insurance.memberId}</Text>
                  </View>
                  {insurance.groupNumber && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Group Number</Text>
                      <Text style={styles.detailValue}>{insurance.groupNumber}</Text>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Policy Holder</Text>
                    <Text style={styles.detailValue}>
                      {insurance.policyHolderName} ({insurance.policyHolderRelationship})
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(insurance)}
                >
                  <Icon name="trash-outline" size={16} color={colors.error} />
                  <Text style={styles.deleteButtonText}>Remove</Text>
                </TouchableOpacity>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Icon name="shield-outline" size={48} color={colors.textTertiary} />
            </View>
            <Text style={styles.emptyTitle}>No Insurance Added</Text>
            <Text style={styles.emptyDescription}>
              Adding insurance is optional but may help with coverage verification
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={openAddModal}>
              <Icon name="add" size={20} color={colors.textInverse} />
              <Text style={styles.emptyButtonText}>Add Insurance</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingInsurance ? 'Edit Insurance' : 'Add Insurance'}
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Insurance Provider *</Text>
                <TextInput
                  style={styles.input}
                  value={providerName}
                  onChangeText={setProviderName}
                  placeholder="e.g., Blue Cross Blue Shield"
                  placeholderTextColor={colors.textTertiary}
                  autoFocus
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Member ID *</Text>
                <TextInput
                  style={styles.input}
                  value={memberId}
                  onChangeText={setMemberId}
                  placeholder="Your member ID number"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Group Number (optional)</Text>
                <TextInput
                  style={styles.input}
                  value={groupNumber}
                  onChangeText={setGroupNumber}
                  placeholder="Group number if applicable"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Plan Type</Text>
                <View style={styles.planOptions}>
                  {PLAN_TYPE_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.planOption,
                        planType === option.value && styles.planOptionSelected,
                      ]}
                      onPress={() => setPlanType(option.value)}
                    >
                      <Text
                        style={[
                          styles.planOptionText,
                          planType === option.value && styles.planOptionTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Policy Holder Name</Text>
                <TextInput
                  style={styles.input}
                  value={policyHolderName}
                  onChangeText={setPolicyHolderName}
                  placeholder="Name on the insurance policy"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Relationship to Policy Holder</Text>
                <TextInput
                  style={styles.input}
                  value={policyHolderRelationship}
                  onChangeText={setPolicyHolderRelationship}
                  placeholder="e.g., Self, Spouse, Child"
                  placeholderTextColor={colors.textTertiary}
                />
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
  insuranceList: {
    gap: spacing.md,
  },
  insuranceCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    ...shadows.card,
  },
  pressed: {
    opacity: 0.95,
  },
  insuranceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  insuranceIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.accentMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insuranceInfo: {
    flex: 1,
  },
  insuranceName: {
    ...typography.h4,
    marginBottom: spacing.xxs,
  },
  planBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentSoft,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  planBadgeText: {
    ...typography.tiny,
    color: colors.accent,
  },
  insuranceDetails: {
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xxs,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  detailValue: {
    ...typography.label,
    color: colors.textPrimary,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    paddingVertical: spacing.xs,
    backgroundColor: colors.errorSoft,
    borderRadius: radius.sm,
  },
  deleteButtonText: {
    ...typography.caption,
    color: colors.error,
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
  planOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  planOption: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  planOptionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentMuted,
  },
  planOptionText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  planOptionTextSelected: {
    color: colors.accent,
  },
});
