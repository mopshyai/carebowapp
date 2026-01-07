/**
 * Today Screen - Premium Healthcare Dashboard
 * Uses healthcare-grade SVG icons from the icon system
 * Platform-specific polish for iOS and Android
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Pressable,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { AppNavigationProp } from '../../navigation/types';

import { colors, spacing, radius, typography, shadows } from '../../theme';
import { AppIcon, IconContainer, IconName, getIconColors } from '../../components/icons';
import { StatusBadge, DotBadge, PopularBadge } from '../../components/ui/StatusBadge';
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
// ICON MAPPING FOR SERVICES
// =============================================================================

const SERVICE_ICONS: Record<string, IconName> = {
  medical: 'stethoscope',
  flask: 'lab',
  heart: 'nurse',
  'fitness-outline': 'oxygen_concentrator',
  'pulse-outline': 'bpap',
  'cloud-outline': 'cpap',
  'heart-outline': 'cardiac_monitor',
  'bed-outline': 'bed',
  body: 'healthcheck',
  water: 'lab',
  'shield-checkmark': 'shield-check',
};

// =============================================================================
// ANIMATED PRESSABLE COMPONENT
// =============================================================================

function AnimatedPressable({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode;
  onPress: () => void;
  style?: any;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: Platform.OS === 'ios' ? 0.97 : 0.98,
      useNativeDriver: true,
      friction: 10,
      tension: 100,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 10,
      tension: 100,
    }).start();
  };

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

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
          <AppIcon name="arrow-right" size={14} color={colors.accent} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// =============================================================================
// HERO AI CARD
// =============================================================================

function HeroAICard({ onPress }: { onPress: () => void }) {
  return (
    <AnimatedPressable onPress={onPress} style={styles.heroCard}>
      <View style={styles.heroContent}>
        <View style={styles.heroIconWrap}>
          <AppIcon name="sparkles" size={24} color="#FFF" fillOpacity={0.3} />
        </View>
        <View style={styles.heroTextWrap}>
          <Text style={styles.heroTitle}>AI Health Assistant</Text>
          <Text style={styles.heroSubtitle}>
            Describe your symptoms and get instant, personalized guidance
          </Text>
        </View>
      </View>
      <View style={styles.heroArrow}>
        <AppIcon name="arrow-right" size={20} color="#FFF" />
      </View>
      <View style={styles.heroDecor1} />
      <View style={styles.heroDecor2} />
    </AnimatedPressable>
  );
}

// =============================================================================
// EMERGENCY CARD
// =============================================================================

function EmergencyCard({ onPress }: { onPress: () => void }) {
  return (
    <AnimatedPressable onPress={onPress} style={styles.emergencyCard}>
      <View style={styles.emergencyIconWrap}>
        <AppIcon name="shield-check" size={22} color={colors.error} fillOpacity={0.15} />
      </View>
      <View style={styles.emergencyTextWrap}>
        <Text style={styles.emergencyTitle}>Emergency & Safety</Text>
        <Text style={styles.emergencySubtitle}>SOS, check-ins & contacts</Text>
      </View>
      <View style={styles.emergencyArrow}>
        <AppIcon name="chevron-right" size={18} color={colors.error} />
      </View>
    </AnimatedPressable>
  );
}

// =============================================================================
// QUICK SERVICE CARD
// =============================================================================

function QuickServiceCard({ item, onPress }: { item: QuickPickItem; onPress: () => void }) {
  const iconName = SERVICE_ICONS[item.icon] || 'stethoscope';
  const iconColors = getIconColors(iconName);

  // Map tag to badge type
  const getBadgeType = (tag: string): 'available' | 'popular' | 'verified' | '24/7' => {
    switch (tag) {
      case 'Available': return 'available';
      case 'Popular': return 'popular';
      case 'Verified': return 'verified';
      case '24/7': return '24/7';
      default: return 'available';
    }
  };

  return (
    <AnimatedPressable onPress={onPress} style={styles.quickServiceCard}>
      <IconContainer
        size="md"
        variant="soft"
        backgroundColor={iconColors.background}
        withShadow={Platform.OS === 'ios'}
      >
        <AppIcon name={iconName} size={22} color={iconColors.primary} fillOpacity={0.2} />
      </IconContainer>

      <Text style={styles.quickServiceTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.quickServiceSubtitle} numberOfLines={1}>{item.subtitle}</Text>

      <View style={styles.quickServiceMeta}>
        <DotBadge type={getBadgeType(item.tag)} label={item.tag} />
      </View>

      {item.priceHint && (
        <Text style={styles.quickServicePrice}>{item.priceHint}</Text>
      )}

      {item.nextSlot && (
        <View style={styles.quickServiceSlot}>
          <AppIcon name="time" size={12} color={colors.success} />
          <Text style={styles.quickServiceSlotText}>{item.nextSlot}</Text>
        </View>
      )}
    </AnimatedPressable>
  );
}

// =============================================================================
// EQUIPMENT CARD
// =============================================================================

function EquipmentCard({ item, onPress }: { item: DeviceItem; onPress: () => void }) {
  const iconName = SERVICE_ICONS[item.icon] || 'oxygen_concentrator';
  const iconColors = getIconColors(iconName);

  const getBadgeType = (type: string): 'free-delivery' | 'certified' | 'training' | 'setup' | 'info' => {
    if (type === 'info') return 'free-delivery';
    if (type === 'highlight') return 'certified';
    return 'info';
  };

  return (
    <AnimatedPressable onPress={onPress} style={styles.equipmentCard}>
      <View style={styles.equipmentIconWrap}>
        <IconContainer
          size="lg"
          variant="soft"
          backgroundColor={iconColors.background}
          withShadow={Platform.OS === 'ios'}
        >
          <AppIcon name={iconName} size={28} color={iconColors.primary} fillOpacity={0.2} />
        </IconContainer>
      </View>

      <Text style={styles.equipmentTitle} numberOfLines={2}>{item.title}</Text>

      <View style={styles.equipmentBadges}>
        {item.badges.slice(0, 2).map((badge, idx) => (
          <StatusBadge
            key={idx}
            type={getBadgeType(badge.type)}
            label={badge.label}
            size="sm"
          />
        ))}
      </View>

      {/* Price with proper alignment */}
      <View style={styles.equipmentPricing}>
        <Text style={styles.equipmentPriceSymbol}>$</Text>
        <Text style={styles.equipmentPriceValue}>{item.pricePerUnit}</Text>
        <Text style={styles.equipmentPriceUnit}>{item.priceUnit}</Text>
      </View>

      <View style={styles.equipmentDelivery}>
        <AppIcon name="flash" size={12} color={colors.success} fillOpacity={0.2} />
        <Text style={styles.equipmentDeliveryText}>{item.deliveryTime}</Text>
      </View>
    </AnimatedPressable>
  );
}

