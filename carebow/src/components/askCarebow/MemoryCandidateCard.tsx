/**
 * Memory Candidate Card Component
 * Shows "I learned this - save?" prompt after assistant response
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../../theme';
import {
  MemoryCandidate,
  memoryTypeLabels,
  memoryTypeIcons,
  memoryTypeColors,
} from '../../types/healthMemory';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type MemoryCandidateCardProps = {
  candidates: MemoryCandidate[];
  onSave: (candidateId: string) => void;
  onEdit: (candidateId: string, newValue: string) => void;
  onDismiss: (candidateId: string) => void;
  onDismissAll: () => void;
};

export function MemoryCandidateCard({
  candidates,
  onSave,
  onEdit,
  onDismiss,
  onDismissAll,
}: MemoryCandidateCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  if (candidates.length === 0) return null;

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const handleStartEdit = (candidate: MemoryCandidate) => {
    setEditingId(candidate.id);
    setEditValue(candidate.value);
  };

  const handleSaveEdit = (candidateId: string) => {
    if (editValue.trim()) {
      onEdit(candidateId, editValue.trim());
    }
    setEditingId(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity style={styles.header} onPress={toggleExpand} activeOpacity={0.7}>
        <View style={styles.headerLeft}>
          <View style={styles.sparkleIcon}>
            <Icon name="sparkles" size={14} color={colors.accent} />
          </View>
          <Text style={styles.headerTitle}>I learned this about you</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{candidates.length}</Text>
          </View>
        </View>
        <Icon
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.textTertiary}
        />
      </TouchableOpacity>

      {/* Candidates */}
      {expanded && (
        <View style={styles.content}>
          {candidates.map((candidate) => {
            const colorConfig = memoryTypeColors[candidate.type];
            const isEditing = editingId === candidate.id;

            return (
              <View key={candidate.id} style={styles.candidateItem}>
                <View style={[styles.candidateIcon, { backgroundColor: colorConfig.bg }]}>
                  <Icon
                    name={memoryTypeIcons[candidate.type]}
                    size={14}
                    color={colorConfig.text}
                  />
                </View>

                <View style={styles.candidateContent}>
                  <Text style={styles.candidateType}>
                    {memoryTypeLabels[candidate.type]}
                  </Text>

                  {isEditing ? (
                    <View style={styles.editContainer}>
                      <TextInput
                        style={styles.editInput}
                        value={editValue}
                        onChangeText={setEditValue}
                        autoFocus
                      />
                      <View style={styles.editActions}>
                        <TouchableOpacity
                          style={styles.editButton}
                          onPress={() => handleSaveEdit(candidate.id)}
                        >
                          <Icon name="checkmark" size={16} color={colors.success} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.editButton}
                          onPress={handleCancelEdit}
                        >
                          <Icon name="close" size={16} color={colors.textTertiary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.candidateValue}>{candidate.value}</Text>
                  )}

                  {candidate.reason && !isEditing && (
                    <Text style={styles.candidateReason}>{candidate.reason}</Text>
                  )}

                  {/* Confidence indicator */}
                  <View style={styles.confidenceRow}>
                    <View
                      style={[
                        styles.confidenceBadge,
                        candidate.confidence === 'high' && styles.confidenceHigh,
                        candidate.confidence === 'medium' && styles.confidenceMedium,
                        candidate.confidence === 'low' && styles.confidenceLow,
                      ]}
                    >
                      <Text
                        style={[
                          styles.confidenceText,
                          candidate.confidence === 'high' && styles.confidenceTextHigh,
                          candidate.confidence === 'medium' && styles.confidenceTextMedium,
                          candidate.confidence === 'low' && styles.confidenceTextLow,
                        ]}
                      >
                        {candidate.confidence === 'high' ? 'High confidence' :
                         candidate.confidence === 'medium' ? 'Medium confidence' :
                         'Low confidence'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Actions */}
                {!isEditing && (
                  <View style={styles.candidateActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.saveActionButton]}
                      onPress={() => onSave(candidate.id)}
                    >
                      <Icon name="bookmark" size={14} color={colors.accent} />
                      <Text style={styles.saveActionText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => handleStartEdit(candidate)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Icon name="pencil" size={14} color={colors.textTertiary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => onDismiss(candidate.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Icon name="close" size={14} color={colors.textTertiary} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}

          {/* Dismiss All */}
          {candidates.length > 1 && (
            <TouchableOpacity style={styles.dismissAllButton} onPress={onDismissAll}>
              <Text style={styles.dismissAllText}>Don't save any of these</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.accentMuted,
    borderWidth: 1,
    borderColor: colors.accentSoft,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginVertical: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sparkleIcon: {
    width: 24,
    height: 24,
    borderRadius: radius.xs,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.labelSmall,
    color: colors.accent,
  },
  countBadge: {
    backgroundColor: colors.accent,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  countText: {
    ...typography.tiny,
    color: colors.textInverse,
  },
  content: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  candidateItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  candidateIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  candidateContent: {
    flex: 1,
  },
  candidateType: {
    ...typography.tiny,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  candidateValue: {
    ...typography.label,
    color: colors.textPrimary,
    marginTop: 2,
  },
  candidateReason: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    fontStyle: 'italic',
  },
  confidenceRow: {
    marginTop: spacing.xxs,
  },
  confidenceBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  confidenceHigh: {
    backgroundColor: colors.successSoft,
  },
  confidenceMedium: {
    backgroundColor: colors.warningSoft,
  },
  confidenceLow: {
    backgroundColor: colors.surface2,
  },
  confidenceText: {
    ...typography.tiny,
  },
  confidenceTextHigh: {
    color: colors.success,
  },
  confidenceTextMedium: {
    color: colors.warning,
  },
  confidenceTextLow: {
    color: colors.textTertiary,
  },
  candidateActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    borderRadius: radius.xs,
  },
  saveActionButton: {
    backgroundColor: colors.accentMuted,
    borderWidth: 1,
    borderColor: colors.accentSoft,
  },
  saveActionText: {
    ...typography.tiny,
    color: colors.accent,
  },
  iconButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editContainer: {
    marginTop: spacing.xxs,
  },
  editInput: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  editButton: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.surface2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissAllButton: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
    marginTop: spacing.xs,
  },
  dismissAllText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});

export default MemoryCandidateCard;
