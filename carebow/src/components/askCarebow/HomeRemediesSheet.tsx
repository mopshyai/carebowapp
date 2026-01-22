/**
 * HomeRemediesSheet Component
 * Bottom sheet with personalized home remedies checklist based on symptoms
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../../theme';

// ============================================
// TYPES
// ============================================

interface HomeRemedy {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'hydration' | 'rest' | 'nutrition' | 'medication' | 'monitoring' | 'comfort';
}

interface HomeRemediesSheetProps {
  visible: boolean;
  onClose: () => void;
  symptoms?: string[];
  triageLevel?: 'low' | 'moderate' | 'high' | 'emergency';
}

// ============================================
// REMEDY DATABASE
// ============================================

const remedyCategories = {
  hydration: { label: 'Hydration', icon: 'water', color: '#3B82F6' },
  rest: { label: 'Rest & Recovery', icon: 'bed', color: '#8B5CF6' },
  nutrition: { label: 'Nutrition', icon: 'nutrition', color: '#10B981' },
  medication: { label: 'Over-the-counter', icon: 'medical', color: '#F59E0B' },
  monitoring: { label: 'Self-Monitoring', icon: 'pulse', color: '#EF4444' },
  comfort: { label: 'Comfort Measures', icon: 'happy', color: '#EC4899' },
};

const commonRemedies: HomeRemedy[] = [
  {
    id: 'water',
    title: 'Stay Hydrated',
    description: 'Drink 8-10 glasses of water throughout the day. Clear fluids help flush out toxins.',
    icon: 'water',
    category: 'hydration',
  },
  {
    id: 'rest',
    title: 'Get Adequate Rest',
    description: 'Aim for 7-9 hours of sleep. Your body heals best during rest.',
    icon: 'bed',
    category: 'rest',
  },
  {
    id: 'nutrition',
    title: 'Eat Light, Nutritious Meals',
    description: 'Focus on soups, fruits, and vegetables. Avoid heavy or spicy foods.',
    icon: 'leaf',
    category: 'nutrition',
  },
  {
    id: 'monitor',
    title: 'Monitor Your Symptoms',
    description: 'Keep track of any changes. Note timing, severity, and triggers.',
    icon: 'clipboard',
    category: 'monitoring',
  },
];

const symptomSpecificRemedies: Record<string, HomeRemedy[]> = {
  fever: [
    {
      id: 'fever-1',
      title: 'Cool Compress',
      description: 'Apply a cool, damp cloth to forehead and wrists to help reduce temperature.',
      icon: 'snow',
      category: 'comfort',
    },
    {
      id: 'fever-2',
      title: 'Light Clothing',
      description: 'Wear loose, breathable clothing. Avoid bundling up.',
      icon: 'shirt',
      category: 'comfort',
    },
    {
      id: 'fever-3',
      title: 'Acetaminophen or Ibuprofen',
      description: 'Take as directed on package. Do not exceed recommended dose.',
      icon: 'medical',
      category: 'medication',
    },
  ],
  headache: [
    {
      id: 'headache-1',
      title: 'Rest in a Dark Room',
      description: 'Dim lights and reduce screen time to ease eye strain.',
      icon: 'moon',
      category: 'rest',
    },
    {
      id: 'headache-2',
      title: 'Apply Cold or Warm Compress',
      description: 'Try both to see which provides more relief for you.',
      icon: 'thermometer',
      category: 'comfort',
    },
    {
      id: 'headache-3',
      title: 'Caffeine (in moderation)',
      description: 'A small amount of caffeine may help. Avoid if sensitive.',
      icon: 'cafe',
      category: 'nutrition',
    },
  ],
  cough: [
    {
      id: 'cough-1',
      title: 'Honey and Warm Water',
      description: 'Mix 1-2 tsp honey in warm water or tea. Soothes throat irritation.',
      icon: 'flask',
      category: 'nutrition',
    },
    {
      id: 'cough-2',
      title: 'Steam Inhalation',
      description: 'Breathe in steam from hot water (carefully) to loosen mucus.',
      icon: 'cloud',
      category: 'comfort',
    },
    {
      id: 'cough-3',
      title: 'Elevate Your Head',
      description: 'Use extra pillows when sleeping to reduce nighttime coughing.',
      icon: 'bed',
      category: 'rest',
    },
  ],
  'sore throat': [
    {
      id: 'throat-1',
      title: 'Salt Water Gargle',
      description: 'Gargle with 1/4 tsp salt in warm water several times daily.',
      icon: 'water',
      category: 'hydration',
    },
    {
      id: 'throat-2',
      title: 'Warm Liquids',
      description: 'Drink warm tea, broth, or soup to soothe irritation.',
      icon: 'cafe',
      category: 'hydration',
    },
    {
      id: 'throat-3',
      title: 'Throat Lozenges',
      description: 'Use sugar-free lozenges to keep throat moist.',
      icon: 'ellipse',
      category: 'medication',
    },
  ],
  'body aches': [
    {
      id: 'ache-1',
      title: 'Gentle Stretching',
      description: 'Light stretches can help relieve muscle tension.',
      icon: 'body',
      category: 'rest',
    },
    {
      id: 'ache-2',
      title: 'Warm Bath or Shower',
      description: 'Warm water relaxes muscles and improves circulation.',
      icon: 'water',
      category: 'comfort',
    },
    {
      id: 'ache-3',
      title: 'Anti-inflammatory',
      description: 'Ibuprofen can help reduce inflammation and pain.',
      icon: 'medical',
      category: 'medication',
    },
  ],
  fatigue: [
    {
      id: 'fatigue-1',
      title: 'Short Rest Periods',
      description: 'Take 20-30 minute power naps. Avoid sleeping too long during day.',
      icon: 'time',
      category: 'rest',
    },
    {
      id: 'fatigue-2',
      title: 'Balanced Meals',
      description: 'Eat regular, balanced meals to maintain energy levels.',
      icon: 'restaurant',
      category: 'nutrition',
    },
    {
      id: 'fatigue-3',
      title: 'Light Activity',
      description: 'Short walks can boost energy when appropriate.',
      icon: 'walk',
      category: 'rest',
    },
  ],
  nausea: [
    {
      id: 'nausea-1',
      title: 'Ginger',
      description: 'Try ginger tea, ginger ale, or ginger candies.',
      icon: 'leaf',
      category: 'nutrition',
    },
    {
      id: 'nausea-2',
      title: 'Small, Bland Meals',
      description: 'Eat crackers, toast, or rice in small amounts.',
      icon: 'restaurant',
      category: 'nutrition',
    },
    {
      id: 'nausea-3',
      title: 'Fresh Air',
      description: 'Step outside or open windows for fresh air circulation.',
      icon: 'sunny',
      category: 'comfort',
    },
  ],
};

// ============================================
// COMPONENT
// ============================================

export function HomeRemediesSheet({
  visible,
  onClose,
  symptoms = [],
  triageLevel = 'low',
}: HomeRemediesSheetProps) {
  const insets = useSafeAreaInsets();
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  // Build remedies list based on symptoms
  const getRemedies = useCallback((): HomeRemedy[] => {
    const remedies: HomeRemedy[] = [...commonRemedies];
    const addedIds = new Set(commonRemedies.map((r) => r.id));

    // Add symptom-specific remedies
    symptoms.forEach((symptom) => {
      const normalizedSymptom = symptom.toLowerCase();
      Object.entries(symptomSpecificRemedies).forEach(([key, items]) => {
        if (normalizedSymptom.includes(key)) {
          items.forEach((remedy) => {
            if (!addedIds.has(remedy.id)) {
              remedies.push(remedy);
              addedIds.add(remedy.id);
            }
          });
        }
      });
    });

    return remedies;
  }, [symptoms]);

  const remedies = getRemedies();

  const toggleItem = (id: string) => {
    setCheckedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleShare = async () => {
    const checkedRemedies = remedies.filter((r) => checkedItems.has(r.id));
    const remedyList = checkedRemedies.length > 0 ? checkedRemedies : remedies;

    const message = `My Home Care Checklist\n\n${remedyList
      .map((r, i) => `${i + 1}. ${r.title}\n   ${r.description}`)
      .join('\n\n')}\n\nGenerated by CareBow`;

    try {
      await Share.share({
        message,
        title: 'Home Care Checklist',
      });
    } catch {
      Alert.alert('Unable to Share', 'There was an error sharing your checklist.');
    }
  };

  const progressPercentage = remedies.length > 0
    ? Math.round((checkedItems.size / remedies.length) * 100)
    : 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <Icon name="list" size={24} color={colors.accent} />
              </View>
              <View>
                <Text style={styles.title}>Home Care Checklist</Text>
                <Text style={styles.subtitle}>
                  {checkedItems.size} of {remedies.length} completed
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShare}
              accessibilityLabel="Share checklist"
              accessibilityRole="button"
            >
              <Icon name="share-outline" size={20} color={colors.accent} />
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${progressPercentage}%` }]}
              />
            </View>
            <Text style={styles.progressText}>{progressPercentage}%</Text>
          </View>

          {/* Disclaimer */}
          <View style={styles.disclaimer}>
            <Icon name="information-circle" size={16} color={colors.textTertiary} />
            <Text style={styles.disclaimerText}>
              These are general suggestions. Always consult a healthcare provider for persistent or severe symptoms.
            </Text>
          </View>

          {/* Remedies List */}
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {remedies.map((remedy) => {
              const isChecked = checkedItems.has(remedy.id);
              const categoryInfo = remedyCategories[remedy.category];

              return (
                <TouchableOpacity
                  key={remedy.id}
                  style={[styles.remedyItem, isChecked && styles.remedyItemChecked]}
                  onPress={() => toggleItem(remedy.id)}
                  activeOpacity={0.7}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isChecked }}
                  accessibilityLabel={`${remedy.title}. ${remedy.description}`}
                >
                  {/* Checkbox */}
                  <View
                    style={[
                      styles.checkbox,
                      isChecked && styles.checkboxChecked,
                    ]}
                  >
                    {isChecked && (
                      <Icon name="checkmark" size={14} color={colors.textInverse} />
                    )}
                  </View>

                  {/* Content */}
                  <View style={styles.remedyContent}>
                    <View style={styles.remedyHeader}>
                      <Text
                        style={[
                          styles.remedyTitle,
                          isChecked && styles.remedyTitleChecked,
                        ]}
                      >
                        {remedy.title}
                      </Text>
                      <View
                        style={[
                          styles.categoryBadge,
                          { backgroundColor: categoryInfo.color + '20' },
                        ]}
                      >
                        <Icon
                          name={categoryInfo.icon}
                          size={10}
                          color={categoryInfo.color}
                        />
                        <Text
                          style={[styles.categoryText, { color: categoryInfo.color }]}
                        >
                          {categoryInfo.label}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.remedyDescription,
                        isChecked && styles.remedyDescriptionChecked,
                      ]}
                    >
                      {remedy.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.closeButtonText}>Done</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '85%',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.accentMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.accentMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surface2,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 3,
  },
  progressText: {
    ...typography.caption,
    color: colors.textTertiary,
    width: 36,
    textAlign: 'right',
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  disclaimerText: {
    ...typography.caption,
    color: colors.textTertiary,
    flex: 1,
    lineHeight: 18,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.md,
  },
  remedyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  remedyItemChecked: {
    backgroundColor: colors.successSoft || '#F0FDF4',
    borderColor: colors.success,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  remedyContent: {
    flex: 1,
  },
  remedyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xxs,
  },
  remedyTitle: {
    ...typography.label,
    color: colors.textPrimary,
    flex: 1,
  },
  remedyTitleChecked: {
    textDecorationLine: 'line-through',
    color: colors.textTertiary,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginLeft: spacing.xs,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: '600',
  },
  remedyDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  remedyDescriptionChecked: {
    color: colors.textTertiary,
  },
  closeButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
    ...shadows.button,
  },
  closeButtonText: {
    ...typography.labelLarge,
    color: colors.textInverse,
  },
});

export default HomeRemediesSheet;
