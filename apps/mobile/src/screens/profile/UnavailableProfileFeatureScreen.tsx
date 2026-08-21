import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import { colors, radius, spacing, typography } from '../../theme';

type Props = {
  title: string;
  message: string;
  icon: string;
};

/**
 * Launch-safe fallback for profile features that used to report successful
 * local-only saves as though they were durable CareBow records.
 */
export function UnavailableProfileFeatureScreen({ title, message, icon }: Props) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.body}>
        <View style={styles.iconWrap}>
          <Icon name={icon as any} size={36} color={colors.accent} />
        </View>
        <Text style={styles.title}>{title} is not enabled in this release</Text>
        <Text style={styles.message}>{message}</Text>
        <Text style={styles.note}>
          CareBow will not show a fake “saved” or “uploaded” success state when the data is not
          durably stored by the backend.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface2 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { ...typography.h3 },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  note: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
