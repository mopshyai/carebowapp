/** JWT-authenticated production services catalog. */
import { ApiClient } from '../ApiClient';

export interface V1Service {
  id: string;
  name: string;
  category: string;
  description: string;
  basePrice: number;
  priceUnit: string;
  estimatedDuration?: number | null;
  isAvailable: boolean;
  /** Stable catalog slug, present on the rich (mobile-authored) service rows. */
  slug?: string | null;
  /** Full mobile `Service` object (see `data/types.ts`), present on rich rows only. */
  details?: unknown;
}

interface V1ServicesResponse {
  success: boolean;
  error?: string;
  services?: V1Service[];
}

export const servicesApi = {
  getServices: async (filters?: { category?: string; search?: string }): Promise<V1Service[]> => {
    const response = await ApiClient.get<V1ServicesResponse>('/v1/services', { params: filters });
    if (!response.data.success) throw new Error(response.data.error || 'Unable to load services');
    return response.data.services ?? [];
  },

  getCategories: async (): Promise<string[]> => {
    const services = await servicesApi.getServices();
    return [...new Set(services.map((service) => service.category))];
  },

  getServicesByCategory: async (
    category: string,
    filters?: { search?: string }
  ): Promise<V1Service[]> => servicesApi.getServices({ category, ...filters }),

  searchServices: async (search: string): Promise<V1Service[]> =>
    servicesApi.getServices({ search }),

  getServiceDetails: async (serviceId: string): Promise<V1Service> => {
    const services = await servicesApi.getServices();
    const service = services.find((item) => item.id === serviceId);
    if (!service) throw new Error('Service not found');
    return service;
  },
};

export default servicesApi;
