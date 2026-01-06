/**
 * CareBow Design System - Typography
 */

import { Platform } from 'react-native';

export const Typography = {
  // Font sizes
  size: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
  },

  // Line heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.625,
  },

  // Font weights
  weight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Font family
  family: Platform.select({
    ios: {
      regular: 'System',
      medium: 'System',
      semibold: 'System',
      bold: 'System',
    },
    android: {
      regular: 'Roboto',
      medium: 'Roboto',
      semibold: 'Roboto',
      bold: 'Roboto',
    },
    default: {
      regular: 'System',
      medium: 'System',
      semibold: 'System',
      bold: 'System',
    },
  }),
};

// Text style presets
export const TextStyles = {
  // Headings
  h1: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.medium,
    lineHeight: Typography.size['2xl'] * Typography.lineHeight.normal,
  },
  h2: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.medium,
    lineHeight: Typography.size.xl * Typography.lineHeight.normal,
  },
  h3: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.medium,
    lineHeight: Typography.size.lg * Typography.lineHeight.normal,
  },
  h4: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
    lineHeight: Typography.size.base * Typography.lineHeight.normal,
  },

  // Body text
  body: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.normal,
    lineHeight: Typography.size.base * Typography.lineHeight.relaxed,
  },
  bodySmall: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.normal,
    lineHeight: Typography.size.sm * Typography.lineHeight.relaxed,
  },

  // Labels and captions
  label: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    lineHeight: Typography.size.sm * Typography.lineHeight.normal,
  },
  caption: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.normal,
    lineHeight: Typography.size.xs * Typography.lineHeight.relaxed,
  },

  // Buttons
  button: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
    lineHeight: Typography.size.base * Typography.lineHeight.normal,
  },
  buttonSmall: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    lineHeight: Typography.size.sm * Typography.lineHeight.normal,
  },
};
