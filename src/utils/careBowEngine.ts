// CareBow Conversational AI Engine
// Implements strict personalization rules

import type { ProfileContext } from './careBowPersonalization';

export interface CareBowMessage {
  id: string;
  type: 'carebow' | 'user' | 'system' | 'emergency';
  content: string;
  reasoning?: string;
  profileReference?: string;
  timestamp: Date;
}

export interface ConversationState {
  careSubject: ProfileContext | null;
  symptoms: string[];
  duration: string;
  severity: number;
  redFlags: string[];
  isEmergency: boolean;
  step: number;
}

// STEP 8: EMERGENCY OVERRIDE
const EMERGENCY_KEYWORDS = [
  'chest pain',
  'can\'t breathe',
  'difficulty breathing',
  'severe bleeding',
  'unconscious',
  'stroke',
  'heart attack',
  'suicide',
  'overdose',
  'severe pain',
  'confused',
  'can\'t move',
  'vision loss',
  'slurred speech'
];

export function detectEmergency(input: string): boolean {
  const lowerInput = input.toLowerCase();
  return EMERGENCY_KEYWORDS.some(keyword => lowerInput.includes(keyword));
}

export function getEmergencyResponse(): CareBowMessage {
  return {
    id: Date.now().toString(),
    type: 'emergency',
    content: `Based on what you've shared, this could be serious. Please seek emergency care now.\n\nCall 911 or go to the nearest emergency room immediately.\n\nI'll be here when you're ready, but your immediate safety is the priority.`,
    reasoning: 'Emergency symptoms detected - immediate medical attention required',
    timestamp: new Date()
  };
}

// STEP 1: WHO IS THIS FOR
export function getProfileSelectionMessage(): CareBowMessage {
  return {
    id: Date.now().toString(),
    type: 'carebow',
    content: `Before we begin, I need to know: is this about you or a family member?\n\nThis helps me give the safest, most personalized guidance.`,
    reasoning: 'Must identify care subject before providing any medical guidance',
    timestamp: new Date()
  };
}

// STEP 2 & 3: PERSONALIZED OPENING
export function getPersonalizedOpening(profile: ProfileContext): CareBowMessage {
  const isForSelf = profile.relationship.toLowerCase() === 'me';
  const name = isForSelf ? 'you' : profile.name;
  const possessive = isForSelf ? 'your' : `${profile.name}'s`;
  
  let content = `I'm here to help with ${isForSelf ? 'your' : `${profile.name}'s`} care. `;
  let profileRef = '';

  // Reference known conditions
  if (profile.conditions && profile.conditions.length > 0) {
    content += `I see ${isForSelf ? 'you have' : `${profile.name} has`} ${profile.conditions.join(' and ')}. `;
    profileRef += `Known conditions: ${profile.conditions.join(', ')}. `;
    content += `I'll be extra careful because of this. `;
  }

  // Reference medications
  if (profile.medications && profile.medications.length > 0) {
    content += `I also see ${possessive} current medications, so I'll make sure any recommendations are safe. `;
    profileRef += `Taking ${profile.medications.length} medication(s). `;
  }

  // Age-based personalization
  if (profile.age) {
    if (profile.age >= 60) {
      content += `Since ${isForSelf ? 'you\'re' : `${profile.name} is`} ${profile.age}, I'll use a lower threshold for recommending professional care. `;
      profileRef += `Age ${profile.age} = increased caution. `;
    } else if (profile.age < 18) {
      content += `Since this is about a ${profile.age}-year-old, I'll be especially careful with my assessment. `;
      profileRef += `Pediatric case (age ${profile.age}). `;
    }
  }

  content += `\n\nNow, what's going on? Tell me what ${isForSelf ? 'you\'re' : `${profile.name} is`} experiencing.`;

  return {
    id: Date.now().toString(),
    type: 'carebow',
    content,
    reasoning: 'Establishing personalized context before symptom gathering',
    profileReference: profileRef,
    timestamp: new Date()
  };
}

// STEP 6: REFERENCE PAST MEMORY
export function checkPastSessions(
  profile: ProfileContext,
  currentSymptoms: string[]
): CareBowMessage | null {
  if (!profile.pastSessions || profile.pastSessions.length === 0) {
    return null;
  }

  const symptomWords = currentSymptoms.join(' ').toLowerCase();
  
  for (const session of profile.pastSessions) {
    const pastSymptoms = session.symptoms.join(' ').toLowerCase();
    
    // Simple similarity check
    const overlap = session.symptoms.some(s => 
      symptomWords.includes(s.toLowerCase())
    );

    if (overlap) {
      const isForSelf = profile.relationship.toLowerCase() === 'me';
      return {
        id: Date.now().toString(),
        type: 'system',
        content: `I notice ${isForSelf ? 'you' : profile.name} had ${session.symptoms.join(' and ')} ${session.date}. ${session.outcome}. ${session.resolution}.\n\nI'll keep this in mind as we assess what's happening now.`,
        reasoning: 'Referencing past CareBow outcome for continuity',
        profileReference: `Past session: ${session.date}`,
        timestamp: new Date()
      };
    }
  }

  return null;
}

