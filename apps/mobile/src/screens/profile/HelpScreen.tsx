/**
 * Help & Support Screen
 * Evidence-bounded FAQs and support status
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../../theme';

const FAQ_ITEMS = [
  {
    id: '1',
    question: 'How do I book a service?',
    answer:
      'Browse services from the Home tab, select a service, choose the available date and time options, and follow the checkout flow. The checkout shows the options currently available for that order.',
  },
  {
    id: '2',
    question: 'How does Ask CareBow work?',
    answer:
      'Ask CareBow provides health guidance and care-routing support from the information you share. It is not a diagnosis, a replacement for a clinician, or an emergency service.',
  },
  {
    id: '3',
    question: 'Can I cancel or reschedule a booking?',
    answer:
      'Available cancellation and rescheduling actions depend on the service and current booking status. Use Orders to see the actions CareBow currently supports. Refund eligibility is shown only when it is confirmed by the applicable booking and payment flow.',
  },
  {
    id: '4',
    question: 'How do I add family members?',
    answer:
      'Go to Profile > Family Members and tap the + button to add a member. You can add health information that is relevant to managing their care.',
  },
  {
    id: '5',
    question: 'How is my health information protected?',
    answer:
      'CareBow uses security and privacy controls to protect account and health information. Review Profile > Privacy & Security for the controls available in this build. Regulatory or compliance claims are made only when they have been formally verified.',
  },
  {
    id: '6',
    question: 'What payment methods do you accept?',
    answer:
      'The secure checkout shows the payment methods currently available for the order, region, and payment processor. CareBow does not promise a payment method that is not shown in checkout.',
  },
  {
    id: '7',
    question: 'How do I contact a care provider?',
    answer:
      'When a provider is assigned, use the order or request details for the contact actions CareBow currently exposes. The Messages tab shows only real conversations and does not create a provider chat by itself.',
  },
];

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const scrollViewRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const faqSectionY = useRef(0);

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 32 + insets.bottom }]}
      >
        {/* Support status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.supportCard}>
            <View style={styles.supportIcon}>
              <Icon name="information-circle-outline" size={24} color={colors.accent} />
            </View>
            <View style={styles.supportContent}>
              <Text style={styles.supportTitle}>Verified support channels are being configured</Text>
              <Text style={styles.supportText}>
                This build does not claim live chat, 24/7 phone support, or a guaranteed support
                mailbox until those channels are activated and tested. For urgent medical needs,
                use the appropriate local emergency service.
              </Text>
            </View>
          </View>
        </View>

        {/* FAQ Section */}
        <View
          style={styles.section}
          onLayout={(e) => {
            faqSectionY.current = e.nativeEvent.layout.y;
          }}
        >
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqList}>
            {FAQ_ITEMS.map((item, index) => (
              <Pressable
                key={item.id}
                style={[styles.faqItem, index < FAQ_ITEMS.length - 1 && styles.faqItemBorder]}
                onPress={() => toggleFaq(item.id)}
              >
                <View style={styles.faqQuestion}>
                  <Text style={styles.faqQuestionText}>{item.question}</Text>
                  <Icon
                    name={expandedFaq === item.id ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.textTertiary}
                  />
                </View>
                {expandedFaq === item.id && <Text style={styles.faqAnswer}>{item.answer}</Text>}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Additional Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>
          <View style={styles.resourceList}>
            <TouchableOpacity
              style={styles.resourceItem}
              onPress={() => scrollViewRef.current?.scrollTo({ y: faqSectionY.current, animated: true })}
            >
              <View style={styles.resourceIcon}>
                <Icon name="book-outline" size={20} color={colors.accent} />
              </View>
              <View style={styles.resourceInfo}>
                <Text style={styles.resourceTitle}>User Guide</Text>
                <Text style={styles.resourceSubtitle}>Review the frequently asked questions</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>CareBow v1.0.0</Text>
          <Text style={styles.appCopyright}>© {new Date().getFullYear()} CareBow Healthcare</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.labelSmall,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xxs,
  },
  supportCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.card,
  },
  supportIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportContent: {
    flex: 1,
  },
  supportTitle: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  supportText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  faqList: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.card,
  },
  faqItem: {
    padding: spacing.md,
  },
  faqItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  faqQuestionText: {
    ...typography.label,
    flex: 1,
  },
  faqAnswer: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  resourceList: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.card,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  resourceIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.accentMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    ...typography.label,
    marginBottom: 2,
  },
  resourceSubtitle: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  appInfo: {
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  appVersion: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  appCopyright: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xxs,
  },
});
