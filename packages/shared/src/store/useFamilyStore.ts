import { create } from 'zustand';
import type { FamilyMember } from '../types';

interface FamilyState {
  members: FamilyMember[];
  selectedMemberId: string | null;
  isLoading: boolean;

  setMembers: (members: FamilyMember[]) => void;
  addMember: (member: FamilyMember) => void;
  updateMember: (id: string, updates: Partial<FamilyMember>) => void;
  removeMember: (id: string) => void;
  selectMember: (id: string | null) => void;
  getSelectedMember: () => FamilyMember | null;
  setLoading: (loading: boolean) => void;
}

export const useFamilyStore = create<FamilyState>()((set, get) => ({
  members: [],
  selectedMemberId: null,
  isLoading: false,

  setMembers: (members) => set({ members }),
  addMember: (member) => set((s) => ({ members: [...s.members, member] })),
  updateMember: (id, updates) =>
    set((s) => ({
      members: s.members.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    })),
  removeMember: (id) =>
    set((s) => ({
      members: s.members.filter((m) => m.id !== id),
      selectedMemberId: s.selectedMemberId === id ? null : s.selectedMemberId,
    })),
  selectMember: (id) => set({ selectedMemberId: id }),
  getSelectedMember: () => {
    const { members, selectedMemberId } = get();
    return members.find((m) => m.id === selectedMemberId) || null;
  },
  setLoading: (isLoading) => set({ isLoading }),
}));
