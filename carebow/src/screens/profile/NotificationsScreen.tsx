/**
 * Notifications Screen
 * Manage notification preferences
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../../theme';
import { useProfileStore } from '../../store/useProfileStore';

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const preferences = useProfileStore((state) => state.notificationPreferences);
  const updatePreferences = useProfileStore((state) => state.updateNotificationPreferences);

  const sections = [
    {
      title: 'Push Notifications',
      description: 'Notifications sent to your device',
      items: [
        {
          id: 'pushEnabled',
          label: 'Enable Push Notifications',
          description: 'Master toggle for all push notifications',
          value: preferences.pushEnabled,
        },
        {
          id: 'orderUpdates',
          label: 'Order Updates',
          description: 'Status changes and delivery updates',
          value: preferences.orderUpdates,
          dependsOn: 'pushEnabled',
        },
        {
          id: 'appointmentReminders',
          label: 'Appointment Reminders',
          description: 'Reminders before scheduled appointments',
          value: preferences.appointmentReminders,
          dependsOn: 'pushEnabled',
        },
        {
          id: 'careAlerts',
          label: 'Care Alerts',
          description: 'Important health and care notifications',
          value: preferences.careAlerts,
          dependsOn: 'pushEnabled',
        },
        {
          id: 'promotions',
          label: 'Promotions & Offers',
          description: 'Special deals and discounts',
          value: preferences.promotions,
          dependsOn: 'pushEnabled',
        },
      ],
    },
    {
      title: 'Email Notifications',
      description: 'Notifications sent to your email',
      items: [
        {
          id: 'emailEnabled',
          label: 'Enable Email Notifications',
          description: 'Master toggle for all emails',
          value: preferences.emailEnabled,
        },
        {
          id: 'emailOrderUpdates',
          label: 'Order Confirmations',
          description: 'Receipts and order summaries',
          value: preferences.emailOrderUpdates,
          dependsOn: 'emailEnabled',
        },
        {
          id: 'emailNewsletter',
          label: 'Newsletter',
          description: 'Health tips and CareBow updates',
          value: preferences.emailNewsletter,
          dependsOn: 'emailEnabled',
        },
      ],
    },
    {
      title: 'SMS Notifications',
      description: 'Text messages to your phone',
      items: [
        {
          id: 'smsEnabled',
          label: 'Enable SMS Notifications',
          description: 'Master toggle for all text messages',
          value: preferences.smsEnabled,
        },
        {
          id: 'smsAppointmentReminders',
          label: 'Appointment Reminders',
          description: 'Text reminders before appointments',
          value: preferences.smsAppointmentReminders,
          dependsOn: 'smsEnabled',
        },
        {
          id: 'smsUrgentAlerts',
          label: 'Urgent Alerts',
          description: 'Critical updates that need immediate attention',
          value: preferences.smsUrgentAlerts,
          dependsOn: 'smsEnabled',
        },
      ],
    },
  ];

  const handleToggle = (id: string, value: boolean) => {
    updatePreferences({ [id]: value });
  };

  const isDisabled = (item: { dependsOn?: string }) => {
    if (!item.dependsOn) return false;
    return !preferences[item.dependsOn as keyof typeof preferences];
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 32 + insets.bottom }]}
      >
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionDescription}>{section.description}</Text>
            </View>

            <View style={styles.sectionCard}>
              {section.items.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.settingItem,
                    index < section.items.length - 1 && styles.settingItemBorder,
                    isDisabled(item) && styles.settingItemDisabled,
                  ]}
                >
                  <View style={styles.settingInfo}>
                    <Text
                      style={[
                        styles.settingLabel,
                        isDisabled(item) && styles.settingLabelDisabled,
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Text
                      style={[
                        styles.settingDescription,
                        isDisabled(item) && styles.settingDescriptionDisabled,
                      ]}
                    >
                      {item.description}
                    </Text>
                  </View>
                  <Switch
                    value={item.value}
                    onValueChange={(value) => handleToggle(item.id, value)}
                    disabled={isDisabled(item)}
                    trackColor={{ false: colors.border, true: colors.accentSoft }}
                    thumbColor={item.value ? colors.accent : colors.surface}
                    ios_backgroundColor={colors.border}
                  />
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Info */}
        <View style={styles.infoCard}>
          <Icon name="information-circle" size={20} color={colors.info} />
          <Text style={styles.infoText}>
            You can change these settings at any time. We recommend keeping urgent alerts enabled
            for important care updates.
          </Text>
        </View>
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
  sectionHeader: {
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xxs,
  },
  sectionTitle: {
    ...typography.h4,
    marginBottom: spacing.xxs,
  },
  sectionDescription: {
    ...typography.caption,
    color: colors.textTertiary,
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
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  settingItemDisabled: {
    opacity: 0.5,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    ...typography.label,
    marginBottom: 2,
  },
  settingLabelDisabled: {
    color: colors.textTertiary,
  },
  settingDescription: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  settingDescriptionDisabled: {
    color: colors.textTertiary,
  },
  infoCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.infoSoft,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.info,
    flex: 1,
  },
});
