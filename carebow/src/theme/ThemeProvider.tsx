/**
 * ThemeProvider
 * Provides theme context with light/dark mode support
 * Respects system appearance and user preference
 */

import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useColorScheme, StatusBar, Platform } from 'react-native';
import { useProfileStore } from '../store/useProfileStore';

// =============================================================================
// LIGHT MODE COLORS
// =============================================================================

export const lightColors = {
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

  // Card shadow colors
  shadowColor: '#0F172A',
};

// =============================================================================
// DARK MODE COLORS
// =============================================================================

export const darkColors = {
  // Backgrounds
  background: '#0F172A',
  surface: '#1E293B',
  surface2: '#1E293B',
  surfaceElevated: '#334155',

  // Text
  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textTertiary: '#64748B',
  textInverse: '#0F172A',

  // Primary brand - Teal (adjusted for dark mode)
  accent: '#14B8A6',
  accentDark: '#0D9488',
  accentLight: '#2DD4BF',
  accentSoft: '#134E4A',
  accentMuted: '#0F2E2D',

  // Secondary - Warm coral (adjusted for dark mode)
  secondary: '#FB923C',
  secondarySoft: '#431407',

  // Borders
  border: '#334155',
  borderLight: '#1E293B',
  borderFocus: '#14B8A6',

  // Status colors (adjusted for dark mode contrast)
  success: '#22C55E',
  successSoft: '#14532D',
  warning: '#F59E0B',
  warningSoft: '#451A03',
  error: '#EF4444',
  errorSoft: '#450A0A',
  info: '#3B82F6',
  infoSoft: '#1E3A5F',

  // Category accents (adjusted for dark mode)
  medical: '#14B8A6',
  medicalSoft: '#134E4A',
  lab: '#3B82F6',
  labSoft: '#1E3A5F',
  nursing: '#EC4899',
  nursingSoft: '#500724',
  equipment: '#A78BFA',
  equipmentSoft: '#2E1065',
  packages: '#F97316',
  packagesSoft: '#431407',

  // Utility
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.7)',

  // Card shadow colors
  shadowColor: '#000000',
};

// =============================================================================
// THEME CONTEXT TYPES
// =============================================================================

export type ThemeMode = 'light' | 'dark';
export type ThemeColors = typeof lightColors;

interface ThemeContextValue {
  mode: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
}

// =============================================================================
// THEME CONTEXT
// =============================================================================

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  colors: lightColors,
  isDark: false,
});

// =============================================================================
// THEME PROVIDER COMPONENT
// =============================================================================

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const appSettings = useProfileStore((state) => state.appSettings);

  const themeValue = useMemo<ThemeContextValue>(() => {
    let mode: ThemeMode;

    if (appSettings.theme === 'system') {
      mode = systemColorScheme === 'dark' ? 'dark' : 'light';
    } else {
      mode = appSettings.theme;
    }

    return {
      mode,
      colors: mode === 'dark' ? darkColors : lightColors,
      isDark: mode === 'dark',
    };
  }, [appSettings.theme, systemColorScheme]);

  return (
    <ThemeContext.Provider value={themeValue}>
      <StatusBar
        barStyle={themeValue.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={themeValue.colors.background}
      />
      {children}
    </ThemeContext.Provider>
  );
}

// =============================================================================
// USE THEME HOOK
// =============================================================================

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// =============================================================================
// USE THEMED STYLES HOOK
// =============================================================================

/**
 * Hook to create styles that respond to theme changes
 * Usage:
 * const styles = useThemedStyles((colors) => ({
 *   container: { backgroundColor: colors.background }
 * }));
 */
export function useThemedStyles<T>(
  createStyles: (colors: ThemeColors, isDark: boolean) => T
): T {
  const { colors, isDark } = useTheme();
  return useMemo(() => createStyles(colors, isDark), [colors, isDark, createStyles]);
}

// =============================================================================
// COMMON THEMED STYLES HOOK
// =============================================================================

/**
 * Pre-built themed styles for common screen patterns
 * Usage: const { containerStyle, headerStyle, cardStyle } = useCommonThemedStyles();
 */
export function useCommonThemedStyles() {
  const { colors, isDark } = useTheme();

  return useMemo(
    () => ({
      // Screen containers
      containerStyle: {
        flex: 1,
        backgroundColor: colors.surface2,
      },
      safeContainerStyle: {
        flex: 1,
        backgroundColor: colors.background,
      },

      // Headers
      headerStyle: {
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      },
      headerTitleStyle: {
        color: colors.textPrimary,
      },

      // Cards
      cardStyle: {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        shadowColor: colors.shadowColor,
      },
      cardElevatedStyle: {
        backgroundColor: colors.surfaceElevated,
        borderColor: colors.border,
        shadowColor: colors.shadowColor,
      },

      // Text
      textPrimaryStyle: { color: colors.textPrimary },
      textSecondaryStyle: { color: colors.textSecondary },
      textTertiaryStyle: { color: colors.textTertiary },

      // Inputs
      inputStyle: {
        backgroundColor: colors.surface2,
        borderColor: colors.border,
        color: colors.textPrimary,
      },
      inputFocusedStyle: {
        borderColor: colors.borderFocus,
      },

      // Buttons
      primaryButtonStyle: {
        backgroundColor: colors.accent,
      },
      secondaryButtonStyle: {
        backgroundColor: colors.surface,
        borderColor: colors.border,
      },

      // Dividers
      dividerStyle: {
        backgroundColor: colors.border,
      },
      dividerLightStyle: {
        backgroundColor: colors.borderLight,
      },

      // Icons
      iconPrimaryColor: colors.textPrimary,
      iconSecondaryColor: colors.textSecondary,
      iconAccentColor: colors.accent,

      // Status
      successStyle: { backgroundColor: colors.successSoft, color: colors.success },
      warningStyle: { backgroundColor: colors.warningSoft, color: colors.warning },
      errorStyle: { backgroundColor: colors.errorSoft, color: colors.error },
      infoStyle: { backgroundColor: colors.infoSoft, color: colors.info },

      // Overlay
      overlayStyle: {
        backgroundColor: colors.overlay,
      },
    }),
    [colors, isDark]
  );
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default ThemeProvider;
