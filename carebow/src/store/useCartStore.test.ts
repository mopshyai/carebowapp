/**
 * Cart Store Tests
 * Unit tests for shopping cart state management
 */

import { useCartStore } from './useCartStore';
import { Service } from '@/data/types';

// Mock service for testing
const mockService: Service = {
  id: 'service-1',
  title: 'Test Service',
  shortDescription: 'A test service',
  description: 'Full description of test service',
  categoryId: 'category-1',
  thumbnail: 'https://example.com/image.jpg',
  pricing: {
    type: 'packages',
    packages: [
      { id: 'pkg-1', label: 'Basic', price: 500, description: 'Basic package' },
      { id: 'pkg-2', label: 'Premium', price: 1000, description: 'Premium package' },
    ],
  },
  booking: {
    requiresMember: true,
    defaultDurationMinutes: 60,
    availableSlots: ['09:00', '10:00', '11:00'],
  },
  featured: false,
  popular: false,
  tags: ['test'],
};

const mockHourlyService: Service = {
  ...mockService,
  id: 'service-2',
  title: 'Hourly Service',
  pricing: {
    type: 'hourly',
    ratePerHour: 200,
    minHours: 2,
    maxHours: 8,
  },
};

const mockDailyService: Service = {
  ...mockService,
  id: 'service-3',
  title: 'Daily Service',
  pricing: {
    type: 'daily',
    ratePerDay: 1500,
    minDays: 1,
    maxDays: 30,
  },
};

// Reset store before each test
beforeEach(() => {
  useCartStore.getState().clearCart();
});

// ============================================
// INITIAL STATE
// ============================================

describe('CartStore Initial State', () => {
  it('starts with empty items array', () => {
    const { items } = useCartStore.getState();
    expect(items).toEqual([]);
  });

  it('starts with null booking draft', () => {
    const { bookingDraft } = useCartStore.getState();
    expect(bookingDraft).toBeNull();
  });

  it('getTotalItems returns 0 initially', () => {
    const totalItems = useCartStore.getState().getTotalItems();
    expect(totalItems).toBe(0);
  });

  it('getTotalPrice returns 0 initially', () => {
    const totalPrice = useCartStore.getState().getTotalPrice();
    expect(totalPrice).toBe(0);
  });
});

// ============================================
// BOOKING DRAFT - PACKAGES
// ============================================

describe('CartStore Booking Draft - Packages', () => {
  it('initBookingDraft creates draft from service', () => {
    const store = useCartStore.getState();
    store.initBookingDraft(mockService);

    const { bookingDraft } = useCartStore.getState();
    expect(bookingDraft).not.toBeNull();
    expect(bookingDraft?.serviceId).toBe('service-1');
    expect(bookingDraft?.serviceTitle).toBe('Test Service');
  });

  it('initBookingDraft selects first package by default', () => {
    const store = useCartStore.getState();
    store.initBookingDraft(mockService);

    const { bookingDraft } = useCartStore.getState();
    expect(bookingDraft?.selectedPackageId).toBe('pkg-1');
    expect(bookingDraft?.selectedPackageLabel).toBe('Basic');
  });

  it('initBookingDraft sets null values for unselected fields', () => {
    const store = useCartStore.getState();
    store.initBookingDraft(mockService);

    const { bookingDraft } = useCartStore.getState();
    expect(bookingDraft?.memberId).toBeNull();
    expect(bookingDraft?.memberName).toBeNull();
    expect(bookingDraft?.date).toBeNull();
    expect(bookingDraft?.startTime).toBeNull();
  });
});

// ============================================
// BOOKING DRAFT - HOURLY
// ============================================

describe('CartStore Booking Draft - Hourly', () => {
  it('initBookingDraft sets minHours for hourly service', () => {
    const store = useCartStore.getState();
    store.initBookingDraft(mockHourlyService);

    const { bookingDraft } = useCartStore.getState();
    expect(bookingDraft?.hours).toBe(2); // minHours from mockHourlyService
    expect(bookingDraft?.selectedPackageId).toBeNull();
  });
});

// ============================================
// BOOKING DRAFT - DAILY
// ============================================

describe('CartStore Booking Draft - Daily', () => {
  it('initBookingDraft sets minDays for daily service', () => {
    const store = useCartStore.getState();
    store.initBookingDraft(mockDailyService);

    const { bookingDraft } = useCartStore.getState();
    expect(bookingDraft?.days).toBe(1); // minDays from mockDailyService
    expect(bookingDraft?.hours).toBeNull();
  });
});

// ============================================
// UPDATE BOOKING DRAFT
// ============================================

