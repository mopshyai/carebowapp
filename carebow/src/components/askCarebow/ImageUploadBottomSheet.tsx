/**
 * Image Upload Bottom Sheet
 * Bottom sheet for selecting images (camera or library)
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../../theme';

// Dynamic import for react-native-image-picker to handle cases where native module isn't linked
let launchCamera: any;
let launchImageLibrary: any;

try {
  const ImagePicker = require('react-native-image-picker');
  launchCamera = ImagePicker.launchCamera;
  launchImageLibrary = ImagePicker.launchImageLibrary;
} catch (e) {
  // Fallback - will show alert if picker isn't available
  launchCamera = null;
  launchImageLibrary = null;
}

type ImagePickerResponse = {
  didCancel?: boolean;
  errorCode?: string;
  errorMessage?: string;
  assets?: Array<{
    uri?: string;
    type?: string;
    fileName?: string;
    fileSize?: number;
    width?: number;
    height?: number;
  }>;
};

export type ImageAttachment = {
  id: string;
  uri: string;
  type: string;
  fileName?: string;
  fileSize?: number;
  width?: number;
  height?: number;
};

type ImageUploadBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  onImagesSelected: (images: ImageAttachment[]) => void;
  currentImageCount: number;
  maxImages?: number;
};

const MAX_IMAGES_DEFAULT = 3;

export function ImageUploadBottomSheet({
  visible,
  onClose,
  onImagesSelected,
  currentImageCount,
  maxImages = MAX_IMAGES_DEFAULT,
}: ImageUploadBottomSheetProps) {
  const remainingSlots = maxImages - currentImageCount;

  const processResponse = (response: ImagePickerResponse) => {
    if (response.didCancel) {
      return;
    }

    if (response.errorCode) {
      Alert.alert('Error', response.errorMessage || 'Failed to select image');
      return;
    }

    if (response.assets && response.assets.length > 0) {
      const newImages: ImageAttachment[] = response.assets
        .slice(0, remainingSlots)
        .map((asset) => ({
          id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          uri: asset.uri || '',
          type: asset.type || 'image/jpeg',
          fileName: asset.fileName,
          fileSize: asset.fileSize,
          width: asset.width,
          height: asset.height,
        }));

      onImagesSelected(newImages);
      onClose();
    }
  };

  const handleTakePhoto = async () => {
    if (remainingSlots <= 0) {
      Alert.alert('Limit Reached', `You can only add up to ${maxImages} images.`);
      return;
    }

    if (!launchCamera) {
      Alert.alert(
        'Camera Not Available',
        'Image picker is not configured. Please run `npx pod-install` and rebuild the app.',
        [{ text: 'OK', onPress: onClose }]
      );
      return;
    }

    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1200,
        maxHeight: 1200,
        includeBase64: false,
      });

      processResponse(result);
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera. Please check permissions.');
    }
  };

  const handleChooseFromLibrary = async () => {
    if (remainingSlots <= 0) {
      Alert.alert('Limit Reached', `You can only add up to ${maxImages} images.`);
      return;
    }

    if (!launchImageLibrary) {
      Alert.alert(
        'Photo Library Not Available',
        'Image picker is not configured. Please run `npx pod-install` and rebuild the app.',
        [{ text: 'OK', onPress: onClose }]
      );
      return;
    }

    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1200,
        maxHeight: 1200,
        selectionLimit: remainingSlots,
        includeBase64: false,
      });

      processResponse(result);
    } catch (error) {
      console.error('Library error:', error);
      Alert.alert('Error', 'Failed to open photo library. Please check permissions.');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Add Photo</Text>
            <Text style={styles.subtitle}>
              {remainingSlots > 0
                ? `You can add ${remainingSlots} more ${remainingSlots === 1 ? 'photo' : 'photos'}`
                : 'Maximum photos reached'}
            </Text>
          </View>

          {/* Options */}
          <View style={styles.options}>
            <TouchableOpacity
              style={[styles.option, remainingSlots <= 0 && styles.optionDisabled]}
              onPress={handleTakePhoto}
              disabled={remainingSlots <= 0}
            >
              <View style={[styles.optionIcon, { backgroundColor: colors.accentMuted }]}>
                <Icon name="camera" size={24} color={colors.accent} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Take Photo</Text>
                <Text style={styles.optionDescription}>Use your camera to capture the symptom</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.option, remainingSlots <= 0 && styles.optionDisabled]}
              onPress={handleChooseFromLibrary}
              disabled={remainingSlots <= 0}
            >
              <View style={[styles.optionIcon, { backgroundColor: colors.infoSoft }]}>
                <Icon name="images" size={24} color={colors.info} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Choose from Library</Text>
                <Text style={styles.optionDescription}>
                  Select up to {remainingSlots} existing {remainingSlots === 1 ? 'photo' : 'photos'}
                </Text>
              </View>
              <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>

          {/* Photo Tips */}
          <View style={styles.tipsSection}>
            <View style={styles.tipHeader}>
              <Icon name="bulb" size={16} color={colors.accent} />
              <Text style={styles.tipTitle}>For best results</Text>
            </View>
            <View style={styles.tipsList}>
              <Text style={styles.tipItem}>Good lighting - natural light works best</Text>
              <Text style={styles.tipItem}>Take from 2 angles if possible</Text>
              <Text style={styles.tipItem}>Include a coin or ruler for size reference</Text>
            </View>
          </View>

          {/* Cancel Button */}
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
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
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? spacing.xxxl : spacing.xl,
    paddingHorizontal: spacing.lg,
    ...shadows.cardElevated,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  options: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  optionDescription: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  tipsSection: {
    backgroundColor: colors.accentMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  tipTitle: {
    ...typography.labelSmall,
    color: colors.accent,
  },
  tipsList: {
    gap: spacing.xxs,
  },
  tipItem: {
    ...typography.caption,
    color: colors.textSecondary,
    paddingLeft: spacing.lg,
  },
  cancelButton: {
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...typography.label,
    color: colors.textSecondary,
  },
});

export default ImageUploadBottomSheet;
