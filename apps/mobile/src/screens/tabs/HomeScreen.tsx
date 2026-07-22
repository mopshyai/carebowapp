// ============================================
// CAREBOW - Premium HomeScreen Redesign
// Modern, polished UI like Practo/Cult.fit level
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'react-native-haptic-feedback';
import type { MainTabScreenProps } from '@/navigation/types';
import { CareBowLogoAccurate } from '@/components/icons/CareBowLogo';
import { AppIcon } from '@/components/icons/AppIcon';
import type { IconName } from '@/components/icons/iconMap';
import { useAuthStore } from '@/store/useAuthStore';
import { useCareReadiness } from '@/store/useProfileStore';
import { memberApi, V1Booking } from '@/services/api/endpoints/member';

// ============================================
// DESIGN TOKENS - CAREBOW BRAND
// ============================================
const colors = {
  // Primary Brand (Deep Teal)
  accent: '#0D4F52',
  accentDark: '#0A3D3F',
  accentLight: '#14B8A6',
  accentSoft: '#CCFBF1',
  accentMuted: '#E6FAF7',

  // Secondary (Warm Coral)
  secondary: '#E85D2D',
  secondarySoft: '#FFF4ED',

  // Service Colors
  coral: '#F472B6',
  coralSoft: '#FDF2F8',
  blue: '#3B82F6',
  blueSoft: '#EFF6FF',
  purple: '#8B5CF6',
  purpleSoft: '#F5F3FF',
  orange: '#F59E0B',
  orangeSoft: '#FFFBEB',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',

  // Backgrounds
  background: '#F8FAFC',
  surface: '#FFFFFF',

  // Status
  success: '#10B981',
  successSoft: '#ECFDF5',
  error: '#EF4444',
  errorSoft: '#FEF2F2',
};

const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 };
const radius = { sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, full: 9999 };

