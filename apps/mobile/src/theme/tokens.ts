/**
 * CareBow Design Tokens
 * Medical-grade, calm, trustworthy design system
 *
 * GOLD STANDARD: Care Plans / Plan Comparison screen
 * Style: Calm, trustworthy, medical-grade, premium
 */

import { Platform, TextStyle, ViewStyle } from 'react-native';

// =============================================================================
// COLOR PALETTE - Medical Grade
// =============================================================================

export const palette = {
  // Neutrals (off-white backgrounds, not pure white)
  white: '#FFFFFF',
  offWhite: '#FAFBFC',
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',
  black: '#000000',

  // Primary - Deep Teal (trust, calm, healthcare)
  teal50: '#F0FDFA',
  teal100: '#CCFBF1',
  teal200: '#99F6E4',
  teal300: '#5EEAD4',
  teal400: '#2DD4BF',
  teal500: '#14B8A6',
  teal600: '#0D9488',
  teal700: '#0F766E',
  teal800: '#115E59',
  teal900: '#134E4A',

  // Brand Teal (from logo - deeper)
  brandTeal: '#1B4D5C',
  brandTealLight: '#2A6B7D',
  brandTealDark: '#0D3A47',

  // Accent Orange (from logo - warm, approachable)
  orange50: '#FFF7ED',
  orange100: '#FFEDD5',
  orange200: '#FED7AA',
  orange300: '#FDBA74',
  orange400: '#FB923C',
  orange500: '#F97316',
  orange600: '#EA580C',
  orange700: '#C2410C',

  // Success - Green
  green50: '#F0FDF4',
  green100: '#DCFCE7',
  green500: '#22C55E',
  green600: '#16A34A',
  green700: '#15803D',

  // Warning - Amber
  amber50: '#FFFBEB',
  amber100: '#FEF3C7',
  amber500: '#F59E0B',
  amber600: '#D97706',

  // Error - Red (reserved for emergency/danger)
  red50: '#FEF2F2',
  red100: '#FEE2E2',
  red500: '#EF4444',
  red600: '#DC2626',
  red700: '#B91C1C',

  // Info - Blue
  blue50: '#EFF6FF',
  blue100: '#DBEAFE',
  blue500: '#3B82F6',
  blue600: '#2563EB',
} as const;

// =============================================================================
// SEMANTIC COLORS
// =============================================================================

export const colors = {
  // Backgrounds
  background: palette.offWhite,           // Soft off-white, not pure white
  backgroundSecondary: palette.gray50,
  surface: palette.white,
  surfaceSecondary: palette.gray50,
  surfaceElevated: palette.white,

  // Text
  text: {
    primary: palette.gray900,
    secondary: palette.gray600,
    tertiary: palette.gray400,
    inverse: palette.white,
    muted: palette.gray500,
  },

  // Brand
  brand: {
    primary: palette.brandTeal,
    primaryLight: palette.brandTealLight,
    primaryDark: palette.brandTealDark,
    accent: palette.orange500,
  },

  // Primary Actions (teal)
  primary: {
    default: palette.teal600,
    hover: palette.teal700,
    active: palette.teal800,
    soft: palette.teal100,
    muted: palette.teal50,
  },

  // Secondary Actions (subtle)
  secondary: {
    default: palette.gray100,
    hover: palette.gray200,
    active: palette.gray300,
  },

  // Borders
  border: {
    default: palette.gray200,
    light: palette.gray100,
    focus: palette.teal600,
    subtle: palette.gray100,
  },

  // Status Colors
  success: {
    default: palette.green600,
    soft: palette.green100,
    muted: palette.green50,
  },
  warning: {
    default: palette.amber600,
    soft: palette.amber100,
    muted: palette.amber50,
  },
  error: {
    default: palette.red600,
    soft: palette.red100,
    muted: palette.red50,
  },
  info: {
    default: palette.blue600,
    soft: palette.blue100,
    muted: palette.blue50,
  },

  // Category Colors (service types)
  category: {
    medical: { main: palette.teal600, soft: palette.teal100 },
    lab: { main: palette.blue600, soft: palette.blue100 },
    nursing: { main: '#DB2777', soft: '#FCE7F3' },
    equipment: { main: '#7C3AED', soft: '#EDE9FE' },
    wellness: { main: palette.green600, soft: palette.green100 },
  },

  // Utility
  overlay: 'rgba(15, 23, 42, 0.5)',
  disabled: palette.gray300,
  skeleton: palette.gray200,
  divider: palette.gray200,
} as const;

