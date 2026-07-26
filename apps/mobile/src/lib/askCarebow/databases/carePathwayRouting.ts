/**
 * Safety routing only. Bookable services, prices, clinicians and availability
 * must come from `/api/v1/services`; this file never invents catalog data.
 */
import { UrgencyLevel } from '@/types/askCarebow';

export type TriageLevel = 'self_care' | 'monitor' | 'consult' | 'urgent' | 'emergency';

export interface CareBowService {
  id: string;
  name: string;
  hindiName: string;
  shortDescription: string;
  description: string;
  price: string;
  priceValue?: number;
  duration?: string;
  availability: string;
  cta: string;
  category: 'consultation' | 'home_care' | 'lab_test' | 'equipment' | 'emergency';
  isEmergency?: boolean;
}

export interface ServiceRecommendation {
  service: CareBowService;
  priority: number;
  reason: string;
  contextualNote?: string;
}

export interface CarePathwayResult {
  triageLevel: TriageLevel;
  urgencyLevel: UrgencyLevel;
  displayTitle: string;
  displayDescription: string;
  displayColor: string;
  timeframe: string;
  primaryRecommendations: ServiceRecommendation[];
  secondaryRecommendations: ServiceRecommendation[];
  escalationNote?: string;
}

const emergencyCall: CareBowService = {
  id: 'emergency_call',
  name: 'Emergency services',
  hindiName: 'Emergency services',
  shortDescription: 'Call your local emergency number',
  description: 'Contact local emergency services for immediate assistance.',
  price: 'No CareBow charge',
  availability: 'External emergency service',
  cta: 'Call emergency services',
  category: 'emergency',
  isEmergency: true,
};

export const SERVICE_CATALOG: Record<string, CareBowService> = {
  emergency_call: emergencyCall,
};

const config: Record<
  TriageLevel,
  Pick<CarePathwayResult, 'displayTitle' | 'displayDescription' | 'displayColor' | 'timeframe'>
> = {
  self_care: {
    displayTitle: 'Home care guidance',
    displayDescription: 'Monitor symptoms and follow the safety guidance above.',
    displayColor: '#16A34A',
    timeframe: 'Monitor and reassess if symptoms change',
  },
  monitor: {
    displayTitle: 'Monitor carefully',
    displayDescription: 'Watch for warning signs and seek care if symptoms worsen.',
    displayColor: '#CA8A04',
    timeframe: 'Reassess symptoms regularly',
  },
  consult: {
    displayTitle: 'Clinical consultation advised',
    displayDescription: 'A licensed clinician should evaluate this concern.',
    displayColor: '#EA580C',
    timeframe: 'Arrange a consultation',
  },
  urgent: {
    displayTitle: 'Seek urgent care',
    displayDescription: 'Seek prompt in-person medical attention.',
    displayColor: '#DC2626',
    timeframe: 'Do not delay care',
  },
  emergency: {
    displayTitle: 'Emergency - act now',
    displayDescription: 'Contact local emergency services immediately.',
    displayColor: '#18181B',
    timeframe: 'Act now',
  },
};

export function urgencyToTriageLevel(urgency: UrgencyLevel): TriageLevel {
  const mapping: Record<UrgencyLevel, TriageLevel> = {
    self_care: 'self_care',
    monitor: 'monitor',
    non_urgent: 'consult',
    soon: 'consult',
    urgent: 'urgent',
    emergency: 'emergency',
  };
  return mapping[urgency];
}

export function getCarePathway(
  _symptom: string,
  urgencyLevel: UrgencyLevel,
  _memberAge?: number,
  _hasChronicConditions?: boolean
): CarePathwayResult {
  const triageLevel = urgencyToTriageLevel(urgencyLevel);
  const emergencyRecommendations: ServiceRecommendation[] =
    triageLevel === 'emergency'
      ? [
          {
            service: emergencyCall,
            priority: 1,
            reason: 'Immediate emergency assistance is required',
          },
        ]
      : [];
  return {
    triageLevel,
    urgencyLevel,
    ...config[triageLevel],
    primaryRecommendations: emergencyRecommendations,
    secondaryRecommendations: [],
    escalationNote:
      triageLevel === 'emergency'
        ? 'CareBow is not an emergency service. Contact local emergency services now.'
        : undefined,
  };
}

export const getServiceById = (serviceId: string): CareBowService | undefined =>
  SERVICE_CATALOG[serviceId];

export const getServicesByCategory = (category: CareBowService['category']): CareBowService[] =>
  Object.values(SERVICE_CATALOG).filter((service) => service.category === category);

export const getEmergencyServices = (): CareBowService[] => [emergencyCall];
