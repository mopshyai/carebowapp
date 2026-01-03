/**
 * SubscriptionPlanDetails Screen
 * Displays detailed information about a subscription plan
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StarRating } from '@/components/ui/StarRating';
import { getPlanById } from '@/data/services';

// TODO: Replace with actual plan images when available
const getPlanIcon = (imageKey: string): keyof typeof Ionicons.glyphMap => {
  const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
    one_month: 'calendar',
    six_month: 'calendar',
    twelve_month: 'calendar',
    ask_carebow: 'heart',
  };
  return iconMap[imageKey] || 'card';
};

const getPlanColor = (planId: string): string => {
  const colorMap: Record<string, string> = {
    monthly: '#3B82F6',
    half_yearly: '#8B5CF6',
    yearly: '#EC4899',
    ask_carebow: '#9333EA',
  };
  return colorMap[planId] || '#6B7280';
};

export default function PlanDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const plan = getPlanById(id || '');

  if (!plan) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Plan not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const icon = getPlanIcon(plan.image);
  const color = getPlanColor(plan.id);
  const isAskCareBow = plan.id === 'ask_carebow';

  const handleSubscribe = () => {
    if (isAskCareBow) {
      // Navigate to Ask CareBow paywall or feature
      router.push('/ask');
    } else {
      // TODO: Navigate to payment/subscription flow
      console.log('Subscribe to:', plan.id);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Plan Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 100 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={[styles.heroContainer, { backgroundColor: color }]}>
          <Ionicons name={icon} size={64} color="#FFFFFF" />
          <Text style={styles.periodLabel}>{plan.periodLabel}</Text>
        </View>

        {/* Plan Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.planTitle}>{plan.title}</Text>
          <View style={styles.ratingRow}>
            <StarRating rating={plan.rating} size={16} />
            <Text style={styles.ratingText}>{plan.rating.toFixed(1)}</Text>
          </View>

          {plan.price !== null ? (
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.priceValue}>
                <Text style={styles.currency}>$</Text>
                {plan.price}
              </Text>
              <Text style={styles.priceNote}>
                {plan.id === 'monthly'
                  ? 'per month'
                  : plan.id === 'half_yearly'
                  ? 'for 6 months'
                  : 'for 12 months'}
              </Text>
            </View>
          ) : (
            <View style={styles.priceContainer}>
              <Text style={styles.aiAccessLabel}>AI-Powered Health Assistant</Text>
            </View>
          )}
        </View>

        {/* Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plan Benefits</Text>
          <View style={styles.benefitsList}>
            {plan.benefits?.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <View style={[styles.benefitIcon, { backgroundColor: color }]}>
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </View>
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Additional Info */}
        {!isAskCareBow && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subscription Terms</Text>
            <View style={styles.termsCard}>
              <View style={styles.termRow}>
                <Text style={styles.termLabel}>Billing</Text>
                <Text style={styles.termValue}>
                  {plan.id === 'monthly'
                    ? 'Monthly'
                    : plan.id === 'half_yearly'
                    ? 'Every 6 months'
                    : 'Annually'}
                </Text>
              </View>
              <View style={styles.termRow}>
                <Text style={styles.termLabel}>Auto-renewal</Text>
                <Text style={styles.termValue}>Yes</Text>
              </View>
              <View style={styles.termRow}>
                <Text style={styles.termLabel}>Cancel anytime</Text>
                <Text style={styles.termValue}>Yes</Text>
              </View>
            </View>
          </View>
        )}

        {isAskCareBow && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How It Works</Text>
            <View style={styles.howItWorksCard}>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Describe your symptoms</Text>
                  <Text style={styles.stepDescription}>
                    Tell CareBow what you're experiencing in your own words.
                  </Text>
                </View>
              </View>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Get AI guidance</Text>
                  <Text style={styles.stepDescription}>
                    Receive personalized health insights and recommendations.
                  </Text>
                </View>
              </View>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Take action</Text>
                  <Text style={styles.stepDescription}>
                    Book services or consult professionals based on your needs.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Subscribe Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.subscribeButton, { backgroundColor: color }]}
          onPress={handleSubscribe}
        >
          <Text style={styles.subscribeButtonText}>
            {isAskCareBow ? 'Unlock Ask CareBow' : 'Subscribe Now'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#000000',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  backLink: {
    color: '#9333EA',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  heroContainer: {
    height: 180,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  periodLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
    opacity: 0.9,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  planTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
  },
  priceContainer: {
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: '#A0A0A0',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  currency: {
    fontSize: 24,
    fontWeight: '500',
  },
  priceNote: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  aiAccessLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9333EA',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitText: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
  },
  termsCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  termRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  termLabel: {
    fontSize: 14,
    color: '#A0A0A0',
  },
  termValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  howItWorksCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    gap: 20,
  },
  stepItem: {
    flexDirection: 'row',
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#9333EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 13,
    color: '#A0A0A0',
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#1C1C1E',
  },
  subscribeButton: {
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
