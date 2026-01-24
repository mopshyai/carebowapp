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
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'react-native-haptic-feedback';
import type { MainTabScreenProps } from '@/navigation/types';
import { CareBowLogoAccurate } from '@/components/icons/CareBowLogo';

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
          <Text style={{ fontSize: 20 }}>🔔</Text>
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
            <Text style={{ fontSize: 40 }}>👨‍⚕️</Text>
          </View>
          {/* Floating badges - positioned relative to illustration */}
          <View style={[styles.floatingBadge, styles.floatingBadgeTop]}>
            <Text style={{ fontSize: 14 }}>💊</Text>
          </View>
          <View style={[styles.floatingBadge, styles.floatingBadgeLeft]}>
            <Text style={{ fontSize: 14 }}>🩺</Text>
          </View>
          <View style={[styles.floatingBadge, styles.floatingBadgeRight]}>
            <Text style={{ fontSize: 14 }}>❤️</Text>
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
        <Text style={{ fontSize: 22 }}>🛡️</Text>
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
const SectionHeader = ({ title, subtitle, action, delay = 0 }: any) => (
  <Animated.View entering={FadeInDown.delay(delay).springify()} style={styles.sectionHeader}>
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
    {action && (
      <Pressable hitSlop={8}>
        <Text style={styles.sectionAction}>{action} →</Text>
      </Pressable>
    )}
  </Animated.View>
);

// ============================================
// SERVICE CARD - Premium Design
// ============================================
const ServiceCard = ({ icon, title, subtitle, price, priceUnit, status, statusColor, accentColor, delay }: any) => (
  <Animated.View entering={FadeInRight.delay(delay).springify()}>
    <AnimatedPressable style={styles.serviceCard}>
      {/* Top accent line */}
      <View style={[styles.serviceAccent, { backgroundColor: accentColor }]} />

      {/* Icon */}
      <View style={[styles.serviceIcon, { backgroundColor: accentColor + '15' }]}>
        <Text style={{ fontSize: 26 }}>{icon}</Text>
      </View>

      <Text style={styles.serviceTitle}>{title}</Text>
      <Text style={styles.serviceSubtitle}>{subtitle}</Text>

      {/* Status Badge */}
      <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
      </View>

      {/* Price */}
      <View style={styles.priceRow}>
        <Text style={styles.priceAmount}>₹{price.toLocaleString('en-IN')}</Text>
        <Text style={styles.priceUnit}>/{priceUnit}</Text>
      </View>
    </AnimatedPressable>
  </Animated.View>
);

// ============================================
// EQUIPMENT CARD
// ============================================
const EquipmentCard = ({ icon, name, price, tags, delivery, delay }: any) => (
  <Animated.View entering={FadeInRight.delay(delay).springify()}>
    <AnimatedPressable style={styles.equipmentCard}>
      <View style={styles.equipmentIcon}>
        <Text style={{ fontSize: 28 }}>{icon}</Text>
      </View>

      <Text style={styles.equipmentName}>{name}</Text>

      <View style={styles.tagsRow}>
        {tags.map((tag: string, i: number) => (
          <View key={i} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.equipmentPriceRow}>
        <Text style={styles.equipmentPrice}>₹{price.toLocaleString('en-IN')}</Text>
        <Text style={styles.equipmentUnit}>/month</Text>
      </View>

      <View style={styles.deliveryBadge}>
        <Text style={{ fontSize: 12 }}>⚡</Text>
        <Text style={styles.deliveryText}>{delivery}</Text>
      </View>
    </AnimatedPressable>
  </Animated.View>
);

// ============================================
// HEALTH PACKAGE CARD
// ============================================
const PackageCard = ({ icon, name, testsCount, tests, price, originalPrice, isPopular, color, delay }: any) => (
  <Animated.View entering={FadeInRight.delay(delay).springify()}>
    <AnimatedPressable style={styles.packageCard}>
      {isPopular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>⭐ POPULAR</Text>
        </View>
      )}

      <View style={[styles.packageIcon, { backgroundColor: color + '15' }]}>
        <Text style={{ fontSize: 26 }}>{icon}</Text>
      </View>

      <Text style={styles.packageName}>{name}</Text>
      <Text style={styles.packageTestCount}>{testsCount} tests included</Text>

      <View style={styles.testsList}>
        {tests.slice(0, 2).map((test: string, i: number) => (
          <View key={i} style={styles.testItem}>
            <Text style={[styles.testCheck, { color }]}>✓</Text>
            <Text style={styles.testName}>{test}</Text>
          </View>
        ))}
      </View>

      <View style={styles.packagePriceRow}>
        <Text style={styles.packagePriceLabel}>From</Text>
        <Text style={styles.packageOriginalPrice}>₹{originalPrice.toLocaleString('en-IN')}</Text>
        <Text style={[styles.packagePrice, { color }]}>₹{price.toLocaleString('en-IN')}</Text>
      </View>
    </AnimatedPressable>
  </Animated.View>
);

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
            <Text style={styles.upcomingTime}>📅 Jan 5, 2026 • 🕐 2:00 PM</Text>
          </View>
        </View>

        <Pressable style={styles.joinButton}>
          <LinearGradient colors={[colors.accent, colors.accentDark]} style={styles.joinGradient}>
            <Text style={styles.joinIcon}>📹</Text>
            <Text style={styles.joinText}>Join</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  </AnimatedPressable>
);

