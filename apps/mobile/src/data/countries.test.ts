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
  settlementCurrencyFor,
  formatMinor,
  setServerCurrency,
  getServerCurrency,
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

  it('never applies a rate to a country that settles in dollars', () => {
    setLiveRates({ INR: 96.62, GBP: 0.75 });
    expect(getEffectiveRate('IN')).toBe(96.62);
    // The UK settles in USD now, so the catalog figure is the price. A GBP rate
    // in the table must not touch it — that was the six-currency display
    // fiction, where a customer saw £15 and was charged something else.
    expect(getEffectiveRate('GB')).toBe(1);
    expect(convertFromUsd(20, 'GB')).toBe(20);
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

describe('two settlement currencies', () => {
  it('quotes India in rupees and everyone else in dollars', () => {
    expect(settlementCurrencyFor('IN')).toBe('INR');
    for (const code of ['US', 'GB', 'AE', 'CA', 'AU'] as const) {
      expect(settlementCurrencyFor(code)).toBe('USD');
    }
  });

  it('treats an unknown country as dollars', () => {
    // Matches currencyForCountry() on the server. If these disagree, the app
    // shows one price and the Razorpay page shows another.
    expect(settlementCurrencyFor(null)).toBe('USD');
    expect(settlementCurrencyFor(undefined)).toBe('USD');
  });

  it('shows dollars for every non-Indian country', () => {
    setLiveRates({ INR: 96.62 });
    for (const code of ['US', 'GB', 'AE', 'CA', 'AU'] as const) {
      expect(formatMoney(20, code)).toContain('$');
      expect(formatMoney(20, code)).toContain('20');
    }
    expect(formatMoney(20, 'IN')).toContain('₹');
  });

  it('formatMinor does not convert an amount the server already decided', () => {
    setLiveRates({ INR: 96.62 });
    // 483000 paise IS ₹4,830. Running it through the USD->INR rate again would
    // render ₹466,578.
    expect(formatMinor(483000, 'INR')).toContain('4,830');
    expect(formatMinor(5000, 'USD')).toContain('50');
  });

  it('formatMinor treats an unrecognised currency as dollars, not as rupees', () => {
    expect(formatMinor(5000, 'EUR')).toContain('$');
  });
});

describe("the server's currency wins", () => {
  afterEach(() => setServerCurrency(null));

  it('overrides the local rule for the current customer', () => {
    setLiveRates({ INR: 96.62 });
    // The server knows something the app cannot: whether the processor can
    // collect dollars at all. If it says rupees, a US customer is shown rupees.
    setServerCurrency('INR');
    expect(formatMoney(20, 'US')).toContain('₹');
    expect(getEffectiveRate('US')).toBe(96.62);
  });

  it('does not change what the country picker says about each country', () => {
    setServerCurrency('INR');
    // The picker asks about every country, not about this customer.
    expect(settlementCurrencyFor('US')).toBe('USD');
    expect(settlementCurrencyFor('IN')).toBe('INR');
  });

  it('falls back to the local rule before the server answers', () => {
    setServerCurrency(null);
    expect(formatMoney(20, 'US')).toContain('$');
    expect(formatMoney(20, 'IN')).toContain('₹');
  });

  it('ignores a currency it does not recognise rather than trusting it', () => {
    setServerCurrency('EUR');
    expect(getServerCurrency()).toBe(null);
    expect(formatMoney(20, 'US')).toContain('$');
  });
});
