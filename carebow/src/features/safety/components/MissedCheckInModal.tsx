/**
 * Missed Check-In Modal Component
 * Shows when user opens app after missing check-in deadline
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '@/theme';
import { SafetyContact } from '../types';
import { sendMissedCheckInAlert } from '../services/sosService';
import { getLocationWithFallback, LocationData } from '../services/locationService';

// ============================================
// TYPES
// ============================================

interface MissedCheckInModalProps {
  visible: boolean;
  onClose: () => void;
  onCheckIn: () => void;
  onNotifyContacts: () => void;
  contacts: SafetyContact[];
  shareLocation: boolean;
  userName: string;
}

// ============================================
// COMPONENT
// ============================================

export function MissedCheckInModal({
  visible,
  onClose,
  onCheckIn,
  onNotifyContacts,
  contacts,
  shareLocation,
  userName,
}: MissedCheckInModalProps) {
  const insets = useSafeAreaInsets();
  const [isNotifying, setIsNotifying] = useState(false);

  const handleNotifyContacts = useCallback(async () => {
    setIsNotifying(true);

    try {
      let location: LocationData | null = null;

      if (shareLocation) {
        const result = await getLocationWithFallback(5000);
        if (result.success) {
          location = result.data;
        }
      }

      await sendMissedCheckInAlert(contacts, userName, location, shareLocation);
      onNotifyContacts();
      onClose();
    } catch (error) {
      console.error('Failed to notify contacts:', error);
    } finally {
      setIsNotifying(false);
    }
  }, [contacts, userName, shareLocation, onNotifyContacts, onClose]);

  const handleImOK = useCallback(() => {
    onCheckIn();
    onClose();
  }, [onCheckIn, onClose]);

  const handleSkip = useCallback(() => {
    onClose();
  }, [onClose]);

  const hasContacts = contacts.length > 0;
  const smsContacts = contacts.filter((c) => c.canReceiveSMS);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { marginBottom: insets.bottom }]}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Icon name="time" size={40} color={colors.warning} />
          </View>

          {/* Content */}
          <Text style={styles.title}>Missed Check-in</Text>
          <Text style={styles.description}>
            You missed today's scheduled check-in. Would you like to notify your emergency contacts?
          </Text>

          {!hasContacts && (
            <View style={styles.infoBanner}>
              <Icon name="information-circle" size={16} color={colors.info} />
              <Text style={styles.infoText}>
                No emergency contacts set up yet.
              </Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            {smsContacts.length > 0 && (
              <TouchableOpacity
                style={styles.notifyButton}
                onPress={handleNotifyContacts}
                disabled={isNotifying}
              >
                {isNotifying ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <>
                    <Icon name="notifications" size={18} color={colors.white} />
                    <Text style={styles.notifyButtonText}>Notify Contacts</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.imOKButton}
              onPress={handleImOK}
            >
              <Icon name="hand-right" size={18} color={colors.success} />
              <Text style={styles.imOKButtonText}>I'm OK</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modal: {
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    ...shadows.cardElevated,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.warningSoft,
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
    marginBottom: spacing.lg,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.infoSoft,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.lg,
    width: '100%',
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.info,
    flex: 1,
  },
  actions: {
    width: '100%',
    gap: spacing.sm,
  },
  notifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.warning,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    ...shadows.button,
  },
  notifyButtonText: {
    ...typography.label,
    color: colors.white,
    fontWeight: '600',
  },
  imOKButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.successSoft,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  imOKButtonText: {
    ...typography.label,
    color: colors.success,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  skipButtonText: {
    ...typography.label,
    color: colors.textTertiary,
  },
});
