/**
 * Image Thumbnail Row
 * Displays attached image previews above the input box
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../../theme';
import type { ImageAttachment } from './ImageUploadBottomSheet';

type ImageThumbnailRowProps = {
  images: ImageAttachment[];
  onRemove: (id: string) => void;
  onAddMore?: () => void;
  maxImages?: number;
};

const THUMBNAIL_SIZE = 72;
const MAX_IMAGES_DEFAULT = 3;

export function ImageThumbnailRow({
  images,
  onRemove,
  onAddMore,
  maxImages = MAX_IMAGES_DEFAULT,
}: ImageThumbnailRowProps) {
  if (images.length === 0) return null;

  const canAddMore = images.length < maxImages;

  return (
    <View style={styles.container}>
      {/* Thumbnails */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {images.map((image, index) => (
          <View key={image.id} style={styles.thumbnailContainer}>
            <Image source={{ uri: image.uri }} style={styles.thumbnail} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => onRemove(image.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name="close" size={12} color={colors.textInverse} />
            </TouchableOpacity>
            <View style={styles.indexBadge}>
              <Text style={styles.indexText}>{index + 1}</Text>
            </View>
          </View>
        ))}

        {/* Add More Button */}
        {canAddMore && onAddMore && (
          <TouchableOpacity style={styles.addMoreButton} onPress={onAddMore}>
            <Icon name="add" size={24} color={colors.accent} />
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Helper Text */}
      <View style={styles.helperContainer}>
        <Icon name="bulb-outline" size={12} color={colors.textTertiary} />
        <Text style={styles.helperText}>
          Good light - 2 angles - include a coin/ruler for size
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  scrollContent: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingRight: spacing.xs,
  },
  thumbnailContainer: {
    position: 'relative',
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
  },
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: radius.sm,
    backgroundColor: colors.surface2,
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.subtle,
  },
  indexBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indexText: {
    ...typography.tiny,
    color: colors.textInverse,
    fontSize: 10,
  },
  addMoreButton: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface2,
  },
  helperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  helperText: {
    ...typography.tiny,
    color: colors.textTertiary,
    flex: 1,
  },
});

export default ImageThumbnailRow;
