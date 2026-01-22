/**
 * LoadingSpinner Component
 * Reusable loading indicator with variants and skeleton loaders
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  ViewStyle,
  Animated,
  Easing,
} from 'react-native';
import { colors, typography, spacing, radius } from '@/theme';

// ============================================
// TYPES
// ============================================

export type LoadingSize = 'small' | 'medium' | 'large';
export type LoadingVariant = 'default' | 'overlay' | 'inline';

export interface LoadingSpinnerProps {
  /** Size preset */
  size?: LoadingSize;
  /** Visual variant */
  variant?: LoadingVariant;
  /** Spinner color */
  color?: string;
  /** Loading text */
  text?: string;
  /** Container style */
  style?: ViewStyle;
}

// ============================================
// COMPONENT
// ============================================

export function LoadingSpinner({
  size = 'medium',
  variant = 'default',
  color,
  text,
  style,
}: LoadingSpinnerProps) {
  const sizeValue = getSizeValue(size);
  const spinnerColor = color || colors.accent;

  const content = (
    <>
      <ActivityIndicator
        size={size === 'small' ? 'small' : 'large'}
        color={spinnerColor}
      />
      {text && (
        <Text style={[styles.text, size === 'small' && styles.textSmall]}>
          {text}
        </Text>
      )}
    </>
  );

  if (variant === 'overlay') {
    return (
      <View style={[styles.overlay, style]}>
        <View style={styles.overlayContent}>
          {content}
        </View>
      </View>
    );
  }

  if (variant === 'inline') {
    return (
      <View style={[styles.inline, style]}>
        {content}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {content}
    </View>
  );
}

// ============================================
// SIZE VALUES
// ============================================

function getSizeValue(size: LoadingSize): 'small' | 'large' {
  switch (size) {
    case 'small':
      return 'small';
    case 'medium':
    case 'large':
    default:
      return 'large';
  }
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    gap: spacing.sm,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  overlayContent: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  text: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  textSmall: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
});

// ============================================
// FULL SCREEN LOADING
// ============================================

interface FullScreenLoadingProps {
  text?: string;
  color?: string;
}

export function FullScreenLoading({ text = 'Loading...', color }: FullScreenLoadingProps) {
  return (
    <View style={fullScreenStyles.container}>
      <LoadingSpinner size="large" color={color} text={text} />
    </View>
  );
}

const fullScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ============================================
// SKELETON LOADER WITH SHIMMER
// ============================================

interface SkeletonProps {
  /** Width of skeleton */
  width?: number | string;
  /** Height of skeleton */
  height?: number;
  /** Border radius */
  borderRadius?: number;
  /** Enable shimmer animation */
  animated?: boolean;
  /** Container style */
  style?: ViewStyle;
}

/**
 * Skeleton component with optional shimmer animation
 */
export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 4,
  animated = true,
  style,
}: SkeletonProps) {
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;

    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    );

    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [animated, shimmerValue]);

  const opacity = animated
    ? shimmerValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
      })
    : 0.5;

  return (
    <Animated.View
      style={[
        skeletonStyles.base,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

const skeletonStyles = StyleSheet.create({
  base: {
    backgroundColor: colors.border,
  },
});

// ============================================
// SKELETON VARIANTS
// ============================================

interface SkeletonTextProps {
  /** Number of lines */
  lines?: number;
  /** Line height */
  lineHeight?: number;
  /** Gap between lines */
  gap?: number;
  /** Last line width percentage */
  lastLineWidth?: string;
  /** Enable animation */
  animated?: boolean;
  /** Container style */
  style?: ViewStyle;
}

/**
 * Multi-line skeleton text
 */
export function SkeletonText({
  lines = 3,
  lineHeight = 14,
  gap = 8,
  lastLineWidth = '60%',
  animated = true,
  style,
}: SkeletonTextProps) {
  return (
    <View style={style}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? lastLineWidth : '100%'}
          height={lineHeight}
          borderRadius={4}
          animated={animated}
          style={index > 0 ? { marginTop: gap } : undefined}
        />
      ))}
    </View>
  );
}

interface SkeletonAvatarProps {
  /** Size of avatar */
  size?: number;
  /** Circle or rounded square */
  variant?: 'circle' | 'rounded';
  /** Enable animation */
  animated?: boolean;
  /** Container style */
  style?: ViewStyle;
}

/**
 * Avatar skeleton placeholder
 */
