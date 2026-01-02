// CareBow Personalization Engine
// This module controls how CareBow adapts its behavior based on Profile data

export interface ProfileContext {
  id: string;
  name: string;
  relationship: string;
  age?: number;
  conditions?: string[];
  medications?: string[];
  allergies?: string[];
  bloodGroup?: string;
  pastSessions?: PastSession[];
}

export interface PastSession {
  date: string;
  symptoms: string[];
  outcome: string;
  resolution: string;
}

export interface PersonalizationRules {
  riskTolerance: 'low' | 'medium' | 'high';
  preferredCareMethod: 'self-care' | 'video' | 'home-visit';
  urgencyMultiplier: number;
  tone: 'reassuring' | 'cautious' | 'urgent';
  shouldCheckMedications: boolean;
  shouldReferPast: boolean;
}

// Core personalization logic
export function getPersonalizationRules(profile: ProfileContext): PersonalizationRules {
  const age = profile.age || 0;
  const hasChronicConditions = (profile.conditions?.length || 0) > 0;
  const isElder = age >= 60;
  const isChild = age < 18;

  // Rule: If chronic conditions exist → lower risk tolerance
  let riskTolerance: 'low' | 'medium' | 'high' = 'medium';
  if (hasChronicConditions) {
    riskTolerance = 'low';
  }
  if (isChild || isElder) {
    riskTolerance = 'low';
  }

  // Rule: If elder (>60) → prefer home visit over self-care
  let preferredCareMethod: 'self-care' | 'video' | 'home-visit' = 'video';
  if (isElder) {
    preferredCareMethod = 'home-visit';
  }
  if (isChild) {
    preferredCareMethod = 'video';
  }

  // Rule: Adjust urgency based on age and conditions
  let urgencyMultiplier = 1.0;
  if (isElder) urgencyMultiplier = 1.3;
  if (isChild) urgencyMultiplier = 1.2;
  if (hasChronicConditions) urgencyMultiplier *= 1.2;

  // Rule: Always check medications if they exist
  const shouldCheckMedications = (profile.medications?.length || 0) > 0;

  // Rule: Reference past if similar issues occurred before
  const shouldReferPast = (profile.pastSessions?.length || 0) > 0;

  // Tone adjustment
  let tone: 'reassuring' | 'cautious' | 'urgent' = 'reassuring';
  if (hasChronicConditions || isElder) {
    tone = 'cautious';
  }

  return {
    riskTolerance,
    preferredCareMethod,
    urgencyMultiplier,
    tone,
    shouldCheckMedications,
    shouldReferPast
  };
}

// Generate personalized opening based on profile
export function getPersonalizedOpening(profile: ProfileContext): string {
  const rules = getPersonalizationRules(profile);
  const isForSelf = profile.relationship.toLowerCase() === 'me';
  const targetName = isForSelf ? 'you' : profile.name;

  let opening = `I'm here to help ${isForSelf ? '' : `with ${profile.name}'s care`}. `;

  // Reference known conditions
  if (profile.conditions && profile.conditions.length > 0) {
    opening += `I see ${isForSelf ? 'you have' : `${profile.name} has`} ${profile.conditions.join(' and ')}. I'll keep this in mind. `;
  }

  // Mention medication awareness
  if (profile.medications && profile.medications.length > 0) {
    opening += `I'll make sure any recommendations are safe with ${isForSelf ? 'your' : 'their'} current medications. `;
  }

  // Age-specific messaging
  if (profile.age && profile.age >= 60) {
    opening += `Because ${isForSelf ? 'you\'re' : `${profile.name} is`} ${profile.age}, I'll be extra careful with my assessment. `;
  }

  if (profile.age && profile.age < 18) {
    opening += `I understand this is about a ${profile.age}-year-old. I'll adjust my questions accordingly. `;
  }

  return opening;
}

// Check for medication interactions (simplified logic)
export function checkMedicationSafety(
  profile: ProfileContext,
  proposedTreatment: string
): { safe: boolean; reason?: string; alternatives?: string[] } {
  const medications = profile.medications || [];
  const allergies = profile.allergies || [];

  // Check allergies first
  if (allergies.includes('Penicillin') && proposedTreatment.toLowerCase().includes('penicillin')) {
    return {
      safe: false,
      reason: `${profile.name} has a documented Penicillin allergy`,
      alternatives: ['Azithromycin', 'Cephalexin (if no severe penicillin allergy)']
    };
  }

  if (allergies.includes('Shellfish') && proposedTreatment.toLowerCase().includes('iodine')) {
    return {
      safe: false,
      reason: `Shellfish allergy may indicate iodine sensitivity`,
      alternatives: ['Non-iodine based alternatives']
    };
  }

  // Check medication interactions (simplified examples)
  if (medications.some(med => med.includes('Warfarin')) && proposedTreatment.toLowerCase().includes('aspirin')) {
    return {
      safe: false,
      reason: `Aspirin can interact with Warfarin and increase bleeding risk`,
      alternatives: ['Acetaminophen']
    };
  }

  if (medications.some(med => med.includes('Metformin')) && proposedTreatment.toLowerCase().includes('alcohol')) {
    return {
      safe: false,
      reason: `Alcohol can interact with Metformin`,
      alternatives: ['Avoid alcohol-based treatments']
    };
  }

  return { safe: true };
}

