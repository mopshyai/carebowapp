/**
 * Store exports
 */

// Local stores (mobile-specific implementations)
export { useAuthStore } from './useAuthStore';
export { useCartStore } from './useCartStore';
export { useProfileStore } from './useProfileStore';
export { useAskCarebowStore } from './askCarebowStore';
export { useSymptomEntryStore } from './symptomEntryStore';

// Bookings — server-state cache. Replaces ordersStore / useOrdersStore /
// requestsStore / useServiceRequestStore, which held local order state the
// server never agreed to. Orders and requests are the same Booking.
export {
  useBookingsStore,
  selectActiveBookings,
  selectPastBookings,
  selectBookingById,
  selectIsLoading,
} from './useBookingsStore';
export type { BookingsState } from './useBookingsStore';

// Re-export shared stores and utilities
export { useCurrencyStore, createCurrencyStore } from '@carebow/shared';
export type { CurrencyCode } from '@carebow/shared';
