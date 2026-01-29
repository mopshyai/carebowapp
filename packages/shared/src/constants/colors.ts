export const colors = {
  // Brand - Primary (Deep Teal)
  accent: '#0D4F52',
  accentDark: '#0A3D3F',
  accentLight: '#14B8A6',
  accentSoft: '#CCFBF1',
  accentMuted: '#F0FDFA',

  // Brand - Secondary (Warm Coral)
  secondary: '#E85D2D',
  secondaryDark: '#C74E26',
  secondarySoft: '#FFEDD5',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',

  // Background
  background: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E2E8F0',

  // Status
  success: '#10B981',
  successSoft: '#D1FAE5',
  warning: '#F59E0B',
  warningSoft: '#FEF3C7',
  error: '#EF4444',
  errorSoft: '#FEE2E2',

  // Triage Levels
  triageP1: '#DC2626',
  triageP2: '#F97316',
  triageP3: '#EAB308',
  triageP4: '#22C55E',

  // Categories
  medical: '#0D4F52',
  medicalSoft: '#CCFBF1',
  lab: '#3B82F6',
  labSoft: '#DBEAFE',
  nursing: '#EC4899',
  nursingSoft: '#FCE7F3',
  equipment: '#06B6D4',
  equipmentSoft: '#CFFAFE',
  packages: '#8B5CF6',
  packagesSoft: '#EDE9FE',

  // Misc
  star: '#F59E0B',
} as const;

export type ColorName = keyof typeof colors;
