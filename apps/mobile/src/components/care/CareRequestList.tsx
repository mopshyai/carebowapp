import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet } from 'react-native';
import { AppState } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { careRequestsApi, type CareRequest } from '../../services/api/endpoints/careRequests';
import { formatMinor } from '../../data/countries';
import { colors, radius, space, typography } from '../../theme/tokens';

const TERMINAL_STATUSES = new Set(['COMPLETED', 'CANCELLED']);

/**
 * Compact summary of the signed-in customer's care requests, shown at the top
 * of the bookings screen. All approve/pay/cancel actions live on
 * RequestDetailsScreen (the same server-authorized flow the dedicated
 * Requests tab uses, including hosted-checkout payment) — this list only
 * reads and navigates, so there is exactly one place that mutates a request.
 */
export default function CareRequestList({
  onBooking,
  onOpenRequest,
}: {
  onBooking: (id: string) => void;
  onOpenRequest: (id: string) => void;
}) {
  const [requests, setRequests] = useState<CareRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const active = useRef(false);
  const inFlight = useRef(false);
  const load = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const rows = await careRequestsApi.list();
      if (active.current) {
        setRequests(rows);
        setError(null);
      }
    } catch (cause) {
      if (active.current)
        setError(cause instanceof Error ? cause.message : 'Could not load care requests');
    } finally {
      inFlight.current = false;
      if (active.current) setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      active.current = true;
      void load();
      const subscription = AppState.addEventListener('change', (state) => {
        if (state === 'active') void load();
      });
      const interval = setInterval(() => {
        if (AppState.currentState === 'active') void load();
      }, 15000);
      return () => {
        active.current = false;
        subscription.remove();
        clearInterval(interval);
      };
    }, [load])
  );

  if (loading) {
    return (
      <View style={styles.section}>
        <ActivityIndicator accessibilityLabel="Loading care requests" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.section}>
        <Text accessibilityRole="alert" style={styles.body}>
          {error}
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          style={styles.button}
          onPress={() => void load()}
        >
          <Text style={styles.buttonText}>Retry care requests</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (requests.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Care requests</Text>
      <Text style={styles.body}>
        Requests and quotes from Ask CareBow, shared with your care team.
      </Text>
      {requests.map((request) => (
        <View key={request.id} style={styles.card}>
          <Text style={styles.heading}>{request.serviceHint || request.requestText}</Text>
          {request.serviceHint && <Text style={styles.body}>{request.requestText}</Text>}
          <Text style={styles.body}>{request.profile?.name || 'Care recipient'}</Text>
          <Text style={styles.status}>{request.status.toLowerCase().replace(/_/g, ' ')}</Text>
          {request.preferredDate && (
            <Text style={styles.body}>
              {new Date(request.preferredDate).toLocaleDateString()} {request.preferredWindow}
            </Text>
          )}
          {request.quote && (
            <Text style={styles.heading}>
              {formatMinor(request.quote.amountMinor, request.quote.currency)}
            </Text>
          )}
          {request.linkedBooking ? (
            <TouchableOpacity
              accessibilityRole="button"
              style={styles.button}
              onPress={() => onBooking(request.linkedBooking!.bookingId)}
            >
              <Text style={styles.buttonText}>View booking</Text>
            </TouchableOpacity>
          ) : !TERMINAL_STATUSES.has(request.status) ? (
            <TouchableOpacity
              accessibilityRole="button"
              style={styles.button}
              onPress={() => onOpenRequest(request.id)}
            >
              <Text style={styles.buttonText}>
                {request.status === 'CUSTOMER_APPROVAL'
                  ? 'Review quote'
                  : request.status === 'PAYMENT_PENDING'
                    ? 'Continue payment'
                    : 'View request'}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.sm },
  card: {
    gap: space.sm,
    padding: space.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  heading: { ...typography.sectionHeaderSmall, color: colors.text.primary },
  body: { ...typography.body, color: colors.text.secondary },
  status: { ...typography.label, color: colors.primary.default, textTransform: 'capitalize' },
  button: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    padding: space.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primary.muted,
  },
  buttonText: { ...typography.label, color: colors.primary.default },
});
