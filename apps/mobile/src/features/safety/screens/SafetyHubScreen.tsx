/**
 * Safety Hub Screen
 * Main entry point for Emergency & Safety feature
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, space, radius, typography, shadows, layout } from '@/theme/tokens';
import { useProfileStore } from '@/store/useProfileStore';
import { safetyApi, getDeviceTimezone } from '@/services/api/endpoints/safety';

import {
  useSafetyStore,
  useSafetySettings,
  useSafetyContacts,
  useSafetyEvents,
  usePrimaryContact,
} from '../store';
import {
  getCheckInState,
  shouldPromptMissedCheckIn,
  alreadyRecordedMissedCheckIn,
} from '../services/checkInService';
import {
  requestNotificationPermission,
  scheduleCheckInReminder,
} from '../services/notificationService';
import { LocationData } from '../services/locationService';

import {
  SOSButton,
  CheckInModule,
  SafetyContactCard,
  EmptyContactsState,
  SafetyEventItem,
  EmptyEventsState,
  SOSConfirmationSheet,
  MissedCheckInModal,
} from '../components';

// ============================================
// COMPONENT
// ============================================

export function SafetyHubScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  // Store hooks
  const settings = useSafetySettings();
  const contacts = useSafetyContacts();
  const allEvents = useSafetyEvents();
  const events = allEvents.slice(0, 10); // Get last 10 events
  const primaryContact = usePrimaryContact();
  const user = useProfileStore((state) => state.user);
  const userName = user?.firstName || 'You';

  // Store actions
  const recordCheckIn = useSafetyStore((state) => state.recordCheckIn);
  const recordMissedCheckIn = useSafetyStore((state) => state.recordMissedCheckIn);
  const triggerSOS = useSafetyStore((state) => state.triggerSOS);
  const addEvent = useSafetyStore((state) => state.addEvent);

  // UI state
  const [showSOSSheet, setShowSOSSheet] = useState(false);
  const [showMissedCheckInModal, setShowMissedCheckInModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Reconcile local display state from the schedule/check-in the backend will
   * actually enforce. Old builds persisted this feature only on-device; those
   * values must not remain authoritative after server-backed escalation ships.
   */
  const syncServerCheckIn = useCallback(async () => {
    const response = await safetyApi.getDailyCheckIn();
    if (!response?.success || !response.settings) return false;

    const serverCheckIn = response.checkIn;
    const completedAt =
      serverCheckIn?.completedAt ?? serverCheckIn?.checkedInAt ??
      (serverCheckIn?.status === 'COMPLETED' ? serverCheckIn?.updatedAt : null);
    const missedAt =
      serverCheckIn?.status === 'MISSED'
        ? serverCheckIn?.updatedAt ?? response.deadlineAt ?? new Date().toISOString()
        : null;

    useSafetyStore.setState((state) => ({
      settings: {
        ...state.settings,
        dailyCheckInEnabled: response.settings!.enabled,
        dailyCheckInTime: response.settings!.time,
        gracePeriodMinutes: response.settings!.gracePeriodMinutes,
        ...(completedAt ? { lastCheckInAt: completedAt } : {}),
        ...(missedAt ? { lastMissedCheckInAt: missedAt } : {}),
      },
    }));
    return true;
  }, []);

  // Server state wins on entry. This also repairs old local-only installs.
  useEffect(() => {
    void syncServerCheckIn();
  }, [syncServerCheckIn]);

  // Check for missed check-in after server reconciliation/local state changes.
  useEffect(() => {
    if (
      settings.dailyCheckInEnabled &&
      shouldPromptMissedCheckIn(settings) &&
      !alreadyRecordedMissedCheckIn(settings)
    ) {
      setShowMissedCheckInModal(true);
    }
  }, [settings]);

  // Derived state
  const checkInState = getCheckInState(settings);

  // Handlers
  const handleSOSPress = useCallback(() => {
    setShowSOSSheet(true);
  }, []);

  const handleSOSTriggered = useCallback(
    (location: LocationData | null) => {
      triggerSOS({
        location: location
          ? { lat: location.lat, lng: location.lng, accuracy: location.accuracy }
          : undefined,
      });
    },
    [triggerSOS]
  );

  const handleCheckIn = useCallback(async () => {
    const response = await safetyApi.completeDailyCheckIn();
    if (!response?.success) {
      Alert.alert(
        'Check-in not confirmed',
        'CareBow could not confirm your check-in with the server. Please check your connection and try again.'
      );
      return;
    }

    recordCheckIn();
    setShowMissedCheckInModal(false);
  }, [recordCheckIn]);

  const handleEnableCheckIn = useCallback(async () => {
    // Request notification permission for the local reminder. Server-side
    // missed-check-in escalation does not depend on this permission.
    const permission = await requestNotificationPermission();

    const response = await safetyApi.saveDailyCheckInSettings({
      enabled: true,
      time: settings.dailyCheckInTime,
      gracePeriodMinutes: settings.gracePeriodMinutes,
      timezone: getDeviceTimezone(),
    });

    if (!response?.success || !response.settings) {
      Alert.alert(
        'Could not enable daily check-in',
        response?.error ||
          'CareBow could not save the safety schedule. Daily check-in was not enabled.'
      );
      return;
    }

    // Only claim enabled after the server has accepted the schedule.
    useSafetyStore.setState((state) => ({
      settings: {
        ...state.settings,
        dailyCheckInEnabled: response.settings!.enabled,
        dailyCheckInTime: response.settings!.time,
        gracePeriodMinutes: response.settings!.gracePeriodMinutes,
      },
    }));

    if (permission === 'granted') {
      await scheduleCheckInReminder({
        checkInTime: response.settings.time,
        gracePeriodMinutes: response.settings.gracePeriodMinutes,
      });
    }
  }, [settings.dailyCheckInTime, settings.gracePeriodMinutes]);

  const handleMissedCheckInNotify = useCallback(() => {
    // Server escalation is automatic. This callback only records that the
    // user explicitly requested an additional device-side contact alert.
    recordMissedCheckIn();
    addEvent('TEST_ALERT_SENT', { note: 'Additional missed check-in contact alert requested' });
  }, [recordMissedCheckIn, addEvent]);

  const handleMissedCheckInOK = useCallback(() => {
    void handleCheckIn();
  }, [handleCheckIn]);

  const handleManageContacts = useCallback(() => {
    navigation.navigate('SafetyContacts');
  }, [navigation]);

  const handleOpenSettings = useCallback(() => {
    navigation.navigate('SafetySettings');
  }, [navigation]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await syncServerCheckIn();
    setRefreshing(false);
  }, [syncServerCheckIn]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + space.sm }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Safety</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.settingsButton} onPress={handleOpenSettings}>
            <Icon name="settings-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + space.xl }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* SOS Section */}
        <View style={styles.sosSection}>
          <SOSButton onPress={handleSOSPress} />
        </View>

        {/* Check-in Module */}
        <View style={styles.section}>
          <CheckInModule
            state={checkInState}
            enabled={settings.dailyCheckInEnabled}
            onCheckIn={handleCheckIn}
            onEnableCheckIn={handleEnableCheckIn}
          />
        </View>

        {/* Emergency Contacts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Emergency Contacts</Text>
            {contacts.length > 0 && (
              <TouchableOpacity onPress={handleManageContacts}>
                <Text style={styles.sectionAction}>Manage</Text>
              </TouchableOpacity>
            )}
          </View>

          {contacts.length > 0 ? (
            <View style={styles.contactsList}>
              {contacts.slice(0, 3).map((contact) => (
                <SafetyContactCard
                  key={contact.id}
                  contact={contact}
                  compact
                  onPress={handleManageContacts}
                />
              ))}
              {contacts.length > 3 && (
                <TouchableOpacity style={styles.viewAllButton} onPress={handleManageContacts}>
                  <Text style={styles.viewAllText}>View all {contacts.length} contacts</Text>
                  <Icon name="chevron-forward" size={16} color={colors.primary.default} />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <EmptyContactsState onAdd={handleManageContacts} />
          )}
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
          </View>

          <View style={styles.activityCard}>
            {events.length > 0 ? (
              events.map((event) => <SafetyEventItem key={event.id} event={event} />)
            ) : (
              <EmptyEventsState />
            )}
          </View>
        </View>

        {/* Privacy Note */}
        <View style={styles.privacyNote}>
          <Icon name="shield-checkmark-outline" size={16} color={colors.text.tertiary} />
          <Text style={styles.privacyText}>
            We only request location during SOS or when enabled in settings.
          </Text>
        </View>
      </ScrollView>

      {/* SOS Confirmation Sheet */}
      <SOSConfirmationSheet
        visible={showSOSSheet}
        onClose={() => setShowSOSSheet(false)}
        onSOSTriggered={handleSOSTriggered}
        contacts={contacts}
        primaryContact={primaryContact}
        shareLocationDefault={settings.shareLocationOnSOS}
        userName={userName}
      />

      {/* Missed Check-In Modal */}
      <MissedCheckInModal
        visible={showMissedCheckInModal}
        onClose={() => setShowMissedCheckInModal(false)}
        onCheckIn={handleMissedCheckInOK}
        onNotifyContacts={handleMissedCheckInNotify}
        contacts={contacts}
        shareLocation={settings.shareLocationOnMissedCheckIn}
        userName={userName}
      />
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.md,
    paddingBottom: space.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerLeft: {
    width: layout.touchTargetMin,
  },
  headerRight: {
    width: layout.touchTargetMin,
    alignItems: 'flex-end',
  },
  backButton: {
    width: layout.touchTargetMin,
    height: layout.touchTargetMin,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButton: {
    width: layout.touchTargetMin,
    height: layout.touchTargetMin,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.sectionHeader,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: layout.screenPaddingHorizontal,
  },
  sosSection: {
    alignItems: 'center',
    marginBottom: space.lg,
  },
  section: {
    marginBottom: space.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.sm,
  },
  sectionTitle: {
    ...typography.sectionHeaderSmall,
    color: colors.text.primary,
  },
  sectionAction: {
    ...typography.label,
    color: colors.primary.default,
  },
  contactsList: {
    gap: space.xs,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xxs,
    paddingVertical: space.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
  },
  viewAllText: {
    ...typography.label,
    color: colors.primary.default,
  },
  activityCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.md,
    ...shadows.card,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    justifyContent: 'center',
    paddingTop: space.md,
  },
  privacyText: {
    ...typography.caption,
    color: colors.text.tertiary,
    flex: 1,
    textAlign: 'center',
  },
});
