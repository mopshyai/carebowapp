/**
 * FileUpload Component
 * Reusable file upload with document picker integration, preview, and progress
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
  ViewStyle,
  Platform,
} from 'react-native';
import DocumentPicker, {
  DocumentPickerResponse,
  types,
} from 'react-native-document-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing, radius, shadows } from '@/theme';

// ============================================
// TYPES
// ============================================

export interface SelectedFile {
  uri: string;
  name: string;
  size: number;
  type: string;
}

export interface FileUploadProps {
  /** Current selected files */
  files?: SelectedFile[];
  /** Callback when files are selected */
  onFilesSelected: (files: SelectedFile[]) => void;
  /** Callback when a file is removed */
  onFileRemoved?: (file: SelectedFile) => void;
  /** Allow multiple file selection */
  multiple?: boolean;
  /** Maximum number of files (when multiple is true) */
  maxFiles?: number;
  /** Maximum file size in bytes (default 10MB) */
  maxFileSize?: number;
  /** Accepted file types */
  acceptedTypes?: AcceptedFileType[];
  /** Upload progress (0-100) */
  uploadProgress?: number;
  /** Whether upload is in progress */
  isUploading?: boolean;
  /** Error message */
  error?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Label text */
  label?: string;
  /** Helper text */
  helper?: string;
  /** Container style */
  containerStyle?: ViewStyle;
  /** Compact mode (smaller dropzone) */
  compact?: boolean;
}

export type AcceptedFileType =
  | 'pdf'
  | 'image'
  | 'document'
  | 'spreadsheet'
  | 'all';

// ============================================
// CONSTANTS
// ============================================

const FILE_TYPE_CONFIG: Record<AcceptedFileType, { mimeTypes: string[]; extensions: string[] }> = {
  pdf: {
    mimeTypes: ['application/pdf'],
    extensions: ['pdf'],
  },
  image: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic'],
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic'],
  },
  document: {
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ],
    extensions: ['pdf', 'doc', 'docx', 'txt'],
  },
  spreadsheet: {
    mimeTypes: [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ],
    extensions: ['xls', 'xlsx', 'csv'],
  },
  all: {
    mimeTypes: ['*/*'],
    extensions: ['*'],
  },
};

const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// ============================================
// HELPERS
// ============================================

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const getFileIcon = (type: string): string => {
  if (type.startsWith('image/')) return 'image';
  if (type === 'application/pdf') return 'document-text';
  if (type.includes('word') || type.includes('document')) return 'document';
  if (type.includes('excel') || type.includes('spreadsheet') || type.includes('csv')) return 'grid';
  return 'document-outline';
};

const getFileExtension = (filename: string): string => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
};

const isImageFile = (type: string): boolean => {
  return type.startsWith('image/');
};

// ============================================
// COMPONENT
// ============================================

