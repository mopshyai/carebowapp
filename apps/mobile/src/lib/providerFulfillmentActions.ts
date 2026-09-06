import type {
  FulfillmentStatus,
  LabResultStatus,
  TripStatus,
} from '@/services/api/endpoints/providerFulfillment';
import type { ProviderFulfillmentKind } from '@/services/api/endpoints/member';

export type ProviderFulfillmentAction = {
  status: string;
  label: string;
};

export function primaryProviderFulfillmentAction(
  kind: ProviderFulfillmentKind,
  status?: string | null
): ProviderFulfillmentAction | null {
  if (!status) return null;

  if (kind === 'lab') {
    const actions: Partial<Record<LabResultStatus, ProviderFulfillmentAction>> = {
      ORDERED: { status: 'SAMPLE_COLLECTED', label: 'Mark sample collected' },
      SAMPLE_COLLECTED: { status: 'PROCESSING', label: 'Start processing' },
      // PROCESSING -> REPORTED intentionally requires result evidence and is
      // handled by the reporting form instead of a blind status button.
    };
    return actions[status as LabResultStatus] ?? null;
  }

  if (kind === 'pharmacy') {
    const actions: Partial<Record<FulfillmentStatus, ProviderFulfillmentAction>> = {
      PENDING: { status: 'CONFIRMED', label: 'Confirm order' },
      CONFIRMED: { status: 'PREPARING', label: 'Start preparing' },
      PREPARING: { status: 'OUT_FOR_DELIVERY', label: 'Out for delivery' },
      OUT_FOR_DELIVERY: { status: 'DELIVERED', label: 'Mark delivered' },
      DELIVERED: { status: 'RETURNED', label: 'Record return' },
    };
    return actions[status as FulfillmentStatus] ?? null;
  }

  if (kind === 'equipment') {
    const actions: Partial<Record<FulfillmentStatus, ProviderFulfillmentAction>> = {
      PENDING: { status: 'CONFIRMED', label: 'Confirm & reserve equipment' },
      CONFIRMED: { status: 'PREPARING', label: 'Prepare equipment' },
      PREPARING: { status: 'OUT_FOR_DELIVERY', label: 'Out for delivery' },
      OUT_FOR_DELIVERY: { status: 'DELIVERED', label: 'Mark delivered' },
      DELIVERED: { status: 'RETURNED', label: 'Mark equipment returned' },
    };
    return actions[status as FulfillmentStatus] ?? null;
  }

  if (kind === 'ambulance') {
    const actions: Partial<Record<TripStatus, ProviderFulfillmentAction>> = {
      REQUESTED: { status: 'DISPATCHED', label: 'Dispatch ambulance' },
      DISPATCHED: { status: 'EN_ROUTE', label: 'Start route' },
      EN_ROUTE: { status: 'ARRIVED', label: 'Mark arrived' },
      ARRIVED: { status: 'IN_TRANSIT', label: 'Patient in transit' },
      IN_TRANSIT: { status: 'COMPLETED', label: 'Complete trip' },
    };
    return actions[status as TripStatus] ?? null;
  }

  return null;
}

export function canCancelProviderFulfillment(
  kind: ProviderFulfillmentKind,
  status?: string | null
): boolean {
  if (!status) return false;
  if (kind === 'lab') {
    return ['ORDERED', 'SAMPLE_COLLECTED', 'PROCESSING'].includes(status);
  }
  if (kind === 'pharmacy' || kind === 'equipment') {
    return ['PENDING', 'CONFIRMED', 'PREPARING'].includes(status);
  }
  if (kind === 'ambulance') {
    return ['REQUESTED', 'DISPATCHED', 'EN_ROUTE', 'ARRIVED'].includes(status);
  }
  return false;
}