// ============================================
// CARE PLAN CARD
// ============================================
const CarePlanCard = ({ tagline, price, originalPrice, discount, rating, reviews, color, colorSoft, icon, delay }: any) => (
  <Animated.View entering={FadeInRight.delay(delay).springify()}>
    <AnimatedPressable style={styles.carePlanCard}>
      <View style={[styles.carePlanBadge, { backgroundColor: color }]}>
        <Text style={styles.carePlanBadgeText}>{tagline}</Text>
      </View>

      <View style={[styles.carePlanIcon, { backgroundColor: colorSoft }]}>
        <Text style={{ fontSize: 28 }}>{icon}</Text>
      </View>

      <Text style={[styles.carePlanName, { color }]}>Monthly</Text>

      <View style={styles.carePlanPriceRow}>
        <Text style={[styles.carePlanPrice, { color }]}>₹{price.toLocaleString('en-IN')}</Text>
        <Text style={styles.carePlanOriginal}>₹{originalPrice.toLocaleString('en-IN')}</Text>
      </View>

      <View style={styles.ratingRow}>
        <Text style={styles.ratingStars}>★★★★☆</Text>
        <Text style={styles.ratingCount}>({reviews})</Text>
      </View>

      <View style={styles.discountBadge}>
        <Text style={styles.discountText}>Save {discount}%</Text>
      </View>
    </AnimatedPressable>
  </Animated.View>
);

