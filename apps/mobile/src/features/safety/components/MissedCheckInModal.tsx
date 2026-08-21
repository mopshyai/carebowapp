/**
 * Missed Check-In Modal Component
 * Shows when user opens app after missing check-in deadline.
 *
 * Family/emergency-contact escalation is server-driven. This modal must not
 * send a second copy or close before the server confirms "I'm OK".
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

// ============================================
// TYPES
// ============================================

interface MissedCheckInModalProps {
  visible: boolean;
  onClose: () => void;
  /** Return false when CareBow could not confirm the check-in. */
  onCheckIn: () => Promise<boolean> | boolean;
}

// ============================================
// COMPONENT
// ============================================

export function MissedCheckInModal({
  visible,
  onClose,
  onCheckIn,
}: MissedCheckInModalProps) {
  const insets = useSafeAreaInsets();
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const handleImOK = useCallback(async () => {
    if (isCheckingIn) return;
    setIsCheckingIn(true);

    try {
      const confirmed = await onCheckIn();
      if (confirmed) onClose();
    } finally {
      setIsCheckingIn(false);
    }
  }, [isCheckingIn, onCheckIn, onClose]);

  const handleSkip = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { marginBottom: insets.bottom }]}>
          <View style={styles.iconContainer}>
            <Icon name="time" size={40} color={colors.warning} />
          </View>

          <Text style={styles.title}>Missed Check-in</Text>
          <Text style={styles.description}>
            CareBow has marked today's check-in as missed and automatic safety alerts may already be
            in progress. If you're safe, confirm now so CareBow records that you're OK.
          </Text>

          <View style={styles.infoBanner}>
            <Icon name="information-circle" size={16} color={colors.info} />
            <Text style={styles.infoText}>
              You do not need to manually send the same missed-check-in alert again.
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.imOKButton}
              onPress={handleImOK}
              disabled={isCheckingIn}
            >
              {isCheckingIn ? (
                <ActivityIndicator size="small" color={colors.success} />
              ) : (
                <>
                  <Icon name="hand-right" size={18} color={colors.success} />
                  <Text style={styles.imOKButtonText}>I'm OK</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipButton} onPress={handleSkip} disabled={isCheckingIn}>
              <Text style={styles.skipButtonText}>Close for now</Text>
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
