/**
 * Care Pathway Service Routing
 * Maps triage results to CareBow services for monetization
 *
 * Layer 6: Care Pathway Routing from Ask CareBow specification
 */

import { UrgencyLevel } from '@/types/askCarebow';

// ============================================
// TYPES
// ============================================

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

// ============================================
// SERVICE CATALOG
// ============================================

export const SERVICE_CATALOG: Record<string, CareBowService> = {
  // ============================================
  // CONSULTATION SERVICES
  // ============================================
  doctor_teleconsult: {
    id: 'doctor_teleconsult',
    name: 'Doctor Video Consultation',
    hindiName: 'Doctor se Video Par Baat',
    shortDescription: 'Connect with a doctor via video call',
    description: 'Speak with a qualified doctor from the comfort of your home through secure video consultation.',
    price: '$25',
    priceValue: 25,
    duration: '15-20 minutes',
    availability: 'Within 30 minutes',
    cta: 'Book Video Consult',
    category: 'consultation',
  },

  doctor_home_visit: {
    id: 'doctor_home_visit',
    name: 'Doctor Home Visit',
    hindiName: 'Doctor Ghar Par',
    shortDescription: 'Doctor visits your home',
    description: 'A qualified doctor will visit your home for physical examination and consultation.',
    price: '$35',
    priceValue: 35,
    duration: '30-45 minutes',
    availability: 'Same day or next day',
    cta: 'Book Home Visit',
    category: 'consultation',
  },

  specialist_teleconsult: {
    id: 'specialist_teleconsult',
    name: 'Specialist Consultation',
    hindiName: 'Specialist Doctor se Baat',
    shortDescription: 'Video consult with specialist',
    description: 'Connect with specialist doctors (Cardiologist, Orthopedic, etc.) via video call.',
    price: 'From $30',
    priceValue: 30,
    duration: '20-30 minutes',
    availability: 'Within 24-48 hours',
    cta: 'Book Specialist',
    category: 'consultation',
  },

  // ============================================
  // HOME CARE SERVICES
  // ============================================
  nursing_care: {
    id: 'nursing_care',
    name: 'Nursing Care at Home',
    hindiName: 'Ghar Par Nurse',
    shortDescription: 'Trained nurse at your home',
    description: 'Professional nurses for wound care, injections, IV drips, medication management, and daily nursing care.',
    price: 'From $50/day',
    priceValue: 50,
    availability: 'Within 24 hours',
    cta: 'Book Nurse',
    category: 'home_care',
  },

  physiotherapy: {
    id: 'physiotherapy',
    name: 'Physiotherapy at Home',
    hindiName: 'Ghar Par Physiotherapy',
    shortDescription: 'Physiotherapist home visits',
    description: 'Qualified physiotherapist visits your home for mobility exercises, pain management, and rehabilitation.',
    price: 'From $25/session',
    priceValue: 25,
    duration: '45-60 minutes',
    availability: 'Within 24-48 hours',
    cta: 'Book Physio',
    category: 'home_care',
  },

  caregiver: {
    id: 'caregiver',
    name: 'Caregiver / Attendant',
    hindiName: 'Dekhbhal Karne Wale',
    shortDescription: 'Daily care and companionship',
    description: 'Trained caregivers to help with daily activities, medication reminders, and companionship for elderly.',
    price: 'From $35/day',
    priceValue: 35,
    availability: 'Within 24 hours',
    cta: 'Book Caregiver',
    category: 'home_care',
  },

  // ============================================
  // LAB TESTS
  // ============================================
  lab_tests: {
    id: 'lab_tests',
    name: 'Lab Tests (Home Collection)',
    hindiName: 'Ghar Par Blood Test',
    shortDescription: 'Blood tests at home',
    description: 'Get blood and other diagnostic tests done at home. Sample collection by trained phlebotomists.',
    price: 'From $15',
    priceValue: 15,
    availability: 'Same day or next day',
    cta: 'Book Test',
    category: 'lab_test',
  },

  health_checkup: {
    id: 'health_checkup',
    name: 'Full Body Checkup',
    hindiName: 'Poora Body Checkup',
    shortDescription: 'Comprehensive health screening',
    description: 'Complete health checkup including blood tests, vital signs, and health assessment report.',
    price: 'From $49',
    priceValue: 49,
    availability: 'Within 24-48 hours',
    cta: 'Book Checkup',
    category: 'lab_test',
  },

  // ============================================
  // MEDICAL EQUIPMENT
  // ============================================
  medical_equipment: {
    id: 'medical_equipment',
    name: 'Medical Equipment Rental',
    hindiName: 'Medical Equipment Kiraye Par',
    shortDescription: 'Rent hospital equipment',
    description: 'Rent hospital beds, wheelchairs, oxygen concentrators, and other medical equipment for home use.',
    price: 'Varies by equipment',
    availability: 'Same day delivery',
    cta: 'View Equipment',
    category: 'equipment',
  },

  oxygen_equipment: {
    id: 'oxygen_equipment',
    name: 'Oxygen Support Equipment',
    hindiName: 'Oxygen Ka Saman',
    shortDescription: 'Oxygen concentrator and cylinder',
    description: 'Oxygen concentrators and cylinders for home use with setup assistance.',
    price: 'From $25/day',
    priceValue: 25,
    availability: 'Within 4-6 hours',
    cta: 'Get Oxygen Support',
    category: 'equipment',
  },

  bp_monitor: {
    id: 'bp_monitor',
    name: 'BP Monitor Rental',
    hindiName: 'BP Monitor Kiraye Par',
    shortDescription: 'Home BP monitoring',
    description: 'Digital blood pressure monitor rental for regular home monitoring.',
    price: '$10/month',
    priceValue: 10,
    availability: 'Same day delivery',
    cta: 'Rent Monitor',
    category: 'equipment',
  },

  // ============================================
  // EMERGENCY SERVICES
  // ============================================
  ambulance: {
    id: 'ambulance',
    name: 'Ambulance Service',
    hindiName: 'Ambulance',
    shortDescription: 'Emergency ambulance',
    description: 'Emergency ambulance with basic or advanced life support for immediate medical transport.',
    price: 'From $75',
    priceValue: 75,
    availability: 'Immediate',
    cta: 'Call Ambulance',
    category: 'emergency',
    isEmergency: true,
  },

  emergency_call: {
    id: 'emergency_call',
    name: 'Emergency Helpline',
    hindiName: 'Emergency Number',
    shortDescription: 'Call 112 for emergencies',
    description: 'National emergency number for immediate assistance.',
    price: 'Free',
    availability: 'Immediate',
    cta: 'Call 112',
    category: 'emergency',
    isEmergency: true,
  },
};

