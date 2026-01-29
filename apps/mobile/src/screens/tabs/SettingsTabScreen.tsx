/**
 * Settings Tab Screen (PRD V1 Spec)
 * App settings, preferences, and account management
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

import { colors, spacing, radius, typography, shadows } from '@/theme';
import { useProfileStore } from '@/store/useProfileStore';
import { useAuthStore } from '@/store/useAuthStore';
import { SYMPTOM_DISCLAIMER } from '@/types/symptomEntry';

type SettingItem = {
  id: string;
  icon: string;
  title: string;
  subtitle?: string;
  type: 'navigate' | 'toggle' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  color?: string;
  danger?: boolean;
};

export default function SettingsTabScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const appSettings = useProfileStore((state) => state.appSettings);
  const updateAppSettings = useProfileStore((state) => state.updateAppSettings);
  const logout = useAuthStore((state) => state.logout);

  // Handle theme change
  const handleThemeChange = () => {
    Alert.alert('Select Theme', 'Choose your preferred theme', [
      { text: 'Light', onPress: () => updateAppSettings({ theme: 'light' }) },
      { text: 'Dark', onPress: () => updateAppSettings({ theme: 'dark' }) },
      { text: 'System Default', onPress: () => updateAppSettings({ theme: 'system' }) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // Handle logout
  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  // Handle contact support
  const handleContactSupport = () => {
    Linking.openURL('mailto:support@carebow.com');
  };

  // Handle privacy policy
  const handlePrivacyPolicy = () => {
    Linking.openURL('https://carebow.com/privacy');
  };

  // Handle terms of service
  const handleTermsOfService = () => {
    Linking.openURL('https://carebow.com/terms');
  };

  // Settings sections
  const settingsSections: { title: string; items: SettingItem[] }[] = [
    {
      title: 'Appearance',
      items: [
        {
          id: 'theme',
          icon: 'color-palette-outline',
          title: 'Theme',
          subtitle: appSettings.theme === 'system' ? 'System Default' : appSettings.theme === 'dark' ? 'Dark' : 'Light',
          type: 'navigate',
          onPress: handleThemeChange,
        },
        {
          id: 'haptics',
          icon: 'phone-portrait-outline',
          title: 'Haptic Feedback',
          type: 'toggle',
          value: appSettings.hapticFeedback,
          onToggle: (value) => updateAppSettings({ hapticFeedback: value }),
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          id: 'notifications',
          icon: 'notifications-outline',
          title: 'Push Notifications',
          type: 'navigate',
          onPress: () => navigation.navigate('Profile' as never, { screen: 'Notifications' } as never),
        },
      ],
    },
    {
      title: 'Privacy & Security',
      items: [
        {
          id: 'privacy',
          icon: 'lock-closed-outline',
          title: 'Privacy Settings',
          type: 'navigate',
          onPress: () => navigation.navigate('Profile' as never, { screen: 'Privacy' } as never),
        },
        {
          id: 'emergency',
          icon: 'warning-outline',
          title: 'Emergency Contacts',
          type: 'navigate',
          color: colors.error,
          onPress: () => navigation.navigate('Profile' as never, { screen: 'EmergencyContacts' } as never),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          icon: 'help-circle-outline',
          title: 'Help & FAQ',
          type: 'navigate',
          onPress: () => navigation.navigate('Profile' as never, { screen: 'Help' } as never),
        },
        {
          id: 'contact',
          icon: 'mail-outline',
          title: 'Contact Support',
          type: 'navigate',
          onPress: handleContactSupport,
        },
      ],
    },
    {
      title: 'Legal',
      items: [
        {
          id: 'privacy_policy',
          icon: 'document-text-outline',
          title: 'Privacy Policy',
          type: 'navigate',
          onPress: handlePrivacyPolicy,
        },
        {
          id: 'terms',
          icon: 'document-outline',
          title: 'Terms of Service',
          type: 'navigate',
          onPress: handleTermsOfService,
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          id: 'logout',
          icon: 'log-out-outline',
          title: 'Log Out',
          type: 'action',
          danger: true,
          onPress: handleLogout,
        },
      ],
    },
  ];

  // Render setting item
  const renderSettingItem = (item: SettingItem, isLast: boolean) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.settingItem, !isLast && styles.settingItemBorder]}
      onPress={item.type !== 'toggle' ? item.onPress : undefined}
      activeOpacity={item.type === 'toggle' ? 1 : 0.7}
      disabled={item.type === 'toggle'}
    >
      <View style={[styles.settingIcon, item.color && { backgroundColor: item.color + '15' }]}>
        <Icon
          name={item.icon}
          size={20}
          color={item.danger ? colors.error : item.color || colors.textSecondary}
        />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, item.danger && styles.settingTitleDanger]}>
          {item.title}
        </Text>
        {item.subtitle && <Text style={styles.settingSubtitle}>{item.subtitle}</Text>}
      </View>
      {item.type === 'toggle' ? (
        <Switch
          value={item.value}
          onValueChange={item.onToggle}
          trackColor={{ false: colors.border, true: colors.accentLight }}
          thumbColor={colors.white}
        />
      ) : item.type === 'navigate' ? (
        <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
      ) : null}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Settings Sections */}
        {settingsSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, index) =>
                renderSettingItem(item, index === section.items.length - 1)
              )}
            </View>
          </View>
        ))}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Icon name="information-circle" size={18} color={colors.textTertiary} />
          <Text style={styles.disclaimerText}>{SYMPTOM_DISCLAIMER.short}</Text>
        </View>

        {/* Version */}
        <Text style={styles.version}>CareBow v1.0.0</Text>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.textPrimary,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },

  // Section
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: spacing.xs,
  },
  sectionContent: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },

  // Setting Item
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  settingItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.surface2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
    gap: 2,
  },
  settingTitle: {
    ...typography.body,
    color: colors.textPrimary,
  },
  settingTitleDanger: {
    color: colors.error,
  },
  settingSubtitle: {
    ...typography.caption,
    color: colors.textTertiary,
  },

  // Disclaimer
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  disclaimerText: {
    flex: 1,
    ...typography.caption,
    color: colors.textTertiary,
  },

  // Version
  version: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
