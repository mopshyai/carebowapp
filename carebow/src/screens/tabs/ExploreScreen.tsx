/**
 * Explore Screen - Health Tips & Resources
 * Browse health articles, tips, and educational content
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Image,
  Dimensions,
  Linking,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { colors, spacing, radius, typography, shadows } from '@/theme';
import { useTheme } from '@/providers/ThemeProvider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================
// TYPES
// ============================================

type ContentCategory =
  | 'all'
  | 'elder_care'
  | 'nutrition'
  | 'mental_health'
  | 'exercise'
  | 'safety'
  | 'medications';

interface HealthArticle {
  id: string;
  title: string;
  description: string;
  category: ContentCategory;
  readTime: string;
  imageUrl?: string;
  icon: string;
  tags: string[];
  isFeatured?: boolean;
}

interface QuickTip {
  id: string;
  title: string;
  tip: string;
  icon: string;
  color: string;
}

interface ResourceLink {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: string;
}

// ============================================
// MOCK DATA
// ============================================

const CATEGORIES: Array<{ id: ContentCategory; label: string; icon: string }> = [
  { id: 'all', label: 'All', icon: 'grid' },
  { id: 'elder_care', label: 'Elder Care', icon: 'heart' },
  { id: 'nutrition', label: 'Nutrition', icon: 'coffee' },
  { id: 'mental_health', label: 'Mental Health', icon: 'smile' },
  { id: 'exercise', label: 'Exercise', icon: 'activity' },
  { id: 'safety', label: 'Safety', icon: 'shield' },
  { id: 'medications', label: 'Medications', icon: 'package' },
];

const FEATURED_ARTICLES: HealthArticle[] = [
  {
    id: '1',
    title: 'Understanding Caregiver Burnout: Signs & Prevention',
    description: 'Learn to recognize the early signs of caregiver stress and discover effective strategies to maintain your well-being while caring for loved ones.',
    category: 'elder_care',
    readTime: '8 min read',
    icon: 'heart',
    tags: ['caregiver', 'stress', 'wellness'],
    isFeatured: true,
  },
  {
    id: '2',
    title: 'Nutrition Tips for Seniors: Building a Balanced Diet',
    description: 'Discover essential nutrition guidelines tailored for older adults, including meal planning tips and foods that support healthy aging.',
    category: 'nutrition',
    readTime: '6 min read',
    icon: 'coffee',
    tags: ['diet', 'seniors', 'health'],
    isFeatured: true,
  },
];

const HEALTH_ARTICLES: HealthArticle[] = [
  {
    id: '3',
    title: 'Fall Prevention at Home: A Complete Guide',
    description: 'Practical steps to make your home safer and reduce fall risks for elderly family members.',
    category: 'safety',
    readTime: '5 min read',
    icon: 'home',
    tags: ['safety', 'falls', 'home'],
  },
  {
    id: '4',
    title: 'Managing Multiple Medications Safely',
    description: 'Tips for organizing and tracking medications to ensure proper dosages and timing.',
    category: 'medications',
    readTime: '4 min read',
    icon: 'package',
    tags: ['medications', 'organization'],
  },
  {
    id: '5',
    title: 'Gentle Exercises for Seniors',
    description: 'Low-impact exercises that improve mobility, strength, and balance for older adults.',
    category: 'exercise',
    readTime: '7 min read',
    icon: 'activity',
    tags: ['exercise', 'mobility', 'seniors'],
  },
  {
    id: '6',
    title: 'Recognizing Signs of Depression in Elderly',
    description: 'Understanding the unique ways depression manifests in older adults and when to seek help.',
    category: 'mental_health',
    readTime: '6 min read',
    icon: 'smile',
    tags: ['mental health', 'depression', 'awareness'],
  },
  {
    id: '7',
    title: 'Healthy Snack Ideas for Seniors',
    description: 'Nutritious and easy-to-prepare snack options that support healthy aging.',
    category: 'nutrition',
    readTime: '3 min read',
    icon: 'coffee',
    tags: ['snacks', 'nutrition', 'easy'],
  },
  {
    id: '8',
    title: 'Creating a Safe Bathroom Environment',
    description: 'Essential modifications and aids to prevent accidents in the bathroom.',
    category: 'safety',
    readTime: '4 min read',
    icon: 'shield',
    tags: ['bathroom', 'safety', 'modifications'],
  },
];

const QUICK_TIPS: QuickTip[] = [
  {
    id: 't1',
    title: 'Stay Hydrated',
    tip: 'Seniors should drink at least 8 glasses of water daily. Set reminders to encourage regular hydration.',
    icon: 'droplet',
    color: '#3B82F6',
  },
  {
    id: 't2',
    title: 'Daily Movement',
    tip: 'Even 15 minutes of gentle stretching or walking can improve mobility and mood.',
    icon: 'activity',
    color: '#10B981',
  },
  {
    id: 't3',
    title: 'Social Connection',
    tip: 'Regular social interaction helps prevent loneliness and cognitive decline in seniors.',
    icon: 'users',
    color: '#8B5CF6',
  },
  {
    id: 't4',
    title: 'Medication Check',
    tip: "Review medications with a doctor every 6 months to ensure they're still necessary and safe.",
    icon: 'check-circle',
    color: '#F59E0B',
  },
];

const RESOURCE_LINKS: ResourceLink[] = [
  {
    id: 'r1',
    title: 'National Eldercare Locator',
    description: 'Find local services and support for older adults',
    url: 'https://eldercare.acl.gov',
    icon: 'map-pin',
  },
  {
    id: 'r2',
    title: 'Caregiver Action Network',
    description: 'Resources and support for family caregivers',
    url: 'https://caregiveraction.org',
    icon: 'heart',
  },
  {
    id: 'r3',
    title: 'Medicare.gov',
    description: 'Official Medicare information and enrollment',
    url: 'https://medicare.gov',
    icon: 'file-text',
  },
];

// ============================================
// COMPONENTS
// ============================================

function CategoryPill({
  category,
  isSelected,
  onPress,
  themeColors,
}: {
  category: { id: ContentCategory; label: string; icon: string };
  isSelected: boolean;
  onPress: () => void;
  themeColors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <TouchableOpacity
      style={[
        styles.categoryPill,
        { backgroundColor: themeColors.surface, borderColor: themeColors.border },
        isSelected && [styles.categoryPillSelected, { backgroundColor: themeColors.accent, borderColor: themeColors.accent }],
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Icon
        name={category.icon}
        size={16}
        color={isSelected ? '#FFF' : themeColors.textSecondary}
      />
      <Text style={[styles.categoryPillText, { color: themeColors.textSecondary }, isSelected && styles.categoryPillTextSelected]}>
        {category.label}
      </Text>
    </TouchableOpacity>
  );
}

function FeaturedArticleCard({ article, themeColors }: { article: HealthArticle; themeColors: ReturnType<typeof useTheme>['colors'] }) {
  return (
    <Pressable style={({ pressed }) => [styles.featuredCard, { backgroundColor: themeColors.surface }, pressed && styles.cardPressed]}>
      <View style={styles.featuredCardGradient}>
        <View style={styles.featuredBadge}>
          <Icon name="star" size={12} color="#F59E0B" />
          <Text style={styles.featuredBadgeText}>Featured</Text>
        </View>
        <View style={[styles.featuredIconContainer, { backgroundColor: `${themeColors.accent}15` }]}>
          <Icon name={article.icon} size={32} color={themeColors.accent} />
        </View>
        <Text style={[styles.featuredTitle, { color: themeColors.textPrimary }]} numberOfLines={2}>
          {article.title}
        </Text>
        <Text style={[styles.featuredDescription, { color: themeColors.textSecondary }]} numberOfLines={2}>
          {article.description}
        </Text>
        <View style={styles.featuredMeta}>
          <Icon name="clock" size={14} color={themeColors.textTertiary} />
          <Text style={[styles.featuredMetaText, { color: themeColors.textTertiary }]}>{article.readTime}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function ArticleCard({ article, themeColors }: { article: HealthArticle; themeColors: ReturnType<typeof useTheme>['colors'] }) {
  return (
    <Pressable style={({ pressed }) => [styles.articleCard, { backgroundColor: themeColors.surface, borderColor: themeColors.border }, pressed && styles.cardPressed]}>
      <View style={[styles.articleIcon, { backgroundColor: `${themeColors.accent}15` }]}>
        <Icon name={article.icon} size={24} color={themeColors.accent} />
      </View>
      <View style={styles.articleContent}>
        <Text style={[styles.articleTitle, { color: themeColors.textPrimary }]} numberOfLines={2}>
          {article.title}
        </Text>
        <Text style={[styles.articleDescription, { color: themeColors.textSecondary }]} numberOfLines={2}>
          {article.description}
        </Text>
        <View style={styles.articleMeta}>
          <View style={styles.articleTags}>
            {article.tags.slice(0, 2).map((tag, idx) => (
              <View key={idx} style={[styles.articleTag, { backgroundColor: themeColors.surface2 }]}>
                <Text style={[styles.articleTagText, { color: themeColors.textTertiary }]}>{tag}</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.articleReadTime, { color: themeColors.textTertiary }]}>{article.readTime}</Text>
        </View>
      </View>
      <Icon name="chevron-right" size={20} color={themeColors.textTertiary} />
    </Pressable>
  );
}

function QuickTipCard({ tip, themeColors }: { tip: QuickTip; themeColors: ReturnType<typeof useTheme>['colors'] }) {
  return (
    <View style={[styles.quickTipCard, { borderLeftColor: tip.color, backgroundColor: themeColors.surface }]}>
      <View style={[styles.quickTipIcon, { backgroundColor: `${tip.color}15` }]}>
        <Icon name={tip.icon} size={20} color={tip.color} />
      </View>
      <View style={styles.quickTipContent}>
        <Text style={[styles.quickTipTitle, { color: themeColors.textPrimary }]}>{tip.title}</Text>
        <Text style={[styles.quickTipText, { color: themeColors.textSecondary }]}>{tip.tip}</Text>
      </View>
    </View>
  );
}

function ResourceCard({ resource, themeColors }: { resource: ResourceLink; themeColors: ReturnType<typeof useTheme>['colors'] }) {
  const handlePress = () => {
    Linking.openURL(resource.url);
  };

  return (
    <TouchableOpacity style={[styles.resourceCard, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]} onPress={handlePress} activeOpacity={0.7}>
      <View style={[styles.resourceIcon, { backgroundColor: `${themeColors.accent}15` }]}>
        <Icon name={resource.icon} size={20} color={themeColors.accent} />
      </View>
      <View style={styles.resourceContent}>
        <Text style={[styles.resourceTitle, { color: themeColors.textPrimary }]}>{resource.title}</Text>
        <Text style={[styles.resourceDescription, { color: themeColors.textSecondary }]}>{resource.description}</Text>
      </View>
      <Icon name="external-link" size={18} color={themeColors.textTertiary} />
    </TouchableOpacity>
  );
}

function SectionHeader({ title, subtitle, themeColors }: { title: string; subtitle?: string; themeColors: ReturnType<typeof useTheme>['colors'] }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>{title}</Text>
      {subtitle && <Text style={[styles.sectionSubtitle, { color: themeColors.textTertiary }]}>{subtitle}</Text>}
    </View>
  );
}

// ============================================
// MAIN SCREEN
// ============================================

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { colors: themeColors } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<ContentCategory>('all');

  const filteredArticles = useMemo(() => {
    if (selectedCategory === 'all') return HEALTH_ARTICLES;
    return HEALTH_ARTICLES.filter((a) => a.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: 100 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>Explore</Text>
          <Text style={[styles.headerSubtitle, { color: themeColors.textSecondary }]}>Health tips & resources for caregivers</Text>
        </View>

        {/* Featured Section */}
        <SectionHeader title="Featured Articles" themeColors={themeColors} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredScroll}
          decelerationRate="fast"
          snapToInterval={SCREEN_WIDTH - 60}
        >
          {FEATURED_ARTICLES.map((article) => (
            <FeaturedArticleCard key={article.id} article={article} themeColors={themeColors} />
          ))}
        </ScrollView>

        {/* Quick Tips */}
        <SectionHeader title="Quick Tips" subtitle="Daily wellness reminders" themeColors={themeColors} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tipsScroll}
        >
          {QUICK_TIPS.map((tip) => (
            <QuickTipCard key={tip.id} tip={tip} themeColors={themeColors} />
          ))}
        </ScrollView>

        {/* Categories Filter */}
        <SectionHeader title="Browse by Topic" themeColors={themeColors} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {CATEGORIES.map((category) => (
            <CategoryPill
              key={category.id}
              category={category}
              isSelected={selectedCategory === category.id}
              onPress={() => setSelectedCategory(category.id)}
              themeColors={themeColors}
            />
          ))}
        </ScrollView>

        {/* Articles List */}
        <View style={styles.articlesList}>
          {filteredArticles.length > 0 ? (
            filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} themeColors={themeColors} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Icon name="file-text" size={48} color={themeColors.textTertiary} />
              <Text style={[styles.emptyStateText, { color: themeColors.textTertiary }]}>No articles in this category yet</Text>
            </View>
          )}
        </View>

        {/* External Resources */}
        <SectionHeader title="Helpful Resources" subtitle="Trusted external links" themeColors={themeColors} />
        <View style={styles.resourcesList}>
          {RESOURCE_LINKS.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} themeColors={themeColors} />
          ))}
        </View>

        {/* Disclaimer */}
        <View style={[styles.disclaimer, { backgroundColor: themeColors.surface2 }]}>
          <Icon name="info" size={16} color={themeColors.textTertiary} />
          <Text style={[styles.disclaimerText, { color: themeColors.textTertiary }]}>
            This content is for informational purposes only and should not replace professional medical advice.
          </Text>
        </View>
      </ScrollView>
    </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },

  // Header
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },

  // Section Header
  sectionHeader: {
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 2,
  },

  // Featured
  featuredScroll: {
    paddingRight: 20,
    gap: 16,
    marginBottom: 24,
  },
  featuredCard: {
    width: SCREEN_WIDTH - 80,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    ...shadows.cardElevated,
    overflow: 'hidden',
  },
  featuredCardGradient: {
    padding: 20,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  featuredBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
  },
  featuredIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: `${colors.accent}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    lineHeight: 24,
  },
  featuredDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featuredMetaText: {
    fontSize: 13,
    color: colors.textTertiary,
  },

  // Categories
  categoriesScroll: {
    gap: 10,
    marginBottom: 20,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryPillSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  categoryPillText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  categoryPillTextSelected: {
    color: '#FFF',
  },

  // Article Card
  articlesList: {
    gap: 12,
    marginBottom: 24,
  },
  articleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
  articleIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  articleContent: {
    flex: 1,
  },
  articleTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  articleDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  articleTags: {
    flexDirection: 'row',
    gap: 6,
  },
  articleTag: {
    backgroundColor: colors.surface2,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  articleTagText: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  articleReadTime: {
    fontSize: 12,
    color: colors.textTertiary,
  },

  // Quick Tips
  tipsScroll: {
    gap: 12,
    marginBottom: 24,
  },
  quickTipCard: {
    width: 280,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderLeftWidth: 4,
    ...shadows.card,
  },
  quickTipIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickTipContent: {
    flex: 1,
  },
  quickTipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  quickTipText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  // Resources
  resourcesList: {
    gap: 12,
    marginBottom: 24,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: `${colors.accent}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  resourceDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 12,
  },

  // Disclaimer
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 16,
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    marginTop: 8,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: colors.textTertiary,
    lineHeight: 18,
  },
});
