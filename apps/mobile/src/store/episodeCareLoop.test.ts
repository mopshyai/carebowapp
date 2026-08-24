import { useEpisodeStore } from './episodeStore';

describe('Ask CareBow longitudinal care loop', () => {
  beforeEach(() => {
    useEpisodeStore.setState({ episodes: [], messages: {}, activeEpisodeId: null });
  });

  function startEpisode() {
    return useEpisodeStore.getState().startEpisode({
      symptomText: 'Fever and cough for two days',
      forWhom: 'family',
      age: 67,
      relationship: 'mother',
    });
  }

  it('moves assessment into an actionable care state', () => {
    const episode = startEpisode();
    expect(episode.careStatus).toBe('assessing');

    useEpisodeStore.getState().setTriageLevel(episode.id, 'soon');
    expect(useEpisodeStore.getState().getEpisode(episode.id)?.careStatus).toBe('assessed');

    useEpisodeStore.getState().markActionRecommended(episode.id);
    expect(useEpisodeStore.getState().getEpisode(episode.id)?.careStatus).toBe(
      'action_recommended'
    );
  });

  it('mirrors the canonical server booking lifecycle', () => {
    const episode = startEpisode();

    useEpisodeStore.getState().linkBooking(episode.id, 'booking_1', 'PENDING');
    expect(useEpisodeStore.getState().getEpisode(episode.id)?.careStatus).toBe('booking_pending');

    useEpisodeStore.getState().linkBooking(episode.id, 'booking_1', 'CONFIRMED');
    expect(useEpisodeStore.getState().getEpisode(episode.id)?.careStatus).toBe('booked');

    useEpisodeStore.getState().linkBooking(episode.id, 'booking_1', 'IN_PROGRESS');
    expect(useEpisodeStore.getState().getEpisode(episode.id)?.careStatus).toBe('care_in_progress');

    useEpisodeStore.getState().linkBooking(episode.id, 'booking_1', 'COMPLETED');
    expect(useEpisodeStore.getState().getEpisode(episode.id)?.careStatus).toBe(
      'awaiting_follow_up'
    );
  });

  it('keeps provider outcome on the originating episode', () => {
    const episode = startEpisode();

    useEpisodeStore.getState().recordProviderOutcome(episode.id, {
      bookingId: 'booking_1',
      providerName: 'Dr CareBow',
      diagnosis: 'Viral upper respiratory infection',
      treatmentPlan: 'Hydration and symptomatic care',
      labTests: ['CBC'],
      nextReview: '3 days',
      recordedAt: new Date().toISOString(),
    });

    const stored = useEpisodeStore.getState().getEpisode(episode.id);
    expect(stored?.linkedBookingId).toBe('booking_1');
    expect(stored?.providerOutcome?.diagnosis).toBe('Viral upper respiratory infection');
    expect(stored?.careStatus).toBe('awaiting_follow_up');
  });

  it('resolves a better follow-up and escalates a worse follow-up', () => {
    const betterEpisode = startEpisode();
    useEpisodeStore.getState().recordFollowUpOutcome(betterEpisode.id, 'better');

    const better = useEpisodeStore.getState().getEpisode(betterEpisode.id);
    expect(better?.careStatus).toBe('resolved');
    expect(better?.isActive).toBe(false);
    expect(better?.resolvedAt).toBeDefined();

    const worseEpisode = startEpisode();
    useEpisodeStore.getState().recordFollowUpOutcome(worseEpisode.id, 'worse');

    const worse = useEpisodeStore.getState().getEpisode(worseEpisode.id);
    expect(worse?.careStatus).toBe('escalated');
    expect(worse?.isActive).toBe(true);
    expect(worse?.escalatedAt).toBeDefined();
  });

  it('reopens a resolved concern if the patient resumes it', () => {
    const episode = startEpisode();
    useEpisodeStore.getState().recordFollowUpOutcome(episode.id, 'better');
    useEpisodeStore.getState().resumeEpisode(episode.id);

    const resumed = useEpisodeStore.getState().getEpisode(episode.id);
    expect(resumed?.isActive).toBe(true);
    expect(resumed?.careStatus).toBe('assessing');
    expect(resumed?.resolvedAt).toBeUndefined();
  });
});