// =============================================================================
// HEALTH PACKAGE CARD
// =============================================================================

function PackageCard({ item, onPress }: { item: CarePackageItem; onPress: () => void }) {
  const iconName = SERVICE_ICONS[item.icon] || 'healthcheck';
  const iconColors = getIconColors(iconName);

  return (
    <AnimatedPressable onPress={onPress} style={styles.packageCard}>
      {item.popular && <PopularBadge />}

      <IconContainer
        size="md"
        variant="soft"
        backgroundColor={iconColors.background}
        withShadow={Platform.OS === 'ios'}
      >
        <AppIcon name={iconName} size={22} color={iconColors.primary} fillOpacity={0.2} />
      </IconContainer>

      <Text style={styles.packageTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.packageSubtitle}>{item.includedCount} tests included</Text>

      <View style={styles.packageIncludes}>
        {item.included.slice(0, 2).map((inc, idx) => (
          <View key={idx} style={styles.packageIncludeRow}>
            <AppIcon name="check-circle" size={14} color={colors.success} fillOpacity={0.2} />
            <Text style={styles.packageIncludeText} numberOfLines={1}>{inc.name}</Text>
          </View>
        ))}
      </View>

      {/* Price with proper alignment */}
      <View style={styles.packagePricing}>
        <Text style={styles.packagePriceLabel}>From</Text>
        <Text style={styles.packagePriceSymbol}>$</Text>
        <Text style={styles.packagePriceValue}>{item.startingPrice}</Text>
      </View>
    </AnimatedPressable>
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
            <AppIcon name="calendar" size={12} color={colors.textTertiary} />
            <Text style={styles.appointmentMetaText}>{apt.date}</Text>
            <View style={styles.appointmentDot} />
            <AppIcon name="clock" size={12} color={colors.textTertiary} />
            <Text style={styles.appointmentMetaText}>{apt.time}</Text>
          </View>
        </View>

        {apt.canJoin && (
          <TouchableOpacity style={styles.joinButton} activeOpacity={0.8}>
            <AppIcon name="video" size={16} color="#FFF" fillOpacity={0.3} />
            <Text style={styles.joinButtonText}>Join</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// =============================================================================
// SUBSCRIPTION CARD - Premium Design
// =============================================================================

function SubscriptionCard({ plan, onPress }: { plan: SubscriptionPlan; onPress: () => void }) {
  const getPlanConfig = (): { color: string; bgColor: string; gradientStart: string; icon: IconName; label: string } => {
    switch (plan.id) {
      case 'ask_carebow':
        return { color: '#8B5CF6', bgColor: '#F5F3FF', gradientStart: '#EDE9FE', icon: 'sparkles', label: 'AI Powered' };
      case 'monthly':
        return { color: '#3B82F6', bgColor: '#EFF6FF', gradientStart: '#DBEAFE', icon: 'calendar', label: 'Flexible' };
      case 'half_yearly':
        return { color: '#10B981', bgColor: '#ECFDF5', gradientStart: '#D1FAE5', icon: 'leaf', label: 'Best Value' };
      case 'yearly':
        return { color: '#F59E0B', bgColor: '#FFFBEB', gradientStart: '#FEF3C7', icon: 'trophy', label: 'Most Popular' };
      default:
        return { color: colors.accent, bgColor: colors.accentSoft, gradientStart: colors.accentMuted, icon: 'calendar', label: '' };
    }
  };
  const config = getPlanConfig();
  const discountPercent = plan.originalPrice > plan.price
    ? Math.round(((plan.originalPrice - plan.price) / plan.originalPrice) * 100)
    : 0;

  return (
    <AnimatedPressable onPress={onPress} style={[styles.subscriptionCard, { backgroundColor: config.bgColor }]}>
      {/* Top label badge */}
      {config.label && (
        <View style={[styles.subscriptionBadge, { backgroundColor: config.color }]}>
          <Text style={styles.subscriptionBadgeText}>{config.label}</Text>
        </View>
      )}

      {/* Icon with gradient background */}
      <View style={[styles.subscriptionIconWrap, { backgroundColor: config.gradientStart }]}>
        <AppIcon name={config.icon} size={32} color={config.color} />
      </View>

      {/* Period label */}
      <Text style={[styles.subscriptionPeriodLabel, { color: config.color }]}>
        {plan.billingPeriod === 'monthly' ? 'Monthly' : plan.billingPeriod === 'yearly' ? 'Yearly' : '6 Months'}
      </Text>

      {/* Price section */}
      <View style={styles.subscriptionPriceSection}>
        <View style={styles.subscriptionPriceRow}>
          <Text style={[styles.subscriptionPriceSymbol, { color: config.color }]}>$</Text>
          <Text style={[styles.subscriptionPriceValue, { color: config.color }]}>{plan.price}</Text>
        </View>
        {plan.originalPrice > plan.price && (
          <Text style={styles.subscriptionOriginalPrice}>${plan.originalPrice}</Text>
        )}
      </View>

      {/* Star Rating */}
      <View style={styles.subscriptionRatingRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <AppIcon
            key={star}
            name={star <= Math.floor(plan.rating) ? 'star-filled' : 'star'}
            size={14}
            color="#F59E0B"
          />
        ))}
        <Text style={styles.subscriptionReviewCount}>({plan.reviewCount})</Text>
      </View>

      {/* Discount badge */}
      {discountPercent > 0 && (
        <View style={styles.subscriptionDiscount}>
          <Text style={styles.subscriptionDiscountText}>Save {discountPercent}%</Text>
        </View>
      )}
    </AnimatedPressable>
  );
}

// =============================================================================
// QUICK ACTIONS - Premium Design
// =============================================================================

function QuickActions() {
  const navigation = useNavigation() as AppNavigationProp;

  const actions: { icon: IconName; label: string; screen: string; nested: boolean; color: string; bgColor: string }[] = [
    { icon: 'receipt', label: 'Orders', screen: 'Orders', nested: false, color: '#3B82F6', bgColor: '#EFF6FF' },
    { icon: 'document', label: 'Requests', screen: 'Requests', nested: false, color: '#8B5CF6', bgColor: '#F5F3FF' },
    { icon: 'folder', label: 'Records', screen: 'HealthRecords', nested: true, color: '#10B981', bgColor: '#ECFDF5' },
    { icon: 'help', label: 'Support', screen: 'Help', nested: true, color: '#F59E0B', bgColor: '#FFFBEB' },
  ];

  const handleActionPress = (action: typeof actions[0]) => {
    if (action.nested) {
      navigation.navigate('Profile', { screen: action.screen });
    } else {
      navigation.navigate(action.screen);
    }
  };

  return (
    <View style={styles.quickActions}>
      {actions.map((action, idx) => (
        <AnimatedPressable
          key={idx}
          style={[styles.quickActionItem, { backgroundColor: action.bgColor }]}
          onPress={() => handleActionPress(action)}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: '#FFFFFF' }]}>
            <AppIcon name={action.icon} size={24} color={action.color} />
          </View>
          <Text style={[styles.quickActionLabel, { color: action.color }]}>{action.label}</Text>
        </AnimatedPressable>
      ))}
    </View>
  );
}

