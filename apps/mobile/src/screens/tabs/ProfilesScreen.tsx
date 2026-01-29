/**
 * Profiles Tab Screen (PRD V1 Spec)
 * Quick access to family profiles with health info overview
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

import { colors, spacing, radius, typography, shadows } from '@/theme';
import { useProfileStore } from '@/store/useProfileStore';
import { RELATIONSHIP_LABELS, type FamilyMember } from '@/types/profile';

export default function ProfilesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const members = useProfileStore((state) => state.members);
  const user = useProfileStore((state) => state.user);

  // Navigate to profile detail
  const handleMemberPress = useCallback(
    (member: FamilyMember) => {
      navigation.navigate('Profile' as never, {
        screen: 'MemberDetails',
        params: { memberId: member.id },
      } as never);
    },
    [navigation]
  );

  // Navigate to add member
  const handleAddMember = useCallback(() => {
    navigation.navigate('Profile' as never, {
      screen: 'MemberDetails',
      params: { memberId: undefined },
    } as never);
  }, [navigation]);

  // Navigate to full profile section
  const handleViewProfile = useCallback(() => {
    navigation.navigate('Profile' as never, {
      screen: 'ProfileIndex',
    } as never);
  }, [navigation]);

  // Get health status summary
  const getHealthSummary = (member: FamilyMember) => {
    const items: string[] = [];
    if (member.healthInfo?.allergies?.length) {
      items.push(`${member.healthInfo.allergies.length} allergies`);
    }
    if (member.healthInfo?.conditions?.length) {
      items.push(`${member.healthInfo.conditions.length} conditions`);
    }
    if (member.healthInfo?.medications?.length) {
      items.push(`${member.healthInfo.medications.length} medications`);
    }
    return items.length > 0 ? items.join(' · ') : 'No health info added';
  };

  // Render member card
  const renderMemberCard = (member: FamilyMember) => {
    const isSelf = member.relationship === 'self';
    const healthSummary = getHealthSummary(member);

    return (
      <TouchableOpacity
        key={member.id}
        style={styles.memberCard}
        onPress={() => handleMemberPress(member)}
        activeOpacity={0.7}
      >
        <View style={[styles.memberAvatar, isSelf && styles.memberAvatarSelf]}>
          <Text style={styles.memberInitial}>
            {member.firstName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.memberInfo}>
          <View style={styles.memberHeader}>
            <Text style={styles.memberName}>
              {member.firstName} {member.lastName}
            </Text>
            {isSelf && (
              <View style={styles.selfBadge}>
                <Text style={styles.selfBadgeText}>You</Text>
              </View>
            )}
          </View>
          <Text style={styles.memberRelation}>
            {RELATIONSHIP_LABELS[member.relationship] || member.relationship}
            {member.age ? ` · ${member.age} years old` : ''}
          </Text>
          <Text style={styles.memberHealth} numberOfLines={1}>
            {healthSummary}
          </Text>
        </View>
        <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profiles</Text>
        <TouchableOpacity style={styles.settingsButton} onPress={handleViewProfile} activeOpacity={0.7}>
          <Icon name="settings-outline" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        {user && (
          <TouchableOpacity
            style={styles.userCard}
            onPress={handleViewProfile}
            activeOpacity={0.7}
          >
            <View style={styles.userAvatar}>
              <Text style={styles.userInitials}>
                {user.firstName?.charAt(0).toUpperCase() || 'U'}
                {user.lastName?.charAt(0).toUpperCase() || ''}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {user.firstName} {user.lastName}
              </Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        )}

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Family Members</Text>
          <Text style={styles.sectionCount}>
            {members.length} {members.length === 1 ? 'member' : 'members'}
          </Text>
        </View>

        {/* Members List */}
        <View style={styles.membersList}>
          {members.map(renderMemberCard)}

          {/* Add Member Button */}
          <TouchableOpacity
            style={styles.addMemberButton}
            onPress={handleAddMember}
            activeOpacity={0.7}
          >
            <View style={styles.addMemberIcon}>
              <Icon name="add" size={24} color={colors.accent} />
            </View>
            <Text style={styles.addMemberText}>Add Family Member</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() =>
                navigation.navigate('Profile' as never, { screen: 'EmergencyContacts' } as never)
              }
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.errorSoft }]}>
                <Icon name="call" size={20} color={colors.error} />
              </View>
              <Text style={styles.quickActionLabel}>Emergency Contacts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() =>
                navigation.navigate('Profile' as never, { screen: 'HealthRecords' } as never)
              }
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.infoSoft }]}>
                <Icon name="document-text" size={20} color={colors.info} />
              </View>
              <Text style={styles.quickActionLabel}>Health Records</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() =>
                navigation.navigate('Profile' as never, { screen: 'Insurance' } as never)
              }
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.successSoft }]}>
                <Icon name="shield-checkmark" size={20} color={colors.success} />
              </View>
              <Text style={styles.quickActionLabel}>Insurance</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() =>
                navigation.navigate('Profile' as never, { screen: 'Addresses' } as never)
              }
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.warningSoft }]}>
                <Icon name="location" size={20} color={colors.warning} />
              </View>
              <Text style={styles.quickActionLabel}>Addresses</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surface2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },

  // User Card
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInitials: {
    ...typography.h2,
    color: colors.white,
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  userEmail: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCount: {
    ...typography.caption,
    color: colors.textTertiary,
  },

  // Members List
  membersList: {
    gap: spacing.sm,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    ...shadows.card,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarSelf: {
    backgroundColor: colors.accent,
  },
  memberInitial: {
    ...typography.h3,
    color: colors.white,
  },
  memberInfo: {
    flex: 1,
    gap: 2,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  memberName: {
    ...typography.label,
    color: colors.textPrimary,
  },
  selfBadge: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  selfBadgeText: {
    ...typography.tiny,
    color: colors.accent,
  },
  memberRelation: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  memberHealth: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Add Member Button
  addMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface2,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    gap: spacing.md,
  },
  addMemberIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMemberText: {
    ...typography.label,
    color: colors.accent,
  },

  // Quick Actions
  quickActions: {
    gap: spacing.sm,
  },
  quickActionsTitle: {
    ...typography.label,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickAction: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionLabel: {
    flex: 1,
    ...typography.labelSmall,
    color: colors.textPrimary,
  },
});
