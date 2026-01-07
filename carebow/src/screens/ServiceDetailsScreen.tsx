/**
 * ServiceDetails Screen
 * Displays detailed information about a service with booking/request functionality
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
import type { AppNavigationProp } from '../navigation/types';
import { colors, spacing, radius, typography, shadows, layout } from '../theme';
import { formatPrice, defaultTimeSlots } from '../data/catalog';
import { StarRating } from '../components/ui/StarRating';
import { AppIcon, IconContainer, IconName, getIconColors } from '../components/icons';
import { PackageSelectorList } from '../components/ui/PackageSelectorList';
import { HorizontalDatePicker } from '../components/ui/HorizontalDatePicker';
import { MemberPicker } from '../components/ui/MemberPicker';
import { RequestTextArea } from '../components/ui/RequestTextArea';
import { StickyCheckoutBar } from '../components/ui/StickyCheckoutBar';
import { TimePicker } from '../components/ui/TimePicker';
import { QuantityStepper } from '../components/ui/QuantityStepper';
import {
  getServiceById,
  getCategoryByServiceId,
  mockMembers,
  calculatePrice,
  defaultTimeSlots as serviceTimeSlots,
} from '../data/services';
import { Service, Member, PackageOption } from '../data/types';
import { useCartStore } from '../store/useCartStore';
import { useRequestsStore } from '../store/requestsStore';
import { processBookingFee } from '../utils/mockPayment';
import { buildBookingCore } from '../lib/bookingDraft';
import { BookingDraftInput, PricingModelType, money } from '../types/booking';

// Icon mapping for service categories
const getServiceIcon = (imageKey: string): IconName => {
  const iconMap: Record<string, IconName> = {
    companionship: 'companionship',
    transport: 'transport',
    food: 'food',
    cleaning: 'cleaning',
    culture: 'culture',
    barber: 'barber',
    yoga: 'yoga',
    nurse: 'nurse',
    transactional: 'transactional_care',
    transactional_care: 'transactional_care',
    physio: 'physio',
    doctor: 'doctor',
    lab: 'lab',
    healthcheck: 'healthcheck',
  };
  return iconMap[imageKey] || 'stethoscope';
};

export default function ServiceDetailsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation() as AppNavigationProp;
  const route = useRoute();
  const { id } = (route.params as { id: string }) || {};

  // Store hooks
  const {
    bookingDraft,
    initBookingDraft,
    updateBookingDraft,
    clearBookingDraft,
  } = useCartStore();
  const createRequest = useRequestsStore((state) => state.createRequest);
  const markBookingFeePaid = useRequestsStore((state) => state.markBookingFeePaid);

  // Local state
  const [isProcessing, setIsProcessing] = useState(false);

  // Get service data
  const service = getServiceById(id || '');
  const category = getCategoryByServiceId(id || '');

  // Initialize booking draft when service loads
  useEffect(() => {
    if (service) {
      initBookingDraft(service);
    }
    return () => {
      clearBookingDraft();
    };
  }, [service?.id]);

  // Calculate current pricing based on selections
  const pricing = useMemo(() => {
    if (!service || !bookingDraft) {
      return { subtotal: 0, discount: 0, total: 0, label: '' };
    }

    return calculatePrice(service.pricing, {
      packageId: bookingDraft.selectedPackageId || undefined,
      hours: bookingDraft.hours || undefined,
      days: bookingDraft.days || undefined,
    });
  }, [service, bookingDraft?.selectedPackageId, bookingDraft?.hours, bookingDraft?.days]);

  // Update draft pricing when it changes
  useEffect(() => {
    if (bookingDraft && pricing) {
      updateBookingDraft({
        subtotal: pricing.subtotal,
        discount: pricing.discount,
        total: pricing.total,
        pricingLabel: pricing.label,
      });
    }
  }, [pricing.total, pricing.label]);

  // Handle package selection
  const handleSelectPackage = useCallback(
    (pkg: PackageOption) => {
      updateBookingDraft({
        selectedPackageId: pkg.id,
        selectedPackageLabel: pkg.label,
        durationMinutes: pkg.durationMinutes || bookingDraft?.durationMinutes,
      });
    },
    [updateBookingDraft, bookingDraft?.durationMinutes]
  );

  // Handle member selection
  const handleSelectMember = useCallback(
    (member: Member) => {
      updateBookingDraft({
        memberId: member.id,
        memberName: member.name,
      });
    },
    [updateBookingDraft]
  );

  // Handle date selection
  const handleSelectDate = useCallback(
    (date: string) => {
      updateBookingDraft({ date });
    },
    [updateBookingDraft]
  );

  // Handle time selection
  const handleSelectTime = useCallback(
    (time: string) => {
      updateBookingDraft({ startTime: time });
    },
    [updateBookingDraft]
  );

  // Handle hours change
  const handleHoursChange = useCallback(
    (hours: number) => {
      updateBookingDraft({ hours });
    },
    [updateBookingDraft]
  );

  // Handle days change
  const handleDaysChange = useCallback(
    (days: number) => {
      updateBookingDraft({ days });
    },
    [updateBookingDraft]
  );

  // Handle request notes change
  const handleRequestNotesChange = useCallback(
    (text: string) => {
      updateBookingDraft({ requestNotes: text });
    },
    [updateBookingDraft]
  );

  // Validation
  const isValid = useMemo(() => {
    if (!service || !bookingDraft) return false;
    if (service.booking.requiresMember && !bookingDraft.memberId) return false;
    if (service.booking.requiresDate && !bookingDraft.date) return false;
    if (service.booking.requiresTime && !bookingDraft.startTime) return false;
    if (service.pricing.type === 'packages' && !bookingDraft.selectedPackageId) return false;
    if (service.pricing.type === 'hourly' && !bookingDraft.hours) return false;
    if (service.pricing.type === 'daily' && !bookingDraft.days) return false;
    if (service.request?.required && !bookingDraft.requestNotes.trim()) return false;
    return true;
  }, [service, bookingDraft]);

  // Handle checkout flow
  const handleCheckout = async () => {
    if (!service || !bookingDraft || !isValid) {
      Alert.alert('Missing Information', 'Please complete all required fields to continue.');
      return;
    }

    navigation.navigate('Checkout' as never, { serviceId: service.id });
  };

  // Handle on-request submission
  const handleSubmitRequest = async () => {
    if (!service || !bookingDraft || !isValid) {
      Alert.alert('Missing Information', 'Please complete all required fields to continue.');
      return;
    }

    setIsProcessing(true);

    try {
      const hasBookingFee =
        service.pricing.type === 'quote' &&
        service.pricing.bookingFee &&
        service.fulfillment.allowBookingFee;

      if (hasBookingFee && service.pricing.type === 'quote' && service.pricing.bookingFee) {
        const bookingFee = service.pricing.bookingFee;
        Alert.alert(
          'Priority Processing',
          `Pay ${formatPrice(bookingFee)} booking fee to get priority response within 2 hours.`,
          [
            {
              text: 'Submit without fee',
              style: 'cancel',
              onPress: () => submitRequestWithoutFee(),
            },
            {
              text: `Pay ${formatPrice(bookingFee)}`,
              onPress: () => submitRequestWithFee(bookingFee),
            },
          ]
        );
      } else {
        await submitRequestWithoutFee();
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Build BookingCore from current draft
  const buildBookingCoreFromDraft = () => {
    if (!bookingDraft || !service) return null;

    let pricingModel: PricingModelType = 'fixed';
    if (service.pricing.type === 'packages') pricingModel = 'packages';
    else if (service.pricing.type === 'hourly') pricingModel = 'hourly';
    else if (service.pricing.type === 'daily') pricingModel = 'daily';
    else if (service.pricing.type === 'quote') pricingModel = 'quote';

    let packagePrice: number | undefined;
    let packageOriginalPrice: number | undefined;
    if (service.pricing.type === 'packages' && bookingDraft.selectedPackageId) {
      const selectedPkg = service.pricing.packages.find(p => p.id === bookingDraft.selectedPackageId);
      if (selectedPkg) {
        packagePrice = selectedPkg.price;
        packageOriginalPrice = selectedPkg.originalPrice;
      }
    }

    const input: BookingDraftInput = {
      serviceId: bookingDraft.serviceId,
      serviceTitle: bookingDraft.serviceTitle,
      memberId: bookingDraft.memberId || '',
      memberName: bookingDraft.memberName || undefined,
      schedule: {
        date: bookingDraft.date || '',
        startTime: bookingDraft.startTime || '',
        endTime: bookingDraft.endTime || undefined,
        durationMinutes: bookingDraft.durationMinutes || undefined,
      },
      notes: bookingDraft.requestNotes,
      pricingSelections: {
        pricingModel,
        packageId: bookingDraft.selectedPackageId || undefined,
        packageLabel: bookingDraft.selectedPackageLabel || undefined,
        packagePrice,
        packageOriginalPrice,
        hours: bookingDraft.hours || undefined,
        days: bookingDraft.days || undefined,
        hourlyRate: service.pricing.type === 'hourly' ? service.pricing.hourlyRate : undefined,
        dailyRate: service.pricing.type === 'daily' ? service.pricing.dailyRate : undefined,
        fixedPrice: service.pricing.type === 'fixed' ? service.pricing.price : undefined,
        fixedOriginalPrice: service.pricing.type === 'fixed' ? service.pricing.originalPrice : undefined,
      },
    };

    return buildBookingCore(input);
  };

  const submitRequestWithoutFee = async () => {
    if (!bookingDraft || !service) return;

    try {
      const bookingCore = buildBookingCoreFromDraft();
      if (!bookingCore) {
        Alert.alert('Error', 'Failed to create booking.');
        return;
      }

      createRequest(bookingCore);

      Alert.alert(
        'Request Submitted',
        `We've received your request for ${service.title}. Our team will review and respond with options within 2-4 hours.`,
        [{ text: 'View Requests', onPress: () => navigation.navigate('Requests') }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit request. Please try again.');
    }
  };

  const submitRequestWithFee = async (bookingFeeAmount: number) => {
    if (!bookingDraft || !service) return;

    setIsProcessing(true);

    try {
      const bookingCore = buildBookingCoreFromDraft();
      if (!bookingCore) {
        Alert.alert('Error', 'Failed to create booking.');
        return;
      }

      const request = createRequest(bookingCore);
      const result = await processBookingFee(bookingFeeAmount);

      if (result.success && result.paymentInfo) {
        markBookingFeePaid(request.id, result.paymentInfo.paymentId, money(bookingFeeAmount));

        Alert.alert(
          'Priority Request Submitted',
          `Your request has been submitted with priority status. We'll respond within 2 hours with available options.`,
          [{ text: 'View Requests', onPress: () => navigation.navigate('Requests') }]
        );
      } else {
        Alert.alert('Payment Failed', result.error || 'Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Error state
  if (!service) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorContainer}>
          <AppIcon name="info" size={64} color={colors.textTertiary} />
          <Text style={styles.errorText}>Service not found</Text>
          <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
            <Text style={styles.backLinkText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const icon = getServiceIcon(service.image);
  const isCheckoutService = service.fulfillment.mode === 'checkout';
  const isOnRequestService = service.fulfillment.mode === 'on_request';
  const availableSlots = service.booking.availableTimeSlots || serviceTimeSlots;

  // Determine button label and action
  let buttonLabel = 'Continue to checkout';
  let buttonAction = handleCheckout;
  let confirmationNote = "We'll confirm your booking within 10 minutes";

  if (isOnRequestService) {
    buttonLabel = 'Submit request';
    buttonAction = handleSubmitRequest;
    confirmationNote = "Our team will review and respond within 2-4 hours";
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <AppIcon name="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Details</Text>
        <TouchableOpacity style={styles.shareButton}>
          <AppIcon name="arrow-right" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 140 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <IconContainer
            size="xl"
            variant="soft"
            backgroundColor={getIconColors(icon).background}
            style={styles.heroIconWrap}
          >
            <AppIcon name={icon} size={48} color={getIconColors(icon).primary} fillOpacity={0.2} />
          </IconContainer>
        </View>

        {/* Service Info */}
        <View style={styles.infoContainer}>
          {category && <Text style={styles.categoryLabel}>{category.title}</Text>}
          <Text style={styles.serviceTitle}>{service.title}</Text>
          <View style={styles.ratingRow}>
            <StarRating
              rating={service.rating}
              size={16}
              showReviewCount
              reviewCount={service.reviewCount}
            />
          </View>
          <Text style={styles.tagline}>{service.shortTagline}</Text>
        </View>

        {/* Member Selection */}
        {service.booking.requiresMember && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Who is this for?</Text>
            <Text style={styles.sectionHint}>Select the family member receiving care</Text>
            <MemberPicker
              members={mockMembers}
              selectedMemberId={bookingDraft?.memberId || null}
              onSelectMember={handleSelectMember}
            />
          </View>
        )}

        {/* Date Selection */}
        {service.booking.requiresDate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select date</Text>
            <Text style={styles.sectionHint}>Choose your preferred appointment date</Text>
            <HorizontalDatePicker
              selectedDate={bookingDraft?.date || null}
              onSelectDate={handleSelectDate}
              daysToShow={service.booking.maxDaysAhead || 14}
            />
          </View>
        )}

        {/* Time Selection */}
        {service.booking.requiresTime && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select time</Text>
            <Text style={styles.sectionHint}>Available slots for your selected date</Text>
            <TimePicker
              availableSlots={availableSlots}
              selectedTime={bookingDraft?.startTime || null}
              onSelectTime={handleSelectTime}
            />
          </View>
        )}

        {/* Package Selection */}
        {service.pricing.type === 'packages' && service.pricing.packages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose a package</Text>
            <Text style={styles.sectionHint}>Select the option that best fits your needs</Text>
            <PackageSelectorList
              packages={service.pricing.packages}
              selectedPackageId={bookingDraft?.selectedPackageId || null}
              onSelectPackage={handleSelectPackage}
            />
          </View>
        )}

        {/* Hourly Selection */}
        {service.pricing.type === 'hourly' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose duration</Text>
            <Text style={styles.sectionHint}>Select how many hours you need</Text>
            <QuantityStepper
              value={bookingDraft?.hours || service.pricing.minHours}
              onChange={handleHoursChange}
              min={service.pricing.minHours}
              max={service.pricing.maxHours}
              unit="hour"
              rate={service.pricing.hourlyRate}
              showTotal
            />
          </View>
        )}

        {/* Daily Selection */}
        {service.pricing.type === 'daily' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose duration</Text>
            <Text style={styles.sectionHint}>Select the number of days</Text>
            <QuantityStepper
              value={bookingDraft?.days || service.pricing.minDays}
              onChange={handleDaysChange}
              min={service.pricing.minDays}
              max={service.pricing.maxDays}
              unit="day"
              rate={service.pricing.dailyRate}
              showTotal
            />
          </View>
        )}

        {/* Fixed Price Display */}
        {service.pricing.type === 'fixed' && (
          <View style={styles.section}>
            <View style={styles.fixedPriceCard}>
              <Text style={styles.fixedPriceLabel}>Service fee</Text>
              <View style={styles.fixedPriceRow}>
                <Text style={styles.fixedPrice}>{formatPrice(service.pricing.price)}</Text>
                {service.pricing.originalPrice && (
                  <Text style={styles.fixedOriginalPrice}>
                    {formatPrice(service.pricing.originalPrice)}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Quote-based Pricing */}
        {service.pricing.type === 'quote' && (
          <View style={styles.section}>
            <View style={styles.quoteCard}>
              <View style={styles.quoteIconWrap}>
                <AppIcon name="messages" size={24} color={colors.accent} />
              </View>
              <Text style={styles.quoteTitle}>Custom pricing</Text>
              <Text style={styles.quoteText}>
                Tell us what you need and we'll provide a personalized quote based on your requirements.
              </Text>
              {service.pricing.bookingFee && (
                <View style={styles.bookingFeeNote}>
                  <AppIcon name="flash" size={14} color={colors.warning} fillOpacity={0.2} />
                  <Text style={styles.bookingFeeText}>
                    {formatPrice(service.pricing.bookingFee)} booking fee for priority response
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Request Notes */}
        {service.request?.enabled && (
          <View style={styles.section}>
            <RequestTextArea
              value={bookingDraft?.requestNotes || ''}
              onChangeText={handleRequestNotesChange}
              placeholder={service.request?.placeholder || 'Any special requirements...'}
              label={service.request?.required ? 'Describe your needs' : 'Additional notes (optional)'}
            />
          </View>
        )}

        {/* Confirmation Note */}
        <View style={styles.confirmationNote}>
          <AppIcon name="check-circle" size={18} color={colors.success} fillOpacity={0.2} />
          <Text style={styles.confirmationText}>{confirmationNote}</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this service</Text>
          <Text style={styles.description}>{service.description}</Text>
        </View>

        {/* Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's included</Text>
          <View style={styles.benefitsList}>
            {service.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <AppIcon name="check-circle" size={20} color={colors.success} fillOpacity={0.2} />
                </View>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>{benefit.title}</Text>
                  <Text style={styles.benefitDescription}>{benefit.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Checkout Bar */}
      <StickyCheckoutBar
        price={pricing.total}
        originalPrice={pricing.discount > 0 ? pricing.subtotal : undefined}
        buttonLabel={isProcessing ? 'Processing...' : buttonLabel}
        onPress={buttonAction}
        disabled={!isValid || isProcessing}
        isOnRequest={isOnRequestService && service.pricing.type === 'quote' && !service.pricing.bookingFee}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
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
  },
  headerTitle: {
    ...typography.h4,
  },
  shareButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  errorText: {
    ...typography.h3,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  backLink: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
  },
  backLinkText: {
    ...typography.label,
    color: colors.white,
  },

  // Hero
  heroContainer: {
    height: 140,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heroIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.card,
  },

  // Info
  infoContainer: {
    marginBottom: spacing.xl,
  },
  categoryLabel: {
    ...typography.tiny,
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  serviceTitle: {
    ...typography.h1,
    marginBottom: spacing.sm,
  },
  ratingRow: {
    marginBottom: spacing.sm,
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
  },

  // Section
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h4,
    marginBottom: spacing.xxs,
  },
  sectionHint: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.md,
  },

  // Fixed Price
  fixedPriceCard: {
    backgroundColor: colors.surface2,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fixedPriceLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  fixedPriceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
    rowGap: spacing.xs,
  },
  fixedPrice: {
    ...typography.h2,
    color: colors.accent,
  },
  fixedOriginalPrice: {
    ...typography.bodyLarge,
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },

  // Quote
  quoteCard: {
    backgroundColor: colors.surface2,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  quoteIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quoteTitle: {
    ...typography.h4,
    marginBottom: spacing.xs,
  },
  quoteText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  bookingFeeNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bookingFeeText: {
    ...typography.caption,
    color: colors.warning,
  },

  // Confirmation Note
  confirmationNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.successSoft,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.xl,
  },
  confirmationText: {
    ...typography.labelSmall,
    color: colors.success,
    flex: 1,
  },

  // Description
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },

  // Benefits
  benefitsList: {
    gap: spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  benefitIcon: {
    marginTop: 2,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    ...typography.label,
    marginBottom: 2,
  },
  benefitDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
