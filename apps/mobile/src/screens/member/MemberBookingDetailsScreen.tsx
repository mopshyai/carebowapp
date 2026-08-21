import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import type { AppNavigationProp } from '@/navigation/types';
import { memberApi, type V1Booking } from '@/services/api/endpoints/member';
import { colors, radius, spacing, typography, shadows } from '@/theme';

export default function MemberBookingDetailsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation() as AppNavigationProp;
  const route = useRoute();
  const id = (route.params as { id?: string } | undefined)?.id;
  const [booking, setBooking] = useState<V1Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) {
      setError('Booking ID is missing.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await memberApi.getBooking(id);
      if (!response.success || !response.booking) {
        setBooking(null);
        setError(response.error || 'Booking not found.');
        return;
      }
      setBooking(response.booking);
    } catch {
      setBooking(null);
      setError('Cannot reach CareBow servers. Try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const openContact = (value: string, kind: 'phone' | 'email') => {
    const href = kind === 'phone' ? `tel:${value}` : `mailto:${value}`;
    void Linking.openURL(href).catch(() => {});
  };

  if (loading) {
    return (
      <View style={styles.state}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.stateText}>Loading care details…</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={[styles.state, { paddingTop: insets.top + spacing.xl }]}>
        <Icon name="alert-circle-outline" size={48} color={colors.textTertiary} />
        <Text style={styles.title}>Care details unavailable</Text>
        <Text style={styles.stateText}>{error}</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => void load()}>
          <Text style={styles.primaryButtonText}>Try again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.goBack()}>
          <Text style={styles.linkText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const when = new Date(booking.scheduledAt);
  const phone = booking.user?.phoneNumber?.trim();
  const email = booking.user?.email?.trim();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Care details</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Icon name="medkit-outline" size={24} color={colors.accent} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.title}>{booking.profile?.name || 'Care recipient'}</Text>
            <Text style={styles.subtitle}>{booking.service?.name || 'Care service'}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {booking.status.toLowerCase().replace(/_/g, ' ')}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Appointment</Text>
          <DetailRow
            icon="calendar-outline"
            label="Date"
            value={when.toLocaleDateString([], {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          />
          <DetailRow
            icon="time-outline"
            label="Time"
            value={when.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          />
          {booking.address ? (
            <DetailRow icon="location-outline" label="Address" value={booking.address} />
          ) : null}
        </View>

        {booking.notes?.trim() ? (
          <View style={[styles.card, styles.handoffCard]}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.handoffIcon}>
                <Icon name="clipboard-outline" size={18} color={colors.accent} />
              </View>
              <View style={styles.sectionHeaderCopy}>
                <Text style={styles.sectionTitle}>Care handoff</Text>
                <Text style={styles.sectionHint}>
                  Booking notes and Ask CareBow assessment context, when available
                </Text>
              </View>
            </View>
            <Text style={styles.notes}>{booking.notes.trim()}</Text>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Care handoff</Text>
            <Text style={styles.emptyText}>No additional booking notes were provided.</Text>
          </View>
        )}

        {(phone || email) && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Customer contact</Text>
            {booking.user?.name ? (
              <DetailRow icon="person-outline" label="Booked by" value={booking.user.name} />
            ) : null}
            {phone ? (
              <TouchableOpacity
                style={styles.contactRow}
                onPress={() => openContact(phone, 'phone')}
                accessibilityRole="button"
                accessibilityLabel={`Call ${phone}`}
              >
                <Icon name="call-outline" size={18} color={colors.accent} />
                <Text style={styles.contactValue}>{phone}</Text>
                <Icon name="open-outline" size={16} color={colors.textTertiary} />
              </TouchableOpacity>
            ) : null}
            {email ? (
              <TouchableOpacity
                style={styles.contactRow}
                onPress={() => openContact(email, 'email')}
                accessibilityRole="button"
                accessibilityLabel={`Email ${email}`}
              >
                <Icon name="mail-outline" size={18} color={colors.accent} />
                <Text style={styles.contactValue}>{email}</Text>
                <Icon name="open-outline" size={16} color={colors.textTertiary} />
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Icon name={icon as any} size={18} color={colors.textTertiary} />
      <View style={styles.detailCopy}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
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
  headerButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.h4, color: colors.textPrimary },
  content: { padding: spacing.lg, gap: spacing.md },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.card,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: { flex: 1 },
  title: { ...typography.h3, color: colors.textPrimary },
  subtitle: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  statusBadge: {
    borderRadius: radius.full,
    backgroundColor: colors.accentMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statusText: {
    ...typography.caption,
    color: colors.accent,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.card,
  },
  handoffCard: { borderWidth: 1, borderColor: colors.border },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  handoffIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderCopy: { flex: 1 },
  sectionTitle: { ...typography.h4, color: colors.textPrimary },
  sectionHint: { ...typography.caption, color: colors.textTertiary, marginTop: 2 },
  notes: { ...typography.body, color: colors.textPrimary, lineHeight: 22 },
  emptyText: { ...typography.body, color: colors.textSecondary },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  detailCopy: { flex: 1 },
  detailLabel: { ...typography.caption, color: colors.textTertiary },
  detailValue: { ...typography.body, color: colors.textPrimary, marginTop: 2 },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  contactValue: { ...typography.body, color: colors.textPrimary, flex: 1 },
  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.surface2,
  },
  stateText: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  primaryButtonText: { ...typography.label, color: colors.textInverse },
  linkButton: { padding: spacing.sm },
  linkText: { ...typography.label, color: colors.accent },
});
