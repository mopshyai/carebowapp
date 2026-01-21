/**
 * Services API Endpoints
 */

import { ApiClient } from '../ApiClient';
import {
  ServiceCategory,
  ServiceListItem,
  ServiceDetails,
  ServicesListResponse,
  ServiceFilters,
} from '../types';

export const servicesApi = {
  /**
   * Get all service categories
   */
  getCategories: async (): Promise<ServiceCategory[]> => {
    const response = await ApiClient.get<{ categories: ServiceCategory[] }>('/services/categories');
    return response.data.categories;
  },

  /**
   * Get services list with filters
   */
  getServices: async (filters?: ServiceFilters): Promise<ServicesListResponse> => {
    const response = await ApiClient.get<ServicesListResponse>('/services', {
      params: filters as Record<string, string | number | boolean | undefined>,
    });
    return response.data;
  },

  /**
   * Get services by category
   */
  getServicesByCategory: async (
    categoryId: string,
    filters?: Omit<ServiceFilters, 'categoryId'>
  ): Promise<ServicesListResponse> => {
    const response = await ApiClient.get<ServicesListResponse>(`/services/category/${categoryId}`, {
      params: filters as Record<string, string | number | boolean | undefined>,
    });
    return response.data;
  },

  /**
   * Search services
   */
  searchServices: async (query: string, filters?: ServiceFilters): Promise<ServicesListResponse> => {
    const response = await ApiClient.get<ServicesListResponse>('/services/search', {
      params: {
        q: query,
        ...filters,
      } as Record<string, string | number | boolean | undefined>,
    });
    return response.data;
  },

  /**
   * Get service details
   */
  getServiceDetails: async (serviceId: string): Promise<ServiceDetails> => {
    const response = await ApiClient.get<ServiceDetails>(`/services/${serviceId}`);
    return response.data;
  },

  /**
   * Get available time slots for a service
   */
  getAvailableSlots: async (
    serviceId: string,
    date: string,
    packageId?: string
  ): Promise<{ slots: Array<{ time: string; available: boolean }> }> => {
    const response = await ApiClient.get<{ slots: Array<{ time: string; available: boolean }> }>(
      `/services/${serviceId}/slots`,
      {
        params: { date, packageId },
      }
    );
    return response.data;
  },

  /**
   * Get popular services
   */
  getPopularServices: async (limit = 10): Promise<ServiceListItem[]> => {
    const response = await ApiClient.get<{ services: ServiceListItem[] }>('/services/popular', {
      params: { limit },
    });
    return response.data.services;
  },

  /**
   * Get recommended services based on user profile
   */
  getRecommendedServices: async (): Promise<ServiceListItem[]> => {
    const response = await ApiClient.get<{ services: ServiceListItem[] }>('/services/recommended');
    return response.data.services;
  },

  /**
   * Check service availability at address
   */
  checkServiceAvailability: async (
    serviceId: string,
    addressId: string
  ): Promise<{ available: boolean; reason?: string }> => {
    const response = await ApiClient.get<{ available: boolean; reason?: string }>(
      `/services/${serviceId}/availability`,
      {
        params: { addressId },
      }
    );
    return response.data;
  },
};

export default servicesApi;