describe('CartStore Update Booking Draft', () => {
  it('updateBookingDraft updates specific fields', () => {
    const store = useCartStore.getState();
    store.initBookingDraft(mockService);

    store.updateBookingDraft({
      memberId: 'member-1',
      memberName: 'John Doe',
      date: '2024-01-15',
      startTime: '10:00',
    });

    const { bookingDraft } = useCartStore.getState();
    expect(bookingDraft?.memberId).toBe('member-1');
    expect(bookingDraft?.memberName).toBe('John Doe');
    expect(bookingDraft?.date).toBe('2024-01-15');
    expect(bookingDraft?.startTime).toBe('10:00');
  });

  it('updateBookingDraft preserves other fields', () => {
    const store = useCartStore.getState();
    store.initBookingDraft(mockService);

    store.updateBookingDraft({ memberId: 'member-1' });

    const { bookingDraft } = useCartStore.getState();
    expect(bookingDraft?.serviceId).toBe('service-1');
    expect(bookingDraft?.selectedPackageId).toBe('pkg-1');
  });

  it('updateBookingDraft does nothing without draft', () => {
    const store = useCartStore.getState();
    store.updateBookingDraft({ memberId: 'member-1' });

    expect(useCartStore.getState().bookingDraft).toBeNull();
  });

  it('updateBookingDraft can change package selection', () => {
    const store = useCartStore.getState();
    store.initBookingDraft(mockService);

    store.updateBookingDraft({
      selectedPackageId: 'pkg-2',
      selectedPackageLabel: 'Premium',
    });

    const { bookingDraft } = useCartStore.getState();
    expect(bookingDraft?.selectedPackageId).toBe('pkg-2');
    expect(bookingDraft?.selectedPackageLabel).toBe('Premium');
  });
});

// ============================================
// CLEAR BOOKING DRAFT
// ============================================

describe('CartStore Clear Booking Draft', () => {
  it('clearBookingDraft removes draft', () => {
    const store = useCartStore.getState();
    store.initBookingDraft(mockService);

    expect(useCartStore.getState().bookingDraft).not.toBeNull();

    store.clearBookingDraft();

    expect(useCartStore.getState().bookingDraft).toBeNull();
  });
});

// ============================================
// ADD ITEM FROM DRAFT
// ============================================

describe('CartStore Add Item From Draft', () => {
  it('addItemFromDraft creates cart item from complete draft', () => {
    const store = useCartStore.getState();
    store.initBookingDraft(mockService);
    store.updateBookingDraft({
      memberId: 'member-1',
      memberName: 'John Doe',
      date: '2024-01-15',
      startTime: '10:00',
    });

    const item = store.addItemFromDraft();

    expect(item).not.toBeNull();
    expect(item?.serviceId).toBe('service-1');
    expect(item?.memberId).toBe('member-1');
    expect(item?.memberName).toBe('John Doe');
    expect(item?.date).toBe('2024-01-15');
    expect(item?.startTime).toBe('10:00');
    expect(item?.id).toBeDefined();
  });

  it('addItemFromDraft adds item to cart', () => {
    const store = useCartStore.getState();
    store.initBookingDraft(mockService);
    store.updateBookingDraft({
      memberId: 'member-1',
      memberName: 'John Doe',
      date: '2024-01-15',
      startTime: '10:00',
    });

    store.addItemFromDraft();

    const { items } = useCartStore.getState();
    expect(items.length).toBe(1);
  });

  it('addItemFromDraft clears booking draft', () => {
    const store = useCartStore.getState();
    store.initBookingDraft(mockService);
    store.updateBookingDraft({
      memberId: 'member-1',
      memberName: 'John Doe',
      date: '2024-01-15',
      startTime: '10:00',
    });

    store.addItemFromDraft();

    expect(useCartStore.getState().bookingDraft).toBeNull();
  });

  it('addItemFromDraft returns null for incomplete draft', () => {
    const store = useCartStore.getState();
    store.initBookingDraft(mockService);
    // Missing memberId, date, startTime

    const item = store.addItemFromDraft();

    expect(item).toBeNull();
  });

  it('addItemFromDraft returns null without draft', () => {
    const item = useCartStore.getState().addItemFromDraft();
    expect(item).toBeNull();
  });

  it('addItemFromDraft returns null without memberId', () => {
    const store = useCartStore.getState();
    store.initBookingDraft(mockService);
    store.updateBookingDraft({
      date: '2024-01-15',
      startTime: '10:00',
      // Missing memberId
    });

    const item = store.addItemFromDraft();
    expect(item).toBeNull();
  });

  it('addItemFromDraft returns null without date', () => {
    const store = useCartStore.getState();
    store.initBookingDraft(mockService);
    store.updateBookingDraft({
      memberId: 'member-1',
      startTime: '10:00',
      // Missing date
    });

    const item = store.addItemFromDraft();
    expect(item).toBeNull();
  });

  it('addItemFromDraft returns null without startTime', () => {
    const store = useCartStore.getState();
    store.initBookingDraft(mockService);
    store.updateBookingDraft({
      memberId: 'member-1',
      date: '2024-01-15',
      // Missing startTime
    });

    const item = store.addItemFromDraft();
    expect(item).toBeNull();
  });
});