// ============================================
// ANIMATED PRESSABLE WITH HAPTICS
// ============================================
const AnimatedPressable = ({ children, onPress, style, delay = 0 }: any) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 150 });
        Haptics.trigger('impactLight');
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      }}
      onPress={onPress}
    >
      <Animated.View entering={FadeInDown.delay(delay).springify()} style={[animatedStyle, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

// ============================================
// HEADER - Premium Feel
// ============================================
const Header = ({ navigation }: { navigation: any }) => {
  const user = useAuthStore((state) => state.user);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const firstName = user?.firstName.trim() || user?.email.split('@')[0]?.trim() || 'there';
  const initials =
    [user?.firstName, user?.lastName]
      .map((name) => name?.trim().charAt(0))
      .filter(Boolean)
      .join('')
      .toUpperCase() ||
    firstName.charAt(0).toUpperCase() ||
    'C';

  const handleNotificationPress = () => {
    Haptics.trigger('impactLight');
    navigation.navigate('Profile', { screen: 'Notifications' });
  };

  const handleProfilePress = () => {
    Haptics.trigger('impactLight');
    navigation.navigate('Profile', { screen: 'ProfileIndex' });
  };

  return (
    <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
      <View style={styles.headerLeft}>
        <CareBowLogoAccurate size={36} />
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>{greeting} 👋</Text>
          <Text style={styles.userName}>{firstName}</Text>
        </View>
      </View>
      <View style={styles.headerRight}>
        <Pressable style={styles.notificationBtn} onPress={handleNotificationPress}>
          <View style={styles.notificationDot} />
          <AppIcon name="bell" size={22} color={colors.textPrimary} />
        </Pressable>
        <Pressable
          style={styles.avatarContainer}
          onPress={handleProfilePress}
          accessibilityRole="button"
          accessibilityLabel={`Open ${firstName}'s profile`}
        >
          <LinearGradient
            colors={[colors.accentLight, colors.accent]}
            style={styles.avatarGradient}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </Animated.View>
  );
};

// ============================================
// AI HERO CARD - The Star of the Show ⭐
// ============================================
const AIHeroCard = ({ navigation }: { navigation: any }) => (
  <AnimatedPressable delay={200} onPress={() => navigation.navigate('MainTabs', { screen: 'Ask' })}>
    <LinearGradient
      colors={['#0D4F52', '#14B8A6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.heroCard}
    >
      {/* Background decorative circles */}
      <View style={[styles.heroCircle, { width: 200, height: 200, top: -50, right: -50 }]} />
      <View style={[styles.heroCircle, { width: 100, height: 100, bottom: -30, left: -30 }]} />
      <View style={[styles.heroCircle, { width: 60, height: 60, top: 30, right: 100 }]} />

      <View style={styles.heroContent}>
        <View style={styles.heroLeft}>
          {/* AI Badge */}
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>✨ AI Powered</Text>
          </View>

          <Text style={styles.heroTitle}>Ask CareBow</Text>
          <Text style={styles.heroSubtitle}>
            Describe symptoms & get instant personalized health guidance
          </Text>

          {/* CTA Button */}
          <View style={styles.heroButton}>
            <Text style={styles.heroButtonText}>Start Conversation</Text>
            <Text style={styles.heroButtonArrow}>→</Text>
          </View>
        </View>

        {/* Illustration */}
        <View style={styles.heroIllustration}>
          <View style={styles.illustrationCircle}>
            <AppIcon name="doctor" size={40} color="#FFFFFF" />
          </View>
          {/* Floating badges - positioned relative to illustration */}
          <View style={[styles.floatingBadge, styles.floatingBadgeTop]}>
            <AppIcon name="medicine_delivery" size={14} color={colors.accent} />
          </View>
          <View style={[styles.floatingBadge, styles.floatingBadgeLeft]}>
            <AppIcon name="stethoscope" size={14} color={colors.accent} />
          </View>
          <View style={[styles.floatingBadge, styles.floatingBadgeRight]}>
            <AppIcon name="heart-filled" size={14} color="#EF4444" />
          </View>
        </View>
      </View>
    </LinearGradient>
  </AnimatedPressable>
);

// ============================================
// EMERGENCY BANNER
// ============================================
const EmergencyBanner = ({ navigation }: { navigation: any }) => (
  <Pressable
    onPress={() => {
      Haptics.trigger('impactLight');
      navigation.navigate('Safety', { screen: 'SafetyIndex' });
    }}
    style={({ pressed }) => [styles.emergencyBanner, pressed && { opacity: 0.9 }]}
  >
    <View style={styles.emergencyGradientFallback}>
      <View style={styles.emergencyIconBg}>
        <AppIcon name="shield" size={22} color={colors.secondary} />
      </View>
      <View style={styles.emergencyContent}>
        <Text style={styles.emergencyTitle}>Emergency & Safety</Text>
        <Text style={styles.emergencySubtitle}>SOS alerts & contacts</Text>
      </View>
      <Text style={styles.emergencyArrowText}>›</Text>
    </View>
  </Pressable>
);

// ============================================
// SECTION HEADER
// ============================================
const SectionHeader = ({ title, subtitle, action, onPress, delay = 0 }: any) => (
  <Animated.View entering={FadeInDown.delay(delay).springify()} style={styles.sectionHeader}>
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
    {action && (
      <Pressable hitSlop={8} onPress={onPress}>
        <Text style={styles.sectionAction}>{action} →</Text>
      </Pressable>
    )}
  </Animated.View>
);

// ============================================
// EXPLORE SERVICES CARD - Entry point to ServicesScreen
// ============================================
const ExploreServicesCard = ({ navigation }: { navigation: any }) => {
  const services: { iconName: IconName; label: string; color: string }[] = [
    { iconName: 'doctor', label: 'Doctor Visit', color: colors.accent },
    { iconName: 'lab', label: 'Lab Tests', color: colors.blue },
    { iconName: 'nurse', label: 'Nursing', color: colors.coral },
    { iconName: 'oxygen_concentrator', label: 'Equipment', color: colors.purple },
  ];

  return (
    <AnimatedPressable
      delay={400}
      style={styles.exploreCard}
      onPress={() => {
        Haptics.trigger('impactLight');
        navigation.navigate('Services' as never);
      }}
    >
      <View style={styles.exploreTop}>
        <View>
          <Text style={styles.exploreTitle}>Healthcare Services</Text>
          <Text style={styles.exploreSubtitle}>
            Doctor visits, lab tests, nursing, equipment & more
          </Text>
        </View>
        <View style={styles.exploreArrow}>
          <Text style={styles.exploreArrowText}>→</Text>
        </View>
      </View>

      <View style={styles.exploreIcons}>
        {services.map((s, i) => (
          <View key={i} style={styles.exploreIconItem}>
            <View style={[styles.exploreIconCircle, { backgroundColor: s.color + '15' }]}>
              <AppIcon name={s.iconName} size={22} color={s.color} />
            </View>
            <Text style={styles.exploreIconLabel}>{s.label}</Text>
          </View>
        ))}
      </View>
    </AnimatedPressable>
  );
};

// ============================================
// UPCOMING APPOINTMENT CARD
// ============================================
const UpcomingCard = ({
  booking,
  loading,
  navigation,
}: {
  booking: V1Booking | null;
  loading: boolean;
  navigation: any;
}) => {
  if (loading) {
    return (
      <View style={styles.upcomingEmptyCard}>
        <Text style={styles.upcomingEmptyText}>Checking your schedule…</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <AnimatedPressable delay={800} onPress={() => navigation.navigate('Schedule' as never)}>
        <View style={styles.upcomingEmptyCard}>
          <View style={styles.upcomingEmptyIcon}>
            <AppIcon name="calendar" size={22} color={colors.accent} />
          </View>
          <View style={styles.upcomingEmptyContent}>
            <Text style={styles.upcomingEmptyTitle}>No upcoming appointments</Text>
            <Text style={styles.upcomingEmptyText}>Your confirmed bookings will appear here.</Text>
          </View>
          <Text style={styles.upcomingEmptyArrow}>›</Text>
        </View>
      </AnimatedPressable>
    );
  }

  const providerName = booking.provider?.name || 'Care provider';
  const when = new Date(booking.scheduledAt);
  const initials = providerName
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <AnimatedPressable delay={800}>
      <View style={styles.upcomingCard}>
        <View style={styles.upcomingBadge}>
          <View style={styles.upcomingDot} />
          <Text style={styles.upcomingBadgeText}>Coming up</Text>
        </View>

        <View style={styles.upcomingContent}>
          <View style={styles.upcomingAvatar}>
            <Text style={styles.upcomingAvatarText}>{initials || 'CB'}</Text>
          </View>

          <View style={styles.upcomingInfo}>
            <Text style={styles.upcomingName}>{providerName}</Text>
            <Text style={styles.upcomingSpecialty}>
              {booking.service?.name || 'Care appointment'}
            </Text>
            <View style={styles.upcomingTimeRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <AppIcon name="calendar" size={12} color={colors.textTertiary} />
                <Text style={styles.upcomingTime}>
                  {when.toLocaleDateString([], { month: 'short', day: 'numeric' })} •{' '}
                </Text>
                <AppIcon name="time" size={12} color={colors.textTertiary} />
                <Text style={styles.upcomingTime}>
                  {when.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            style={styles.joinButton}
            onPress={() => navigation.navigate('Schedule' as never)}
          >
            <LinearGradient colors={[colors.accent, colors.accentDark]} style={styles.joinGradient}>
              <AppIcon name="video" size={14} color={colors.textInverse} />
              <Text style={styles.joinText}>Join</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </AnimatedPressable>
  );
};

// ============================================
// QUICK ACTIONS
// ============================================
const QuickActions = ({ navigation }: { navigation: any }) => {
  const actions: {
    iconName: IconName;
    label: string;
    color: string;
    iconColor: string;
    screen: string;
    nestedScreen?: string;
  }[] = [
    {
      iconName: 'receipt',
      label: 'Orders',
      color: colors.blueSoft,
      iconColor: colors.blue,
      screen: 'Orders',
    },
    {
      iconName: 'document',
      label: 'Requests',
      color: colors.purpleSoft,
      iconColor: colors.purple,
      screen: 'Requests',
    },
    {
      iconName: 'folder',
      label: 'Records',
      color: colors.accentSoft,
      iconColor: colors.accent,
      screen: 'Profile',
      nestedScreen: 'HealthRecords',
    },
    {
      iconName: 'help',
      label: 'Support',
      color: colors.orangeSoft,
      iconColor: colors.orange,
      screen: 'Profile',
      nestedScreen: 'Help',
    },
  ];

  const handlePress = (item: (typeof actions)[0]) => {
    Haptics.trigger('impactLight');
    if (item.nestedScreen) {
      navigation.navigate(item.screen, { screen: item.nestedScreen });
    } else {
      navigation.navigate(item.screen);
    }
  };

  return (
    <View style={styles.quickActionsRow}>
      {actions.map((item, index) => (
        <AnimatedPressable
          key={item.label}
          delay={950 + index * 50}
          style={styles.quickAction}
          onPress={() => handlePress(item)}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: item.color }]}>
            <AppIcon name={item.iconName} size={24} color={item.iconColor} />
          </View>
          <Text style={styles.quickActionLabel}>{item.label}</Text>
        </AnimatedPressable>
      ))}
    </View>
  );
};

// ============================================
// CARE READINESS — PEAK MOMENT (personalized insight)
// ============================================
const CareReadinessCard = ({ navigation }: { navigation: any }) => {
  const careReadiness = useCareReadiness();
  const topMissing = careReadiness.missingItems[0];

  if (!topMissing) {
    return (
      <AnimatedPressable delay={1050} style={styles.readinessCard}>
        <Text style={styles.readinessAllSetText}>🎉 Your care profile is fully set up</Text>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      delay={1050}
      style={styles.readinessCard}
      onPress={() => {
        Haptics.trigger('impactLight');
        navigation.navigate('Profile', { screen: topMissing.screen, params: topMissing.params });
      }}
    >
      <View style={styles.readinessHeader}>
        <View style={styles.readinessTextBlock}>
          <Text style={styles.readinessTitle}>
            Your care profile is {careReadiness.score}% ready
          </Text>
          <Text style={styles.readinessHint}>{topMissing.label} to personalize your care →</Text>
        </View>
        <View style={styles.readinessRing}>
          <Text style={styles.readinessRingText}>{careReadiness.score}%</Text>
        </View>
      </View>
      <View style={styles.readinessBar}>
        <View style={[styles.readinessFill, { width: `${careReadiness.score}%` }]} />
      </View>
    </AnimatedPressable>
  );
};

// ============================================
// MAIN HOME SCREEN
// ============================================
export default function HomeScreen() {
  const navigation = useNavigation<MainTabScreenProps<'Home'>['navigation']>();
  const insets = useSafeAreaInsets();
  const [nextBooking, setNextBooking] = useState<V1Booking | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(true);

  useEffect(() => {
    let active = true;
    memberApi
      .getBookings()
      .then((response) => {
        if (!active || !response.success) return;
        const now = Date.now();
        const next =
          (response.bookings ?? [])
            .filter(
              (booking) =>
                new Date(booking.scheduledAt).getTime() >= now &&
                booking.status !== 'CANCELLED' &&
                booking.status !== 'COMPLETED'
            )
            .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt))[0] ?? null;
        setNextBooking(next);
      })
      .catch(() => {})
      .finally(() => active && setScheduleLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          // Clear the bottom tab bar (icon row + label + home-indicator inset)
          // so the last card / closing note is never crowded or hidden by it.
          { paddingBottom: insets.bottom + spacing.xxl * 2 },
        ]}
      >
        <Header navigation={navigation} />

        <View style={styles.section}>
          <AIHeroCard navigation={navigation} />
        </View>

        <View style={styles.section}>
          <EmergencyBanner navigation={navigation} />
        </View>

        {/* Explore Services — single entry point */}
        <View style={styles.section}>
          <ExploreServicesCard navigation={navigation} />
        </View>

        {/* Upcoming */}
        <SectionHeader
          title="Upcoming"
          action="View all"
          onPress={() => navigation.navigate('Schedule' as never)}
          delay={500}
        />
        <View style={styles.section}>
          <UpcomingCard booking={nextBooking} loading={scheduleLoading} navigation={navigation} />
        </View>

        {/* Care Plans — full-width, prominent */}
        <SectionHeader
          title="Care Plans"
          subtitle="Published plans will appear here"
          action="Learn more"
          onPress={() => navigation.navigate('CarePlans' as never)}
          delay={600}
        />
        <View style={styles.section}>
          <AnimatedPressable
            delay={650}
            style={styles.carePlanCard}
            onPress={() => navigation.navigate('CarePlans' as never)}
          >
            <View style={styles.carePlanHeader}>
              <View style={[styles.carePlanIcon, { backgroundColor: colors.accentSoft }]}>
                <AppIcon name="shield" size={24} color={colors.accent} />
              </View>
              <View style={styles.carePlanHeaderText}>
                <Text style={styles.carePlanName}>No plans published yet</Text>
                <Text style={styles.carePlanTagline}>
                  CareBow will show verified pricing and benefits here.
                </Text>
              </View>
            </View>
          </AnimatedPressable>
        </View>

        {/* Quick Actions */}
        <SectionHeader title="Quick Actions" delay={900} />
        <QuickActions navigation={navigation} />

        {/* Care Readiness — personalized insight (peak moment) */}
        <View style={styles.section}>
          <CareReadinessCard navigation={navigation} />
        </View>

        {/* Closing note */}
        <Text style={styles.closingNote}>That's everything for now — take care 👋</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
  },
  section: {
    marginBottom: spacing.lg,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  greetingContainer: {
    // Container for greeting text
  },
  greeting: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.textPrimary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
    zIndex: 1,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  avatarGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textInverse,
  },

  // Hero Card
  heroCard: {
    borderRadius: radius.xxl,
    padding: spacing.xl,
    overflow: 'hidden',
    // LinearGradient doesn't reliably grow to its content height on iOS, so the
    // CTA button gets clipped when the subtitle wraps to 3 lines. Reserve enough
    // height for the tallest (iOS 3-line) layout.
    minHeight: 264,
  },
  heroCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroLeft: {
    flex: 1,
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textInverse,
  },
  heroTitle: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
    color: colors.textInverse,
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.textInverse,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
    gap: spacing.sm,
  },
  heroButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accent,
  },
  heroButtonArrow: {
    fontSize: 14,
    color: colors.accent,
  },
  heroIllustration: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    marginLeft: spacing.sm,
    position: 'relative',
  },
  illustrationCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingBadge: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.textInverse,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.textPrimary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  floatingBadgeTop: {
    top: -5,
    right: 5,
  },
  floatingBadgeLeft: {
    bottom: 5,
    left: 0,
  },
  floatingBadgeRight: {
    top: 35,
    right: 0,
  },

  // Emergency Banner
  emergencyBanner: {
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  emergencyGradientFallback: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: radius.xl,
  },
  emergencyIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  emergencyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  emergencySubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  emergencyArrowText: {
    fontSize: 24,
    color: colors.secondary,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 4,
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accent,
  },

  // Explore Services Card
  exploreCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    ...Platform.select({
      ios: {
        shadowColor: colors.textPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  exploreTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  exploreTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  exploreSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  exploreArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exploreArrowText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
  },
  exploreIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exploreIconItem: {
    alignItems: 'center',
    flex: 1,
  },
  exploreIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  exploreIconLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },

  // Upcoming Card
  upcomingEmptyCard: {
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  upcomingEmptyIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  upcomingEmptyContent: {
    flex: 1,
  },
  upcomingEmptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  upcomingEmptyText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  upcomingEmptyArrow: {
    fontSize: 26,
    color: colors.textTertiary,
    marginLeft: spacing.sm,
  },
  upcomingCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: colors.textPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  upcomingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.accentSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  upcomingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  upcomingBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
  },
  upcomingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upcomingAvatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  upcomingAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
  },
  upcomingInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  upcomingName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  upcomingSpecialty: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  upcomingTimeRow: {
    flexDirection: 'row',
  },
  upcomingTime: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  joinButton: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  joinGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  joinText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textInverse,
  },

  // Care Plan Card — Full Width
  carePlanCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: colors.textPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  carePlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  carePlanIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  carePlanHeaderText: {
    flex: 1,
  },
  carePlanName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  carePlanTagline: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  carePlanPriceBlock: {
    alignItems: 'flex-end',
  },
  carePlanPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  carePlanPrice: {
    fontSize: 24,
    fontWeight: '700',
  },
  carePlanOriginal: {
    fontSize: 12,
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    marginTop: 4,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '700',
  },
  carePlanBenefits: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.background,
  },
  carePlanBenefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 8,
  },
  carePlanBenefitText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },

  // Quick Actions
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },

  // Care Readiness — peak moment card
  readinessCard: {
    backgroundColor: colors.accentMuted,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg + spacing.xs,
  },
  readinessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  readinessTextBlock: {
    flex: 1,
    marginRight: spacing.md,
  },
  readinessTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  readinessHint: {
    fontSize: 12,
    color: colors.accentDark,
    marginTop: 4,
  },
  readinessRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  readinessRingText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
  },
  readinessBar: {
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  readinessFill: {
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
  },
  readinessAllSetText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accentDark,
    textAlign: 'center',
  },

  // Closing note
  closingNote: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
