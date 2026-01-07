/**
 * Request Details Screen
 * Shows full details of a service request including status timeline
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRequestsStore } from '../store/requestsStore';
import { formatMoney, RequestStatus, ServiceRequest } from '../types/booking';
import { colors, spacing, radius, typography, shadows } from '../theme';

// Status timeline config
const STATUS_TIMELINE: { status: RequestStatus; label: string; icon: string }[] = [
  { status: 'submitted', label: 'Submitted', icon: 'send' },
  { status: 'in_review', label: 'In Review', icon: 'eye' },
  { status: 'quoted', label: 'Quote Ready', icon: 'pricetag' },
  { status: 'scheduled', label: 'Scheduled', icon: 'calendar' },
  { status: 'closed', label: 'Completed', icon: 'checkmark-circle' },
];

// Status config
const statusConfig: Record<ServiceRequest['requestStatus'], { bg: string; text: string; label: string }> = {
  submitted: { bg: colors.infoSoft, text: colors.info, label: 'Submitted' },
  in_review: { bg: colors.warningSoft, text: colors.warning, label: 'In Review' },
  quoted: { bg: colors.equipmentSoft, text: colors.equipment, label: 'Quote Ready' },
  scheduled: { bg: colors.successSoft, text: colors.success, label: 'Scheduled' },
  closed: { bg: colors.surface2, text: colors.textTertiary, label: 'Completed' },
  cancelled: { bg: colors.errorSoft, text: colors.error, label: 'Cancelled' },
};

// Get status index for timeline
const getStatusIndex = (status: RequestStatus): number => {
  if (status === 'cancelled') return -1;
  return STATUS_TIMELINE.findIndex((s) => s.status === status);
};

// Format date for display
const formatDate = (dateISO: string) => {
  const date = new Date(dateISO);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
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

// Format ISO datetime
const formatDateTime = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export default function RequestDetailsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = (route.params as { id: string }) || {};

  const request = useRequestsStore((state) => state.getRequestById(id || ''));
  const cancelRequest = useRequestsStore((state) => state.cancelRequest);
  const acceptQuote = useRequestsStore((state) => state.acceptQuote);

  if (!request) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIconWrap}>
            <Icon name="alert-circle-outline" size={48} color={colors.textTertiary} />
          </View>
          <Text style={styles.errorTitle}>Request not found</Text>
          <Text style={styles.errorSubtitle}>
            This request may have been removed or doesn't exist.
          </Text>
          <TouchableOpacity style={styles.errorButton} onPress={() => navigation.goBack()}>
            <Text style={styles.errorButtonText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleCancel = () => {
    Alert.alert(
      'Cancel Request',
      'Are you sure you want to cancel this request? This action cannot be undone.',
      [
        { text: 'Keep Request', style: 'cancel' },
        {
          text: 'Cancel Request',
          style: 'destructive',
          onPress: () => {
            cancelRequest(request.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleAcceptQuote = () => {
    acceptQuote(request.id);
  };

  const currentStatusIndex = getStatusIndex(request.requestStatus);
  const status = statusConfig[request.requestStatus];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Request ID & Status */}
        <View style={styles.card}>
          <View style={styles.requestIdRow}>
            <View>
              <Text style={styles.requestIdLabel}>Request ID</Text>
              <Text style={styles.requestId}>#{request.id.slice(-8).toUpperCase()}</Text>
            </View>
            <View style={styles.badgeRow}>
              <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
              </View>
              {request.bookingFee?.paid && (
                <View style={styles.priorityBadge}>
                  <Icon name="star" size={10} color={colors.white} />
                  <Text style={styles.priorityText}>Priority</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Status Timeline */}
        {request.requestStatus !== 'cancelled' && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconWrap, { backgroundColor: colors.accentSoft }]}>
                <Icon name="git-branch" size={18} color={colors.accent} />
              </View>
              <Text style={styles.cardTitle}>Status Timeline</Text>
            </View>
            <View style={styles.timeline}>
              {STATUS_TIMELINE.map((step, index) => {
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;

                return (
                  <View key={step.status} style={styles.timelineItem}>
                    <View style={styles.timelineLeft}>
                      <View
                        style={[
                          styles.timelineDot,
                          isCompleted && styles.timelineDotCompleted,
                          isCurrent && styles.timelineDotCurrent,
                        ]}
                      >
                        <Icon
                          name={step.icon}
                          size={12}
                          color={isCompleted ? colors.white : colors.textTertiary}
                        />
                      </View>
                      {index < STATUS_TIMELINE.length - 1 && (
                        <View
                          style={[
                            styles.timelineLine,
                            index < currentStatusIndex && styles.timelineLineCompleted,
                          ]}
                        />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.timelineLabel,
                        isCompleted && styles.timelineLabelCompleted,
                        isCurrent && styles.timelineLabelCurrent,
                      ]}
                    >
                      {step.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Service Details */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconWrap, { backgroundColor: colors.medicalSoft }]}>
              <Icon name="medical" size={18} color={colors.medical} />
            </View>
            <Text style={styles.cardTitle}>Service Details</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Service</Text>
            <Text style={styles.infoValue}>{request.serviceTitle}</Text>
          </View>
          {request.memberName && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Patient</Text>
              <Text style={styles.infoValue}>{request.memberName}</Text>
            </View>
          )}
        </View>

        {/* Schedule */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconWrap, { backgroundColor: colors.infoSoft }]}>
              <Icon name="calendar" size={18} color={colors.info} />
            </View>
            <Text style={styles.cardTitle}>Schedule</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>{formatDate(request.schedule.dateISO)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Time</Text>
            <Text style={styles.infoValue}>{formatTime(request.schedule.timeStart)}</Text>
          </View>
        </View>

        {/* Notes */}
        {request.notes && request.notes.trim() && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconWrap, { backgroundColor: colors.accentSoft }]}>
                <Icon name="document-text" size={18} color={colors.accent} />
              </View>
              <Text style={styles.cardTitle}>Your Request</Text>
            </View>
            <Text style={styles.notesText}>{request.notes}</Text>
          </View>
        )}

        {/* Quote (if available) */}
        {request.quote && (
          <View style={[styles.card, styles.quoteCard]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconWrap, { backgroundColor: colors.equipmentSoft }]}>
                <Icon name="pricetag" size={18} color={colors.equipment} />
              </View>
              <Text style={styles.cardTitle}>Quote</Text>
            </View>
            {request.quote.quotedTotal && (
              <View style={styles.quoteAmount}>
                <Text style={styles.quoteLabel}>Quoted Price</Text>
                <Text style={styles.quotePrice}>{formatMoney(request.quote.quotedTotal)}</Text>
              </View>
            )}
            {request.quote.quoteNotes && (
              <Text style={styles.quoteNotes}>{request.quote.quoteNotes}</Text>
            )}
            {request.quote.quotedAtISO && (
              <Text style={styles.quoteDate}>
                Quoted on {formatDateTime(request.quote.quotedAtISO)}
              </Text>
            )}
            {request.requestStatus === 'quoted' && (
              <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptQuote}>
                <Icon name="checkmark-circle" size={18} color={colors.white} />
                <Text style={styles.acceptButtonText}>Accept Quote</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Booking Fee Info */}
        {request.bookingFee?.paid && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconWrap, { backgroundColor: colors.warningSoft }]}>
                <Icon name="star" size={18} color={colors.warning} />
              </View>
              <Text style={styles.cardTitle}>Priority Booking</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Booking Fee</Text>
              <Text style={[styles.infoValue, { color: colors.success }]}>
                {request.bookingFee.amount ? formatMoney(request.bookingFee.amount) : 'Paid'}
              </Text>
            </View>
            {request.bookingFee.paidAtISO && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Paid At</Text>
                <Text style={styles.infoValue}>{formatDateTime(request.bookingFee.paidAtISO)}</Text>
              </View>
            )}
          </View>
        )}

        {/* Activity */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconWrap, { backgroundColor: colors.surface2 }]}>
              <Icon name="time" size={18} color={colors.textTertiary} />
            </View>
            <Text style={styles.cardTitle}>Activity</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Submitted</Text>
            <Text style={styles.infoValue}>{formatDateTime(request.createdAtISO)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Updated</Text>
            <Text style={styles.infoValue}>{formatDateTime(request.updatedAtISO)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      {request.requestStatus !== 'cancelled' && request.requestStatus !== 'closed' && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Icon name="close-circle-outline" size={20} color={colors.error} />
            <Text style={styles.cancelButtonText}>Cancel Request</Text>
          </TouchableOpacity>
        </View>
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
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  errorIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  errorTitle: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  errorSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  errorButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
  },
  errorButtonText: {
    ...typography.labelLarge,
    color: colors.white,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  quoteCard: {
    borderWidth: 2,
    borderColor: colors.equipment,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  cardIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    ...typography.h4,
  },
  requestIdRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    rowGap: spacing.xs,
    columnGap: spacing.sm,
  },
  requestIdLabel: {
    ...typography.caption,
    marginBottom: 2,
  },
  requestId: {
    ...typography.h3,
    color: colors.accent,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
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
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.xs,
    backgroundColor: colors.warning,
  },
  priorityText: {
    ...typography.tiny,
    color: colors.white,
  },
  timeline: {
    gap: 0,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineLeft: {
    alignItems: 'center',
    width: 36,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  timelineDotCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  timelineDotCurrent: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  timelineLine: {
    width: 2,
    height: 20,
    backgroundColor: colors.border,
  },
  timelineLineCompleted: {
    backgroundColor: colors.success,
  },
  timelineLabel: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    marginLeft: spacing.sm,
    paddingTop: 2,
  },
  timelineLabelCompleted: {
    color: colors.textPrimary,
  },
  timelineLabelCurrent: {
    color: colors.accent,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    rowGap: spacing.xxs,
    columnGap: spacing.sm,
  },
  infoLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  infoValue: {
    ...typography.label,
    textAlign: 'right',
    flex: 1,
    marginLeft: spacing.md,
  },
  notesText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  quoteAmount: {
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.equipmentSoft,
    borderRadius: radius.md,
  },
  quoteLabel: {
    ...typography.caption,
    marginBottom: 4,
  },
  quotePrice: {
    ...typography.displayMedium,
    color: colors.equipment,
  },
  quoteNotes: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  quoteDate: {
    ...typography.caption,
    marginBottom: spacing.md,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.success,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    ...shadows.button,
  },
  acceptButtonText: {
    ...typography.labelLarge,
    color: colors.white,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.errorSoft,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  cancelButtonText: {
    ...typography.labelLarge,
    color: colors.error,
  },
});
