import { classifyHostedCheckoutStatus } from './hostedCheckoutStatus';

describe('classifyHostedCheckoutStatus', () => {
  it('does not call captured custom care paid until the CareRequest is confirmed', () => {
    expect(
      classifyHostedCheckoutStatus({
        success: true,
        status: 'SUCCESS',
        processorStatus: 'SUCCESS',
        resolutionRequired: true,
        kind: 'care_request',
        careRequest: { id: 'care-1', status: 'PAYMENT_PENDING' },
      })
    ).toBe('pending');

    expect(
      classifyHostedCheckoutStatus({
        success: true,
        status: 'SUCCESS',
        kind: 'care_request',
        careRequest: { id: 'care-1', status: 'CANCELLED' },
      })
    ).toBe('pending');
  });

  it('accepts custom-care success only after canonical request confirmation', () => {
    expect(
      classifyHostedCheckoutStatus({
        success: true,
        status: 'SUCCESS',
        processorStatus: 'SUCCESS',
        resolutionRequired: false,
        kind: 'care_request',
        careRequest: { id: 'care-1', status: 'CONFIRMED' },
      })
    ).toBe('paid');
  });

  it('preserves ordinary booking and plan success', () => {
    expect(
      classifyHostedCheckoutStatus({ success: true, status: 'SUCCESS', kind: 'booking' })
    ).toBe('paid');
    expect(
      classifyHostedCheckoutStatus({ success: true, status: 'SUCCESS', kind: 'plan' })
    ).toBe('paid');
  });

  it('treats both failed and refunded checkout as non-payable outcomes', () => {
    expect(classifyHostedCheckoutStatus({ success: true, status: 'FAILED' })).toBe('failed');
    expect(classifyHostedCheckoutStatus({ success: true, status: 'REFUNDED' })).toBe('failed');
  });

  it('keeps unknown or pending server state unconfirmed', () => {
    expect(classifyHostedCheckoutStatus({ success: true, status: 'PENDING' })).toBe('pending');
    expect(classifyHostedCheckoutStatus({ success: true })).toBe('pending');
  });
});
