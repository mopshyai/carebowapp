/**
 * RefreshableScrollView Component
 * ScrollView with pull-to-refresh and customizable refresh indicator
 */

import React, { useState, useCallback, ReactNode } from 'react';
import {
  ScrollView,
  RefreshControl,
  StyleSheet,
  ViewStyle,
  ScrollViewProps,
  View,
  Text,
  Animated,
} from 'react-native';
import { colors, typography, spacing } from '../../theme';

// ============================================
// TYPES
// ============================================

export interface RefreshableScrollViewProps extends Omit<ScrollViewProps, 'refreshControl'> {
  /** Callback when refresh is triggered */
  onRefresh: () => Promise<void>;
  /** Whether currently refreshing */
  isRefreshing?: boolean;
  /** Custom refresh color */
  refreshColor?: string;
  /** Background color of refresh indicator */
  refreshBackgroundColor?: string;
  /** Custom title while refreshing */
  refreshingTitle?: string;
  /** Children to render */
  children: ReactNode;
  /** Container style */
  containerStyle?: ViewStyle;
  /** Content container style */
  contentContainerStyle?: ViewStyle;
  /** Show last updated timestamp */
  showLastUpdated?: boolean;
  /** Last updated timestamp */
  lastUpdated?: Date | null;
  /** Disable refresh */
  disabled?: boolean;
}

// ============================================
// COMPONENT
// ============================================

export function RefreshableScrollView({
  onRefresh,
  isRefreshing: controlledRefreshing,
  refreshColor = colors.accent,
  refreshBackgroundColor,
  refreshingTitle,
  children,
  containerStyle,
  contentContainerStyle,
  showLastUpdated = false,
  lastUpdated,
  disabled = false,
  ...scrollViewProps
}: RefreshableScrollViewProps) {
  const [internalRefreshing, setInternalRefreshing] = useState(false);

  // Use controlled refreshing state if provided, otherwise use internal state
  const isRefreshing = controlledRefreshing ?? internalRefreshing;

  const handleRefresh = useCallback(async () => {
    if (disabled || isRefreshing) return;

    setInternalRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setInternalRefreshing(false);
    }
  }, [onRefresh, disabled, isRefreshing]);

  const formatLastUpdated = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <ScrollView
      style={[styles.container, containerStyle]}
      contentContainerStyle={contentContainerStyle}
      refreshControl={
        disabled ? undefined : (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={refreshColor}
            colors={[refreshColor]}
            progressBackgroundColor={refreshBackgroundColor}
            title={refreshingTitle}
            titleColor={colors.textSecondary}
          />
        )
      }
      scrollEventThrottle={16}
      {...scrollViewProps}
    >
      {/* Last Updated Indicator */}
      {showLastUpdated && lastUpdated && (
        <View style={styles.lastUpdatedContainer}>
          <Text style={styles.lastUpdatedText}>
            Updated {formatLastUpdated(lastUpdated)}
          </Text>
        </View>
      )}

      {children}
    </ScrollView>
  );
}

// ============================================
// HOOK FOR REFRESH STATE
// ============================================

export interface UseRefreshReturn {
  isRefreshing: boolean;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  setLastUpdated: (date: Date) => void;
}

/**
 * Hook to manage refresh state
 */
export function useRefresh(
  fetchFunction: () => Promise<void>
): UseRefreshReturn {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchFunction();
      setLastUpdated(new Date());
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchFunction]);

  return {
    isRefreshing,
    lastUpdated,
    refresh,
    setLastUpdated,
  };
}

// ============================================
// REFRESHABLE FLATLIST WRAPPER
// ============================================

import { FlatList, FlatListProps } from 'react-native';

export interface RefreshableFlatListProps<T> extends Omit<FlatListProps<T>, 'refreshControl'> {
  /** Callback when refresh is triggered */
  onRefresh: () => Promise<void>;
  /** Whether currently refreshing */
  isRefreshing?: boolean;
  /** Custom refresh color */
  refreshColor?: string;
  /** Disable refresh */
  disabled?: boolean;
}

export function RefreshableFlatList<T>({
  onRefresh,
  isRefreshing: controlledRefreshing,
  refreshColor = colors.accent,
  disabled = false,
  ...flatListProps
}: RefreshableFlatListProps<T>) {
  const [internalRefreshing, setInternalRefreshing] = useState(false);
  const isRefreshing = controlledRefreshing ?? internalRefreshing;

  const handleRefresh = useCallback(async () => {
    if (disabled || isRefreshing) return;

    setInternalRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setInternalRefreshing(false);
    }
  }, [onRefresh, disabled, isRefreshing]);

  return (
    <FlatList
      {...flatListProps}
      refreshControl={
        disabled ? undefined : (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={refreshColor}
            colors={[refreshColor]}
          />
        )
      }
    />
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lastUpdatedContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  lastUpdatedText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});

export default RefreshableScrollView;
