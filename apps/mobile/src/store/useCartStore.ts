/**
 * Cart Store
 * Manages shopping cart state and booking drafts
 * Persists cart items to AsyncStorage for offline support
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BookingDraft, CareReferralContext, CartItem, Service } from '@/data/types';
import { calculatePrice } from '@/data/services';
import { getKnownBackendSessionId } from '@/lib/askCarebow/orchestratorClient';
import { useAskCarebowStore } from './askCarebowStore';

type CartStore = {
  items: CartItem[];
  bookingDraft: BookingDraft | null;

  // A short-lived handoff created when Ask CareBow recommends a service.
  // It is deliberately not persisted to AsyncStorage and is consumed by the
  // next booking draft so an old assessment cannot leak into a later booking.
  pendingReferralContext: CareReferralContext | null;
  setCareReferralContext: (context: CareReferralContext) => void;
  clearCareReferralContext: () => void;

  initBookingDraft: (service: Service) => void;
  updateBookingDraft: (updates: Partial<BookingDraft>) => void;
  clearBookingDraft: () => void;
  calculateDraftPricing: () => void;

  addItemFromDraft: () => CartItem | null;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, qty: number) => void;
  clearCart: () => void;

  getTotalItems: () => number;
  getTotalPrice: () => number;
};

const REFERRAL_TTL_MS = 30 * 60 * 1000;
const generateId = () => `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

function isFreshReferral(context: CareReferralContext | null): context is CareReferralContext {
  if (!context) return false;
  const createdAt = Date.parse(context.createdAt);
  if (!Number.isFinite(createdAt)) return false;
  return Date.now() - createdAt <= REFERRAL_TTL_MS;
}

const createInitialDraft = (
  service: Service,
  referralContext: CareReferralContext | null = null
): BookingDraft => {
  let initialPackageId: string | null = null;
  let initialPackageLabel: string | null = null;
  let initialHours: number | null = null;
  let initialDays: number | null = null;

  if (service.pricing.type === 'packages' && service.pricing.packages.length > 0) {
    initialPackageId = service.pricing.packages[0].id;
    initialPackageLabel = service.pricing.packages[0].label;
  } else if (service.pricing.type === 'hourly') {
    initialHours = service.pricing.minHours;
  } else if (service.pricing.type === 'daily') {
    initialDays = service.pricing.minDays;
  }

  const priceCalc = calculatePrice(service.pricing, {
    packageId: initialPackageId || undefined,
    hours: initialHours || undefined,
    days: initialDays || undefined,
  });

  return {
    serviceId: service.id,
    serviceTitle: service.title,
    memberId: referralContext?.profileId ?? null,
    memberName: null,
    date: null,
    startTime: null,
    endTime: null,
    durationMinutes: service.booking.defaultDurationMinutes || null,
    selectedPackageId: initialPackageId,
    selectedPackageLabel: initialPackageLabel,
    hours: initialHours,
    days: initialDays,
    requestNotes: '',
    referralContext,
    subtotal: priceCalc.subtotal,
    discount: priceCalc.discount,
    total: priceCalc.total,
    pricingLabel: priceCalc.label,
  };
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      bookingDraft: null,
      pendingReferralContext: null,

      setCareReferralContext: (context) => {
        const localChatSessionId = useAskCarebowStore.getState().currentSession?.id;
        const backendChatSessionId =
          context.backendChatSessionId ||
          (localChatSessionId ? getKnownBackendSessionId(localChatSessionId) || undefined : undefined);

        set({
          pendingReferralContext: {
            ...context,
            backendChatSessionId,
          },
        });
      },

      clearCareReferralContext: () => {
        set({ pendingReferralContext: null });
      },

      // Initialize booking draft from a service. A valid Ask CareBow handoff is
      // consumed exactly once and becomes part of this booking draft.
      initBookingDraft: (service) => {
        const pending = get().pendingReferralContext;
        const referralContext = isFreshReferral(pending) ? pending : null;
        set({
          bookingDraft: createInitialDraft(service, referralContext),
          pendingReferralContext: null,
        });
      },

      updateBookingDraft: (updates) => {
        set((state) => {
          if (!state.bookingDraft) return state;
          return {
            bookingDraft: {
              ...state.bookingDraft,
              ...updates,
            },
          };
        });
        get().calculateDraftPricing();
      },

      clearBookingDraft: () => {
        set({ bookingDraft: null });
      },

      calculateDraftPricing: () => {
        set((state) => {
          const draft = state.bookingDraft;
          if (!draft) return state;
          return state;
        });
      },

      addItemFromDraft: () => {
        const draft = get().bookingDraft;
        if (!draft) return null;
        if (!draft.memberId || !draft.date || !draft.startTime) return null;

        const cartItem: CartItem = {
          id: generateId(),
          serviceId: draft.serviceId,
          serviceTitle: draft.serviceTitle,
          memberId: draft.memberId,
          memberName: draft.memberName || '',
          date: draft.date,
          startTime: draft.startTime,
          endTime: draft.endTime || undefined,
          durationMinutes: draft.durationMinutes || undefined,
          packageId: draft.selectedPackageId || undefined,
          packageLabel: draft.selectedPackageLabel || undefined,
          hours: draft.hours || undefined,
          days: draft.days || undefined,
          requestNotes: draft.requestNotes,
          referralContext: draft.referralContext,
          subtotal: draft.subtotal,
          discount: draft.discount,
          total: draft.total,
          pricingLabel: draft.pricingLabel,
        };

        set((state) => ({
          items: [...state.items, cartItem],
          bookingDraft: null,
        }));

        return cartItem;
      },

      addItem: (item) => {
        const newItem: CartItem = {
          ...item,
          id: generateId(),
        };
        set((state) => ({ items: [...state.items, newItem] }));
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      updateQuantity: (itemId, qty) => {
        if (qty <= 0) {
          get().removeItem(itemId);
          return;
        }
      },

      clearCart: () => {
        set({ items: [], bookingDraft: null, pendingReferralContext: null });
      },

      getTotalItems: () => get().items.length,
      getTotalPrice: () => get().items.reduce((total, item) => total + item.total, 0),
    }),
    {
      name: '@carebow/cart',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
);
