// CareBow Edge Case Detection & Handling

export interface EdgeCaseResult {
  detected: boolean;
  type?: 'emergency' | 'mental-health' | 'medication-conflict' | 'insufficient-info' | 'contradiction' | 'repeated-symptom' | 'elder-caution';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  actions?: string[];
  blockConversation?: boolean;
}

// EDGE 7: EMERGENCY DETECTION (HARD STOP)
export function detectEmergencyKeywords(text: string): EdgeCaseResult {
  const lowerText = text.toLowerCase();
  
  const emergencyPatterns = [
    // Cardiovascular
    { keywords: ['chest pain', 'chest pressure', 'crushing chest'], severity: 'critical' as const },
    { keywords: ['can\'t breathe', 'difficulty breathing', 'gasping'], severity: 'critical' as const },
    { keywords: ['heart racing', 'irregular heartbeat', 'chest pain'], severity: 'critical' as const },
    
    // Neurological
    { keywords: ['stroke', 'face drooping', 'slurred speech', 'can\'t move arm'], severity: 'critical' as const },
    { keywords: ['severe headache', 'worst headache', 'sudden headache'], severity: 'critical' as const },
    { keywords: ['unconscious', 'passed out', 'lost consciousness'], severity: 'critical' as const },
    { keywords: ['confused', 'disoriented', 'not making sense'], severity: 'critical' as const },
    
    // Bleeding/Trauma
    { keywords: ['severe bleeding', 'won\'t stop bleeding', 'heavy bleeding'], severity: 'critical' as const },
    { keywords: ['severe burn', 'third degree'], severity: 'critical' as const },
    
    // Overdose/Poisoning
    { keywords: ['overdose', 'took too many', 'swallowed poison'], severity: 'critical' as const },
    
    // Vision
    { keywords: ['sudden vision loss', 'can\'t see', 'blind'], severity: 'critical' as const }
  ];

  for (const pattern of emergencyPatterns) {
    if (pattern.keywords.some(keyword => lowerText.includes(keyword))) {
      return {
        detected: true,
        type: 'emergency',
        severity: pattern.severity,
        message: 'This may be serious',
        blockConversation: true
      };
    }
  }

  return { detected: false, severity: 'low', message: '' };
}

// EDGE 6: MENTAL HEALTH / DISTRESS DETECTION
export function detectMentalHealthCrisis(text: string): EdgeCaseResult {
  const lowerText = text.toLowerCase();
  
  const crisisKeywords = [
    'suicide', 'kill myself', 'end my life', 'want to die',
    'hopeless', 'no point', 'can\'t go on',
    'severe panic', 'panic attack', 'can\'t cope',
    'self harm', 'hurt myself'
  ];

  if (crisisKeywords.some(keyword => lowerText.includes(keyword))) {
    return {
      detected: true,
      type: 'mental-health',
      severity: 'critical',
      message: "I'm really glad you reached out. You don't have to handle this alone.",
      actions: ['Talk to a professional', 'Call support', 'Reach crisis help'],
      blockConversation: true
    };
  }

  return { detected: false, severity: 'low', message: '' };
}

// EDGE 2: INSUFFICIENT INFO DETECTION
export function detectInsufficientInfo(text: string): EdgeCaseResult {
  const lowerText = text.toLowerCase();
  const wordCount = text.trim().split(/\s+/).length;
  
  // Too vague
  const vagueInputs = [
    'feel bad', 'not good', 'sick', 'unwell', 'something wrong',
    'don\'t feel right', 'off', 'weird'
  ];

  const isVague = vagueInputs.some(phrase => lowerText === phrase || lowerText.includes(phrase));
  const isTooShort = wordCount <= 2 && !lowerText.includes('pain') && !lowerText.includes('fever');

  if (isVague || isTooShort) {
    return {
      detected: true,
      type: 'insufficient-info',
      severity: 'medium',
      message: "I don't have enough information to guide you safely yet.",
      actions: ['Answer questions', 'Book a consult instead']
    };
  }

  return { detected: false, severity: 'low', message: '' };
}

// EDGE 3: CONTRADICTION DETECTION
export function detectContradiction(
  previousAnswers: { question: string; answer: string }[],
  currentAnswer: string,
  currentQuestion: string
): EdgeCaseResult {
  // Simple contradiction check for common cases
  const lowerCurrent = currentAnswer.toLowerCase();
  
  for (const prev of previousAnswers) {
    const lowerPrev = prev.answer.toLowerCase();
    
    // Check for pain contradictions
    if (prev.question.includes('pain') && currentQuestion.includes('pain')) {
      const prevHadNoPain = lowerPrev.includes('no') || lowerPrev.includes('none');
      const currentHasPain = lowerCurrent.includes('yes') || lowerCurrent.includes('pain');
      
      if (prevHadNoPain && currentHasPain) {
        return {
          detected: true,
          type: 'contradiction',
          severity: 'medium',
          message: `Earlier you mentioned no pain, but now you say there is some. Can you help me clarify?`,
          actions: ['Yes, I do have pain', 'No, I don\'t', 'Not sure']
        };
      }
    }

    // Check for symptom contradictions
    if (prev.answer.includes('no') && currentAnswer.includes('yes')) {
      const symptom = extractSymptom(prev.question);
      if (symptom && currentQuestion.includes(symptom)) {
        return {
          detected: true,
          type: 'contradiction',
          severity: 'medium',
          message: `Earlier you mentioned no ${symptom}, but now you say there is. Can you help me clarify?`,
          actions: ['Yes, I have this', 'No, I don\'t', 'Not sure']
        };
      }
    }
  }

  return { detected: false, severity: 'low', message: '' };
}

