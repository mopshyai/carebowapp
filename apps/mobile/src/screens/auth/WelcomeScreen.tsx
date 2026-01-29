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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { CareBowLogo, LOGO_COLORS } from '@/components/icons/CareBowLogo';
import {
  colors,
  space,
  radius,
  typography,
  shadows,
} from '@/theme/tokens';
import type { AuthStackParamList } from '@/navigation/types';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;

export default function WelcomeScreen() {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Logo and Branding */}
        <View style={styles.brandingContainer}>
          <View style={styles.logoContainer}>
            <CareBowLogo size={100} />
          </View>
          <Text style={styles.appName}>CareBow</Text>
          <Text style={styles.tagline}>
            Healthcare guidance for{'\n'}your loved ones
          </Text>
        </View>

        {/* Feature Highlights */}
        <View style={styles.featuresContainer}>
          <FeatureItem
            iconName="chatbubble-ellipses-outline"
            title="AI Health Assistant"
            description="Get instant guidance on health concerns"
          />
          <FeatureItem
            iconName="people-outline"
            title="Family Profiles"
            description="Manage health for your whole family"
          />
          <FeatureItem
            iconName="shield-checkmark-outline"
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
  iconName: string;
  title: string;
  description: string;
}

function FeatureItem({ iconName, title, description }: FeatureItemProps) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Icon name={iconName} size={24} color={colors.primary.default} />
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
    paddingHorizontal: space.xl,
    justifyContent: 'space-between',
    paddingTop: space.xxxl,
    paddingBottom: space.lg,
  },

  // Branding
  brandingContainer: {
    alignItems: 'center',
    marginTop: space.xxl,
  },
  logoContainer: {
    marginBottom: space.md,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: LOGO_COLORS.teal,
    marginBottom: space.xs,
    letterSpacing: -0.5,
  },
  tagline: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },

  // Features
  featuresContainer: {
    gap: space.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    padding: space.md,
    borderRadius: radius.xl,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.primary.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: space.md,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    ...typography.label,
    color: colors.text.primary,
    marginBottom: 2,
  },
  featureDescription: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },

  // CTA Buttons
  ctaContainer: {
    gap: space.md,
  },
  primaryButton: {
    height: 56,
    backgroundColor: colors.primary.default,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.primaryButton,
  },
  primaryButtonText: {
    ...typography.buttonLarge,
    color: colors.text.inverse,
  },
  secondaryButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  linkText: {
    color: colors.primary.default,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
