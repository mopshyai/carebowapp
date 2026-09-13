import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../../theme';

export default function PrivacyHubScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const open = (screen: 'PrivacyPreferences' | 'ProfileSharing') =>
    navigation.navigate(screen as never);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 32 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoCard}>
          <Icon name="shield-checkmark-outline" size={22} color={colors.accent} />
          <Text style={styles.infoText}>
            CareBow separates account security from access to each health profile. Profile sharing is
            granted and revoked per person so one global switch cannot silently override explicit access.
          </Text>
        </View>

        <TouchableOpacity style={styles.card} onPress={() => open('PrivacyPreferences')}>
          <View style={styles.iconWrap}>
            <Icon name="lock-closed-outline" size={22} color={colors.accent} />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Account & Data Controls</Text>
            <Text style={styles.cardDescription}>
              Security settings, data export, and permanent account deletion
            </Text>
          </View>
          <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => open('ProfileSharing')}>
          <View style={styles.iconWrap}>
            <Icon name="people-outline" size={22} color={colors.accent} />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Profile Access</Text>
            <Text style={styles.cardDescription}>
              See who can access each family health profile, change access, or revoke it immediately
            </Text>
          </View>
          <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      </ScrollView>
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.h3 },
  content: { padding: spacing.lg, gap: spacing.md },
  infoCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.accentMuted,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  infoText: { ...typography.bodySmall, color: colors.textSecondary, flex: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    ...shadows.card,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentMuted,
  },
  cardText: { flex: 1 },
  cardTitle: { ...typography.label, color: colors.textPrimary, marginBottom: 2 },
  cardDescription: { ...typography.caption, color: colors.textTertiary },
});