function extractSymptom(question: string): string | null {
  const symptoms = ['fever', 'cough', 'pain', 'nausea', 'dizziness', 'bleeding'];
  for (const symptom of symptoms) {
    if (question.toLowerCase().includes(symptom)) return symptom;
  }
  return null;
}

// EDGE 4: MEDICATION CONFLICT DETECTION (CRITICAL)
export function detectMedicationConflict(
  medications: string[],
  proposedAdvice: string
): EdgeCaseResult {
  const lowerMeds = medications.map(m => m.toLowerCase());
  const lowerAdvice = proposedAdvice.toLowerCase();

  // Critical interactions
  const conflicts = [
    {
      medication: 'warfarin',
      conflicts: ['aspirin', 'ibuprofen', 'nsaid'],
      message: "Because you're taking Warfarin, I can't recommend this safely."
    },
    {
      medication: 'metformin',
      conflicts: ['alcohol', 'drinking'],
      message: "Because you're taking Metformin, I can't recommend this safely."
    },
    {
      medication: 'maoi',
      conflicts: ['tyramine', 'aged cheese', 'certain foods'],
      message: "Because you're taking MAOI, I can't recommend this safely."
    },
    {
      medication: 'lithium',
      conflicts: ['nsaid', 'ibuprofen', 'dehydration'],
      message: "Because you're taking Lithium, I can't recommend this safely."
    }
  ];

  for (const conflict of conflicts) {
    const hasMedication = lowerMeds.some(m => m.includes(conflict.medication));
    const hasConflict = conflict.conflicts.some(c => lowerAdvice.includes(c));

    if (hasMedication && hasConflict) {
      return {
        detected: true,
        type: 'medication-conflict',
        severity: 'critical',
        message: conflict.message,
        actions: ['Consult a doctor', 'Home visit'],
        blockConversation: true
      };
    }
  }

  return { detected: false, severity: 'low', message: '' };
}

// EDGE 8: REPEATED SYMPTOM DETECTION
export interface PastSession {
  date: Date;
  symptoms: string[];
  outcome: string;
}

export function detectRepeatedSymptom(
  currentSymptom: string,
  pastSessions: PastSession[]
): EdgeCaseResult {
  const lowerSymptom = currentSymptom.toLowerCase();
  
  // Find similar symptoms in past sessions
  const matchingSessions = pastSessions.filter(session => {
    return session.symptoms.some(s => 
      lowerSymptom.includes(s.toLowerCase()) || s.toLowerCase().includes(lowerSymptom)
    );
  });

  if (matchingSessions.length >= 3) {
    return {
      detected: true,
      type: 'repeated-symptom',
      severity: 'high',
      message: "This issue has come up multiple times. I don't recommend managing this with self-care anymore.",
      actions: ['Book consult', 'Schedule home visit']
    };
  }

  return { detected: false, severity: 'low', message: '' };
}

// EDGE 5: ELDER/DEPENDENT ADAPTATION
export function getElderAdaptation(age?: number): {
  isElder: boolean;
  adaptations: {
    largerText: boolean;
    slowerPacing: boolean;
    shorterSentences: boolean;
    strongerCaution: boolean;
  };
} {
  const isElder = age ? age >= 60 : false;

  return {
    isElder,
    adaptations: {
      largerText: isElder,
      slowerPacing: isElder,
      shorterSentences: isElder,
      strongerCaution: isElder
    }
  };
}

export function adaptMessageForElder(message: string, isElder: boolean, name: string): string {
  if (!isElder) return message;

  // Shorter, simpler sentences
  let adapted = message.replace(/\. /g, '.\n\n');
  
  // Stronger caution language
  if (adapted.includes('recommend')) {
    adapted = adapted.replace('I recommend', "I don't recommend waiting. I recommend");
  }

  // Add context
  adapted = `Since this is for ${name}, ${adapted.toLowerCase()}`;

  return adapted;
}

// EDGE 9: USER REFUSES RECOMMENDATION
export function handleRefusedRecommendation(
  recommendationType: 'video' | 'home-visit' | 'emergency',
  reason: string
): EdgeCaseResult {
  const riskMessages = {
    'video': 'waiting may allow symptoms to worsen',
    'home-visit': 'delaying in-person assessment could miss important signs',
    'emergency': 'this could be life-threatening'
  };

  return {
    detected: true,
    type: 'elder-caution',
    severity: recommendationType === 'emergency' ? 'critical' : 'high',
    message: `That's your choice. I want you to know waiting carries some risk because ${riskMessages[recommendationType]}.`,
    actions: ['Proceed anyway', 'Book consult']
  };
}

// EDGE 10: DATA PRIVACY MESSAGE
export function getPrivacyMessage(): string {
  return "Your health data is used only to personalize care. It is never sold or shared without consent.";
}
