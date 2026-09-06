import {
  canCancelProviderFulfillment,
  primaryProviderFulfillmentAction,
} from './providerFulfillmentActions';

describe('provider fulfillment action policy', () => {
  it('does not allow lab reporting without evidence', () => {
    expect(primaryProviderFulfillmentAction('lab', 'ORDERED')).toEqual({
      status: 'SAMPLE_COLLECTED',
      label: 'Mark sample collected',
    });
    expect(primaryProviderFulfillmentAction('lab', 'SAMPLE_COLLECTED')).toEqual({
      status: 'PROCESSING',
      label: 'Start processing',
    });
    expect(primaryProviderFulfillmentAction('lab', 'PROCESSING')).toBeNull();
  });

  it('only completes equipment after return rather than delivery', () => {
    expect(primaryProviderFulfillmentAction('equipment', 'OUT_FOR_DELIVERY')?.status).toBe('DELIVERED');
    expect(primaryProviderFulfillmentAction('equipment', 'DELIVERED')?.status).toBe('RETURNED');
  });

  it('completes pharmacy at delivery and ambulance after transit', () => {
    expect(primaryProviderFulfillmentAction('pharmacy', 'OUT_FOR_DELIVERY')?.status).toBe('DELIVERED');
    expect(primaryProviderFulfillmentAction('ambulance', 'IN_TRANSIT')?.status).toBe('COMPLETED');
  });

  it('preserves each native cancellation window', () => {
    expect(canCancelProviderFulfillment('lab', 'PROCESSING')).toBe(true);
    expect(canCancelProviderFulfillment('pharmacy', 'OUT_FOR_DELIVERY')).toBe(false);
    expect(canCancelProviderFulfillment('equipment', 'DELIVERED')).toBe(false);
    expect(canCancelProviderFulfillment('ambulance', 'ARRIVED')).toBe(true);
    expect(canCancelProviderFulfillment('ambulance', 'IN_TRANSIT')).toBe(false);
  });

  it('offers no action for unknown fulfillment', () => {
    expect(primaryProviderFulfillmentAction('unknown' as any, 'PENDING')).toBeNull();
    expect(canCancelProviderFulfillment('unknown' as any, 'PENDING')).toBe(false);
  });
});
