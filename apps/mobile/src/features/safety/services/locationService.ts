/**
 * Location Service
 * Handles location permissions and fetching for SOS
 */

import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { PermissionStatus } from '../types';
import { createLogger } from '../../../utils/logger';

const logger = createLogger('Location');

// ============================================
// TYPES
// ============================================

export type LocationData = {
  lat: number;
  lng: number;
  accuracy: number | null;
  timestamp: number;
};

export type LocationResult =
  | { success: true; data: LocationData }
  | { success: false; error: string };

// ============================================
// PERMISSION HELPERS
// ============================================

export async function requestLocationPermission(): Promise<PermissionStatus> {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'CareBow needs access to your location for SOS alerts.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return 'granted';
      } else if (granted === PermissionsAndroid.RESULTS.DENIED) {
        return 'denied';
      }
      return 'undetermined';
    }

    // iOS - permissions are handled via Info.plist
    // Geolocation will prompt automatically when called
    return 'granted';
  } catch (error) {
    logger.error('Error requesting location permission', error);
    return 'denied';
  }
}

export async function getLocationPermissionStatus(): Promise<PermissionStatus> {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted ? 'granted' : 'denied';
    }
    // iOS - assume granted since we can't check without triggering the prompt
    return 'granted';
  } catch (error) {
    logger.error('Error getting location permission status', error);
    return 'denied';
  }
}

// ============================================
// LOCATION FETCHING
// ============================================

/**
 * Get current location with timeout
 * Returns result object to handle both success and failure gracefully
 */
export async function getCurrentLocation(timeoutMs: number = 10000): Promise<LocationResult> {
  return new Promise((resolve) => {
    Geolocation.getCurrentPosition(
      (position) => {
        resolve({
          success: true,
          data: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          },
        });
      },
      (error) => {
        logger.error('Error getting location', error);
        resolve({
          success: false,
          error: error.message || 'Failed to get location',
        });
      },
      {
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 10000,
      }
    );
  });
}

/**
 * Get last known location (faster but potentially stale)
 */
export async function getLastKnownLocation(): Promise<LocationResult> {
  return new Promise((resolve) => {
    Geolocation.getCurrentPosition(
      (position) => {
        resolve({
          success: true,
          data: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          },
        });
      },
      (error) => {
        logger.error('Error getting last known location', error);
        resolve({
          success: false,
          error: error.message || 'No last known location available',
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 60000, // Accept location up to 1 minute old
      }
    );
  });
}

/**
 * Get location with fallback to last known
 * Tries current location first, falls back to last known if that fails
 */
export async function getLocationWithFallback(timeoutMs: number = 8000): Promise<LocationResult> {
  // Try current location first
  const currentResult = await getCurrentLocation(timeoutMs);
  if (currentResult.success) {
    return currentResult;
  }

  // Fall back to last known
  const lastKnownResult = await getLastKnownLocation();
  if (lastKnownResult.success) {
    return lastKnownResult;
  }

  // Return the original error if both fail
  return currentResult;
}

// ============================================
// GOOGLE MAPS HELPERS
// ============================================

/**
 * Create a Google Maps link from coordinates
 */
export function createMapsLink(lat: number, lng: number): string {
  return `https://maps.google.com/?q=${lat},${lng}`;
}

/**
 * Create an Apple Maps link from coordinates
 */
export function createAppleMapsLink(lat: number, lng: number): string {
  return `https://maps.apple.com/?q=${lat},${lng}`;
}

/** Result of a reverse-geocode lookup. */
export type ReverseGeocodeResult = {
  /** Full human-readable address, or null if unavailable. */
  address: string | null;
  /** ISO 3166-1 alpha-2 country code (lowercase, e.g. "us", "in"), or null. */
  countryCode: string | null;
};

/**
 * Reverse geocode coordinates via OpenStreetMap Nominatim — keyless and free.
 * Returns both the address (for SOS messages) and the country code (to pick the
 * correct local emergency number). Fails soft (nulls) on timeout/error; never throws.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2` +
      `&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}` +
      `&zoom=18&addressdetails=1`;

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        // Nominatim usage policy requires an identifying User-Agent.
        'User-Agent': 'CareBow/1.0 (https://www.carebow.com)',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      logger.warn('Reverse geocoding failed', { status: response.status });
      return { address: null, countryCode: null };
    }

    const data = await response.json();
    const rawAddress: string | undefined = data?.display_name;
    const rawCountry: string | undefined = data?.address?.country_code;
    return {
      address: rawAddress && rawAddress.trim().length > 0 ? rawAddress : null,
      countryCode: rawCountry ? rawCountry.toLowerCase() : null,
    };
  } catch (error) {
    // AbortError (timeout) or network failure — caller falls back gracefully.
    logger.warn('Reverse geocoding error', {
      message: error instanceof Error ? error.message : String(error),
    });
    return { address: null, countryCode: null };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Get a human-readable address from coordinates. Thin wrapper over reverseGeocode
 * so SOS alerts can show a real street address instead of raw coordinates.
 */
export async function getAddressFromCoordinates(lat: number, lng: number): Promise<string | null> {
  return (await reverseGeocode(lat, lng)).address;
}

/**
 * Get the ISO country code for coordinates (used to select the local emergency
 * number). Returns null on failure.
 */
export async function getCountryCodeFromCoordinates(
  lat: number,
  lng: number
): Promise<string | null> {
  return (await reverseGeocode(lat, lng)).countryCode;
}
