/**
 * MemberListScreen — generic list surface for a member's secondary tabs.
 *
 * Variant-driven so one screen serves patients / assignments / tests /
 * inventory. Each variant calls its real endpoint and renders an honest
 * empty state (some backend endpoints are still stubs returning []).
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '@/theme';
import { memberApi, V1Booking } from '@/services/api/endpoints/member';

export type MemberListVariant = 'patients' | 'assignments' | 'tests' | 'inventory';

interface Row {
  id: string;
  title: string;
  subtitle?: string;
}

const clientName = (b: V1Booking) => b.profile?.name || b.user?.name || b.user?.email || 'Client';
const whenLabel = (iso: string) =>
  new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

// All variants derive from the JWT-accessible /v1/bookings surface (member/*
// endpoints are web-session only). Inventory has no v1 source yet → coming soon.
const VARIANT: Record<
  MemberListVariant,
  { title: string; icon: string; empty: string; load: () => Promise<Row[]>; stub?: boolean }
> = {
  patients: {
    title: 'Patients',
    icon: 'people-outline',
    empty: 'No patients yet — they appear here once you have bookings.',
    load: async () => {
      const res = await memberApi.getBookings();
      const seen = new Map<string, Row>();
      for (const b of res.bookings ?? []) {
        const name = clientName(b);
        if (!seen.has(name)) seen.set(name, { id: b.id, title: name, subtitle: b.service?.name ?? undefined });
      }
      return [...seen.values()];
    },
  },
  assignments: {
    title: 'Work',
    icon: 'briefcase-outline',
    empty: 'No assignments yet.',
    load: async () => {
      const res = await memberApi.getBookings();
      return (res.bookings ?? []).map((b) => ({
        id: b.id,
        title: `${clientName(b)} · ${b.service?.name ?? 'Service'}`,
        subtitle: `${whenLabel(b.scheduledAt)} · ${b.status.toLowerCase()}`,
      }));
    },
  },
  tests: {
    title: 'Orders',
    icon: 'flask-outline',
    empty: 'No orders yet.',
    load: async () => {
      const res = await memberApi.getBookings();
      return (res.bookings ?? []).map((b) => ({
        id: b.id,
        title: b.service?.name ?? 'Order',
        subtitle: `${clientName(b)} · ${whenLabel(b.scheduledAt)} · ${b.status.toLowerCase()}`,
      }));
    },
  },
  inventory: {
    title: 'Inventory',
    icon: 'cube-outline',
    empty: 'Inventory management is coming soon.',
    stub: true,
    load: async () => [],
  },
};

export default function MemberListScreen({ variant }: { variant: MemberListVariant }) {
  const insets = useSafeAreaInsets();
  const cfg = VARIANT[variant];

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setRows(await cfg.load());
    } catch (e) {
      setError('Cannot reach CareBow servers. Pull to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [cfg]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Text style={styles.headerTitle}>{cfg.title}</Text>
      </View>
      {loading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(r) => r.id}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.accent} />}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <Icon name={cfg.icon} size={18} color={colors.accent} />
              </View>
              <View style={styles.rowInfo}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                {item.subtitle ? <Text style={styles.rowSubtitle}>{item.subtitle}</Text> : null}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Icon name={cfg.icon} size={40} color={colors.textTertiary} />
              <Text style={styles.emptyText}>{error || cfg.empty}</Text>
              {cfg.stub && !error ? (
                <Text style={styles.stubNote}>This feature is coming soon.</Text>
              ) : null}
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerTitle: { ...typography.h3, color: colors.textPrimary },
  content: { padding: spacing.lg, flexGrow: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowInfo: { flex: 1 },
  rowTitle: { ...typography.label, color: colors.textPrimary },
  rowSubtitle: { ...typography.caption, color: colors.textSecondary },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: spacing.xxxl, gap: spacing.sm },
  emptyText: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  stubNote: { ...typography.caption, color: colors.textTertiary },
});
