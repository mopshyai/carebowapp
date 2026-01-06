/**
 * Health Info Screen
 * Quick access to allergies, conditions, and medications for selected member
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
import { useProfileStore, useSelectedMember } from '../../store/useProfileStore';
import { WHY_WE_ASK, Allergy, Condition, Medication } from '../../types/profile';

type TabType = 'allergies' | 'conditions' | 'medications';

export default function HealthInfoScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { tab } = (route.params as { tab?: string }) || {};

  const selectedMember = useSelectedMember();
  const members = useProfileStore((state) => state.members);
  const addAllergy = useProfileStore((state) => state.addAllergy);
  const removeAllergy = useProfileStore((state) => state.removeAllergy);
  const addCondition = useProfileStore((state) => state.addCondition);
  const removeCondition = useProfileStore((state) => state.removeCondition);
  const addMedication = useProfileStore((state) => state.addMedication);
  const removeMedication = useProfileStore((state) => state.removeMedication);

  const [activeTab, setActiveTab] = useState<TabType>((tab as TabType) || 'allergies');
  const [showModal, setShowModal] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [secondInputValue, setSecondInputValue] = useState('');
  const [thirdInputValue, setThirdInputValue] = useState('');

  useEffect(() => {
    if (tab && ['allergies', 'conditions', 'medications'].includes(tab)) {
      setActiveTab(tab as TabType);
    }
  }, [tab]);

  const member = selectedMember || members[0];

  if (!member) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Icon name="people-outline" size={48} color={colors.textTertiary} />
        <Text style={styles.noMemberText}>Add a family member first</Text>
        <TouchableOpacity
          style={styles.addMemberButton}
          onPress={() => navigation.navigate('FamilyMembers' as never)}
        >
          <Text style={styles.addMemberButtonText}>Add Family Member</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const resetForm = () => {
    setInputValue('');
    setSecondInputValue('');
    setThirdInputValue('');
  };

  const handleAdd = () => {
    if (!inputValue.trim()) {
      Alert.alert('Error', 'Please enter a value');
      return;
    }

    switch (activeTab) {
      case 'allergies':
        addAllergy(member.id, {
          name: inputValue.trim(),
          severity: 'moderate',
          notes: secondInputValue.trim(),
        });
        break;
      case 'conditions':
        addCondition(member.id, {
          name: inputValue.trim(),
          status: 'active',
          notes: secondInputValue.trim(),
        });
        break;
      case 'medications':
        addMedication(member.id, {
          name: inputValue.trim(),
          dosage: secondInputValue.trim(),
          frequency: thirdInputValue.trim() || 'As directed',
        });
        break;
    }

    setShowModal(false);
    resetForm();
  };

  const handleRemove = (id: string, name: string) => {
    Alert.alert(
      'Remove Item',
      `Remove "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            switch (activeTab) {
              case 'allergies':
                removeAllergy(member.id, id);
                break;
              case 'conditions':
                removeCondition(member.id, id);
                break;
              case 'medications':
                removeMedication(member.id, id);
                break;
            }
          },
        },
      ]
    );
  };

  const tabConfig = {
    allergies: {
      title: 'Allergies',
      icon: 'warning',
      color: colors.error,
      colorSoft: colors.errorSoft,
      whyWeAsk: WHY_WE_ASK.allergies,
      items: member.healthInfo.allergies,
      placeholder: 'e.g., Penicillin, Peanuts',
      secondLabel: 'Notes (optional)',
      secondPlaceholder: 'Any additional notes',
    },
    conditions: {
      title: 'Conditions',
      icon: 'heart',
      color: colors.nursing,
      colorSoft: colors.nursingSoft,
      whyWeAsk: WHY_WE_ASK.conditions,
      items: member.healthInfo.conditions,
      placeholder: 'e.g., Diabetes, Hypertension',
      secondLabel: 'Notes (optional)',
      secondPlaceholder: 'Any additional notes',
    },
    medications: {
      title: 'Medications',
      icon: 'medical',
      color: colors.info,
      colorSoft: colors.infoSoft,
      whyWeAsk: WHY_WE_ASK.medications,
      items: member.healthInfo.medications,
      placeholder: 'e.g., Lisinopril, Metformin',
      secondLabel: 'Dosage',
      secondPlaceholder: 'e.g., 10mg, 500mg',
    },
  };

  const config = tabConfig[activeTab];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Info</Text>
        <TouchableOpacity style={styles.headerButton} onPress={() => setShowModal(true)}>
          <Icon name="add" size={24} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {/* Member Badge */}
      <View style={styles.memberBadge}>
        <View style={styles.memberAvatar}>
          <Text style={styles.memberAvatarText}>{member.firstName.charAt(0)}</Text>
        </View>
        <Text style={styles.memberName}>{member.firstName}'s Health Info</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {(['allergies', 'conditions', 'medications'] as TabType[]).map((tabId) => (
          <TouchableOpacity
            key={tabId}
            style={[styles.tab, activeTab === tabId && styles.tabActive]}
            onPress={() => setActiveTab(tabId)}
          >
            <Icon
              name={tabConfig[tabId].icon as any}
              size={18}
              color={activeTab === tabId ? colors.accent : colors.textTertiary}
            />
            <Text style={[styles.tabText, activeTab === tabId && styles.tabTextActive]}>
              {tabConfig[tabId].title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 32 + insets.bottom }]}
      >
        {/* Why We Ask */}
        <View style={[styles.whyCard, { backgroundColor: config.colorSoft }]}>
          <Icon name="help-circle" size={20} color={config.color} />
          <View style={styles.whyContent}>
            <Text style={[styles.whyTitle, { color: config.color }]}>Why we ask</Text>
            <Text style={[styles.whyText, { color: config.color }]}>{config.whyWeAsk}</Text>
          </View>
        </View>

        {/* Items List */}
        {config.items.length > 0 ? (
          <View style={styles.itemsList}>
            {config.items.map((item: Allergy | Condition | Medication) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={[styles.itemIcon, { backgroundColor: config.colorSoft }]}>
                  <Icon name={config.icon as any} size={20} color={config.color} />
                </View>
                <View style={styles.itemContent}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemMeta}>
                    {'severity' in item && `Severity: ${item.severity}`}
                    {'status' in item && `Status: ${item.status}`}
                    {'dosage' in item && item.dosage && `${item.dosage}`}
                    {'frequency' in item && item.frequency && ` - ${item.frequency}`}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleRemove(item.id, item.name)}>
                  <Icon name="close-circle" size={24} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Icon name={config.icon as any} size={40} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No {config.title.toLowerCase()} recorded</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
              <Icon name="add" size={20} color={colors.textInverse} />
              <Text style={styles.addButtonText}>Add {config.title.slice(0, -1)}</Text>
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
            <Text style={styles.modalTitle}>Add {config.title.slice(0, -1)}</Text>
            <TouchableOpacity onPress={handleAdd}>
              <Text style={styles.modalSave}>Add</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{config.title.slice(0, -1)} Name *</Text>
                <TextInput
                  style={styles.input}
                  value={inputValue}
                  onChangeText={setInputValue}
                  placeholder={config.placeholder}
                  placeholderTextColor={colors.textTertiary}
                  autoFocus
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{config.secondLabel}</Text>
                <TextInput
                  style={styles.input}
                  value={secondInputValue}
                  onChangeText={setSecondInputValue}
                  placeholder={config.secondPlaceholder}
                  placeholderTextColor={colors.textTertiary}
                />
              </View>

              {activeTab === 'medications' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Frequency</Text>
                  <TextInput
                    style={styles.input}
                    value={thirdInputValue}
                    onChangeText={setThirdInputValue}
                    placeholder="e.g., Once daily, Twice daily"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>
              )}
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMemberText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  addMemberButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  addMemberButtonText: {
    ...typography.label,
    color: colors.textInverse,
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
    ...typography.h4,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textInverse,
  },
  memberName: {
    ...typography.label,
    color: colors.textSecondary,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.xs,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface2,
  },
  tabActive: {
    backgroundColor: colors.accentMuted,
  },
  tabText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  tabTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  whyCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  whyContent: {
    flex: 1,
  },
  whyTitle: {
    ...typography.labelSmall,
    marginBottom: 2,
  },
  whyText: {
    ...typography.bodySmall,
  },
  itemsList: {
    gap: spacing.sm,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.card,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textTertiary,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    ...shadows.button,
  },
  addButtonText: {
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
});
