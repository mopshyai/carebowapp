/** Production services API adapter. */
import { ApiClient } from '../ApiClient';
import {
  ServiceCategory,
  ServiceDetails,
  ServiceFilters,
  ServiceListItem,
  ServicesListResponse,
} from '../types';

export type ProductionService = {
  id: string;
  name: string;
  category: string;
  description: string;
  basePrice: number;
  priceUnit: string;
  estimatedDuration: number | null;
  isAvailable: boolean;
};

type ProductionServicesResponse = { success: boolean; services: ProductionService[] };

const CLIENT_SERVICE_NAMES: Record<string, string> = {
  companionship: 'Companion Care',
  home_nurse: 'Home Nursing Care',
  doctor_visit: 'Doctor Home Visit',
  lab_testing: 'Home Blood Test',
  physiotherapy: 'Physiotherapy Session',
  yoga: 'Yoga for Seniors',
  medicine_delivery: 'Medicine Home Delivery',
  oxygen_concentrator: 'Medical Equipment Rental',
  bpap: 'Medical Equipment Rental',
  cpap: 'Medical Equipment Rental',
  medical_cot_single: 'Medical Equipment Rental',
  medical_cot_two: 'Medical Equipment Rental',
  alfa_bed: 'Medical Equipment Rental',
  cardiac_monitor: 'Medical Equipment Rental',
  syringe_pump: 'Medical Equipment Rental',
};

const toListItem = (service: ProductionService): ServiceListItem => ({
  id: service.id,
  name: service.name,
  shortDescription: service.description,
  categoryId: service.category,
  // Production stores INR prices in paise.
  basePrice: service.basePrice,
  rating: 0,
  reviewCount: 0,
  tags: [],
  isPopular: false,
  isAvailable: service.isAvailable,
});

const toCategory = (category: string, services: ProductionService[]): ServiceCategory => ({
  id: category,
  name: category
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' '),
  icon: 'medical',
  serviceCount: services.filter((service) => service.category === category).length,
});

const fetchProductionServices = async (filters?: Pick<ServiceFilters, 'categoryId' | 'search'>) => {
  const response = await ApiClient.get<ProductionServicesResponse>('/v1/services', {
    params: { category: filters?.categoryId, search: filters?.search },
    retries: 0,
  });
  return response.data.services ?? [];
};

export const servicesApi = {
  getCategories: async (): Promise<ServiceCategory[]> => {
    const services = await fetchProductionServices();
    return [...new Set(services.map((service) => service.category))].map((category) =>
      toCategory(category, services)
    );
  },

  getServices: async (filters?: ServiceFilters): Promise<ServicesListResponse> => {
    const services = await fetchProductionServices(filters);
    const page = Math.max(filters?.page ?? 1, 1);
    const requestedLimit = filters?.limit ?? services.length;
    const limit = Math.max(requestedLimit || 1, 1);
    const filtered = services.filter((service) => {
      if (filters?.minPrice !== undefined && service.basePrice < filters.minPrice) return false;
      if (filters?.maxPrice !== undefined && service.basePrice > filters.maxPrice) return false;
      return true;
    });
    const start = (page - 1) * limit;

    return {
      services: filtered.slice(start, start + limit).map(toListItem),
      categories: [...new Set(services.map((service) => service.category))].map((category) =>
        toCategory(category, services)
      ),
      pagination: {
        page,
        limit,
        total: filtered.length,
        hasMore: start + limit < filtered.length,
      },
    };
  },

  getServicesByCategory: async (
    categoryId: string,
    filters?: Omit<ServiceFilters, 'categoryId'>
  ): Promise<ServicesListResponse> => servicesApi.getServices({ ...filters, categoryId }),

  searchServices: async (search: string, filters?: ServiceFilters): Promise<ServicesListResponse> =>
    servicesApi.getServices({ ...filters, search }),

  getServiceDetails: async (serviceId: string): Promise<ServiceDetails> => {
    const service = (await fetchProductionServices()).find((item) => item.id === serviceId);
    if (!service) throw new Error('Service is not available in the production catalogue.');
    return {
      ...toListItem(service),
      longDescription: service.description,
      features: [],
      packages: [],
    };
  },

  resolveProductionService: async (clientServiceId: string): Promise<ProductionService> => {
    const expectedName = CLIENT_SERVICE_NAMES[clientServiceId];
    if (!expectedName) throw new Error('This service is not yet available for online booking.');

    const services = await fetchProductionServices({ search: expectedName });
    const service = services.find((item) => item.name === expectedName && item.isAvailable);
    if (!service) throw new Error('This service is currently unavailable.');
    return service;
  },

  // These capabilities do not exist in production yet. Do not call fake URLs
  // or fabricate positive availability.
  getAvailableSlots: async (): Promise<{ slots: Array<{ time: string; available: boolean }> }> => ({
    slots: [],
  }),
  getPopularServices: async (): Promise<ServiceListItem[]> => [],
  getRecommendedServices: async (): Promise<ServiceListItem[]> => [],
  checkServiceAvailability: async (): Promise<{ available: boolean; reason?: string }> => ({
    available: false,
    reason: 'Address-level availability is not supported by the production API yet.',
  }),
};

export default servicesApi;
