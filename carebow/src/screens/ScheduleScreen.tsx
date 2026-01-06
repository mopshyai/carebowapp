import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, Shadow } from '@/constants/Spacing';

const upcomingAppointments = [
  {
    id: '1',
    doctor: 'Dr. Sarah Chen',
    specialty: 'General Practitioner',
    emoji: '👩‍⚕️',
    date: 'Jan 5, 2026',
    time: '2:00 PM',
    type: 'video',
    typeLabel: 'Video Consult',
  },
  {
    id: '2',
    doctor: 'Dr. James Wilson',
    specialty: 'Cardiologist',
    emoji: '👨‍⚕️',
    date: 'Jan 12, 2026',
    time: '10:30 AM',
    type: 'in-person',
    typeLabel: 'In-person',
  },
];

const pastAppointments = [
  {
    id: '3',
    doctor: 'Dr. Emily Park',
    specialty: 'Dermatologist',
    emoji: '👩‍⚕️',
    date: 'Dec 20, 2025',
    time: '3:00 PM',
    type: 'video',
    typeLabel: 'Video Consult',
  },
  {
    id: '4',
    doctor: 'Dr. Sarah Chen',
    specialty: 'General Practitioner',
    emoji: '👩‍⚕️',
    date: 'Dec 5, 2025',
    time: '11:00 AM',
    type: 'in-person',
    typeLabel: 'In-person',
  },
];

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const appointments = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={Colors.gray[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule</Text>
        <TouchableOpacity style={styles.addButton}>
          <Icon name="add" size={24} color={Colors.purple[600]} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
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
          <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>
            Past
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 32 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Banner */}
        {activeTab === 'upcoming' && (
          <View style={styles.infoBanner}>
            <View style={styles.infoBannerIcon}>
              <Icon name="heart" size={20} color={Colors.purple[600]} />
            </View>
            <View style={styles.infoBannerContent}>
              <Text style={styles.infoBannerTitle}>Need care guidance?</Text>
              <Text style={styles.infoBannerText}>
                Use Ask CareBow to describe your symptoms and get personalized recommendations.
              </Text>
            </View>
          </View>
        )}

        {/* Appointments List */}
        {appointments.length > 0 ? (
          <View style={styles.appointmentsList}>
            {appointments.map((appointment) => (
              <TouchableOpacity key={appointment.id} style={styles.appointmentCard}>
                <View style={styles.appointmentHeader}>
                  <View style={styles.doctorAvatar}>
                    <Text style={styles.doctorEmoji}>{appointment.emoji}</Text>
                  </View>
                  <View style={styles.doctorInfo}>
                    <Text style={styles.doctorName}>{appointment.doctor}</Text>
                    <Text style={styles.doctorSpecialty}>{appointment.specialty}</Text>
                  </View>
                  <View
                    style={[
                      styles.typeBadge,
                      appointment.type === 'video' ? styles.typeBadgeVideo : styles.typeBadgeInPerson,
                    ]}
                  >
                    <Icon
                      name={appointment.type === 'video' ? 'videocam' : 'location'}
                      size={12}
                      color={appointment.type === 'video' ? Colors.purple[700] : Colors.blue[700]}
                    />
                    <Text
                      style={[
                        styles.typeBadgeText,
                        appointment.type === 'video' ? styles.typeBadgeTextVideo : styles.typeBadgeTextInPerson,
                      ]}
                    >
                      {appointment.typeLabel}
                    </Text>
                  </View>
                </View>

                <View style={styles.appointmentDetails}>
                  <View style={styles.appointmentDetail}>
                    <Icon name="calendar-outline" size={16} color={Colors.gray[500]} />
                    <Text style={styles.appointmentDetailText}>{appointment.date}</Text>
                  </View>
                  <View style={styles.appointmentDetail}>
                    <Icon name="time-outline" size={16} color={Colors.gray[500]} />
                    <Text style={styles.appointmentDetailText}>{appointment.time}</Text>
                  </View>
                </View>

                {activeTab === 'upcoming' && (
                  <View style={styles.appointmentActions}>
                    <TouchableOpacity style={styles.rescheduleButton}>
                      <Text style={styles.rescheduleButtonText}>Reschedule</Text>
                    </TouchableOpacity>
                    {appointment.type === 'video' && (
                      <TouchableOpacity style={styles.joinButton}>
                        <Icon name="videocam" size={16} color={Colors.white} />
                        <Text style={styles.joinButtonText}>Join Call</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {activeTab === 'past' && (
                  <View style={styles.appointmentActions}>
                    <TouchableOpacity style={styles.viewNotesButton}>
                      <Text style={styles.viewNotesButtonText}>View Notes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.bookAgainButton}>
                      <Text style={styles.bookAgainButtonText}>Book Again</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <Icon name="calendar-outline" size={48} color={Colors.gray[400]} />
            </View>
            <Text style={styles.emptyStateTitle}>No {activeTab} appointments</Text>
            <Text style={styles.emptyStateText}>
              {activeTab === 'upcoming'
                ? 'Schedule a consultation with a doctor to get started.'
                : 'Your past appointments will appear here.'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Book Appointment Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.bookButton}>
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
    fontSize: 16,
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
    backgroundColor: Colors.purple[600],
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
    backgroundColor: Colors.purple[50],
    borderWidth: 1,
    borderColor: Colors.purple[200],
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
    color: Colors.purple[900],
    marginBottom: Spacing[1],
  },
  infoBannerText: {
    fontSize: 12,
    color: Colors.purple[700],
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
    backgroundColor: Colors.purple[100],
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorEmoji: {
    fontSize: 24,
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
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
    borderRadius: BorderRadius.full,
  },
  typeBadgeVideo: {
    backgroundColor: Colors.purple[50],
  },
  typeBadgeInPerson: {
    backgroundColor: Colors.blue[50],
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  typeBadgeTextVideo: {
    color: Colors.purple[700],
  },
  typeBadgeTextInPerson: {
    color: Colors.blue[700],
  },
  appointmentDetails: {
    flexDirection: 'row',
    gap: Spacing[4],
    marginBottom: Spacing[4],
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
  appointmentActions: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  rescheduleButton: {
    flex: 1,
    paddingVertical: Spacing[3],
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    alignItems: 'center',
  },
  rescheduleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray[700],
  },
  joinButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[3],
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.purple[600],
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.white,
  },
  viewNotesButton: {
    flex: 1,
    paddingVertical: Spacing[3],
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    alignItems: 'center',
  },
  viewNotesButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray[700],
  },
  bookAgainButton: {
    flex: 1,
    paddingVertical: Spacing[3],
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.purple[100],
    alignItems: 'center',
  },
  bookAgainButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.purple[700],
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
    backgroundColor: Colors.purple[600],
    borderRadius: BorderRadius['2xl'],
    paddingVertical: Spacing[4],
    ...Shadow.md,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
