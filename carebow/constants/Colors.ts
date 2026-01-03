/**
 * CareBow Design System - Colors
 */

export const Colors = {
  // Primary Purple
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },

  // Grays
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Status Colors
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },

  yellow: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
  },

  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },

  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
  },

  pink: {
    50: '#fdf2f8',
    100: '#fce7f3',
    600: '#db2777',
  },

  cyan: {
    50: '#ecfeff',
  },

  // Base colors
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',

  // Semantic colors for light theme
  light: {
    background: '#ffffff',
    backgroundSecondary: '#f9fafb',
    text: '#111827',
    textSecondary: '#6b7280',
    textTertiary: '#9ca3af',
    border: '#e5e7eb',
    borderLight: '#f3f4f6',
    primary: '#9333ea',
    primaryLight: '#f3e8ff',
  },

  // Semantic colors for dark theme
  dark: {
    background: '#111827',
    backgroundSecondary: '#1f2937',
    text: '#f9fafb',
    textSecondary: '#9ca3af',
    textTertiary: '#6b7280',
    border: '#374151',
    borderLight: '#1f2937',
    primary: '#a855f7',
    primaryLight: '#581c87',
  },
};

// Theme helper
export function getColors(colorScheme: 'light' | 'dark' = 'light') {
  return colorScheme === 'dark' ? Colors.dark : Colors.light;
}
