/**
 * Requests Screen
 * Lists all service requests with status tracking and professional styling
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { AppNavigationProp } from '../navigation/types';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAllRequests, useRequestsStore } from '../store/requestsStore';
import { ServiceRequest, formatMoney } from '../types/booking';
import { colors, spacing, radius, typography, shadows } from '../theme';

// Status config for consistent styling
const statusConfig: Record<ServiceRequest['requestStatus'], { bg: string; text: string; label: string; icon: string }> = {
  submitted: { bg: colors.infoSoft, text: colors.info, label: 'Submitted', icon: 'paper-plane' },
  in_review: { bg: colors.warningSoft, text: colors.warning, label: 'In Review', icon: 'eye' },
  quoted: { bg: colors.equipmentSoft, text: colors.equipment, label: 'Quote Ready', icon: 'pricetag' },
  scheduled: { bg: colors.successSoft, text: colors.success, label: 'Scheduled', icon: 'calendar-check' },
  closed: { bg: colors.surface2, text: colors.textTertiary, label: 'Closed', icon: 'checkmark-circle' },
  cancelled: { bg: colors.errorSoft, text: colors.error, label: 'Cancelled', icon: 'close-circle' },
};

// Format date for display
const formatDate = (dateISO: string) => {
  const date = new Date(dateISO);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

// Format time for display
const formatTime = (time: string) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

function RequestCard({ request, onPress }: { request: ServiceRequest; onPress: () => void }) {
  const status = statusConfig[request.requestStatus];

  return (
    <TouchableOpacity style={styles.requestCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.requestHeader}>
        <View style={styles.requestInfo}>
          <Text style={styles.serviceTitle} numberOfLines={1}>
            {request.serviceTitle}
          </Text>
          <Text style={styles.requestId}>Request #{request.id.slice(-8).toUpperCase()}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
        </View>
      </View>

      <View style={styles.requestDetails}>
        {request.memberName && (
          <View style={styles.detailRow}>
            <Icon name="person-outline" size={16} color={colors.textTertiary} />
            <Text style={styles.detailText}>{request.memberName}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Icon name="calendar-outline" size={16} color={colors.textTertiary} />
          <Text style={styles.detailText}>
            {formatDate(request.schedule.dateISO)} at {formatTime(request.schedule.timeStart)}
          </Text>
        </View>

        {request.bookingFee?.paid && (
          <View style={styles.detailRow}>
            <Icon name="star" size={16} color={colors.warning} />
            <Text style={[styles.detailText, { color: colors.warning, fontWeight: '500' }]}>
              Priority Request
            </Text>
          </View>
        )}

        {request.notes && (
          <View style={styles.notesRow}>
            <Icon name="document-text-outline" size={14} color={colors.textTertiary} />
            <Text style={styles.notesText} numberOfLines={2}>
              {request.notes}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.requestFooter}>
        {request.quote?.quotedTotal ? (
          <View>
            <Text style={styles.priceLabel}>Quoted Price</Text>
            <Text style={styles.quotedPrice}>{formatMoney(request.quote.quotedTotal)}</Text>
          </View>
        ) : (
          <View style={styles.awaitingQuote}>
            <Icon name="time-outline" size={16} color={colors.textTertiary} />
            <Text style={styles.awaitingQuoteText}>Awaiting quote</Text>
          </View>
        )}

        <View style={styles.viewDetailsBtn}>
          <Text style={styles.viewDetailsText}>View details</Text>
          <Icon name="chevron-forward" size={16} color={colors.accent} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function RequestsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation() as AppNavigationProp;
  const requests = useAllRequests();
  const clearRequests = useRequestsStore((state) => state.clearRequests);

  const handleRequestPress = (requestId: string) => {
    navigation.navigate('RequestDetails', { id: requestId });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Requests</Text>
        {requests.length > 0 ? (
          <TouchableOpacity style={styles.clearButton} onPress={clearRequests}>
            <Text style={styles.clearButtonText}>Clear all</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      {requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrap}>
            <Icon name="chatbubbles-outline" size={48} color={colors.textTertiary} />
          </View>
          <Text style={styles.emptyTitle}>No requests yet</Text>
          <Text style={styles.emptySubtitle}>
            When you submit a service request, it will appear here. Our team will review and provide a quote.
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('MainTabs')}
          >
            <Text style={styles.browseButtonText}>Browse services</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.infoCard}>
            <Icon name="information-circle" size={20} color={colors.info} />
            <Text style={styles.infoText}>
              Requests require review by our team. You'll receive a quote within 2-4 hours.
            </Text>
          </View>

          <Text style={styles.requestCount}>
            {requests.length} request{requests.length !== 1 ? 's' : ''}
          </Text>

          {requests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onPress={() => handleRequestPress(request.id)}
            />
          ))}
        </ScrollView>
      )}
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
  },
  headerTitle: {
    ...typography.h3,
  },
  headerSpacer: {
    width: 60,
  },
  clearButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  clearButtonText: {
    ...typography.labelSmall,
    color: colors.error,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.infoSoft,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.info,
    flex: 1,
    lineHeight: 20,
  },
  requestCount: {
    ...typography.caption,
    marginBottom: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  emptyIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surface2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  browseButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    ...shadows.button,
  },
  browseButtonText: {
    ...typography.labelLarge,
    color: colors.white,
  },
  requestCard: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  requestHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    rowGap: spacing.xs,
    columnGap: spacing.sm,
  },
  requestInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  serviceTitle: {
    ...typography.h4,
    marginBottom: 2,
  },
  requestId: {
    ...typography.caption,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.xs,
  },
  statusText: {
    ...typography.tiny,
    textTransform: 'uppercase',
  },
  requestDetails: {
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    ...typography.bodySmall,
  },
  notesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.xxs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  notesText: {
    ...typography.caption,
    flex: 1,
    lineHeight: 18,
  },
  requestFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    rowGap: spacing.xs,
    columnGap: spacing.sm,
  },
  priceLabel: {
    ...typography.caption,
    marginBottom: 2,
  },
  quotedPrice: {
    ...typography.h3,
    color: colors.success,
  },
  awaitingQuote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  awaitingQuoteText: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewDetailsText: {
    ...typography.labelSmall,
    color: colors.accent,
  },
});
