/**
 * Health Memory Store Tests
 * Tests for the health memory Zustand store
 */

import { act, renderHook } from '@testing-library/react-native';
import { useHealthMemoryStore } from './healthMemoryStore';

// Helper to reset store state between tests
const resetStore = () => {
  useHealthMemoryStore.setState({
    items: [],
    settings: {
      saveFullChatHistory: false,
      autoSaveHighConfidence: false,
      syncWithProfile: true,
    },
    lastSyncedAt: null,
    pendingCandidates: [],
  });
};

describe('healthMemoryStore', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('Initial State', () => {
    it('starts with empty items', () => {
      const { result } = renderHook(() => useHealthMemoryStore());
      expect(result.current.items).toEqual([]);
    });

    it('starts with default settings', () => {
      const { result } = renderHook(() => useHealthMemoryStore());
      expect(result.current.settings).toEqual({
        saveFullChatHistory: false,
        autoSaveHighConfidence: false,
        syncWithProfile: true,
      });
    });

    it('starts with no pending candidates', () => {
      const { result } = renderHook(() => useHealthMemoryStore());
      expect(result.current.pendingCandidates).toEqual([]);
    });

    it('starts with null lastSyncedAt', () => {
      const { result } = renderHook(() => useHealthMemoryStore());
      expect(result.current.lastSyncedAt).toBeNull();
    });
  });

  describe('Item Management', () => {
    it('addMemoryItem creates a new memory item', () => {
      const { result } = renderHook(() => useHealthMemoryStore());

      let newItem: ReturnType<typeof result.current.addMemoryItem>;
      act(() => {
        newItem = result.current.addMemoryItem(
          'allergy',
          'Allergy',
          'Penicillin',
          'user_input',
          'me',
          'high'
        );
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].type).toBe('allergy');
      expect(result.current.items[0].label).toBe('Allergy');
      expect(result.current.items[0].value).toBe('Penicillin');
      expect(result.current.items[0].source).toBe('user_input');
      expect(result.current.items[0].forWhom).toBe('me');
      expect(result.current.items[0].confidence).toBe('high');
    });

    it('addMemoryItem returns the created item', () => {
      const { result } = renderHook(() => useHealthMemoryStore());

      let newItem: ReturnType<typeof result.current.addMemoryItem>;
      act(() => {
        newItem = result.current.addMemoryItem(
          'condition',
          'Condition',
          'Diabetes',
          'conversation',
          'me',
          'medium'
        );
      });

      expect(newItem!.id).toBeDefined();
      expect(newItem!.value).toBe('Diabetes');
    });

    it('updateMemoryItem updates an existing item', () => {
      const { result } = renderHook(() => useHealthMemoryStore());

      let item: ReturnType<typeof result.current.addMemoryItem>;
      act(() => {
        item = result.current.addMemoryItem(
          'medication',
          'Medication',
          'Aspirin',
          'user_input'
        );
      });

      act(() => {
        result.current.updateMemoryItem(item!.id, { value: 'Ibuprofen' });
      });

      expect(result.current.items[0].value).toBe('Ibuprofen');
      expect(result.current.items[0].updatedAt).not.toBe(item!.updatedAt);
    });

    it('deleteMemoryItem removes an item', () => {
      const { result } = renderHook(() => useHealthMemoryStore());

      let item: ReturnType<typeof result.current.addMemoryItem>;
      act(() => {
        item = result.current.addMemoryItem('allergy', 'Allergy', 'Peanuts', 'user_input');
      });

      expect(result.current.items).toHaveLength(1);

      act(() => {
        result.current.deleteMemoryItem(item!.id);
      });

      expect(result.current.items).toHaveLength(0);
    });

    it('deleteAllMemory clears all items and candidates', () => {
      const { result } = renderHook(() => useHealthMemoryStore());

      act(() => {
        result.current.addMemoryItem('allergy', 'Allergy', 'Shellfish', 'user_input');
        result.current.addMemoryItem('condition', 'Condition', 'Asthma', 'user_input');
        result.current.addPendingCandidate({
          id: 'candidate-1',
          type: 'medication',
          label: 'Medication',
          value: 'Inhaler',
          confidence: 'high',
          extractedAt: new Date().toISOString(),
        });
      });

      expect(result.current.items).toHaveLength(2);
      expect(result.current.pendingCandidates).toHaveLength(1);

      act(() => {
        result.current.deleteAllMemory();
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.pendingCandidates).toHaveLength(0);
    });
  });

  describe('Candidate Management', () => {
    it('addPendingCandidate adds a single candidate', () => {
      const { result } = renderHook(() => useHealthMemoryStore());

      act(() => {
        result.current.addPendingCandidate({
          id: 'candidate-1',
          type: 'symptom',
          label: 'Symptom',
          value: 'Headache',
          confidence: 'medium',
          extractedAt: new Date().toISOString(),
        });
      });

      expect(result.current.pendingCandidates).toHaveLength(1);
      expect(result.current.pendingCandidates[0].value).toBe('Headache');
    });

    it('addPendingCandidates adds multiple candidates', () => {
      const { result } = renderHook(() => useHealthMemoryStore());

      act(() => {
        result.current.addPendingCandidates([
          {
            id: 'candidate-1',
            type: 'symptom',
            label: 'Symptom',
            value: 'Fever',
            confidence: 'high',
            extractedAt: new Date().toISOString(),
          },
          {
            id: 'candidate-2',
            type: 'symptom',
            label: 'Symptom',
            value: 'Cough',
            confidence: 'medium',
            extractedAt: new Date().toISOString(),
          },
        ]);
      });

      expect(result.current.pendingCandidates).toHaveLength(2);
    });

    it('saveCandidate moves candidate to items', () => {
      const { result } = renderHook(() => useHealthMemoryStore());

      act(() => {
        result.current.addPendingCandidate({
          id: 'candidate-1',
          type: 'medication',
          label: 'Medication',
          value: 'Vitamin D',
          confidence: 'high',
          extractedAt: new Date().toISOString(),
        });
      });

      expect(result.current.pendingCandidates).toHaveLength(1);
      expect(result.current.items).toHaveLength(0);

      act(() => {
        result.current.saveCandidate('candidate-1', 'session-123');
      });

      expect(result.current.pendingCandidates).toHaveLength(0);
      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].value).toBe('Vitamin D');
      expect(result.current.items[0].source).toBe('conversation');
    });

    it('dismissCandidate removes candidate without saving', () => {
      const { result } = renderHook(() => useHealthMemoryStore());

      act(() => {
        result.current.addPendingCandidate({
          id: 'candidate-1',
          type: 'allergy',
          label: 'Allergy',
          value: 'Dust',
          confidence: 'low',
          extractedAt: new Date().toISOString(),
        });
      });

      act(() => {
        result.current.dismissCandidate('candidate-1');
      });

      expect(result.current.pendingCandidates).toHaveLength(0);
      expect(result.current.items).toHaveLength(0);
    });

    it('clearPendingCandidates removes all candidates', () => {
      const { result } = renderHook(() => useHealthMemoryStore());

      act(() => {
        result.current.addPendingCandidates([
          {
            id: 'c1',
            type: 'symptom',
            label: 'S',
            value: 'V1',
            confidence: 'high',
            extractedAt: new Date().toISOString(),
          },
          {
            id: 'c2',
            type: 'symptom',
            label: 'S',
            value: 'V2',
            confidence: 'high',
            extractedAt: new Date().toISOString(),
          },
        ]);
      });

      act(() => {
        result.current.clearPendingCandidates();
      });

      expect(result.current.pendingCandidates).toHaveLength(0);
    });
  });

  describe('Settings', () => {
    it('updateSettings updates settings partially', () => {
      const { result } = renderHook(() => useHealthMemoryStore());

      act(() => {
        result.current.updateSettings({ autoSaveHighConfidence: true });
      });

      expect(result.current.settings.autoSaveHighConfidence).toBe(true);
      expect(result.current.settings.saveFullChatHistory).toBe(false);
    });

    it('toggleSaveFullChatHistory toggles the setting', () => {
      const { result } = renderHook(() => useHealthMemoryStore());

      expect(result.current.settings.saveFullChatHistory).toBe(false);

      act(() => {
        result.current.toggleSaveFullChatHistory();
      });

      expect(result.current.settings.saveFullChatHistory).toBe(true);

      act(() => {
        result.current.toggleSaveFullChatHistory();
      });

      expect(result.current.settings.saveFullChatHistory).toBe(false);
    });
  });

  describe('Getters', () => {
    it('getItemsByType filters items by type', () => {
      const { result } = renderHook(() => useHealthMemoryStore());

      act(() => {
        result.current.addMemoryItem('allergy', 'Allergy', 'Pollen', 'user_input');
        result.current.addMemoryItem('allergy', 'Allergy', 'Cats', 'user_input');
        result.current.addMemoryItem('condition', 'Condition', 'Hypertension', 'user_input');
      });

      const allergies = result.current.getItemsByType('allergy');
      expect(allergies).toHaveLength(2);

      const conditions = result.current.getItemsByType('condition');
      expect(conditions).toHaveLength(1);
    });

    it('getItemsForPerson filters by forWhom', () => {
      const { result } = renderHook(() => useHealthMemoryStore());

      act(() => {
        result.current.addMemoryItem('allergy', 'Allergy', 'Nuts', 'user_input', 'me');
        result.current.addMemoryItem('allergy', 'Allergy', 'Milk', 'user_input', 'family', 'medium', {
          familyMemberId: 'family-1',
        });
      });

      const myItems = result.current.getItemsForPerson('me');
      expect(myItems).toHaveLength(1);
      expect(myItems[0].value).toBe('Nuts');

      const familyItems = result.current.getItemsForPerson('family', 'family-1');
      expect(familyItems).toHaveLength(1);
      expect(familyItems[0].value).toBe('Milk');
    });

    it('hasAnyMemory returns correct boolean', () => {
      const { result } = renderHook(() => useHealthMemoryStore());

      expect(result.current.hasAnyMemory()).toBe(false);

      act(() => {
        result.current.addMemoryItem('symptom', 'Symptom', 'Fatigue', 'user_input');
      });

      expect(result.current.hasAnyMemory()).toBe(true);
    });

    it('getMemoryCount returns item count', () => {
      const { result } = renderHook(() => useHealthMemoryStore());

      expect(result.current.getMemoryCount()).toBe(0);

      act(() => {
        result.current.addMemoryItem('allergy', 'A', 'V1', 'user_input');
        result.current.addMemoryItem('allergy', 'A', 'V2', 'user_input');
        result.current.addMemoryItem('condition', 'C', 'V3', 'user_input');
      });

      expect(result.current.getMemoryCount()).toBe(3);
    });
  });

  describe('Import from Profile', () => {
    it('importFromProfile creates items from arrays', () => {
      const { result } = renderHook(() => useHealthMemoryStore());

      act(() => {
        result.current.importFromProfile(
          ['Penicillin', 'Shellfish'],
          ['Diabetes', 'Hypertension'],
          ['Metformin'],
          'me'
        );
      });

      expect(result.current.items).toHaveLength(5);

      const allergies = result.current.getItemsByType('allergy');
      expect(allergies).toHaveLength(2);

      const conditions = result.current.getItemsByType('condition');
      expect(conditions).toHaveLength(2);

      const medications = result.current.getItemsByType('medication');
      expect(medications).toHaveLength(1);
    });

    it('importFromProfile sets lastSyncedAt', () => {
      const { result } = renderHook(() => useHealthMemoryStore());

      expect(result.current.lastSyncedAt).toBeNull();

      act(() => {
        result.current.importFromProfile([], [], ['Aspirin'], 'me');
      });

      expect(result.current.lastSyncedAt).not.toBeNull();
    });

    it('importFromProfile handles family members', () => {
      const { result } = renderHook(() => useHealthMemoryStore());

      act(() => {
        result.current.importFromProfile(
          ['Peanuts'],
          [],
          [],
          'family',
          'member-123',
          'John Doe'
        );
      });

      expect(result.current.items[0].forWhom).toBe('family');
      expect(result.current.items[0].familyMemberId).toBe('member-123');
      expect(result.current.items[0].familyMemberName).toBe('John Doe');
    });
  });
});
