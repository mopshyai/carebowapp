/**
 * Family Screen - Care Collaboration System
 * Coordinates care recipients, caregivers, roles, permissions, and family collaboration:
 * - Care Recipients (Switching, adding loved ones)
 * - Care Team Roles (Primary Caregiver, Caregiver, Family Member, Authorized Viewer)
 * - Permission Scoping
 * - Secure Caregiver Invitations & Revocation
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'react-native-haptic-feedback';
import { useAuthStore } from '../../store/useAuthStore';
import { useProfileStore } from '../../store/useProfileStore';
import { useCareStore } from '../../store/useCareStore';
import { useSelectedPersonContext } from '../../hooks/useSelectedPersonContext';
import { AppIcon } from '../../components/icons/AppIcon';
import { colors, radius, spacing } from '../../theme';
import type { FamilyRole, CaregiverCollaborator } from '../../types/care';
import { FAMILY_ROLE_LABELS, ROLE_DEFAULT_PERMISSIONS } from '../../types/care';
import type { Relationship } from '../../types/profile';

export default function FamilyScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const user = useAuthStore((state) => state.user);

  const { selectedPersonId, displayName, allPersons, selectPerson } = useSelectedPersonContext();

  const addMember = useProfileStore((state) => state.addMember);
  const collaborators = useCareStore((state) => state.collaborators);
  const inviteCollaborator = useCareStore((state) => state.inviteCollaborator);
  const removeCollaborator = useCareStore((state) => state.removeCollaborator);

  // Invite Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteRelation] = useState<Relationship>('sibling');
  const [inviteRole, setInviteRole] = useState<FamilyRole>('caregiver');

  // Add Care Recipient Modal State
  const [showAddPersonModal, setShowAddPersonModal] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonRel, setNewPersonRel] = useState<Relationship>('parent');

  // Selected collaborator for details/permissions
  const [selectedCollab, setSelectedCollab] = useState<CaregiverCollaborator | null>(null);

  // Collaborators for current selected person
  const personCollaborators = useMemo(() => {
    if (!selectedPersonId) return [];
    return collaborators.filter((c) => c.personId === selectedPersonId);
  }, [collaborators, selectedPersonId]);

  const handleSendInvite = useCallback(() => {
    if (!inviteName.trim() || !selectedPersonId) return;
    Haptics.trigger('notificationSuccess');

    inviteCollaborator({
      personId: selectedPersonId,
      name: inviteName.trim(),
      email: inviteEmail.trim() || undefined,
      phone: invitePhone.trim() || undefined,
      relationship: inviteRelation,
      role: inviteRole,
      permissions: ROLE_DEFAULT_PERMISSIONS[inviteRole],
    });

    setInviteName('');
    setInviteEmail('');
    setInvitePhone('');
    setShowInviteModal(false);

    Alert.alert(
      'Invitation Sent',
      `${inviteName.trim()} has been invited to coordinate care for ${displayName} as a ${FAMILY_ROLE_LABELS[inviteRole]}.`
    );
  }, [
    inviteName,
    inviteEmail,
    invitePhone,
    inviteRelation,
    inviteRole,
    selectedPersonId,
    displayName,
    inviteCollaborator,
  ]);

  const handleAddPerson = useCallback(() => {
    if (!newPersonName.trim()) return;
    Haptics.trigger('notificationSuccess');

    const created = addMember({
      firstName: newPersonName.trim(),
      lastName: '',
      relationship: newPersonRel,
      isDefault: false,
      healthInfo: {
        allergies: [],
        conditions: [],
        medications: [],
        mobilityStatus: 'fully_mobile',
      },
      carePreferences: {
        preferredLanguage: 'English',
        preferredCareType: ['home_care'],
      },
    });

    selectPerson(created.id);
    setNewPersonName('');
    setShowAddPersonModal(false);

    Alert.alert(
      'Care Recipient Added',
      `${newPersonName.trim()} is now selected as your active care recipient.`
    );
  }, [newPersonName, newPersonRel, addMember, selectPerson]);

  const handleRevokeAccess = useCallback(
    (collabId: string, name: string) => {
      Alert.alert(
        'Revoke Access',
        `Are you sure you want to remove ${name} from ${displayName}'s care team?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Revoke Access',
            style: 'destructive',
            onPress: () => {
              Haptics.trigger('notificationWarning');
              removeCollaborator(collabId);
              setSelectedCollab(null);
            },
          },
        ]
      );
    },
    [displayName, removeCollaborator]
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerContext}>FAMILY & COLLABORATION</Text>
          <Text style={styles.headerTitle}>Care Coordination</Text>
        </View>

        <Pressable
          style={styles.avatarButton}
          onPress={() => navigation.navigate('Profile', { screen: 'ProfileIndex' })}
        >
          <AppIcon name="settings" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* CARE RECIPIENTS SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>CARE RECIPIENTS</Text>
          <Pressable
            onPress={() => {
              Haptics.trigger('impactLight');
              setShowAddPersonModal(true);
            }}
            hitSlop={8}
          >
            <Text style={styles.sectionLink}>+ Add Person</Text>
          </Pressable>
        </View>

        <View style={styles.recipientsList}>
          {allPersons.map((p) => {
            const isSelected = p.id === selectedPersonId;
            const name =
              p.relationship === 'self'
                ? 'Myself'
                : p.relationship === 'parent'
                  ? p.firstName.toLowerCase().includes('mom') || p.gender === 'female'
                    ? 'Mom'
                    : 'Dad'
                  : p.firstName;

            return (
              <Pressable
                key={p.id}
                style={[styles.recipientCard, isSelected && styles.recipientCardSelected]}
                onPress={() => {
                  Haptics.trigger('impactMedium');
                  selectPerson(p.id);
                }}
                accessibilityRole="button"
                accessibilityLabel={`${name}. ${isSelected ? 'Currently selected' : 'Tap to select'}`}
              >
                <View style={styles.recipientAvatar}>
                  <Text style={styles.recipientAvatarText}>{name.charAt(0).toUpperCase()}</Text>
                </View>

                <View style={styles.recipientInfo}>
                  <Text style={styles.recipientName}>{name}</Text>
                  <Text style={styles.recipientRel}>{p.relationship.toUpperCase()}</Text>
                </View>

                {isSelected ? (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>ACTIVE CARE</Text>
                  </View>
                ) : (
                  <Text style={styles.selectText}>Switch</Text>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* CARE TEAM SECTION FOR SELECTED PERSON */}
        <View style={[styles.sectionHeader, { marginTop: spacing.md }]}>
          <Text style={styles.sectionTitle}>{displayName.toUpperCase()}'S CARE TEAM</Text>
          <Pressable
            onPress={() => {
              Haptics.trigger('impactLight');
              setShowInviteModal(true);
            }}
            hitSlop={8}
          >
            <Text style={styles.sectionLink}>+ Invite Member</Text>
          </Pressable>
        </View>

        <View style={styles.teamContainer}>
          {/* Primary Caregiver (User) */}
          <View style={styles.teamCard}>
            <View style={styles.teamTop}>
              <View style={styles.collabAvatar}>
                <Text style={styles.collabAvatarText}>
                  {(user?.firstName?.charAt(0) || 'Y').toUpperCase()}
                </Text>
              </View>
              <View style={styles.collabInfo}>
                <Text style={styles.collabName}>{user?.firstName || 'You'} (You)</Text>
                <Text style={styles.collabRole}>Primary Caregiver</Text>
              </View>
              <View style={styles.rolePillPrimary}>
                <Text style={styles.rolePillPrimaryText}>Full Access</Text>
              </View>
            </View>
            <Text style={styles.permissionSnippet}>
              Can manage all care plans, episodes, tasks, medications, and invite team members.
            </Text>
          </View>

          {/* Invited Collaborators */}
          {personCollaborators.length === 0 ? (
            <View style={styles.emptyCollabCard}>
              <AppIcon name="companionship" size={24} color={colors.accent} />
              <Text style={styles.emptyCollabTitle}>No other family members invited yet</Text>
              <Text style={styles.emptyCollabSub}>
                Invite siblings, spouse, adult children, or other family caregivers to stay updated
                and share care tasks.
              </Text>
              <Pressable style={styles.inviteFirstBtn} onPress={() => setShowInviteModal(true)}>
                <Text style={styles.inviteFirstBtnText}>Invite Family Member</Text>
              </Pressable>
            </View>
          ) : (
            personCollaborators.map((c) => (
              <Pressable key={c.id} style={styles.teamCard} onPress={() => setSelectedCollab(c)}>
                <View style={styles.teamTop}>
                  <View style={[styles.collabAvatar, { backgroundColor: '#EDE9FE' }]}>
                    <Text style={[styles.collabAvatarText, { color: '#7C3AED' }]}>
                      {c.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.collabInfo}>
                    <Text style={styles.collabName}>{c.name}</Text>
                    <Text style={styles.collabRole}>
                      {FAMILY_ROLE_LABELS[c.role]} ({c.relationship})
                    </Text>
                  </View>
                  <View style={styles.rolePillSecondary}>
                    <Text style={styles.rolePillSecondaryText}>{c.status.toUpperCase()}</Text>
                  </View>
                </View>

                <View style={styles.scopesRow}>
                  {c.permissions.slice(0, 4).map((p) => (
                    <View key={p} style={styles.scopeTag}>
                      <Text style={styles.scopeTagText}>{p}</Text>
                    </View>
                  ))}
                  {c.permissions.length > 4 ? (
                    <Text style={styles.moreScopesText}>+{c.permissions.length - 4} more</Text>
                  ) : null}
                </View>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>

      {/* INVITE CAREGIVER MODAL */}
      <Modal
        visible={showInviteModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowInviteModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowInviteModal(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Invite Caregiver</Text>
            <Text style={styles.modalSub}>
              Give a family member secure access to coordinate {displayName}'s care.
            </Text>

            <TextInput
              style={styles.inputField}
              placeholder="Full Name (e.g. Priya Sharma)"
              placeholderTextColor={colors.textTertiary}
              value={inviteName}
              onChangeText={setInviteName}
            />

            <TextInput
              style={styles.inputField}
              placeholder="Email address (optional)"
              placeholderTextColor={colors.textTertiary}
              value={inviteEmail}
              onChangeText={setInviteEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.inputField}
              placeholder="Phone number (optional)"
              placeholderTextColor={colors.textTertiary}
              value={invitePhone}
              onChangeText={setInvitePhone}
              keyboardType="phone-pad"
            />

            <Text style={styles.fieldLabel}>ROLE PRESET</Text>
            <View style={styles.roleSelectCol}>
              {(
                [
                  {
                    role: 'caregiver',
                    label: 'Caregiver',
                    desc: 'Can complete tasks, log updates, view meds & appointments',
                  },
                  {
                    role: 'family_member',
                    label: 'Family Member',
                    desc: 'Can view timeline and add updates',
                  },
                  {
                    role: 'authorized_viewer',
                    label: 'Authorized Viewer',
                    desc: 'Read-only access to care progress',
                  },
                ] as const
              ).map((item) => (
                <Pressable
                  key={item.role}
                  style={[
                    styles.roleCardOption,
                    inviteRole === item.role && styles.roleCardOptionActive,
                  ]}
                  onPress={() => setInviteRole(item.role)}
                >
                  <Text
                    style={[
                      styles.roleCardTitle,
                      inviteRole === item.role && styles.roleCardTitleActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                  <Text style={styles.roleCardDesc}>{item.desc}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.modalBtnRow}>
              <Pressable style={styles.cancelBtn} onPress={() => setShowInviteModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.saveBtn, !inviteName.trim() && styles.saveBtnDisabled]}
                onPress={handleSendInvite}
                disabled={!inviteName.trim()}
              >
                <Text style={styles.saveBtnText}>Send Invite</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ADD RECIPIENT MODAL */}
      <Modal
        visible={showAddPersonModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddPersonModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowAddPersonModal(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Add Care Recipient</Text>
            <Text style={styles.modalSub}>Who would you like to coordinate care for?</Text>

            <TextInput
              style={styles.inputField}
              placeholder="Name (e.g. Mom, Robert, Grandma)"
              placeholderTextColor={colors.textTertiary}
              value={newPersonName}
              onChangeText={setNewPersonName}
            />

            <Text style={styles.fieldLabel}>RELATIONSHIP</Text>
            <View style={styles.relPills}>
              {(['parent', 'spouse', 'child', 'grandparent', 'other'] as Relationship[]).map(
                (rel) => (
                  <Pressable
                    key={rel}
                    style={[styles.relPill, newPersonRel === rel && styles.relPillActive]}
                    onPress={() => setNewPersonRel(rel)}
                  >
                    <Text
                      style={[styles.relPillText, newPersonRel === rel && styles.relPillTextActive]}
                    >
                      {rel.toUpperCase()}
                    </Text>
                  </Pressable>
                )
              )}
            </View>

            <View style={styles.modalBtnRow}>
              <Pressable style={styles.cancelBtn} onPress={() => setShowAddPersonModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.saveBtn, !newPersonName.trim() && styles.saveBtnDisabled]}
                onPress={handleAddPerson}
                disabled={!newPersonName.trim()}
              >
                <Text style={styles.saveBtnText}>Save Person</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* COLLABORATOR DETAILS MODAL */}
      <Modal
        visible={!!selectedCollab}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedCollab(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedCollab(null)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            {selectedCollab ? (
              <>
                <Text style={styles.modalTitle}>{selectedCollab.name}</Text>
                <Text style={styles.modalSub}>Role: {FAMILY_ROLE_LABELS[selectedCollab.role]}</Text>

                <Text style={styles.fieldLabel}>GRANTED PERMISSIONS</Text>
                <View style={styles.permissionsGrid}>
                  {selectedCollab.permissions.map((p) => (
                    <View key={p} style={styles.permPill}>
                      <AppIcon name="check" size={12} color={colors.accent} />
                      <Text style={styles.permPillText}>{p.replace(/_/g, ' ')}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.dangerRow}>
                  <Pressable
                    style={styles.revokeBtn}
                    onPress={() => handleRevokeAccess(selectedCollab.id, selectedCollab.name)}
                  >
                    <Text style={styles.revokeBtnText}>Revoke Care Access</Text>
                  </Pressable>
                </View>
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerContext: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textTertiary,
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textTertiary,
    letterSpacing: 0.8,
  },
  sectionLink: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
  },
  recipientsList: {
    gap: spacing.sm,
  },
  recipientCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  recipientCardSelected: {
    borderColor: colors.accent,
    backgroundColor: '#F0FDFA',
  },
  recipientAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipientAvatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.accent,
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  recipientRel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textTertiary,
    marginTop: 2,
  },
  activeBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  activeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  selectText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  teamContainer: {
    gap: spacing.sm,
  },
  teamCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  teamTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  collabAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  collabAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accent,
  },
  collabInfo: {
    flex: 1,
  },
  collabName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  collabRole: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rolePillPrimary: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  rolePillPrimaryText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accent,
  },
  rolePillSecondary: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  rolePillSecondaryText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  permissionSnippet: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 16,
  },
  scopesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  scopeTag: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  scopeTagText: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  moreScopesText: {
    fontSize: 10,
    color: colors.textTertiary,
  },
  emptyCollabCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    gap: spacing.xs,
  },
  emptyCollabTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  emptyCollabSub: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  inviteFirstBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  inviteFirstBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 440,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textTertiary,
    letterSpacing: 0.8,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  roleSelectCol: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  roleCardOption: {
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: radius.md,
  },
  roleCardOptionActive: {
    borderColor: colors.accent,
    backgroundColor: '#F0FDFA',
  },
  roleCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  roleCardTitleActive: {
    color: colors.accent,
  },
  roleCardDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  relPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  relPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: '#F1F5F9',
  },
  relPillActive: {
    backgroundColor: colors.accent,
  },
  relPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  relPillTextActive: {
    color: '#FFFFFF',
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cancelBtnText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  saveBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  permissionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: spacing.sm,
  },
  permPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  permPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.accent,
  },
  dangerRow: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  revokeBtn: {
    backgroundColor: '#FEF2F2',
    paddingVertical: 10,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  revokeBtnText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
  },
});
