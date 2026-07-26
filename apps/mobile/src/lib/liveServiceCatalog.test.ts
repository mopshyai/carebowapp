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

describe('live service catalog adapter', () => {
  it('preserves production identity and pricing without inventing ratings or benefits', () => {
    const service = toBookingService(liveService);
    expect(service.id).toBe('svc-real-1');
    expect(service.title).toBe('Home Nursing Visit');
    expect(service.pricing).toEqual({ type: 'fixed', price: 125 });
    expect(service.rating).toBe(0);
    expect(service.reviewCount).toBe(0);
    expect(service.benefits).toEqual([]);
    expect(service.fulfillment.requiresPayment).toBe(false);
  });

  it('groups only records returned by the API', () => {
    expect(groupLiveServices([liveService])).toEqual([
      expect.objectContaining({ id: 'HOME_CARE', title: 'Home Care' }),
    ]);
  });
});
