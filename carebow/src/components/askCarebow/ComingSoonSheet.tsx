/**
 * ComingSoonSheet Component
 * Bottom sheet that shows "Coming Soon" for stub actions
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../../theme';

interface ComingSoonSheetProps {
  visible: boolean;
  onClose: () => void;
  action: string;
}

interface ActionDetails {
  title: string;
  description: string;
  icon: string;
}

const actionDetails: Record<string, ActionDetails> = {
  connect_doctor: {
    title: 'Connect to Doctor',
    description: 'Video consultations with verified doctors will be available soon.',
    icon: 'videocam',
  },
  book_home_visit: {
    title: 'Book Home Visit',
    description: 'Schedule a healthcare professional to visit you at home.',
    icon: 'home',
  },
  schedule_teleconsult: {
    title: 'Schedule Teleconsult',
    description: 'Book video appointments at your preferred time.',
    icon: 'calendar',
  },
  home_visit_options: {
    title: 'Home Visit Options',
    description: 'Browse available home healthcare services.',
    icon: 'home',
  },
  set_reminder: {
    title: 'Set Check-in Reminder',
    description: 'Get reminded to check your symptoms and follow up.',
    icon: 'notifications',
  },
  home_remedies: {
    title: 'Home Remedies Checklist',
    description: 'Personalized self-care tips based on your symptoms.',
    icon: 'list',
  },
  save_share: {
    title: 'Save / Share Summary',
    description: 'Export your assessment to share with your doctor.',
    icon: 'share-social',
  },
};

export function ComingSoonSheet({ visible, onClose, action }: ComingSoonSheetProps) {
  const insets = useSafeAreaInsets();

  const details = actionDetails[action] || {
    title: 'Coming Soon',
    description: 'This feature is being built.',
    icon: 'time',
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <Icon name={details.icon} size={28} color={colors.accent} />
          </View>

          {/* Title & Description */}
          <Text style={styles.title}>{details.title}</Text>
          <Text style={styles.description}>{details.description}</Text>

          {/* Coming Soon Badge */}
          <View style={styles.comingSoonBadge}>
            <Icon name="time" size={16} color={colors.accent} />
            <Text style={styles.comingSoonTitle}>Coming Soon</Text>
          </View>
          <Text style={styles.comingSoonDescription}>
            We're working hard to bring this feature to you. Check back soon!
          </Text>

          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.closeButtonText}>Got it</Text>
          </TouchableOpacity>
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
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.accentMuted,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  comingSoonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accentMuted,
    borderWidth: 1,
    borderColor: colors.accentSoft,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  comingSoonTitle: {
    ...typography.label,
    color: colors.accent,
  },
  comingSoonDescription: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  closeButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...shadows.button,
  },
  closeButtonText: {
    ...typography.labelLarge,
    color: colors.textInverse,
  },
});
