/**
 * MemberPicker Component
 * Dropdown/selector for family members
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Member } from '../../data/types';
import { colors, spacing, radius, typography, shadows } from '../../theme';

interface MemberPickerProps {
  members: Member[];
  selectedMemberId: string | null;
  onSelectMember: (member: Member) => void;
}

export function MemberPicker({
  members,
  selectedMemberId,
  onSelectMember,
}: MemberPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedMember = members.find((m) => m.id === selectedMemberId);

  const handleSelect = (member: Member) => {
    onSelectMember(member);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.selector, selectedMember && styles.selectorSelected]}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <View style={styles.selectorContent}>
          <View style={[styles.selectorIcon, selectedMember && styles.selectorIconSelected]}>
            <Icon
              name="person"
              size={16}
              color={selectedMember ? colors.accent : colors.textTertiary}
            />
          </View>
          <Text style={[styles.selectorText, selectedMember && styles.selectorTextSelected]}>
            {selectedMember ? selectedMember.name : 'Select patient'}
          </Text>
        </View>
        <Icon name="chevron-down" size={20} color={colors.textTertiary} />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsOpen(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Patient</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)} style={styles.closeButton}>
                <Icon name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.memberList}>
              {members.map((member) => {
                const isSelected = selectedMemberId === member.id;
                return (
                  <TouchableOpacity
                    key={member.id}
                    style={[styles.memberRow, isSelected && styles.memberRowSelected]}
                    onPress={() => handleSelect(member)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.memberInfo}>
                      <View
                        style={[
                          styles.memberAvatar,
                          isSelected && styles.memberAvatarSelected,
                        ]}
                      >
                        <Icon
                          name="person"
                          size={20}
                          color={isSelected ? colors.white : colors.textTertiary}
                        />
                      </View>
                      <View>
                        <Text
                          style={[
                            styles.memberName,
                            isSelected && styles.memberNameSelected,
                          ]}
                        >
                          {member.name}
                        </Text>
                        <Text style={styles.memberRelationship}>
                          {member.relationship.charAt(0).toUpperCase() +
                            member.relationship.slice(1)}
                        </Text>
                      </View>
                    </View>
                    {isSelected && (
                      <Icon name="checkmark-circle" size={24} color={colors.accent} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectorSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentMuted,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  selectorIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.surface2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectorIconSelected: {
    backgroundColor: colors.accentSoft,
  },
  selectorText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  selectorTextSelected: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.h3,
  },
  closeButton: {
    padding: spacing.xs,
  },
  memberList: {
    paddingVertical: spacing.xs,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  memberRowSelected: {
    backgroundColor: colors.accentMuted,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarSelected: {
    backgroundColor: colors.accent,
  },
  memberName: {
    ...typography.label,
  },
  memberNameSelected: {
    color: colors.accent,
  },
  memberRelationship: {
    ...typography.caption,
    marginTop: 2,
  },
});
