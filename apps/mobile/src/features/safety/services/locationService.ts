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

/**
 * Get a human-readable address from coordinates (reverse geocoding).
 *
 * Uses OpenStreetMap Nominatim — keyless and free — so SOS alerts can show a
 * real street address instead of raw coordinates. Fails soft (returns null) on
 * timeout/error so the caller can fall back to coordinates; never throws.
 */
export async function getAddressFromCoordinates(lat: number, lng: number): Promise<string | null> {
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
      return null;
    }

    const data = await response.json();
    const address: string | undefined = data?.display_name;
    return address && address.trim().length > 0 ? address : null;
  } catch (error) {
    // AbortError (timeout) or network failure — fall back to coordinates.
    logger.warn('Reverse geocoding error; falling back to coordinates', {
      message: error instanceof Error ? error.message : String(error),
    });
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