// =============================================================================
// MAIN SCREEN
// =============================================================================

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation() as AppNavigationProp;

  const handleQuickPickPress = (item: QuickPickItem) => {
    navigation.navigate(item.screen, item.params);
  };

  const handleDevicePress = (item: DeviceItem) => {
    navigation.navigate(item.screen, item.params);
  };

  const handlePackagePress = (item: CarePackageItem) => {
    navigation.navigate(item.screen, item.params);
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
            contentContainerStyle={styles.carePlansScroll}
            decelerationRate="fast"
            snapToInterval={172}
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
// STYLES
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
    ...Platform.select({
      ios: {
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },

  // Hero AI Card
  heroCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden',
    minHeight: 100,
    backgroundColor: '#0D9488',
    ...Platform.select({
      ios: {
        shadowColor: '#0D9488',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
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
    ...shadows.card,
  },
  quickServiceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 12,
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
  carePlansScroll: {
    paddingRight: 20,
    paddingBottom: 16,
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
    ...shadows.card,
  },
  equipmentIconWrap: {
    marginBottom: 12,
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
  // Price with proper baseline alignment
  equipmentPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  equipmentPriceSymbol: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  equipmentPriceValue: {
    fontSize: 18,
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
    ...shadows.card,
  },
  packageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 10,
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
  // Price with proper baseline alignment
  packagePricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  packagePriceLabel: {
    fontSize: 11,
    color: colors.textTertiary,
    marginRight: 2,
  },
  packagePriceSymbol: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
  },
  packagePriceValue: {
    fontSize: 18,
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
    ...shadows.card,
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
    ...Platform.select({
      ios: {
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },

  // Subscription Card - Premium Design
  subscriptionCard: {
    width: 160,
    borderRadius: 20,
    padding: 16,
    paddingTop: 32,
    borderWidth: 0,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  subscriptionBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  subscriptionBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subscriptionIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  subscriptionPeriodLabel: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subscriptionPriceSection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  subscriptionPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  subscriptionPriceSymbol: {
    fontSize: 14,
    fontWeight: '700',
  },
  subscriptionPriceValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  subscriptionOriginalPrice: {
    fontSize: 12,
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
    textAlign: 'center',
  },
  subscriptionRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  subscriptionReviewCount: {
    fontSize: 11,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  subscriptionDiscount: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    transform: [{ translateX: -30 }],
    backgroundColor: '#10B981',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  subscriptionDiscountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Quick Actions - Premium Design
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionItem: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 8,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