// STEP 4: EXPLAIN THINKING
export function getNextQuestion(
  state: ConversationState,
  profile: ProfileContext
): CareBowMessage {
  const isForSelf = profile.relationship.toLowerCase() === 'me';
  const subject = isForSelf ? 'you' : profile.name;
  const possessive = isForSelf ? 'your' : `${profile.name}'s`;

  if (state.step === 1) {
    // Ask about duration
    return {
      id: Date.now().toString(),
      type: 'carebow',
      content: `How long has ${subject} been experiencing this?\n\nI'm asking because the duration helps me understand if this is acute or if it's been building over time.`,
      reasoning: 'Duration is critical for risk assessment',
      timestamp: new Date()
    };
  }

  if (state.step === 2) {
    // Ask about severity
    let content = `On a scale of 1-10, how severe is this? (1 = barely noticeable, 10 = worst pain imaginable)\n\n`;
    
    if (profile.age && profile.age < 18) {
      content = `How much is this bothering ${subject}? You can use a number 1-10, where 1 is "barely noticeable" and 10 is "really bad."\n\n`;
    }

    content += `This helps me gauge urgency`;
    
    if (profile.conditions && profile.conditions.length > 0) {
      content += ` and, because of ${possessive} ${profile.conditions.join(' and ')}, I need to be more cautious with moderate-to-severe symptoms`;
    }
    
    content += `.`;

    return {
      id: Date.now().toString(),
      type: 'carebow',
      content,
      reasoning: 'Severity rating adjusts recommendation threshold',
      profileReference: profile.conditions?.length ? `Chronic conditions require lower threshold` : undefined,
      timestamp: new Date()
    };
  }

  if (state.step === 3) {
    // Ask about red flags
    return {
      id: Date.now().toString(),
      type: 'carebow',
      content: `Is ${subject} experiencing any of these:\n• Fever over 102°F\n• Difficulty breathing\n• Severe pain\n• Confusion or dizziness\n• Unable to keep food/water down\n\nAnswer yes or no.\n\nI'm checking for warning signs that would change my recommendation.`,
      reasoning: 'Red flag screening for emergency escalation',
      timestamp: new Date()
    };
  }

  return {
    id: Date.now().toString(),
    type: 'carebow',
    content: 'Let me analyze what you\'ve told me...',
    reasoning: 'Moving to risk assessment phase',
    timestamp: new Date()
  };
}

// STEP 2: PERSONALIZED RISK ASSESSMENT
export function assessRisk(
  state: ConversationState,
  profile: ProfileContext
): { level: 'low' | 'medium' | 'high'; reasoning: string[] } {
  const reasoning: string[] = [];
  let riskScore = 0;

  // Base risk from symptoms
  if (state.severity >= 7) {
    riskScore += 2;
    reasoning.push('Severity rating indicates significant distress');
  } else if (state.severity >= 4) {
    riskScore += 1;
    reasoning.push('Moderate severity reported');
  }

  // Duration factor
  if (state.duration.toLowerCase().includes('week') || state.duration.toLowerCase().includes('days')) {
    riskScore += 1;
    reasoning.push('Symptoms have persisted beyond typical acute timeframe');
  }

  // Red flags
  if (state.redFlags.length > 0) {
    riskScore += 2;
    reasoning.push(`Warning signs present: ${state.redFlags.join(', ')}`);
  }

  // RULE: Age > 60 → lower tolerance
  if (profile.age && profile.age >= 60) {
    riskScore += 1;
    reasoning.push(`At age ${profile.age}, we use a lower threshold for professional evaluation`);
  }

  // RULE: Chronic conditions → increase caution
  if (profile.conditions && profile.conditions.length > 0) {
    riskScore += 1;
    reasoning.push(`${profile.name}'s ${profile.conditions.join(' and ')} requires extra caution`);
  }

  // RULE: Multiple medications
  if (profile.medications && profile.medications.length >= 2) {
    reasoning.push(`Taking ${profile.medications.length} medications means we need to be careful with recommendations`);
  }

  // Calculate final risk level
  let level: 'low' | 'medium' | 'high' = 'low';
  if (riskScore >= 4) level = 'high';
  else if (riskScore >= 2) level = 'medium';

  return { level, reasoning };
}

