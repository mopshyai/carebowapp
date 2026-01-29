// Triage Level Keywords
export const TRIAGE_KEYWORDS = {
  P1: [
    'chest pain', 'difficulty breathing', 'unconscious', 'severe bleeding',
    'stroke', 'heart attack', 'suicidal', 'seizure', 'choking',
    'not breathing', 'can\'t breathe', 'blue lips', 'collapsed', 'overdose',
  ],
  P2: [
    'high fever', 'severe pain', 'heavy bleeding', 'head injury',
    'broken bone', 'allergic reaction', 'vomiting blood', 'confusion',
    'severe dizziness', 'fainting', 'burns',
  ],
};

// Emergency Numbers by Country
export const EMERGENCY_NUMBERS: Record<string, string> = {
  US: '911',
  IN: '112',
  GB: '999',
  AE: '998',
  SG: '995',
  AU: '000',
  CA: '911',
  EU: '112',
};

// Service Categories
export const SERVICE_CATEGORIES = [
  { id: 'health', label: 'Health Care', icon: '🏥', color: '#0D4F52' },
  { id: 'packages', label: 'Packages', icon: '📦', color: '#8B5CF6' },
  { id: 'equipment', label: 'Equipment', icon: '🔧', color: '#06B6D4' },
  { id: 'wellness', label: 'Wellness', icon: '🧘', color: '#10B981' },
];
