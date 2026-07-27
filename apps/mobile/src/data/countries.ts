/**
 * Country & currency configuration for country-aware pricing.
 *
 * Catalog prices in `data/services.ts` are authored in a USD base. Each country
 * maps that base to a local currency via `fxRate` (USD → local). The user's
 * country is chosen during profile building (see CreateProfileScreen) and stored
 * in the profile store; every price is displayed with `formatMoney(usd, code)`.
 *
 * The fxRate on each country is a BUNDLED FALLBACK, used only until live rates
 * arrive from GET /api/v1/fx (see services/fx). Hardcoded rates drift: these
 * were last 83/0.79/1.37/1.53 for INR/GBP/CAD/AUD against real values of
 * 96.6/0.75/1.41/1.43 — AUD alone was 7% out.
 *
 * Display only. What a booking costs is decided server-side at order time and
 * snapshotted onto the payment; nothing here can influence a charge.
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
  const config = getCountryConfig(code);
  const live = liveRates[config.currency];
  return typeof live === 'number' && Number.isFinite(live) && live > 0 ? live : config.fxRate;
}

/** Convert a USD-base amount to the country's local currency (rounded). */
export function convertFromUsd(usd: number, code: CountryCode): number {
  const { roundTo } = getCountryConfig(code);
  const local = usd * getEffectiveRate(code);
  return Math.round(local / roundTo) * roundTo;
}

/**
 * Format a USD-base amount as a localized currency string for the given country.
 * e.g. formatMoney(20, 'IN') -> "₹1,660", formatMoney(20, 'US') -> "$20".
 */
export function formatMoney(usd: number, code: CountryCode): string {
  const config = getCountryConfig(code);
  const amount = convertFromUsd(usd, code);
  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Fallback if the runtime's Intl lacks the locale/currency.
    return `${config.symbol}${amount.toLocaleString()}`;
  }
}
