/**
 * Service Router for Ask CareBow
 * Routes users to appropriate healthcare services based on assessment
 */

import {
  HealthContext,
  UrgencyLevel,
  ServiceRecommendation,
} from '@/types/askCarebow';

// ============================================
// SERVICE DEFINITIONS
// ============================================

type ServiceDefinition = {
  id: string;
  title: string;
  description: string;
  urgencyLevels: UrgencyLevel[];
  symptomKeywords: string[];
  categories: string[];
  priority: number; // Lower = higher priority
};

const AVAILABLE_SERVICES: ServiceDefinition[] = [
  {
    id: 'emergency',
    title: 'Emergency Services',
    description: 'Call 911 or go to nearest emergency room',
    urgencyLevels: ['emergency'],
    symptomKeywords: ['chest pain', 'stroke', 'unconscious', 'severe bleeding'],
    categories: ['cardiac', 'neurological', 'trauma'],
    priority: 1,
  },
  {
    id: 'urgent_care',
    title: 'Urgent Care Visit',
    description: 'Same-day care for urgent but non-emergency conditions',
    urgencyLevels: ['urgent', 'soon'],
    symptomKeywords: ['high fever', 'severe pain', 'infection', 'breathing difficulty'],
    categories: ['respiratory', 'gastrointestinal', 'musculoskeletal'],
    priority: 2,
  },
  {
    id: 'video_consult',
    title: 'Video Consultation',
    description: 'Speak with a healthcare provider from home',
    urgencyLevels: ['soon', 'non_urgent', 'monitor'],
    symptomKeywords: ['cold', 'flu', 'rash', 'minor pain', 'questions'],
    categories: ['general', 'dermatological', 'respiratory'],
    priority: 3,
  },
  {
    id: 'in_person_visit',
    title: 'In-Person Doctor Visit',
    description: 'Schedule a visit with a healthcare provider',
    urgencyLevels: ['soon', 'non_urgent'],
    symptomKeywords: ['ongoing', 'chronic', 'checkup', 'followup'],
    categories: ['general', 'musculoskeletal', 'gastrointestinal'],
    priority: 4,
  },
  {
    id: 'specialist_referral',
    title: 'Specialist Consultation',
    description: 'Get referred to a specialist for your condition',
    urgencyLevels: ['non_urgent', 'soon'],
    symptomKeywords: ['chronic', 'recurring', 'specialist', 'ongoing'],
    categories: ['neurological', 'cardiac', 'gastrointestinal'],
    priority: 5,
  },
  {
    id: 'mental_health',
    title: 'Mental Health Support',
    description: 'Speak with a mental health professional',
    urgencyLevels: ['urgent', 'soon', 'non_urgent'],
    symptomKeywords: ['anxiety', 'depression', 'stress', 'sleep', 'mood'],
    categories: ['mental_health'],
    priority: 3,
  },
  {
    id: 'pharmacy_consult',
    title: 'Pharmacy Consultation',
    description: 'Speak with a pharmacist about medications',
    urgencyLevels: ['non_urgent', 'monitor', 'self_care'],
    symptomKeywords: ['medication', 'prescription', 'drug interaction', 'refill'],
    categories: ['medication'],
    priority: 6,
  },
  {
    id: 'lab_test',
    title: 'Lab Tests',
    description: 'Get diagnostic tests at a nearby lab',
    urgencyLevels: ['non_urgent', 'soon'],
    symptomKeywords: ['test', 'blood work', 'screening', 'diagnostic'],
    categories: ['diagnostic'],
    priority: 7,
  },
  {
    id: 'self_care_guidance',
    title: 'Self-Care Resources',
    description: 'Tips and guidance for managing symptoms at home',
    urgencyLevels: ['self_care', 'monitor'],
    symptomKeywords: ['mild', 'minor', 'common', 'home remedy'],
    categories: ['general'],
    priority: 8,
  },
];

// ============================================
// SERVICE ROUTING
// ============================================

export function getServiceRecommendations(
  context: HealthContext,
  urgencyLevel: UrgencyLevel
): ServiceRecommendation[] {
  const recommendations: ServiceRecommendation[] = [];
  const symptomText = [
    context.primarySymptom,
    ...context.associatedSymptoms,
  ].join(' ').toLowerCase();

  // Filter services by urgency level
  const eligibleServices = AVAILABLE_SERVICES.filter(service =>
    service.urgencyLevels.includes(urgencyLevel)
  );

  // Score each service based on symptom match
  const scoredServices = eligibleServices.map(service => {
    let score = 10 - service.priority; // Base score from priority

    // Boost score for symptom keyword matches
    for (const keyword of service.symptomKeywords) {
      if (symptomText.includes(keyword.toLowerCase())) {
        score += 5;
      }
    }

    return { service, score };
  });

  // Sort by score (highest first)
  scoredServices.sort((a, b) => b.score - a.score);

  // Take top 3 recommendations
  const topServices = scoredServices.slice(0, 3);

  for (const { service } of topServices) {
    const recommendation = createRecommendation(service, context, urgencyLevel);
    recommendations.push(recommendation);
  }

  return recommendations;
}

