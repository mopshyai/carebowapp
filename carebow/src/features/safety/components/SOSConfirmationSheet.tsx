/**
 * SOS Confirmation Sheet Component
 * Bottom sheet for confirming SOS trigger and selecting actions
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '@/theme';
import { SafetyContact } from '../types';
import {
  callPrimaryContact,
  callEmergencyServices,
  sendSOSSMSToPrimary,
  sendSOSSMSToAll,
  executeSOSTrigger,
  triggerSOSHaptic,
} from '../services/sosService';
import { LocationData } from '../services/locationService';

// ============================================
// TYPES
// ============================================

interface SOSConfirmationSheetProps {
  visible: boolean;
  onClose: () => void;
  onSOSTriggered: (location: LocationData | null) => void;
  contacts: SafetyContact[];
  primaryContact?: SafetyContact;
  shareLocationDefault: boolean;
  userName: string;
}

type SOSPhase = 'confirm' | 'actions' | 'sending';

// ============================================
// COMPONENT
// ============================================

export function SOSConfirmationSheet({
  visible,
  onClose,
  onSOSTriggered,
  contacts,
  primaryContact,
  shareLocationDefault,
  userName,
}: SOSConfirmationSheetProps) {
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<SOSPhase>('confirm');
  const [shareLocation, setShareLocation] = useState(shareLocationDefault);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setPhase('confirm');
    setShareLocation(shareLocationDefault);
    setIsLoading(false);
    setLocation(null);
    setLocationError(null);
  }, [shareLocationDefault]);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  const handleSendSOS = useCallback(async () => {
    setIsLoading(true);
    setPhase('sending');

    try {
      const result = await executeSOSTrigger({
        contacts,
        userName,
        shareLocation,
      });

      setLocation(result.location);
      if (result.locationError) {
        setLocationError(result.locationError);
      }

      // Record the SOS event
      onSOSTriggered(result.location);

      // Move to action selection phase
      setPhase('actions');
    } catch (error) {
      console.error('SOS trigger failed:', error);
      setPhase('actions');
    } finally {
      setIsLoading(false);
    }
  }, [contacts, userName, shareLocation, onSOSTriggered]);

  const handleCallPrimary = useCallback(async () => {
    if (primaryContact) {
      await callPrimaryContact(primaryContact);
    }
  }, [primaryContact]);

  const handleCall911 = useCallback(async () => {
    await callEmergencyServices();
  }, []);

  const handleSMSPrimary = useCallback(async () => {
    if (primaryContact) {
      await sendSOSSMSToPrimary(primaryContact, userName, location, shareLocation);
    }
  }, [primaryContact, userName, location, shareLocation]);

  const handleSMSAll = useCallback(async () => {
    await sendSOSSMSToAll(contacts, userName, location, shareLocation);
  }, [contacts, userName, location, shareLocation]);

  const hasContacts = contacts.length > 0;
  const smsContacts = contacts.filter((c) => c.canReceiveSMS);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Confirm Phase */}
          {phase === 'confirm' && (
            <>
              <View style={styles.header}>
                <View style={styles.warningIcon}>
                  <Icon name="alert-circle" size={32} color={colors.error} />
                </View>
                <Text style={styles.title}>Trigger Emergency Alert?</Text>
                <Text style={styles.description}>
                  This will notify your emergency contacts and optionally share your location.
                </Text>
              </View>

              {/* Location toggle */}
              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Icon name="location" size={20} color={colors.textSecondary} />
                  <Text style={styles.toggleLabel}>Share my location</Text>
                </View>
                <Switch
                  value={shareLocation}
                  onValueChange={setShareLocation}
                  trackColor={{ false: colors.border, true: colors.accentSoft }}
                  thumbColor={shareLocation ? colors.accent : colors.surface}
                />
              </View>

              {!hasContacts && (
                <View style={styles.warningBanner}>
                  <Icon name="warning" size={18} color={colors.warning} />
                  <Text style={styles.warningText}>
                    No emergency contacts set. You can still call 911.
                  </Text>
                </View>
              )}

              {/* Action buttons */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleClose}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.sosButton}
                  onPress={handleSendSOS}
                >
                  <Icon name="alert" size={20} color={colors.white} />
                  <Text style={styles.sosButtonText}>Send SOS</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Sending Phase */}
          {phase === 'sending' && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.error} />
              <Text style={styles.loadingText}>Triggering emergency alert...</Text>
            </View>
          )}

          {/* Actions Phase */}
          {phase === 'actions' && (
            <>
              <View style={styles.header}>
                <View style={styles.successIcon}>
                  <Icon name="checkmark-circle" size={32} color={colors.success} />
                </View>
                <Text style={styles.title}>SOS Alert Ready</Text>
                <Text style={styles.description}>
                  {location
                    ? 'Your location was captured. Choose how to reach out:'
                    : 'Choose how to contact your emergency contacts:'}
                </Text>
              </View>

              {locationError && (
                <View style={styles.infoBanner}>
                  <Icon name="information-circle" size={16} color={colors.info} />
                  <Text style={styles.infoText}>
                    Location unavailable. Proceeding without location.
                  </Text>
                </View>
              )}

              {/* Quick action buttons */}
              <View style={styles.quickActions}>
                {primaryContact && (
                  <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={handleCallPrimary}
                  >
                    <View style={[styles.quickActionIcon, { backgroundColor: colors.successSoft }]}>
                      <Icon name="call" size={24} color={colors.success} />
                    </View>
                    <Text style={styles.quickActionLabel}>Call</Text>
                    <Text style={styles.quickActionSub}>{primaryContact.name}</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={handleCall911}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: colors.errorSoft }]}>
                    <Icon name="medical" size={24} color={colors.error} />
                  </View>
                  <Text style={styles.quickActionLabel}>Call 911</Text>
                  <Text style={styles.quickActionSub}>Emergency</Text>
                </TouchableOpacity>

                {primaryContact?.canReceiveSMS && (
                  <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={handleSMSPrimary}
                  >
                    <View style={[styles.quickActionIcon, { backgroundColor: colors.accentMuted }]}>
                      <Icon name="chatbubble" size={24} color={colors.accent} />
                    </View>
                    <Text style={styles.quickActionLabel}>SMS</Text>
                    <Text style={styles.quickActionSub}>{primaryContact.name}</Text>
                  </TouchableOpacity>
                )}

                {smsContacts.length > 1 && (
                  <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={handleSMSAll}
                  >
                    <View style={[styles.quickActionIcon, { backgroundColor: colors.infoSoft }]}>
                      <Icon name="people" size={24} color={colors.info} />
                    </View>
                    <Text style={styles.quickActionLabel}>SMS All</Text>
                    <Text style={styles.quickActionSub}>{smsContacts.length} contacts</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={styles.doneButton}
                onPress={handleClose}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: spacing.lg,
    ...shadows.cardElevated,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  warningIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.errorSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.successSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  toggleLabel: {
    ...typography.label,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.warningSoft,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  warningText: {
    ...typography.bodySmall,
    color: colors.warning,
    flex: 1,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.infoSoft,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.info,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface2,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  sosButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.error,
    ...shadows.button,
  },
  sosButtonText: {
    ...typography.label,
    color: colors.white,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  quickActionButton: {
    width: '47%',
    backgroundColor: colors.surface2,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  quickActionLabel: {
    ...typography.label,
    marginBottom: 2,
  },
  quickActionSub: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  doneButton: {
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  doneButtonText: {
    ...typography.label,
    color: colors.white,
    fontWeight: '600',
  },
});