// ============================================
// ADD ITEM DIRECTLY
// ============================================

describe('CartStore Add Item Directly', () => {
  it('addItem adds item with generated id', () => {
    const store = useCartStore.getState();

    store.addItem({
      serviceId: 'service-1',
      serviceTitle: 'Test Service',
      memberId: 'member-1',
      memberName: 'John Doe',
      date: '2024-01-15',
      startTime: '10:00',
      requestNotes: '',
      subtotal: 500,
      discount: 0,
      total: 500,
      pricingLabel: '₹500',
    });

    const { items } = useCartStore.getState();
    expect(items.length).toBe(1);
    expect(items[0].id).toBeDefined();
    expect(items[0].serviceId).toBe('service-1');
  });

  it('addItem can add multiple items', () => {
    const store = useCartStore.getState();

    store.addItem({
      serviceId: 'service-1',
      serviceTitle: 'Service 1',
      memberId: 'member-1',
      memberName: 'John',
      date: '2024-01-15',
      startTime: '10:00',
      requestNotes: '',
      subtotal: 500,
      discount: 0,
      total: 500,
      pricingLabel: '₹500',
    });

    store.addItem({
      serviceId: 'service-2',
      serviceTitle: 'Service 2',
      memberId: 'member-2',
      memberName: 'Jane',
      date: '2024-01-16',
      startTime: '11:00',
      requestNotes: '',
      subtotal: 700,
      discount: 0,
      total: 700,
      pricingLabel: '₹700',
    });

    const { items } = useCartStore.getState();
    expect(items.length).toBe(2);
  });
});

// ============================================
// REMOVE ITEM
// ============================================

describe('CartStore Remove Item', () => {
  it('removeItem removes item by id', () => {
    const store = useCartStore.getState();

    store.addItem({
      serviceId: 'service-1',
      serviceTitle: 'Test Service',
      memberId: 'member-1',
      memberName: 'John',
      date: '2024-01-15',
      startTime: '10:00',
      requestNotes: '',
      subtotal: 500,
      discount: 0,
      total: 500,
      pricingLabel: '₹500',
    });

    const { items } = useCartStore.getState();
    const itemId = items[0].id;

    store.removeItem(itemId);

    expect(useCartStore.getState().items.length).toBe(0);
  });

  it('removeItem only removes specified item', () => {
    const store = useCartStore.getState();

    store.addItem({
      serviceId: 'service-1',
      serviceTitle: 'Service 1',
      memberId: 'member-1',
      memberName: 'John',
      date: '2024-01-15',
      startTime: '10:00',
      requestNotes: '',
      subtotal: 500,
      discount: 0,
      total: 500,
      pricingLabel: '₹500',
    });

    store.addItem({
      serviceId: 'service-2',
      serviceTitle: 'Service 2',
      memberId: 'member-2',
      memberName: 'Jane',
      date: '2024-01-16',
      startTime: '11:00',
      requestNotes: '',
      subtotal: 700,
      discount: 0,
      total: 700,
      pricingLabel: '₹700',
    });

    const { items } = useCartStore.getState();
    const firstItemId = items[0].id;

    store.removeItem(firstItemId);

    const updatedItems = useCartStore.getState().items;
    expect(updatedItems.length).toBe(1);
    expect(updatedItems[0].serviceId).toBe('service-2');
  });

  it('removeItem with non-existent id does nothing', () => {
    const store = useCartStore.getState();

    store.addItem({
      serviceId: 'service-1',
      serviceTitle: 'Test Service',
      memberId: 'member-1',
      memberName: 'John',
      date: '2024-01-15',
      startTime: '10:00',
      requestNotes: '',
      subtotal: 500,
      discount: 0,
      total: 500,
      pricingLabel: '₹500',
    });

    store.removeItem('non-existent-id');

    expect(useCartStore.getState().items.length).toBe(1);
  });
});

// ============================================
// UPDATE QUANTITY
// ============================================

