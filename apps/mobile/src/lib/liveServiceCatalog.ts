import type { Service, ServiceCategory } from '@/data/types';
import type { V1Service } from '@/services/api/endpoints/services';

const titleCase = (value: string) =>
  value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const iconForCategory = (category: string): string => {
  const value = category.toLowerCase();
  if (value.includes('doctor') || value.includes('consult')) return 'doctor';
  if (value.includes('nurs')) return 'nurse';
  if (value.includes('lab') || value.includes('diagnostic')) return 'lab';
  if (value.includes('physio')) return 'physio';
  if (value.includes('transport')) return 'transport';
  if (value.includes('food') || value.includes('meal')) return 'food';
  if (value.includes('clean')) return 'cleaning';
  if (value.includes('companion')) return 'companionship';
  return 'healthcheck';
};

export const toBookingService = (source: V1Service): Service => ({
  id: source.id,
  title: source.name,
  categoryId: source.category,
  image: iconForCategory(source.category),
  rating: 0,
  reviewCount: 0,
  shortTagline: source.description,
  description: source.description,
  benefits: [],
  fulfillment: { mode: 'checkout', requiresPayment: false },
  pricing: { type: 'fixed', price: source.basePrice / 100 },
  booking: {
    requiresMember: true,
    requiresDate: true,
    requiresTime: true,
    timeMode: 'start_only',
    defaultDurationMinutes: source.estimatedDuration ?? undefined,
    maxDaysAhead: 30,
  },
  request: {
    enabled: true,
    required: false,
    placeholder: 'Add any information the care team should know',
  },
});

export const groupLiveServices = (services: V1Service[]): ServiceCategory[] => {
  const groups = new Map<string, Service[]>();
  services.forEach((source) => {
    const items = groups.get(source.category) ?? [];
    items.push(toBookingService(source));
    groups.set(source.category, items);
  });
  return [...groups.entries()].map(([id, items]) => ({ id, title: titleCase(id), items }));
};

export const formatInr = (rupees: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees);

/** Preference choices only; the backend confirms actual availability after submission. */
export const preferredTimeOptions = Array.from({ length: 25 }, (_, index) => {
  const totalMinutes = 8 * 60 + index * 30;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
});
