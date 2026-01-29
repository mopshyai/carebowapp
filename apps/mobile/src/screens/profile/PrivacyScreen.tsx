/**
 * Privacy & Security Screen
 * Manage privacy settings and security options
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../../theme';
import { useProfileStore } from '../../store/useProfileStore';

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const settings = useProfileStore((state) => state.privacySettings);
  const updateSettings = useProfileStore((state) => state.updatePrivacySettings);

  const handleToggle = (id: string, value: boolean) => {
    updateSettings({ [id]: value });
  };

  const handleDataExport = () => {
    Alert.alert(
      'Request Data Export',
      'We will prepare a copy of your data and email it to you within 48 hours. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request',
          onPress: () => {
            updateSettings({ dataExportRequestedAt: new Date().toISOString() });
            Alert.alert('Request Submitted', 'You will receive an email with your data within 48 hours.');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm Deletion',
              'Please type DELETE to confirm account deletion.',
              [{ text: 'Cancel', style: 'cancel' }]
            );
          },
        },
      ]
    );
  };

  const securitySettings = [
    {
      id: 'biometricEnabled',
      icon: 'finger-print',
      label: 'Biometric Login',
      description: 'Use Face ID or fingerprint to log in',
      value: settings.biometricEnabled,
    },
    {
      id: 'twoFactorEnabled',
      icon: 'shield-checkmark',
      label: 'Two-Factor Authentication',
      description: 'Extra security for your account',
      value: settings.twoFactorEnabled,
    },
  ];

  const privacySettings = [
    {
      id: 'shareDataWithProviders',
      icon: 'share-social',
      label: 'Share Data with Care Providers',
      description: 'Allow providers to see your health information for better care',
      value: settings.shareDataWithProviders,
    },
    {
      id: 'allowAnalytics',
      icon: 'analytics',
      label: 'Analytics & Improvements',
      description: 'Help improve CareBow by sharing anonymous usage data',
      value: settings.allowAnalytics,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 32 + insets.bottom }]}
      >
        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.sectionCard}>
            {securitySettings.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.settingItem,
                  index < securitySettings.length - 1 && styles.settingItemBorder,
                ]}
              >
                <View style={styles.settingIcon}>
                  <Icon name={item.icon as any} size={20} color={colors.accent} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  <Text style={styles.settingDescription}>{item.description}</Text>
                </View>
                <Switch
                  value={item.value}
                  onValueChange={(value) => handleToggle(item.id, value)}
                  trackColor={{ false: colors.border, true: colors.accentSoft }}
                  thumbColor={item.value ? colors.accent : colors.surface}
                  ios_backgroundColor={colors.border}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <View style={styles.sectionCard}>
            {privacySettings.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.settingItem,
                  index < privacySettings.length - 1 && styles.settingItemBorder,
                ]}
              >
                <View style={styles.settingIcon}>
                  <Icon name={item.icon as any} size={20} color={colors.accent} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  <Text style={styles.settingDescription}>{item.description}</Text>
                </View>
                <Switch
                  value={item.value}
                  onValueChange={(value) => handleToggle(item.id, value)}
                  trackColor={{ false: colors.border, true: colors.accentSoft }}
                  thumbColor={item.value ? colors.accent : colors.surface}
                  ios_backgroundColor={colors.border}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Data</Text>
          <View style={styles.sectionCard}>
            <TouchableOpacity style={styles.actionItem} onPress={handleDataExport}>
              <View style={styles.settingIcon}>
                <Icon name="download-outline" size={20} color={colors.accent} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Export My Data</Text>
                <Text style={styles.settingDescription}>Download a copy of your data</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
            </TouchableOpacity>

            <View style={styles.settingItemBorder} />

            <TouchableOpacity style={styles.actionItem} onPress={handleDeleteAccount}>
              <View style={[styles.settingIcon, { backgroundColor: colors.errorSoft }]}>
                <Icon name="trash-outline" size={20} color={colors.error} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.error }]}>Delete Account</Text>
                <Text style={styles.settingDescription}>Permanently delete your account and data</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Privacy Policy Link */}
        <TouchableOpacity style={styles.linkCard}>
          <View style={styles.linkContent}>
            <Icon name="document-text-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.linkText}>Privacy Policy</Text>
          </View>
          <Icon name="open-outline" size={16} color={colors.textTertiary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkCard}>
          <View style={styles.linkContent}>
            <Icon name="document-text-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.linkText}>Terms of Service</Text>
          </View>
          <Icon name="open-outline" size={16} color={colors.textTertiary} />
        </TouchableOpacity>
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
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.card,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.accentMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    ...typography.label,
    marginBottom: 2,
  },
  settingDescription: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  linkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  linkText: {
    ...typography.label,
    color: colors.textSecondary,
  },
});
