/**
 * CareBow Design System - Spacing & Layout
 * Professional spacing scale
 */

export const Spacing = {
  // Base spacing scale (4px base)
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
};

export const BorderRadius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
  full: 9999,
};

export const Layout = {
  // Screen padding
  screenPaddingHorizontal: Spacing[5], // 20px
  screenPaddingVertical: Spacing[6], // 24px

  // Card spacing
  cardPadding: Spacing[5], // 20px
  cardPaddingSmall: Spacing[4], // 16px
  cardGap: Spacing[3], // 12px

  // Touch targets (minimum 44pt for accessibility)
  touchTargetMin: 44,
  touchTargetDefault: 48,
  touchTargetLarge: 56,

  // Bottom navigation height
  bottomNavHeight: 80,
  bottomNavHeightWithSafeArea: 96,

  // Header heights
  headerHeight: 56,

  // Icon sizes
  iconXs: 14,
  iconSm: 16,
  iconMd: 20,
  iconLg: 24,
  iconXl: 32,
  iconXxl: 40,
};

// Premium shadow system - more refined with color tint
export const Shadow = {
  xs: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  xl: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  // Colored shadows for floating elements
  primary: {
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  accent: {
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  // Card shadow - subtle and refined
  card: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  // Elevated card - for hover/pressed states
  cardElevated: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
};

// Typography scale
export const Typography = {
  // Display - for hero sections
  displayLarge: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  displayMedium: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  displaySmall: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
  },
  // Headings
  headingLarge: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as const,
    letterSpacing: -0.1,
  },
  headingMedium: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600' as const,
  },
  headingSmall: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  // Body
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
  },
  // Labels
  labelLarge: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
  },
  labelMedium: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500' as const,
  },
  labelSmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
  },
  // Caption
  caption: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.3,
  },
};
