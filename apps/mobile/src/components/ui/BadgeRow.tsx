/**
 * BadgeRow Component
 * A wrapping row container for badges, tags, and chips
 * Ensures badges wrap to next line instead of overflowing
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, radius, typography } from '../../theme';

// =============================================================================
// TYPES
// =============================================================================

export interface BadgeItem {
  label: string;
  type?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'accent' | 'secondary';
  backgroundColor?: string;
  textColor?: string;
}

interface BadgeRowProps {
  badges: BadgeItem[];
  size?: 'small' | 'medium';
  style?: ViewStyle;
  maxBadges?: number;
}

interface SingleBadgeProps {
  label: string;
  type?: BadgeItem['type'];
  backgroundColor?: string;
  textColor?: string;
  size?: 'small' | 'medium';
  style?: ViewStyle;
}

// =============================================================================
// BADGE STYLE HELPER
// =============================================================================

const getBadgeColors = (type: BadgeItem['type'] = 'default') => {
  const colorMap: Record<string, { bg: string; text: string }> = {
    default: { bg: colors.surface2, text: colors.textSecondary },
    success: { bg: colors.successSoft, text: colors.success },
    warning: { bg: colors.warningSoft, text: colors.warning },
    error: { bg: colors.errorSoft, text: colors.error },
    info: { bg: colors.infoSoft, text: colors.info },
    accent: { bg: colors.accentSoft, text: colors.accent },
    secondary: { bg: colors.secondarySoft, text: colors.secondary },
  };
  return colorMap[type] || colorMap.default;
};

// =============================================================================
// SINGLE BADGE COMPONENT (exported for individual use)
// =============================================================================

export function Badge({
  label,
  type = 'default',
  backgroundColor,
  textColor,
  size = 'small',
  style,
}: SingleBadgeProps) {
  const badgeColors = getBadgeColors(type);
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        isSmall ? styles.badgeSmall : styles.badgeMedium,
        { backgroundColor: backgroundColor || badgeColors.bg },
        style,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          isSmall ? styles.badgeTextSmall : styles.badgeTextMedium,
          { color: textColor || badgeColors.text },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

// =============================================================================
// BADGE ROW COMPONENT
// =============================================================================

export function BadgeRow({ badges, size = 'small', style, maxBadges }: BadgeRowProps) {
  const displayBadges = maxBadges ? badges.slice(0, maxBadges) : badges;
  const remainingCount = maxBadges && badges.length > maxBadges ? badges.length - maxBadges : 0;

  if (displayBadges.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      {displayBadges.map((badge, index) => (
        <Badge
          key={`${badge.label}-${index}`}
          label={badge.label}
          type={badge.type}
          backgroundColor={badge.backgroundColor}
          textColor={badge.textColor}
          size={size}
        />
      ))}
      {remainingCount > 0 && (
        <Badge label={`+${remainingCount}`} type="default" size={size} />
      )}
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  // Container that wraps badges
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    rowGap: spacing.xxs,
    columnGap: spacing.xxs,
  },

  // Base badge style
  badge: {
    maxWidth: '100%',
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  badgeMedium: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    borderRadius: radius.sm,
  },

  // Badge text
  badgeText: {
    fontWeight: '600',
  },
  badgeTextSmall: {
    fontSize: 10,
    lineHeight: 14,
  },
  badgeTextMedium: {
    fontSize: 11,
    lineHeight: 14,
  },
});
