/**
 * Health Memory Types
 * Types for the Spotify-like personalization system with user control
 */

// ============================================
// MEMORY ITEM TYPES
// ============================================

export type MemoryItemType =
  | 'allergy'
  | 'condition'
  | 'medication'
  | 'preference'
  | 'trigger'
  | 'past_episode'
  | 'family_history'
  | 'lifestyle';

export type MemoryItemSource =
  | 'user_input'        // User manually added
  | 'conversation'      // Extracted from chat
  | 'profile_sync';     // Synced from profile

export type MemoryItem = {
  id: string;
  type: MemoryItemType;
  label: string;
  value: string;
  details?: string;
  source: MemoryItemSource;
  sourceSessionId?: string;  // If from conversation
  confidence: 'high' | 'medium' | 'low';
  createdAt: string;
  updatedAt: string;
  forWhom: 'me' | 'family';
  familyMemberId?: string;
  familyMemberName?: string;
};

// ============================================
// MEMORY CANDIDATE (from AI response)
// ============================================

export type MemoryCandidate = {
  id: string;
  type: MemoryItemType;
  label: string;
  value: string;
  confidence: 'high' | 'medium' | 'low';
  reason?: string;  // Why the AI thinks this is worth remembering
};

// ============================================
// MEMORY SNAPSHOT (for API payload)
// ============================================

export type MemorySnapshot = {
  allergies: string[];
  conditions: string[];
  medications: string[];
  preferences: string[];
  triggers: string[];
  pastEpisodes: Array<{ description: string; date?: string }>;
  familyHistory: string[];
  lifestyle: string[];
};

// ============================================
// HEALTH MEMORY STATE
// ============================================

export type HealthMemorySettings = {
  saveFullChatHistory: boolean;  // Default OFF
  autoSaveHighConfidence: boolean;  // Auto-save high confidence items
  syncWithProfile: boolean;  // Sync with member profiles
};

export type HealthMemoryState = {
  items: MemoryItem[];
  settings: HealthMemorySettings;
  lastSyncedAt: string | null;
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export const generateMemoryId = (): string => {
  return `mem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

export const createMemoryItem = (
  type: MemoryItemType,
  label: string,
  value: string,
  source: MemoryItemSource,
  forWhom: 'me' | 'family' = 'me',
  confidence: 'high' | 'medium' | 'low' = 'medium',
  extras?: Partial<MemoryItem>
): MemoryItem => {
  const now = new Date().toISOString();
  return {
    id: generateMemoryId(),
    type,
    label,
    value,
    source,
    confidence,
    forWhom,
    createdAt: now,
    updatedAt: now,
    ...extras,
  };
};

export const createEmptyMemorySnapshot = (): MemorySnapshot => ({
  allergies: [],
  conditions: [],
  medications: [],
  preferences: [],
  triggers: [],
  pastEpisodes: [],
  familyHistory: [],
  lifestyle: [],
});

export const memoryItemsToSnapshot = (items: MemoryItem[]): MemorySnapshot => {
  const snapshot = createEmptyMemorySnapshot();

  items.forEach((item) => {
    switch (item.type) {
      case 'allergy':
        snapshot.allergies.push(item.value);
        break;
      case 'condition':
        snapshot.conditions.push(item.value);
        break;
      case 'medication':
        snapshot.medications.push(item.value);
        break;
      case 'preference':
        snapshot.preferences.push(item.value);
        break;
      case 'trigger':
        snapshot.triggers.push(item.value);
        break;
      case 'past_episode':
        snapshot.pastEpisodes.push({
          description: item.value,
          date: item.createdAt,
        });
        break;
      case 'family_history':
        snapshot.familyHistory.push(item.value);
        break;
      case 'lifestyle':
        snapshot.lifestyle.push(item.value);
        break;
    }
  });

  return snapshot;
};

// ============================================
// DISPLAY LABELS
// ============================================

export const memoryTypeLabels: Record<MemoryItemType, string> = {
  allergy: 'Allergy',
  condition: 'Condition',
  medication: 'Medication',
  preference: 'Preference',
  trigger: 'Trigger',
  past_episode: 'Past Episode',
  family_history: 'Family History',
  lifestyle: 'Lifestyle',
};

export const memoryTypeIcons: Record<MemoryItemType, string> = {
  allergy: 'warning',
  condition: 'medkit',
  medication: 'medical',
  preference: 'heart',
  trigger: 'alert-circle',
  past_episode: 'time',
  family_history: 'people',
  lifestyle: 'leaf',
};

export const memoryTypeColors: Record<MemoryItemType, { bg: string; text: string }> = {
  allergy: { bg: '#FEE2E2', text: '#DC2626' },
  condition: { bg: '#DBEAFE', text: '#2563EB' },
  medication: { bg: '#DCFCE7', text: '#16A34A' },
  preference: { bg: '#F0FDFA', text: '#0D9488' },
  trigger: { bg: '#FEF3C7', text: '#D97706' },
  past_episode: { bg: '#F1F5F9', text: '#475569' },
  family_history: { bg: '#FCE7F3', text: '#DB2777' },
  lifestyle: { bg: '#ECFDF5', text: '#059669' },
};
