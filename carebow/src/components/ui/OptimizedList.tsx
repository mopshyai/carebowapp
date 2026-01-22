/**
 * OptimizedList Components
 * Performance-optimized FlatList and SectionList wrappers
 */

import React, { useCallback, useMemo, ReactElement } from 'react';
import {
  FlatList,
  FlatListProps,
  SectionList,
  SectionListProps,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  ViewStyle,
  ListRenderItem,
} from 'react-native';
import { colors, spacing, typography, radius } from '../../theme';

// ============================================
// TYPES
// ============================================

export interface OptimizedFlatListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  /** Render item function */
  renderItem: ListRenderItem<T>;
  /** Loading state */
  isLoading?: boolean;
  /** Refreshing state */
  isRefreshing?: boolean;
  /** Refresh callback */
  onRefresh?: () => Promise<void> | void;
  /** Empty state component */
  EmptyComponent?: ReactElement;
  /** Empty state message */
  emptyMessage?: string;
  /** Empty state icon */
  emptyIcon?: string;
  /** Loading component */
  LoadingComponent?: ReactElement;
  /** Error state */
  error?: string | null;
  /** Retry callback on error */
  onRetry?: () => void;
  /** Enable pull-to-refresh */
  enableRefresh?: boolean;
  /** Estimated item size for optimization */
  estimatedItemSize?: number;
  /** Container style */
  containerStyle?: ViewStyle;
}

export interface OptimizedSectionListProps<T, S> extends Omit<SectionListProps<T, S>, 'renderItem'> {
  /** Render item function */
  renderItem: SectionListProps<T, S>['renderItem'];
  /** Loading state */
  isLoading?: boolean;
  /** Refreshing state */
  isRefreshing?: boolean;
  /** Refresh callback */
  onRefresh?: () => Promise<void> | void;
  /** Empty state component */
  EmptyComponent?: ReactElement;
  /** Empty state message */
  emptyMessage?: string;
  /** Loading component */
  LoadingComponent?: ReactElement;
  /** Enable pull-to-refresh */
  enableRefresh?: boolean;
}

// ============================================
// DEFAULT PERFORMANCE CONFIG
// ============================================

const PERFORMANCE_DEFAULTS = {
  /** Remove items that are off-screen */
  removeClippedSubviews: true,
  /** Max items to render per batch */
  maxToRenderPerBatch: 10,
  /** How many items to render initially */
  initialNumToRender: 10,
  /** Window size multiplier (5 = 5 screens worth of content) */
  windowSize: 5,
  /** Update frequency for scroll events */
  scrollEventThrottle: 16,
  /** Threshold for triggering onEndReached */
  onEndReachedThreshold: 0.5,
  /** How many items to keep mounted */
  updateCellsBatchingPeriod: 50,
};

// ============================================
// OPTIMIZED FLATLIST
// ============================================

