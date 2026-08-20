/**
 * Country & currency configuration for country-aware pricing.
 *
 * Catalog prices in `data/services.ts` are authored in a USD base. Prices are
 * shown — and charged — in one of exactly TWO currencies:
 *
 *   India         -> INR, converted from the USD base at the live rate
 *   Anywhere else -> USD, the catalog figure itself, no conversion
 *
 * It used to be six: GBP, AED, CAD and AUD each had their own rate. That was
 * display-only fiction, because the server has always settled in one currency
 * per customer — so a customer in Canada was shown CA$41 and charged something
 * else entirely. Two currencies is what the backend can actually collect, so two
 * is what the app is allowed to promise. The country list below survives for
 * identity (name, flag) and for telling the server where someone is.
 *
 * The INR rate here is a BUNDLED FALLBACK, used only until live rates arrive
 * from GET /api/v1/fx (see services/fx). Hardcoded rates drift: it was last 83
 * against a real 96.6. USD needs no rate and so cannot drift at all, which is
 * the reason non-Indian customers are quoted in dollars rather than locally.
 *
 * Display only, still. What a booking costs is decided server-side at order
 * time from the country on the user's account, and snapshotted onto the payment;
 * nothing here can influence a charge. Keeping the two in step is what
 * services/api/endpoints/region.ts is for.
 */

export type CountryCode = 'US' | 'IN' | 'GB' | 'AE' | 'CA' | 'AU';

export interface CountryConfig {
  code: CountryCode;
  name: string;
  flag: string;
  /** ISO 4217 currency code. */
  currency: string;
  /** Currency symbol for compact display. */
  symbol: string;
  /** BCP-47 locale used for Intl number formatting. */
  locale: string;
  /** Multiplier applied to the USD base price to get the local amount. */
  fxRate: number;
  /** Round displayed amounts to this increment (local units). */
  roundTo: number;
}

export const COUNTRIES: Record<CountryCode, CountryConfig> = {
  US: {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    currency: 'USD',
    symbol: '$',
    locale: 'en-US',
    fxRate: 1,
    roundTo: 1,
  },
  IN: {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    currency: 'INR',
    symbol: '₹',
    locale: 'en-IN',
    fxRate: 96.62,
    roundTo: 10,
  },
  GB: {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    currency: 'GBP',
    symbol: '£',
    locale: 'en-GB',
    fxRate: 0.75,
    roundTo: 1,
  },
  AE: {
    code: 'AE',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    currency: 'AED',
    symbol: 'AED',
    locale: 'en-AE',
    fxRate: 3.67,
    roundTo: 1,
  },
  CA: {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    currency: 'CAD',
    symbol: 'CA$',
    locale: 'en-CA',
    fxRate: 1.41,
    roundTo: 1,
  },
  AU: {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    currency: 'AUD',
    symbol: 'A$',
    locale: 'en-AU',
    fxRate: 1.43,
    roundTo: 1,
  },
};

export const COUNTRY_LIST: CountryConfig[] = Object.values(COUNTRIES);

/** The only two currencies the backend can collect. */
export type SettlementCurrency = 'INR' | 'USD';

type SettlementConfig = {
  currency: SettlementCurrency;
  symbol: string;
  locale: string;
  /** Round displayed amounts to this increment, in major units. */
  roundTo: number;
  /** Bundled USD -> currency fallback, replaced by live rates when they land. */
  fallbackRate: number;
};

export const SETTLEMENT: Record<SettlementCurrency, SettlementConfig> = {
  INR: { currency: 'INR', symbol: '₹', locale: 'en-IN', roundTo: 10, fallbackRate: 96.62 },
  // Rate 1 by definition: the catalog is authored in USD.
  USD: { currency: 'USD', symbol: '$', locale: 'en-US', roundTo: 1, fallbackRate: 1 },
};

/**
 * What a customer in this country is quoted and charged in.
 *
 * Must agree with currencyForCountry() in the backend's src/lib/currency.ts. If
 * these two ever disagree, the app shows one price and the Razorpay page shows
 * another.
 *
 * Pure and per-country: the country picker asks this about every country, not
 * about the current user. For "what does THIS customer pay in", the server's
 * answer wins — see setServerCurrency below.
 */
export function settlementCurrencyFor(code: CountryCode | null | undefined): SettlementCurrency {
  return code === 'IN' ? 'INR' : 'USD';
}