// Generate personalized risk assessment
export function assessRiskLevel(
  symptoms: string[],
  profile: ProfileContext,
  duration: string
): { level: 'low' | 'medium' | 'high'; reasoning: string[] } {
  const rules = getPersonalizationRules(profile);
  let baseRisk: 'low' | 'medium' | 'high' = 'low';
  const reasoning: string[] = [];

  // Symptom-based baseline
  if (symptoms.some(s => s.toLowerCase().includes('chest pain') || s.toLowerCase().includes('difficulty breathing'))) {
    baseRisk = 'high';
    reasoning.push('Symptoms include potentially serious indicators');
  } else if (symptoms.some(s => s.toLowerCase().includes('headache') || s.toLowerCase().includes('nausea'))) {
    baseRisk = 'medium';
    reasoning.push('Symptoms suggest moderate concern');
  }

  // Adjust based on profile
  if (rules.riskTolerance === 'low') {
    if (baseRisk === 'low') baseRisk = 'medium';
    if (baseRisk === 'medium') baseRisk = 'high';
    
    if (profile.conditions && profile.conditions.length > 0) {
      reasoning.push(`${profile.name} has ${profile.conditions.join(' and ')}, which increases caution`);
    }
    
    if (profile.age && profile.age >= 60) {
      reasoning.push(`At age ${profile.age}, we take extra precautions`);
    }
    
    if (profile.age && profile.age < 18) {
      reasoning.push(`For a ${profile.age}-year-old, we prefer professional evaluation`);
    }
  }

  // Duration factor
  if (duration.toLowerCase().includes('week') || duration.toLowerCase().includes('days')) {
    reasoning.push('Symptoms have persisted, warranting medical review');
  }

  return { level: baseRisk, reasoning };
}

// Generate personalized recommendation
export function getPersonalizedRecommendation(
  profile: ProfileContext,
  riskLevel: 'low' | 'medium' | 'high'
): { careType: string; reasoning: string; urgency: string } {
  const rules = getPersonalizationRules(profile);
  let careType = 'Video consultation';
  let reasoning = '';
  let urgency = 'within 24 hours';

  if (riskLevel === 'high') {
    careType = 'Emergency care';
    urgency = 'immediately';
    reasoning = 'Given the severity of symptoms and your health profile, immediate evaluation is needed.';
  } else if (riskLevel === 'medium') {
    if (rules.preferredCareMethod === 'home-visit') {
      careType = 'Home visit';
      reasoning = `At age ${profile.age}, a home visit allows for thorough in-person assessment.`;
      urgency = 'within 12 hours';
    } else {
      careType = 'Video consultation';
      reasoning = 'A video consultation will allow a provider to evaluate and recommend treatment.';
      urgency = 'within 24 hours';
    }
  } else {
    careType = 'Self-care with monitoring';
    reasoning = 'These symptoms can typically be managed at home, but I\'ll check in with you.';
    urgency = 'monitor for 24-48 hours';
  }

  // Override for chronic conditions
  if (profile.conditions && profile.conditions.length > 0 && riskLevel !== 'low') {
    reasoning += ` Because of ${profile.name}'s ${profile.conditions.join(' and ')}, professional evaluation is recommended.`;
  }

  return { careType, reasoning, urgency };
}

// Reference past sessions
export function getPastSessionReference(
  profile: ProfileContext,
  currentSymptoms: string[]
): { hasSimilar: boolean; reference?: string; outcome?: string } {
  if (!profile.pastSessions || profile.pastSessions.length === 0) {
    return { hasSimilar: false };
  }

  // Simple matching logic (would be more sophisticated in production)
  const currentSymptomsLower = currentSymptoms.map(s => s.toLowerCase());
  
  for (const session of profile.pastSessions) {
    const pastSymptomsLower = session.symptoms.map(s => s.toLowerCase());
    const overlap = pastSymptomsLower.filter(s => 
      currentSymptomsLower.some(cs => cs.includes(s) || s.includes(cs))
    );

    if (overlap.length > 0) {
      return {
        hasSimilar: true,
        reference: `I see you had ${session.symptoms.join(' and ')} ${session.date}. ${session.outcome}.`,
        outcome: session.resolution
      };
    }
  }

  return { hasSimilar: false };
}

// Check for missing critical profile data
export function getMissingProfileData(profile: ProfileContext): {
  hasMissing: boolean;
  missingFields: string[];
  promptMessage?: string;
} {
  const missingFields: string[] = [];

  if (!profile.medications || profile.medications.length === 0) {
    missingFields.push('medications');
  }
  if (!profile.allergies || profile.allergies.length === 0) {
    missingFields.push('allergies');
  }
  if (!profile.bloodGroup) {
    missingFields.push('blood group');
  }

  if (missingFields.length > 0) {
    let promptMessage = 'Before we continue, it would help me give safer recommendations if you could add ';
    if (missingFields.length === 1) {
      promptMessage += `your ${missingFields[0]} to your profile.`;
    } else {
      promptMessage += `your ${missingFields.slice(0, -1).join(', ')} and ${missingFields[missingFields.length - 1]} to your profile.`;
    }
    
    return { hasMissing: true, missingFields, promptMessage };
  }

  return { hasMissing: false, missingFields: [] };
}
