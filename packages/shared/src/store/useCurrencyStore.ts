import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';

export type CurrencyCode = 'USD' | 'INR' | 'GBP' | 'EUR' | 'AED' | 'SGD' | 'AUD' | 'CAD';

interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  locale: string;
  exchangeRate: number;
  decimals: number;
}

const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', locale: 'en-US', exchangeRate: 1, decimals: 2 },
  INR: { code: 'INR', symbol: '₹', locale: 'en-IN', exchangeRate: 83, decimals: 0 },
  GBP: { code: 'GBP', symbol: '£', locale: 'en-GB', exchangeRate: 0.79, decimals: 2 },
  EUR: { code: 'EUR', symbol: '€', locale: 'de-DE', exchangeRate: 0.92, decimals: 2 },
  AED: { code: 'AED', symbol: 'AED', locale: 'ar-AE', exchangeRate: 3.67, decimals: 2 },
  SGD: { code: 'SGD', symbol: 'S$', locale: 'en-SG', exchangeRate: 1.34, decimals: 2 },
  AUD: { code: 'AUD', symbol: 'A$', locale: 'en-AU', exchangeRate: 1.53, decimals: 2 },
  CAD: { code: 'CAD', symbol: 'C$', locale: 'en-CA', exchangeRate: 1.36, decimals: 2 },
};

interface CurrencyState {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (amountUSD: number) => string;
  getSymbol: () => string;
}

export const createCurrencyStore = (storage?: StateStorage) =>
  create<CurrencyState>()(
    persist(
      (set, get) => ({
        currency: 'USD',

        setCurrency: (code: CurrencyCode) => set({ currency: code }),

        formatPrice: (amountUSD: number) => {
          const config = CURRENCIES[get().currency];
          const converted = amountUSD * config.exchangeRate;
          return `${config.symbol}${converted.toLocaleString(config.locale, {
            minimumFractionDigits: config.decimals,
            maximumFractionDigits: config.decimals,
          })}`;
        },

        getSymbol: () => CURRENCIES[get().currency].symbol,
      }),
      {
        name: 'carebow-currency',
        storage: storage ? createJSONStorage(() => storage) : undefined,
      }
    )
  );

// Default export without persistence (for SSR/initial load)
export const useCurrencyStore = create<CurrencyState>()((set, get) => ({
  currency: 'USD',
  setCurrency: (code: CurrencyCode) => set({ currency: code }),
  formatPrice: (amountUSD: number) => {
    const config = CURRENCIES[get().currency];
    const converted = amountUSD * config.exchangeRate;
    return `${config.symbol}${converted.toLocaleString(config.locale, {
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    })}`;
  },
  getSymbol: () => CURRENCIES[get().currency].symbol,
}));
