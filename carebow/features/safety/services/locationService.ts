/**
 * Location Service
 * Handles location permissions and fetching for SOS
 */

import * as Location from 'expo-location';
import { PermissionStatus } from '../types';

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
    const { status: existingStatus } = await Location.getForegroundPermissionsAsync();

    if (existingStatus === 'granted') {
      return 'granted';
    }

    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status === 'granted') {
      return 'granted';
    } else if (status === 'denied') {
      return 'denied';
    }

    return 'undetermined';
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return 'denied';
  }
}

export async function getLocationPermissionStatus(): Promise<PermissionStatus> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();

    if (status === 'granted') return 'granted';
    if (status === 'denied') return 'denied';
    return 'undetermined';
  } catch (error) {
    console.error('Error getting location permission status:', error);
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
export async function getCurrentLocation(
  timeoutMs: number = 10000
): Promise<LocationResult> {
  try {
    // Check permission first
    const permission = await getLocationPermissionStatus();
    if (permission !== 'granted') {
      return {
        success: false,
        error: 'Location permission not granted',
      };
    }

    // Create a timeout promise
    const timeoutPromise = new Promise<LocationResult>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Location request timed out'));
      }, timeoutMs);
    });

    // Create the location promise
    const locationPromise = (async (): Promise<LocationResult> => {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        success: true,
        data: {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          accuracy: location.coords.accuracy,
          timestamp: location.timestamp,
        },
      };
    })();

    // Race them
    return await Promise.race([locationPromise, timeoutPromise]);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get location';
    console.error('Error getting location:', message);
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Get last known location (faster but potentially stale)
 */
export async function getLastKnownLocation(): Promise<LocationResult> {
  try {
    const permission = await getLocationPermissionStatus();
    if (permission !== 'granted') {
      return {
        success: false,
        error: 'Location permission not granted',
      };
    }

    const location = await Location.getLastKnownPositionAsync();

    if (!location) {
      return {
        success: false,
        error: 'No last known location available',
      };
    }

    return {
      success: true,
      data: {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get last known location';
    console.error('Error getting last known location:', error);
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Get location with fallback to last known
 * Tries current location first, falls back to last known if that fails
 */
export async function getLocationWithFallback(
  timeoutMs: number = 8000
): Promise<LocationResult> {
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
 * Get formatted address from coordinates (reverse geocoding)
 */
export async function getAddressFromCoordinates(
  lat: number,
  lng: number
): Promise<string | null> {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });

    if (results.length > 0) {
      const address = results[0];
      const parts = [
        address.streetNumber,
        address.street,
        address.city,
        address.region,
        address.postalCode,
      ].filter(Boolean);
      return parts.join(', ');
    }

    return null;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
}
