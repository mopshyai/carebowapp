/**
 * Live exchange rates for price display.
 *
 *   launch ──> restore cached rates (instant)  ──> setLiveRates()
 *          └─> GET /api/v1/fx (background)     ──> setLiveRates() + cache
 *
 * Rates are applied through a module-level override in data/countries.ts so
 * formatMoney() stays synchronous for the eight render paths that call it.
 *
 * Display only. What a booking costs is decided server-side at order time and
 * snapshotted onto the payment — nothing here can influence a charge. That is
 * why a stale or missing rate degrades to a slightly wrong label rather than
 * blocking checkout.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiClient from '../api/ApiClient';
import { setLiveRates } from '../../data/countries';
import { createLogger } from '../../utils/logger';

const logger = createLogger('FxService');

const CACHE_KEY = '@carebow/fx_rates';

/** Matches the server's cache window so client and server agree. */
export const FX_MAX_AGE_MS = 12 * 60 * 60 * 1000;

type FxResponse = {
  success?: boolean;
  base?: string;
  rates?: Record<string, number>;
  fetchedAt?: string;
};

type CachedRates = { rates: Record<string, number>; fetchedAt: string };

/**
 * Reject anything that is not a positive finite number. A garbled rate would
 * render a nonsense price; the bundled fallback is strictly better.
 */
function sanitize(rates: unknown): Record<string, number> | null {
  if (!rates || typeof rates !== 'object') return null;
  const out: Record<string, number> = {};
  for (const [code, value] of Object.entries(rates as Record<string, unknown>)) {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      out[code] = value;
    }
  }
  return Object.keys(out).length > 0 ? out : null;
}

async function readCache(): Promise<CachedRates | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedRates;
    const rates = sanitize(parsed?.rates);
    return rates ? { rates, fetchedAt: parsed.fetchedAt } : null;
  } catch {
    return null;
  }
}

/**
 * Hydrate rates at launch. Never throws and never blocks: on a cold start with
 * no network the app renders bundled rates, which are correct to within normal
 * FX drift.
 *
 * Returns the source actually applied, for logging and tests.
 */
export async function hydrateExchangeRates(): Promise<'live' | 'cache' | 'bundled'> {
  const cached = await readCache();

  // Apply the cache first so the first render is not the bundled fallback.
  if (cached) {
    setLiveRates(cached.rates);
  }

  try {
    const response = await ApiClient.get<FxResponse>('/v1/fx', { skipAuth: true });
    const rates = sanitize(response.data?.rates);

    if (rates) {
      setLiveRates(rates);
      const fetchedAt = response.data?.fetchedAt || new Date().toISOString();
      try {
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ rates, fetchedAt }));
      } catch {
        // A cache write failure does not affect this session.
      }
      return 'live';
    }
    logger.warn('FX response had no usable rates; keeping current');
  } catch (error) {
    logger.warn('FX fetch failed; using cached or bundled rates', error);
  }

  return cached ? 'cache' : 'bundled';
}

/** Whether the cached rates are older than the server's refresh window. */
export async function areRatesStale(now: number = Date.now()): Promise<boolean> {
  const cached = await readCache();
  if (!cached) return true;
  const age = now - Date.parse(cached.fetchedAt);
  return !Number.isFinite(age) || age < 0 || age > FX_MAX_AGE_MS;
}