// ============================================
// QUICK ACTIONS
// ============================================
const QuickActions = ({ navigation }: { navigation: any }) => {
  const actions = [
    { icon: '📋', label: 'Orders', color: colors.blueSoft, screen: 'Orders' },
    { icon: '📝', label: 'Requests', color: colors.purpleSoft, screen: 'Requests' },
    { icon: '📁', label: 'Records', color: colors.accentSoft, screen: 'Profile', nestedScreen: 'HealthRecords' },
    { icon: '💬', label: 'Support', color: colors.orangeSoft, screen: 'Profile', nestedScreen: 'Help' },
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
          delay={900 + index * 50}
          style={styles.quickAction}
          onPress={() => handlePress(item)}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: item.color }]}>
            <Text style={{ fontSize: 24 }}>{item.icon}</Text>
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

        {/* Quick Services */}
        <SectionHeader title="Quick Services" subtitle="Book in minutes" action="See all" delay={400} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          <ServiceCard
            icon="🩺"
            title="Doctor Visit"
            subtitle="At-home consultation"
            price={799}
            priceUnit="visit"
            status="Available"
            statusColor={colors.success}
            accentColor={colors.accent}
            delay={450}
          />
          <ServiceCard
            icon="🧪"
            title="Lab Tests"
            subtitle="Home sample collection"
            price={399}
            priceUnit="test"
            status="Popular"
            statusColor={colors.blue}
            accentColor={colors.blue}
            delay={500}
          />
          <ServiceCard
            icon="💗"
            title="Nursing Care"
            subtitle="Professional nurses"
            price={500}
            priceUnit="4hr"
            status="24/7"
            statusColor={colors.coral}
            accentColor={colors.coral}
            delay={550}
          />
        </ScrollView>

        {/* Medical Equipment */}
        <SectionHeader title="Medical Equipment" subtitle="Rent or buy" action="View all" delay={600} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          <EquipmentCard
            icon="🫁"
            name="Oxygen Concentrator"
            price={4500}
            tags={['Free delivery', 'Setup included']}
            delivery="Same day"
            delay={650}
          />
          <EquipmentCard
            icon="😮‍💨"
            name="BiPAP Machine"
            price={5500}
            tags={['Free delivery', 'Training']}
            delivery="Next day"
            delay={700}
          />
          <EquipmentCard
            icon="🛏️"
            name="Hospital Bed"
            price={3500}
            tags={['Free delivery', 'Setup']}
            delivery="Same day"
            delay={750}
          />
        </ScrollView>

        {/* Health Packages */}
        <SectionHeader title="Health Packages" subtitle="Comprehensive checkups" action="Explore" delay={800} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          <PackageCard
            icon="❤️"
            name="Cardiac Package"
            testsCount={12}
            tests={['ECG', 'Lipid Profile']}
            price={2499}
            originalPrice={3500}
            isPopular={true}
            color={colors.coral}
            delay={850}
          />
          <PackageCard
            icon="🏥"
            name="Full Body Checkup"
            testsCount={78}
            tests={['CBC, LFT, KFT', 'Thyroid Profile']}
            price={1999}
            originalPrice={3000}
            isPopular={false}
            color={colors.accent}
            delay={900}
          />
          <PackageCard
            icon="💉"
            name="Diabetes Package"
            testsCount={15}
            tests={['HbA1c', 'Fasting Sugar']}
            price={1499}
            originalPrice={2200}
            isPopular={false}
            color={colors.blue}
            delay={950}
          />
        </ScrollView>

        {/* Upcoming */}
        <SectionHeader title="Upcoming" action="View all" delay={1000} />
        <View style={styles.section}>
          <UpcomingCard />
        </View>

        {/* Care Plans */}
        <SectionHeader title="Care Plans" subtitle="Save with subscriptions" action="Compare" delay={1100} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          <CarePlanCard
            tagline="AI POWERED"
            price={999}
            originalPrice={1499}
            discount={33}
            rating={4.2}
            reviews={12}
            color={colors.purple}
            colorSoft={colors.purpleSoft}
            icon="✨"
            delay={1150}
          />
          <CarePlanCard
            tagline="FLEXIBLE"
            price={1499}
            originalPrice={2499}
            discount={40}
            rating={4.5}
            reviews={4}
            color={colors.accent}
            colorSoft={colors.accentSoft}
            icon="📅"
            delay={1200}
          />
          <CarePlanCard
            tagline="BEST VALUE"
            price={2999}
            originalPrice={4999}
            discount={40}
            rating={4.8}
            reviews={8}
            color={colors.secondary}
            colorSoft={colors.secondarySoft}
            icon="👑"
            delay={1250}
          />
        </ScrollView>

        {/* Quick Actions */}
        <SectionHeader title="Quick Actions" delay={1300} />
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
  horizontalScroll: {
    paddingRight: spacing.xl,
    paddingBottom: spacing.sm,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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

  // Service Card
  serviceCard: {
    width: 160,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginRight: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  serviceAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  serviceIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  serviceSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
  },
  priceUnit: {
    fontSize: 12,
    color: colors.textTertiary,
  },

  // Equipment Card
  equipmentCard: {
    width: 170,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginRight: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  equipmentIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  equipmentName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  tag: {
    backgroundColor: colors.accentMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.accent,
  },
  equipmentPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  equipmentPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  equipmentUnit: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  deliveryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },

  // Package Card
  packageCard: {
    width: 180,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginRight: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.orange,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  popularText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textInverse,
  },
  packageIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  packageName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  packageTestCount: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  testsList: {
    marginBottom: spacing.md,
  },
  testItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 4,
  },
  testCheck: {
    fontSize: 12,
    fontWeight: '700',
  },
  testName: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  packagePriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  packagePriceLabel: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  packageOriginalPrice: {
    fontSize: 12,
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  packagePrice: {
    fontSize: 20,
    fontWeight: '700',
  },

  // Upcoming Card
  upcomingCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
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
  joinIcon: {
    fontSize: 14,
  },
  joinText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textInverse,
  },

  // Care Plan Card
  carePlanCard: {
    width: 160,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginRight: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    alignItems: 'center',
  },
  carePlanBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  carePlanBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textInverse,
  },
  carePlanIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  carePlanName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  carePlanPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  carePlanPrice: {
    fontSize: 28,
    fontWeight: '800',
  },
  carePlanOriginal: {
    fontSize: 14,
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  ratingStars: {
    fontSize: 12,
    color: colors.orange,
  },
  ratingCount: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  discountBadge: {
    backgroundColor: colors.successSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  discountText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.success,
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
