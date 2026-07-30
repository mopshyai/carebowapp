/**
 * Offline-cache wrapper around the remedies API.
 *
 * Home remedies used to be a ~1200-line database bundled into the app and
 * duplicated (with independent drift risk — see the age-0 infant
 * contraindication bug that hit both copies) in the backend. That's gone now;
 * this is the one place mobile asks for remedy content, and it always goes
 * through the backend's contraindication filtering (pregnancy, diabetes, age,
 * allergies) rather than a static local list with no safety filtering at all.
 *
 * Network-first, cache-fallback: a stale-but-safety-filtered answer from the
 * last time this symptom was looked up is better than either failing outright
 * offline, or falling back to unfiltered hardcoded content.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { remediesApi, RemediesResponse } from '../../services/api/endpoints/remedies';

const CACHE_PREFIX = '@carebow/remedies_cache/';

function cacheKey(symptom: string, profileId?: string): string {
  return `${CACHE_PREFIX}${symptom.toLowerCase().trim()}::${profileId ?? 'anon'}`;
}

export async function getRemediesForSymptom(params: {
  symptom: string;
  profileId?: string;
}): Promise<{ data: RemediesResponse; fromCache: boolean } | null> {
  const key = cacheKey(params.symptom, params.profileId);

  try {
    const response = await remediesApi.get({
      symptom: params.symptom,
      profileId: params.profileId,
    });
    if (response.success) {
      // Best-effort — a failed cache write should never fail the request that
      // already succeeded.
      AsyncStorage.setItem(key, JSON.stringify(response)).catch(() => {});
      return { data: response, fromCache: false };
    }
  } catch {
    // Network/backend failure — fall through to cache below.
  }

  try {
    const cached = await AsyncStorage.getItem(key);
    if (cached) {
      return { data: JSON.parse(cached) as RemediesResponse, fromCache: true };
    }
  } catch {
    // Corrupt or unreadable cache entry — treat as a miss.
  }

  return null;
}
