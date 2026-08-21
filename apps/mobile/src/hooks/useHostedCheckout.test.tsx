/**
 * Hosted checkout tests.
 *
 * Every claim about money comes from the server. These tests also lock down the
 * concurrency boundary so rapid taps cannot replace an in-flight order.
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

test('two rapid starts for the same order share one browser launch and one promise', async () => {
  status.mockResolvedValue({ success: true, status: 'SUCCESS', kind: 'booking' });
  const { result } = renderHook(() => useHostedCheckout());

  let first!: Promise<any>;
  let second!: Promise<any>;
  act(() => {
    first = result.current.start({ orderId: 'order_rapid', paymentUrl: 'https://rzp.io/i/x' });
    second = result.current.start({ orderId: 'order_rapid', paymentUrl: 'https://rzp.io/i/x' });
  });

  expect(first).toBe(second);
  await waitFor(() => expect(Linking.openURL).toHaveBeenCalledTimes(1));

  await resume();
  await expect(first).resolves.toMatchObject({ status: 'paid' });
  await expect(second).resolves.toMatchObject({ status: 'paid' });
});

test('unmounting an in-flight checkout resolves conservatively instead of hanging forever', async () => {
  const { result, unmount } = renderHook(() => useHostedCheckout());

  let pending!: Promise<any>;
  act(() => {
    pending = result.current.start({
      orderId: 'order_unmount',
      paymentUrl: 'https://rzp.io/i/x',
    });
  });

  unmount();
  await expect(pending).resolves.toEqual({ status: 'unconfirmed' });
});
