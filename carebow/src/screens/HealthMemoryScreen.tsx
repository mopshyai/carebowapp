/**
 * Health Memory Screen
 * User-controlled memory management (Spotify-like personalization)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
  TextInput,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../theme';
import {
  useHealthMemoryStore,
  useMemoryItems,
  useMemorySettings,
  useMemoryCount,
} from '../store/healthMemoryStore';
import {
  MemoryItem,
  MemoryItemType,
  memoryTypeLabels,
  memoryTypeIcons,
  memoryTypeColors,
} from '../types/healthMemory';

// ============================================
// COMPONENTS
// ============================================

type MemoryItemCardProps = {
  item: MemoryItem;
  onEdit: (item: MemoryItem) => void;
  onDelete: (id: string) => void;
};

function MemoryItemCard({ item, onEdit, onDelete }: MemoryItemCardProps) {
  const colorConfig = memoryTypeColors[item.type];
  const iconName = memoryTypeIcons[item.type];

  const handleDelete = () => {
    Alert.alert(
      'Delete Memory',
      `Are you sure you want to delete "${item.value}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(item.id),
        },
      ]
    );
  };

  return (
    <View style={[styles.memoryCard, { borderLeftColor: colorConfig.text }]}>
      <View style={[styles.memoryIcon, { backgroundColor: colorConfig.bg }]}>
        <Icon name={iconName} size={16} color={colorConfig.text} />
      </View>
      <View style={styles.memoryContent}>
        <Text style={styles.memoryLabel}>{memoryTypeLabels[item.type]}</Text>
        <Text style={styles.memoryValue}>{item.value}</Text>
        {item.details && (
          <Text style={styles.memoryDetails}>{item.details}</Text>
        )}
        <View style={styles.memoryMeta}>
          <Text style={styles.memorySource}>
            {item.source === 'conversation' ? 'From chat' :
             item.source === 'profile_sync' ? 'From profile' : 'Added manually'}
          </Text>
          {item.forWhom === 'family' && item.familyMemberName && (
            <Text style={styles.memoryForWhom}>For {item.familyMemberName}</Text>
          )}
        </View>
      </View>
      <View style={styles.memoryActions}>
        <TouchableOpacity
          style={styles.actionIcon}
          onPress={() => onEdit(item)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon name="pencil" size={16} color={colors.textTertiary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionIcon}
          onPress={handleDelete}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon name="trash-outline" size={16} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

type AddEditModalProps = {
  visible: boolean;
  onClose: () => void;
  item?: MemoryItem | null;
  onSave: (type: MemoryItemType, value: string, details?: string) => void;
};

function AddEditModal({ visible, onClose, item, onSave }: AddEditModalProps) {
  const [selectedType, setSelectedType] = useState<MemoryItemType>(item?.type || 'condition');
  const [value, setValue] = useState(item?.value || '');
  const [details, setDetails] = useState(item?.details || '');

  const handleSave = () => {
    if (!value.trim()) {
      Alert.alert('Error', 'Please enter a value');
      return;
    }
    onSave(selectedType, value.trim(), details.trim() || undefined);
    setValue('');
    setDetails('');
    onClose();
  };

  const memoryTypes: MemoryItemType[] = [
    'allergy',
    'condition',
    'medication',
    'preference',
    'trigger',
    'past_episode',
    'family_history',
    'lifestyle',
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalHandle} />

          <Text style={styles.modalTitle}>
            {item ? 'Edit Memory' : 'Add New Memory'}
          </Text>

          {/* Type selector */}
          <Text style={styles.inputLabel}>Type</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.typeSelector}
            contentContainerStyle={styles.typeSelectorContent}
          >
            {memoryTypes.map((type) => {
              const colorConfig = memoryTypeColors[type];
              const isSelected = selectedType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeChip,
                    isSelected && { backgroundColor: colorConfig.bg, borderColor: colorConfig.text },
                  ]}
                  onPress={() => setSelectedType(type)}
                >
                  <Icon
                    name={memoryTypeIcons[type]}
                    size={14}
                    color={isSelected ? colorConfig.text : colors.textTertiary}
                  />
                  <Text
                    style={[
                      styles.typeChipText,
                      isSelected && { color: colorConfig.text },
                    ]}
                  >
                    {memoryTypeLabels[type]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Value input */}
          <Text style={styles.inputLabel}>Value *</Text>
          <TextInput
            style={styles.textInput}
            value={value}
            onChangeText={setValue}
            placeholder="E.g., Penicillin, Diabetes, Ibuprofen..."
            placeholderTextColor={colors.textTertiary}
          />

          {/* Details input */}
          <Text style={styles.inputLabel}>Additional Details (optional)</Text>
          <TextInput
            style={[styles.textInput, styles.textInputMultiline]}
            value={details}
            onChangeText={setDetails}
            placeholder="Add any relevant details..."
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          {/* Buttons */}
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {item ? 'Save Changes' : 'Add Memory'}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ============================================
// MAIN SCREEN
// ============================================

export default function HealthMemoryScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const items = useMemoryItems();
  const settings = useMemorySettings();
  const memoryCount = useMemoryCount();

  const {
    deleteMemoryItem,
    deleteAllMemory,
    addMemoryItem,
    updateMemoryItem,
    updateSettings,
  } = useHealthMemoryStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<MemoryItem | null>(null);

  const handleEdit = (item: MemoryItem) => {
    setEditingItem(item);
    setModalVisible(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setModalVisible(true);
  };

  const handleSave = (type: MemoryItemType, value: string, details?: string) => {
    if (editingItem) {
      updateMemoryItem(editingItem.id, { type, value, details });
    } else {
      addMemoryItem(type, memoryTypeLabels[type], value, 'user_input', 'me', 'high', { details });
    }
  };

  const handleDeleteAll = () => {
    Alert.alert(
      'Delete All Memory',
      'This will permanently delete all your health memory. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: deleteAllMemory,
        },
      ]
    );
  };

  // Group items by type
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {} as Record<MemoryItemType, MemoryItem[]>);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Health Memory</Text>
          <Text style={styles.headerSubtitle}>{memoryCount} items saved</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddNew}
        >
          <Icon name="add" size={24} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Icon name="sparkles" size={20} color={colors.accent} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Personalized Care</Text>
            <Text style={styles.infoText}>
              CareBow remembers important health facts to give you better,
              personalized guidance. You control what's saved.
            </Text>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Save full chat history</Text>
              <Text style={styles.settingDescription}>
                Store complete conversations for better context
              </Text>
            </View>
            <Switch
              value={settings.saveFullChatHistory}
              onValueChange={(value) => updateSettings({ saveFullChatHistory: value })}
              trackColor={{ false: colors.border, true: colors.accentSoft }}
              thumbColor={settings.saveFullChatHistory ? colors.accent : colors.surface}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Sync with profile</Text>
              <Text style={styles.settingDescription}>
                Auto-import allergies & conditions from family profiles
              </Text>
            </View>
            <Switch
              value={settings.syncWithProfile}
              onValueChange={(value) => updateSettings({ syncWithProfile: value })}
              trackColor={{ false: colors.border, true: colors.accentSoft }}
              thumbColor={settings.syncWithProfile ? colors.accent : colors.surface}
            />
          </View>
        </View>

        {/* Memory Items */}
        {memoryCount > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Health Facts</Text>

            {Object.entries(groupedItems).map(([type, typeItems]) => (
              <View key={type} style={styles.typeGroup}>
                <View style={styles.typeHeader}>
                  <Icon
                    name={memoryTypeIcons[type as MemoryItemType]}
                    size={14}
                    color={memoryTypeColors[type as MemoryItemType].text}
                  />
                  <Text style={styles.typeTitle}>
                    {memoryTypeLabels[type as MemoryItemType]}s
                  </Text>
                  <Text style={styles.typeCount}>{typeItems.length}</Text>
                </View>
                {typeItems.map((item) => (
                  <MemoryItemCard
                    key={item.id}
                    item={item}
                    onEdit={handleEdit}
                    onDelete={deleteMemoryItem}
                  />
                ))}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Icon name="leaf" size={40} color={colors.textTertiary} />
            </View>
            <Text style={styles.emptyTitle}>No health facts saved yet</Text>
            <Text style={styles.emptyText}>
              As you chat with CareBow, important health information will be
              suggested for saving. You can also add facts manually.
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleAddNew}>
              <Icon name="add" size={16} color={colors.accent} />
              <Text style={styles.emptyButtonText}>Add Your First Memory</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Delete All */}
        {memoryCount > 0 && (
          <TouchableOpacity style={styles.deleteAllButton} onPress={handleDeleteAll}>
            <Icon name="trash-outline" size={16} color={colors.error} />
            <Text style={styles.deleteAllText}>Delete All Memory</Text>
          </TouchableOpacity>
        )}

        {/* Privacy Note */}
        <View style={styles.privacyNote}>
          <Icon name="shield-checkmark" size={14} color={colors.textTertiary} />
          <Text style={styles.privacyText}>
            Your health memory is stored locally on your device until you enable cloud sync.
          </Text>
        </View>
      </ScrollView>

      {/* Add/Edit Modal */}
      <AddEditModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingItem(null);
        }}
        item={editingItem}
        onSave={handleSave}
      />
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.accentMuted,
    borderWidth: 1,
    borderColor: colors.accentSoft,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...typography.label,
    color: colors.accent,
    marginBottom: 2,
  },
  infoText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  // Sections
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.labelSmall,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },

  // Settings
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  settingContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  settingDescription: {
    ...typography.caption,
    color: colors.textTertiary,
  },

  // Memory Cards
  typeGroup: {
    marginBottom: spacing.md,
  },
  typeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  typeTitle: {
    ...typography.labelSmall,
    color: colors.textSecondary,
  },
  typeCount: {
    ...typography.tiny,
    color: colors.textTertiary,
    backgroundColor: colors.surface2,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  memoryCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  memoryIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memoryContent: {
    flex: 1,
  },
  memoryLabel: {
    ...typography.tiny,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  memoryValue: {
    ...typography.label,
    color: colors.textPrimary,
    marginTop: 2,
  },
  memoryDetails: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  memoryMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xxs,
  },
  memorySource: {
    ...typography.tiny,
    color: colors.textTertiary,
  },
  memoryForWhom: {
    ...typography.tiny,
    color: colors.accent,
  },
  memoryActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionIcon: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accentMuted,
    borderWidth: 1,
    borderColor: colors.accentSoft,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  emptyButtonText: {
    ...typography.label,
    color: colors.accent,
  },

  // Delete All
  deleteAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  deleteAllText: {
    ...typography.label,
    color: colors.error,
  },

  // Privacy Note
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  privacyText: {
    flex: 1,
    ...typography.caption,
    color: colors.textTertiary,
    lineHeight: 16,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? spacing.xxxl : spacing.xl,
    paddingHorizontal: spacing.lg,
    maxHeight: '80%',
    ...shadows.cardElevated,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  typeSelector: {
    marginBottom: spacing.md,
  },
  typeSelectorContent: {
    gap: spacing.xs,
    paddingRight: spacing.md,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  typeChipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  textInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...shadows.button,
  },
  saveButtonText: {
    ...typography.label,
    color: colors.textInverse,
  },
});
