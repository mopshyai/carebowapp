/**
 * Safety Settings Screen
 * Configure check-in times, location sharing, and escalation
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, radius, typography, shadows } from '@/theme';

import { useSafetyStore, useSafetySettings, useSafetyPermissions } from '../store';
import {
  requestNotificationPermission,
  scheduleCheckInReminder,
  cancelCheckInNotifications,
} from '../services/notificationService';
import { requestLocationPermission, getLocationPermissionStatus } from '../services/locationService';
import { parseTimeToToday, formatScheduledTime, isValidGracePeriod } from '../services/checkInService';

// ============================================
// GRACE PERIOD OPTIONS
// ============================================

const GRACE_PERIOD_OPTIONS = [
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 },
  { label: '4 hours', value: 240 },
];

// ============================================
// COMPONENT
// ============================================

export function SafetySettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  // Store
  const settings = useSafetySettings();
  const permissions = useSafetyPermissions();
  const updateSettings = useSafetyStore((state) => state.updateSettings);
  const updatePermissions = useSafetyStore((state) => state.updatePermissions);
  const clearEvents = useSafetyStore((state) => state.clearEvents);

  // UI State
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showGracePeriodPicker, setShowGracePeriodPicker] = useState(false);

  // Handlers
  const handleToggleCheckIn = useCallback(async (enabled: boolean) => {
    if (enabled) {
      // Request notification permission
      const permission = await requestNotificationPermission();
      updatePermissions({ notifications: permission });

      if (permission !== 'granted') {
        Alert.alert(
          'Notifications Disabled',
          'Daily check-in reminders require notification permission. You can still check in manually.',
          [{ text: 'OK' }]
        );
      }

      // Enable and schedule
      updateSettings({ dailyCheckInEnabled: true });
      await scheduleCheckInReminder({
        checkInTime: settings.dailyCheckInTime,
        gracePeriodMinutes: settings.gracePeriodMinutes,
      });
    } else {
      // Disable and cancel notifications
      updateSettings({ dailyCheckInEnabled: false });
      await cancelCheckInNotifications();
    }
  }, [updateSettings, updatePermissions, settings.dailyCheckInTime, settings.gracePeriodMinutes]);

  const handleTimeChange = useCallback(
    async (event: any, selectedDate?: Date) => {
      if (Platform.OS === 'android') {
        setShowTimePicker(false);
      }

      if (selectedDate) {
        const hours = selectedDate.getHours().toString().padStart(2, '0');
        const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
        const timeString = `${hours}:${minutes}`;

        updateSettings({ dailyCheckInTime: timeString });

        // Reschedule if enabled
        if (settings.dailyCheckInEnabled) {
          await scheduleCheckInReminder({
            checkInTime: timeString,
            gracePeriodMinutes: settings.gracePeriodMinutes,
          });
        }
      }
    },
    [updateSettings, settings.dailyCheckInEnabled, settings.gracePeriodMinutes]
  );

  const handleGracePeriodChange = useCallback(
    async (minutes: number) => {
      updateSettings({ gracePeriodMinutes: minutes });
      setShowGracePeriodPicker(false);

      // Reschedule if enabled
      if (settings.dailyCheckInEnabled) {
        await scheduleCheckInReminder({
          checkInTime: settings.dailyCheckInTime,
          gracePeriodMinutes: minutes,
        });
      }
    },
    [updateSettings, settings.dailyCheckInEnabled, settings.dailyCheckInTime]
  );

  const handleToggleShareLocationSOS = useCallback(async (enabled: boolean) => {
    if (enabled) {
      const permission = await requestLocationPermission();
      updatePermissions({ location: permission });

      if (permission !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'To share your location during SOS, please grant location permission.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    updateSettings({ shareLocationOnSOS: enabled });
  }, [updateSettings, updatePermissions]);

  const handleToggleShareLocationMissed = useCallback(async (enabled: boolean) => {
    if (enabled) {
      const permission = await requestLocationPermission();
      updatePermissions({ location: permission });

      if (permission !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'To share your location during missed check-ins, please grant location permission.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    updateSettings({ shareLocationOnMissedCheckIn: enabled });
  }, [updateSettings, updatePermissions]);

  const handleToggleEscalation = useCallback((enabled: boolean) => {
    updateSettings({ escalationEnabled: enabled });
  }, [updateSettings]);

  const handleClearHistory = useCallback(() => {
    Alert.alert(
      'Clear Safety History',
      'This will remove all recorded safety events. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => clearEvents(),
        },
      ]
    );
  }, [clearEvents]);

  const currentTime = parseTimeToToday(settings.dailyCheckInTime);
  const currentGracePeriod =
    GRACE_PERIOD_OPTIONS.find((o) => o.value === settings.gracePeriodMinutes) ||
    GRACE_PERIOD_OPTIONS[1];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Safety Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
      >
        {/* Daily Check-in Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Check-in</Text>

          <View style={styles.card}>
            {/* Enable Check-in */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Enable daily check-in</Text>
                <Text style={styles.settingDescription}>
                  Get a daily reminder to confirm you're OK
                </Text>
              </View>
              <Switch
                value={settings.dailyCheckInEnabled}
                onValueChange={handleToggleCheckIn}
                trackColor={{ false: colors.border, true: colors.accentSoft }}
                thumbColor={settings.dailyCheckInEnabled ? colors.accent : colors.surface}
              />
            </View>

            {settings.dailyCheckInEnabled && (
              <>
                {/* Check-in Time */}
                <TouchableOpacity
                  style={styles.settingRow}
                  onPress={() => setShowTimePicker(true)}
                >
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>Check-in time</Text>
                    <Text style={styles.settingDescription}>
                      When you'll be reminded to check in
                    </Text>
                  </View>
                  <View style={styles.settingValue}>
                    <Text style={styles.settingValueText}>
                      {formatScheduledTime(settings.dailyCheckInTime)}
                    </Text>
                    <Icon name="chevron-forward" size={16} color={colors.textTertiary} />
                  </View>
                </TouchableOpacity>

                {/* Grace Period */}
                <TouchableOpacity
                  style={styles.settingRow}
                  onPress={() => setShowGracePeriodPicker(true)}
                >
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>Grace period</Text>
                    <Text style={styles.settingDescription}>
                      Time before marking check-in as missed
                    </Text>
                  </View>
                  <View style={styles.settingValue}>
                    <Text style={styles.settingValueText}>{currentGracePeriod.label}</Text>
                    <Icon name="chevron-forward" size={16} color={colors.textTertiary} />
                  </View>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location Sharing</Text>

          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Share location on SOS</Text>
                <Text style={styles.settingDescription}>
                  Include your location when triggering SOS
                </Text>
              </View>
              <Switch
                value={settings.shareLocationOnSOS}
                onValueChange={handleToggleShareLocationSOS}
                trackColor={{ false: colors.border, true: colors.accentSoft }}
                thumbColor={settings.shareLocationOnSOS ? colors.accent : colors.surface}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Share on missed check-in</Text>
                <Text style={styles.settingDescription}>
                  Include location when notifying contacts
                </Text>
              </View>
              <Switch
                value={settings.shareLocationOnMissedCheckIn}
                onValueChange={handleToggleShareLocationMissed}
                trackColor={{ false: colors.border, true: colors.accentSoft }}
                thumbColor={settings.shareLocationOnMissedCheckIn ? colors.accent : colors.surface}
              />
            </View>
          </View>

          <View style={styles.infoCard}>
            <Icon name="information-circle" size={18} color={colors.info} />
            <Text style={styles.infoText}>
              We only request location during SOS or when sharing is enabled. Your location is never tracked continuously.
            </Text>
          </View>
        </View>

        {/* Escalation Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Escalation</Text>

          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Auto-escalate alerts</Text>
                <Text style={styles.settingDescription}>
                  If primary contact doesn't respond, notify all contacts
                </Text>
              </View>
              <Switch
                value={settings.escalationEnabled}
                onValueChange={handleToggleEscalation}
                trackColor={{ false: colors.border, true: colors.accentSoft }}
                thumbColor={settings.escalationEnabled ? colors.accent : colors.surface}
              />
            </View>
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>

          <View style={styles.card}>
            <TouchableOpacity style={styles.settingRow} onPress={handleClearHistory}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.error }]}>
                  Clear safety history
                </Text>
                <Text style={styles.settingDescription}>
                  Remove all recorded safety events
                </Text>
              </View>
              <Icon name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Permission Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Permissions</Text>

          <View style={styles.card}>
            <View style={styles.permissionRow}>
              <View style={styles.permissionIcon}>
                <Icon
                  name="notifications"
                  size={20}
                  color={permissions.notifications === 'granted' ? colors.success : colors.textTertiary}
                />
              </View>
              <Text style={styles.permissionLabel}>Notifications</Text>
              <View
                style={[
                  styles.permissionBadge,
                  {
                    backgroundColor:
                      permissions.notifications === 'granted'
                        ? colors.successSoft
                        : colors.surface2,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.permissionBadgeText,
                    {
                      color:
                        permissions.notifications === 'granted'
                          ? colors.success
                          : colors.textTertiary,
                    },
                  ]}
                >
                  {permissions.notifications === 'granted' ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
            </View>

            <View style={styles.permissionRow}>
              <View style={styles.permissionIcon}>
                <Icon
                  name="location"
                  size={20}
                  color={permissions.location === 'granted' ? colors.success : colors.textTertiary}
                />
              </View>
              <Text style={styles.permissionLabel}>Location</Text>
              <View
                style={[
                  styles.permissionBadge,
                  {
                    backgroundColor:
                      permissions.location === 'granted'
                        ? colors.successSoft
                        : colors.surface2,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.permissionBadgeText,
                    {
                      color:
                        permissions.location === 'granted'
                          ? colors.success
                          : colors.textTertiary,
                    },
                  ]}
                >
                  {permissions.location === 'granted' ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={currentTime}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}

      {/* Grace Period Picker Modal */}
      {showGracePeriodPicker && (
        <View style={styles.pickerOverlay}>
          <View style={[styles.pickerSheet, { paddingBottom: insets.bottom + spacing.lg }]}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Grace Period</Text>
              <TouchableOpacity onPress={() => setShowGracePeriodPicker(false)}>
                <Icon name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            {GRACE_PERIOD_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.pickerOption,
                  option.value === settings.gracePeriodMinutes && styles.pickerOptionSelected,
                ]}
                onPress={() => handleGracePeriodChange(option.value)}
              >
                <Text
                  style={[
                    styles.pickerOptionText,
                    option.value === settings.gracePeriodMinutes && styles.pickerOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {option.value === settings.gracePeriodMinutes && (
                  <Icon name="checkmark" size={20} color={colors.accent} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flex: 1,
    ...typography.h3,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
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
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    ...shadows.card,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
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
    ...typography.body,
    color: colors.textSecondary,
  },
  infoCard: {
    flexDirection: 'row',
    gap: spacing.xs,
    backgroundColor: colors.infoSoft,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.info,
    flex: 1,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  permissionIcon: {
    width: 32,
    marginRight: spacing.sm,
  },
  permissionLabel: {
    ...typography.label,
    flex: 1,
  },
  permissionBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: radius.xs,
  },
  permissionBadgeText: {
    ...typography.tiny,
  },
  // Picker styles
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: spacing.lg,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pickerTitle: {
    ...typography.h3,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
  pickerOptionSelected: {
    backgroundColor: colors.accentMuted,
  },
  pickerOptionText: {
    ...typography.body,
  },
  pickerOptionTextSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
});
