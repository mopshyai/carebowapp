/**
 * Hosted checkout.
 *
 * The app has no payment SDK, so paying means leaving: Razorpay's own page
 * collects the money in the system browser and the SERVER hears about it via
 * webhook. The app is not present at the moment of payment, which has one
 * consequence that shapes everything here — the app can never assert that a
 * payment succeeded. It can only ask.
 *
 *   start()             -> open the hosted URL, remember the order id
 *   (customer pays)     -> Razorpay's page, then the webhook
 *   app resumes         -> poll the server until it says what happened
 *
 * This lived inside CheckoutScreen, so it existed for exactly one flow. Paying
 * off a booking and buying a plan need the identical dance, and a second and
 * third copy of "poll, but never claim failure too early" is how one of them
 * ends up telling a customer their payment failed after it went through.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking } from 'react-native';
import { paymentsApi, type PaymentStatusResponse } from '../services/api/endpoints/payments';

/** ~12s of polling. The webhook normally lands in one or two. */
const POLL_ATTEMPTS = 6;
const POLL_INTERVAL_MS = 2000;

export type CheckoutOutcome =
  | { status: 'paid'; payment: PaymentStatusResponse }
  | { status: 'failed' }
  /**
   * Still PENDING after polling. Deliberately NOT reported as failure: the
   * webhook may simply be slow, and telling someone their payment failed when
   * it went through is the worst outcome available.
   */
  | { status: 'unconfirmed' };

export type UseHostedCheckout = {
  /** True from opening the browser until the outcome is known. */
  busy: boolean;
  /**
   * Open a hosted payment URL and resolve once the server has an answer.
   * Resolves 'failed' immediately if the URL cannot be opened at all.
   */
  start: (args: { orderId: string; paymentUrl: string }) => Promise<CheckoutOutcome>;
};

export function useHostedCheckout(): UseHostedCheckout {
  /**
   * A ref, not state: the AppState listener below reads it on resume, and a
   * stale closure would silently stop us checking whether they actually paid.
   */
  const pendingOrderId = useRef<string | null>(null);
  const resolver = useRef<((outcome: CheckoutOutcome) => void) | null>(null);
  const [busy, setBusy] = useState(false);

  const finish = useCallback((outcome: CheckoutOutcome) => {
    pendingOrderId.current = null;
    setBusy(false);
    const resolve = resolver.current;
    resolver.current = null;
    resolve?.(outcome);
  }, []);

  const check = useCallback(async () => {
    const orderId = pendingOrderId.current;
    if (!orderId) return;

    for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt++) {
      // The order id can be cleared by an unmount mid-poll.
      if (pendingOrderId.current !== orderId) return;
      try {
        const res = await paymentsApi.getPaymentStatus(orderId);
        if (res.status === 'SUCCESS') {
          finish({ status: 'paid', payment: res });
          return;
        }
        if (res.status === 'FAILED') {
          finish({ status: 'failed' });
          return;
        }
      } catch {
        // Network blip on resume; the next attempt covers it.
      }
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }

    finish({ status: 'unconfirmed' });
  }, [finish]);

  // The customer leaves the app to pay, so resume is the only signal we get.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && pendingOrderId.current) void check();
    });
    return () => sub.remove();
  }, [check]);

  // A screen unmounted mid-payment must not leave a promise nobody can settle.
  useEffect(
    () => () => {
      pendingOrderId.current = null;
      resolver.current = null;
    },
    []
  );

  const start = useCallback(
    async ({ orderId, paymentUrl }: { orderId: string; paymentUrl: string }) => {
      setBusy(true);
      // Remembered before leaving: on resume we ask the server what happened
      // rather than assuming anything about the outcome.
      pendingOrderId.current = orderId;

      const outcome = new Promise<CheckoutOutcome>((resolve) => {
        resolver.current = resolve;
      });

      try {
        const canOpen = await Linking.canOpenURL(paymentUrl);
        if (!canOpen) throw new Error('No browser available to complete payment');
        await Linking.openURL(paymentUrl);
      } catch {
        finish({ status: 'failed' });
      }

      return outcome;
    },
    [finish]
  );

  return { busy, start };
}
