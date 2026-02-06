// ============================================
// CAREBOW - Premium HomeScreen Redesign
// Modern, polished UI like Practo/Cult.fit level
// ============================================

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
      <Animated.View
        entering={FadeInDown.delay(delay).springify()}
        style={[animatedStyle, style]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};

// ============================================
// HEADER - Premium Feel
// ============================================
const Header = ({ navigation }: { navigation: any }) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

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
          <Text style={styles.userName}>Priya</Text>
        </View>
      </View>
      <View style={styles.headerRight}>
        <Pressable style={styles.notificationBtn} onPress={handleNotificationPress}>
          <View style={styles.notificationDot} />
          <AppIcon name="bell" size={22} color={colors.textPrimary} />
        </Pressable>
        <Pressable style={styles.avatarContainer} onPress={handleProfilePress}>
          <LinearGradient colors={[colors.accentLight, colors.accent]} style={styles.avatarGradient}>
            <Text style={styles.avatarText}>P</Text>
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
            Describe symptoms & get instant{'\n'}personalized health guidance
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
    style={({ pressed }) => [
      styles.emergencyBanner,
      pressed && { opacity: 0.9 }
    ]}
  >
    <View style={styles.emergencyGradientFallback}>
      <View style={styles.emergencyIconBg}>
        <AppIcon name="shield" size={22} color="#EF4444" />
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
          <Text style={styles.exploreSubtitle}>Doctor visits, lab tests, nursing, equipment & more</Text>
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
const UpcomingCard = () => (
  <AnimatedPressable delay={800}>
    <View style={styles.upcomingCard}>
      <View style={styles.upcomingBadge}>
        <View style={styles.upcomingDot} />
        <Text style={styles.upcomingBadgeText}>Coming up</Text>
      </View>

      <View style={styles.upcomingContent}>
        <View style={styles.upcomingAvatar}>
          <Text style={styles.upcomingAvatarText}>SC</Text>
        </View>

        <View style={styles.upcomingInfo}>
          <Text style={styles.upcomingName}>Dr. Sarah Chen</Text>
          <Text style={styles.upcomingSpecialty}>General Physician</Text>
          <View style={styles.upcomingTimeRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <AppIcon name="calendar" size={12} color={colors.textTertiary} />
              <Text style={styles.upcomingTime}>Jan 5, 2026 • </Text>
              <AppIcon name="time" size={12} color={colors.textTertiary} />
              <Text style={styles.upcomingTime}>2:00 PM</Text>
            </View>
          </View>
        </View>

        <Pressable style={styles.joinButton}>
          <LinearGradient colors={[colors.accent, colors.accentDark]} style={styles.joinGradient}>
            <AppIcon name="video" size={14} color={colors.textInverse} />
            <Text style={styles.joinText}>Join</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  </AnimatedPressable>
);

// ============================================
// CARE PLAN CARD - Full Width
// ============================================
const CarePlanCard = ({ name, tagline, price, originalPrice, discount, benefits, color, colorSoft, iconName, onPress, delay }: any) => (
  <Animated.View entering={FadeInDown.delay(delay).springify()}>
    <AnimatedPressable style={styles.carePlanCard} onPress={onPress}>
      <View style={styles.carePlanHeader}>
        <View style={[styles.carePlanIcon, { backgroundColor: colorSoft }]}>
          <AppIcon name={iconName} size={24} color={color} />
        </View>
        <View style={styles.carePlanHeaderText}>
          <Text style={styles.carePlanName}>{name}</Text>
          <Text style={styles.carePlanTagline}>{tagline}</Text>
        </View>
        <View style={styles.carePlanPriceBlock}>
          <View style={styles.carePlanPriceRow}>
            <Text style={[styles.carePlanPrice, { color }]}>${price}</Text>
            {originalPrice && originalPrice > price ? (
              <Text style={styles.carePlanOriginal}>${originalPrice}</Text>
            ) : null}
          </View>
          {discount > 0 && (
            <View style={[styles.discountBadge, { backgroundColor: color + '15' }]}>
              <Text style={[styles.discountText, { color }]}>Save {discount}%</Text>
            </View>
          )}
        </View>
      </View>

      {benefits && benefits.length > 0 && (
        <View style={styles.carePlanBenefits}>
          {benefits.slice(0, 3).map((b: string, i: number) => (
            <View key={i} style={styles.carePlanBenefitItem}>
              <AppIcon name="check" size={14} color={color} />
              <Text style={styles.carePlanBenefitText}>{b}</Text>
            </View>
          ))}
        </View>
      )}
    </AnimatedPressable>
  </Animated.View>
);

// ============================================
// QUICK ACTIONS
// ============================================
const QuickActions = ({ navigation }: { navigation: any }) => {
  const actions: { iconName: IconName; label: string; color: string; iconColor: string; screen: string; nestedScreen?: string }[] = [
    { iconName: 'receipt', label: 'Orders', color: colors.blueSoft, iconColor: colors.blue, screen: 'Orders' },
    { iconName: 'document', label: 'Requests', color: colors.purpleSoft, iconColor: colors.purple, screen: 'Requests' },
    { iconName: 'folder', label: 'Records', color: colors.accentSoft, iconColor: colors.accent, screen: 'Profile', nestedScreen: 'HealthRecords' },
    { iconName: 'help', label: 'Support', color: colors.orangeSoft, iconColor: colors.orange, screen: 'Profile', nestedScreen: 'Help' },
  ];

  const handlePress = (item: typeof actions[0]) => {
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
// MAIN HOME SCREEN
// ============================================
export default function HomeScreen() {
  const navigation = useNavigation<MainTabScreenProps<'Home'>['navigation']>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
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
        <SectionHeader title="Upcoming" action="View all" delay={500} />
        <View style={styles.section}>
          <UpcomingCard />
        </View>

        {/* Care Plans — full-width, prominent */}
        <SectionHeader title="Care Plans" subtitle="Save with subscriptions" action="Compare" onPress={() => navigation.navigate('CarePlans' as never)} delay={600} />
        <View style={styles.section}>
          <CarePlanCard
            name="Ask CareBow"
            tagline="AI Assistant · $20/mo"
            price={20}
            originalPrice={30}
            discount={33}
            benefits={['Unlimited AI symptom checks', '24/7 health guidance', 'Personalized care recommendations']}
            color={colors.purple}
            colorSoft={colors.purpleSoft}
            iconName="sparkles"
            onPress={() => navigation.navigate('PlanDetails' as never, { id: 'ask_carebow' } as never)}
            delay={650}
          />
          <CarePlanCard
            name="Monthly Plan"
            tagline="Short-term care · $30/mo"
            price={30}
            originalPrice={null}
            discount={0}
            benefits={['Weekly check-in calls', 'Medication reminders', 'Dedicated CareBow coordinator']}
            color={colors.accent}
            colorSoft={colors.accentSoft}
            iconName="calendar"
            onPress={() => navigation.navigate('PlanDetails' as never, { id: 'monthly' } as never)}
            delay={700}
          />
          <CarePlanCard
            name="6-Month Plan"
            tagline="Most popular · $150/6mo"
            price={150}
            originalPrice={180}
            discount={17}
            benefits={['Twice a week check-ins', 'Priority doctor visits', '24/7 care support']}
            color={colors.secondary}
            colorSoft={colors.secondarySoft}
            iconName="leaf"
            onPress={() => navigation.navigate('PlanDetails' as never, { id: 'half_yearly' } as never)}
            delay={750}
          />
          <CarePlanCard
            name="Yearly Plan"
            tagline="Best value · $300/yr"
            price={300}
            originalPrice={360}
            discount={17}
            benefits={['Daily check-in calls', 'Daily family updates', 'Priority emergency support']}
            color={colors.orange}
            colorSoft={colors.orangeSoft}
            iconName="trophy"
            onPress={() => navigation.navigate('PlanDetails' as never, { id: 'yearly' } as never)}
            delay={800}
          />
        </View>

        {/* Quick Actions */}
        <SectionHeader title="Quick Actions" delay={900} />
        <QuickActions navigation={navigation} />

        <View style={{ height: 100 }} />
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
    marginBottom: 2,
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
        shadowColor: '#000',
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
    top: 10,
    right: 10,
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
    minHeight: 220,
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
    fontWeight: '600',
    color: colors.textInverse,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
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
    fontSize: 16,
    color: colors.accent,
  },
  heroIllustration: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
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
        shadowColor: '#000',
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
    left: -5,
  },
  floatingBadgeRight: {
    top: 35,
    right: -5,
  },

  // Emergency Banner
  emergencyBanner: {
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  emergencyGradientFallback: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: radius.xl,
  },
  emergencyIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FECACA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  emergencyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  emergencySubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  emergencyArrowText: {
    fontSize: 22,
    color: '#EF4444',
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
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textTertiary,
    marginTop: 2,
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },

  // Explore Services Card
  exploreCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
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
    fontSize: 13,
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
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },

  // Upcoming Card
  upcomingCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
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
    fontWeight: '600',
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
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  upcomingSpecialty: {
    fontSize: 13,
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
    fontSize: 16,
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
    fontSize: 22,
    fontWeight: '800',
  },
  carePlanOriginal: {
    fontSize: 13,
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginTop: 4,
  },
  discountText: {
    fontSize: 10,
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
    marginBottom: 6,
  },
  carePlanBenefitText: {
    fontSize: 13,
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
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
