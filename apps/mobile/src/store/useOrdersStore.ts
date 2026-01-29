/**
 * Orders Store
 * Manages completed orders after payment
 * Persists orders to AsyncStorage for offline support
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order, OrderStatus, PaymentInfo, CartItem, BookingDraft } from '@/data/types';

type OrdersStore = {
  orders: Order[];

  // Actions
  createOrderFromCart: (
    cartItem: CartItem,
    payment: PaymentInfo
  ) => Order;

  createOrderFromDraft: (
    draft: BookingDraft,
    payment: PaymentInfo,
    status?: OrderStatus
  ) => Order;

  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOrderPayment: (orderId: string, payment: Partial<PaymentInfo>) => void;
  getOrderById: (orderId: string) => Order | undefined;
  getOrdersByService: (serviceId: string) => Order[];
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getPendingOrders: () => Order[];
  clearOrders: () => void;
};

// Generate unique ID
const generateId = () => `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Tax calculation constants
const TAX_RATES = {
  default: 0.18, // 18% GST (India default)
  services: 0.18, // Healthcare services
  medical: 0.05, // Medical equipment (reduced rate)
  exempt: 0, // Exempt services
};

/**
 * Calculate taxes based on service type and subtotal
 * @param subtotal - Amount before taxes
 * @param serviceType - Type of service for tax rate selection
 * @returns Tax amount
 */
const calculateTaxes = (subtotal: number, serviceType?: string): number => {
  // Determine tax rate based on service type
  let rate = TAX_RATES.default;

  if (serviceType) {
    const lowerType = serviceType.toLowerCase();
    if (lowerType.includes('medical') || lowerType.includes('equipment')) {
      rate = TAX_RATES.medical;
    } else if (lowerType.includes('consultation') || lowerType.includes('exempt')) {
      rate = TAX_RATES.exempt;
    }
  }

  return Math.round(subtotal * rate * 100) / 100; // Round to 2 decimal places
};

export const useOrdersStore = create<OrdersStore>()(
  persist(
    (set, get) => ({
      orders: [],

  // Create order from cart item (after checkout)
  createOrderFromCart: (cartItem, payment) => {
    const now = new Date().toISOString();
    const taxableAmount = cartItem.subtotal - (cartItem.discount || 0);
    const taxes = calculateTaxes(taxableAmount, cartItem.serviceTitle);

    const newOrder: Order = {
      id: generateId(),
      serviceId: cartItem.serviceId,
      serviceTitle: cartItem.serviceTitle,
      memberId: cartItem.memberId,
      memberName: cartItem.memberName,
      schedule: {
        date: cartItem.date,
        startTime: cartItem.startTime,
        endTime: cartItem.endTime,
        durationMinutes: cartItem.durationMinutes,
      },
      pricing: {
        model: cartItem.packageId ? 'packages' : cartItem.hours ? 'hourly' : cartItem.days ? 'daily' : 'fixed',
        packageId: cartItem.packageId,
        packageLabel: cartItem.packageLabel,
        hours: cartItem.hours,
        days: cartItem.days,
        subtotal: cartItem.subtotal,
        discount: cartItem.discount,
        taxes,
        total: taxableAmount + taxes,
        pricingLabel: cartItem.pricingLabel,
      },
      payment,
      requestNotes: cartItem.requestNotes,
      status: payment.status === 'paid' ? 'paid' : 'pending',
      createdAt: now,
      updatedAt: now,
    };

    set((state) => ({
      orders: [...state.orders, newOrder],
    }));

    return newOrder;
  },

  // Create order from booking draft (direct checkout without cart)
  createOrderFromDraft: (draft, payment, status = 'paid') => {
    const now = new Date().toISOString();
    const taxableAmount = draft.subtotal - (draft.discount || 0);
    const taxes = calculateTaxes(taxableAmount, draft.serviceTitle);

    const newOrder: Order = {
      id: generateId(),
      serviceId: draft.serviceId,
      serviceTitle: draft.serviceTitle,
      memberId: draft.memberId || '',
      memberName: draft.memberName || '',
      schedule: {
        date: draft.date || '',
        startTime: draft.startTime || '',
        endTime: draft.endTime || undefined,
        durationMinutes: draft.durationMinutes || undefined,
      },
      pricing: {
        model: draft.selectedPackageId ? 'packages' : draft.hours ? 'hourly' : draft.days ? 'daily' : 'fixed',
        packageId: draft.selectedPackageId || undefined,
        packageLabel: draft.selectedPackageLabel || undefined,
        hours: draft.hours || undefined,
        days: draft.days || undefined,
        subtotal: draft.subtotal,
        discount: draft.discount,
        taxes,
        total: taxableAmount + taxes,
        pricingLabel: draft.pricingLabel,
      },
      payment,
      requestNotes: draft.requestNotes,
      status,
      createdAt: now,
      updatedAt: now,
    };

    set((state) => ({
      orders: [...state.orders, newOrder],
    }));

    return newOrder;
  },

  // Update order status
  updateOrderStatus: (orderId, status) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId
          ? { ...order, status, updatedAt: new Date().toISOString() }
          : order
      ),
    }));
  },

  // Update order payment info
  updateOrderPayment: (orderId, paymentUpdate) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              payment: { ...order.payment, ...paymentUpdate },
              updatedAt: new Date().toISOString(),
            }
          : order
      ),
    }));
  },

  // Get order by ID
  getOrderById: (orderId) => {
    return get().orders.find((order) => order.id === orderId);
  },

  // Get orders by service ID
  getOrdersByService: (serviceId) => {
    return get().orders.filter((order) => order.serviceId === serviceId);
  },

  // Get orders by status
  getOrdersByStatus: (status) => {
    return get().orders.filter((order) => order.status === status);
  },

  // Get pending orders
  getPendingOrders: () => {
    return get().orders.filter((order) => order.status === 'pending');
  },

  // Clear all orders
  clearOrders: () => {
    set({ orders: [] });
  },
    }),
    {
      name: '@carebow/orders',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