export function FileUpload({
  files = [],
  onFilesSelected,
  onFileRemoved,
  multiple = false,
  maxFiles = 5,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  acceptedTypes = ['all'],
  uploadProgress,
  isUploading = false,
  error,
  disabled = false,
  label,
  helper,
  containerStyle,
  compact = false,
}: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const getAcceptedExtensions = useCallback((): string[] => {
    const extensions: string[] = [];
    acceptedTypes.forEach((type) => {
      extensions.push(...FILE_TYPE_CONFIG[type].extensions);
    });
    return [...new Set(extensions)];
  }, [acceptedTypes]);

  const validateFile = useCallback(
    (file: SelectedFile): string | null => {
      // Check file size
      if (file.size > maxFileSize) {
        return `File size exceeds ${formatFileSize(maxFileSize)} limit`;
      }

      // Check file type
      const extensions = getAcceptedExtensions();
      if (!extensions.includes('*')) {
        const fileExtension = getFileExtension(file.name);
        if (!extensions.includes(fileExtension)) {
          return `File type .${fileExtension} is not allowed`;
        }
      }

      return null;
    },
    [maxFileSize, getAcceptedExtensions]
  );

  const getDocumentPickerTypes = useCallback(() => {
    const pickerTypes: string[] = [];
    acceptedTypes.forEach((type) => {
      switch (type) {
        case 'pdf':
          pickerTypes.push(types.pdf);
          break;
        case 'image':
          pickerTypes.push(types.images);
          break;
        case 'document':
          pickerTypes.push(types.pdf, types.doc, types.docx, types.plainText);
          break;
        case 'spreadsheet':
          pickerTypes.push(types.xls, types.xlsx, types.csv);
          break;
        case 'all':
        default:
          pickerTypes.push(types.allFiles);
          break;
      }
    });
    return [...new Set(pickerTypes)];
  }, [acceptedTypes]);

  const handleSelectFiles = useCallback(async () => {
    if (disabled || isUploading) return;

    // Check max files limit
    if (multiple && files.length >= maxFiles) {
      Alert.alert('Limit Reached', `Maximum ${maxFiles} files allowed`);
      return;
    }

    try {
      const pickerTypes = getDocumentPickerTypes();
      const remainingSlots = multiple ? maxFiles - files.length : 1;

      const results: DocumentPickerResponse[] = await DocumentPicker.pick({
        type: pickerTypes,
        allowMultiSelection: multiple && remainingSlots > 1,
        copyTo: 'cachesDirectory',
      });

      // Convert results to SelectedFile format
      const newFiles: SelectedFile[] = [];
      const errors: string[] = [];

      for (const result of results.slice(0, remainingSlots)) {
        const selectedFile: SelectedFile = {
          uri: result.fileCopyUri || result.uri,
          name: result.name || 'Unknown File',
          size: result.size || 0,
          type: result.type || 'application/octet-stream',
        };

        const validationError = validateFile(selectedFile);
        if (validationError) {
          errors.push(`${selectedFile.name}: ${validationError}`);
        } else {
          newFiles.push(selectedFile);
        }
      }

      // Show validation errors if any
      if (errors.length > 0) {
        Alert.alert(
          'Some files could not be added',
          errors.join('\n'),
          [{ text: 'OK' }]
        );
      }

      // Add valid files
      if (newFiles.length > 0) {
        if (multiple) {
          onFilesSelected([...files, ...newFiles]);
        } else {
          onFilesSelected(newFiles);
        }
      }
    } catch (err: unknown) {
      // Handle cancellation
      if (DocumentPicker.isCancel(err)) {
        // User cancelled, do nothing
        return;
      }
      console.error('[FileUpload] Error picking document:', err);
      Alert.alert('Error', 'Failed to select file. Please try again.');
    }
  }, [disabled, isUploading, multiple, files, maxFiles, onFilesSelected, validateFile, getDocumentPickerTypes]);

  const handleRemoveFile = useCallback(
    (file: SelectedFile) => {
      if (disabled || isUploading) return;

      Alert.alert('Remove File', `Remove "${file.name}"?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const newFiles = files.filter((f) => f.uri !== file.uri);
            onFilesSelected(newFiles);
            onFileRemoved?.(file);
          },
        },
      ]);
    },
    [disabled, isUploading, files, onFilesSelected, onFileRemoved]
  );

  const hasError = !!error;
  const canAddMore = multiple ? files.length < maxFiles : files.length === 0;
  const acceptedExtList = getAcceptedExtensions().filter((e) => e !== '*');

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label */}
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Upload Dropzone */}
      {canAddMore && (
        <TouchableOpacity
          style={[
            styles.dropzone,
            compact && styles.dropzoneCompact,
            isDragActive && styles.dropzoneActive,
            hasError && styles.dropzoneError,
            disabled && styles.dropzoneDisabled,
          ]}
          onPress={handleSelectFiles}
          disabled={disabled || isUploading}
          activeOpacity={0.7}
        >
          <View style={[styles.dropzoneContent, compact && styles.dropzoneContentCompact]}>
            <View style={[styles.iconContainer, compact && styles.iconContainerCompact]}>
              <Icon
                name="cloud-upload-outline"
                size={compact ? 24 : 32}
                color={hasError ? colors.error : colors.accent}
              />
            </View>
            <Text style={[styles.dropzoneTitle, compact && styles.dropzoneTitleCompact]}>
              {compact ? 'Upload File' : 'Tap to upload'}
            </Text>
            {!compact && (
              <Text style={styles.dropzoneSubtitle}>
                {acceptedExtList.length > 0
                  ? `Accepts: ${acceptedExtList.map((e) => `.${e}`).join(', ')}`
                  : 'All file types accepted'}
              </Text>
            )}
            {!compact && (
              <Text style={styles.dropzoneLimit}>Max {formatFileSize(maxFileSize)}</Text>
            )}
          </View>
        </TouchableOpacity>
      )}

      {/* Selected Files List */}
      {files.length > 0 && (
        <View style={styles.filesList}>
          {files.map((file, index) => (
            <FilePreviewCard
              key={file.uri + index}
              file={file}
              onRemove={() => handleRemoveFile(file)}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              disabled={disabled}
            />
          ))}
        </View>
      )}

      {/* Error Message */}
      {hasError && (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={14} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Helper Text */}
      {helper && !hasError && <Text style={styles.helperText}>{helper}</Text>}

      {/* File Count */}
      {multiple && files.length > 0 && (
        <Text style={styles.fileCount}>
          {files.length} of {maxFiles} files selected
        </Text>
      )}
    </View>
  );
}

// ============================================
// FILE PREVIEW CARD
// ============================================

interface FilePreviewCardProps {
  file: SelectedFile;
  onRemove: () => void;
  isUploading?: boolean;
  uploadProgress?: number;
  disabled?: boolean;
}

function FilePreviewCard({
  file,
  onRemove,
  isUploading = false,
  uploadProgress,
  disabled = false,
}: FilePreviewCardProps) {
  const isImage = isImageFile(file.type);

  return (
    <View style={styles.fileCard}>
      {/* File Preview */}
      <View style={styles.filePreview}>
        {isImage ? (
          <Image source={{ uri: file.uri }} style={styles.fileImage} resizeMode="cover" />
        ) : (
          <View style={styles.fileIconContainer}>
            <Icon name={getFileIcon(file.type)} size={24} color={colors.accent} />
          </View>
        )}
      </View>

      {/* File Info */}
      <View style={styles.fileInfo}>
        <Text style={styles.fileName} numberOfLines={1}>
          {file.name}
        </Text>
        <Text style={styles.fileSize}>{formatFileSize(file.size)}</Text>

        {/* Upload Progress */}
        {isUploading && uploadProgress !== undefined && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
            </View>
            <Text style={styles.progressText}>{uploadProgress}%</Text>
          </View>
        )}
      </View>

      {/* Remove/Loading Button */}
      {isUploading ? (
        <ActivityIndicator size="small" color={colors.accent} style={styles.removeButton} />
      ) : (
        <Pressable
          style={styles.removeButton}
          onPress={onRemove}
          disabled={disabled}
          hitSlop={8}
        >
          <Icon
            name="close-circle"
            size={24}
            color={disabled ? colors.textTertiary : colors.error}
          />
        </Pressable>
      )}
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  dropzone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  dropzoneCompact: {
    borderRadius: radius.md,
  },
  dropzoneActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentMuted,
  },
  dropzoneError: {
    borderColor: colors.error,
  },
  dropzoneDisabled: {
    opacity: 0.5,
    backgroundColor: colors.borderLight,
  },
  dropzoneContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  dropzoneContentCompact: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  iconContainerCompact: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 0,
  },
  dropzoneTitle: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  dropzoneTitleCompact: {
    marginBottom: 0,
  },
  dropzoneSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  dropzoneLimit: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  filesList: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  filePreview: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: colors.surface2,
  },
  fileImage: {
    width: '100%',
    height: '100%',
  },
  fileIconContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentMuted,
  },
  fileInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  fileName: {
    ...typography.label,
    color: colors.textPrimary,
  },
  fileSize: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  progressText: {
    ...typography.caption,
    color: colors.accent,
    width: 36,
    textAlign: 'right',
  },
  removeButton: {
    marginLeft: spacing.sm,
    padding: spacing.xxs,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xxs,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    flex: 1,
  },
  helperText: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  fileCount: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
});

export default FileUpload;