// ============================================
// SYMPTOM TO SERVICE MAPPING
// ============================================

type SymptomServiceMapping = {
  symptom: string;
  triageLevelServices: Partial<Record<TriageLevel, { primary: string[]; secondary: string[] }>>;
};

const SYMPTOM_SERVICE_MAPPING: SymptomServiceMapping[] = [
  // Digestive Issues
  {
    symptom: 'acidity',
    triageLevelServices: {
      self_care: { primary: [], secondary: [] },
      monitor: { primary: [], secondary: [] },
      consult: { primary: ['doctor_teleconsult'], secondary: ['lab_tests'] },
      urgent: { primary: ['doctor_home_visit'], secondary: ['doctor_teleconsult'] },
    },
  },
  {
    symptom: 'abdominal_pain',
    triageLevelServices: {
      monitor: { primary: ['doctor_teleconsult'], secondary: [] },
      consult: { primary: ['doctor_home_visit'], secondary: ['lab_tests'] },
      urgent: { primary: ['doctor_home_visit', 'ambulance'], secondary: [] },
      emergency: { primary: ['ambulance', 'emergency_call'], secondary: [] },
    },
  },

  // Respiratory
  {
    symptom: 'cold_cough',
    triageLevelServices: {
      self_care: { primary: [], secondary: [] },
      monitor: { primary: [], secondary: ['doctor_teleconsult'] },
      consult: { primary: ['doctor_teleconsult'], secondary: ['lab_tests'] },
      urgent: { primary: ['doctor_home_visit'], secondary: ['oxygen_equipment'] },
    },
  },
  {
    symptom: 'breathing_difficulty',
    triageLevelServices: {
      monitor: { primary: ['doctor_teleconsult'], secondary: [] },
      consult: { primary: ['doctor_home_visit'], secondary: ['oxygen_equipment'] },
      urgent: { primary: ['doctor_home_visit', 'ambulance'], secondary: ['oxygen_equipment'] },
      emergency: { primary: ['ambulance', 'emergency_call'], secondary: [] },
    },
  },

  // Pain
  {
    symptom: 'headache',
    triageLevelServices: {
      self_care: { primary: [], secondary: [] },
      monitor: { primary: [], secondary: ['doctor_teleconsult'] },
      consult: { primary: ['doctor_teleconsult'], secondary: ['lab_tests'] },
      urgent: { primary: ['doctor_home_visit'], secondary: [] },
    },
  },
  {
    symptom: 'joint_pain',
    triageLevelServices: {
      self_care: { primary: [], secondary: ['physiotherapy'] },
      monitor: { primary: ['physiotherapy'], secondary: [] },
      consult: { primary: ['doctor_home_visit'], secondary: ['physiotherapy', 'lab_tests'] },
      urgent: { primary: ['doctor_home_visit'], secondary: [] },
    },
  },
  {
    symptom: 'back_pain',
    triageLevelServices: {
      self_care: { primary: [], secondary: ['physiotherapy'] },
      monitor: { primary: ['physiotherapy'], secondary: [] },
      consult: { primary: ['doctor_home_visit'], secondary: ['physiotherapy'] },
      urgent: { primary: ['doctor_home_visit'], secondary: ['ambulance'] },
    },
  },

  // Fever
  {
    symptom: 'fever',
    triageLevelServices: {
      self_care: { primary: [], secondary: [] },
      monitor: { primary: [], secondary: ['lab_tests'] },
      consult: { primary: ['doctor_teleconsult'], secondary: ['lab_tests'] },
      urgent: { primary: ['doctor_home_visit'], secondary: ['lab_tests'] },
    },
  },

  // Chronic Care
  {
    symptom: 'diabetes_management',
    triageLevelServices: {
      self_care: { primary: ['lab_tests'], secondary: [] },
      monitor: { primary: ['lab_tests'], secondary: ['doctor_teleconsult'] },
      consult: { primary: ['doctor_teleconsult'], secondary: ['lab_tests'] },
    },
  },
  {
    symptom: 'bp_management',
    triageLevelServices: {
      self_care: { primary: ['bp_monitor'], secondary: [] },
      monitor: { primary: ['bp_monitor'], secondary: ['doctor_teleconsult'] },
      consult: { primary: ['doctor_teleconsult'], secondary: ['lab_tests'] },
    },
  },

  // Elder Care
  {
    symptom: 'general_weakness',
    triageLevelServices: {
      monitor: { primary: [], secondary: ['caregiver'] },
      consult: { primary: ['doctor_home_visit'], secondary: ['lab_tests', 'nursing_care'] },
      urgent: { primary: ['doctor_home_visit'], secondary: ['nursing_care'] },
    },
  },
  {
    symptom: 'post_hospitalization',
    triageLevelServices: {
      monitor: { primary: ['nursing_care'], secondary: ['physiotherapy'] },
      consult: { primary: ['doctor_home_visit'], secondary: ['nursing_care', 'medical_equipment'] },
    },
  },
];

