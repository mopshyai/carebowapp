/**
 * Today Screen - Premium Healthcare Dashboard
 * World-class UI with stunning visuals and perfect alignment
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

import { colors, spacing, radius, typography, shadows } from '../../theme';
import {
  quickPickItems,
  deviceItems,
  carePackageItems,
  mockUpcomingAppointment,
  formatPrice,
  QuickPickItem,
  DeviceItem,
  CarePackageItem,
} from '../../data/catalog';
import { subscriptionPlans, SubscriptionPlan } from '../../data/subscriptions';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 60) / 2;

// =============================================================================
// SECTION HEADER
// =============================================================================

function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      </View>
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.sectionAction} onPress={onAction} activeOpacity={0.7}>
          <Text style={styles.sectionActionText}>{actionLabel}</Text>
          <Icon name="arrow-forward" size={14} color={colors.accent} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// =============================================================================
// HERO AI CARD - Premium without gradient
// =============================================================================

function HeroAICard({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      <View style={styles.heroCard}>
        <View style={styles.heroContent}>
          <View style={styles.heroIconWrap}>
            <Icon name="sparkles" size={24} color="#FFF" />
          </View>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>AI Health Assistant</Text>
            <Text style={styles.heroSubtitle}>
              Describe your symptoms and get instant, personalized guidance
            </Text>
          </View>
        </View>
        <View style={styles.heroArrow}>
          <Icon name="arrow-forward" size={20} color="#FFF" />
        </View>

        {/* Decorative elements */}
        <View style={styles.heroDecor1} />
        <View style={styles.heroDecor2} />
      </View>
    </Pressable>
  );
}

// =============================================================================
// EMERGENCY CARD
// =============================================================================

function EmergencyCard({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      <View style={styles.emergencyCard}>
        <View style={styles.emergencyIconWrap}>
          <Icon name="shield-checkmark" size={22} color={colors.error} />
        </View>
        <View style={styles.emergencyTextWrap}>
          <Text style={styles.emergencyTitle}>Emergency & Safety</Text>
          <Text style={styles.emergencySubtitle}>SOS, check-ins & contacts</Text>
        </View>
        <View style={styles.emergencyArrow}>
          <Icon name="chevron-forward" size={18} color={colors.error} />
        </View>
      </View>
    </Pressable>
  );
}

// =============================================================================
// QUICK SERVICE CARD
// =============================================================================

function QuickServiceCard({ item, onPress }: { item: QuickPickItem; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.quickServiceCard, pressed && styles.cardPressed]}
    >
      <View style={[styles.quickServiceIcon, { backgroundColor: item.iconBgColor }]}>
        <Icon name={item.icon as any} size={24} color={item.iconColor} />
      </View>

      <Text style={styles.quickServiceTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.quickServiceSubtitle} numberOfLines={1}>{item.subtitle}</Text>

      <View style={styles.quickServiceMeta}>
        <View style={[styles.quickServiceTag, { backgroundColor: `${item.tagColor}15` }]}>
          <View style={[styles.quickServiceTagDot, { backgroundColor: item.tagColor }]} />
          <Text style={[styles.quickServiceTagText, { color: item.tagColor }]}>{item.tag}</Text>
        </View>
      </View>

      {item.priceHint && (
        <Text style={styles.quickServicePrice}>{item.priceHint}</Text>
      )}

      {item.nextSlot && (
        <View style={styles.quickServiceSlot}>
          <Icon name="time" size={12} color={colors.success} />
          <Text style={styles.quickServiceSlotText}>{item.nextSlot}</Text>
        </View>
      )}
    </Pressable>
  );
}

// =============================================================================
// EQUIPMENT CARD
// =============================================================================

function EquipmentCard({ item, onPress }: { item: DeviceItem; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.equipmentCard, pressed && styles.cardPressed]}
    >
      <View style={styles.equipmentIconWrap}>
        <View style={styles.equipmentIconGradient}>
          <Icon name={item.icon as any} size={32} color={colors.textSecondary} />
        </View>
      </View>

      <Text style={styles.equipmentTitle} numberOfLines={2}>{item.title}</Text>

      <View style={styles.equipmentBadges}>
        {item.badges.slice(0, 2).map((badge, idx) => (
          <View
            key={idx}
            style={[
              styles.equipmentBadge,
              { backgroundColor: badge.type === 'certified' ? colors.successSoft : colors.infoSoft },
            ]}
          >
            <Text
              style={[
                styles.equipmentBadgeText,
                { color: badge.type === 'certified' ? colors.success : colors.info },
              ]}
            >
              {badge.label}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.equipmentPricing}>
        <Text style={styles.equipmentPrice}>{formatPrice(item.pricePerUnit)}</Text>
        <Text style={styles.equipmentPriceUnit}>{item.priceUnit}</Text>
      </View>

      <View style={styles.equipmentDelivery}>
        <Icon name="flash" size={12} color={colors.success} />
        <Text style={styles.equipmentDeliveryText}>{item.deliveryTime}</Text>
      </View>
    </Pressable>
  );
}

