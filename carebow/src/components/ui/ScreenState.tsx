/**
 * ScreenState Component
 * Unified state management for screens: loading, error, empty, and content states
 * Ensures consistent UX patterns across all screens
 */

import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '@/theme';
import { EmptyState, ErrorEmptyState, OfflineEmptyState } from './EmptyState';
import {
  LoadingSpinner,
  FullScreenLoading,
  SkeletonHomeScreen,
  SkeletonProfileScreen,
  SkeletonDetailScreen,
  SkeletonList,
  SkeletonCard,
} from './LoadingSpinner';

// ============================================
// TYPES
// ============================================

export type ScreenStateStatus = 'loading' | 'error' | 'empty' | 'offline' | 'content';
export type LoadingType = 'spinner' | 'skeleton' | 'overlay' | 'inline';
export type SkeletonType = 'home' | 'profile' | 'detail' | 'list' | 'card' | 'custom';

export interface ScreenStateProps {
  /** Current state status */
  status: ScreenStateStatus;
  /** Content to render when status is 'content' */
  children: ReactNode;
  /** Loading state configuration */
  loadingType?: LoadingType;
  /** Skeleton type when loadingType is 'skeleton' */
  skeletonType?: SkeletonType;
  /** Custom skeleton component */
  customSkeleton?: ReactNode;
  /** Loading text */
  loadingText?: string;
  /** Error message */
  errorMessage?: string;
  /** Empty state configuration */
  emptyConfig?: {
    icon?: string;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
  };
  /** Retry callback for error state */
  onRetry?: () => void;
  /** Refresh callback */
  onRefresh?: () => void;
  /** Container style */
  style?: ViewStyle;
  /** Content container style */
  contentStyle?: ViewStyle;
}

// ============================================
// COMPONENT
// ============================================

export function ScreenState({
  status,
  children,
  loadingType = 'skeleton',
  skeletonType = 'list',
  customSkeleton,
  loadingText,
  errorMessage,
  emptyConfig,
  onRetry,
  style,
  contentStyle,
}: ScreenStateProps) {
  // Loading state
  if (status === 'loading') {
    return (
      <View style={[styles.container, style]}>
        {renderLoading(loadingType, skeletonType, customSkeleton, loadingText)}
      </View>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <ErrorEmptyState onAction={onRetry} />
      </View>
    );
  }

  // Offline state
  if (status === 'offline') {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <OfflineEmptyState onAction={onRetry} />
      </View>
    );
  }

  // Empty state
  if (status === 'empty') {
    return (
      <View style={[styles.container, styles.centered, style]}>
        <EmptyState
          icon={emptyConfig?.icon || 'inbox'}
          title={emptyConfig?.title || 'Nothing here yet'}
          description={emptyConfig?.description}
          actionLabel={emptyConfig?.actionLabel}
          onAction={emptyConfig?.onAction}
        />
      </View>
    );
  }

  // Content state
  return (
    <View style={[styles.container, contentStyle, style]}>
      {children}
    </View>
  );
}

// ============================================
// LOADING RENDERERS
// ============================================

function renderLoading(
  loadingType: LoadingType,
  skeletonType: SkeletonType,
  customSkeleton?: ReactNode,
  loadingText?: string
): ReactNode {
  switch (loadingType) {
    case 'spinner':
      return <FullScreenLoading text={loadingText} />;

    case 'overlay':
      return <LoadingSpinner variant="overlay" text={loadingText} />;

    case 'inline':
      return <LoadingSpinner variant="inline" text={loadingText} />;

    case 'skeleton':
    default:
      return renderSkeleton(skeletonType, customSkeleton);
  }
}

function renderSkeleton(skeletonType: SkeletonType, customSkeleton?: ReactNode): ReactNode {
  if (customSkeleton) {
    return customSkeleton;
  }

  switch (skeletonType) {
    case 'home':
      return <SkeletonHomeScreen />;

    case 'profile':
      return <SkeletonProfileScreen />;

    case 'detail':
      return <SkeletonDetailScreen />;

    case 'card':
      return (
        <View style={styles.cardSkeletons}>
          <SkeletonCard />
          <SkeletonCard style={{ marginTop: spacing.md }} />
        </View>
      );

    case 'list':
    default:
      return <SkeletonList count={6} />;
  }
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardSkeletons: {
    padding: spacing.md,
  },
});

// ============================================
// HOOK FOR STATE DERIVATION
// ============================================

export interface UseScreenStateOptions {
  isLoading: boolean;
  isError?: boolean;
  isOffline?: boolean;
  isEmpty?: boolean;
  data?: unknown;
}

/**
 * Hook to derive ScreenStateStatus from common data fetching states
 */
export function useScreenState({
  isLoading,
  isError = false,
  isOffline = false,
  isEmpty = false,
  data,
}: UseScreenStateOptions): ScreenStateStatus {
  if (isLoading) return 'loading';
  if (isOffline) return 'offline';
  if (isError) return 'error';

  // Check if data is empty (array or null/undefined)
  const dataIsEmpty =
    isEmpty ||
    data === null ||
    data === undefined ||
    (Array.isArray(data) && data.length === 0);

  if (dataIsEmpty) return 'empty';

  return 'content';
}

// ============================================
// PRESETS FOR COMMON SCREENS
// ============================================

interface ScreenStatePresetProps {
  status: ScreenStateStatus;
  children: ReactNode;
  onRetry?: () => void;
  emptyConfig?: ScreenStateProps['emptyConfig'];
  style?: ViewStyle;
}

/**
 * Home screen state wrapper
 */
export function HomeScreenState(props: ScreenStatePresetProps) {
  return (
    <ScreenState
      {...props}
      loadingType="skeleton"
      skeletonType="home"
    />
  );
}

/**
 * Profile screen state wrapper
 */
export function ProfileScreenState(props: ScreenStatePresetProps) {
  return (
    <ScreenState
      {...props}
      loadingType="skeleton"
      skeletonType="profile"
    />
  );
}

/**
 * Detail screen state wrapper
 */
export function DetailScreenState(props: ScreenStatePresetProps) {
  return (
    <ScreenState
      {...props}
      loadingType="skeleton"
      skeletonType="detail"
    />
  );
}

/**
 * List screen state wrapper
 */
export function ListScreenState(props: ScreenStatePresetProps) {
  return (
    <ScreenState
      {...props}
      loadingType="skeleton"
      skeletonType="list"
    />
  );
}

/**
 * Card-based screen state wrapper
 */
export function CardScreenState(props: ScreenStatePresetProps) {
  return (
    <ScreenState
      {...props}
      loadingType="skeleton"
      skeletonType="card"
    />
  );
}

export default ScreenState;
