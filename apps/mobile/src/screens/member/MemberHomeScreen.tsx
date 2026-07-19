/**
 * Member Home Screen — shared home for the 3 non-customer user types
 * (healthcare_provider, service_provider, service_partner).
 *
 * All three are `orgMember`s on the backend and share GET /member/overview.
 * Copy/terminology and the quick-action row adapt to the user type; the
 * underlying data + layout are identical.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '@/theme';
import { useAuthStore, UserTypeSlug } from '@/store/useAuthStore';
import { memberApi, MemberOverview } from '@/services/api/endpoints/member';

// Per-type copy so one screen serves all three member types.
const TYPE_COPY: Record<
  Exclude<UserTypeSlug, 'customer'>,
  { title: string; peopleLabel: string; workLabel: string }
> = {
  healthcare_provider: { title: 'Your practice', peopleLabel: 'Patients', workLabel: 'Appointments' },
  service_provider: { title: 'Your work', peopleLabel: 'Clients', workLabel: 'Visits' },
  service_partner: { title: 'Your orders', peopleLabel: 'Customers', workLabel: 'Orders' },
};

const rupees = (paise: number) => `₹${Math.floor((paise ?? 0) / 100).toLocaleString('en-IN')}`;

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>
        <Icon name={icon} size={18} color={colors.accent} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function MemberHomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const userType = useAuthStore((s) => s.userType);
  const copy = TYPE_COPY[(userType as Exclude<UserTypeSlug, 'customer'>)] ?? TYPE_COPY.service_provider;

  const [overview, setOverview] = useState<MemberOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await memberApi.getOverview();
      if (res.success && res.overview) {
        setOverview(res.overview);
      } else {
        setError(res.error || 'Could not load your dashboard.');
      }
    } catch (e) {
      setError('Cannot reach CareBow servers. Pull to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const firstName = (user?.firstName || user?.email?.split('@')[0] || 'there').trim();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View>
          <Text style={styles.greeting}>{greeting()} 👋</Text>
          <Text style={styles.name}>{firstName}</Text>
        </View>
        <Pressable
          style={styles.avatar}
          onPress={() => navigation.navigate('Profile')}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
        >
          <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        >
          <Text style={styles.sectionLabel}>{copy.title}</Text>

          {error && (
            <View style={styles.errorBox}>
              <Icon name="cloud-offline-outline" size={18} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Stat grid */}
          <View style={styles.statGrid}>
            <StatCard label={`Today's ${copy.workLabel}`} value={String(overview?.todayCount ?? 0)} icon="calendar-outline" />
            <StatCard label="Pending" value={String(overview?.pendingCount ?? 0)} icon="time-outline" />
            <StatCard label={copy.peopleLabel} value={String(overview?.totalPatients ?? 0)} icon="people-outline" />
            <StatCard label="This month" value={rupees(overview?.earningsThisMonthPaise ?? 0)} icon="wallet-outline" />
          </View>

          {/* Next appointment */}
          <Text style={styles.blockTitle}>Up next</Text>
          {overview?.nextAppointment ? (
            <View style={styles.nextCard}>
              <View style={styles.nextIcon}>
                <Icon name="videocam-outline" size={20} color={colors.accent} />
              </View>
              <View style={styles.nextInfo}>
                <Text style={styles.nextName}>{overview.nextAppointment.patientName}</Text>
                <Text style={styles.nextService}>{overview.nextAppointment.service}</Text>
                <Text style={styles.nextTime}>
                  {new Date(overview.nextAppointment.scheduledAt).toLocaleString([], {
                    weekday: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Nothing scheduled next. Enjoy the breather.</Text>
            </View>
          )}

          {/* Recent activity */}
          <Text style={styles.blockTitle}>Recent activity</Text>
          {overview && overview.recentActivity.length > 0 ? (
            overview.recentActivity.map((a) => (
              <View key={a.id} style={styles.activityRow}>
                <View style={styles.activityDot} />
                <View style={styles.activityInfo}>
                  <Text style={styles.activityName}>{a.patientName}</Text>
                  <Text style={styles.activityService}>{a.service}</Text>
                </View>
                <View style={styles.activityRight}>
                  <Text style={styles.activityAmount}>{rupees(a.amount)}</Text>
                  <Text style={styles.activityStatus}>{a.status.toLowerCase()}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No recent activity yet.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  greeting: { ...typography.caption, color: colors.textSecondary },
  name: { ...typography.h2, color: colors.textPrimary },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typography.h4, color: colors.textInverse },
  content: { padding: spacing.lg },
  sectionLabel: { ...typography.caption, color: colors.textTertiary, textTransform: 'uppercase', marginBottom: spacing.sm },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#FEF2F2',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  errorText: { ...typography.caption, color: colors.error, flex: 1 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: {
    flexGrow: 1,
    flexBasis: '46%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.card,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: { ...typography.h2, color: colors.textPrimary },
  statLabel: { ...typography.caption, color: colors.textSecondary },
  blockTitle: { ...typography.h4, color: colors.textPrimary, marginBottom: spacing.sm, marginTop: spacing.xs },
  nextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  nextIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextInfo: { flex: 1 },
  nextName: { ...typography.label, color: colors.textPrimary },
  nextService: { ...typography.caption, color: colors.textSecondary },
  nextTime: { ...typography.caption, color: colors.accent, marginTop: 2 },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  activityDot: { width: 8, height: 8, borderRadius: radius.full, backgroundColor: colors.accent },
  activityInfo: { flex: 1 },
  activityName: { ...typography.label, color: colors.textPrimary },
  activityService: { ...typography.caption, color: colors.textSecondary },
  activityRight: { alignItems: 'flex-end' },
  activityAmount: { ...typography.label, color: colors.textPrimary },
  activityStatus: { ...typography.caption, color: colors.textTertiary },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  emptyText: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
});