function createRecommendation(
  service: ServiceDefinition,
  context: HealthContext,
  urgencyLevel: UrgencyLevel
): ServiceRecommendation {
  const reason = generateRecommendationReason(service, context, urgencyLevel);
  const prefilledNotes = generatePrefilledNotes(context);

  return {
    serviceId: service.id,
    serviceTitle: service.title,
    reason,
    urgency: urgencyLevel,
    prefilledNotes,
  };
}

function generateRecommendationReason(
  service: ServiceDefinition,
  context: HealthContext,
  urgencyLevel: UrgencyLevel
): string {
  const symptom = context.primarySymptom.toLowerCase();

  switch (service.id) {
    case 'emergency':
      return 'Your symptoms require immediate medical attention. Please seek emergency care.';

    case 'urgent_care':
      return `Based on your ${symptom} and the urgency level, an urgent care visit would be appropriate for prompt evaluation.`;

    case 'video_consult':
      return `A video consultation can help evaluate your ${symptom} and provide guidance without needing to leave home.`;

    case 'in_person_visit':
      return `An in-person visit would allow thorough examination of your ${symptom}.`;

    case 'specialist_referral':
      return `Given the nature of your symptoms, a specialist may be able to provide more targeted care.`;

    case 'mental_health':
      return 'Speaking with a mental health professional can help address your concerns.';

    case 'pharmacy_consult':
      return 'A pharmacist can provide guidance on over-the-counter options that may help.';

    case 'lab_test':
      return 'Diagnostic tests may help identify the underlying cause of your symptoms.';

    case 'self_care_guidance':
      return 'Your symptoms can likely be managed at home with proper self-care.';

    default:
      return 'This service may be helpful for your situation.';
  }
}

function generatePrefilledNotes(context: HealthContext): string {
  const parts: string[] = [];

  // Primary symptom
  if (context.primarySymptom) {
    parts.push(`Chief complaint: ${context.primarySymptom}`);
  }

  // Duration
  if (context.duration) {
    const durationText = getDurationText(context.duration);
    parts.push(`Duration: ${durationText}`);
  }

  // Severity
  if (context.severity) {
    parts.push(`Severity: ${context.severity}/10`);
  }

  // Frequency
  if (context.frequency) {
    parts.push(`Frequency: ${context.frequency}`);
  }

  // Associated symptoms
  if (context.associatedSymptoms.length > 0) {
    parts.push(`Associated symptoms: ${context.associatedSymptoms.join(', ')}`);
  }

  // Chronic conditions
  if (context.chronicConditions.length > 0) {
    parts.push(`Medical history: ${context.chronicConditions.join(', ')}`);
  }

  // Medications
  if (context.medications.length > 0) {
    parts.push(`Current medications: ${context.medications.join(', ')}`);
  }

  // Allergies
  if (context.allergies.length > 0) {
    parts.push(`Allergies: ${context.allergies.join(', ')}`);
  }

  // Recent events
  if (context.recentEvents.length > 0) {
    parts.push(`Recent events: ${context.recentEvents.join(', ')}`);
  }

  // Additional notes
  if (context.additionalNotes) {
    parts.push(`Additional notes: ${context.additionalNotes}`);
  }

  return parts.join('\n');
}

function getDurationText(duration: string): string {
  const durationMap: Record<string, string> = {
    just_now: 'Just started',
    few_hours: 'A few hours',
    today: 'Started today',
    '1_2_days': '1-2 days',
    '3_7_days': '3-7 days',
    '1_2_weeks': '1-2 weeks',
    more_than_2_weeks: 'More than 2 weeks',
    chronic: 'Chronic/ongoing',
  };

  return durationMap[duration] || duration;
}

// ============================================
// SERVICE AVAILABILITY CHECK
// ============================================

export function checkServiceAvailability(serviceId: string): {
  available: boolean;
  nextAvailable?: string;
  estimatedWait?: string;
} {
  // In a real implementation, this would check actual availability
  // For now, return mock availability
  return {
    available: true,
    estimatedWait: getEstimatedWait(serviceId),
  };
}

function getEstimatedWait(serviceId: string): string {
  const waitTimes: Record<string, string> = {
    emergency: 'Immediate',
    urgent_care: '15-30 minutes',
    video_consult: '5-15 minutes',
    in_person_visit: '1-2 days',
    specialist_referral: '3-5 days',
    mental_health: '1-3 days',
    pharmacy_consult: 'Same day',
    lab_test: 'Same day',
    self_care_guidance: 'Immediate',
  };

  return waitTimes[serviceId] || 'Varies';
}

// ============================================
// SERVICE BOOKING HELPERS
// ============================================

export function getBookingDeepLink(
  serviceId: string,
  context: HealthContext
): string {
  // Generate deep link for booking the service
  const params = new URLSearchParams({
    service: serviceId,
    symptom: context.primarySymptom,
    source: 'ask_carebow',
  });

  // In real implementation, this would be a proper deep link
  return `/book?${params.toString()}`;
}

export function getEmergencyInstructions(): {
  callNumber: string;
  nearbyEmergencyRooms: string[];
  immediateSteps: string[];
} {
  return {
    callNumber: '911',
    nearbyEmergencyRooms: [
      // Would be populated from location services
      'Nearest Emergency Room',
    ],
    immediateSteps: [
      'If you are in immediate danger, call 911',
      'Do not drive yourself if you feel unwell',
      'Have someone stay with you if possible',
      'Gather any medications you are taking to bring with you',
    ],
  };
}
