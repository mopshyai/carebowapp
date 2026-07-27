/**
 * Country pricing display.
 *
 * The property that matters: live rates from the backend override the bundled
 * fallbacks, and a missing or garbled live rate falls back rather than
 * rendering a nonsense price.
 */

import {
  COUNTRIES,
  convertFromUsd,
  formatMoney,
  getEffectiveRate,
  setLiveRates,
  getLiveRates,
} from './countries';

afterEach(() => {
  setLiveRates({}); // back to bundled fallbacks
});

describe('bundled fallbacks', () => {
  it('uses the bundled rate before any live rates arrive', () => {
    expect(getEffectiveRate('IN')).toBe(COUNTRIES.IN.fxRate);
  });

  it('ships rates close to reality, not the stale ones', () => {
    // These were 83 / 0.79 / 1.37 / 1.53 and had drifted badly; AUD by 7%.
    expect(COUNTRIES.IN.fxRate).toBeGreaterThan(90);
    expect(COUNTRIES.GB.fxRate).toBeLessThan(0.78);
    expect(COUNTRIES.AU.fxRate).toBeLessThan(1.5);
  });

  it('treats USD as the base', () => {
    expect(getEffectiveRate('US')).toBe(1);
    expect(convertFromUsd(20, 'US')).toBe(20);
  });
});

describe('live rates', () => {
  it('overrides the bundled rate once hydrated', () => {
    setLiveRates({ INR: 96.62 });
    expect(getEffectiveRate('IN')).toBe(96.62);
  });

  it('changes what a price converts to', () => {
    const before = convertFromUsd(100, 'IN');
    setLiveRates({ INR: 96.62 });
    const after = convertFromUsd(100, 'IN');
    expect(after).not.toBe(0);
    expect(after).toBeGreaterThan(before * 0.5);
  });

  it('falls back per-currency when only some are live', () => {
    setLiveRates({ INR: 96.62 });
    expect(getEffectiveRate('IN')).toBe(96.62);
    expect(getEffectiveRate('GB')).toBe(COUNTRIES.GB.fxRate);
  });

  it('ignores a non-positive or non-finite live rate', () => {
    for (const bad of [0, -5, NaN, Infinity]) {
      setLiveRates({ INR: bad as number });
      expect(getEffectiveRate('IN')).toBe(COUNTRIES.IN.fxRate);
    }
  });

  it('returns a copy so callers cannot mutate the live table', () => {
    setLiveRates({ INR: 96.62 });
    const rates = getLiveRates();
    rates.INR = 1;
    expect(getEffectiveRate('IN')).toBe(96.62);
  });
});

describe('formatMoney', () => {
  it('renders the local currency for the country', () => {
    setLiveRates({ INR: 96.62 });
    const formatted = formatMoney(20, 'IN');
    expect(formatted).toMatch(/1,9\d\d|1,8\d\d/); // 20 * 96.62 rounded to 10
  });

  it('never renders NaN, whatever the rate table says', () => {
    setLiveRates({ INR: NaN as number });
    expect(formatMoney(20, 'IN')).not.toMatch(/NaN/);
  });
});
