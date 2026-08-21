jest.mock('../ApiClient', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

import ApiClient from '../ApiClient';
import { paymentsApi, selectionFromDraft } from './payments';

const post = ApiClient.post as jest.Mock;

describe('paymentsApi order single-flight', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shares one backend request across concurrent identical booking-order calls', async () => {
    let resolveRequest!: (value: unknown) => void;
    post.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRequest = resolve;
      })
    );

    const body = {
      serviceId: 'svc_1',
      profileId: 'profile_1',
      scheduledAt: '2026-08-21T15:00:00.000Z',
      selection: { kind: 'fixed' as const },
      hosted: true,
      callbackUrl: 'carebow://checkout/return',
    };

    const first = paymentsApi.createBookingOrder(body);
    const second = paymentsApi.createBookingOrder({ ...body });

    expect(post).toHaveBeenCalledTimes(1);

    resolveRequest({
      data: {
        success: true,
        orderId: 'order_same',
        paymentUrl: 'https://rzp.io/i/same',
      },
    });

    await expect(first).resolves.toMatchObject({ orderId: 'order_same' });
    await expect(second).resolves.toMatchObject({ orderId: 'order_same' });
  });

  it('allows a later intentional retry after the first request settles', async () => {
    post
      .mockResolvedValueOnce({ data: { success: false, error: 'temporary failure' } })
      .mockResolvedValueOnce({ data: { success: true, orderId: 'order_retry' } });

    const body = {
      planSlug: 'customer_pro',
      hosted: true,
      callbackUrl: 'carebow://checkout/return',
    };

    await paymentsApi.createPlanOrder(body);
    await paymentsApi.createPlanOrder(body);

    expect(post).toHaveBeenCalledTimes(2);
  });
});

describe('selectionFromDraft', () => {
  it('refuses a package-priced service until a package is actually selected', () => {
    expect(selectionFromDraft({ pricingModel: 'packages' })).toBeNull();
  });

  it('never guesses an unknown pricing model', () => {
    expect(selectionFromDraft({ pricingModel: 'mystery' })).toBeNull();
  });
});
