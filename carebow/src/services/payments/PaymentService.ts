/**
 * Payment Service Implementation
 *
 * This service provides a unified interface for payment processing.
 * Currently uses mock implementation - ready for integration with:
 * - Stripe (international)
 * - Razorpay (India)
 *
 * To integrate with Stripe:
 * 1. npm install @stripe/stripe-react-native
 * 2. Update the implementation methods below to use Stripe APIs
 *
 * To integrate with Razorpay:
 * 1. npm install react-native-razorpay
 * 2. Update the implementation methods below to use Razorpay APIs
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  IPaymentService,
  PaymentRequest,
  PaymentResponse,
  RefundRequest,
  RefundResponse,
  SubscriptionRequest,
  Subscription,
  SavedCard,
  UPIDetails,
  NewCardDetails,
  PaymentError,
} from './types';

// ============================================
// STORAGE KEYS
// ============================================

const STORAGE_KEYS = {
  SAVED_CARDS: '@carebow/saved_cards',
  SAVED_UPI: '@carebow/saved_upi',
};

// ============================================
// MOCK PAYMENT SERVICE
// ============================================

class PaymentServiceImpl implements IPaymentService {
  private initialized = false;
  private savedCards: Map<string, SavedCard[]> = new Map();
  private savedUpi: Map<string, UPIDetails[]> = new Map();
  private payments: Map<string, PaymentResponse> = new Map();
  private subscriptions: Map<string, Subscription> = new Map();

  // ========================================
  // INITIALIZATION
  // ========================================

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Load persisted payment methods
      const cardsJson = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_CARDS);
      if (cardsJson) {
        const cardsData = JSON.parse(cardsJson);
        Object.entries(cardsData).forEach(([customerId, cards]) => {
          this.savedCards.set(customerId, cards as SavedCard[]);
        });
      }

      const upiJson = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_UPI);
      if (upiJson) {
        const upiData = JSON.parse(upiJson);
        Object.entries(upiData).forEach(([customerId, upis]) => {
          this.savedUpi.set(customerId, upis as UPIDetails[]);
        });
      }

      this.initialized = true;
      console.log('[PaymentService] Initialized');

      // TODO: When integrating with Stripe:
      // import { initStripe } from '@stripe/stripe-react-native';
      // await initStripe({
      //   publishableKey: STRIPE_PUBLISHABLE_KEY,
      //   merchantIdentifier: 'merchant.com.carebow',
      // });

      // TODO: When integrating with Razorpay:
      // import RazorpayCheckout from 'react-native-razorpay';
      // (Razorpay is initialized per-payment, no global init needed)
    } catch (error) {
      console.error('[PaymentService] Initialization failed:', error);
    }
  }

  // ========================================
  // PAYMENT PROCESSING
  // ========================================

  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    console.log('[PaymentService] Processing payment:', {
      orderId: request.orderId,
      amount: request.amount,
      method: request.method.type,
    });

    // Simulate network delay
    await this.simulateDelay(1500);

    // TODO: Stripe integration:
    // import { confirmPayment } from '@stripe/stripe-react-native';
    // const { error, paymentIntent } = await confirmPayment(clientSecret, {
    //   paymentMethodType: 'Card',
    // });

    // TODO: Razorpay integration:
    // import RazorpayCheckout from 'react-native-razorpay';
    // const options = {
    //   key: RAZORPAY_KEY_ID,
    //   amount: request.amount,
    //   currency: request.currency,
    //   order_id: razorpayOrderId,
    //   ...
    // };
    // const paymentData = await RazorpayCheckout.open(options);

    // Simulate payment result (95% success rate)
    const isSuccess = Math.random() > 0.05;
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    if (isSuccess) {
      const response: PaymentResponse = {
        paymentId,
        orderId: request.orderId,
        status: 'succeeded',
        amount: request.amount,
        currency: request.currency,
        method: request.method.type === 'new_card' ? 'card' : request.method.type,
        createdAt: now,
        updatedAt: now,
        cardDetails: request.method.type === 'card' || request.method.type === 'new_card'
          ? { last4: '4242', brand: 'visa' }
          : undefined,
        receiptUrl: `https://receipts.carebow.com/${paymentId}`,
      };

      this.payments.set(paymentId, response);
      return response;
    } else {
      const response: PaymentResponse = {
        paymentId,
        orderId: request.orderId,
        status: 'failed',
        amount: request.amount,
        currency: request.currency,
        method: request.method.type === 'new_card' ? 'card' : request.method.type,
        createdAt: now,
        updatedAt: now,
        failureReason: 'Payment was declined by your bank',
        failureCode: 'card_declined',
      };

      this.payments.set(paymentId, response);
      throw new PaymentError(
        response.failureReason!,
        'card_declined',
        paymentId
      );
    }
  }

  async handlePaymentAction(paymentId: string, _actionData?: unknown): Promise<PaymentResponse> {
    // Simulate 3DS/OTP verification
    await this.simulateDelay(1000);

    const payment = this.payments.get(paymentId);
    if (!payment) {
      throw new PaymentError('Payment not found', 'unknown', paymentId);
    }

    // Simulate successful authentication
    const updatedPayment: PaymentResponse = {
      ...payment,
      status: 'succeeded',
      updatedAt: new Date().toISOString(),
    };

    this.payments.set(paymentId, updatedPayment);
    return updatedPayment;
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    const payment = this.payments.get(paymentId);
    if (!payment) {
      throw new PaymentError('Payment not found', 'unknown', paymentId);
    }
    return payment;
  }

  // ========================================
  // REFUNDS
  // ========================================

  async requestRefund(request: RefundRequest): Promise<RefundResponse> {
    console.log('[PaymentService] Processing refund:', request);

    await this.simulateDelay(1000);

    const payment = this.payments.get(request.paymentId);
    if (!payment) {
      throw new PaymentError('Payment not found', 'unknown', request.paymentId);
    }

    const refundAmount = request.amount || payment.amount;
    const now = new Date().toISOString();

    // Update payment status
    const updatedPayment: PaymentResponse = {
      ...payment,
      status: refundAmount === payment.amount ? 'refunded' : 'partially_refunded',
      updatedAt: now,
      refund: {
        refundId: `re_${Date.now()}`,
        amount: refundAmount,
        reason: request.reason,
        refundedAt: now,
      },
    };

    this.payments.set(request.paymentId, updatedPayment);

    return {
      refundId: updatedPayment.refund!.refundId,
      paymentId: request.paymentId,
      status: 'succeeded',
      amount: refundAmount,
      reason: request.reason,
      createdAt: now,
    };
  }

  // ========================================
  // SAVED PAYMENT METHODS
  // ========================================

  async getSavedPaymentMethods(customerId: string): Promise<{
    cards: SavedCard[];
    upi: UPIDetails[];
  }> {
    return {
      cards: this.savedCards.get(customerId) || [],
      upi: this.savedUpi.get(customerId) || [],
    };
  }

  async saveCard(customerId: string, card: NewCardDetails): Promise<SavedCard> {
    await this.simulateDelay(500);

    const savedCard: SavedCard = {
      id: `card_${Date.now()}`,
      last4: card.number.slice(-4),
      brand: this.detectCardBrand(card.number),
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      isDefault: true,
      cardholderName: card.cardholderName,
    };

    const customerCards = this.savedCards.get(customerId) || [];
    // Set all other cards as non-default
    customerCards.forEach(c => c.isDefault = false);
    customerCards.push(savedCard);
    this.savedCards.set(customerId, customerCards);

    await this.persistPaymentMethods();

    return savedCard;
  }

  async deleteCard(customerId: string, cardId: string): Promise<void> {
    const customerCards = this.savedCards.get(customerId) || [];
    this.savedCards.set(customerId, customerCards.filter(c => c.id !== cardId));
    await this.persistPaymentMethods();
  }

  // ========================================
  // SUBSCRIPTIONS
  // ========================================

  async createSubscription(request: SubscriptionRequest): Promise<Subscription> {
    console.log('[PaymentService] Creating subscription:', request);

    await this.simulateDelay(1500);

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1); // Monthly by default

    const subscription: Subscription = {
      id: `sub_${Date.now()}`,
      planId: request.planId,
      customerId: request.customerId,
      status: request.trialDays ? 'trialing' : 'active',
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      cancelAtPeriodEnd: false,
      trialEnd: request.trialDays
        ? new Date(now.getTime() + request.trialDays * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
      createdAt: now.toISOString(),
    };

    this.subscriptions.set(subscription.id, subscription);

    return subscription;
  }

  async cancelSubscription(subscriptionId: string, cancelImmediately = false): Promise<Subscription> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new PaymentError('Subscription not found', 'unknown');
    }

    const now = new Date().toISOString();
    const updatedSubscription: Subscription = {
      ...subscription,
      status: cancelImmediately ? 'cancelled' : subscription.status,
      cancelAtPeriodEnd: !cancelImmediately,
      cancelledAt: cancelImmediately ? now : undefined,
    };

    this.subscriptions.set(subscriptionId, updatedSubscription);

    return updatedSubscription;
  }

  async getSubscription(subscriptionId: string): Promise<Subscription> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new PaymentError('Subscription not found', 'unknown');
    }
    return subscription;
  }

  // ========================================
  // UTILITIES
  // ========================================

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private detectCardBrand(number: string): SavedCard['brand'] {
    const firstDigit = number.charAt(0);
    const firstTwo = number.substring(0, 2);

    if (firstDigit === '4') return 'visa';
    if (firstTwo >= '51' && firstTwo <= '55') return 'mastercard';
    if (firstTwo === '34' || firstTwo === '37') return 'amex';
    if (firstTwo === '60' || firstTwo === '65') return 'rupay';
    return 'other';
  }

  private async persistPaymentMethods(): Promise<void> {
    try {
      const cardsObj: Record<string, SavedCard[]> = {};
      this.savedCards.forEach((cards, customerId) => {
        cardsObj[customerId] = cards;
      });
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_CARDS, JSON.stringify(cardsObj));

      const upiObj: Record<string, UPIDetails[]> = {};
      this.savedUpi.forEach((upis, customerId) => {
        upiObj[customerId] = upis;
      });
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_UPI, JSON.stringify(upiObj));
    } catch (error) {
      console.error('[PaymentService] Failed to persist payment methods:', error);
    }
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const PaymentService = new PaymentServiceImpl();
export default PaymentService;
