/**
 * Orders Store (New Version with Persistence)
 * Manages paid service orders with full pricing breakdown and payment tracking
 */

import React from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Order,
  OrderStatus,
  BookingCore,
  PaymentInfo,
  PaymentProvider,
  money,
  generateBookingId,
} from '@/types/booking';

// ============================================
// STORE TYPES
// ============================================

type OrdersState = {
  orders: Order[];
};

type OrdersActions = {
  // Create a pending order (before payment)
  createPendingOrder: (draft: BookingCore) => Order;

  // Payment status updates
  markPaymentSuccess: (orderId: string, paymentId: string, provider: PaymentProvider) => void;
  markPaymentFailure: (orderId: string, reason: string) => void;

  // Order status updates
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  cancelOrder: (orderId: string) => void;
  refundOrder: (orderId: string) => void;
  fulfillOrder: (orderId: string) => void;

  // Getters
  getOrderById: (orderId: string) => Order | undefined;
  getOrdersByMember: (memberId: string) => Order[];
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getOrdersByService: (serviceId: string) => Order[];
  getPendingOrders: () => Order[];
  getPaidOrders: () => Order[];

  // Clear
  clearOrders: () => void;
};

type OrdersStore = OrdersState & OrdersActions;

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useOrdersStore = create<OrdersStore>()(
  persist(
    (set, get) => ({
      orders: [],

      /**
       * Create a pending order from BookingCore
       * Payment status is set to "pending", orderStatus is "created"
       */
      createPendingOrder: (draft: BookingCore): Order => {
        const now = new Date().toISOString();

        const pendingPayment: PaymentInfo = {
          provider: 'mock',
          status: 'pending',
          amount: draft.pricing.total,
        };

        const newOrder: Order = {
          ...draft,
          id: draft.id || generateBookingId('ord'),
          kind: 'order',
          orderStatus: 'created',
          payment: pendingPayment,
          createdAtISO: draft.createdAtISO || now,
          updatedAtISO: now,
        };

        set((state) => ({
          orders: [newOrder, ...state.orders],
        }));

        console.log('[OrdersStore] Created pending order:', newOrder.id);
        return newOrder;
      },

      /**
       * Mark payment as successful
       */
      markPaymentSuccess: (orderId: string, paymentId: string, provider: PaymentProvider) => {
        const now = new Date().toISOString();

        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  orderStatus: 'paid' as OrderStatus,
                  payment: {
                    ...order.payment,
                    status: 'paid',
                    provider,
                    paymentId,
                    paidAtISO: now,
                    failureReason: undefined,
                  },
                  updatedAtISO: now,
                }
              : order
          ),
        }));

        console.log('[OrdersStore] Payment success for order:', orderId);
      },

      /**
       * Mark payment as failed
       */
      markPaymentFailure: (orderId: string, reason: string) => {
        const now = new Date().toISOString();

        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  orderStatus: 'created' as OrderStatus,
                  payment: {
                    ...order.payment,
                    status: 'failed',
                    failureReason: reason,
                  },
                  updatedAtISO: now,
                }
              : order
          ),
        }));

        console.log('[OrdersStore] Payment failed for order:', orderId, reason);
      },

      /**
       * Update order status
       */
      updateOrderStatus: (orderId: string, status: OrderStatus) => {
        const now = new Date().toISOString();

        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? { ...order, orderStatus: status, updatedAtISO: now }
              : order
          ),
        }));
      },

      /**
       * Cancel an order
       */
      cancelOrder: (orderId: string) => {
        const now = new Date().toISOString();

        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? { ...order, orderStatus: 'cancelled' as OrderStatus, updatedAtISO: now }
              : order
          ),
        }));

        console.log('[OrdersStore] Cancelled order:', orderId);
      },

      /**
       * Refund an order
       */
      refundOrder: (orderId: string) => {
        const now = new Date().toISOString();

        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  orderStatus: 'refunded' as OrderStatus,
                  payment: { ...order.payment, status: 'refunded' },
                  updatedAtISO: now,
                }
              : order
          ),
        }));

        console.log('[OrdersStore] Refunded order:', orderId);
      },

      /**
       * Mark order as fulfilled
       */
      fulfillOrder: (orderId: string) => {
        const now = new Date().toISOString();

        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? { ...order, orderStatus: 'fulfilled' as OrderStatus, updatedAtISO: now }
              : order
          ),
        }));

        console.log('[OrdersStore] Fulfilled order:', orderId);
      },

      /**
       * Get order by ID
       */
      getOrderById: (orderId: string): Order | undefined => {
        return get().orders.find((order) => order.id === orderId);
      },

      /**
       * Get orders by member ID
       */
      getOrdersByMember: (memberId: string): Order[] => {
        return get().orders.filter((order) => order.memberId === memberId);
      },

      /**
       * Get orders by status
       */
      getOrdersByStatus: (status: OrderStatus): Order[] => {
        return get().orders.filter((order) => order.orderStatus === status);
      },

      /**
       * Get orders by service ID
       */
      getOrdersByService: (serviceId: string): Order[] => {
        return get().orders.filter((order) => order.serviceId === serviceId);
      },

      /**
       * Get pending orders (created but not paid)
       */
      getPendingOrders: (): Order[] => {
        return get().orders.filter((order) => order.orderStatus === 'created');
      },

      /**
       * Get paid orders
       */
      getPaidOrders: (): Order[] => {
        return get().orders.filter((order) => order.orderStatus === 'paid');
      },

      /**
       * Clear all orders (for testing)
       */
      clearOrders: () => {
        set({ orders: [] });
        console.log('[OrdersStore] Cleared all orders');
      },
    }),
    {
      name: 'carebow-orders-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ orders: state.orders }),
    }
  )
);

// ============================================
// SELECTOR HOOKS - With stable references
// ============================================

// Stable selector to get orders array
const selectOrders = (state: OrdersState) => state.orders;

/**
 * Get all orders sorted by creation date (newest first)
 * Uses shallow equality check to prevent unnecessary re-renders
 */
export const useAllOrders = () => {
  const orders = useOrdersStore(selectOrders);
  return React.useMemo(() => {
    if (orders.length === 0) return [];
    return [...orders].sort(
      (a, b) => new Date(b.createdAtISO).getTime() - new Date(a.createdAtISO).getTime()
    );
  }, [orders]);
};

/**
 * Get order count
 */
export const useOrderCount = () => useOrdersStore((state) => state.orders.length);

/**
 * Get orders for a specific member
 */
export const useMemberOrders = (memberId: string) => {
  const orders = useOrdersStore(selectOrders);
  return React.useMemo(() => {
    if (orders.length === 0) return [];
    return orders
      .filter((order) => order.memberId === memberId)
      .sort((a, b) => new Date(b.createdAtISO).getTime() - new Date(a.createdAtISO).getTime());
  }, [orders, memberId]);
};
