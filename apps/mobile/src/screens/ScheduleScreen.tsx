import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, Shadow } from '@/constants/Spacing';
import { useBookingsStore } from '@/store';

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [refreshing, setRefreshing] = useState(false);

  // Schedule, Orders and Booking Details now read the same server-state cache.
  // A cancel/payment/provider update cannot live in three independent copies.
  const bookings = useBookingsStore((state) => state.bookings);
  const bookingStatus = useBookingsStore((state) => state.status);
  const bookingError = useBookingsStore((state) => state.error);
  const fetchBookings = useBookingsStore((state) => state.fetch);

  useFocusEffect(
    useCallback(() => {
      void fetchBookings();
    }, [fetchBookings])
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchBookings({ force: true });
    } finally {
      setRefreshing(false);
    }
  }, [fetchBookings]);

  const appointments = useMemo(() => {
    const now = Date.now();
    return bookings
      .filter((booking) => {
        const scheduledTime = new Date(booking.scheduledAt).getTime();
        const terminal = booking.status === 'COMPLETED' || booking.status === 'CANCELLED';
        const isPast = terminal || scheduledTime < now;
        return activeTab === 'past' ? isPast : !isPast;
      })
      .sort((a, b) => {
        const difference = +new Date(a.scheduledAt) - +new Date(b.scheduledAt);
        return activeTab === 'past' ? -difference : difference;
      });
  }, [activeTab, bookings]);

  const loading = bookingStatus === 'loading' && bookings.length === 0;
  const loadError = bookingStatus === 'error' && bookings.length === 0;

  const handleBookAppointment = () => {
    // This is the actual catalog id. The previous "healthcare" alias missed
    // `health_care` and could fall through to the entire catalog.
    navigation.navigate('Services', { category: 'health_care' });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing[3] }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={Colors.gray[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleBookAppointment}>
          <Icon name="add" size={24} color={Colors.primary[600]} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.tabActive]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>Past</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 32 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      >
        {activeTab === 'upcoming' && (
          <View style={styles.infoBanner}>
            <View style={styles.infoBannerIcon}>
              <Icon name="heart" size={20} color={Colors.primary[600]} />
            </View>
            <View style={styles.infoBannerContent}>
              <Text style={styles.infoBannerTitle}>Need care guidance?</Text>
              <Text style={styles.infoBannerText}>
                Use Ask CareBow to describe symptoms, then carry the recommendation into a real
                booking without starting over.
              </Text>
            </View>
          </View>
        )}

        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={Colors.primary[600]} />
            <Text style={styles.emptyStateText}>Loading your appointments…</Text>
          </View>
        ) : loadError ? (
          <View style={styles.emptyState}>
            <Icon name="cloud-offline-outline" size={48} color={Colors.gray[400]} />
            <Text style={styles.emptyStateTitle}>Could not load appointments</Text>
            <Text style={styles.emptyStateText}>
              {bookingError || 'Check your connection and pull down to try again.'}
            </Text>
          </View>
        ) : appointments.length > 0 ? (
          <View style={styles.appointmentsList}>
            {appointments.map((appointment) => {
              const providerAssigned = Boolean(appointment.provider?.name);
              const scheduledAt = new Date(appointment.scheduledAt);
              const paymentDue =
                appointment.amount > 0 &&
                appointment.paymentStatus !== 'PAID' &&
                appointment.paymentStatus !== 'REFUNDED' &&
                appointment.paymentStatus !== 'REFUND_PENDING' &&
                ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(appointment.status);

              return (
                <TouchableOpacity
                  key={appointment.id}
                  style={styles.appointmentCard}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('OrderDetails', { id: appointment.id })}
                >
                  <View style={styles.appointmentHeader}>
                    <View style={styles.doctorAvatar}>
                      <Icon
                        name={providerAssigned ? 'person' : 'people-outline'}
                        size={24}
                        color={Colors.primary[600]}
                      />
                    </View>
                    <View style={styles.doctorInfo}>
                      <Text style={styles.doctorName}>
                        {appointment.provider?.name || 'Provider assignment pending'}
                      </Text>
                      <Text style={styles.doctorSpecialty}>
                        {appointment.service?.name || 'Care appointment'}
                        {appointment.profile?.name ? ` · ${appointment.profile.name}` : ''}
                      </Text>
                    </View>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusBadgeText}>
                        {appointment.status.toLowerCase().replace(/_/g, ' ')}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.appointmentDetails}>
                    <View style={styles.appointmentDetail}>
                      <Icon name="calendar-outline" size={16} color={Colors.gray[500]} />
                      <Text style={styles.appointmentDetailText}>
                        {scheduledAt.toLocaleDateString([], {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                    </View>
                    <View style={styles.appointmentDetail}>
                      <Icon name="time-outline" size={16} color={Colors.gray[500]} />
                      <Text style={styles.appointmentDetailText}>
                        {scheduledAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={styles.cardFooterText}>
                      {paymentDue
                        ? 'Payment due · Open booking'
                        : appointment.paymentStatus === 'PAID'
                          ? 'Paid · Open booking'
                          : 'Open booking details'}
                    </Text>
                    <Icon name="chevron-forward" size={18} color={Colors.gray[400]} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <Icon name="calendar-outline" size={48} color={Colors.gray[400]} />
            </View>
            <Text style={styles.emptyStateTitle}>No {activeTab} appointments</Text>
            <Text style={styles.emptyStateText}>
              {activeTab === 'upcoming'
                ? 'Book a care service or start with Ask CareBow.'
                : 'Completed and cancelled bookings will appear here.'}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookAppointment}>
          <Icon name="add-circle" size={20} color={Colors.white} />
          <Text style={styles.bookButtonText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[3],
    backgroundColor: Colors.white,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    color: Colors.gray[900],
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[3],
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
    gap: Spacing[2],
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing[3],
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
  },
  tabActive: {
    backgroundColor: Colors.primary[600],
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray[600],
  },
  tabTextActive: {
    color: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing[6],
  },
  infoBanner: {
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[200],
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[4],
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
    marginBottom: Spacing[6],
  },
  infoBannerIcon: {
    width: 36,
    height: 36,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBannerContent: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary[900],
    marginBottom: Spacing[1],
  },
  infoBannerText: {
    fontSize: 12,
    color: Colors.primary[700],
    lineHeight: 18,
  },
  appointmentsList: {
    gap: Spacing[4],
  },
  appointmentCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[5],
    ...Shadow.sm,
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
    marginBottom: Spacing[4],
  },
  doctorAvatar: {
    width: 48,
    height: 48,
    backgroundColor: Colors.primary[100],
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[900],
    marginBottom: Spacing[0.5],
  },
  doctorSpecialty: {
    fontSize: 12,
    color: Colors.gray[500],
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
    backgroundColor: Colors.primary[50],
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.primary[700],
    textTransform: 'capitalize',
  },
  appointmentDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[4],
    paddingBottom: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  appointmentDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1.5],
  },
  appointmentDetailText: {
    fontSize: 14,
    color: Colors.gray[600],
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[2],
    paddingTop: Spacing[4],
  },
  cardFooterText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: Colors.gray[600],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing[12],
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing[4],
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[900],
    marginBottom: Spacing[2],
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.gray[500],
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing[4],
  },
  footer: {
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[4],
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[4],
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primary[600],
    ...Shadow.sm,
  },
  bookButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
  },
});
