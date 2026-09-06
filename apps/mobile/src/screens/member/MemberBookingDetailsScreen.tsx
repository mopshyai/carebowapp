import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import {
  memberApi,
  type ProviderBookingTransition,
  type V1Booking,
} from '@/services/api/endpoints/member';
import { isProviderUserType, useAuthStore } from '@/store/useAuthStore';
import { colors, radius, spacing, typography, shadows } from '@/theme';

const providerActionForStatus = (
  status: V1Booking['status']
): { status: ProviderBookingTransition; label: string; icon: string } | null => {
  if (status === 'PENDING') {
    return { status: 'CONFIRMED', label: 'Accept assignment', icon: 'checkmark-circle-outline' };
  }
  if (status === 'CONFIRMED') {
    return { status: 'IN_PROGRESS', label: 'Start care', icon: 'play-circle-outline' };
  }
  if (status === 'IN_PROGRESS') {
    return { status: 'COMPLETED', label: 'Complete care', icon: 'checkmark-done-circle-outline' };
  }
  return null;
};

const ageFromDateOfBirth = (value?: string | null) => {
  if (!value) return null;
  const dob = new Date(value);
  if (Number.isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const beforeBirthday =
    now.getMonth() < dob.getMonth() ||
    (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate());
  if (beforeBirthday) age -= 1;
  return age >= 0 && age <= 130 ? age : null;
};

const nonEmpty = (value?: string | null) => value?.trim() || null;

export default function MemberBookingDetailsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation() as AppNavigationProp;
  const route = useRoute();
  const id = (route.params as { id?: string } | undefined)?.id;
  const userType = useAuthStore((state) => state.userType);
  const [booking, setBooking] = useState<V1Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  const load = useCallback(async () => {
    if (!id) {
      setError('Booking ID is missing.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // This screen belongs to the provider/member navigator. Use the bounded
      // provider projection instead of the generic Booking detail route so raw
      // referral delimiters and broad Profile data never become UI dependencies.
      const response = await memberApi.getProviderBooking(id);
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

  const providerAction = useMemo(
    () => (booking && isProviderUserType(userType) ? providerActionForStatus(booking.status) : null),
    [booking, userType]
  );

  const runProviderAction = async () => {
    if (!booking || !providerAction || transitioning) return;

    setTransitioning(true);
    setActionError(null);
    try {
      const response = await memberApi.updateProviderBookingStatus(booking.id, providerAction.status);
      if (!response.success) {
        setActionError(response.error || 'CareBow could not update this assignment.');
        return;
      }
      await load();
    } catch {
      setActionError('Cannot reach CareBow servers. The assignment was not changed locally.');
    } finally {
      setTransitioning(false);
    }
  };

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
  const profile = booking.profile;
  const age = ageFromDateOfBirth(profile?.dateOfBirth);
  const familyNotes = nonEmpty(booking.familyNotes);
  const handoff = booking.careHandoff;

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
            <Text style={styles.title}>{profile?.name || 'Care recipient'}</Text>
            <Text style={styles.subtitle}>{booking.service?.name || 'Care service'}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {booking.status.toLowerCase().replace(/_/g, ' ')}
            </Text>
          </View>
        </View>

        {providerAction ? (
          <View style={styles.actionCard}>
            <Text style={styles.sectionTitle}>Assignment</Text>
            <Text style={styles.sectionHint}>
              This updates the same CareBow Booking. The server verifies that this assignment belongs to you before changing its status.
            </Text>
            {actionError ? <Text style={styles.actionError}>{actionError}</Text> : null}
            <TouchableOpacity
              style={[styles.primaryButton, transitioning && styles.buttonDisabled]}
              disabled={transitioning}
              onPress={() => void runProviderAction()}
              accessibilityRole="button"
              accessibilityLabel={providerAction.label}
            >
              {transitioning ? (
                <ActivityIndicator size="small" color={colors.textInverse} />
              ) : (
                <Icon name={providerAction.icon} size={19} color={colors.textInverse} />
              )}
              <Text style={styles.primaryButtonText}>
                {transitioning ? 'Updating…' : providerAction.label}
              </Text>
            </TouchableOpacity>
          </View>
        ) : actionError ? (
          <View style={styles.actionCard}>
            <Text style={styles.actionError}>{actionError}</Text>
          </View>
        ) : null}

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

        {profile ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Patient context</Text>
            {age != null || profile.gender ? (
              <DetailRow
                icon="person-outline"
                label="Age / gender"
                value={[
                  age != null ? `${age} years` : null,
                  nonEmpty(profile.gender)?.toLowerCase().replace(/_/g, ' '),
                ]
                  .filter(Boolean)
                  .join(' · ')}
              />
            ) : null}
            {profile.bloodGroup ? (
              <DetailRow icon="water-outline" label="Blood group" value={profile.bloodGroup} />
            ) : null}
            {nonEmpty(profile.conditions) ? (
              <DetailRow icon="medical-outline" label="Conditions" value={profile.conditions!.trim()} />
            ) : null}
            {nonEmpty(profile.allergies) ? (
              <DetailRow icon="alert-circle-outline" label="Allergies" value={profile.allergies!.trim()} />
            ) : null}
            {nonEmpty(profile.medications) ? (
              <DetailRow icon="bandage-outline" label="Medications" value={profile.medications!.trim()} />
            ) : null}
          </View>
        ) : null}

        <View style={[styles.card, styles.handoffCard]}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.handoffIcon}>
              <Icon name="clipboard-outline" size={18} color={colors.accent} />
            </View>
            <View style={styles.sectionHeaderCopy}>
              <Text style={styles.sectionTitle}>Care handoff</Text>
              <Text style={styles.sectionHint}>
                Family notes and bounded Ask CareBow referral context are kept separate.
              </Text>
            </View>
          </View>

          {familyNotes ? (
            <View style={styles.handoffSection}>
              <Text style={styles.detailLabel}>Family notes</Text>
              <Text style={styles.notes}>{familyNotes}</Text>
            </View>
          ) : null}

          {handoff ? (
            <View style={styles.handoffSection}>
              <View style={styles.referralBadge}>
                <Icon name="sparkles-outline" size={15} color={colors.accent} />
                <Text style={styles.referralBadgeText}>Ask CareBow referral</Text>
              </View>
              {handoff.triageLevel ? (
                <DetailRow icon="pulse-outline" label="Triage" value={handoff.triageLevel} />
              ) : null}
              {handoff.requestedCare ? (
                <DetailRow icon="heart-outline" label="Requested care" value={handoff.requestedCare} />
              ) : null}
              {handoff.symptoms.length > 0 ? (
                <DetailRow icon="list-outline" label="Symptoms" value={handoff.symptoms.join(', ')} />
              ) : null}
              <Text style={styles.disclaimer}>{handoff.disclaimer}</Text>
            </View>
          ) : null}

          {!familyNotes && !handoff ? (
            <Text style={styles.emptyText}>No additional handoff context was provided.</Text>
          ) : null}
        </View>

        {booking.consultationNote ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Consultation note</Text>
            <DetailRow
              icon="chatbox-ellipses-outline"
              label="Chief complaint"
              value={booking.consultationNote.chiefComplaint}
            />
            <DetailRow
              icon="document-text-outline"
              label="Diagnosis"
              value={booking.consultationNote.diagnosis}
            />
            {booking.consultationNote.findings ? (
              <DetailRow icon="search-outline" label="Findings" value={booking.consultationNote.findings} />
            ) : null}
            {booking.consultationNote.treatmentPlan ? (
              <DetailRow
                icon="checkmark-done-outline"
                label="Treatment plan"
                value={booking.consultationNote.treatmentPlan}
              />
            ) : null}
          </View>
        ) : null}

        {booking.prescription ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Prescription / plan</Text>
            {booking.prescription.medicines?.length ? (
              <DetailRow
                icon="medkit-outline"
                label="Medicines"
                value={booking.prescription.medicines
                  .map((medicine) =>
                    [medicine.name, medicine.dose, medicine.frequency, medicine.duration]
                      .filter(Boolean)
                      .join(' · ')
                  )
                  .join('\n')}
              />
            ) : null}
            {booking.prescription.labTests?.length ? (
              <DetailRow
                icon="flask-outline"
                label="Lab tests"
                value={booking.prescription.labTests.join(', ')}
              />
            ) : null}
            {booking.prescription.advice ? (
              <DetailRow icon="information-circle-outline" label="Advice" value={booking.prescription.advice} />
            ) : null}
          </View>
        ) : null}

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
  actionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
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
  actionError: { ...typography.bodySmall, color: colors.error },
  handoffSection: { gap: spacing.sm },
  referralBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.accentMuted,
  },
  referralBadgeText: { ...typography.caption, color: colors.accent, fontWeight: '600' },
  disclaimer: { ...typography.caption, color: colors.textTertiary, fontStyle: 'italic' },
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
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  buttonDisabled: { opacity: 0.65 },
  primaryButtonText: { ...typography.label, color: colors.textInverse },
  linkButton: { padding: spacing.sm },
  linkText: { ...typography.label, color: colors.accent },
});