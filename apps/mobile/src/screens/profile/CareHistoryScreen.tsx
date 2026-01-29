/**
 * Care History Screen
 * Unified view of Orders, ServiceRequests, and AskCareBow conversations
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../../theme';
import { useOrdersStore } from '../../store/useOrdersStore';
import { useServiceRequestStore } from '../../store/useServiceRequestStore';
import { useAskCarebowStore } from '../../store/askCarebowStore';

type TabType = 'all' | 'orders' | 'requests' | 'conversations';

const TABS: { id: TabType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'orders', label: 'Orders' },
  { id: 'requests', label: 'Requests' },
  { id: 'conversations', label: 'Ask CareBow' },
];

export default function CareHistoryScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const orders = useOrdersStore((state) => state.orders);
  const requests = useServiceRequestStore((state) => state.requests);
  const sessions = useAskCarebowStore((state) => state.sessions);

  // Combine and sort all items by date
  const allItems = [
    ...orders.map((o) => ({ type: 'order' as const, data: o, date: o.createdAt })),
    ...requests.map((r) => ({ type: 'request' as const, data: r, date: r.createdAt })),
    ...sessions.map((s) => ({ type: 'conversation' as const, data: s, date: s.createdAt })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredItems = activeTab === 'all'
    ? allItems
    : allItems.filter((item) => {
        if (activeTab === 'orders') return item.type === 'order';
        if (activeTab === 'requests') return item.type === 'request';
        if (activeTab === 'conversations') return item.type === 'conversation';
        return true;
      });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'accepted':
        return colors.success;
      case 'pending':
      case 'submitted':
      case 'under_review':
        return colors.warning;
      case 'cancelled':
      case 'declined':
        return colors.error;
      default:
        return colors.info;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleItemPress = (item: typeof allItems[0]) => {
    if (item.type === 'order') {
      navigation.navigate(`/order-details/${item.data.id}` as any);
    } else if (item.type === 'request') {
      navigation.navigate(`/request-details/${item.data.id}` as any);
    } else {
      // For conversations, we could navigate to view the conversation
      navigation.navigate('Conversation');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Care History</Text>
        <View style={styles.headerButton} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 32 + insets.bottom }]}
      >
        {filteredItems.length > 0 ? (
          <View style={styles.itemsList}>
            {filteredItems.map((item, index) => (
              <Pressable
                key={`${item.type}-${item.data.id}`}
                style={({ pressed }) => [styles.itemCard, pressed && styles.pressed]}
                onPress={() => handleItemPress(item)}
              >
                <View style={styles.itemHeader}>
                  <View
                    style={[
                      styles.itemIcon,
                      {
                        backgroundColor:
                          item.type === 'order'
                            ? colors.accentMuted
                            : item.type === 'request'
                            ? colors.secondarySoft
                            : colors.infoSoft,
                      },
                    ]}
                  >
                    <Icon
                      name={
                        item.type === 'order'
                          ? 'receipt-outline'
                          : item.type === 'request'
                          ? 'document-text-outline'
                          : 'chatbubble-ellipses-outline'
                      }
                      size={20}
                      color={
                        item.type === 'order'
                          ? colors.accent
                          : item.type === 'request'
                          ? colors.secondary
                          : colors.info
                      }
                    />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemType}>
                      {item.type === 'order'
                        ? 'Order'
                        : item.type === 'request'
                        ? 'Service Request'
                        : 'Conversation'}
                    </Text>
                    <Text style={styles.itemTitle} numberOfLines={1}>
                      {item.type === 'order'
                        ? (item.data as any).serviceName || 'Service Order'
                        : item.type === 'request'
                        ? (item.data as any).serviceName || 'Service Request'
                        : 'Health Conversation'}
                    </Text>
                  </View>
                  <View style={styles.itemMeta}>
                    <Text style={styles.itemDate}>{formatDate(item.date)}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: `${getStatusColor((item.data as any).status)}15` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor((item.data as any).status) },
                        ]}
                      >
                        {(item.data as any).status || 'completed'}
                      </Text>
                    </View>
                  </View>
                </View>

                {item.type !== 'conversation' && (item.data as any).total && (
                  <View style={styles.itemFooter}>
                    <Text style={styles.itemTotal}>
                      ${((item.data as any).total / 100).toFixed(2)}
                    </Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Icon name="time-outline" size={48} color={colors.textTertiary} />
            </View>
            <Text style={styles.emptyTitle}>No History Yet</Text>
            <Text style={styles.emptyDescription}>
              Your care history will appear here once you book services or use Ask CareBow
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

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
    backgroundColor: colors.surface,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h4,
  },
  tabsContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabs: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  tab: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.surface2,
  },
  tabActive: {
    backgroundColor: colors.accent,
  },
  tabText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.textInverse,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  itemsList: {
    gap: spacing.sm,
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.card,
  },
  pressed: {
    opacity: 0.95,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemType: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: 2,
  },
  itemTitle: {
    ...typography.label,
  },
  itemMeta: {
    alignItems: 'flex-end',
  },
  itemDate: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.xxs,
  },
  statusBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  statusText: {
    ...typography.tiny,
    textTransform: 'capitalize',
  },
  itemFooter: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  itemTotal: {
    ...typography.labelLarge,
    color: colors.accent,
  },
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
    ...shadows.card,
  },
  emptyTitle: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  emptyDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
});
