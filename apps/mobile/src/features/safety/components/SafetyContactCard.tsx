/**
 * Safety Contact Card Component
 * Displays an emergency contact with quick actions
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '@/theme';
import { SafetyContact } from '../types';
import { formatPhoneNumber, openPhoneDialer, openSMSComposer } from '../services/sosService';

// ============================================
// TYPES
// ============================================

interface SafetyContactCardProps {
  contact: SafetyContact;
  onPress?: () => void;
  onCall?: () => void;
  onSMS?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

// ============================================
// COMPONENT
// ============================================

export function SafetyContactCard({
  contact,
  onPress,
  onCall,
  onSMS,
  showActions = true,
  compact = false,
}: SafetyContactCardProps) {
  const handleCall = async () => {
    if (onCall) {
      onCall();
    } else {
      await openPhoneDialer(contact.phoneNumber);
    }
  };

  const handleSMS = async () => {
    if (onSMS) {
      onSMS();
    } else {
      await openSMSComposer([contact.phoneNumber], '');
    }
  };

  const initials = contact.name
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (compact) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.compactContainer,
          pressed && styles.pressed,
        ]}
        onPress={onPress}
      >
        <View style={[styles.avatar, contact.isPrimary && styles.avatarPrimary]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.compactInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.compactName} numberOfLines={1}>
              {contact.name}
            </Text>
            {contact.isPrimary && (
              <View style={styles.primaryBadge}>
                <Text style={styles.primaryBadgeText}>Primary</Text>
              </View>
            )}
          </View>
          {contact.relationship && (
            <Text style={styles.compactRelationship} numberOfLines={1}>
              {contact.relationship}
            </Text>
          )}
        </View>
        <TouchableOpacity style={styles.compactCallButton} onPress={handleCall}>
          <Icon name="call" size={18} color={colors.white} />
        </TouchableOpacity>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && onPress && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={[styles.avatar, contact.isPrimary && styles.avatarPrimary]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{contact.name}</Text>
            {contact.isPrimary && (
              <View style={styles.primaryBadge}>
                <Text style={styles.primaryBadgeText}>Primary</Text>
              </View>
            )}
          </View>
          {contact.relationship && (
            <Text style={styles.relationship}>{contact.relationship}</Text>
          )}
          <Text style={styles.phone}>{formatPhoneNumber(contact.phoneNumber)}</Text>
        </View>
      </View>

      {showActions && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
            <Icon name="call" size={18} color={colors.success} />
            <Text style={styles.actionText}>Call</Text>
          </TouchableOpacity>
          {contact.canReceiveSMS && (
            <TouchableOpacity style={styles.actionButton} onPress={handleSMS}>
              <Icon name="chatbubble" size={18} color={colors.accent} />
              <Text style={[styles.actionText, { color: colors.accent }]}>SMS</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Contact capabilities badges */}
      <View style={styles.capabilities}>
        {contact.canReceiveSMS && (
          <View style={styles.capabilityBadge}>
            <Icon name="chatbubble-outline" size={12} color={colors.textTertiary} />
            <Text style={styles.capabilityText}>SMS</Text>
          </View>
        )}
        {contact.canReceiveWhatsApp && (
          <View style={styles.capabilityBadge}>
            <Icon name="logo-whatsapp" size={12} color={colors.textTertiary} />
            <Text style={styles.capabilityText}>WhatsApp</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

// ============================================
// EMPTY STATE
// ============================================

interface EmptyContactsProps {
  onAdd: () => void;
}

export function EmptyContactsState({ onAdd }: EmptyContactsProps) {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Icon name="people-outline" size={40} color={colors.textTertiary} />
      </View>
      <Text style={styles.emptyTitle}>No Emergency Contacts</Text>
      <Text style={styles.emptyDescription}>
        Add at least one emergency contact to enable SOS alerts
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={onAdd}>
        <Icon name="add" size={20} color={colors.white} />
        <Text style={styles.emptyButtonText}>Add Contact</Text>
      </TouchableOpacity>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.card,
  },
  pressed: {
    opacity: 0.95,
  },
  header: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPrimary: {
    backgroundColor: colors.success,
  },
  avatarText: {
    ...typography.label,
    color: colors.white,
    fontWeight: '600',
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  name: {
    ...typography.h4,
  },
  primaryBadge: {
    backgroundColor: colors.successSoft,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  primaryBadgeText: {
    ...typography.tiny,
    color: colors.success,
  },
  relationship: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  phone: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surface2,
  },
  actionText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '500',
  },
  capabilities: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  capabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
    backgroundColor: colors.surface2,
  },
  capabilityText: {
    ...typography.tiny,
    color: colors.textTertiary,
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    ...typography.label,
    flex: 1,
  },
  compactRelationship: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  compactCallButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surface2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h4,
    marginBottom: spacing.xs,
  },
  emptyDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    ...shadows.button,
  },
  emptyButtonText: {
    ...typography.label,
    color: colors.white,
  },
});
