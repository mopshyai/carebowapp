/**
 * Onboarding Slides Screen
 * 3-slide value proposition walkthrough
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';
import { colors, typography, spacing, radius, shadows } from '@/theme';
import type { OnboardingStackParamList } from '@/navigation/types';

const { width } = Dimensions.get('window');

type OnboardingSlidesNavigationProp = NativeStackNavigationProp<OnboardingStackParamList, 'OnboardingSlides'>;

interface Slide {
  id: string;
  icon: string;
  emoji: string;
  title: string;
  description: string;
  color: string;
}

const slides: Slide[] = [
  {
    id: '1',
    icon: 'message-circle',
    emoji: '💬',
    title: 'Log symptoms quickly',
    description:
      'Describe health concerns in your own words. Our AI understands context and asks the right follow-up questions.',
    color: colors.accent,
  },
  {
    id: '2',
    icon: 'alert-circle',
    emoji: '🎯',
    title: 'Know when to seek care',
    description:
      'Get clear guidance on urgency levels - from home care tips to when you should visit a doctor immediately.',
    color: colors.info,
  },
  {
    id: '3',
    icon: 'users',
    emoji: '👨‍👩‍👧‍👦',
    title: 'Track your whole family',
    description:
      'Create profiles for parents, children, and loved ones. Keep everyone\'s health information organized in one place.',
    color: colors.success,
  },
];

export default function OnboardingSlidesScreen() {
  const navigation = useNavigation<OnboardingSlidesNavigationProp>();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      navigation.navigate('RoleSelection');
    }
  };

  const handleSkip = () => {
    navigation.navigate('RoleSelection');
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
  };

  const renderSlide = ({ item }: { item: Slide }) => (
    <View style={styles.slide}>
      <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
        <Text style={styles.slideEmoji}>{item.emoji}</Text>
      </View>
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideDescription}>{item.description}</Text>
    </View>
  );

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Skip Button */}
      <View style={styles.header}>
        <Pressable
          style={styles.skipButton}
          onPress={handleSkip}
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
      />

      {/* Footer */}
      <View style={styles.footer}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Next/Get Started Button */}
        <Pressable
          style={({ pressed }) => [
            styles.nextButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {isLastSlide ? 'Get Started' : 'Next'}
          </Text>
          <Icon
            name={isLastSlide ? 'check' : 'arrow-right'}
            size={20}
            color={colors.textInverse}
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  skipButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  skipText: {
    ...typography.label,
    color: colors.textSecondary,
  },

  // Slides
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  slideEmoji: {
    fontSize: 56,
  },
  slideTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  slideDescription: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: spacing.lg,
  },

  // Footer
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.accent,
  },
  nextButton: {
    height: 56,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.button,
  },
  nextButtonText: {
    ...typography.labelLarge,
    color: colors.textInverse,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
