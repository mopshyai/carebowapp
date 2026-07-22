/**
 * Emergency numbers by country.
 *
 * CareBow operates in the USA and India, so the emergency number must adapt to
 * where the phone physically is (a US user in India needs 112, not 911).
 * Country is resolved from the SOS GPS fix (see getCountryCodeFromCoordinates);
 * when it's unknown we fall back to 112 — the unified emergency number that is
 * native in India and is redirected to 911 by US mobile carriers.
 */

import { getCountryCodeFromCoordinates } from './locationService';

export interface EmergencyNumbers {
  /** Primary number to dial for any emergency (reaches ambulance in both regions). */
  call: string;
  /** Dedicated ambulance line, where one exists separately (India: 108). */
  ambulance?: string;
  /** Human-readable region label for UI ("US", "India", "local"). */
  regionLabel: string;
}

const BY_COUNTRY: Record<string, EmergencyNumbers> = {
  us: { call: '911', regionLabel: 'US' },
  in: { call: '112', ambulance: '108', regionLabel: 'India' },
};

/** Safe fallback when the country can't be determined (112 is unified + US-redirected). */
export const DEFAULT_EMERGENCY: EmergencyNumbers = { call: '112', regionLabel: 'local' };

/** Map an ISO country code (e.g. "us", "in") to its emergency numbers. */
export function getEmergencyNumbers(countryCode?: string | null): EmergencyNumbers {
  if (!countryCode) return DEFAULT_EMERGENCY;
  return BY_COUNTRY[countryCode.toLowerCase()] ?? DEFAULT_EMERGENCY;
}

/**
 * Resolve the correct emergency numbers for a set of coordinates (via reverse
 * geocoding). Falls back to DEFAULT_EMERGENCY on any failure — never throws.
 */
export async function getEmergencyNumbersForCoordinates(
  lat: number,
  lng: number
): Promise<EmergencyNumbers> {
  const countryCode = await getCountryCodeFromCoordinates(lat, lng);
  return getEmergencyNumbers(countryCode);
}
