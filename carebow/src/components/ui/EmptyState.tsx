/**
 * EmptyState Component
 * Displays when content is empty with icon, title, description, and optional action
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, typography, spacing, radius } from '@/theme';
import { Button, ButtonVariant } from './Button';

// ============================================
// TYPES
// ============================================

export type EmptyStateSize = 'small' | 'medium' | 'large';

export interface EmptyStateProps {
  /** Icon name (Feather icons) */
  icon?: string;
  /** Custom icon component */
  iconComponent?: React.ReactNode;
  /** Main title */
  title: string;
  /** Description text */
  description?: string;
  /** Action button label */
  actionLabel?: string;
  /** Action button press handler */
  onAction?: () => void;
  /** Action button variant */
  actionVariant?: ButtonVariant;
  /** Secondary action label */
  secondaryActionLabel?: string;
  /** Secondary action handler */
  onSecondaryAction?: () => void;
  /** Size preset */
  size?: EmptyStateSize;
  /** Container style */
  style?: ViewStyle;
}

// ============================================
// COMPONENT
// ============================================

export function EmptyState({
  icon = 'inbox',
  iconComponent,
  title,
  description,
  actionLabel,
  onAction,
  actionVariant = 'primary',
  secondaryActionLabel,
  onSecondaryAction,
  size = 'medium',
  style,
}: EmptyStateProps) {
  const sizeStyles = getSizeStyles(size);

  return (
    <View style={[styles.container, style]}>
      {/* Icon */}
      <View
        style={[
          styles.iconContainer,
          sizeStyles.iconContainer,
        ]}
      >
        {iconComponent || (
          <Icon
            name={icon}
            size={sizeStyles.iconSize}
            color={colors.textTertiary}
          />
        )}
      </View>

      {/* Title */}
      <Text style={[styles.title, sizeStyles.title]}>
        {title}
      </Text>

      {/* Description */}
      {description && (
        <Text style={[styles.description, sizeStyles.description]}>
          {description}
        </Text>
      )}

      {/* Actions */}
      {(actionLabel || secondaryActionLabel) && (
        <View style={styles.actionsContainer}>
          {actionLabel && onAction && (
            <Button
              title={actionLabel}
              onPress={onAction}
              variant={actionVariant}
              size={size === 'small' ? 'small' : 'medium'}
            />
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              title={secondaryActionLabel}
              onPress={onSecondaryAction}
              variant="ghost"
              size={size === 'small' ? 'small' : 'medium'}
            />
          )}
        </View>
      )}
    </View>
  );
}

// ============================================
// SIZE STYLES
// ============================================

interface SizeStyle {
  iconContainer: ViewStyle;
  iconSize: number;
  title: object;
  description: object;
}

function getSizeStyles(size: EmptyStateSize): SizeStyle {
  const sizes: Record<EmptyStateSize, SizeStyle> = {
    small: {
      iconContainer: {
        width: 48,
        height: 48,
        borderRadius: radius.md,
      },
      iconSize: 24,
      title: {
        ...typography.label,
        marginTop: spacing.sm,
      },
      description: {
        ...typography.caption,
        marginTop: spacing.xxs,
      },
    },
    medium: {
      iconContainer: {
        width: 72,
        height: 72,
        borderRadius: radius.lg,
      },
      iconSize: 32,
      title: {
        ...typography.h3,
        marginTop: spacing.md,
      },
      description: {
        ...typography.body,
        marginTop: spacing.xs,
      },
    },
    large: {
      iconContainer: {
        width: 96,
        height: 96,
        borderRadius: radius.xl,
      },
      iconSize: 48,
      title: {
        ...typography.h2,
        marginTop: spacing.lg,
      },
      description: {
        ...typography.bodyLarge,
        marginTop: spacing.sm,
      },
    },
  };

  return sizes[size];
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface2,
  },
  title: {
    color: colors.textPrimary,
    textAlign: 'center',
  },
  description: {
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  actionsContainer: {
    marginTop: spacing.lg,
    gap: spacing.sm,
    alignItems: 'center',
  },
});

// ============================================
// PRESET EMPTY STATES
// ============================================

interface PresetEmptyStateProps {
  onAction?: () => void;
  style?: ViewStyle;
}

