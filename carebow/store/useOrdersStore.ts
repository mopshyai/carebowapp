/**
 * Orders Store
 * Manages completed orders after payment
 *
 * TODO: Persist to AsyncStorage when implementing offline support
 * TODO: Sync with backend API when available
 */

import { create } from 'zustand';
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

export const useOrdersStore = create<OrdersStore>((set, get) => ({
  orders: [],

  // Create order from cart item (after checkout)
  createOrderFromCart: (cartItem, payment) => {
    const now = new Date().toISOString();
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
        taxes: 0, // TODO: Calculate taxes
        total: cartItem.total,
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
        taxes: 0,
        total: draft.total,
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
}));
