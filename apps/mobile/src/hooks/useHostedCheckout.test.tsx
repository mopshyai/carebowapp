/**
 * Hosted checkout.
 *
 * The app is not present when a payment completes — Razorpay's page is — so
 * every claim this hook makes about money is a claim about what the SERVER
 * said. These cover the three ways that goes wrong: reporting success the
 * server never confirmed, reporting failure for a payment that is merely slow,
 * and losing track of a payment because the app was resumed.
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { useHostedCheckout } from './useHostedCheckout';
import { paymentsApi } from '../services/api/endpoints/payments';

jest.mock('../services/api/endpoints/payments', () => ({
  paymentsApi: { getPaymentStatus: jest.fn() },
}));

const status = paymentsApi.getPaymentStatus as jest.Mock;

let appStateListener: ((state: string) => void) | null = null;

jest.mock('react-native/Libraries/AppState/AppState', () => ({
  addEventListener: (_event: string, handler: (state: string) => void) => {
    appStateListener = handler;
    return { remove: jest.fn() };
  },
}));

/** Bring the app back from the browser, as the OS would. */
const resume = async () => {
  await act(async () => {
    appStateListener?.('active');
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  appStateListener = null;
  jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
  jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined as never);
});

test('reports paid only when the server says SUCCESS', async () => {
  status.mockResolvedValue({ success: true, status: 'SUCCESS', kind: 'booking' });
  const { result } = renderHook(() => useHostedCheckout());

  let outcome: any;
  await act(async () => {
    result.current.start({ orderId: 'order_1', paymentUrl: 'https://rzp.io/i/x' }).then((o) => {
      outcome = o;
    });
  });

  await resume();
  await waitFor(() => expect(outcome?.status).toBe('paid'));
});

test('a payment the server rejected is reported as failed', async () => {
  status.mockResolvedValue({ success: true, status: 'FAILED' });
  const { result } = renderHook(() => useHostedCheckout());

  let outcome: any;
  await act(async () => {
    result.current.start({ orderId: 'order_1', paymentUrl: 'https://rzp.io/i/x' }).then((o) => {
      outcome = o;
    });
  });

  await resume();
  await waitFor(() => expect(outcome?.status).toBe('failed'));
});

test('a payment still pending is unconfirmed, never failed', async () => {
  // The webhook has not landed yet. Calling this a failure is the one outcome
  // that can tell a customer their money vanished when it did not.
  status.mockResolvedValue({ success: true, status: 'PENDING' });
  const { result } = renderHook(() => useHostedCheckout());

  let outcome: any;
  await act(async () => {
    result.current.start({ orderId: 'order_1', paymentUrl: 'https://rzp.io/i/x' }).then((o) => {
      outcome = o;
    });
  });

  await resume();
  await waitFor(() => expect(outcome?.status).toBe('unconfirmed'), { timeout: 20000 });
  expect(status).toHaveBeenCalledTimes(6);
}, 30000);

test('a browser that cannot open fails immediately without charging anything', async () => {
  jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(false);
  const { result } = renderHook(() => useHostedCheckout());

  let outcome: any;
  await act(async () => {
    outcome = await result.current.start({ orderId: 'order_1', paymentUrl: 'bad://url' });
  });

  expect(outcome.status).toBe('failed');
  expect(status).not.toHaveBeenCalled();
});

test('nothing is polled before a payment has been started', async () => {
  renderHook(() => useHostedCheckout());
  await resume();
  expect(status).not.toHaveBeenCalled();
});

test('a network blip on resume does not decide the outcome', async () => {
  status
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValue({ success: true, status: 'SUCCESS' });
  const { result } = renderHook(() => useHostedCheckout());

  let outcome: any;
  await act(async () => {
    result.current.start({ orderId: 'order_1', paymentUrl: 'https://rzp.io/i/x' }).then((o) => {
      outcome = o;
    });
  });

  await resume();
  await waitFor(() => expect(outcome?.status).toBe('paid'), { timeout: 10000 });
}, 15000);