/**
 * The currency the SERVER says this account is charged in, once known.
 *
 * The rule above is duplicated on both sides, and duplicated rules drift. The
 * server also has a lever the app cannot see: if International Payments is not
 * live on the Razorpay account, it quotes everyone in INR regardless of country.
 * An app that worked that out for itself would display dollars against a rupee
 * checkout.
 *
 * So GET /v1/region is fetched at launch and its answer parked here, exactly as
 * live FX rates are. Null until it arrives, and the local rule covers that.
 */
let serverCurrency: SettlementCurrency | null = null;

export function setServerCurrency(currency: string | null | undefined): void {
  serverCurrency = currency === 'INR' ? 'INR' : currency === 'USD' ? 'USD' : null;
}

export function getServerCurrency(): SettlementCurrency | null {
  return serverCurrency;
}

/** What the current customer pays in: the server's answer, else the local rule. */
export function activeSettlementCurrency(code: CountryCode | null | undefined): SettlementCurrency {
  return serverCurrency ?? settlementCurrencyFor(code);
}

export const DEFAULT_COUNTRY: CountryCode = 'US';

export function getCountryConfig(code: CountryCode | null | undefined): CountryConfig {
  return (code && COUNTRIES[code]) || COUNTRIES[DEFAULT_COUNTRY];
}

/**
 * Live rates from the backend, keyed by ISO currency. Empty until hydrated at
 * launch, so the bundled fxRate above is what renders on a cold first run.
 *
 * A module-level override keeps formatMoney() synchronous — it is called from
 * render in eight places, and making those async would be a much larger change
 * for a value that only affects a label.
 */
let liveRates: Record<string, number> = {};

/** Called by services/fx once rates are fetched or restored from cache. */
export function setLiveRates(rates: Record<string, number>): void {
  liveRates = { ...rates };
}

export function getLiveRates(): Record<string, number> {
  return { ...liveRates };
}

/** The rate actually used: live if hydrated, else the bundled fallback. */
export function getEffectiveRate(code: CountryCode): number {
  const settlement = SETTLEMENT[activeSettlementCurrency(code)];
  // USD is never converted, so a stray live rate for it cannot move a price.
  if (settlement.currency === 'USD') return 1;
  const live = liveRates[settlement.currency];
  return typeof live === 'number' && Number.isFinite(live) && live > 0
    ? live
    : settlement.fallbackRate;
}

/** Convert a USD-base amount into what this country settles in (rounded). */
export function convertFromUsd(usd: number, code: CountryCode): number {
  const { roundTo } = SETTLEMENT[activeSettlementCurrency(code)];
  const local = usd * getEffectiveRate(code);
  return Math.round(local / roundTo) * roundTo;
}

/**
 * Format a USD-base amount in the currency this country settles in.
 * e.g. formatMoney(20, 'IN') -> "₹1,930", formatMoney(20, 'GB') -> "$20".
 */
export function formatMoney(usd: number, code: CountryCode): string {
  const settlement = SETTLEMENT[activeSettlementCurrency(code)];
  const amount = convertFromUsd(usd, code);
  try {
    return new Intl.NumberFormat(settlement.locale, {
      style: 'currency',
      currency: settlement.currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Fallback if the runtime's Intl lacks the locale/currency.
    return `${settlement.symbol}${amount.toLocaleString()}`;
  }
}

/**
 * Format an amount that is already in minor units of a known currency — a
 * booking, a payment, a plan. Distinct from formatMoney on purpose: that one
 * takes a USD catalog price and converts, this one takes a figure the server has
 * already decided and must not touch. Conflating them is how a ₹4,830 charge
 * gets converted a second time and displayed as ₹466,578.
 */
export function formatMinor(amountMinor: number, currency: string): string {
  const settlement = SETTLEMENT[currency === 'INR' ? 'INR' : 'USD'];
  const minor = amountMinor || 0;
  // Decimals are hidden only when there are none to hide. Rounding them away
  // showed a plan converted from ₹1,800 as "$19" while charging $18.80 — the
  // same trap as the ₹ sign on a dollar price, one decimal place smaller.
  const isWholeUnit = minor % 100 === 0;
  try {
    return new Intl.NumberFormat(settlement.locale, {
      style: 'currency',
      currency: settlement.currency,
      minimumFractionDigits: isWholeUnit ? 0 : 2,
      maximumFractionDigits: isWholeUnit ? 0 : 2,
    }).format(minor / 100);
  } catch {
    return `${settlement.symbol}${(minor / 100).toLocaleString()}`;
  }
}
