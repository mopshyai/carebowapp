import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing, typography, shadows } from '../../theme';
import { useAskCarebowStore } from '../../store/askCarebowStore';
import { useBookingsStore } from '../../store';

type Tab = 'all' | 'bookings' | 'conversations';

export default function CareHistoryScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const sessions = useAskCarebowStore((state) => state.sessions);
  const [tab, setTab] = useState<Tab>('all');
  const bookings = useBookingsStore((s) => s.bookings);
  const status = useBookingsStore((s) => s.status);
  const storeError = useBookingsStore((s) => s.error);
  const fetchBookings = useBookingsStore((s) => s.fetch);

  const [refreshing, setRefreshing] = useState(false);

  const loading = status === 'loading' && bookings.length === 0;
  const error = storeError
    ? 'Booking history could not be loaded. Your conversations remain available on this device.'
    : null;

  const load = useCallback(
    async (refresh = false) => {
      if (refresh) setRefreshing(true);
      try {
        await fetchBookings({ force: true });
      } finally {
        if (refresh) setRefreshing(false);
      }
    },
    [fetchBookings]
  );

  useEffect(() => {
    void load();
  }, [load]);

  const items = useMemo(() => {
    const bookingItems = bookings.map((booking) => ({
      id: `booking-${booking.id}`,
      bookingId: booking.id,
      kind: 'booking' as const,
      title: booking.service?.name || 'Care service',
      subtitle: booking.profile?.name || 'Care recipient',
      status: booking.status.toLowerCase().replace(/_/g, ' '),
      date: booking.scheduledAt,
    }));
    const conversationItems = sessions.map((session) => ({
      id: `conversation-${session.id}`,
      sessionId: session.id,
      kind: 'conversation' as const,
      title:
        session.messages.find((message) => message.role === 'user')?.text ||
        'Ask CareBow conversation',
      subtitle: session.memberName || 'Health guidance',
      status: session.isActive ? 'active' : 'finished',
      date: session.updatedAt,
    }));
    return [...bookingItems, ...conversationItems]
      .filter(
        (item) =>
          tab === 'all' ||
          (tab === 'bookings' ? item.kind === 'booking' : item.kind === 'conversation')
      )
      .sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [bookings, sessions, tab]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Care History</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.tabs}>
        {(['all', 'bookings', 'conversations'] as Tab[]).map((value) => (
          <TouchableOpacity
            key={value}
            style={[styles.tab, tab === value && styles.tabActive]}
            onPress={() => setTab(value)}
          >
            <Text style={[styles.tabText, tab === value && styles.tabTextActive]}>
              {value === 'all' ? 'All' : value === 'bookings' ? 'Bookings' : 'Ask CareBow'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
      >
        {loading ? (
          <View style={styles.state}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.stateText}>Loading care history…</Text>
          </View>
        ) : (
          <>
            {error && (
              <View style={styles.notice}>
                <Icon name="cloud-offline-outline" size={18} color={colors.warning} />
                <Text style={styles.noticeText}>{error}</Text>
              </View>
            )}
            {items.length === 0 ? (
              <View style={styles.state}>
                <Icon name="time-outline" size={48} color={colors.textTertiary} />
                <Text style={styles.stateTitle}>No history yet</Text>
                <Text style={styles.stateText}>
                  Real bookings and conversations will appear here as you use CareBow.
                </Text>
              </View>
            ) : (
              items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.card}
                  activeOpacity={0.75}
                  onPress={() => {
                    if (item.kind === 'booking') {
                      navigation.navigate('OrderDetails', { id: item.bookingId });
                    } else {
                      navigation.navigate('Conversation', { sessionId: item.sessionId });
                    }
                  }}
                >
                  <View style={styles.iconWrap}>
                    <Icon
                      name={
                        item.kind === 'booking' ? 'calendar-outline' : 'chatbubble-ellipses-outline'
                      }
                      size={20}
                      color={colors.accent}
                    />
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                    <Text style={styles.cardDate}>
                      {new Date(item.date).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                  <View style={styles.trailing}>
                    <Text style={styles.status}>{item.status}</Text>
                    <Icon name="chevron-forward" size={16} color={colors.textTertiary} />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        )}
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
  },
  headerButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { ...typography.h3 },
  tabs: {
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface2,
  },
  tabActive: { backgroundColor: colors.accent },
  tabText: { ...typography.label, color: colors.textSecondary },
  tabTextActive: { color: colors.textInverse },
  content: { flexGrow: 1, padding: spacing.lg, gap: spacing.sm },
  state: {
    flex: 1,
    minHeight: 360,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  stateTitle: { ...typography.h3, textAlign: 'center' },
  stateText: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  notice: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.warningSoft,
  },
  noticeText: { ...typography.bodySmall, color: colors.textSecondary, flex: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.card,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1 },
  cardTitle: { ...typography.label, color: colors.textPrimary },
  cardSubtitle: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  cardDate: { ...typography.caption, color: colors.textTertiary, marginTop: spacing.xxs },
  trailing: { alignItems: 'flex-end', gap: spacing.xxs },
  status: { ...typography.caption, color: colors.accent, textTransform: 'capitalize' },
});