// =============================================================================
// SPACING SCALE (4px base unit)
// =============================================================================

export const spacing = {
  /** 2px */
  '0.5': 2,
  /** 4px */
  '1': 4,
  /** 6px */
  '1.5': 6,
  /** 8px */
  '2': 8,
  /** 10px */
  '2.5': 10,
  /** 12px */
  '3': 12,
  /** 14px */
  '3.5': 14,
  /** 16px - Standard card padding */
  '4': 16,
  /** 18px */
  '4.5': 18,
  /** 20px - Screen horizontal padding */
  '5': 20,
  /** 24px - Section spacing */
  '6': 24,
  /** 28px */
  '7': 28,
  /** 32px - Large section spacing */
  '8': 32,
  /** 40px */
  '10': 40,
  /** 48px */
  '12': 48,
  /** 64px */
  '16': 64,
} as const;

// Named spacing aliases for common use cases
export const space = {
  none: 0,
  xxs: spacing['1'],      // 4px
  xs: spacing['2'],       // 8px
  sm: spacing['3'],       // 12px
  md: spacing['4'],       // 16px - card padding
  lg: spacing['5'],       // 20px - screen padding
  xl: spacing['6'],       // 24px - section gap
  xxl: spacing['8'],      // 32px
  xxxl: spacing['10'],    // 40px
} as const;

// =============================================================================
// BORDER RADIUS
// =============================================================================

export const radius = {
  /** 4px */
  xs: 4,
  /** 6px */
  sm: 6,
  /** 8px */
  md: 8,
  /** 12px */
  lg: 12,
  /** 16px - Standard card radius */
  xl: 16,
  /** 20px - Large card radius */
  '2xl': 20,
  /** 24px */
  '3xl': 24,
  /** Full circle */
  full: 9999,
} as const;

// =============================================================================
// TYPOGRAPHY
// =============================================================================

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const typography = {
  // Screen Titles (20-22, semibold)
  screenTitle: {
    fontFamily,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600' as const,
    color: colors.text.primary,
  } as TextStyle,

  // Section Headers (16-18, semibold)
  sectionHeader: {
    fontFamily,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
    color: colors.text.primary,
  } as TextStyle,

  sectionHeaderSmall: {
    fontFamily,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600' as const,
    color: colors.text.primary,
  } as TextStyle,

  // Body Text (14-15, regular)
  body: {
    fontFamily,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as const,
    color: colors.text.primary,
  } as TextStyle,

  bodySmall: {
    fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
    color: colors.text.secondary,
  } as TextStyle,

  // Caption/Helper Text (12-13, regular, muted)
  caption: {
    fontFamily,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
    color: colors.text.tertiary,
  } as TextStyle,

  captionSmall: {
    fontFamily,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
    color: colors.text.tertiary,
  } as TextStyle,

  // Labels (for forms, buttons)
  label: {
    fontFamily,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500' as const,
    color: colors.text.primary,
  } as TextStyle,

  labelSmall: {
    fontFamily,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500' as const,
    color: colors.text.secondary,
  } as TextStyle,

  // Button Text
  buttonLarge: {
    fontFamily,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600' as const,
  } as TextStyle,

  buttonMedium: {
    fontFamily,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600' as const,
  } as TextStyle,

  buttonSmall: {
    fontFamily,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600' as const,
  } as TextStyle,

  // Pricing (large but not gimmicky)
  priceDisplay: {
    fontFamily,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700' as const,
    color: colors.text.primary,
  } as TextStyle,

  priceLarge: {
    fontFamily,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700' as const,
    color: colors.text.primary,
  } as TextStyle,

  priceNormal: {
    fontFamily,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600' as const,
    color: colors.text.primary,
  } as TextStyle,

  priceUnit: {
    fontFamily,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
    color: colors.text.tertiary,
  } as TextStyle,

  // Badge/Tag Text
  badge: {
    fontFamily,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
  } as TextStyle,
} as const;