// =============================================================================
// HEALTH PACKAGE CARD
// =============================================================================

function PackageCard({ item, onPress }: { item: CarePackageItem; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.packageCard, pressed && styles.cardPressed]}
    >
      {item.popular && (
        <View style={styles.packagePopularBadge}>
          <Icon name="star" size={10} color="#FFF" />
          <Text style={styles.packagePopularText}>Popular</Text>
        </View>
      )}

      <View style={[styles.packageIcon, { backgroundColor: item.iconBgColor }]}>
        <Icon name={item.icon as any} size={22} color={item.iconColor} />
      </View>

      <Text style={styles.packageTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.packageSubtitle}>{item.includedCount} tests included</Text>

      <View style={styles.packageIncludes}>
        {item.included.slice(0, 2).map((inc, idx) => (
          <View key={idx} style={styles.packageIncludeRow}>
            <Icon name="checkmark-circle" size={14} color={colors.success} />
            <Text style={styles.packageIncludeText} numberOfLines={1}>{inc.name}</Text>
          </View>
        ))}
      </View>

      <View style={styles.packagePricing}>
        <Text style={styles.packagePriceLabel}>From</Text>
        <Text style={styles.packagePrice}>{formatPrice(item.startingPrice)}</Text>
      </View>
    </Pressable>
  );
}

// =============================================================================
// APPOINTMENT CARD
// =============================================================================

