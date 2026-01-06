/**
 * Safety Hub Screen
 * Main entry point for Emergency & Safety feature
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
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
import { colors, spacing, radius, typography, shadows } from '@/theme';

import {
  useSafetyStore,
  useSafetySettings,
  useSafetyContacts,
  useSafetyEvents,
  usePrimaryContact,
  useHasCheckedInToday,
} from '../store';
import { getCheckInState, shouldPromptMissedCheckIn, alreadyRecordedMissedCheckIn } from '../services/checkInService';
import { requestNotificationPermission, scheduleCheckInReminder } from '../services/notificationService';
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
  const hasCheckedInToday = useHasCheckedInToday();

  // Store actions
  const recordCheckIn = useSafetyStore((state) => state.recordCheckIn);
  const recordMissedCheckIn = useSafetyStore((state) => state.recordMissedCheckIn);
  const triggerSOS = useSafetyStore((state) => state.triggerSOS);
  const addEvent = useSafetyStore((state) => state.addEvent);
  const updateSettings = useSafetyStore((state) => state.updateSettings);

  // UI state
  const [showSOSSheet, setShowSOSSheet] = useState(false);
  const [showMissedCheckInModal, setShowMissedCheckInModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Check for missed check-in on mount
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
    recordCheckIn();
  }, [recordCheckIn]);

  const handleEnableCheckIn = useCallback(async () => {
    // Request notification permission
    const permission = await requestNotificationPermission();

    if (permission === 'granted') {
      // Enable check-in and schedule notifications
      updateSettings({ dailyCheckInEnabled: true });
      await scheduleCheckInReminder({
        checkInTime: settings.dailyCheckInTime,
        gracePeriodMinutes: settings.gracePeriodMinutes,
      });
    } else {
      // Enable anyway but warn about notifications
      updateSettings({ dailyCheckInEnabled: true });
      // Could show an alert here about notifications being disabled
    }
  }, [updateSettings, settings.dailyCheckInTime, settings.gracePeriodMinutes]);

  const handleMissedCheckInNotify = useCallback(() => {
    recordMissedCheckIn();
    addEvent('TEST_ALERT_SENT', { note: 'Missed check-in notification sent' });
  }, [recordMissedCheckIn, addEvent]);

  const handleMissedCheckInOK = useCallback(() => {
    recordCheckIn();
  }, [recordCheckIn]);

  const handleManageContacts = useCallback(() => {
    navigation.navigate('SafetyContacts');
  }, [navigation]);

  const handleOpenSettings = useCallback(() => {
    navigation.navigate('SafetySettings');
  }, [navigation]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRefreshing(false);
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Safety</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.settingsButton} onPress={handleOpenSettings}>
            <Icon name="settings-outline" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
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
                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={handleManageContacts}
                >
                  <Text style={styles.viewAllText}>
                    View all {contacts.length} contacts
                  </Text>
                  <Icon name="chevron-forward" size={16} color={colors.accent} />
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
              events.map((event) => (
                <SafetyEventItem key={event.id} event={event} />
              ))
            ) : (
              <EmptyEventsState />
            )}
          </View>
        </View>

        {/* Privacy Note */}
        <View style={styles.privacyNote}>
          <Icon name="shield-checkmark-outline" size={16} color={colors.textTertiary} />
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
        userName="You" // TODO: Get from profile store
      />

      {/* Missed Check-In Modal */}
      <MissedCheckInModal
        visible={showMissedCheckInModal}
        onClose={() => setShowMissedCheckInModal(false)}
        onCheckIn={handleMissedCheckInOK}
        onNotifyContacts={handleMissedCheckInNotify}
        contacts={contacts}
        shareLocation={settings.shareLocationOnMissedCheckIn}
        userName="You"
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
  headerLeft: {
    width: 44,
  },
  headerRight: {
    width: 44,
    alignItems: 'flex-end',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  sosSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h4,
  },
  sectionAction: {
    ...typography.label,
    color: colors.accent,
  },
  contactsList: {
    gap: spacing.xs,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
  },
  viewAllText: {
    ...typography.label,
    color: colors.accent,
  },
  activityCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.card,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    justifyContent: 'center',
    paddingTop: spacing.md,
  },
  privacyText: {
    ...typography.caption,
    color: colors.textTertiary,
    flex: 1,
    textAlign: 'center',
  },
});
