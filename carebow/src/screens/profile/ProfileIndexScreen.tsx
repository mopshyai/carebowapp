/**
 * Profile Index Screen
 * Main profile hub with navigation to all profile sections
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { AppNavigationProp } from '../../navigation/types';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../../theme';
import { useProfileStore, useCareReadiness, useSelectedMember } from '../../store/useProfileStore';

type MenuItemId = 'personal' | 'family' | 'addresses' | 'history' | 'records' | 'insurance' | 'notifications' | 'privacy' | 'help';

const menuSections = [
  {
    title: 'Account',
    items: [
      { id: 'personal' as const, icon: 'person-outline', title: 'Personal Information', screen: 'PersonalInfo' },
      { id: 'family' as const, icon: 'people-outline', title: 'Family Members', screen: 'FamilyMembers' },
      { id: 'addresses' as const, icon: 'location-outline', title: 'Care Addresses', screen: 'Addresses' },
    ],
  },
  {
    title: 'Health',
    items: [
      { id: 'history' as const, icon: 'document-text-outline', title: 'Care History', screen: 'CareHistory' },
      { id: 'records' as const, icon: 'folder-outline', title: 'Health Records', screen: 'HealthRecords' },
      { id: 'insurance' as const, icon: 'shield-checkmark-outline', title: 'Insurance', screen: 'Insurance' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { id: 'notifications' as const, icon: 'notifications-outline', title: 'Notifications', screen: 'Notifications' },
      { id: 'privacy' as const, icon: 'lock-closed-outline', title: 'Privacy & Security', screen: 'Privacy' },
      { id: 'help' as const, icon: 'help-circle-outline', title: 'Help & Support', screen: 'Help' },
    ],
  },
];

export default function ProfileIndexScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation() as AppNavigationProp;

  const user = useProfileStore((state) => state.user);
  const members = useProfileStore((state) => state.members);
  const emergencyContacts = useProfileStore((state) => state.emergencyContacts);
  const logout = useProfileStore((state) => state.logout);

  const selectedMember = useSelectedMember();
  const careReadiness = useCareReadiness();

  // Get display name
  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : 'Guest User';

  const displayEmail = user?.email || 'Set up your profile';

  // Get initials
  const initials = user?.firstName
    ? `${user.firstName.charAt(0)}${user.lastName?.charAt(0) || ''}`.toUpperCase()
    : 'GU';

  // Build health info from selected member
  const healthInfo = [
    {
      id: 'allergies',
      icon: 'warning-outline' as const,
      title: 'Allergies',
      value: selectedMember?.healthInfo?.allergies?.length
        ? selectedMember.healthInfo.allergies.map(a => a.name).join(', ')
        : 'Not set',
      color: colors.error,
      screen: 'HealthInfo',
      params: { tab: 'allergies' },
    },
    {
      id: 'conditions',
      icon: 'heart-outline' as const,
      title: 'Conditions',
      value: selectedMember?.healthInfo?.conditions?.length
        ? selectedMember.healthInfo.conditions.map(c => c.name).join(', ')
        : 'Not set',
      color: colors.nursing,
      screen: 'HealthInfo',
      params: { tab: 'conditions' },
    },
    {
      id: 'medications',
      icon: 'medical-outline' as const,
      title: 'Medications',
      value: selectedMember?.healthInfo?.medications?.length
        ? selectedMember.healthInfo.medications.map(m => m.name).join(', ')
        : 'Not set',
      color: colors.info,
      screen: 'HealthInfo',
      params: { tab: 'medications' },
    },
    {
      id: 'emergency',
      icon: 'call-outline' as const,
      title: 'Emergency Contact',
      value: emergencyContacts.length > 0
        ? `${emergencyContacts[0].name} (${emergencyContacts[0].relationship})`
        : 'Not set',
      color: colors.success,
      screen: 'EmergencyContacts',
      params: {},
    },
  ];

  const handleSignOut = () => {
    logout();
    navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Profile', { screen: 'Settings' })}
        >
          <Icon name="settings-outline" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 32 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        <Pressable
          style={({ pressed }) => [styles.userCard, pressed && styles.pressed]}
          onPress={() => navigation.navigate('Profile', { screen: 'PersonalInfo' })}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userEmail}>{displayEmail}</Text>
          </View>
          <View style={styles.editButton}>
            <Icon name="pencil" size={16} color={colors.accent} />
          </View>
        </Pressable>

        {/* Care Readiness */}
        <View style={styles.readinessCard}>
          <View style={styles.readinessHeader}>
            <View>
              <Text style={styles.readinessTitle}>Care Readiness</Text>
              {selectedMember && (
                <Text style={styles.readinessMember}>for {selectedMember.firstName}</Text>
              )}
            </View>
            <Text style={styles.readinessPercentage}>{careReadiness.score}%</Text>
          </View>
          <View style={styles.readinessBar}>
            <View style={[styles.readinessFill, { width: `${careReadiness.score}%` }]} />
          </View>

          {/* Missing Items CTAs */}
          {careReadiness.missingItems.length > 0 && (
            <View style={styles.missingItems}>
              <Text style={styles.missingTitle}>Complete your profile:</Text>
              {careReadiness.missingItems.slice(0, 3).map((item) => (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [styles.missingItem, pressed && styles.pressedLight]}
                  onPress={() => navigation.navigate(item.screen as never, item.params)}
                >
                  <Icon name="add-circle" size={16} color={colors.accent} />
                  <Text style={styles.missingItemText}>{item.label}</Text>
                  <Icon name="chevron-forward" size={14} color={colors.textTertiary} />
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Health Info Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Information</Text>
          <View style={styles.healthGrid}>
            {healthInfo.map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [styles.healthCard, pressed && styles.pressed]}
                onPress={() => navigation.navigate(item.screen as never, item.params)}
              >
                <View style={[styles.healthIcon, { backgroundColor: `${item.color}15` }]}>
                  <Icon name={item.icon} size={20} color={item.color} />
                </View>
                <Text style={styles.healthTitle}>{item.title}</Text>
                <Text
                  style={[
                    styles.healthValue,
                    item.value === 'Not set' && styles.healthValueEmpty,
                  ]}
                  numberOfLines={1}
                >
                  {item.value}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, index) => (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [
                    styles.menuItem,
                    index < section.items.length - 1 && styles.menuItemBorder,
                    pressed && styles.menuItemPressed,
                  ]}
                  onPress={() => navigation.navigate(item.screen as never)}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={styles.menuIconContainer}>
                      <Icon name={item.icon as any} size={20} color={colors.textSecondary} />
                    </View>
                    <Text style={styles.menuItemTitle}>{item.title}</Text>
                  </View>
                  <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {/* Sign Out Button */}
        <Pressable
          style={({ pressed }) => [styles.signOutButton, pressed && styles.signOutPressed]}
          onPress={handleSignOut}
        >
          <Icon name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>

        {/* Version */}
        <Text style={styles.version}>CareBow v1.0.0</Text>
      </ScrollView>
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
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h4,
  },
  settingsButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  userCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  pressedLight: {
    backgroundColor: colors.accentMuted,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textInverse,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...typography.h3,
    marginBottom: spacing.xxs,
  },
  userEmail: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  readinessCard: {
    backgroundColor: colors.accentMuted,
    borderWidth: 1,
    borderColor: colors.accentSoft,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  readinessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  readinessTitle: {
    ...typography.labelLarge,
    color: colors.accentDark,
  },
  readinessMember: {
    ...typography.caption,
    color: colors.accent,
    marginTop: 2,
  },
  readinessPercentage: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.accent,
  },
  readinessBar: {
    height: 8,
    backgroundColor: colors.accentSoft,
    borderRadius: 4,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  readinessFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  missingItems: {
    marginTop: spacing.xs,
  },
  missingTitle: {
    ...typography.caption,
    color: colors.accentDark,
    marginBottom: spacing.xs,
  },
  missingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.sm,
  },
  missingItemText: {
    ...typography.bodySmall,
    color: colors.accent,
    flex: 1,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.labelSmall,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xxs,
  },
  healthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  healthCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.card,
  },
  healthIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  healthTitle: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.xxs,
  },
  healthValue: {
    ...typography.label,
  },
  healthValueEmpty: {
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.card,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 56,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuItemPressed: {
    backgroundColor: colors.surface2,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.surface2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemTitle: {
    ...typography.body,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.errorSoft,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  signOutPressed: {
    opacity: 0.8,
  },
  signOutText: {
    ...typography.label,
    color: colors.error,
  },
  version: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
