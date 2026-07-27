import { groupLiveServices, toBookingService } from './liveServiceCatalog';

const liveService = {
  id: 'svc-real-1',
  name: 'Home Nursing Visit',
  category: 'HOME_CARE',
  description: 'Published by the CareBow service API',
  basePrice: 12500,
  priceUnit: 'visit',
  estimatedDuration: 60,
  isAvailable: true,
};

const richService = {
  id: 'svc-real-2',
  name: 'Expert Home Stay Nurse',
  category: 'NURSE_CARE',
  description: 'Published by the CareBow service API',
  basePrice: 45000,
  priceUnit: 'visit',
  estimatedDuration: 720,
  isAvailable: true,
  slug: 'home-nurse',
  details: {
    id: 'home_nurse',
    title: 'Expert Home Stay Nurse',
    categoryId: 'health_care',
    image: 'nurse',
    rating: 4.8,
    reviewCount: 67,
    shortTagline: 'Professional nursing care at home',
    description: 'Full rich description from the local catalog.',
    benefits: [{ title: 'Certified', description: 'Trained professionals' }],
    fulfillment: { mode: 'checkout', requiresPayment: true },
    pricing: { type: 'fixed', price: 450 },
    booking: { requiresMember: true, requiresDate: true, requiresTime: true },
  },
};

describe('live service catalog adapter', () => {
  it('preserves production identity and pricing without inventing ratings or benefits (legacy rows)', () => {
    const service = toBookingService(liveService);
    expect(service.id).toBe('svc-real-1');
    expect(service.title).toBe('Home Nursing Visit');
    expect(service.pricing).toEqual({ type: 'fixed', price: 125 });
    expect(service.rating).toBe(0);
    expect(service.reviewCount).toBe(0);
    expect(service.benefits).toEqual([]);
    expect(service.fulfillment.requiresPayment).toBe(false);
  });

  it('uses the rich `details` payload and overrides id with the real backend id', () => {
    const service = toBookingService(richService);
    expect(service.id).toBe('svc-real-2');
    expect(service.title).toBe('Expert Home Stay Nurse');
    expect(service.categoryId).toBe('health_care');
    expect(service.rating).toBe(4.8);
    expect(service.pricing).toEqual({ type: 'fixed', price: 450 });
  });

  it('filters out legacy rows without `details` and groups by details.categoryId', () => {
    expect(groupLiveServices([liveService, richService])).toEqual([
      expect.objectContaining({
        id: 'health_care',
        title: 'Health Care',
        items: [expect.objectContaining({ id: 'svc-real-2' })],
      }),
    ]);
  });
});
