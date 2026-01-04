/**
 * Today Screen
 * Main dashboard with quick picks, devices, packages, and appointments
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors, spacing, radius, typography, shadows, layout } from '@/theme';
import {
  quickPickItems,
  deviceItems,
  carePackageItems,
  mockUpcomingAppointment,
  formatPrice,
  getTagStyle,
  getBadgeStyle,
  QuickPickItem,
  DeviceItem,
  CarePackageItem,
} from '@/data/catalog';
import { subscriptionPlans, SubscriptionPlan } from '@/data/subscriptions';

// =============================================================================
// SECTION HEADER COMPONENT
// =============================================================================

function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.sectionAction} onPress={onAction}>
          <Text style={styles.sectionActionText}>{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.accent} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// =============================================================================
// QUICK PICK CARD COMPONENT
// =============================================================================

function QuickPickCard({ item, onPress }: { item: QuickPickItem; onPress: () => void }) {
  const tagStyle = getTagStyle(item.tag);

  return (
    <TouchableOpacity style={styles.quickPickCard} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.quickPickIcon, { backgroundColor: item.iconBgColor }]}>
        <Ionicons name={item.icon as any} size={22} color={item.iconColor} />
      </View>

      <Text style={styles.quickPickTitle}>{item.title}</Text>
      <Text style={styles.quickPickSubtitle}>{item.subtitle}</Text>

      <View style={styles.quickPickFooter}>
        <View style={[styles.quickPickTag, { backgroundColor: tagStyle.bg }]}>
          <Text style={[styles.quickPickTagText, { color: tagStyle.text }]}>{item.tag}</Text>
        </View>
        {item.priceHint && (
          <Text style={styles.quickPickPrice} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
            {item.priceHint}
          </Text>
        )}
      </View>

      {item.nextSlot && (
        <View style={styles.quickPickSlot}>
          <Ionicons name="time-outline" size={12} color={colors.success} />
          <Text style={styles.quickPickSlotText}>Next: {item.nextSlot}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// =============================================================================
// DEVICE CARD COMPONENT
// =============================================================================

function DeviceCard({ item, onPress }: { item: DeviceItem; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.deviceCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.deviceIconWrap}>
        <Ionicons name={item.icon as any} size={28} color={colors.textTertiary} />
      </View>

      <Text style={styles.deviceTitle}>{item.title}</Text>

      <View style={styles.deviceBadges}>
        {item.badges.slice(0, 2).map((badge, idx) => {
          const badgeStyle = getBadgeStyle(badge.type);
          return (
            <View key={idx} style={[styles.deviceBadge, { backgroundColor: badgeStyle.bg }]}>
              <Text style={[styles.deviceBadgeText, { color: badgeStyle.text }]}>
                {badge.label}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.devicePriceRow}>
        <Text style={styles.devicePrice}>
          From {formatPrice(item.pricePerUnit)}
        </Text>
        <Text style={styles.devicePriceUnit}>{item.priceUnit}</Text>
      </View>

      <View style={styles.deviceDelivery}>
        <Ionicons name="car-outline" size={12} color={colors.success} />
        <Text style={styles.deviceDeliveryText}>{item.deliveryTime}</Text>
      </View>
    </TouchableOpacity>
  );
}

// =============================================================================
// CARE PACKAGE CARD COMPONENT
// =============================================================================

function PackageCard({ item, onPress }: { item: CarePackageItem; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.packageCard} onPress={onPress} activeOpacity={0.7}>
      {item.popular && (
        <View style={styles.packagePopularBadge}>
          <Text style={styles.packagePopularText}>Popular</Text>
        </View>
      )}

      <View style={[styles.packageIcon, { backgroundColor: item.iconBgColor }]}>
        <Ionicons name={item.icon as any} size={20} color={item.iconColor} />
      </View>

      <Text style={styles.packageTitle}>{item.title}</Text>
      <Text style={styles.packageSubtitle}>{item.includedCount} tests + consult</Text>

      <View style={styles.packageIncludes}>
        {item.included.slice(0, 2).map((inc, idx) => (
          <View key={idx} style={styles.packageIncludeRow}>
            <Ionicons name="checkmark" size={12} color={colors.success} />
            <Text style={styles.packageIncludeText}>{inc.name}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.packagePrice}>From {formatPrice(item.startingPrice)}</Text>
    </TouchableOpacity>
  );
}

// =============================================================================
// SUBSCRIPTION CARD COMPONENT
// =============================================================================

function SubscriptionCard({
  plan,
  onPress,
}: {
  plan: SubscriptionPlan;
  onPress: () => void;
}) {
  const getPriceLabel = () => {
    switch (plan.billingPeriod) {
      case 'monthly':
        return '/month';
      case 'half_yearly':
        return '/6 mo';
      case 'yearly':
        return '/year';
      default:
        return '';
    }
  };

  return (
    <TouchableOpacity style={styles.subscriptionCard} onPress={onPress} activeOpacity={0.7}>
      {plan.badge && (
        <View style={[styles.subscriptionBadge, plan.highlight && styles.subscriptionBadgeHighlight]}>
          <Text style={styles.subscriptionBadgeText}>{plan.badge}</Text>
        </View>
      )}

      <View style={[styles.subscriptionIconWrap, { backgroundColor: plan.iconBgColor }]}>
        <Ionicons name={plan.iconName as any} size={18} color={plan.iconColor} />
      </View>

      <Text style={styles.subscriptionPeriod}>{plan.periodLabel}</Text>
      <Text style={styles.subscriptionTitle}>{plan.title}</Text>

      <View style={styles.subscriptionPriceRow}>
        <Text style={styles.subscriptionPrice}>${plan.price}</Text>
        <Text style={styles.subscriptionPriceUnit}>{getPriceLabel()}</Text>
      </View>

      <View style={styles.subscriptionBenefits}>
        {plan.benefits.slice(0, 2).map((benefit, idx) => (
          <View key={idx} style={styles.subscriptionBenefitRow}>
            <Ionicons name="checkmark-circle" size={14} color={colors.success} />
            <Text style={styles.subscriptionBenefitText}>{benefit}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.subscriptionCta}>
        <Text style={styles.subscriptionCtaText}>{plan.ctaLabel}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// =============================================================================
// APPOINTMENT CARD COMPONENT
// =============================================================================

function AppointmentCard() {
  const apt = mockUpcomingAppointment;
  const router = useRouter();

  return (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentLeft}>
        <View style={styles.appointmentAvatar}>
          <Text style={styles.appointmentAvatarText}>{apt.doctorInitials}</Text>
        </View>
        <View style={styles.appointmentInfo}>
          <Text style={styles.appointmentDoctor}>{apt.doctorName}</Text>
          <Text style={styles.appointmentSpecialty}>{apt.specialty}</Text>
          <View style={styles.appointmentMeta}>
            <Ionicons name="calendar-outline" size={13} color={colors.textTertiary} />
            <Text style={styles.appointmentMetaText}>{apt.date}, {apt.time}</Text>
            <View style={styles.appointmentDot} />
            <Ionicons name="videocam-outline" size={13} color={colors.textTertiary} />
            <Text style={styles.appointmentMetaText}>{apt.typeLabel}</Text>
          </View>
        </View>
      </View>
      {apt.canJoin && (
        <TouchableOpacity style={styles.joinButton}>
          <Text style={styles.joinButtonText}>Join</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// =============================================================================
// QUICK ACTIONS COMPONENT
// =============================================================================

function QuickActions() {
  const router = useRouter();

  const actions = [
    { icon: 'receipt-outline', label: 'Orders', route: '/orders' },
    { icon: 'document-text-outline', label: 'Requests', route: '/requests' },
    { icon: 'folder-outline', label: 'Records', route: '/records' },
    { icon: 'help-circle-outline', label: 'Support', route: '/support' },
  ];

  return (
    <View style={styles.quickActions}>
      {actions.map((action, idx) => (
        <TouchableOpacity
          key={idx}
          style={styles.quickActionItem}
          onPress={() => router.push(action.route as any)}
        >
          <View style={styles.quickActionIcon}>
            <Ionicons name={action.icon as any} size={22} color={colors.accent} />
          </View>
          <Text style={styles.quickActionLabel}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleQuickPickPress = (item: QuickPickItem) => {
    router.push(item.route as any);
  };

  const handleDevicePress = (item: DeviceItem) => {
    router.push(item.route as any);
  };

  const handlePackagePress = (item: CarePackageItem) => {
    router.push(item.route as any);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.sm, paddingBottom: 100 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.userName}>Sandeep</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/profile')}
          >
            <Text style={styles.profileInitial}>S</Text>
          </TouchableOpacity>
        </View>

        {/* AI Assistant Card */}
        <TouchableOpacity
          style={styles.aiCard}
          activeOpacity={0.95}
          onPress={() => router.push('/ask')}
        >
          <View style={styles.aiCardContent}>
            <View style={styles.aiCardIconWrap}>
              <Ionicons name="sparkles" size={20} color={colors.white} />
            </View>
            <View style={styles.aiCardTextWrap}>
              <Text style={styles.aiCardTitle}>AI Health Assistant</Text>
              <Text style={styles.aiCardSubtitle}>
                Describe symptoms for instant guidance
              </Text>
            </View>
          </View>
          <View style={styles.aiCardArrow}>
            <Ionicons name="arrow-forward" size={18} color={colors.white} />
          </View>
        </TouchableOpacity>

        {/* Safety Card */}
        <TouchableOpacity
          style={styles.safetyCard}
          activeOpacity={0.95}
          onPress={() => router.push('/safety' as any)}
        >
          <View style={styles.safetyCardContent}>
            <View style={styles.safetyCardIconWrap}>
              <Ionicons name="shield-checkmark" size={20} color={colors.white} />
            </View>
            <View style={styles.safetyCardTextWrap}>
              <Text style={styles.safetyCardTitle}>Emergency & Safety</Text>
              <Text style={styles.safetyCardSubtitle}>
                SOS alerts, check-ins & emergency contacts
              </Text>
            </View>
          </View>
          <View style={styles.safetyCardArrow}>
            <Ionicons name="chevron-forward" size={18} color={colors.error} />
          </View>
        </TouchableOpacity>

        {/* Quick Services */}
        <View style={styles.section}>
          <SectionHeader
            title="Quick Services"
            actionLabel="See all"
            onAction={() => router.push('/services')}
          />
          <View style={styles.quickPicksRow}>
            {quickPickItems.map((item) => (
              <QuickPickCard
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
            actionLabel="View all"
            onAction={() => router.push('/services')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {deviceItems.map((item) => (
              <DeviceCard
                key={item.id}
                item={item}
                onPress={() => handleDevicePress(item)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Care Packages */}
        <View style={styles.section}>
          <SectionHeader
            title="Health Packages"
            actionLabel="Explore"
            onAction={() => router.push('/services')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
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
            actionLabel="View schedule"
            onAction={() => router.push('/schedule')}
          />
          <AppointmentCard />
        </View>

        {/* Subscription Plans */}
        <View style={styles.section}>
          <SectionHeader
            title="Care Plans"
            actionLabel="Compare"
            onAction={() => router.push('/services')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {subscriptionPlans.map((plan) => (
              <SubscriptionCard
                key={plan.id}
                plan={plan}
                onPress={() => router.push({ pathname: '/plan-details/[id]', params: { id: plan.id } })}
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
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  userName: {
    ...typography.h1,
    marginTop: spacing.xxs,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.button,
  },
  profileInitial: {
    ...typography.labelLarge,
    color: colors.white,
  },

  // AI Card
  aiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.xxl,
    ...shadows.button,
  },
  aiCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  aiCardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  aiCardTextWrap: {
    flex: 1,
  },
  aiCardTitle: {
    ...typography.labelLarge,
    color: colors.white,
  },
  aiCardSubtitle: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  aiCardArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Safety Card
  safetyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.error,
    ...shadows.card,
  },
  safetyCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  safetyCardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  safetyCardTextWrap: {
    flex: 1,
  },
  safetyCardTitle: {
    ...typography.labelLarge,
    color: colors.textPrimary,
  },
  safetyCardSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  safetyCardArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.errorSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Section
  section: {
    marginBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sectionActionText: {
    ...typography.label,
    color: colors.accent,
  },

  // Quick Picks
  quickPicksRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickPickCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  quickPickIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quickPickTitle: {
    ...typography.label,
    marginBottom: 2,
  },
  quickPickSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  quickPickFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    rowGap: spacing.xxs,
    columnGap: spacing.xs,
  },
  quickPickTag: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
    borderRadius: radius.xs,
  },
  quickPickTagText: {
    ...typography.tiny,
  },
  quickPickPrice: {
    ...typography.tiny,
    color: colors.accent,
    fontWeight: '600',
    flexShrink: 1,
  },
  quickPickSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  quickPickSlotText: {
    ...typography.tiny,
    color: colors.success,
  },

  // Horizontal Scroll
  horizontalScroll: {
    paddingRight: layout.screenPadding,
    gap: spacing.sm,
  },

  // Device Card
  deviceCard: {
    minWidth: 150,
    maxWidth: 180,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  deviceIconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surface2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  deviceTitle: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  deviceBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: spacing.sm,
  },
  deviceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  deviceBadgeText: {
    ...typography.tiny,
  },
  devicePriceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  devicePrice: {
    ...typography.labelSmall,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  devicePriceUnit: {
    ...typography.tiny,
    color: colors.textTertiary,
    flexShrink: 0,
  },
  deviceDelivery: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deviceDeliveryText: {
    ...typography.tiny,
    color: colors.success,
  },

  // Package Card
  packageCard: {
    minWidth: 145,
    maxWidth: 175,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  packagePopularBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  packagePopularText: {
    ...typography.tiny,
    color: colors.white,
  },
  packageIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  packageTitle: {
    ...typography.label,
    marginBottom: 2,
  },
  packageSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  packageIncludes: {
    gap: 4,
    marginBottom: spacing.sm,
  },
  packageIncludeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  packageIncludeText: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  packagePrice: {
    ...typography.labelSmall,
    color: colors.accent,
  },

  // Subscription Card
  subscriptionCard: {
    minWidth: 150,
    maxWidth: 180,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  subscriptionBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.info,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  subscriptionBadgeHighlight: {
    backgroundColor: colors.secondary,
  },
  subscriptionBadgeText: {
    ...typography.tiny,
    color: colors.white,
  },
  subscriptionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  subscriptionPeriod: {
    ...typography.tiny,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  subscriptionTitle: {
    ...typography.label,
    marginBottom: spacing.xxs,
  },
  subscriptionPriceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  subscriptionPrice: {
    ...typography.h2,
    color: colors.accent,
  },
  subscriptionPriceUnit: {
    ...typography.caption,
    color: colors.textTertiary,
    marginLeft: 2,
  },
  subscriptionCustom: {
    ...typography.labelSmall,
    color: colors.accent,
    marginBottom: spacing.sm,
  },
  subscriptionBenefits: {
    gap: 4,
  },
  subscriptionBenefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subscriptionBenefitText: {
    ...typography.tiny,
    color: colors.textSecondary,
    flex: 1,
  },
  subscriptionCta: {
    marginTop: spacing.sm,
    backgroundColor: colors.accentMuted,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  subscriptionCtaText: {
    ...typography.labelSmall,
    color: colors.accent,
  },

  // Appointment Card
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  appointmentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appointmentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  appointmentAvatarText: {
    ...typography.label,
    color: colors.accent,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentDoctor: {
    ...typography.label,
  },
  appointmentSpecialty: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  appointmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  appointmentMetaText: {
    ...typography.tiny,
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
    backgroundColor: colors.accent,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    ...shadows.subtle,
  },
  joinButtonText: {
    ...typography.label,
    color: colors.white,
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickActionItem: {
    flex: 1,
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.accentMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionLabel: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
});
