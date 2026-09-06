/** Legacy callers may resolve an exact canonical ID or explicit catalog slug only.
 * Never substitute another provider/service merely because a category matches.
 */
import { servicesApi, type V1Service } from '../services/api/endpoints/services';
import type { Service } from '../data/types';

export async function resolveBackendService(service: Service): Promise<V1Service | null> {
  const backend = await servicesApi.getServices();
  return backend.find((row) => row.isAvailable && row.id === service.id) ?? null;
}
