/**
 * SOS Confirmation Sheet Component
 * Bottom sheet for confirming SOS trigger and selecting direct emergency actions.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Switch,
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
} from '../services/sosService';
import { LocationData } from '../services/locationService';
import {
  EmergencyNumbers,
  DEFAULT_EMERGENCY,
  getEmergencyNumbersForCoordinates,
} from '../services/emergencyNumbers';
import { safetyApi } from '../../../services/api/endpoints/safety';
import { toServerSafetyContacts } from '../services/contactSync';
import { createLogger } from '../../../utils/logger';

/** Seconds before the SOS auto-escalates to an emergency call (cancellable). */
const AUTO_CALL_SECONDS = 10;

const logger = createLogger('SOS');

interface SOSConfirmationSheetProps {
  visible: boolean;
  onClose: () => void;
  onSOSTriggered: (location: LocationData | null) => void;
  contacts: SafetyContact[];
  primaryContact?: SafetyContact;
  shareLocationDefault: boolean;
  userName: string;
}

type SOSPhase = 'confirm' | 'actions';
type ServerAlertStatus = 'idle' | 'pending' | 'accepted' | 'unconfirmed';

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
  const mounted = useRef(true);
  const [phase, setPhase] = useState<SOSPhase>('confirm');
  const [shareLocation, setShareLocation] = useState(shareLocationDefault);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [emergency, setEmergency] = useState<EmergencyNumbers>(DEFAULT_EMERGENCY);
  const [autoCallSeconds, setAutoCallSeconds] = useState<number | null>(null);
  const [serverAlertStatus, setServerAlertStatus] = useState<ServerAlertStatus>('idle');
  const [serverQueued, setServerQueued] = useState<number | null>(null);

  const stopAutoCall = useCallback(() => {
    setAutoCallSeconds(null);
  }, []);

  const resetState = useCallback(() => {
    stopAutoCall();
    setPhase('confirm');
    setShareLocation(shareLocationDefault);
    setLocation(null);
    setLocationError(null);
    setEmergency(DEFAULT_EMERGENCY);
    setServerAlertStatus('idle');
    setServerQueued(null);
  }, [shareLocationDefault, stopAutoCall]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      stopAutoCall();
    };
  }, [stopAutoCall]);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  /**
   * Start the life-safety actions immediately. GPS is useful context, but it is
   * never allowed to sit in front of the emergency call path or server alert.
   */
  const handleSendSOS = useCallback(() => {
    const serverContacts = toServerSafetyContacts(contacts);

    setPhase('actions');
    setAutoCallSeconds(AUTO_CALL_SECONDS);
    setServerAlertStatus('pending');
    setServerQueued(null);

    // Server acceptance is independent of GPS. The contact list visible on the
    // phone is included so old/local-only contact data cannot produce zero
    // durable recipients on the backend.
    void safetyApi
      .reportSosEvent({
        userName,
        contacts: serverContacts,
      })
      .then((report) => {
        if (!mounted.current) return;
        if (report?.success && report.accepted && report.eventId) {
          setServerAlertStatus('accepted');
          setServerQueued(typeof report.queued === 'number' ? report.queued : null);
        } else {
          setServerAlertStatus('unconfirmed');
        }
      })
      .catch(() => {
        if (mounted.current) setServerAlertStatus('unconfirmed');
      });

    // Location, regional emergency numbers and local history resolve in
    // parallel. They enhance the emergency flow; they do not gate it.
    void executeSOSTrigger({ contacts, userName, shareLocation })
      .then((result) => {
        if (!mounted.current) return;

        setLocation(result.location);
        setLocationError(result.locationError ?? null);
        onSOSTriggered(result.location);

        if (result.location) {
          void getEmergencyNumbersForCoordinates(result.location.lat, result.location.lng)
            .then((numbers) => {
              if (mounted.current) setEmergency(numbers);
            })
            .catch(() => {
              if (mounted.current) setEmergency(DEFAULT_EMERGENCY);
            });
        }
      })
      .catch((error) => {
        logger.error('SOS location enrichment failed', error);
        if (!mounted.current) return;
        setLocationError('Location unavailable');
        onSOSTriggered(null);
      });
  }, [contacts, userName, shareLocation, onSOSTriggered]);

  // Starts the moment Send SOS is pressed — never after GPS/network work.
  useEffect(() => {
    if (autoCallSeconds === null) return;
    if (autoCallSeconds <= 0) {
      setAutoCallSeconds(null);
      void callEmergencyServices(emergency.call);
      return;
    }
    const id = setTimeout(
      () => setAutoCallSeconds((seconds) => (seconds === null ? null : seconds - 1)),
      1000
    );
    return () => clearTimeout(id);
  }, [autoCallSeconds, emergency.call]);

  const handleCallPrimary = useCallback(async () => {
    stopAutoCall();
    if (primaryContact) await callPrimaryContact(primaryContact);
  }, [primaryContact, stopAutoCall]);

  const handleCallEmergency = useCallback(async () => {
    stopAutoCall();
    await callEmergencyServices(emergency.call);
  }, [emergency.call, stopAutoCall]);

  const handleCallAmbulance = useCallback(async () => {
    stopAutoCall();
    if (emergency.ambulance) await callEmergencyServices(emergency.ambulance);
  }, [emergency.ambulance, stopAutoCall]);

  const handleSMSPrimary = useCallback(async () => {
    stopAutoCall();
    if (primaryContact) {
      await sendSOSSMSToPrimary(primaryContact, userName, location, shareLocation);
    }
  }, [primaryContact, userName, location, shareLocation, stopAutoCall]);

  const handleSMSAll = useCallback(async () => {
    stopAutoCall();
    await sendSOSSMSToAll(contacts, userName, location, shareLocation);
  }, [contacts, userName, location, shareLocation, stopAutoCall]);

  const hasContacts = contacts.length > 0;
  const smsContacts = contacts.filter((contact) => contact.canReceiveSMS);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.handleBar} />

          {phase === 'confirm' && (
            <>
              <View style={styles.header}>
                <View style={styles.warningIcon}>
                  <Icon name="alert-circle" size={32} color={colors.error} />
                </View>
                <Text style={styles.title}>Trigger Emergency Alert?</Text>
                <Text style={styles.description}>
                  CareBow will try to queue alerts to your SMS emergency contacts. If you are in
                  immediate danger, call emergency services — do not rely on messaging alone.
                </Text>
              </View>

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
                    No emergency contacts set. You can still call emergency services.
                  </Text>
                </View>
              )}

              <View style={styles.actions}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sosButton} onPress={handleSendSOS}>
                  <Icon name="alert" size={20} color={colors.white} />
                  <Text style={styles.sosButtonText}>Send SOS</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {phase === 'actions' && (
            <>
              <View style={styles.header}>
                <View style={styles.warningIcon}>
                  <Icon name="alert-circle" size={32} color={colors.error} />
                </View>
                <Text style={styles.title}>Emergency Actions</Text>
                <Text style={styles.description}>
                  Call emergency services now if there is immediate danger. CareBow alert status is
                  shown below and never replaces a direct emergency call.
                </Text>
              </View>

              {serverAlertStatus === 'pending' && (
                <View style={styles.infoBanner}>
                  <Icon name="cloud-upload-outline" size={16} color={colors.info} />
                  <Text style={styles.infoText}>Contacting CareBow emergency dispatch...</Text>
                </View>
              )}

              {serverAlertStatus === 'accepted' && (
                <View style={styles.acceptedBanner}>
                  <Icon name="checkmark-circle" size={16} color={colors.success} />
                  <Text style={styles.acceptedText}>
                    CareBow accepted the SOS
                    {serverQueued !== null ? ` and queued ${serverQueued} alert${serverQueued === 1 ? '' : 's'}` : ''}.
                    Delivery is still in progress.
                  </Text>
                </View>
              )}

              {serverAlertStatus === 'unconfirmed' && (
                <View style={styles.warningBanner}>
                  <Icon name="warning" size={18} color={colors.warning} />
                  <Text style={styles.warningText}>
                    CareBow could not confirm a server alert. Call emergency services or contact
                    someone directly now.
                  </Text>
                </View>
              )}

              {locationError && (
                <View style={styles.infoBanner}>
                  <Icon name="information-circle" size={16} color={colors.info} />
                  <Text style={styles.infoText}>
                    Location unavailable. Emergency actions still work without it.
                  </Text>
                </View>
              )}

              {autoCallSeconds !== null && (
                <View style={styles.countdownBanner}>
                  <View style={styles.countdownInfo}>
                    <Icon name="alarm" size={18} color={colors.error} />
                    <Text style={styles.countdownText}>
                      Calling {emergency.call} in {autoCallSeconds}s
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.countdownCancel} onPress={stopAutoCall}>
                    <Text style={styles.countdownCancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.quickActions}>
                {primaryContact && (
                  <TouchableOpacity style={styles.quickActionButton} onPress={handleCallPrimary}>
                    <View style={[styles.quickActionIcon, { backgroundColor: colors.successSoft }]}>
                      <Icon name="call" size={24} color={colors.success} />
                    </View>
                    <Text style={styles.quickActionLabel}>Call</Text>
                    <Text style={styles.quickActionSub}>{primaryContact.name}</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.quickActionButton} onPress={handleCallEmergency}>
                  <View style={[styles.quickActionIcon, { backgroundColor: colors.errorSoft }]}>
                    <Icon name="medical" size={24} color={colors.error} />
                  </View>
                  <Text style={styles.quickActionLabel}>Call {emergency.call}</Text>
                  <Text style={styles.quickActionSub}>Emergency</Text>
                </TouchableOpacity>

                {emergency.ambulance && (
                  <TouchableOpacity style={styles.quickActionButton} onPress={handleCallAmbulance}>
                    <View style={[styles.quickActionIcon, { backgroundColor: colors.errorSoft }]}>
                      <Icon name="car" size={24} color={colors.error} />
                    </View>
                    <Text style={styles.quickActionLabel}>Call {emergency.ambulance}</Text>
                    <Text style={styles.quickActionSub}>Ambulance</Text>
                  </TouchableOpacity>
                )}

                {primaryContact?.canReceiveSMS && (
                  <TouchableOpacity style={styles.quickActionButton} onPress={handleSMSPrimary}>
                    <View style={[styles.quickActionIcon, { backgroundColor: colors.accentMuted }]}>
                      <Icon name="chatbubble" size={24} color={colors.accent} />
                    </View>
                    <Text style={styles.quickActionLabel}>SMS</Text>
                    <Text style={styles.quickActionSub}>{primaryContact.name}</Text>
                  </TouchableOpacity>
                )}

                {smsContacts.length > 1 && (
                  <TouchableOpacity style={styles.quickActionButton} onPress={handleSMSAll}>
                    <View style={[styles.quickActionIcon, { backgroundColor: colors.infoSoft }]}>
                      <Icon name="people" size={24} color={colors.info} />
                    </View>
                    <Text style={styles.quickActionLabel}>SMS All</Text>
                    <Text style={styles.quickActionSub}>{smsContacts.length} contacts</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity style={styles.doneButton} onPress={handleClose}>
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

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
  acceptedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.successSoft,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  acceptedText: {
    ...typography.bodySmall,
    color: colors.success,
    flex: 1,
  },
  countdownBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    backgroundColor: colors.errorSoft,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  countdownInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  countdownText: {
    ...typography.label,
    color: colors.error,
    flex: 1,
  },
  countdownCancel: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  countdownCancelText: {
    ...typography.label,
    color: colors.textPrimary,
    fontWeight: '600',
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