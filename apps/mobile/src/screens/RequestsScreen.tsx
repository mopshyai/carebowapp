import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import type { AppNavigationProp } from '../navigation/types';
import { careRequestsApi, type CareRequest } from '../services/api/endpoints/careRequests';
import { formatMinor } from '../data/countries';
import { colors, layout, radius, shadows, space, typography } from '../theme/tokens';

const TERMINAL = new Set(['COMPLETED', 'CANCELLED']);

const humanize = (value: string) => value.toLowerCase().replace(/_/g, ' ');

const formatQuote = (request: CareRequest) =>
  request.quote
    ? formatMinor(request.quote.amountMinor, request.quote.currency)
    : null;

const requestTitle = (request: CareRequest) =>
  request.linkedBooking?.serviceName || request.serviceHint || 'Custom care request';

export default function RequestsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation() as AppNavigationProp;
  const [requests, setRequests] = useState<CareRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const next = await careRequestsApi.list({ includeCompleted: true });
      setRequests(next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load your care requests.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Request state can change in operations while the customer is elsewhere in
  // the app. Re-read server truth whenever this route becomes active instead of
  // treating an old client snapshot as authoritative.
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const activeCount = requests.filter((request) => !TERMINAL.has(request.status)).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.header, { paddingTop: insets.top + space.sm }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Care requests</Text>
          {!loading && requests.length > 0 ? (
            <Text style={styles.headerMeta}>{activeCount} active</Text>
          ) : null}
        </View>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.xl }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
      >
        {loading && requests.length === 0 ? (
          <View style={styles.state}>
            <ActivityIndicator size="large" color={colors.primary.default} />
            <Text style={styles.stateText}>Loading your care requests…</Text>
          </View>
        ) : error && requests.length === 0 ? (
          <View style={styles.state}>
            <Icon name="cloud-offline-outline" size={48} color={colors.text.tertiary} />
            <Text style={styles.stateTitle}>Requests unavailable</Text>
            <Text style={styles.stateText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => load()}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : requests.length === 0 ? (
          <View style={styles.state}>
            <Icon name="sparkles-outline" size={48} color={colors.text.tertiary} />
            <Text style={styles.stateTitle}>No custom care requests yet</Text>
            <Text style={styles.stateText}>
              When Ask CareBow helps arrange something outside the standard catalog, its real
              operations status will appear here.
            </Text>
          </View>
        ) : (
          <>
            {error ? (
              <View style={styles.inlineError}>
                <Icon name="warning-outline" size={18} color={colors.text.secondary} />
                <Text style={styles.inlineErrorText}>
                  Could not refresh. Showing the last server response on this screen.
                </Text>
              </View>
            ) : null}

            {requests.map((request) => {
              const quote = formatQuote(request);
              const linked = request.linkedBooking;
              const awaitingCustomer =
                request.status === 'CUSTOMER_APPROVAL' || request.status === 'PAYMENT_PENDING';

              return (
                <TouchableOpacity
                  key={request.id}
                  style={styles.card}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('RequestDetails', { id: request.id })}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardTitleWrap}>
                      <Text style={styles.serviceName}>{requestTitle(request)}</Text>
                      <Text style={styles.requestId}>
                        Request #{request.id.slice(-8).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>{humanize(request.status)}</Text>
                    </View>
                  </View>

                  <Text style={styles.requestText} numberOfLines={3}>
                    {request.requestText}
                  </Text>

                  <View style={styles.detailRow}>
                    <Icon name="person-outline" size={17} color={colors.text.tertiary} />
                    <Text style={styles.detailText}>
                      {request.profile?.name || 'Care recipient'}
                    </Text>
                  </View>

                  {request.location ? (
                    <View style={styles.detailRow}>
                      <Icon name="location-outline" size={17} color={colors.text.tertiary} />
                      <Text style={styles.detailText}>{request.location}</Text>
                    </View>
                  ) : null}

                  {request.escalation ? (
                    <View style={styles.detailRow}>
                      <Icon name="alert-circle-outline" size={17} color={colors.text.tertiary} />
                      <Text style={styles.detailText}>
                        {request.escalation.acknowledgedAt
                          ? 'Urgent request acknowledged by CareBow operations'
                          : 'Urgent request is in the CareBow operations queue'}
                      </Text>
                    </View>
                  ) : null}

                  {linked ? (
                    <View style={styles.linkedBooking}>
                      <Icon name="calendar-outline" size={17} color={colors.primary.default} />
                      <Text style={styles.linkedBookingText}>
                        Provider booking {humanize(linked.status)}
                        {linked.providerName ? ` · ${linked.providerName}` : ''}
                      </Text>
                    </View>
                  ) : null}

                  <View style={styles.cardFooter}>
                    <View>
                      <Text style={styles.footerLabel}>{quote ? 'Quote' : 'Updated'}</Text>
                      <Text style={styles.footerValue}>
                        {quote || new Date(request.updatedAt).toLocaleDateString()}
                      </Text>
                    </View>
                    {awaitingCustomer ? (
                      <View style={styles.actionChip}>
                        <Icon
                          name={request.status === 'PAYMENT_PENDING' ? 'card-outline' : 'checkmark-circle-outline'}
                          size={14}
                          color={colors.text.inverse}
                        />
                        <Text style={styles.actionChipText}>
                          {request.status === 'PAYMENT_PENDING' ? 'Payment due' : 'Review quote'}
                        </Text>
                      </View>
                    ) : (
                      <Icon name="chevron-forward" size={20} color={colors.text.tertiary} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: space.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerCopy: { alignItems: 'center' },
  headerTitle: { ...typography.sectionHeader, color: colors.text.primary },
  headerMeta: { ...typography.caption, color: colors.text.tertiary, marginTop: 1 },
  content: { flexGrow: 1, padding: space.lg, gap: space.md },
  state: {
    flex: 1,
    minHeight: 420,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    paddingHorizontal: space.xl,
  },
  stateTitle: { ...typography.sectionHeader, color: colors.text.primary, textAlign: 'center' },
  stateText: { ...typography.body, color: colors.text.secondary, textAlign: 'center' },
  retryButton: {
    marginTop: space.sm,
    backgroundColor: colors.primary.default,
    borderRadius: radius.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  retryText: { ...typography.label, color: colors.text.inverse },
  inlineError: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    padding: space.md,
  },
  inlineErrorText: { ...typography.body, color: colors.text.secondary, flex: 1 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    gap: space.sm,
    ...shadows.card,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: space.sm },
  cardTitleWrap: { flex: 1 },
  serviceName: { ...typography.sectionHeaderSmall, color: colors.text.primary },
  requestId: { ...typography.caption, color: colors.text.tertiary, marginTop: 2 },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: space.sm,
    paddingVertical: space.xxs,
    backgroundColor: colors.primary.muted,
  },
  statusText: { ...typography.caption, color: colors.primary.default, textTransform: 'capitalize' },
  requestText: { ...typography.body, color: colors.text.secondary },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  detailText: { ...typography.body, color: colors.text.secondary, flex: 1 },
  linkedBooking: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    padding: space.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primary.muted,
  },
  linkedBookingText: { ...typography.body, color: colors.text.primary, flex: 1 },
  cardFooter: {
    marginTop: space.xs,
    paddingTop: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: space.sm,
  },
  footerLabel: { ...typography.caption, color: colors.text.tertiary },
  footerValue: { ...typography.sectionHeaderSmall, color: colors.text.primary, marginTop: 2 },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    backgroundColor: colors.primary.default,
    borderRadius: radius.full,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
  actionChipText: { ...typography.caption, color: colors.text.inverse, fontWeight: '600' },
});