export function NoResultsEmptyState({ onAction, style }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon="search"
      title="No results found"
      description="Try adjusting your search or filter criteria"
      actionLabel={onAction ? "Clear filters" : undefined}
      onAction={onAction}
      actionVariant="outline"
      style={style}
    />
  );
}

export function NoDataEmptyState({ onAction, style }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon="inbox"
      title="Nothing here yet"
      description="Get started by adding your first item"
      actionLabel={onAction ? "Add new" : undefined}
      onAction={onAction}
      style={style}
    />
  );
}

export function ErrorEmptyState({ onAction, style }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon="alert-circle"
      title="Something went wrong"
      description="We couldn't load this content. Please try again."
      actionLabel={onAction ? "Try again" : undefined}
      onAction={onAction}
      actionVariant="outline"
      style={style}
    />
  );
}

export function OfflineEmptyState({ onAction, style }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon="wifi-off"
      title="You're offline"
      description="Check your internet connection and try again"
      actionLabel={onAction ? "Retry" : undefined}
      onAction={onAction}
      actionVariant="outline"
      style={style}
    />
  );
}

// ============================================
// DOMAIN-SPECIFIC EMPTY STATES
// ============================================

export function NoOrdersEmptyState({ onAction, style }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon="shopping-bag"
      title="No orders yet"
      description="Your orders will appear here once you make a purchase"
      actionLabel={onAction ? "Browse services" : undefined}
      onAction={onAction}
      style={style}
    />
  );
}

export function NoMessagesEmptyState({ onAction, style }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon="message-circle"
      title="No conversations"
      description="Start a conversation with CareBow to get health guidance"
      actionLabel={onAction ? "Ask CareBow" : undefined}
      onAction={onAction}
      style={style}
    />
  );
}

export function NoAppointmentsEmptyState({ onAction, style }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon="calendar"
      title="No appointments"
      description="You don't have any scheduled appointments"
      actionLabel={onAction ? "Book appointment" : undefined}
      onAction={onAction}
      style={style}
    />
  );
}

export function NoHealthRecordsEmptyState({ onAction, style }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon="file-text"
      title="No health records"
      description="Upload your health records to keep them organized and accessible"
      actionLabel={onAction ? "Upload records" : undefined}
      onAction={onAction}
      style={style}
    />
  );
}

export function NoFamilyMembersEmptyState({ onAction, style }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon="users"
      title="No family members"
      description="Add family members to manage their health care too"
      actionLabel={onAction ? "Add member" : undefined}
      onAction={onAction}
      style={style}
    />
  );
}

export function NoNotificationsEmptyState({ style }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon="bell"
      title="All caught up!"
      description="You don't have any new notifications"
      style={style}
    />
  );
}

export function NoServicesEmptyState({ onAction, style }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon="grid"
      title="No services available"
      description="Services in this category are coming soon"
      actionLabel={onAction ? "Browse all" : undefined}
      onAction={onAction}
      actionVariant="outline"
      style={style}
    />
  );
}

export function EmptyCartEmptyState({ onAction, style }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon="shopping-cart"
      title="Your cart is empty"
      description="Add services or products to your cart to get started"
      actionLabel={onAction ? "Browse services" : undefined}
      onAction={onAction}
      style={style}
    />
  );
}

export function NoSavedAddressesEmptyState({ onAction, style }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon="map-pin"
      title="No saved addresses"
      description="Add an address for faster checkout"
      actionLabel={onAction ? "Add address" : undefined}
      onAction={onAction}
      style={style}
    />
  );
}

export function NoPaymentMethodsEmptyState({ onAction, style }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon="credit-card"
      title="No payment methods"
      description="Add a payment method for faster checkout"
      actionLabel={onAction ? "Add payment method" : undefined}
      onAction={onAction}
      style={style}
    />
  );
}

export function NoHealthMemoryEmptyState({ onAction, style }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon="heart"
      title="No health memory"
      description="Your health conversations and insights will appear here"
      actionLabel={onAction ? "Start conversation" : undefined}
      onAction={onAction}
      style={style}
    />
  );
}

export function NoFollowUpsEmptyState({ style }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon="check-circle"
      title="No follow-ups needed"
      description="You're all caught up with your health check-ins"
      style={style}
    />
  );
}

export default EmptyState;
