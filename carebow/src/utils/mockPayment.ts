/**
 * Mock Payment Provider
 * Simulates payment processing for development/testing
 *
 * TODO: Replace with real payment provider (Stripe, RazorPay, etc.)
 */

import { PaymentInfo } from '@/data/types';

// Generate unique payment ID
const generatePaymentId = () => `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export type PaymentResult = {
  success: boolean;
  paymentInfo?: PaymentInfo;
  error?: string;
};

/**
 * Simulate payment processing
 * @param amount - Amount to charge
 * @param delayMs - Simulated processing delay in milliseconds
 * @returns Promise<PaymentResult>
 */
export async function processPayment(
  amount: number,
  delayMs: number = 1500
): Promise<PaymentResult> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, delayMs));

  // Simulate 95% success rate
  const isSuccess = Math.random() > 0.05;

  if (isSuccess) {
    const paymentInfo: PaymentInfo = {
      paymentId: generatePaymentId(),
      status: 'paid',
      paidAt: new Date().toISOString(),
      method: 'mock',
      amount,
    };

    return {
      success: true,
      paymentInfo,
    };
  } else {
    return {
      success: false,
      error: 'Payment declined. Please try again.',
    };
  }
}

/**
 * Simulate booking fee payment
 * @param amount - Booking fee amount
 * @returns Promise<PaymentResult>
 */
export async function processBookingFee(amount: number): Promise<PaymentResult> {
  return processPayment(amount, 1000);
}

/**
 * Format price for display
 * @param amount - Amount in dollars
 * @returns Formatted string
 */
export function formatPrice(amount: number): string {
  return `$${amount.toFixed(0)}`;
}

/**
 * Format price with cents
 * @param amount - Amount in dollars
 * @returns Formatted string with cents
 */
export function formatPriceWithCents(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