function AppointmentCard() {
  const apt = mockUpcomingAppointment;

  return (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <View style={styles.appointmentLive}>
          <View style={styles.appointmentLiveDot} />
          <Text style={styles.appointmentLiveText}>Coming up</Text>
        </View>
      </View>

      <View style={styles.appointmentBody}>
        <View style={styles.appointmentAvatar}>
          <Text style={styles.appointmentAvatarText}>{apt.doctorInitials}</Text>
        </View>

        <View style={styles.appointmentInfo}>
          <Text style={styles.appointmentDoctor}>{apt.doctorName}</Text>
          <Text style={styles.appointmentSpecialty}>{apt.specialty}</Text>
          <View style={styles.appointmentMeta}>
            <Icon name="calendar" size={12} color={colors.textTertiary} />
            <Text style={styles.appointmentMetaText}>{apt.date}</Text>
            <View style={styles.appointmentDot} />
            <Icon name="time" size={12} color={colors.textTertiary} />
            <Text style={styles.appointmentMetaText}>{apt.time}</Text>
          </View>
        </View>

        {apt.canJoin && (
          <TouchableOpacity style={styles.joinButton} activeOpacity={0.8}>
            <Icon name="videocam" size={16} color="#FFF" />
            <Text style={styles.joinButtonText}>Join</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// =============================================================================
// SUBSCRIPTION CARD
// =============================================================================

function SubscriptionCard({ plan, onPress }: { plan: SubscriptionPlan; onPress: () => void }) {
  const isHighlight = plan.highlight;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.subscriptionCard,
        isHighlight && styles.subscriptionCardHighlight,
        pressed && styles.cardPressed,
      ]}
    >
      {plan.badge && (
        <View style={[styles.subscriptionBadge, isHighlight && styles.subscriptionBadgeHighlight]}>
          <Text style={styles.subscriptionBadgeText}>{plan.badge}</Text>
        </View>
      )}

      <View style={[styles.subscriptionIconWrap, { backgroundColor: plan.iconBgColor }]}>
        <Icon name={plan.iconName as any} size={18} color={plan.iconColor} />
      </View>

      <Text style={styles.subscriptionPeriod}>{plan.periodLabel}</Text>
      <Text style={styles.subscriptionTitle}>{plan.title}</Text>

      <View style={styles.subscriptionPriceRow}>
        <Text style={[styles.subscriptionPrice, isHighlight && styles.subscriptionPriceHighlight]}>
          ${plan.price}
        </Text>
        <Text style={styles.subscriptionPriceUnit}>
          {plan.billingPeriod === 'monthly' ? '/mo' : plan.billingPeriod === 'yearly' ? '/yr' : '/6mo'}
        </Text>
      </View>

      <View style={styles.subscriptionBenefits}>
        {plan.benefits.slice(0, 2).map((benefit, idx) => (
          <View key={idx} style={styles.subscriptionBenefitRow}>
            <Icon name="checkmark" size={12} color={colors.success} />
            <Text style={styles.subscriptionBenefitText} numberOfLines={1}>{benefit}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.subscriptionCta, isHighlight && styles.subscriptionCtaHighlight]}>
        <Text style={[styles.subscriptionCtaText, isHighlight && styles.subscriptionCtaTextHighlight]}>
          {plan.ctaLabel}
        </Text>
      </View>
    </Pressable>
  );
}

// =============================================================================
// QUICK ACTIONS
// =============================================================================

function QuickActions() {
  const navigation = useNavigation();

  const actions = [
    { icon: 'receipt-outline', label: 'Orders', screen: 'Orders', nested: false, color: colors.info },
    { icon: 'document-text-outline', label: 'Requests', screen: 'Requests', nested: false, color: colors.equipment },
    { icon: 'folder-outline', label: 'Records', screen: 'HealthRecords', nested: true, color: colors.nursing },
    { icon: 'help-circle-outline', label: 'Support', screen: 'Help', nested: true, color: colors.secondary },
  ];

  const handleActionPress = (action: typeof actions[0]) => {
    if (action.nested) {
      navigation.navigate('Profile' as never, { screen: action.screen });
    } else {
      navigation.navigate(action.screen as never);
    }
  };

  return (
    <View style={styles.quickActions}>
      {actions.map((action, idx) => (
        <Pressable
          key={idx}
          style={({ pressed }) => [styles.quickActionItem, pressed && styles.quickActionPressed]}
          onPress={() => handleActionPress(action)}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}15` }]}>
            <Icon name={action.icon as any} size={22} color={action.color} />
          </View>
          <Text style={styles.quickActionLabel}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// =============================================================================
// MAIN SCREEN
// =============================================================================

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handleQuickPickPress = (item: QuickPickItem) => {
    navigation.navigate(item.screen as never, item.params);
  };

  const handleDevicePress = (item: DeviceItem) => {
    navigation.navigate(item.screen as never, item.params);
  };

  const handlePackagePress = (item: CarePackageItem) => {
    navigation.navigate(item.screen as never, item.params);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: 120 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.userName}>Sandeep</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.profileButton, pressed && styles.profilePressed]}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={styles.profileAvatar}>
              <Text style={styles.profileInitial}>S</Text>
            </View>
          </Pressable>
        </View>

        {/* AI Assistant Hero */}
        <HeroAICard onPress={() => navigation.navigate('Ask')} />

        {/* Emergency Card */}
        <EmergencyCard onPress={() => navigation.navigate('Safety')} />

        {/* Quick Services */}
        <View style={styles.section}>
          <SectionHeader
            title="Quick Services"
            subtitle="Book in minutes"
            actionLabel="See all"
            onAction={() => navigation.navigate('Services')}
          />
          <View style={styles.quickServicesGrid}>
            {quickPickItems.map((item) => (
              <QuickServiceCard
                key={item.id}
                item={item}
                onPress={() => handleQuickPickPress(item)}
              />
            ))}
          </View>
        </View>

        {/* Medical Equipment */}
        <View style={styles.section}>
          <SectionHeader
            title="Medical Equipment"
            subtitle="Rent or buy"
            actionLabel="View all"
            onAction={() => navigation.navigate('Services')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
            decelerationRate="fast"
            snapToInterval={172}
          >
            {deviceItems.map((item) => (
              <EquipmentCard
                key={item.id}
                item={item}
                onPress={() => handleDevicePress(item)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Health Packages */}
        <View style={styles.section}>
          <SectionHeader
            title="Health Packages"
            subtitle="Comprehensive checkups"
            actionLabel="Explore"
            onAction={() => navigation.navigate('Services')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
            decelerationRate="fast"
            snapToInterval={164}
          >
            {carePackageItems.map((item) => (
              <PackageCard
                key={item.id}
                item={item}
                onPress={() => handlePackagePress(item)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Upcoming Appointment */}
        <View style={styles.section}>
          <SectionHeader
            title="Upcoming"
            actionLabel="View all"
            onAction={() => navigation.navigate('Schedule' as never)}
          />
          <AppointmentCard />
        </View>

        {/* Care Plans */}
        <View style={styles.section}>
          <SectionHeader
            title="Care Plans"
            subtitle="Save with subscriptions"
            actionLabel="Compare"
            onAction={() => navigation.navigate('Services')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
            decelerationRate="fast"
            snapToInterval={164}
          >
            {subscriptionPlans.map((plan) => (
              <SubscriptionCard
                key={plan.id}
                plan={plan}
                onPress={() => navigation.navigate('PlanDetails' as never, { id: plan.id })}
              />
            ))}
          </ScrollView>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <SectionHeader title="Quick Actions" />
          <QuickActions />
        </View>
      </ScrollView>
    </View>
  );
}

// =============================================================================
// STYLES - Premium without gradients
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.995 }],
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  profileButton: {
    borderRadius: 24,
  },
  profilePressed: {
    opacity: 0.9,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },

  // Hero AI Card - Premium solid color
  heroCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden',
    minHeight: 100,
    backgroundColor: '#0D9488',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  heroIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  heroTextWrap: {
    flex: 1,
    paddingRight: 40,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
  },
  heroArrow: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroDecor1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroDecor2: {
    position: 'absolute',
    bottom: -40,
    right: 40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  // Emergency Card
  emergencyCard: {
    borderRadius: 16,
    marginBottom: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: '#FEE2E2',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  emergencyIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emergencyTextWrap: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  emergencySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emergencyArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Section
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionHeaderLeft: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textTertiary,
    marginTop: 2,
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: colors.accentMuted,
    borderRadius: 8,
    gap: 4,
  },
  sectionActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent,
  },

  // Quick Services Grid
  quickServicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickServiceCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  quickServiceIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickServiceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  quickServiceSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  quickServiceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  quickServiceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  quickServiceTagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  quickServiceTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  quickServicePrice: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 4,
  },
  quickServiceSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  quickServiceSlotText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.success,
  },

  // Horizontal Scroll
  horizontalScroll: {
    paddingRight: 20,
    gap: 12,
  },

  // Equipment Card
  equipmentCard: {
    width: 160,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  equipmentIconWrap: {
    marginBottom: 12,
  },
  equipmentIconGradient: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  equipmentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
    minHeight: 36,
  },
  equipmentBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 10,
  },
  equipmentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  equipmentBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  equipmentPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  equipmentPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  equipmentPriceUnit: {
    fontSize: 11,
    color: colors.textTertiary,
    marginLeft: 2,
  },
  equipmentDelivery: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  equipmentDeliveryText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.success,
  },

  // Package Card
  packageCard: {
    width: 152,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  packagePopularBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
    backgroundColor: '#F97316',
  },
  packagePopularText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFF',
    textTransform: 'uppercase',
  },
  packageIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  packageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  packageSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  packageIncludes: {
    gap: 4,
    marginBottom: 12,
  },
  packageIncludeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  packageIncludeText: {
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
  },
  packagePricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  packagePriceLabel: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  packagePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accent,
  },

  // Appointment Card
  appointmentCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  appointmentHeader: {
    marginBottom: 12,
  },
  appointmentLive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accentMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  appointmentLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  appointmentLiveText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
  },
  appointmentBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentAvatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: colors.accentMuted,
  },
  appointmentAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accent,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentDoctor: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  appointmentSpecialty: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  appointmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  appointmentMetaText: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  appointmentDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textTertiary,
    marginHorizontal: 4,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },

  // Subscription Card
  subscriptionCard: {
    width: 152,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  subscriptionCardHighlight: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  subscriptionBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: colors.info,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  subscriptionBadgeHighlight: {
    backgroundColor: colors.secondary,
  },
  subscriptionBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFF',
    textTransform: 'uppercase',
  },
  subscriptionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  subscriptionPeriod: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  subscriptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  subscriptionPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  subscriptionPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subscriptionPriceHighlight: {
    color: colors.accent,
  },
  subscriptionPriceUnit: {
    fontSize: 12,
    color: colors.textTertiary,
    marginLeft: 2,
  },
  subscriptionBenefits: {
    gap: 4,
    marginBottom: 12,
  },
  subscriptionBenefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subscriptionBenefitText: {
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
  },
  subscriptionCta: {
    backgroundColor: colors.accentMuted,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  subscriptionCtaHighlight: {
    backgroundColor: colors.accent,
  },
  subscriptionCtaText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
  },
  subscriptionCtaTextHighlight: {
    color: '#FFF',
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    gap: 10,
  },
  quickActionItem: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickActionPressed: {
    backgroundColor: colors.surface2,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
});
