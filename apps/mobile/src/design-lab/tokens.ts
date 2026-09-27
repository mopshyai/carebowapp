/**
 * CareBow Mobile Direction A tokens.
 * Brand-aligned with web `carebow-main` design-system tokens.
 * Lab-only. Do not import from production screens.
 */

import { Platform } from 'react-native';

export const brand = {
  canvas: '#FCFCFA',
  ink: '#102A2E',
  teal: '#155E63',
  tealHover: '#124E52',
  tealSoft: 'rgba(21, 94, 99, 0.10)',
  secondary: '#667477',
  muted: '#7A8987',
  soft: '#F1F5F3',
  border: '#DFE7E4',
  white: '#FFFFFF',
  orange: '#F97316',
  dangerInk: '#7A2E2E',
  dangerSoft: '#F8EEEE',
  dangerBorder: '#E4C9C9',
  warnInk: '#6B4E16',
  warnSoft: '#F7F1E4',
  warnBorder: '#E6D7B8',
} as const;

export const space = {
  4: 4,
  8: 8,
  12: 12,
  16: 16,
  20: 20,
  24: 24,
  32: 32,
  40: 40,
  48: 48,
} as const;

export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
} as const;

export const type = {
  fontFamily: Platform.select({ ios: 'System', android: 'Roboto', default: 'System' }),
  screenTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600' as const,
    letterSpacing: -0.4,
    color: brand.ink,
  },
  section: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
    color: brand.ink,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as const,
    color: brand.ink,
  },
  secondary: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
    color: brand.secondary,
  },
  meta: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600' as const,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
    color: brand.muted,
  },
  tab: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500' as const,
    color: brand.muted,
  },
};

export const touch = {
  min: 44,
} as const;

/** Tab icon+label row. Home-indicator inset is applied by MobileShell. */
export const tabBarBodyHeight = 56;
