import { create } from 'zustand';
import type { EmergencyContact, SOSEvent } from '../types';

interface SafetyState {
  contacts: EmergencyContact[];
  sosHistory: SOSEvent[];
  checkInEnabled: boolean;
  checkInTime: string;
  lastCheckIn: string | null;

  setContacts: (contacts: EmergencyContact[]) => void;
  addContact: (contact: EmergencyContact) => void;
  updateContact: (id: string, updates: Partial<EmergencyContact>) => void;
  removeContact: (id: string) => void;
  addSOSEvent: (event: SOSEvent) => void;
  setCheckInSettings: (enabled: boolean, time?: string) => void;
  recordCheckIn: () => void;
  setLoading: (loading: boolean) => void;
  isLoading: boolean;
}

export const useSafetyStore = create<SafetyState>()((set) => ({
  contacts: [],
  sosHistory: [],
  checkInEnabled: false,
  checkInTime: '09:00',
  lastCheckIn: null,
  isLoading: false,

  setContacts: (contacts) => set({ contacts }),
  addContact: (contact) => set((s) => ({ contacts: [...s.contacts, contact] })),
  updateContact: (id, updates) =>
    set((s) => ({
      contacts: s.contacts.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),
  removeContact: (id) =>
    set((s) => ({ contacts: s.contacts.filter((c) => c.id !== id) })),
  addSOSEvent: (event) => set((s) => ({ sosHistory: [event, ...s.sosHistory] })),
  setCheckInSettings: (enabled, time) =>
    set((s) => ({
      checkInEnabled: enabled,
      checkInTime: time || s.checkInTime,
    })),
  recordCheckIn: () => set({ lastCheckIn: new Date().toISOString() }),
  setLoading: (isLoading) => set({ isLoading }),
}));
