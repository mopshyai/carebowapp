/**
 * StillNeedCard Component
 * Shows what information is still missing to build user trust
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography } from '../../theme';
import { MissingField } from '../../utils/missingInfoDetector';

interface StillNeedCardProps {
  missingField: MissingField;
}

export function StillNeedCard({ missingField }: StillNeedCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="help-circle-outline" size={14} color={colors.textTertiary} />
        <Text style={styles.headerText}>What's still unclear</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.bullet} />
        <Text style={styles.text}>{missingField.question}</Text>
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
    marginVertical: spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: colors.textTertiary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    marginBottom: spacing.xs,
  },
  headerText: {
    ...typography.tiny,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textTertiary,
    marginTop: 6,
  },
  text: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    fontStyle: 'italic',
  },
});
