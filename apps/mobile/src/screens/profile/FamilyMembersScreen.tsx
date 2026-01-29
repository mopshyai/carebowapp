/**
 * Family Members Screen
 * List, add, edit, and delete family members
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
  FamilyMember,
  Relationship,
  RELATIONSHIP_LABELS,
  Gender,
  createEmptyMemberHealthInfo,
  createEmptyCarePreferences,
  WHY_WE_ASK,
} from '../../types/profile';

const RELATIONSHIP_OPTIONS: { value: Relationship; label: string }[] = [
  { value: 'self', label: 'Self' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'parent', label: 'Parent' },
  { value: 'child', label: 'Child' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'grandparent', label: 'Grandparent' },
  { value: 'grandchild', label: 'Grandchild' },
  { value: 'in_law', label: 'In-law' },
  { value: 'other', label: 'Other' },
];

export default function FamilyMembersScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const members = useProfileStore((state) => state.members);
  const addMember = useProfileStore((state) => state.addMember);
  const deleteMember = useProfileStore((state) => state.deleteMember);
  const setDefaultMember = useProfileStore((state) => state.setDefaultMember);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newRelationship, setNewRelationship] = useState<Relationship>('self');

  const handleAddMember = () => {
    if (!newFirstName.trim()) {
      Alert.alert('Error', 'Please enter a first name');
      return;
    }

    addMember({
      firstName: newFirstName.trim(),
      lastName: newLastName.trim(),
      relationship: newRelationship,
      isDefault: members.length === 0,
      healthInfo: createEmptyMemberHealthInfo(),
      carePreferences: createEmptyCarePreferences(),
    });

    setShowAddModal(false);
    setNewFirstName('');
    setNewLastName('');
    setNewRelationship('self');

    Alert.alert('Success', 'Family member added successfully');
  };

  const handleDeleteMember = (member: FamilyMember) => {
    Alert.alert(
      'Delete Member',
      `Are you sure you want to remove ${member.firstName}? This will also delete their health information.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMember(member.id),
        },
      ]
    );
  };

  const handleSetDefault = (member: FamilyMember) => {
    setDefaultMember(member.id);
    Alert.alert('Success', `${member.firstName} is now the default member`);
  };

  const getProgressColor = (completeness: number) => {
    if (completeness >= 70) return colors.success;
    if (completeness >= 40) return colors.warning;
    return colors.error;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Family Members</Text>
        <TouchableOpacity style={styles.headerButton} onPress={() => setShowAddModal(true)}>
          <Icon name="add" size={24} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 32 + insets.bottom }]}
      >
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Icon name="people" size={20} color={colors.accent} />
          <Text style={styles.infoText}>{WHY_WE_ASK.allergies.replace('Helps prevent unsafe recommendations and ensures providers are aware of potential reactions.', 'Add family members you care for. Their health information helps us provide personalized care recommendations.')}</Text>
        </View>

        {/* Members List */}
        {members.length > 0 ? (
          <View style={styles.membersList}>
            {members.map((member) => (
              <Pressable
                key={member.id}
                style={({ pressed }) => [styles.memberCard, pressed && styles.pressed]}
                onPress={() => navigation.navigate(`/profile/member-details?id=${member.id}` as any)}
              >
                <View style={styles.memberHeader}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>
                      {member.firstName.charAt(0)}
                      {member.lastName?.charAt(0) || ''}
                    </Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <View style={styles.memberNameRow}>
                      <Text style={styles.memberName}>
                        {member.firstName} {member.lastName}
                      </Text>
                      {member.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.memberRelationship}>
                      {RELATIONSHIP_LABELS[member.relationship]}
                    </Text>
                  </View>
                  <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
                </View>

                {/* Profile Completeness */}
                <View style={styles.completenessSection}>
                  <View style={styles.completenessHeader}>
                    <Text style={styles.completenessLabel}>Profile Completeness</Text>
                    <Text
                      style={[
                        styles.completenessValue,
                        { color: getProgressColor(member.profileCompleteness) },
                      ]}
                    >
                      {member.profileCompleteness}%
                    </Text>
                  </View>
                  <View style={styles.completenessBar}>
                    <View
                      style={[
                        styles.completenessFill,
                        {
                          width: `${member.profileCompleteness}%`,
                          backgroundColor: getProgressColor(member.profileCompleteness),
                        },
                      ]}
                    />
                  </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                  {!member.isDefault && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleSetDefault(member)}
                    >
                      <Icon name="star-outline" size={16} color={colors.accent} />
                      <Text style={styles.actionButtonText}>Set as Default</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteMember(member)}
                  >
                    <Icon name="trash-outline" size={16} color={colors.error} />
                    <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Icon name="people-outline" size={48} color={colors.textTertiary} />
            </View>
            <Text style={styles.emptyTitle}>No Family Members</Text>
            <Text style={styles.emptyDescription}>
              Add family members to manage their care and health information
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => setShowAddModal(true)}>
              <Icon name="add" size={20} color={colors.textInverse} />
              <Text style={styles.emptyButtonText}>Add First Member</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Add Member Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Family Member</Text>
            <TouchableOpacity onPress={handleAddMember}>
              <Text style={styles.modalSave}>Add</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.modalForm}>
              {/* First Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                  style={styles.input}
                  value={newFirstName}
                  onChangeText={setNewFirstName}
                  placeholder="Enter first name"
                  placeholderTextColor={colors.textTertiary}
                  autoCapitalize="words"
                  autoFocus
                />
              </View>

              {/* Last Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  value={newLastName}
                  onChangeText={setNewLastName}
                  placeholder="Enter last name"
                  placeholderTextColor={colors.textTertiary}
                  autoCapitalize="words"
                />
              </View>

              {/* Relationship */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Relationship *</Text>
                <View style={styles.relationshipOptions}>
                  {RELATIONSHIP_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.relationshipOption,
                        newRelationship === option.value && styles.relationshipOptionSelected,
                      ]}
                      onPress={() => setNewRelationship(option.value)}
                    >
                      <Text
                        style={[
                          styles.relationshipOptionText,
                          newRelationship === option.value && styles.relationshipOptionTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Why We Ask */}
              <View style={styles.whyWeAskCard}>
                <Icon name="help-circle-outline" size={20} color={colors.info} />
                <View style={styles.whyWeAskContent}>
                  <Text style={styles.whyWeAskTitle}>Why we ask</Text>
                  <Text style={styles.whyWeAskText}>
                    Adding family members helps us provide personalized care for each person. You
                    can add their health information, allergies, and medications for safer care
                    recommendations.
                  </Text>
                </View>
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
  membersList: {
    gap: spacing.md,
  },
  memberCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    ...shadows.card,
  },
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.99 }],
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textInverse,
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  memberName: {
    ...typography.h4,
  },
  defaultBadge: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  defaultBadgeText: {
    ...typography.tiny,
    color: colors.accent,
  },
  memberRelationship: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  completenessSection: {
    marginBottom: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  completenessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  completenessLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  completenessValue: {
    ...typography.labelSmall,
  },
  completenessBar: {
    height: 4,
    backgroundColor: colors.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  completenessFill: {
    height: '100%',
    borderRadius: 2,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.accentMuted,
  },
  actionButtonText: {
    ...typography.caption,
    color: colors.accent,
  },
  deleteButton: {
    backgroundColor: colors.errorSoft,
  },
  deleteButtonText: {
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
  relationshipOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  relationshipOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  relationshipOptionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentMuted,
  },
  relationshipOptionText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  relationshipOptionTextSelected: {
    color: colors.accent,
  },
  whyWeAskCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.infoSoft,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  whyWeAskContent: {
    flex: 1,
  },
  whyWeAskTitle: {
    ...typography.labelSmall,
    color: colors.info,
    marginBottom: spacing.xxs,
  },
  whyWeAskText: {
    ...typography.bodySmall,
    color: colors.info,
  },
});
