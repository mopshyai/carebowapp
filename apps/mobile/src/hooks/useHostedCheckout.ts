/**
 * Hosted Razorpay checkout.
 *
 * The app never declares a payment successful. Razorpay collects in the system
 * browser, the webhook updates the server, and this hook polls that server truth
 * when the app becomes active again.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking } from 'react-native';
import { paymentsApi, type PaymentStatusResponse } from '../services/api/endpoints/payments';

const POLL_ATTEMPTS = 6;
const POLL_INTERVAL_MS = 2000;

export type CheckoutOutcome =
  | { status: 'paid'; payment: PaymentStatusResponse }
  | { status: 'failed' }
  | { status: 'unconfirmed' };

export type UseHostedCheckout = {
  busy: boolean;
  start: (args: { orderId: string; paymentUrl: string }) => Promise<CheckoutOutcome>;
};

type PendingCheckout = {
  orderId: string;
  promise: Promise<CheckoutOutcome>;
  resolve: (outcome: CheckoutOutcome) => void;
};

export function useHostedCheckout(): UseHostedCheckout {
  /**
   * The pending operation lives in a ref because AppState callbacks and rapid
   * taps must see the current value synchronously; React state rerenders later.
   */
  const pending = useRef<PendingCheckout | null>(null);
  const [busy, setBusy] = useState(false);

  const finish = useCallback((outcome: CheckoutOutcome) => {
    const current = pending.current;
    if (!current) return;

    pending.current = null;
    setBusy(false);
    current.resolve(outcome);
  }, []);

  const check = useCallback(async () => {
    const current = pending.current;
    if (!current) return;
    const orderId = current.orderId;

    for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt++) {
      if (pending.current?.orderId !== orderId) return;

      try {
        const response = await paymentsApi.getPaymentStatus(orderId);
        if (response.status === 'SUCCESS') {
          finish({ status: 'paid', payment: response });
          return;
        }
        if (response.status === 'FAILED') {
          finish({ status: 'failed' });
          return;
        }
      } catch {
        // A network blip is not a payment outcome. Keep polling.
      }

      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }

    // Never call a slow webhook a failed payment. The customer must be told to
    // check the schedule/receipt before trying to pay again.
    if (pending.current?.orderId === orderId) {
      finish({ status: 'unconfirmed' });
    }
  }, [finish]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && pending.current) void check();
    });
    return () => subscription.remove();
  }, [check]);

  useEffect(
    () => () => {
      // The old implementation nulled the resolver here, leaving start()'s
      // promise permanently pending. Resolve conservatively instead.
      const current = pending.current;
      pending.current = null;
      current?.resolve({ status: 'unconfirmed' });
    },
    []
  );

  const start = useCallback(
    ({ orderId, paymentUrl }: { orderId: string; paymentUrl: string }): Promise<CheckoutOutcome> => {
      const current = pending.current;
      if (current) {
        // Two rapid taps for the same server order share one browser launch and
        // one outcome. This is synchronous; it does not wait for a rerender.
        if (current.orderId === orderId) return current.promise;

        // A different checkout cannot replace one already in flight. Financially
        // the safest answer is "unconfirmed", which tells the caller not to make
        // another payment until the existing one is checked.
        return Promise.resolve({ status: 'unconfirmed' });
      }

      let resolveOutcome!: (outcome: CheckoutOutcome) => void;
      const promise = new Promise<CheckoutOutcome>((resolve) => {
        resolveOutcome = resolve;
      });

      pending.current = { orderId, promise, resolve: resolveOutcome };
      setBusy(true);

      void (async () => {
        try {
          const canOpen = await Linking.canOpenURL(paymentUrl);
          if (!canOpen) throw new Error('No browser available to complete payment');
          await Linking.openURL(paymentUrl);
        } catch {
          finish({ status: 'failed' });
        }
      })();

      return promise;
    },
    [finish]
  );

  return { busy, start };
}
