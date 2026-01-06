/**
 * CareBow Design System
 * Single source of truth for all design tokens
 */

// =============================================================================
// COLORS
// =============================================================================

export const colors = {
  // Backgrounds
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surface2: '#F8FAFC',
  surfaceElevated: '#FFFFFF',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',

  // Primary brand - Teal (trust, calm, healthcare)
  accent: '#0D9488',
  accentDark: '#0F766E',
  accentLight: '#14B8A6',
  accentSoft: '#CCFBF1',
  accentMuted: '#F0FDFA',

  // Secondary - Warm coral (approachable)
  secondary: '#F97316',
  secondarySoft: '#FFEDD5',

  // Borders
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderFocus: '#0D9488',

  // Status colors
  success: '#16A34A',
  successSoft: '#DCFCE7',
  warning: '#D97706',
  warningSoft: '#FEF3C7',
  error: '#DC2626',
  errorSoft: '#FEE2E2',
  info: '#2563EB',
  infoSoft: '#DBEAFE',

  // Category accents
  medical: '#0D9488',
  medicalSoft: '#CCFBF1',
  lab: '#2563EB',
  labSoft: '#DBEAFE',
  nursing: '#DB2777',
  nursingSoft: '#FCE7F3',
  equipment: '#7C3AED',
  equipmentSoft: '#EDE9FE',
  packages: '#EA580C',
  packagesSoft: '#FFEDD5',

  // Utility
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(15, 23, 42, 0.5)',
};

// =============================================================================
// SPACING
// =============================================================================

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

// =============================================================================
// BORDER RADIUS
// =============================================================================

export const radius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const typography = {
  // Display - Hero sections
  displayLarge: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  displayMedium: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
    color: colors.textPrimary,
  },

  // Headings
  h1: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
    color: colors.textPrimary,
  },
  h2: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as const,
    letterSpacing: -0.1,
    color: colors.textPrimary,
  },
  h3: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  h4: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },

  // Body text
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
    color: colors.textPrimary,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as const,
    color: colors.textPrimary,
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
    color: colors.textSecondary,
  },

  // Labels
  labelLarge: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  label: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500' as const,
    color: colors.textPrimary,
  },
  labelSmall: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },

  // Caption / Small text
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
    color: colors.textTertiary,
  },
  captionBold: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },

  // Tiny / Badge text
  tiny: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
    color: colors.textTertiary,
  },
};

// =============================================================================
// SHADOWS
// =============================================================================

export const shadows = {
  // Standard card shadow - use this for most cards
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  // Elevated card - for modals, dropdowns
  cardElevated: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },

  // Subtle shadow - for inputs, small elements
  subtle: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },

  // Primary button shadow
  button: {
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  // Tab bar shadow
  tabBar: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },

  // No shadow
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
};

// =============================================================================
// COMPONENT TOKENS
// =============================================================================

export const components = {
  // Card defaults
  card: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.card,
  },

  // Input defaults
  input: {
    height: 52,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    fontSize: 15,
  },

  // Button defaults
  buttonPrimary: {
    height: 52,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    ...shadows.button,
  },

  buttonSecondary: {
    height: 52,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Badge defaults
  badge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    borderRadius: radius.xs,
    backgroundColor: colors.accentSoft,
  },

  // Icon container defaults
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
};

// =============================================================================
// LAYOUT
// =============================================================================

export const layout = {
  screenPadding: spacing.lg,
  cardGap: spacing.sm,
  sectionGap: spacing.xxl,
  touchTarget: 44,
  iconSizeSmall: 16,
  iconSizeMedium: 20,
  iconSizeLarge: 24,
  iconSizeXL: 32,
};

// =============================================================================
// ANIMATION
// =============================================================================

export const animation = {
  fast: 150,
  normal: 250,
  slow: 400,
};

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

const theme = {
  colors,
  spacing,
  radius,
  typography,
  shadows,
  components,
  layout,
  animation,
};

export default theme;
