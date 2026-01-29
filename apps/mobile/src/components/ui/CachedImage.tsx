/**
 * CachedImage Component
 * Image component with automatic caching using FastImage
 */

import React, { memo, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  ImageStyle,
  ActivityIndicator,
} from 'react-native';
import FastImage, {
  FastImageProps,
  ResizeMode,
  Priority,
  OnLoadEvent,
  OnProgressEvent,
} from 'react-native-fast-image';
import { colors, radius } from '@/theme';

// ============================================
// TYPES
// ============================================

export interface CachedImageProps {
  /** Image source URI */
  uri: string;
  /** Image width */
  width?: number | string;
  /** Image height */
  height?: number | string;
  /** Resize mode */
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
  /** Loading priority */
  priority?: 'low' | 'normal' | 'high';
  /** Border radius */
  borderRadius?: number;
  /** Show loading indicator */
  showLoader?: boolean;
  /** Placeholder component while loading */
  placeholder?: React.ReactNode;
  /** Error placeholder component */
  errorPlaceholder?: React.ReactNode;
  /** Container style */
  style?: ViewStyle;
  /** Image style */
  imageStyle?: ImageStyle;
  /** Called when image loads */
  onLoad?: (event: OnLoadEvent) => void;
  /** Called on load error */
  onError?: () => void;
  /** Test ID */
  testID?: string;
  /** Accessibility label */
  accessibilityLabel?: string;
}

// ============================================
// PRIORITY MAPPING
// ============================================

const priorityMap: Record<string, Priority> = {
  low: FastImage.priority.low,
  normal: FastImage.priority.normal,
  high: FastImage.priority.high,
};

const resizeModeMap: Record<string, ResizeMode> = {
  contain: FastImage.resizeMode.contain,
  cover: FastImage.resizeMode.cover,
  stretch: FastImage.resizeMode.stretch,
  center: FastImage.resizeMode.center,
};

// ============================================
// COMPONENT
// ============================================

export const CachedImage = memo(function CachedImage({
  uri,
  width = '100%',
  height = '100%',
  resizeMode = 'cover',
  priority = 'normal',
  borderRadius = 0,
  showLoader = true,
  placeholder,
  errorPlaceholder,
  style,
  imageStyle,
  onLoad,
  onError,
  testID,
  accessibilityLabel,
}: CachedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
  }, []);

  const handleLoad = useCallback((event: OnLoadEvent) => {
    setIsLoading(false);
    onLoad?.(event);
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  }, [onError]);

  const containerStyle: ViewStyle = {
    width: width as number,
    height: height as number,
    borderRadius,
    overflow: 'hidden',
  };

  // Show error placeholder
  if (hasError && errorPlaceholder) {
    return (
      <View style={[containerStyle, styles.container, style]} testID={testID}>
        {errorPlaceholder}
      </View>
    );
  }

  // Show error state without custom placeholder
  if (hasError) {
    return (
      <View style={[containerStyle, styles.container, styles.errorContainer, style]} testID={testID}>
        <View style={styles.errorIcon} />
      </View>
    );
  }

  return (
    <View style={[containerStyle, styles.container, style]} testID={testID}>
      <FastImage
        style={[styles.image, { borderRadius }, imageStyle]}
        source={{
          uri,
          priority: priorityMap[priority],
          cache: FastImage.cacheControl.immutable,
        }}
        resizeMode={resizeModeMap[resizeMode]}
        onLoadStart={handleLoadStart}
        onLoad={handleLoad}
        onError={handleError}
        accessible={!!accessibilityLabel}
        accessibilityLabel={accessibilityLabel}
      />

      {/* Loading indicator */}
      {isLoading && showLoader && (
        <View style={styles.loaderContainer}>
          {placeholder || (
            <ActivityIndicator size="small" color={colors.accent} />
          )}
        </View>
      )}
    </View>
  );
});

// ============================================
// AVATAR VARIANT
// ============================================

export interface CachedAvatarProps extends Omit<CachedImageProps, 'width' | 'height' | 'borderRadius'> {
  /** Avatar size */
  size?: number;
}

export const CachedAvatar = memo(function CachedAvatar({
  size = 48,
  ...props
}: CachedAvatarProps) {
  return (
    <CachedImage
      {...props}
      width={size}
      height={size}
      borderRadius={size / 2}
    />
  );
});

// ============================================
// THUMBNAIL VARIANT
// ============================================

export interface CachedThumbnailProps extends Omit<CachedImageProps, 'borderRadius'> {
  /** Rounded corners */
  rounded?: boolean;
}

export const CachedThumbnail = memo(function CachedThumbnail({
  rounded = true,
  ...props
}: CachedThumbnailProps) {
  return (
    <CachedImage
      {...props}
      borderRadius={rounded ? radius.sm : 0}
      priority="low"
    />
  );
});

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface2,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface2,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface2,
  },
  errorIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.border,
  },
});

export default CachedImage;
