/**
 * Maps a local catalog service to a real backend `/v1/services` row so bookings
 * reference a valid backend service id.
 *
 * The local catalog is rich (27 services); the backend seeds one service per
 * `ServiceCategory`. We resolve a local service to the best-matching backend
 * category, fall back to a fuzzy name match, then to the first available
 * service. The user's exact selection (local service title + package) is carried
 * in the booking notes so the care team sees what was actually requested.
 */

import { servicesApi, type V1Service } from '../services/api/endpoints/services';
import type { Service } from '../data/types';

/** Local `image` (icon key) → backend ServiceCategory enum value. */
const CATEGORY_BY_IMAGE: Record<string, string> = {
  doctor: 'DOCTOR_VISIT',
  nurse: 'NURSE_CARE',
  physio: 'PHYSIOTHERAPY',
  lab: 'LAB_TEST',
  healthcheck: 'LAB_TEST',
  yoga: 'YOGA',
  companionship: 'COMPANION',
  transport: 'COMPANION',
  transactional_care: 'NURSE_CARE',
  food: 'CAREGIVER',
  cleaning: 'CAREGIVER',
  culture: 'CAREGIVER',
  barber: 'CAREGIVER',
};

/** Local `categoryId` → backend ServiceCategory enum value (coarser fallback). */
const CATEGORY_BY_CATEGORY_ID: Record<string, string> = {
  medical_devices: 'EQUIPMENT_RENTAL',
  special_packages: 'LAB_TEST',
  personal_companion: 'COMPANION',
  daily_care: 'CAREGIVER',
  health_care: 'DOCTOR_VISIT',
};

/** Best-guess backend ServiceCategory for a local catalog service. */
export function backendCategoryFor(service: Service): string {
  return (
    CATEGORY_BY_IMAGE[service.image] ||
    CATEGORY_BY_CATEGORY_ID[service.categoryId] ||
    'DOCTOR_VISIT'
  );
}

/**
 * Resolve a local catalog service to a real backend service. Fetches the live
 * catalog and matches by category, then by name keyword, then first available.
 * Returns null only if the backend has no services at all.
 */
export async function resolveBackendService(service: Service): Promise<V1Service | null> {
  const backend = await servicesApi.getServices();
  if (!backend.length) return null;

  const wantedCategory = backendCategoryFor(service);
  const byCategory = backend.find((b) => b.category === wantedCategory);
  if (byCategory) return byCategory;

  const keyword = service.title.toLowerCase().split(' ')[0];
  const byName = backend.find((b) => b.name.toLowerCase().includes(keyword));
  if (byName) return byName;

  return backend[0];
}
