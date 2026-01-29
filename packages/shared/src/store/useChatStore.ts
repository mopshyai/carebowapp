import { create } from 'zustand';
import type { ChatSession, ChatMessage, TriageLevel } from '../types';

interface ChatState {
  currentSession: ChatSession | null;
  messages: ChatMessage[];
  isTyping: boolean;
  triageLevel: TriageLevel | null;

  startSession: (memberId?: string, memberName?: string) => void;
  endSession: () => void;
  addMessage: (message: ChatMessage) => void;
  setTyping: (typing: boolean) => void;
  setTriageLevel: (level: TriageLevel) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  currentSession: null,
  messages: [],
  isTyping: false,
  triageLevel: null,

  startSession: (memberId, memberName) =>
    set({
      currentSession: {
        id: `session_${Date.now()}`,
        memberId,
        memberName,
        startedAt: new Date().toISOString(),
      },
      messages: [],
      triageLevel: null,
    }),
  endSession: () =>
    set((s) => ({
      currentSession: s.currentSession
        ? {
            ...s.currentSession,
            endedAt: new Date().toISOString(),
          }
        : null,
    })),
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  setTyping: (isTyping) => set({ isTyping }),
  setTriageLevel: (triageLevel) => set({ triageLevel }),
  clearMessages: () => set({ messages: [], triageLevel: null }),
}));
