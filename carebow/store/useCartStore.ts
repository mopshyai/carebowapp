/**
 * Cart Store
 * Manages shopping cart state and booking drafts
 *
 * TODO: Persist to AsyncStorage when implementing offline support
 * TODO: Sync with backend API when available
 */

import { create } from 'zustand';
import { BookingDraft, CartItem, Service, PackageOption } from '@/data/types';
import { calculatePrice } from '@/data/services';

type CartStore = {
  // Cart items
  items: CartItem[];

  // Current booking draft (for ServiceDetails -> Checkout flow)
  bookingDraft: BookingDraft | null;

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

// Generate unique ID
const generateId = () => `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Create initial booking draft from service
const createInitialDraft = (service: Service): BookingDraft => {
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
    memberId: null,
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
    subtotal: priceCalc.subtotal,
    discount: priceCalc.discount,
    total: priceCalc.total,
    pricingLabel: priceCalc.label,
  };
};

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  bookingDraft: null,

  // Initialize booking draft from a service
  initBookingDraft: (service) => {
    set({ bookingDraft: createInitialDraft(service) });
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

      // We need to get the service to calculate pricing
      // This is a bit of a workaround since we don't have the service in the store
      // The actual calculation happens in the component using calculatePrice()
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
    set({ items: [], bookingDraft: null });
  },

  // Get total items count
  getTotalItems: () => {
    return get().items.length;
  },

  // Get total price
  getTotalPrice: () => {
    return get().items.reduce((total, item) => total + item.total, 0);
  },
}));
