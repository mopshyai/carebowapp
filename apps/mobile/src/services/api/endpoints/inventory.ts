/**
 * Inventory API (service_partner accounts only).
 *
 * The backend gates GET/POST/PATCH/DELETE /v1/inventory to accounts with
 * userType `service_partner` and returns HTTP 403 for everyone else. Since
 * ApiClient throws on non-2xx responses, every method here catches and
 * returns a clean `{success:false, error}` so callers never need a try/catch.
 */

import { ApiClient } from '../ApiClient';
import { ApiError } from '../types';

export interface InventoryItem {
  id: string;
  userId: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  pricePerDay: number;
  isAvailable: boolean;
  threshold: number | null;
  createdAt: string;
}

export interface InventoryListResponse {
  success: boolean;
  error?: string;
  items?: InventoryItem[];
}

export interface InventoryItemResponse {
  success: boolean;
  error?: string;
  item?: InventoryItem;
}

export interface InventoryDeleteResponse {
  success: boolean;
  error?: string;
}

function toErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'An error occurred';
}

export const inventoryApi = {
  list: async (): Promise<InventoryListResponse> => {
    try {
      const response = await ApiClient.get<InventoryListResponse>('/v1/inventory');
      return response.data;
    } catch (error) {
      return { success: false, error: toErrorMessage(error) };
    }
  },

  create: async (data: {
    name: string;
    category?: string;
    quantity?: number;
    unit?: string;
    pricePerDay?: number;
    threshold?: number;
  }): Promise<InventoryItemResponse> => {
    try {
      const response = await ApiClient.post<InventoryItemResponse>('/v1/inventory', data);
      return response.data;
    } catch (error) {
      return { success: false, error: toErrorMessage(error) };
    }
  },

  update: async (data: {
    id: string;
    quantity?: number;
    isAvailable?: boolean;
  }): Promise<InventoryItemResponse> => {
    try {
      const response = await ApiClient.patch<InventoryItemResponse>('/v1/inventory', data);
      return response.data;
    } catch (error) {
      return { success: false, error: toErrorMessage(error) };
    }
  },

  remove: async (id: string): Promise<InventoryDeleteResponse> => {
    try {
      const response = await ApiClient.delete<InventoryDeleteResponse>('/v1/inventory', {
        params: { id },
      });
      return response.data;
    } catch (error) {
      return { success: false, error: toErrorMessage(error) };
    }
  },
};

export default inventoryApi;
