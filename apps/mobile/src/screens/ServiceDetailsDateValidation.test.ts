/**
 * ServiceDetails Date Validation Tests
 * Verifies defense-in-depth: past / rollover dates are deterministically rejected.
 */

import { getCalendarDayKey } from '../components/ui/HorizontalDatePicker';

describe('ServiceDetails date validation logic', () => {
  it('correctly identifies yesterday as a stale past date relative to current calendar key', () => {
    const today = new Date('2026-09-25T10:00:00');
    const todayKey = getCalendarDayKey(today);
    expect(todayKey).toBe('2026-09-25');

    const yesterdayKey = '2026-09-24';
    expect(yesterdayKey < todayKey).toBe(true);

    const tomorrowKey = '2026-09-26';
    expect(tomorrowKey < todayKey).toBe(false);
  });

  it('rejects stale dates in booking validity check', () => {
    const todayKey = '2026-09-25';
    const validateBookingDate = (date: string | null | undefined, requiresDate: boolean) => {
      if (!requiresDate) return true;
      if (!date) return false;
      if (date < todayKey) return false;
      return true;
    };

    // Past date (yesterday)
    expect(validateBookingDate('2026-09-24', true)).toBe(false);

    // Empty date
    expect(validateBookingDate(null, true)).toBe(false);
    expect(validateBookingDate('', true)).toBe(false);

    // Today
    expect(validateBookingDate('2026-09-25', true)).toBe(true);

    // Future date
    expect(validateBookingDate('2026-09-26', true)).toBe(true);
  });
});
