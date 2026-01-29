/**
 * Telemedicine Booking Screen
 * Schedule video consultations with healthcare providers
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../theme';

// ============================================
// TYPES
// ============================================

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  experience: string;
  image?: string;
  availableSlots: string[];
  consultationFee: number;
  languages: string[];
}

interface TimeSlot {
  time: string;
  available: boolean;
}

// ============================================
// MOCK DATA
// ============================================

const MOCK_DOCTORS: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    specialty: 'General Practitioner',
    rating: 4.9,
    reviewCount: 324,
    experience: '15 years',
    availableSlots: ['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM'],
    consultationFee: 75,
    languages: ['English', 'Mandarin'],
  },
  {
    id: '2',
    name: 'Dr. James Wilson',
    specialty: 'Internal Medicine',
    rating: 4.8,
    reviewCount: 256,
    experience: '12 years',
    availableSlots: ['10:30 AM', '01:00 PM', '02:30 PM', '04:00 PM'],
    consultationFee: 85,
    languages: ['English', 'Spanish'],
  },
  {
    id: '3',
    name: 'Dr. Emily Park',
    specialty: 'Family Medicine',
    rating: 4.9,
    reviewCount: 189,
    experience: '10 years',
    availableSlots: ['09:30 AM', '11:00 AM', '12:30 PM', '03:00 PM'],
    consultationFee: 70,
    languages: ['English', 'Korean'],
  },
];

const generateDates = (): { date: Date; label: string; dayLabel: string }[] => {
  const dates = [];
  const today = new Date();

  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' :
      date.toLocaleDateString('en-US', { weekday: 'short' });
    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    dates.push({ date, label, dayLabel });
  }

  return dates;
};

// ============================================
// COMPONENT
// ============================================

export default function TelemedicineBookingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: { doctorId?: string } }, 'params'>>();

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(
    route.params?.doctorId
      ? MOCK_DOCTORS.find(d => d.id === route.params?.doctorId) || null
      : null
  );
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [step, setStep] = useState<'doctor' | 'datetime' | 'confirm'>(
    route.params?.doctorId ? 'datetime' : 'doctor'
  );

  const dates = useMemo(() => generateDates(), []);

  const handleSelectDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setSelectedTime(null);
    setStep('datetime');
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
  };

  const handleContinue = () => {
    if (step === 'datetime' && selectedTime) {
      setStep('confirm');
    }
  };

  const handleConfirmBooking = () => {
    // TODO: Integrate with API to create appointment
    Alert.alert(
      'Appointment Booked!',
      `Your video consultation with ${selectedDoctor?.name} is scheduled for ${
        selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
      } at ${selectedTime}.`,
      [
        {
          text: 'View Schedule',
          onPress: () => navigation.navigate('Schedule' as never),
        },
        {
          text: 'Done',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={[styles.stepDot, step === 'doctor' && styles.stepDotActive]}>
        <Text style={[styles.stepNumber, step === 'doctor' && styles.stepNumberActive]}>1</Text>
      </View>
      <View style={[styles.stepLine, (step === 'datetime' || step === 'confirm') && styles.stepLineActive]} />
      <View style={[styles.stepDot, step === 'datetime' && styles.stepDotActive]}>
        <Text style={[styles.stepNumber, step === 'datetime' && styles.stepNumberActive]}>2</Text>
      </View>
      <View style={[styles.stepLine, step === 'confirm' && styles.stepLineActive]} />
      <View style={[styles.stepDot, step === 'confirm' && styles.stepDotActive]}>
        <Text style={[styles.stepNumber, step === 'confirm' && styles.stepNumberActive]}>3</Text>
      </View>
    </View>
  );

  const renderDoctorSelection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Select a Doctor</Text>
      <Text style={styles.sectionSubtitle}>Choose from our verified healthcare providers</Text>

      <View style={styles.doctorList}>
        {MOCK_DOCTORS.map((doctor) => (
          <TouchableOpacity
            key={doctor.id}
            style={[
              styles.doctorCard,
              selectedDoctor?.id === doctor.id && styles.doctorCardSelected,
            ]}
            onPress={() => handleSelectDoctor(doctor)}
            activeOpacity={0.7}
          >
            <View style={styles.doctorAvatar}>
              <Icon name="person" size={28} color={colors.accent} />
            </View>
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>{doctor.name}</Text>
              <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
              <View style={styles.doctorMeta}>
                <View style={styles.ratingContainer}>
                  <Icon name="star" size={14} color="#F59E0B" />
                  <Text style={styles.ratingText}>
                    {doctor.rating} ({doctor.reviewCount})
                  </Text>
                </View>
                <Text style={styles.experienceText}>{doctor.experience} exp.</Text>
              </View>
              <View style={styles.doctorFooter}>
                <Text style={styles.feeText}>${doctor.consultationFee}</Text>
                <View style={styles.languageTags}>
                  {doctor.languages.slice(0, 2).map((lang) => (
                    <View key={lang} style={styles.languageTag}>
                      <Text style={styles.languageTagText}>{lang}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
            {selectedDoctor?.id === doctor.id && (
              <View style={styles.checkmark}>
                <Icon name="checkmark-circle" size={24} color={colors.accent} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderDateTimeSelection = () => (
    <View style={styles.section}>
      {/* Selected Doctor Summary */}
      {selectedDoctor && (
        <TouchableOpacity
          style={styles.selectedDoctorBanner}
          onPress={() => setStep('doctor')}
          activeOpacity={0.7}
        >
          <View style={styles.selectedDoctorAvatar}>
            <Icon name="person" size={20} color={colors.accent} />
          </View>
          <View style={styles.selectedDoctorInfo}>
            <Text style={styles.selectedDoctorName}>{selectedDoctor.name}</Text>
            <Text style={styles.selectedDoctorSpecialty}>{selectedDoctor.specialty}</Text>
          </View>
          <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      )}

      {/* Date Selection */}
      <Text style={styles.sectionTitle}>Select Date</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dateScroll}
        contentContainerStyle={styles.dateScrollContent}
      >
        {dates.map((item, index) => {
          const isSelected = selectedDate.toDateString() === item.date.toDateString();
          return (
            <TouchableOpacity
              key={index}
              style={[styles.dateCard, isSelected && styles.dateCardSelected]}
              onPress={() => handleSelectDate(item.date)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dateDayLabel, isSelected && styles.dateDayLabelSelected]}>
                {item.dayLabel}
              </Text>
              <Text style={[styles.dateLabel, isSelected && styles.dateLabelSelected]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Time Selection */}
      <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Select Time</Text>
      <View style={styles.timeGrid}>
        {selectedDoctor?.availableSlots.map((time) => {
          const isSelected = selectedTime === time;
          return (
            <TouchableOpacity
              key={time}
              style={[styles.timeSlot, isSelected && styles.timeSlotSelected]}
              onPress={() => handleSelectTime(time)}
              activeOpacity={0.7}
            >
              <Icon
                name="time-outline"
                size={16}
                color={isSelected ? colors.textInverse : colors.textSecondary}
              />
              <Text style={[styles.timeSlotText, isSelected && styles.timeSlotTextSelected]}>
                {time}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderConfirmation = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Confirm Your Appointment</Text>

      <View style={styles.confirmCard}>
        {/* Doctor Info */}
        <View style={styles.confirmRow}>
          <View style={styles.confirmDoctorAvatar}>
            <Icon name="person" size={28} color={colors.accent} />
          </View>
          <View style={styles.confirmDoctorInfo}>
            <Text style={styles.confirmDoctorName}>{selectedDoctor?.name}</Text>
            <Text style={styles.confirmDoctorSpecialty}>{selectedDoctor?.specialty}</Text>
          </View>
        </View>

        <View style={styles.confirmDivider} />

        {/* Appointment Details */}
        <View style={styles.confirmDetails}>
          <View style={styles.confirmDetailRow}>
            <Icon name="calendar-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.confirmDetailText}>
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.confirmDetailRow}>
            <Icon name="time-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.confirmDetailText}>{selectedTime}</Text>
          </View>
          <View style={styles.confirmDetailRow}>
            <Icon name="videocam-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.confirmDetailText}>Video Consultation</Text>
          </View>
        </View>

        <View style={styles.confirmDivider} />

        {/* Fee */}
        <View style={styles.confirmFeeRow}>
          <Text style={styles.confirmFeeLabel}>Consultation Fee</Text>
          <Text style={styles.confirmFeeAmount}>${selectedDoctor?.consultationFee}</Text>
        </View>
      </View>

      {/* Info Note */}
      <View style={styles.infoNote}>
        <Icon name="information-circle" size={20} color={colors.accent} />
        <Text style={styles.infoNoteText}>
          You'll receive a reminder 30 minutes before your appointment with a link to join the video call.
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => {
            if (step === 'datetime') {
              setStep('doctor');
            } else if (step === 'confirm') {
              setStep('datetime');
            } else {
              navigation.goBack();
            }
          }}
        >
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {step === 'doctor' ? 'Book Consultation' :
           step === 'datetime' ? 'Select Date & Time' :
           'Confirm Booking'}
        </Text>
        <View style={styles.headerButton} />
      </View>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {step === 'doctor' && renderDoctorSelection()}
        {step === 'datetime' && renderDateTimeSelection()}
        {step === 'confirm' && renderConfirmation()}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        {step === 'datetime' && selectedTime && (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <Icon name="arrow-forward" size={20} color={colors.textInverse} />
          </TouchableOpacity>
        )}
        {step === 'confirm' && (
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmBooking}
            activeOpacity={0.8}
          >
            <Icon name="checkmark-circle" size={20} color={colors.textInverse} />
            <Text style={styles.confirmButtonText}>Confirm Booking</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface2,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  stepNumber: {
    ...typography.label,
    color: colors.textTertiary,
  },
  stepNumberActive: {
    color: colors.textInverse,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.border,
  },
  stepLineActive: {
    backgroundColor: colors.accent,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  section: {},
  sectionTitle: {
    ...typography.h4,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  // Doctor Selection
  doctorList: {
    gap: spacing.md,
  },
  doctorCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.card,
  },
  doctorCardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentMuted,
  },
  doctorAvatar: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  doctorName: {
    ...typography.label,
    marginBottom: 2,
  },
  doctorSpecialty: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  doctorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  ratingText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  experienceText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  doctorFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feeText: {
    ...typography.label,
    color: colors.accent,
  },
  languageTags: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  languageTag: {
    backgroundColor: colors.surface2,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  languageTagText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  checkmark: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  // Selected Doctor Banner
  selectedDoctorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedDoctorAvatar: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDoctorInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  selectedDoctorName: {
    ...typography.label,
  },
  selectedDoctorSpecialty: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  // Date Selection
  dateScroll: {
    marginHorizontal: -spacing.lg,
  },
  dateScrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  dateCard: {
    width: 72,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  dateCardSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  dateDayLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xxs,
  },
  dateDayLabelSelected: {
    color: colors.textInverse,
    opacity: 0.8,
  },
  dateLabel: {
    ...typography.label,
  },
  dateLabelSelected: {
    color: colors.textInverse,
  },
  // Time Selection
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  timeSlotSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  timeSlotText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  timeSlotTextSelected: {
    color: colors.textInverse,
  },
  // Confirmation
  confirmCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confirmDoctorAvatar: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmDoctorInfo: {
    marginLeft: spacing.md,
  },
  confirmDoctorName: {
    ...typography.label,
    fontSize: 18,
    marginBottom: 2,
  },
  confirmDoctorSpecialty: {
    ...typography.body,
    color: colors.textSecondary,
  },
  confirmDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md,
  },
  confirmDetails: {
    gap: spacing.sm,
  },
  confirmDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  confirmDetailText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  confirmFeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmFeeLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  confirmFeeAmount: {
    ...typography.h3,
    color: colors.accent,
  },
  infoNote: {
    flexDirection: 'row',
    backgroundColor: colors.accentMuted,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  infoNoteText: {
    ...typography.bodySmall,
    color: colors.accent,
    flex: 1,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    ...shadows.button,
  },
  continueButtonText: {
    ...typography.labelLarge,
    color: colors.textInverse,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.success,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    ...shadows.button,
  },
  confirmButtonText: {
    ...typography.labelLarge,
    color: colors.textInverse,
  },
});
