/**
 * Welcome Screen
 * App intro with logo, tagline, and CTA buttons
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, radius, shadows } from '@/theme';
import type { AuthStackParamList } from '@/navigation/types';

const { width } = Dimensions.get('window');

type WelcomeScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;

export default function WelcomeScreen() {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Logo and Branding */}
        <View style={styles.brandingContainer}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoEmoji}>🏥</Text>
            </View>
          </View>
          <Text style={styles.appName}>CareBow</Text>
          <Text style={styles.tagline}>
            Healthcare guidance for{'\n'}your loved ones
          </Text>
        </View>

        {/* Feature Highlights */}
        <View style={styles.featuresContainer}>
          <FeatureItem
            icon="💬"
            title="AI Health Assistant"
            description="Get instant guidance on health concerns"
          />
          <FeatureItem
            icon="👨‍👩‍👧‍👦"
            title="Family Profiles"
            description="Manage health for your whole family"
          />
          <FeatureItem
            icon="🛡️"
            title="Safety Features"
            description="SOS alerts and daily check-ins"
          />
        </View>

        {/* CTA Buttons */}
        <View style={styles.ctaContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => navigation.navigate('Signup')}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.secondaryButtonText}>
              Already have an account? <Text style={styles.linkText}>Sign in</Text>
            </Text>
          </Pressable>
        </View>
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
        <Text style={styles.featureEmoji}>{icon}</Text>
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
    justifyContent: 'space-between',
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.lg,
  },

  // Branding
  brandingContainer: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  logoContainer: {
    marginBottom: spacing.lg,
  },
  logoIcon: {
    width: 100,
    height: 100,
    borderRadius: radius.xl,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  logoEmoji: {
    fontSize: 48,
  },
  appName: {
    ...typography.displayLarge,
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  tagline: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },

  // Features
  featuresContainer: {
    gap: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface2,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  featureEmoji: {
    fontSize: 24,
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

  // CTA Buttons
  ctaContainer: {
    gap: spacing.md,
  },
  primaryButton: {
    height: 56,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.button,
  },
  primaryButtonText: {
    ...typography.labelLarge,
    color: colors.textInverse,
    fontWeight: '600',
  },
  secondaryButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  linkText: {
    color: colors.accent,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
