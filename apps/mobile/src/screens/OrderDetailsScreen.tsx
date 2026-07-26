import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { memberApi, V1Booking } from '../services/api/endpoints/member';
import { colors, radius, spacing, typography } from '../theme';

const money = (paise: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format((paise || 0) / 100);

export default function OrderDetailsScreen() {
  const navigation = useNavigation();
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
      if (!response.success || !response.booking)
        throw new Error(response.error || 'Booking not found');
      setBooking(response.booking);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load booking');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const cancel = async () => {
    if (!id) return;
    try {
      const response = await memberApi.cancelBooking(id);
      if (!response.success) throw new Error(response.error || 'Cancellation failed');
      await load();
    } catch (err) {
      Alert.alert('Could not cancel', err instanceof Error ? err.message : 'Try again later.');
    }
  };

  if (loading)
    return (
      <View style={styles.state}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.body}>Loading booking…</Text>
      </View>
    );
  if (!booking)
    return (
      <View style={styles.state}>
        <Icon name="alert-circle-outline" size={48} color={colors.textTertiary} />
        <Text style={styles.title}>Booking unavailable</Text>
        <Text style={styles.body}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );

  const when = new Date(booking.scheduledAt);
  const cancellable = booking.status === 'PENDING' || booking.status === 'CONFIRMED';
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color={colors.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.title}>{booking.service?.name || 'Care booking'}</Text>
      <Text style={styles.status}>{booking.status.toLowerCase().replace(/_/g, ' ')}</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Care recipient</Text>
        <Text style={styles.value}>{booking.profile?.name || 'Not provided'}</Text>
        <Text style={styles.label}>Preferred time</Text>
        <Text style={styles.value}>{when.toLocaleString()}</Text>
        <Text style={styles.label}>Amount</Text>
        <Text style={styles.value}>{money(booking.amount)}</Text>
        <Text style={styles.label}>Provider</Text>
        <Text style={styles.value}>{booking.provider?.name || 'Not assigned yet'}</Text>
      </View>
      {cancellable && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() =>
            Alert.alert('Cancel booking?', 'This updates the real CareBow booking.', [
              { text: 'Keep booking', style: 'cancel' },
              { text: 'Cancel booking', style: 'destructive', onPress: cancel },
            ])
          }
        >
          <Text style={styles.cancelText}>Cancel booking</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface2, padding: spacing.xl, paddingTop: 64 },
  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.surface2,
  },
  back: { width: 44, height: 44, justifyContent: 'center' },
  title: { ...typography.h2, color: colors.textPrimary, textAlign: 'center' },
  body: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  status: {
    ...typography.label,
    color: colors.accent,
    textTransform: 'capitalize',
    textAlign: 'center',
    marginVertical: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  label: { ...typography.caption, color: colors.textTertiary, marginTop: spacing.sm },
  value: { ...typography.body, color: colors.textPrimary },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  buttonText: { ...typography.labelLarge, color: colors.textInverse },
  cancelButton: {
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  cancelText: { ...typography.labelLarge, color: colors.error },
});