// ============================================
// TRIAGE LEVEL CONFIGURATION
// ============================================

const TRIAGE_CONFIG: Record<TriageLevel, {
  displayTitle: string;
  displayDescription: string;
  displayColor: string;
  timeframe: string;
  defaultPrimary: string[];
  defaultSecondary: string[];
}> = {
  self_care: {
    displayTitle: '🟢 Home Care Recommended',
    displayDescription: 'This can likely be managed at home with rest and simple remedies.',
    displayColor: '#16A34A',
    timeframe: 'Try home remedies for 2-3 days',
    defaultPrimary: [],
    defaultSecondary: [],
  },
  monitor: {
    displayTitle: '🟡 Monitor Carefully',
    displayDescription: 'Try the suggested remedies, but watch for warning signs.',
    displayColor: '#CA8A04',
    timeframe: 'Monitor for 24-48 hours. Consult if no improvement.',
    defaultPrimary: [],
    defaultSecondary: ['doctor_teleconsult'],
  },
  consult: {
    displayTitle: '🟠 Doctor Consultation Advised',
    displayDescription: 'A medical professional should evaluate this to rule out anything serious.',
    displayColor: '#EA580C',
    timeframe: 'Schedule consultation within 24-72 hours',
    defaultPrimary: ['doctor_teleconsult'],
    defaultSecondary: ['doctor_home_visit'],
  },
  urgent: {
    displayTitle: '🔴 Seek Care Urgently',
    displayDescription: 'Please see a doctor as soon as possible, within the next few hours.',
    displayColor: '#DC2626',
    timeframe: 'Seek medical attention within 2-6 hours',
    defaultPrimary: ['doctor_home_visit'],
    defaultSecondary: ['doctor_teleconsult', 'ambulance'],
  },
  emergency: {
    displayTitle: '⚫ Emergency - Act Now',
    displayDescription: 'This requires immediate emergency medical attention.',
    displayColor: '#18181B',
    timeframe: 'Call 112 or go to nearest emergency room NOW',
    defaultPrimary: ['ambulance', 'emergency_call'],
    defaultSecondary: [],
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Map UrgencyLevel to TriageLevel
 */
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

/**
 * Get services for a symptom and triage level
 */
function getServicesForSymptom(
  symptom: string,
  triageLevel: TriageLevel
): { primary: string[]; secondary: string[] } {
  const mapping = SYMPTOM_SERVICE_MAPPING.find(m =>
    symptom.toLowerCase().includes(m.symptom) ||
    m.symptom.includes(symptom.toLowerCase())
  );

  if (mapping && mapping.triageLevelServices[triageLevel]) {
    return mapping.triageLevelServices[triageLevel]!;
  }

  // Return default services for triage level
  const config = TRIAGE_CONFIG[triageLevel];
  return {
    primary: config.defaultPrimary,
    secondary: config.defaultSecondary,
  };
}

/**
 * Build service recommendation
 */
function buildServiceRecommendation(
  serviceId: string,
  priority: number,
  symptom: string,
  triageLevel: TriageLevel
): ServiceRecommendation | null {
  const service = SERVICE_CATALOG[serviceId];
  if (!service) return null;

  // Generate contextual reason
  let reason = '';
  switch (service.category) {
    case 'consultation':
      if (triageLevel === 'urgent' || triageLevel === 'emergency') {
        reason = 'Urgent evaluation needed for your symptoms';
      } else if (triageLevel === 'consult') {
        reason = 'A doctor can properly evaluate and guide treatment';
      } else {
        reason = 'Get professional advice if symptoms persist';
      }
      break;
    case 'home_care':
      reason = 'Professional care at home for comfort and convenience';
      break;
    case 'lab_test':
      reason = 'Tests can help identify the underlying cause';
      break;
    case 'equipment':
      reason = 'May help manage symptoms at home';
      break;
    case 'emergency':
      reason = 'Immediate medical attention required';
      break;
  }

  return {
    service,
    priority,
    reason,
  };
}

/**
 * Get care pathway recommendations based on symptom and urgency
 */
export function getCarePathway(
  symptom: string,
  urgencyLevel: UrgencyLevel,
  memberAge?: number,
  hasChronicConditions?: boolean
): CarePathwayResult {
  const triageLevel = urgencyToTriageLevel(urgencyLevel);
  const config = TRIAGE_CONFIG[triageLevel];
  const serviceIds = getServicesForSymptom(symptom, triageLevel);

  // Build primary recommendations
  const primaryRecommendations: ServiceRecommendation[] = [];
  serviceIds.primary.forEach((id, index) => {
    const rec = buildServiceRecommendation(id, index + 1, symptom, triageLevel);
    if (rec) primaryRecommendations.push(rec);
  });

  // If no primary recommendations and not self_care, add defaults
  if (primaryRecommendations.length === 0 && triageLevel !== 'self_care') {
    config.defaultPrimary.forEach((id, index) => {
      const rec = buildServiceRecommendation(id, index + 1, symptom, triageLevel);
      if (rec) primaryRecommendations.push(rec);
    });
  }

  // Build secondary recommendations
  const secondaryRecommendations: ServiceRecommendation[] = [];
  serviceIds.secondary.forEach((id, index) => {
    const rec = buildServiceRecommendation(id, index + 1, symptom, triageLevel);
    if (rec) secondaryRecommendations.push(rec);
  });

  // Age-based adjustments
  if (memberAge && memberAge >= 60) {
    // For elderly, prefer home visits over teleconsults
    const homeVisitIdx = primaryRecommendations.findIndex(r => r.service.id === 'doctor_home_visit');
    const teleconsultIdx = primaryRecommendations.findIndex(r => r.service.id === 'doctor_teleconsult');
    if (homeVisitIdx === -1 && teleconsultIdx !== -1 && triageLevel !== 'self_care') {
      const homeVisitRec = buildServiceRecommendation('doctor_home_visit', 1, symptom, triageLevel);
      if (homeVisitRec) {
        homeVisitRec.contextualNote = 'Recommended for elderly patients for physical examination';
        primaryRecommendations.unshift(homeVisitRec);
      }
    }
  }

  // Add nursing/caregiver for chronic conditions with certain symptoms
  if (hasChronicConditions && (triageLevel === 'consult' || triageLevel === 'urgent')) {
    const hasNursing = secondaryRecommendations.some(r => r.service.id === 'nursing_care');
    if (!hasNursing) {
      const nursingRec = buildServiceRecommendation('nursing_care', 10, symptom, triageLevel);
      if (nursingRec) {
        nursingRec.contextualNote = 'Additional support for managing chronic conditions';
        secondaryRecommendations.push(nursingRec);
      }
    }
  }

  // Build escalation note
  let escalationNote: string | undefined;
  if (triageLevel === 'self_care' || triageLevel === 'monitor') {
    escalationNote = 'If symptoms worsen or new concerning symptoms appear, please seek medical attention promptly.';
  }

  return {
    triageLevel,
    urgencyLevel,
    displayTitle: config.displayTitle,
    displayDescription: config.displayDescription,
    displayColor: config.displayColor,
    timeframe: config.timeframe,
    primaryRecommendations,
    secondaryRecommendations,
    escalationNote,
  };
}

/**
 * Get service by ID
 */
export function getServiceById(serviceId: string): CareBowService | undefined {
  return SERVICE_CATALOG[serviceId];
}

/**
 * Get all services in a category
 */
export function getServicesByCategory(category: CareBowService['category']): CareBowService[] {
  return Object.values(SERVICE_CATALOG).filter(s => s.category === category);
}

/**
 * Get emergency services
 */
export function getEmergencyServices(): CareBowService[] {
  return Object.values(SERVICE_CATALOG).filter(s => s.isEmergency);
}
