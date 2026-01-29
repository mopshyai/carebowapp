/**
 * Collapsible Section Component
 * Expandable section for response details in chat
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography } from '../../theme';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type CollapsibleSectionProps = {
  title: string;
  icon?: string;
  iconColor?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  badge?: string;
  badgeColor?: string;
};

export function CollapsibleSection({
  title,
  icon,
  iconColor = colors.accent,
  children,
  defaultExpanded = false,
  badge,
  badgeColor = colors.accent,
}: CollapsibleSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const rotateAnim = useRef(new Animated.Value(defaultExpanded ? 1 : 0)).current;

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    Animated.timing(rotateAnim, {
      toValue: expanded ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    setExpanded(!expanded);
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          {icon && (
            <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
              <Icon name={icon} size={14} color={iconColor} />
            </View>
          )}
          <Text style={styles.title}>{title}</Text>
          {badge && (
            <View style={[styles.badge, { backgroundColor: `${badgeColor}20` }]}>
              <Text style={[styles.badgeText, { color: badgeColor }]}>{badge}</Text>
            </View>
          )}
        </View>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Icon name="chevron-down" size={16} color={colors.textTertiary} />
        </Animated.View>
      </TouchableOpacity>

      {expanded && <View style={styles.content}>{children}</View>}
    </View>
  );
}

// Pre-styled section variations for common use cases
export function UnderstandingSection({ content }: { content: string }) {
  return (
    <CollapsibleSection
      title="What I understood"
      icon="checkmark-circle"
      iconColor={colors.accent}
      defaultExpanded={true}
    >
      <Text style={styles.contentText}>{content}</Text>
    </CollapsibleSection>
  );
}

type PossibilityItem = {
  name: string;
  uncertainty: 'LOW' | 'MED' | 'HIGH';
};

export function PossibilitiesSection({ items }: { items: PossibilityItem[] }) {
  const uncertaintyColors = {
    LOW: colors.success,
    MED: colors.warning,
    HIGH: colors.error,
  };

  return (
    <CollapsibleSection
      title="What this could be"
      icon="help-circle"
      iconColor={colors.info}
      badge={`${items.length} possibilities`}
    >
      <View style={styles.listContainer}>
        {items.map((item, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.listItemText}>{item.name}</Text>
            <View
              style={[
                styles.uncertaintyBadge,
                { backgroundColor: `${uncertaintyColors[item.uncertainty]}20` },
              ]}
            >
              <Text
                style={[
                  styles.uncertaintyText,
                  { color: uncertaintyColors[item.uncertainty] },
                ]}
              >
                {item.uncertainty}
              </Text>
            </View>
          </View>
        ))}
      </View>
      <Text style={styles.disclaimer}>
        These are possibilities, not diagnoses. A healthcare professional can provide accurate assessment.
      </Text>
    </CollapsibleSection>
  );
}

type TriageLevel = 'emergency' | 'urgent' | 'soon' | 'self_care';

export function SeriousnessSection({ level, description }: { level: TriageLevel; description: string }) {
  const levelConfig = {
    emergency: { color: colors.error, icon: 'alert-circle', label: 'Seek Emergency Care' },
    urgent: { color: colors.warning, icon: 'warning', label: 'See Doctor Today' },
    soon: { color: colors.info, icon: 'time', label: 'See Doctor Soon' },
    self_care: { color: colors.success, icon: 'home', label: 'Self-Care Appropriate' },
  };

  const config = levelConfig[level];

  return (
    <CollapsibleSection
      title="How serious it seems"
      icon="medical"
      iconColor={config.color}
      badge={config.label}
      badgeColor={config.color}
    >
      <View style={[styles.triageCard, { borderColor: config.color, backgroundColor: `${config.color}10` }]}>
        <Icon name={config.icon} size={20} color={config.color} />
        <View style={styles.triageContent}>
          <Text style={[styles.triageLevel, { color: config.color }]}>{config.label}</Text>
          <Text style={styles.triageDescription}>{description}</Text>
        </View>
      </View>
    </CollapsibleSection>
  );
}

export function SelfCareSection({ items }: { items: string[] }) {
  return (
    <CollapsibleSection
      title="What you can do now"
      icon="leaf"
      iconColor={colors.success}
    >
      <View style={styles.listContainer}>
        {items.map((item, index) => (
          <View key={index} style={styles.bulletItem}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>{item}</Text>
          </View>
        ))}
      </View>
    </CollapsibleSection>
  );
}

export function RedFlagsSection({ items }: { items: string[] }) {
  return (
    <CollapsibleSection
      title="Watch for these red flags"
      icon="warning"
      iconColor={colors.error}
    >
      <View style={[styles.redFlagsContainer]}>
        {items.map((item, index) => (
          <View key={index} style={styles.redFlagItem}>
            <Icon name="alert-circle" size={14} color={colors.error} />
            <Text style={styles.redFlagText}>{item}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.redFlagFooter}>
        If you notice any of these, seek medical care promptly.
      </Text>
    </CollapsibleSection>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: radius.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.labelSmall,
    color: colors.textPrimary,
  },
  badge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  badgeText: {
    ...typography.tiny,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.sm,
  },
  contentText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  listContainer: {
    gap: spacing.xs,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xxs,
  },
  listItemText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    flex: 1,
  },
  uncertaintyBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
    marginLeft: spacing.xs,
  },
  uncertaintyText: {
    ...typography.tiny,
    fontWeight: '600',
  },
  disclaimer: {
    ...typography.caption,
    color: colors.textTertiary,
    fontStyle: 'italic',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  triageCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    gap: spacing.sm,
  },
  triageContent: {
    flex: 1,
  },
  triageLevel: {
    ...typography.labelSmall,
    marginBottom: 2,
  },
  triageDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginTop: 6,
  },
  bulletText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  redFlagsContainer: {
    gap: spacing.xs,
  },
  redFlagItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  redFlagText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    flex: 1,
  },
  redFlagFooter: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.sm,
    fontWeight: '500',
  },
});

export default CollapsibleSection;