describe('CartStore Update Quantity', () => {
  it('updateQuantity with 0 removes item', () => {
    const store = useCartStore.getState();

    store.addItem({
      serviceId: 'service-1',
      serviceTitle: 'Test Service',
      memberId: 'member-1',
      memberName: 'John',
      date: '2024-01-15',
      startTime: '10:00',
      requestNotes: '',
      subtotal: 500,
      discount: 0,
      total: 500,
      pricingLabel: '₹500',
    });

    const { items } = useCartStore.getState();
    const itemId = items[0].id;

    store.updateQuantity(itemId, 0);

    expect(useCartStore.getState().items.length).toBe(0);
  });

  it('updateQuantity with negative value removes item', () => {
    const store = useCartStore.getState();

    store.addItem({
      serviceId: 'service-1',
      serviceTitle: 'Test Service',
      memberId: 'member-1',
      memberName: 'John',
      date: '2024-01-15',
      startTime: '10:00',
      requestNotes: '',
      subtotal: 500,
      discount: 0,
      total: 500,
      pricingLabel: '₹500',
    });

    const { items } = useCartStore.getState();
    const itemId = items[0].id;

    store.updateQuantity(itemId, -1);

    expect(useCartStore.getState().items.length).toBe(0);
  });
});

// ============================================
// CLEAR CART
// ============================================

describe('CartStore Clear Cart', () => {
  it('clearCart removes all items', () => {
    const store = useCartStore.getState();

    store.addItem({
      serviceId: 'service-1',
      serviceTitle: 'Service 1',
      memberId: 'member-1',
      memberName: 'John',
      date: '2024-01-15',
      startTime: '10:00',
      requestNotes: '',
      subtotal: 500,
      discount: 0,
      total: 500,
      pricingLabel: '₹500',
    });

    store.addItem({
      serviceId: 'service-2',
      serviceTitle: 'Service 2',
      memberId: 'member-2',
      memberName: 'Jane',
      date: '2024-01-16',
      startTime: '11:00',
      requestNotes: '',
      subtotal: 700,
      discount: 0,
      total: 700,
      pricingLabel: '₹700',
    });

    expect(useCartStore.getState().items.length).toBe(2);

    store.clearCart();

    expect(useCartStore.getState().items.length).toBe(0);
  });

  it('clearCart also clears booking draft', () => {
    const store = useCartStore.getState();
    store.initBookingDraft(mockService);

    expect(useCartStore.getState().bookingDraft).not.toBeNull();

    store.clearCart();

    expect(useCartStore.getState().bookingDraft).toBeNull();
  });
});

// ============================================
// GETTERS
// ============================================

describe('CartStore Getters', () => {
  it('getTotalItems returns correct count', () => {
    const store = useCartStore.getState();

    expect(store.getTotalItems()).toBe(0);

    store.addItem({
      serviceId: 'service-1',
      serviceTitle: 'Service 1',
      memberId: 'member-1',
      memberName: 'John',
      date: '2024-01-15',
      startTime: '10:00',
      requestNotes: '',
      subtotal: 500,
      discount: 0,
      total: 500,
      pricingLabel: '₹500',
    });

    expect(useCartStore.getState().getTotalItems()).toBe(1);

    store.addItem({
      serviceId: 'service-2',
      serviceTitle: 'Service 2',
      memberId: 'member-2',
      memberName: 'Jane',
      date: '2024-01-16',
      startTime: '11:00',
      requestNotes: '',
      subtotal: 700,
      discount: 0,
      total: 700,
      pricingLabel: '₹700',
    });

    expect(useCartStore.getState().getTotalItems()).toBe(2);
  });

  it('getTotalPrice returns correct sum', () => {
    const store = useCartStore.getState();

    expect(store.getTotalPrice()).toBe(0);

    store.addItem({
      serviceId: 'service-1',
      serviceTitle: 'Service 1',
      memberId: 'member-1',
      memberName: 'John',
      date: '2024-01-15',
      startTime: '10:00',
      requestNotes: '',
      subtotal: 500,
      discount: 0,
      total: 500,
      pricingLabel: '₹500',
    });

    expect(useCartStore.getState().getTotalPrice()).toBe(500);

    store.addItem({
      serviceId: 'service-2',
      serviceTitle: 'Service 2',
      memberId: 'member-2',
      memberName: 'Jane',
      date: '2024-01-16',
      startTime: '11:00',
      requestNotes: '',
      subtotal: 700,
      discount: 50,
      total: 650,
      pricingLabel: '₹650',
    });

    expect(useCartStore.getState().getTotalPrice()).toBe(1150); // 500 + 650
  });

  it('getTotalPrice handles discounts correctly', () => {
    const store = useCartStore.getState();

    store.addItem({
      serviceId: 'service-1',
      serviceTitle: 'Service 1',
      memberId: 'member-1',
      memberName: 'John',
      date: '2024-01-15',
      startTime: '10:00',
      requestNotes: '',
      subtotal: 1000,
      discount: 200,
      total: 800, // Uses total, not subtotal - discount
      pricingLabel: '₹800',
    });

    expect(useCartStore.getState().getTotalPrice()).toBe(800);
  });
});
