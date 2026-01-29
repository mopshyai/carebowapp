/**
 * Orders API Endpoints
 */

import { ApiClient } from '../ApiClient';
import {
  CreateOrderRequest,
  OrderResponse,
  OrderListResponse,
  OrderFilters,
} from '../types';

export const ordersApi = {
  /**
   * Create a new order
   */
  createOrder: async (data: CreateOrderRequest): Promise<OrderResponse> => {
    const response = await ApiClient.post<OrderResponse>('/orders', data);
    return response.data;
  },

  /**
   * Get order by ID
   */
  getOrder: async (orderId: string): Promise<OrderResponse> => {
    const response = await ApiClient.get<OrderResponse>(`/orders/${orderId}`);
    return response.data;
  },

  /**
   * Get user's orders with filters
   */
  getOrders: async (filters?: OrderFilters): Promise<OrderListResponse> => {
    const response = await ApiClient.get<OrderListResponse>('/orders', {
      params: filters as Record<string, string | number | boolean | undefined>,
    });
    return response.data;
  },

  /**
   * Get recent orders
   */
  getRecentOrders: async (limit = 5): Promise<OrderResponse[]> => {
    const response = await ApiClient.get<{ orders: OrderResponse[] }>('/orders/recent', {
      params: { limit },
    });
    return response.data.orders;
  },

  /**
   * Cancel an order
   */
  cancelOrder: async (orderId: string, reason?: string): Promise<OrderResponse> => {
    const response = await ApiClient.post<OrderResponse>(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  },

  /**
   * Reschedule an order
   */
  rescheduleOrder: async (
    orderId: string,
    newDate: string,
    newTime: string
  ): Promise<OrderResponse> => {
    const response = await ApiClient.post<OrderResponse>(`/orders/${orderId}/reschedule`, {
      scheduledDate: newDate,
      scheduledTime: newTime,
    });
    return response.data;
  },

  /**
   * Apply coupon to order
   */
  applyCoupon: async (
    orderId: string,
    couponCode: string
  ): Promise<{ discount: number; message: string }> => {
    const response = await ApiClient.post<{ discount: number; message: string }>(
      `/orders/${orderId}/apply-coupon`,
      { couponCode }
    );
    return response.data;
  },

  /**
   * Get order tracking info
   */
  getOrderTracking: async (
    orderId: string
  ): Promise<{
    status: string;
    timeline: Array<{ status: string; timestamp: string; description: string }>;
    provider?: { name: string; phone: string; eta?: string };
  }> => {
    const response = await ApiClient.get<{
      status: string;
      timeline: Array<{ status: string; timestamp: string; description: string }>;
      provider?: { name: string; phone: string; eta?: string };
    }>(`/orders/${orderId}/tracking`);
    return response.data;
  },

  /**
   * Rate completed order
   */
  rateOrder: async (
    orderId: string,
    rating: number,
    review?: string
  ): Promise<{ message: string }> => {
    const response = await ApiClient.post<{ message: string }>(`/orders/${orderId}/rate`, {
      rating,
      review,
    });
    return response.data;
  },

  /**
   * Request invoice for order
   */
  requestInvoice: async (orderId: string): Promise<{ invoiceUrl: string }> => {
    const response = await ApiClient.get<{ invoiceUrl: string }>(`/orders/${orderId}/invoice`);
    return response.data;
  },

  /**
   * Reorder (create new order from previous)
   */
  reorder: async (orderId: string): Promise<OrderResponse> => {
    const response = await ApiClient.post<OrderResponse>(`/orders/${orderId}/reorder`);
    return response.data;
  },
};

export default ordersApi;
