/**
 * EnhancedGuidanceDisplay Component
 * Main component that displays comprehensive health guidance
 * combining home remedies, Ayurvedic, OTC, and services
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../../theme';
import { HomeRemedyCard, HomeRemedyData } from './HomeRemedyCard';
import { AyurvedicRecommendationCard, AyurvedicFormulationData } from './AyurvedicRecommendationCard';
import { OTCSuggestionCard, OTCMedicationData } from './OTCSuggestionCard';
import { CarePathwayList, ServiceRecommendationData } from './CarePathwayCard';
import { UrgencyLevel, urgencyConfig } from '../../types/askCarebow';

type TabType = 'remedies' | 'ayurvedic' | 'otc' | 'services';

export interface EnhancedGuidanceData {
  summary: string;
  triageLevel: UrgencyLevel;
  homeRemedies?: HomeRemedyData[];
  ayurvedicRecommendations?: AyurvedicFormulationData[];
  otcSuggestions?: OTCMedicationData[];
  serviceRecommendations?: ServiceRecommendationData[];
  warningSignsToWatch?: string[];
  followUp?: {
    timing: string;
    checkpoints: string[];
  };
  disclaimer?: string;
}

interface EnhancedGuidanceDisplayProps {
  guidance: EnhancedGuidanceData;
  onBookService?: (service: ServiceRecommendationData) => void;
  defaultTab?: TabType;
}

const tabConfig: { key: TabType; label: string; icon: string }[] = [
  { key: 'remedies', label: 'Home', icon: 'leaf' },
  { key: 'ayurvedic', label: 'Ayurveda', icon: 'flower' },
  { key: 'otc', label: 'OTC', icon: 'medical' },
  { key: 'services', label: 'Services', icon: 'storefront' },
];

export function EnhancedGuidanceDisplay({
  guidance,
  onBookService,
  defaultTab = 'remedies',
}: EnhancedGuidanceDisplayProps) {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  const urgency = urgencyConfig[guidance.triageLevel];

  // Filter out tabs with no content
  const availableTabs = tabConfig.filter((tab) => {
    switch (tab.key) {
      case 'remedies':
        return guidance.homeRemedies && guidance.homeRemedies.length > 0;
      case 'ayurvedic':
        return guidance.ayurvedicRecommendations && guidance.ayurvedicRecommendations.length > 0;
      case 'otc':
        return guidance.otcSuggestions && guidance.otcSuggestions.length > 0;
      case 'services':
        return guidance.serviceRecommendations && guidance.serviceRecommendations.length > 0;
      default:
        return false;
    }
  });

  // Set active tab to first available if current is not available
  React.useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.find((t) => t.key === activeTab)) {
      setActiveTab(availableTabs[0].key);
    }
  }, [availableTabs, activeTab]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'remedies':
        return (
          <View>
            <Text style={styles.sectionDescription}>
              Try these traditional home remedies (Gharelu Nuskhe) for natural relief
            </Text>
            {guidance.homeRemedies?.map((remedy, index) => (
              <HomeRemedyCard key={`remedy-${index}`} remedy={remedy} isExpanded={index === 0} />
            ))}
          </View>
        );

      case 'ayurvedic':
        return (
          <View>
            <Text style={styles.sectionDescription}>
              Ayurvedic formulations that may help with your condition
            </Text>
            {guidance.ayurvedicRecommendations?.map((formulation, index) => (
              <AyurvedicRecommendationCard
                key={`ayurveda-${index}`}
                formulation={formulation}
                isExpanded={index === 0}
              />
            ))}
          </View>
        );

      case 'otc':
        return (
          <View>
            <Text style={styles.sectionDescription}>
              Over-the-counter medications available at your local pharmacy
            </Text>
            {guidance.otcSuggestions?.map((med, index) => (
              <OTCSuggestionCard
                key={`otc-${index}`}
                medication={med}
                priority={index === 0 ? 'primary' : 'alternative'}
                isExpanded={index === 0}
              />
            ))}
          </View>
        );

      case 'services':
        return (
          <CarePathwayList
            services={guidance.serviceRecommendations || []}
            onBookService={onBookService}
          />
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Urgency Header */}
      <View style={[styles.urgencyHeader, { backgroundColor: urgency.bgColor }]}>
        <View style={styles.urgencyRow}>
          <View style={[styles.urgencyIcon, { backgroundColor: urgency.color }]}>
            <Icon name="pulse" size={18} color={colors.white} />
          </View>
          <View style={styles.urgencyContent}>
            <Text style={[styles.urgencyLabel, { color: urgency.color }]}>{urgency.label}</Text>
            <Text style={styles.urgencyAction}>{urgency.action}</Text>
          </View>
        </View>
      </View>

      {/* Summary */}
      <View style={styles.summarySection}>
        <Text style={styles.summary}>{guidance.summary}</Text>
      </View>

      {/* Tab Navigation */}
      {availableTabs.length > 1 && (
        <View style={styles.tabContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tabRow}>
              {availableTabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[styles.tab, isActive && styles.activeTab]}
                    onPress={() => setActiveTab(tab.key)}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name={tab.icon}
                      size={18}
                      color={isActive ? colors.accent : colors.textTertiary}
                    />
                    <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Tab Content */}
      <View style={styles.contentSection}>{renderTabContent()}</View>

      {/* Warning Signs */}
      {guidance.warningSignsToWatch && guidance.warningSignsToWatch.length > 0 && (
        <View style={styles.warningSection}>
          <View style={styles.warningSectionHeader}>
            <Icon name="alert-circle" size={20} color={colors.warning} />
            <Text style={styles.warningTitle}>Watch for these warning signs</Text>
          </View>
          {guidance.warningSignsToWatch.map((sign, index) => (
            <View key={index} style={styles.warningItem}>
              <View style={styles.warningDot} />
              <Text style={styles.warningText}>{sign}</Text>
            </View>
          ))}
          <Text style={styles.warningFooter}>
            If any of these occur, seek medical attention promptly
          </Text>
        </View>
      )}

      {/* Follow-up Section */}
      {guidance.followUp && (
        <View style={styles.followUpSection}>
          <View style={styles.followUpHeader}>
            <Icon name="calendar" size={18} color={colors.info} />
            <Text style={styles.followUpTitle}>Follow-up</Text>
          </View>
          <Text style={styles.followUpTiming}>{guidance.followUp.timing}</Text>
          {guidance.followUp.checkpoints.map((checkpoint, index) => (
            <View key={index} style={styles.checkpointItem}>
              <Icon name="checkmark-circle-outline" size={16} color={colors.accent} />
              <Text style={styles.checkpointText}>{checkpoint}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Icon name="information-circle" size={16} color={colors.textTertiary} />
        <Text style={styles.disclaimerText}>
          {guidance.disclaimer ||
            'This is general guidance only, not a diagnosis. Please consult a healthcare provider for medical advice.'}
        </Text>
      </View>
    </View>
  );
}

/**
 * QuickGuidanceCard Component
 * Compact version for displaying brief guidance inline
 */
interface QuickGuidanceCardProps {
  title: string;
  description: string;
  icon?: string;
  onViewMore?: () => void;
}

export function QuickGuidanceCard({
  title,
  description,
  icon = 'bulb',
  onViewMore,
}: QuickGuidanceCardProps) {
  return (
    <TouchableOpacity
      style={styles.quickCard}
      onPress={onViewMore}
      activeOpacity={onViewMore ? 0.7 : 1}
    >
      <View style={styles.quickIconContainer}>
        <Icon name={icon} size={20} color={colors.accent} />
      </View>
      <View style={styles.quickContent}>
        <Text style={styles.quickTitle}>{title}</Text>
        <Text style={styles.quickDescription} numberOfLines={2}>
          {description}
        </Text>
      </View>
      {onViewMore && <Icon name="chevron-forward" size={20} color={colors.textTertiary} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.card,
  },
  urgencyHeader: {
    padding: spacing.md,
  },
  urgencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  urgencyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  urgencyContent: {
    flex: 1,
  },
  urgencyLabel: {
    ...typography.h4,
  },
  urgencyAction: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  summarySection: {
    padding: spacing.md,
    paddingTop: 0,
  },
  summary: {
    ...typography.body,
    color: colors.textPrimary,
  },
  tabContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginRight: spacing.xxs,
    borderRadius: radius.full,
    gap: spacing.xxs,
  },
  activeTab: {
    backgroundColor: colors.accentSoft,
  },
  tabLabel: {
    ...typography.labelSmall,
    color: colors.textTertiary,
  },
  activeTabLabel: {
    color: colors.accent,
  },
  contentSection: {
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
  sectionDescription: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },
  warningSection: {
    margin: spacing.md,
    marginTop: 0,
    backgroundColor: colors.warningSoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  warningSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  warningTitle: {
    ...typography.label,
    color: colors.warning,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
    paddingLeft: spacing.lg,
  },
  warningDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.warning,
    marginTop: 6,
    marginRight: spacing.xs,
  },
  warningText: {
    ...typography.bodySmall,
    color: colors.warning,
    flex: 1,
  },
  warningFooter: {
    ...typography.caption,
    color: colors.warning,
    fontStyle: 'italic',
    marginTop: spacing.xs,
    paddingLeft: spacing.lg,
  },
  followUpSection: {
    margin: spacing.md,
    marginTop: 0,
    backgroundColor: colors.infoSoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  followUpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  followUpTitle: {
    ...typography.label,
    color: colors.info,
  },
  followUpTiming: {
    ...typography.bodySmall,
    color: colors.info,
    marginBottom: spacing.sm,
    paddingLeft: spacing.lg,
  },
  checkpointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xxs,
    paddingLeft: spacing.lg,
    gap: spacing.xs,
  },
  checkpointText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: spacing.xs,
  },
  disclaimerText: {
    ...typography.caption,
    color: colors.textTertiary,
    flex: 1,
  },
  // Quick card styles
  quickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadows.card,
  },
  quickIconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  quickContent: {
    flex: 1,
  },
  quickTitle: {
    ...typography.label,
    color: colors.textPrimary,
  },
  quickDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
