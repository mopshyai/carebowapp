import type { CareReferralContext, Service } from '@/data/types';
import { useCartStore } from './useCartStore';

const service: Service = {
  id: 'doctor_visit',
  title: 'Doctor Visit',
  categoryId: 'health_care',
  image: 'doctor',
  rating: 4.8,
  reviewCount: 10,
  shortTagline: 'Doctor at home',
  description: 'Test service',
  benefits: [],
  fulfillment: { mode: 'checkout', requiresPayment: true },
  pricing: { type: 'fixed', price: 50 },
  booking: {
    requiresMember: true,
    requiresDate: true,
    requiresTime: true,
  },
};

const referral = (): CareReferralContext => ({
  source: 'ask_carebow',
  episodeId: 'episode_123',
  profileId: 'profile_123',
  triageLevel: 'soon',
  symptoms: ['fever', 'cough'],
  careIntent: 'home_visit',
  createdAt: new Date().toISOString(),
});

beforeEach(() => {
  useCartStore.getState().clearCart();
});

test('consumes Ask CareBow referral into the next booking draft', () => {
  useCartStore.getState().setCareReferralContext(referral());
  useCartStore.getState().initBookingDraft(service);

  const state = useCartStore.getState();
  expect(state.pendingReferralContext).toBeNull();
  expect(state.bookingDraft?.referralContext?.episodeId).toBe('episode_123');
  expect(state.bookingDraft?.memberId).toBe('profile_123');
  expect(state.bookingDraft?.requestNotes).toBe('');
});

test('does not leak a consumed referral into a later unrelated booking', () => {
  useCartStore.getState().setCareReferralContext(referral());
  useCartStore.getState().initBookingDraft(service);
  useCartStore.getState().clearBookingDraft();
  useCartStore.getState().initBookingDraft({ ...service, id: 'physiotherapy' });

  expect(useCartStore.getState().bookingDraft?.referralContext).toBeNull();
  expect(useCartStore.getState().bookingDraft?.memberId).toBeNull();
});

test('drops stale referral context rather than attaching an old assessment', () => {
  useCartStore.getState().setCareReferralContext({
    ...referral(),
    createdAt: new Date(Date.now() - 31 * 60 * 1000).toISOString(),
  });
  useCartStore.getState().initBookingDraft(service);

  expect(useCartStore.getState().bookingDraft?.referralContext).toBeNull();
  expect(useCartStore.getState().bookingDraft?.memberId).toBeNull();
});
