/**
 * History Screen (PRD V1 Spec)
 * Displays list of past symptom entries with risk level indicators
 */

import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

import { colors, spacing, radius, typography, shadows } from '@/theme';
import { useSymptomEntryStore } from '@/store/symptomEntryStore';
import {
  type SymptomEntry,
  RISK_LEVEL_LABELS,
  RISK_LEVEL_COLORS,
  DURATION_LABELS,
} from '@/types/symptomEntry';

const RISK_ICONS: Record<string, string> = {
  low: 'checkmark-circle',
  medium: 'alert-circle',
  high: 'warning',
  emergency: 'medical',
};

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // Store
  const entries = useSymptomEntryStore((state) => state.entries);

  // Sort entries by date (newest first)
  const sortedEntries = useMemo(
    () =>
      [...entries].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [entries]
  );

  // Navigate to entry detail
  const handleEntryPress = useCallback(
    (entry: SymptomEntry) => {
      navigation.navigate('AssessmentResult' as never, { entryId: entry.id } as never);
    },
    [navigation]
  );

  // Navigate to new entry
  const handleNewEntry = useCallback(() => {
    navigation.navigate('NewEntry' as never);
  }, [navigation]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long', hour: 'numeric', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  // Render entry item
  const renderEntry = useCallback(
    ({ item }: { item: SymptomEntry }) => {
      const riskColors = RISK_LEVEL_COLORS[item.riskLevel];

      return (
        <TouchableOpacity
          style={styles.entryCard}
          onPress={() => handleEntryPress(item)}
          activeOpacity={0.7}
        >
          {/* Risk indicator */}
          <View
            style={[
              styles.riskIndicator,
              { backgroundColor: riskColors.bg, borderColor: riskColors.border },
            ]}
          >
            <Icon name={RISK_ICONS[item.riskLevel]} size={20} color={riskColors.text} />
          </View>

          {/* Content */}
          <View style={styles.entryContent}>
            <View style={styles.entryHeader}>
              <Text style={styles.entryProfile} numberOfLines={1}>
                {item.profileName}
              </Text>
              <Text style={styles.entryDate}>{formatDate(item.createdAt)}</Text>
            </View>

            <Text style={styles.entryDescription} numberOfLines={2}>
              {item.description}
            </Text>

            <View style={styles.entryMeta}>
              <View style={[styles.riskBadge, { backgroundColor: riskColors.bg }]}>
                <Text style={[styles.riskBadgeText, { color: riskColors.text }]}>
                  {RISK_LEVEL_LABELS[item.riskLevel]}
                </Text>
              </View>
              <Text style={styles.durationText}>{DURATION_LABELS[item.duration]}</Text>
            </View>
          </View>

          {/* Chevron */}
          <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      );
    },
    [handleEntryPress]
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Icon name="document-text-outline" size={48} color={colors.textTertiary} />
      </View>
      <Text style={styles.emptyTitle}>No Entries Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start documenting symptoms to keep track of your family's health.
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleNewEntry} activeOpacity={0.8}>
        <Icon name="add" size={20} color={colors.textInverse} />
        <Text style={styles.emptyButtonText}>New Entry</Text>
      </TouchableOpacity>
    </View>
  );

  // Render section header for grouping by date
  const renderHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.listHeaderTitle}>Symptom History</Text>
      <Text style={styles.listHeaderSubtitle}>
        {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
        {entries.length > 0 && (
          <TouchableOpacity style={styles.addButton} onPress={handleNewEntry} activeOpacity={0.7}>
            <Icon name="add" size={24} color={colors.accent} />
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      <FlatList
        data={sortedEntries}
        keyExtractor={(item) => item.id}
        renderItem={renderEntry}
        ListEmptyComponent={renderEmptyState}
        ListHeaderComponent={entries.length > 0 ? renderHeader : null}
        contentContainerStyle={[
          styles.listContent,
          entries.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // List
  listContent: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  listContentEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  listHeader: {
    marginBottom: spacing.sm,
  },
  listHeaderTitle: {
    ...typography.label,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listHeaderSubtitle: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  separator: {
    height: spacing.sm,
  },

  // Entry Card
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    ...shadows.card,
  },
  riskIndicator: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  entryContent: {
    flex: 1,
    gap: spacing.xs,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryProfile: {
    ...typography.label,
    color: colors.textPrimary,
    flex: 1,
  },
  entryDate: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  entryDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  entryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xxs,
  },
  riskBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  riskBadgeText: {
    ...typography.tiny,
    fontWeight: '600',
  },
  durationText: {
    ...typography.caption,
    color: colors.textTertiary,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.surface2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
    marginTop: spacing.md,
    ...shadows.button,
  },
  emptyButtonText: {
    ...typography.labelLarge,
    color: colors.textInverse,
  },
});