// =============================================================================
// SHADOWS (subtle, medical-grade)
// =============================================================================

export const shadows = {
  // No shadow
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } as ViewStyle,

  // Subtle shadow for cards with borders
  subtle: {
    shadowColor: palette.gray900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  } as ViewStyle,

  // Standard card shadow
  card: {
    shadowColor: palette.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  } as ViewStyle,

  // Medium shadow (slightly elevated cards)
  medium: {
    shadowColor: palette.gray900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  } as ViewStyle,

  // Elevated shadow (modals, dropdowns)
  elevated: {
    shadowColor: palette.gray900,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  } as ViewStyle,

  // Primary button shadow (teal tint)
  primaryButton: {
    shadowColor: palette.teal600,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  } as ViewStyle,
} as const;

// =============================================================================
// COMPONENT PRESETS
// =============================================================================

export const componentStyles = {
  // Screen container
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  } as ViewStyle,

  // Standard card (white with subtle border)
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  } as ViewStyle,

  // Card with shadow (no border)
  cardElevated: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.md,
    ...shadows.card,
  } as ViewStyle,

  // Flat card (gray background)
  cardFlat: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.xl,
    padding: space.md,
  } as ViewStyle,

  // List row container
  listRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.surface,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  } as ViewStyle,

  // Primary button
  buttonPrimary: {
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.primary.default,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: space.lg,
    ...shadows.primaryButton,
  } as ViewStyle,

  // Secondary/outline button
  buttonSecondary: {
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: space.lg,
  } as ViewStyle,

  // Ghost button
  buttonGhost: {
    height: 44,
    borderRadius: radius.md,
    backgroundColor: 'transparent',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: space.md,
  } as ViewStyle,

  // Input field
  input: {
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingHorizontal: space.md,
    fontSize: 15,
    color: colors.text.primary,
  } as ViewStyle,

  // Badge/Tag
  badge: {
    paddingHorizontal: space.xs,
    paddingVertical: space.xxs,
    borderRadius: radius.sm,
    backgroundColor: colors.primary.soft,
  } as ViewStyle,

  // Icon container (for list rows, cards)
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.primary.muted,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  } as ViewStyle,

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  } as ViewStyle,
} as const;

// =============================================================================
// LAYOUT CONSTANTS
// =============================================================================

export const layout = {
  // Screen padding
  screenPaddingHorizontal: space.lg,  // 20px
  screenPaddingVertical: space.md,    // 16px

  // Card padding
  cardPadding: space.md,              // 16px

  // Section spacing
  sectionSpacing: space.xl,           // 24px
  sectionSpacingLarge: space.xxl,     // 32px

  // Item gaps
  itemGap: space.sm,                  // 12px
  itemGapSmall: space.xs,             // 8px

  // Touch targets
  touchTargetMin: 44,
  touchTargetLarge: 52,

  // Icon sizes
  iconSmall: 16,
  iconMedium: 20,
  iconLarge: 24,
  iconXL: 32,

  // Border radius
  cardRadius: radius.xl,              // 16px
  buttonRadius: radius.lg,            // 12px
  inputRadius: radius.lg,             // 12px
  badgeRadius: radius.sm,             // 6px
} as const;

// =============================================================================
// ANIMATION TIMING
// =============================================================================

export const animation = {
  fast: 150,
  normal: 250,
  slow: 350,
  spring: {
    damping: 15,
    stiffness: 150,
  },
} as const;

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

const tokens = {
  palette,
  colors,
  spacing,
  space,
  radius,
  typography,
  shadows,
  componentStyles,
  layout,
  animation,
};

export default tokens;
