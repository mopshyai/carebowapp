/**
 * SplashScreen Component
 * Animated splash screen with brand identity
 * Handles transition from native splash to app content
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import SplashScreenNative from 'react-native-splash-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing } from '../theme';

// ============================================
// TYPES
// ============================================

interface SplashScreenProps {
  /** Callback when splash animation completes */
  onAnimationComplete?: () => void;
  /** Whether to show the splash screen */
  isVisible?: boolean;
  /** Minimum display time in ms */
  minDisplayTime?: number;
}

// ============================================
// CONSTANTS
// ============================================

const { width, height } = Dimensions.get('window');
const ANIMATION_DURATION = 800;
const FADE_DURATION = 400;
const DEFAULT_MIN_DISPLAY_TIME = 1500;

// ============================================
// COMPONENT
// ============================================

export function SplashScreen({
  onAnimationComplete,
  isVisible = true,
  minDisplayTime = DEFAULT_MIN_DISPLAY_TIME,
}: SplashScreenProps) {
  // Animation values
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Hide native splash screen
    SplashScreenNative.hide();

    // Track start time for minimum display
    const startTime = Date.now();

    // Start entrance animation sequence
    const entranceAnimation = Animated.sequence([
      // Logo fade in and scale up
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]),
      // Text fade in
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: FADE_DURATION,
        useNativeDriver: true,
      }),
      // Tagline fade in
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: FADE_DURATION,
        useNativeDriver: true,
      }),
    ]);

    // Pulse animation for logo
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    entranceAnimation.start(() => {
      pulseAnimation.start();
    });

    // Exit animation after minimum display time
    const elapsed = Date.now() - startTime;
    const remainingTime = Math.max(0, minDisplayTime - elapsed);

    const exitTimeout = setTimeout(() => {
      pulseAnimation.stop();

      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: FADE_DURATION,
        useNativeDriver: true,
      }).start(() => {
        onAnimationComplete?.();
      });
    }, remainingTime + ANIMATION_DURATION + FADE_DURATION * 2);

    return () => {
      clearTimeout(exitTimeout);
      pulseAnimation.stop();
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.accent} />

      {/* Background gradient effect */}
      <View style={styles.backgroundGradient} />

      {/* Logo Container */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [
              { scale: Animated.multiply(logoScale, pulseAnim) },
            ],
          },
        ]}
      >
        <View style={styles.logoCircle}>
          <Icon name="heart" size={48} color={colors.accent} />
        </View>
      </Animated.View>

      {/* Brand Name */}
      <Animated.Text
        style={[
          styles.brandName,
          { opacity: textOpacity },
        ]}
      >
        CareBow
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text
        style={[
          styles.tagline,
          { opacity: taglineOpacity },
        ]}
      >
        Healthcare at your fingertips
      </Animated.Text>

      {/* Loading indicator */}
      <Animated.View
        style={[
          styles.loadingContainer,
          { opacity: taglineOpacity },
        ]}
      >
        <View style={styles.loadingDot} />
        <View style={[styles.loadingDot, styles.loadingDotMiddle]} />
        <View style={styles.loadingDot} />
      </Animated.View>
    </Animated.View>
  );
}

// ============================================
// HOOK FOR SPLASH MANAGEMENT
// ============================================

export function useSplashScreen() {
  const [isReady, setIsReady] = React.useState(false);
  const [showSplash, setShowSplash] = React.useState(true);

  const hideSplash = React.useCallback(() => {
    setShowSplash(false);
  }, []);

  const markReady = React.useCallback(() => {
    setIsReady(true);
  }, []);

  return {
    showSplash,
    isReady,
    hideSplash,
    markReady,
  };
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.accent,
    // In production, this could be a LinearGradient
  },
  logoContainer: {
    marginBottom: spacing.xl,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  brandName: {
    ...typography.displayLarge,
    color: colors.white,
    fontSize: 36,
    fontWeight: '700',
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  tagline: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    marginBottom: spacing.xxxl,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xl,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  loadingDotMiddle: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});

export default SplashScreen;
