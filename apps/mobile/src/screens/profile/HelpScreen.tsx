/**
 * Help & Support Screen
 * FAQ and contact options
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Linking,
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
      'Browse our services from the Home tab, select a service, choose your preferred time and date, and complete the checkout. You can pay online or upon service delivery.',
  },
  {
    id: '2',
    question: 'How does Ask CareBow work?',
    answer:
      'Ask CareBow is your AI health assistant. Describe your symptoms and it will help assess the situation and recommend appropriate care options. Note: It provides guidance only and is not a substitute for professional medical advice.',
  },
  {
    id: '3',
    question: 'Can I cancel or reschedule a booking?',
    answer:
      'Yes, you can cancel or reschedule from your Orders page up to 24 hours before the scheduled time for a full refund. Changes within 24 hours may be subject to a fee.',
  },
  {
    id: '4',
    question: 'How do I add family members?',
    answer:
      'Go to Profile > Family Members and tap the + button to add a new member. You can add their health information to help us provide better care recommendations.',
  },
  {
    id: '5',
    question: 'Is my health information secure?',
    answer:
      'Yes, we use industry-standard encryption and follow HIPAA guidelines to protect your health information. You can review our privacy practices in Profile > Privacy & Security.',
  },
  {
    id: '6',
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards, debit cards, and Apple Pay. Some services also allow cash payment upon delivery.',
  },
  {
    id: '7',
    question: 'How do I contact a care provider?',
    answer:
      'Once your service is confirmed, you can message your assigned care provider through the Messages tab. Contact details are also available in your order details.',
  },
];

const CONTACT_OPTIONS = [
  {
    id: 'chat',
    icon: 'chatbubble-ellipses',
    title: 'Live Chat',
    subtitle: 'Chat with our support team',
    action: 'chat',
  },
  {
    id: 'email',
    icon: 'mail',
    title: 'Email Support',
    subtitle: 'support@carebow.com',
    action: 'mailto:support@carebow.com',
  },
  {
    id: 'phone',
    icon: 'call',
    title: 'Phone Support',
    subtitle: '1-800-CAREBOW (Available 24/7)',
    action: 'tel:1-800-227-3269',
  },
];

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const handleContact = async (action: string) => {
    if (action === 'chat') {
      // Would open chat interface
      return;
    }
    await Linking.openURL(action);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 32 + insets.bottom }]}
      >
        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactGrid}>
            {CONTACT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.contactCard}
                onPress={() => handleContact(option.action)}
              >
                <View style={styles.contactIcon}>
                  <Icon name={option.icon as any} size={24} color={colors.accent} />
                </View>
                <Text style={styles.contactTitle}>{option.title}</Text>
                <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqList}>
            {FAQ_ITEMS.map((item, index) => (
              <Pressable
                key={item.id}
                style={[
                  styles.faqItem,
                  index < FAQ_ITEMS.length - 1 && styles.faqItemBorder,
                ]}
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
                {expandedFaq === item.id && (
                  <Text style={styles.faqAnswer}>{item.answer}</Text>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Additional Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>
          <View style={styles.resourceList}>
            <TouchableOpacity style={styles.resourceItem}>
              <View style={styles.resourceIcon}>
                <Icon name="book-outline" size={20} color={colors.accent} />
              </View>
              <View style={styles.resourceInfo}>
                <Text style={styles.resourceTitle}>User Guide</Text>
                <Text style={styles.resourceSubtitle}>Learn how to use CareBow</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.resourceItem}>
              <View style={styles.resourceIcon}>
                <Icon name="play-circle-outline" size={20} color={colors.accent} />
              </View>
              <View style={styles.resourceInfo}>
                <Text style={styles.resourceTitle}>Video Tutorials</Text>
                <Text style={styles.resourceSubtitle}>Step-by-step guides</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.resourceItem}>
              <View style={styles.resourceIcon}>
                <Icon name="newspaper-outline" size={20} color={colors.accent} />
              </View>
              <View style={styles.resourceInfo}>
                <Text style={styles.resourceTitle}>Health Blog</Text>
                <Text style={styles.resourceSubtitle}>Tips and health information</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>CareBow v1.0.0</Text>
          <Text style={styles.appCopyright}>2024 CareBow Healthcare</Text>
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
    ...typography.h4,
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
  contactGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  contactCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.card,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accentMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  contactTitle: {
    ...typography.label,
    textAlign: 'center',
    marginBottom: 2,
  },
  contactSubtitle: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
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