// STEP 5: CLEAR RECOMMENDATION
export function getRecommendation(
  riskLevel: 'low' | 'medium' | 'high',
  profile: ProfileContext,
  state: ConversationState
): CareBowMessage {
  const isForSelf = profile.relationship.toLowerCase() === 'me';
  const subject = isForSelf ? 'you' : profile.name;
  
  let careType = '';
  let explanation = '';
  let urgency = '';

  if (riskLevel === 'high') {
    // High risk
    if (profile.age && profile.age >= 60) {
      careType = 'Home visit';
      urgency = 'within 6 hours';
      explanation = `Given ${isForSelf ? 'your' : `${profile.name}'s`} age (${profile.age}) and the severity of symptoms, a provider should evaluate ${subject} in person at home. This is the safest option.`;
    } else {
      careType = 'Video consultation or in-person visit';
      urgency = 'within 12 hours';
      explanation = `The symptoms ${subject} described need professional evaluation soon. A video call can assess this, but in-person care might be needed.`;
    }
  } else if (riskLevel === 'medium') {
    // Medium risk
    if (profile.age && profile.age >= 60) {
      careType = 'Home visit';
      urgency = 'within 24 hours';
      explanation = `Because ${subject} ${isForSelf ? 'are' : 'is'} ${profile.age}, I recommend a home visit for thorough evaluation. ${profile.conditions?.length ? `With ${profile.conditions.join(' and ')}, it's better to be cautious.` : ''}`;
    } else if (profile.conditions && profile.conditions.length > 0) {
      careType = 'Video consultation';
      urgency = 'within 24 hours';
      explanation = `Given ${isForSelf ? 'your' : `${profile.name}'s`} ${profile.conditions.join(' and ')}, a provider should review these symptoms to adjust care if needed.`;
    } else {
      careType = 'Video consultation';
      urgency = 'within 24-48 hours';
      explanation = `These symptoms warrant professional review to rule out anything that needs treatment.`;
    }
  } else {
    // Low risk
    careType = 'Self-care with monitoring';
    urgency = 'monitor for 48 hours';
    explanation = `These symptoms appear manageable at home for now. I'll help ${subject} monitor them, and we can escalate if things change.`;
  }

  const content = `**My Recommendation: ${careType}**\n\n${explanation}\n\n**Timeline:** ${urgency}\n\nI'll check in with ${subject} tomorrow to see how things are progressing. Would ${subject} like me to help schedule care now?`;

  return {
    id: Date.now().toString(),
    type: 'carebow',
    content,
    reasoning: `Risk level: ${riskLevel}. Personalized based on age, conditions, and symptoms.`,
    profileReference: `Recommendation factors: age ${profile.age}, conditions: ${profile.conditions?.join(', ') || 'none'}`,
    timestamp: new Date()
  };
}

// STEP 7: HANDLE MISSING DATA
export function checkMissingProfileData(profile: ProfileContext): CareBowMessage | null {
  const missing: string[] = [];

  if (!profile.medications || profile.medications.length === 0) {
    missing.push('medications');
  }
  if (!profile.allergies || profile.allergies.length === 0) {
    missing.push('allergies');
  }

  if (missing.length === 0) return null;

  const isForSelf = profile.relationship.toLowerCase() === 'me';
  let content = `I notice ${isForSelf ? 'your' : `${profile.name}'s`} profile is missing ${missing.join(' and ')}. `;
  content += `This doesn't stop us from continuing, but adding this information helps me keep ${isForSelf ? 'you' : profile.name} safe from drug interactions or allergic reactions.\n\n`;
  content += `Would you like to add this now, or should we continue?`;

  return {
    id: Date.now().toString(),
    type: 'system',
    content,
    reasoning: 'Missing profile data reduces safety of recommendations',
    timestamp: new Date()
  };
}

// Medication safety check
export function checkMedicationSafety(
  profile: ProfileContext,
  proposedMedication: string
): { safe: boolean; message?: string } {
  // Check allergies
  if (profile.allergies) {
    if (profile.allergies.some(a => a.toLowerCase().includes('penicillin')) && 
        proposedMedication.toLowerCase().includes('penicillin')) {
      return {
        safe: false,
        message: `❌ I can't recommend this. ${profile.name} has a documented Penicillin allergy. Alternative options like Azithromycin would be safer.`
      };
    }

    if (profile.allergies.some(a => a.toLowerCase().includes('shellfish')) && 
        proposedMedication.toLowerCase().includes('iodine')) {
      return {
        safe: false,
        message: `❌ I can't recommend this. ${profile.name}'s shellfish allergy may indicate iodine sensitivity.`
      };
    }
  }

  // Check medication interactions
  if (profile.medications) {
    if (profile.medications.some(m => m.toLowerCase().includes('warfarin')) && 
        proposedMedication.toLowerCase().includes('aspirin')) {
      return {
        safe: false,
        message: `❌ I can't recommend this. Aspirin can interact with ${profile.name}'s Warfarin and increase bleeding risk. Acetaminophen would be safer.`
      };
    }

    if (profile.medications.some(m => m.toLowerCase().includes('metformin')) && 
        proposedMedication.toLowerCase().includes('alcohol')) {
      return {
        safe: false,
        message: `❌ I can't recommend this. Alcohol can interact dangerously with ${profile.name}'s Metformin.`
      };
    }
  }

  return { safe: true };
}
