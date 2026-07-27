/**
 * Country & currency configuration for country-aware pricing.
 *
 * Catalog prices in `data/services.ts` are authored in a USD base. Each country
 * maps that base to a local currency via `fxRate` (USD → local). The user's
 * country is chosen during profile building (see CreateProfileScreen) and stored
 * in the profile store; every price is displayed with `formatMoney(usd, code)`.
 *
 * fxRates are approximate and intentionally easy to tune in one place. They are
 * a display convenience, not a billing source of truth.
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
    fxRate: 83,
    roundTo: 10,
  },
  GB: {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    currency: 'GBP',
    symbol: '£',
    locale: 'en-GB',
    fxRate: 0.79,
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
    fxRate: 1.37,
    roundTo: 1,
  },
  AU: {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    currency: 'AUD',
    symbol: 'A$',
    locale: 'en-AU',
    fxRate: 1.53,
    roundTo: 1,
  },
};

export const COUNTRY_LIST: CountryConfig[] = Object.values(COUNTRIES);

export const DEFAULT_COUNTRY: CountryCode = 'US';

export function getCountryConfig(code: CountryCode | null | undefined): CountryConfig {
  return (code && COUNTRIES[code]) || COUNTRIES[DEFAULT_COUNTRY];
}

/** Convert a USD-base amount to the country's local currency (rounded). */
export function convertFromUsd(usd: number, code: CountryCode): number {
  const { fxRate, roundTo } = getCountryConfig(code);
  const local = usd * fxRate;
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
