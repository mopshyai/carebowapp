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

type CartStore = {
  // Cart items
  items: CartItem[];

  // Current booking draft (for ServiceDetails -> Checkout flow)
  bookingDraft: BookingDraft | null;

  // A short-lived handoff created when Ask CareBow recommends a service.
  // It is deliberately not persisted to AsyncStorage and is consumed by the
  // next booking draft so an old assessment cannot leak into a later booking.
  pendingReferralContext: CareReferralContext | null;
  setCareReferralContext: (context: CareReferralContext) => void;
  clearCareReferralContext: () => void;

  // Booking draft actions
  initBookingDraft: (service: Service) => void;
  updateBookingDraft: (updates: Partial<BookingDraft>) => void;
  clearBookingDraft: () => void;
  calculateDraftPricing: () => void;

  // Cart actions
  addItemFromDraft: () => CartItem | null;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, qty: number) => void;
  clearCart: () => void;

  // Getters
  getTotalItems: () => number;
  getTotalPrice: () => number;
};

const REFERRAL_TTL_MS = 30 * 60 * 1000;

// Generate unique ID
const generateId = () => `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

function isFreshReferral(context: CareReferralContext | null): context is CareReferralContext {
  if (!context) return false;
  const createdAt = Date.parse(context.createdAt);
  if (!Number.isFinite(createdAt)) return false;
  return Date.now() - createdAt <= REFERRAL_TTL_MS;
}

/**
 * Provider-facing handoff generated from the completed clinical assessment.
 * The user can add their own notes below it, while CareBow keeps the triage
 * context attached to the booking instead of making the provider start blind.
 */
export function formatCareReferralNotes(context: CareReferralContext): string {
  const symptoms = context.symptoms
    .map((symptom) => symptom.trim())
    .filter(Boolean)
    .slice(0, 8);

  const lines = [
    'CareBow assessment referral',
    `Triage: ${context.triageLevel.replace('_', ' ')}`,
    symptoms.length > 0 ? `Symptoms: ${symptoms.join(', ')}` : null,
    context.episodeId ? `CareBow episode: ${context.episodeId}` : null,
  ].filter((line): line is string => Boolean(line));

  return lines.join('\n');
}

// Create initial booking draft from service
const createInitialDraft = (
  service: Service,
  referralContext: CareReferralContext | null = null
): BookingDraft => {
  let initialPackageId: string | null = null;
  let initialPackageLabel: string | null = null;
  let initialHours: number | null = null;
  let initialDays: number | null = null;

  // Set initial values based on pricing type
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
    requestNotes: referralContext ? formatCareReferralNotes(referralContext) : '',
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
        set({ pendingReferralContext: context });
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

      // Update booking draft with partial updates
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
        // Recalculate pricing after update
        get().calculateDraftPricing();
      },

      // Clear booking draft
      clearBookingDraft: () => {
        set({ bookingDraft: null });
      },

      // Recalculate pricing for current draft
      calculateDraftPricing: () => {
        set((state) => {
          const draft = state.bookingDraft;
          if (!draft) return state;

          // Pricing is recalculated by ServiceDetails from the live service
          // model. Keeping this action avoids changing existing callers.
          return state;
        });
      },

      // Add current draft to cart
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

      // Add item directly
      addItem: (item) => {
        const newItem: CartItem = {
          ...item,
          id: generateId(),
        };

        set((state) => ({
          items: [...state.items, newItem],
        }));
      },

      // Remove item
      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      // Update quantity (for future multi-quantity support)
      updateQuantity: (itemId, qty) => {
        if (qty <= 0) {
          get().removeItem(itemId);
          return;
        }
        // Currently services are qty=1, but keeping this for future
      },

      // Clear cart
      clearCart: () => {
        set({ items: [], bookingDraft: null, pendingReferralContext: null });
      },

      // Get total items count
      getTotalItems: () => {
        return get().items.length;
      },

      // Get total price
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.total, 0);
      },
    }),
    {
      name: '@carebow/cart',
      storage: createJSONStorage(() => AsyncStorage),
      // Persist only ordinary cart items. Clinical referral state and the
      // active booking draft are intentionally session-scoped.
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
);
