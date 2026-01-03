/**
 * CareBow Design System - Spacing & Layout
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
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
};

export const Layout = {
  // Screen padding
  screenPaddingHorizontal: Spacing[6], // 24px
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
  iconSm: 16,
  iconMd: 20,
  iconLg: 24,
  iconXl: 32,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};
