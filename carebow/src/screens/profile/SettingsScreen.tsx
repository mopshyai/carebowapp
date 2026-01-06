/**
 * Settings Screen
 * App preferences, subscription management, and logout
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

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const appSettings = useProfileStore((state) => state.appSettings);
  const updateAppSettings = useProfileStore((state) => state.updateAppSettings);
  const logout = useProfileStore((state) => state.logout);

  const handleThemeChange = () => {
    Alert.alert('Select Theme', 'Choose your preferred theme', [
      {
        text: 'Light',
        onPress: () => {
          console.log('[Settings] Setting theme to light');
          updateAppSettings({ theme: 'light' });
          Alert.alert('Theme Updated', 'Theme set to Light. Note: Full dark mode UI coming soon!');
        }
      },
      {
        text: 'Dark',
        onPress: () => {
          console.log('[Settings] Setting theme to dark');
          updateAppSettings({ theme: 'dark' });
          Alert.alert('Theme Updated', 'Theme set to Dark. Note: Full dark mode UI coming soon!');
        }
      },
      {
        text: 'System',
        onPress: () => {
          console.log('[Settings] Setting theme to system');
          updateAppSettings({ theme: 'system' });
          Alert.alert('Theme Updated', 'Theme set to System. Note: Full dark mode UI coming soon!');
        }
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleLanguageChange = () => {
    Alert.alert('Select Language', 'Choose your preferred language', [
      {
        text: 'English',
        onPress: () => {
          console.log('[Settings] Setting language to English');
          updateAppSettings({ language: 'en' });
          Alert.alert('Language Updated', 'Language set to English');
        }
      },
      { text: 'Spanish (Coming Soon)', style: 'cancel' },
      { text: 'Hindi (Coming Soon)', style: 'cancel' },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleMeasurementChange = () => {
    const newUnit = appSettings.measurementUnit === 'imperial' ? 'metric' : 'imperial';
    console.log('[Settings] Changing measurement from', appSettings.measurementUnit, 'to', newUnit);
    updateAppSettings({ measurementUnit: newUnit });
    Alert.alert('Updated', `Measurement units set to ${newUnit === 'imperial' ? 'Imperial' : 'Metric'}`);
  };

  const handleUpgrade = () => {
    Alert.alert(
      'Upgrade to Premium',
      'Get unlimited AI health consultations, priority support, and exclusive features for $20/month.',
      [
        { text: 'Maybe Later', style: 'cancel' },
        {
          text: 'Subscribe Now',
          onPress: () => Alert.alert('Coming Soon', 'In-app subscriptions will be available soon!')
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          logout();
          navigation.reset({ index: 0, routes: [{ name: 'Tabs' as never }] });
        },
      },
    ]);
  };

  const getThemeLabel = () => {
    switch (appSettings.theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
      default:
        return 'System';
    }
  };

  const getLanguageLabel = () => {
    switch (appSettings.language) {
      case 'en':
        return 'English';
      case 'es':
        return 'Spanish';
      case 'hi':
        return 'Hindi';
      default:
        return 'English';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 32 + insets.bottom }]}
      >
        {/* App Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          <View style={styles.sectionCard}>
            <TouchableOpacity style={styles.settingItem} onPress={handleThemeChange}>
              <View style={styles.settingIcon}>
                <Icon name="color-palette-outline" size={20} color={colors.accent} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Theme</Text>
                <Text style={styles.settingDescription}>App color scheme</Text>
              </View>
              <View style={styles.settingValue}>
                <Text style={styles.settingValueText}>{getThemeLabel()}</Text>
                <Icon name="chevron-forward" size={16} color={colors.textTertiary} />
              </View>
            </TouchableOpacity>

            <View style={styles.settingItemBorder} />

            <View style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Icon name="phone-portrait-outline" size={20} color={colors.accent} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Haptic Feedback</Text>
                <Text style={styles.settingDescription}>Vibration for taps and actions</Text>
              </View>
              <Switch
                value={appSettings.hapticFeedback}
                onValueChange={(value) => updateAppSettings({ hapticFeedback: value })}
                trackColor={{ false: colors.border, true: colors.accentSoft }}
                thumbColor={appSettings.hapticFeedback ? colors.accent : colors.surface}
                ios_backgroundColor={colors.border}
              />
            </View>

            <View style={styles.settingItemBorder} />

            <TouchableOpacity style={styles.settingItem} onPress={handleLanguageChange}>
              <View style={styles.settingIcon}>
                <Icon name="language-outline" size={20} color={colors.accent} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Language</Text>
                <Text style={styles.settingDescription}>App language</Text>
              </View>
              <View style={styles.settingValue}>
                <Text style={styles.settingValueText}>{getLanguageLabel()}</Text>
                <Icon name="chevron-forward" size={16} color={colors.textTertiary} />
              </View>
            </TouchableOpacity>

            <View style={styles.settingItemBorder} />

            <TouchableOpacity style={styles.settingItem} onPress={handleMeasurementChange}>
              <View style={styles.settingIcon}>
                <Icon name="resize-outline" size={20} color={colors.accent} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Measurement Units</Text>
                <Text style={styles.settingDescription}>Height, weight, etc.</Text>
              </View>
              <View style={styles.settingValue}>
                <Text style={styles.settingValueText}>
                  {appSettings.measurementUnit === 'imperial' ? 'Imperial' : 'Metric'}
                </Text>
                <Icon name="chevron-forward" size={16} color={colors.textTertiary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Subscription */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          <View style={styles.subscriptionCard}>
            <View style={styles.subscriptionHeader}>
              <View style={styles.subscriptionIcon}>
                <Icon name="star" size={24} color={colors.secondary} />
              </View>
              <View style={styles.subscriptionInfo}>
                <Text style={styles.subscriptionPlan}>Free Plan</Text>
                <Text style={styles.subscriptionStatus}>Basic features</Text>
              </View>
            </View>
            <Text style={styles.subscriptionDescription}>
              Upgrade to Ask CareBow Plan for unlimited AI health consultations and priority
              support.
            </Text>
            <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
              <Text style={styles.upgradeButtonText}>Upgrade to Premium - $20/month</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionCard}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('PersonalInfo' as never)}
            >
              <View style={styles.settingIcon}>
                <Icon name="person-outline" size={20} color={colors.accent} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Edit Profile</Text>
                <Text style={styles.settingDescription}>Update your information</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
            </TouchableOpacity>

            <View style={styles.settingItemBorder} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('Privacy' as never)}
            >
              <View style={styles.settingIcon}>
                <Icon name="lock-closed-outline" size={20} color={colors.accent} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Privacy & Security</Text>
                <Text style={styles.settingDescription}>Manage your privacy settings</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
          <Icon name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

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
    marginLeft: spacing.md + 36 + spacing.sm,
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
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  settingValueText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  subscriptionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    ...shadows.card,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  subscriptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionPlan: {
    ...typography.h4,
  },
  subscriptionStatus: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  subscriptionDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  upgradeButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    ...shadows.button,
  },
  upgradeButtonText: {
    ...typography.label,
    color: colors.textInverse,
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