export function OptimizedFlatList<T>({
  data,
  renderItem,
  keyExtractor,
  isLoading = false,
  isRefreshing = false,
  onRefresh,
  EmptyComponent,
  emptyMessage = 'No items found',
  emptyIcon,
  LoadingComponent,
  error,
  onRetry,
  enableRefresh = true,
  estimatedItemSize,
  containerStyle,
  ListHeaderComponent,
  ListFooterComponent,
  ItemSeparatorComponent,
  ...flatListProps
}: OptimizedFlatListProps<T>) {
  // Memoized key extractor
  const memoizedKeyExtractor = useCallback(
    (item: T, index: number) => {
      if (keyExtractor) {
        return keyExtractor(item, index);
      }
      // Default: use index as key (not ideal, but safe fallback)
      return String(index);
    },
    [keyExtractor]
  );

  // Memoized render item
  const memoizedRenderItem = useCallback(
    (info: { item: T; index: number; separators: any }) => {
      return renderItem(info);
    },
    [renderItem]
  );

  // Refresh control
  const refreshControl = useMemo(() => {
    if (!enableRefresh || !onRefresh) return undefined;
    return (
      <RefreshControl
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        tintColor={colors.accent}
        colors={[colors.accent]}
      />
    );
  }, [enableRefresh, onRefresh, isRefreshing]);

  // Loading state
  if (isLoading && !data?.length) {
    if (LoadingComponent) {
      return LoadingComponent;
    }
    return (
      <View style={[styles.centerContainer, containerStyle]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.centerContainer, containerStyle]}>
        <Text style={styles.errorText}>{error}</Text>
        {onRetry && (
          <Text style={styles.retryText} onPress={onRetry}>
            Tap to retry
          </Text>
        )}
      </View>
    );
  }

  // Empty state
  const renderEmptyComponent = () => {
    if (EmptyComponent) {
      return EmptyComponent;
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  };

  // Get item layout for fixed height items
  const getItemLayout = estimatedItemSize
    ? (_data: ArrayLike<T> | null | undefined, index: number) => ({
        length: estimatedItemSize,
        offset: estimatedItemSize * index,
        index,
      })
    : undefined;

  return (
    <FlatList
      data={data}
      renderItem={memoizedRenderItem}
      keyExtractor={memoizedKeyExtractor}
      refreshControl={refreshControl}
      ListEmptyComponent={renderEmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={
        ListFooterComponent || (isLoading && data?.length ? <ListFooterLoader /> : null)
      }
      ItemSeparatorComponent={ItemSeparatorComponent}
      getItemLayout={getItemLayout}
      // Performance optimizations
      removeClippedSubviews={PERFORMANCE_DEFAULTS.removeClippedSubviews}
      maxToRenderPerBatch={PERFORMANCE_DEFAULTS.maxToRenderPerBatch}
      initialNumToRender={PERFORMANCE_DEFAULTS.initialNumToRender}
      windowSize={PERFORMANCE_DEFAULTS.windowSize}
      scrollEventThrottle={PERFORMANCE_DEFAULTS.scrollEventThrottle}
      onEndReachedThreshold={PERFORMANCE_DEFAULTS.onEndReachedThreshold}
      updateCellsBatchingPeriod={PERFORMANCE_DEFAULTS.updateCellsBatchingPeriod}
      // Accessibility
      accessibilityRole="list"
      {...flatListProps}
      style={[styles.list, flatListProps.style]}
      contentContainerStyle={[
        styles.contentContainer,
        !data?.length && styles.emptyContentContainer,
        flatListProps.contentContainerStyle,
      ]}
    />
  );
}

// ============================================
// OPTIMIZED SECTION LIST
// ============================================

export function OptimizedSectionList<T, S>({
  sections,
  renderItem,
  renderSectionHeader,
  keyExtractor,
  isLoading = false,
  isRefreshing = false,
  onRefresh,
  EmptyComponent,
  emptyMessage = 'No items found',
  LoadingComponent,
  enableRefresh = true,
  ...sectionListProps
}: OptimizedSectionListProps<T, S>) {
  // Refresh control
  const refreshControl = useMemo(() => {
    if (!enableRefresh || !onRefresh) return undefined;
    return (
      <RefreshControl
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        tintColor={colors.accent}
        colors={[colors.accent]}
      />
    );
  }, [enableRefresh, onRefresh, isRefreshing]);

  // Loading state
  if (isLoading && !sections?.length) {
    if (LoadingComponent) {
      return LoadingComponent;
    }
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Empty state
  const renderEmptyComponent = () => {
    if (EmptyComponent) {
      return EmptyComponent;
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  };

  return (
    <SectionList
      sections={sections}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      keyExtractor={keyExtractor}
      refreshControl={refreshControl}
      ListEmptyComponent={renderEmptyComponent}
      // Performance optimizations
      removeClippedSubviews={PERFORMANCE_DEFAULTS.removeClippedSubviews}
      maxToRenderPerBatch={PERFORMANCE_DEFAULTS.maxToRenderPerBatch}
      initialNumToRender={PERFORMANCE_DEFAULTS.initialNumToRender}
      windowSize={PERFORMANCE_DEFAULTS.windowSize}
      scrollEventThrottle={PERFORMANCE_DEFAULTS.scrollEventThrottle}
      stickySectionHeadersEnabled
      {...sectionListProps}
      style={[styles.list, sectionListProps.style]}
      contentContainerStyle={[
        styles.contentContainer,
        !sections?.length && styles.emptyContentContainer,
        sectionListProps.contentContainerStyle,
      ]}
    />
  );
}

// ============================================
// LIST FOOTER LOADER
// ============================================

function ListFooterLoader() {
  return (
    <View style={styles.footerLoader}>
      <ActivityIndicator size="small" color={colors.accent} />
    </View>
  );
}

// ============================================
// LIST ITEM WRAPPER (for memoization)
// ============================================

interface MemoizedListItemProps<T> {
  item: T;
  index: number;
  renderItem: (item: T, index: number) => ReactElement;
}

export const MemoizedListItem = React.memo(function MemoizedListItem<T>({
  item,
  index,
  renderItem,
}: MemoizedListItemProps<T>) {
  return renderItem(item, index);
}) as <T>(props: MemoizedListItemProps<T>) => ReactElement;

// ============================================
// SEPARATOR COMPONENTS
// ============================================

export function ListSeparator({ height = 1 }: { height?: number }) {
  return <View style={[styles.separator, { height }]} />;
}

export function ListSeparatorWithPadding({ paddingLeft = 0 }: { paddingLeft?: number }) {
  return (
    <View style={[styles.separatorWithPadding, { marginLeft: paddingLeft }]} />
  );
}

export function ListItemGap({ size = spacing.sm }: { size?: number }) {
  return <View style={{ height: size }} />;
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  emptyContentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  retryText: {
    ...typography.label,
    color: colors.accent,
    padding: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  separator: {
    backgroundColor: colors.border,
  },
  separatorWithPadding: {
    height: 1,
    backgroundColor: colors.border,
  },
});

export default OptimizedFlatList;