export function SkeletonAvatar({
  size = 48,
  variant = 'circle',
  animated = true,
  style,
}: SkeletonAvatarProps) {
  return (
    <Skeleton
      width={size}
      height={size}
      borderRadius={variant === 'circle' ? size / 2 : radius.md}
      animated={animated}
      style={style}
    />
  );
}

interface SkeletonButtonProps {
  /** Width of button */
  width?: number | string;
  /** Height of button */
  height?: number;
  /** Enable animation */
  animated?: boolean;
  /** Container style */
  style?: ViewStyle;
}

/**
 * Button skeleton placeholder
 */
export function SkeletonButton({
  width = '100%',
  height = 48,
  animated = true,
  style,
}: SkeletonButtonProps) {
  return (
    <Skeleton
      width={width}
      height={height}
      borderRadius={radius.md}
      animated={animated}
      style={style}
    />
  );
}

// ============================================
// SKELETON CARD
// ============================================

interface SkeletonCardProps {
  /** Show avatar in header */
  showAvatar?: boolean;
  /** Show image placeholder */
  showImage?: boolean;
  /** Number of text lines */
  textLines?: number;
  /** Enable animation */
  animated?: boolean;
  /** Container style */
  style?: ViewStyle;
}

/**
 * Card skeleton with header, content, and optional image
 */
export function SkeletonCard({
  showAvatar = true,
  showImage = false,
  textLines = 2,
  animated = true,
  style,
}: SkeletonCardProps) {
  return (
    <View style={[skeletonCardStyles.container, style]}>
      {/* Optional image */}
      {showImage && (
        <Skeleton
          width="100%"
          height={160}
          borderRadius={radius.md}
          animated={animated}
          style={{ marginBottom: spacing.md }}
        />
      )}

      {/* Header */}
      <View style={skeletonCardStyles.header}>
        {showAvatar && (
          <SkeletonAvatar size={48} animated={animated} />
        )}
        <View style={[skeletonCardStyles.headerText, !showAvatar && { marginLeft: 0 }]}>
          <Skeleton width="60%" height={16} animated={animated} />
          <Skeleton width="40%" height={12} animated={animated} style={{ marginTop: 8 }} />
        </View>
      </View>

      {/* Content */}
      {textLines > 0 && (
        <SkeletonText
          lines={textLines}
          animated={animated}
          style={{ marginTop: spacing.md }}
        />
      )}
    </View>
  );
}

const skeletonCardStyles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: spacing.md,
  },
});

// ============================================
// SKELETON LIST
// ============================================

interface SkeletonListProps {
  /** Number of items */
  count?: number;
  /** Item height */
  itemHeight?: number;
  /** Gap between items */
  gap?: number;
  /** Show separator lines */
  showSeparator?: boolean;
  /** Enable animation */
  animated?: boolean;
  /** Container style */
  style?: ViewStyle;
}

/**
 * List skeleton with multiple items
 */
export function SkeletonList({
  count = 5,
  itemHeight = 72,
  gap = 0,
  showSeparator = true,
  animated = true,
  style,
}: SkeletonListProps) {
  return (
    <View style={style}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index}>
          <View style={[skeletonListStyles.item, { height: itemHeight }]}>
            <SkeletonAvatar size={48} animated={animated} />
            <View style={skeletonListStyles.itemContent}>
              <Skeleton width="70%" height={16} animated={animated} />
              <Skeleton width="50%" height={12} animated={animated} style={{ marginTop: 6 }} />
            </View>
            <Skeleton width={24} height={24} borderRadius={12} animated={animated} />
          </View>
          {showSeparator && index < count - 1 && (
            <View style={[skeletonListStyles.separator, gap > 0 && { marginVertical: gap / 2 }]} />
          )}
        </View>
      ))}
    </View>
  );
}

const skeletonListStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  itemContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 76, // Avatar + padding
  },
});

// ============================================
// SKELETON GRID
// ============================================

interface SkeletonGridProps {
  /** Number of columns */
  columns?: number;
  /** Number of rows */
  rows?: number;
  /** Item aspect ratio (width/height) */
  aspectRatio?: number;
  /** Gap between items */
  gap?: number;
  /** Enable animation */
  animated?: boolean;
  /** Container style */
  style?: ViewStyle;
}

/**
 * Grid skeleton for image galleries or product grids
 */
