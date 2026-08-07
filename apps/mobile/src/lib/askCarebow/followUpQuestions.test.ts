import { getFollowUpQuestion, parseUserResponse } from './followUpQuestions';
import { createEmptyHealthContext } from '@/types/askCarebow';

/**
 * Regression coverage for two bugs found together:
 *
 * 1. ConversationScreen.tsx used to send a quick-reply chip's internal
 *    option.value ('just_now', '1_2_weeks', '3') as the chat message text
 *    instead of option.label ('Just started', '1-2 weeks', '1-3 (Mild)') —
 *    so users saw raw enum keys in their own chat bubble. Fixed to send
 *    option.label, which parseUserResponse() below proves round-trips back
 *    to the same canonical value the button was supposed to represent.
 *
 * 2. parseDuration() checked a bare "1-2" (meant for "1-2 days") and a bare
 *    "week" (meant for "3-7 days") before the "1-2 weeks" / "more than 2
 *    weeks" branches — so those checks shadowed week-phrased answers,
 *    including the "1-2 weeks" quick-reply label itself. Fixed by moving
 *    the week-specific checks first.
 */

const CONTEXT = createEmptyHealthContext();

describe('quick-reply labels round-trip through parseUserResponse to their intended value', () => {
  it('every duration option label classifies back to its own value', () => {
    const { quickOptions } = getFollowUpQuestion('duration', CONTEXT);
    expect(quickOptions?.length).toBeGreaterThan(0);
    for (const option of quickOptions!) {
      const parsed = parseUserResponse(option.label, 'duration');
      expect(parsed.duration).toBe(option.value);
    }
  });

  it('specifically: "1-2 weeks" no longer gets misread as "1-2 days" or "3-7 days"', () => {
    const parsed = parseUserResponse('1-2 weeks', 'duration');
    expect(parsed.duration).toBe('1_2_weeks');
  });

  it('"Longer" (more_than_2_weeks label) still classifies correctly after the reorder', () => {
    const parsed = parseUserResponse('Longer', 'duration');
    expect(parsed.duration).toBe('more_than_2_weeks');
  });

  it('every frequency option label classifies back to its own value', () => {
    const { quickOptions } = getFollowUpQuestion('frequency', CONTEXT);
    for (const option of quickOptions!) {
      const parsed = parseUserResponse(option.label, 'frequency');
      expect(parsed.frequency).toBe(option.value);
    }
  });

  it('every severity option label lands in the same qualitative band as its value', () => {
    const { quickOptions } = getFollowUpQuestion('severity', CONTEXT);
    for (const option of quickOptions!) {
      const parsed = parseUserResponse(option.label, 'severity');
      const expectedBand =
        Number(option.value) <= 3
          ? 'mild'
          : Number(option.value) <= 6
            ? 'moderate'
            : Number(option.value) <= 8
              ? 'severe'
              : 'very_severe';
      const actualBand =
        parsed.severity! <= 3
          ? 'mild'
          : parsed.severity! <= 6
            ? 'moderate'
            : parsed.severity! <= 8
              ? 'severe'
              : 'very_severe';
      expect(actualBand).toBe(expectedBand);
    }
  });
});
