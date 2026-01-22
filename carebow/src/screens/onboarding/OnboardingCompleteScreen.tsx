/**
 * Onboarding Complete Screen
 * Success screen after completing onboarding
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { colors, typography, spacing, radius, shadows } from '@/theme';
import { useAuthStore } from '@/store/useAuthStore';

export default function OnboardingCompleteScreen() {
  const { completeOnboarding } = useAuthStore();

  // Animation values
  const checkmarkScale = new Animated.Value(0);
  const contentOpacity = new Animated.Value(0);

  useEffect(() => {
    // Animate checkmark
    Animated.sequence([
      Animated.spring(checkmarkScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGetStarted = () => {
    completeOnboarding();
    // Navigation will be handled by RootNavigator
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Success Animation */}
        <Animated.View
          style={[
            styles.iconContainer,
            { transform: [{ scale: checkmarkScale }] },
          ]}
        >
          <View style={styles.checkmarkCircle}>
            <Icon name="check" size={48} color={colors.success} />
          </View>
        </Animated.View>

        {/* Content */}
        <Animated.View style={[styles.textContainer, { opacity: contentOpacity }]}>
          <Text style={styles.title}>You're all set!</Text>
          <Text style={styles.subtitle}>
            Your CareBow account is ready. Here's what you can do:
          </Text>

          {/* Feature List */}
          <View style={styles.featuresContainer}>
            <FeatureItem
              icon="message-circle"
              title="Ask CareBow"
              description="Get instant health guidance from our AI assistant"
            />
            <FeatureItem
              icon="calendar"
              title="Book Services"
              description="Schedule doctor visits, lab tests, and more"
            />
            <FeatureItem
              icon="shield"
              title="Stay Safe"
              description="Set up SOS alerts and daily check-ins"
            />
            <FeatureItem
              icon="users"
              title="Add Family"
              description="Create profiles for your loved ones"
            />
          </View>
        </Animated.View>

        {/* CTA */}
        <Animated.View style={[styles.footer, { opacity: contentOpacity }]}>
          <Pressable
            style={({ pressed }) => [
              styles.getStartedButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleGetStarted}
          >
            <Text style={styles.getStartedButtonText}>Go to Home</Text>
            <Icon name="arrow-right" size={20} color={colors.textInverse} />
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
}

function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Icon name={icon} size={20} color={colors.accent} />
      </View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
  },

  // Success Icon
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  checkmarkCircle: {
    width: 100,
    height: 100,
    borderRadius: radius.full,
    backgroundColor: colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },

  // Text Content
  textContainer: {
    flex: 1,
  },
  title: {
    ...typography.displayMedium,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },

  // Features
  featuresContainer: {
    gap: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    backgroundColor: colors.surface2,
    borderRadius: radius.lg,
    gap: spacing.md,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    ...typography.labelLarge,
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  featureDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },

  // Footer
  footer: {
    paddingVertical: spacing.xl,
  },
  getStartedButton: {
    height: 56,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.button,
  },
  getStartedButtonText: {
    ...typography.labelLarge,
    color: colors.textInverse,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