export function SkeletonGrid({
  columns = 2,
  rows = 2,
  aspectRatio = 1,
  gap = spacing.sm,
  animated = true,
  style,
}: SkeletonGridProps) {
  return (
    <View style={[skeletonGridStyles.container, style]}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <View
          key={rowIndex}
          style={[skeletonGridStyles.row, rowIndex > 0 && { marginTop: gap }]}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <View
              key={colIndex}
              style={[
                skeletonGridStyles.item,
                { aspectRatio },
                colIndex > 0 && { marginLeft: gap },
              ]}
            >
              <Skeleton
                width="100%"
                height={100}
                borderRadius={radius.md}
                animated={animated}
                style={{ flex: 1 }}
              />
              <Skeleton
                width="80%"
                height={14}
                animated={animated}
                style={{ marginTop: spacing.xs }}
              />
              <Skeleton
                width="50%"
                height={12}
                animated={animated}
                style={{ marginTop: 4 }}
              />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const skeletonGridStyles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
  },
  item: {
    flex: 1,
  },
});

// ============================================
// SCREEN SKELETONS
// ============================================

interface SkeletonScreenProps {
  /** Enable animation */
  animated?: boolean;
  /** Container style */
  style?: ViewStyle;
}

/**
 * Full screen skeleton for home/dashboard screens
 */
export function SkeletonHomeScreen({ animated = true, style }: SkeletonScreenProps) {
  return (
    <View style={[screenSkeletonStyles.container, style]}>
      {/* Header */}
      <View style={screenSkeletonStyles.header}>
        <View>
          <Skeleton width={120} height={14} animated={animated} />
          <Skeleton width={180} height={24} animated={animated} style={{ marginTop: 8 }} />
        </View>
        <SkeletonAvatar size={48} animated={animated} />
      </View>

      {/* Search bar */}
      <Skeleton
        width="100%"
        height={48}
        borderRadius={radius.lg}
        animated={animated}
        style={{ marginTop: spacing.lg }}
      />

      {/* Quick actions */}
      <View style={screenSkeletonStyles.quickActions}>
        {Array.from({ length: 4 }).map((_, index) => (
          <View key={index} style={screenSkeletonStyles.quickAction}>
            <Skeleton width={56} height={56} borderRadius={radius.md} animated={animated} />
            <Skeleton width={48} height={12} animated={animated} style={{ marginTop: 8 }} />
          </View>
        ))}
      </View>

      {/* Cards */}
      <SkeletonCard animated={animated} style={{ marginTop: spacing.lg }} />
      <SkeletonCard animated={animated} style={{ marginTop: spacing.md }} showAvatar={false} />
    </View>
  );
}

/**
 * Profile screen skeleton
 */
export function SkeletonProfileScreen({ animated = true, style }: SkeletonScreenProps) {
  return (
    <View style={[screenSkeletonStyles.container, style]}>
      {/* Avatar and name */}
      <View style={screenSkeletonStyles.profileHeader}>
        <SkeletonAvatar size={96} animated={animated} />
        <Skeleton width={160} height={24} animated={animated} style={{ marginTop: spacing.md }} />
        <Skeleton width={200} height={14} animated={animated} style={{ marginTop: 8 }} />
      </View>

      {/* Stats */}
      <View style={screenSkeletonStyles.stats}>
        {Array.from({ length: 3 }).map((_, index) => (
          <View key={index} style={screenSkeletonStyles.stat}>
            <Skeleton width={48} height={28} animated={animated} />
            <Skeleton width={64} height={12} animated={animated} style={{ marginTop: 4 }} />
          </View>
        ))}
      </View>

      {/* Menu items */}
      <SkeletonList count={5} animated={animated} style={{ marginTop: spacing.lg }} />
    </View>
  );
}

/**
 * Detail screen skeleton
 */
export function SkeletonDetailScreen({ animated = true, style }: SkeletonScreenProps) {
  return (
    <View style={[screenSkeletonStyles.container, style]}>
      {/* Image */}
      <Skeleton width="100%" height={240} borderRadius={0} animated={animated} />

      {/* Content */}
      <View style={{ padding: spacing.lg }}>
        <Skeleton width="80%" height={28} animated={animated} />
        <Skeleton width="50%" height={16} animated={animated} style={{ marginTop: 8 }} />

        <View style={{ marginTop: spacing.lg }}>
          <SkeletonText lines={4} animated={animated} />
        </View>

        <View style={{ marginTop: spacing.xl }}>
          <Skeleton width="40%" height={20} animated={animated} />
          <SkeletonText lines={3} animated={animated} style={{ marginTop: spacing.sm }} />
        </View>

        <SkeletonButton animated={animated} style={{ marginTop: spacing.xl }} />
      </View>
    </View>
  );
}

const screenSkeletonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  quickAction: {
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  stat: {
    alignItems: 'center',
  },
});

export default LoadingSpinner;
