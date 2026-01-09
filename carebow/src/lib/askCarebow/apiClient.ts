/**
 * Ask CareBow API Client
 * API client with mock responses for development
 */

import { MemorySnapshot, MemoryCandidate } from '../../types/healthMemory';
import { UrgencyLevel } from '../../types/askCarebow';
import type { ImageAttachment } from '../../components/askCarebow/ImageUploadBottomSheet';
import type { EnhancedResponse } from '../../components/askCarebow/EnhancedChatBubble';
import {
  HEALTH_BUDDY_SYSTEM_PROMPT,
  FOLLOW_UP_ENGINE_PROMPT,
  MEMORY_EXTRACTOR_PROMPT,
  IMAGE_INTERPRETER_PROMPT,
  TRIAGE_RESPONSE_PROMPT,
  FOLLOW_UP_CATEGORIES,
  EMERGENCY_RESPONSE,
  MEDICAL_DISCLAIMER,
  NO_FOLLOW_UP_SIGNAL,
  MEMORY_TYPES,
  CONFIDENCE_LEVELS,
  IMAGE_VISIBLE_FEATURES,
  IMAGE_FOLLOW_UP_QUESTIONS,
  TRIAGE_LEVELS,
  RESPONSE_SECTIONS,
  UNCERTAINTY_LEVELS,
} from './prompts';
import type { MemoryType, ConfidenceLevel, TriageLevel, UncertaintyLevel } from './prompts';

// Re-export prompts for external use
export {
  HEALTH_BUDDY_SYSTEM_PROMPT,
  FOLLOW_UP_ENGINE_PROMPT,
  MEMORY_EXTRACTOR_PROMPT,
  IMAGE_INTERPRETER_PROMPT,
  TRIAGE_RESPONSE_PROMPT,
  FOLLOW_UP_CATEGORIES,
  EMERGENCY_RESPONSE,
  MEDICAL_DISCLAIMER,
  NO_FOLLOW_UP_SIGNAL,
  MEMORY_TYPES,
  CONFIDENCE_LEVELS,
  IMAGE_VISIBLE_FEATURES,
  IMAGE_FOLLOW_UP_QUESTIONS,
  TRIAGE_LEVELS,
  RESPONSE_SECTIONS,
  UNCERTAINTY_LEVELS,
};
export type { MemoryType, ConfidenceLevel, TriageLevel, UncertaintyLevel };

// ============================================
// API TYPES
// ============================================

export type AskCareBowMessagePayload = {
  userId: string;
  context: {
    forWhom: 'me' | 'family';
    ageGroup?: string;
    relationship?: string;
  };
  messageText: string;
  attachments: Array<{
    type: 'image';
    uri: string;
    mimeType: string;
  }>;
  memorySnapshot: MemorySnapshot;
  conversationId?: string;
  systemPrompt?: string; // Health Buddy system prompt
};

export type AskCareBowMessageResponse = {
  conversationId: string;
  assistantMessage: string;
  enhancedResponse?: EnhancedResponse;
  triageLevel: 'emergency' | 'urgent' | 'soon' | 'self_care';
  followUpQuestions: string[];
  memoryCandidates: MemoryCandidate[];
};

// ============================================
// MOCK DATA
// ============================================

const MOCK_FOLLOW_UP_QUESTIONS: Record<string, string[]> = {
  default: [
    'How long have you been experiencing this?',
    'On a scale of 1-10, how severe would you say it is?',
  ],
  headache: [
    'Is the pain throbbing, dull, or sharp?',
    'Have you had any recent head injuries or new medications?',
  ],
  stomach: [
    'When did the pain start - suddenly or gradually?',
    'Have you eaten anything unusual recently?',
  ],
  rash: [
    'Is the rash itchy, painful, or neither?',
    'Have you used any new products or been in contact with plants?',
  ],
  fever: [
    "What is the current temperature reading?",
    'Are there any other symptoms like cough, body aches, or fatigue?',
  ],
  anxiety: [
    'How long have you been feeling this way?',
    'Are there specific situations that trigger these feelings?',
  ],
};

const MOCK_MEMORY_CANDIDATES: MemoryCandidate[] = [
  {
    id: 'cand_1',
    type: 'condition',
    label: 'Condition',
    value: 'Occasional headaches',
    confidence: 'medium',
    reason: 'You mentioned experiencing headaches',
  },
  {
    id: 'cand_2',
    type: 'trigger',
    label: 'Trigger',
    value: 'Screen time may trigger symptoms',
    confidence: 'low',
    reason: 'This often correlates with headaches',
  },
];

const MOCK_ENHANCED_RESPONSES: Record<string, EnhancedResponse> = {
  headache: {
    summary: "I understand you're experiencing a headache. Let me ask a few questions to better understand what might be causing it and how to help.",
    understanding: "You've described having a headache. Headaches are common and can have many causes, from tension and dehydration to more specific conditions.",
    possibilities: [
      { name: 'Tension headache', uncertainty: 'LOW' },
      { name: 'Migraine', uncertainty: 'MED' },
      { name: 'Dehydration-related', uncertainty: 'MED' },
      { name: 'Sinus pressure', uncertainty: 'HIGH' },
    ],
    triageLevel: 'self_care',
    triageDescription: 'Based on what you\'ve shared, this appears manageable with self-care. However, I\'d like to learn more to give you better guidance.',
    selfCareActions: [
      'Rest in a quiet, dark room if possible',
      'Stay hydrated - drink water regularly',
      'Apply a cold or warm compress to your forehead or neck',
      'Consider over-the-counter pain relief if appropriate for you',
    ],
    redFlags: [
      'Sudden severe headache ("thunderclap")',
      'Headache with fever and stiff neck',
      'Vision changes or confusion',
      'Headache after a head injury',
    ],
  },
  rash: {
    summary: "I see you're concerned about a rash. To help you better, I'd like to understand more about what you're experiencing.",
    understanding: "You've mentioned having a rash. Skin conditions can vary widely, and photos will help me provide better guidance.",
    possibilities: [
      { name: 'Contact dermatitis', uncertainty: 'MED' },
      { name: 'Allergic reaction', uncertainty: 'MED' },
      { name: 'Eczema flare', uncertainty: 'HIGH' },
      { name: 'Heat rash', uncertainty: 'HIGH' },
    ],
    triageLevel: 'self_care',
    triageDescription: 'Most rashes can be managed at home, but I\'d recommend monitoring for any changes.',
    selfCareActions: [
      'Keep the area clean and dry',
      'Avoid scratching to prevent infection',
      'Apply a gentle, fragrance-free moisturizer',
      'Consider over-the-counter hydrocortisone if itchy',
    ],
    redFlags: [
      'Rapid spreading of the rash',
      'Difficulty breathing or swelling of face/throat',
      'High fever accompanying the rash',
      'Blistering or open sores',
    ],
  },
  default: {
    summary: "Thank you for sharing that with me. I'd like to understand your situation better so I can provide helpful guidance.",
    understanding: "I've noted your concern. To give you the most relevant information, I need to learn a bit more about what you're experiencing.",
    possibilities: [],
    triageLevel: 'self_care',
    triageDescription: 'Let me gather more information to better assess your situation.',
    selfCareActions: [
      'Rest and monitor your symptoms',
      'Stay hydrated',
      'Note any changes in your symptoms',
    ],
    redFlags: [
      'Sudden severe symptoms',
      'Difficulty breathing',
      'High fever (over 103°F/39.4°C)',
      'Confusion or altered consciousness',
    ],
  },
};

// ============================================
// MOCK API CLIENT
// ============================================

const USE_MOCK = true; // Set to false when backend is ready
const API_BASE_URL = 'https://api.carebow.com/v1'; // Replace with actual URL

/**
 * Detect keywords to customize mock response
 */
function detectKeywords(text: string): string {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('headache') || lowerText.includes('head pain') || lowerText.includes('migraine')) {
    return 'headache';
  }
  if (lowerText.includes('rash') || lowerText.includes('skin') || lowerText.includes('itchy')) {
    return 'rash';
  }
  if (lowerText.includes('stomach') || lowerText.includes('belly') || lowerText.includes('nausea')) {
    return 'stomach';
  }
  if (lowerText.includes('fever') || lowerText.includes('temperature') || lowerText.includes('hot')) {
    return 'fever';
  }
  if (lowerText.includes('anxious') || lowerText.includes('worried') || lowerText.includes('stressed') || lowerText.includes('anxiety')) {
    return 'anxiety';
  }

  return 'default';
}

/**
 * Determine triage level based on keywords
 */
function determineTriageLevel(text: string): 'emergency' | 'urgent' | 'soon' | 'self_care' {
  const lowerText = text.toLowerCase();

  const emergencyKeywords = ['chest pain', 'can\'t breathe', 'unconscious', 'severe bleeding', 'stroke'];
  const urgentKeywords = ['high fever', 'severe pain', 'vomiting blood', 'sudden weakness'];
  const soonKeywords = ['persistent', 'getting worse', 'several days'];

  if (emergencyKeywords.some(k => lowerText.includes(k))) return 'emergency';
  if (urgentKeywords.some(k => lowerText.includes(k))) return 'urgent';
  if (soonKeywords.some(k => lowerText.includes(k))) return 'soon';

  return 'self_care';
}

/**
 * Generate mock memory candidates based on message content
 */
function generateMemoryCandidates(text: string): MemoryCandidate[] {
  const candidates: MemoryCandidate[] = [];
  const lowerText = text.toLowerCase();

  // Detect allergies
  const allergyMatch = lowerText.match(/allergic to (\w+)/);
  if (allergyMatch) {
    candidates.push({
      id: `cand_${Date.now()}_1`,
      type: 'allergy',
      label: 'Allergy',
      value: allergyMatch[1],
      confidence: 'high',
      reason: 'You mentioned being allergic to this',
    });
  }

  // Detect medications
  const medMatch = lowerText.match(/taking (\w+)|on (\w+) medication/);
  if (medMatch) {
    candidates.push({
      id: `cand_${Date.now()}_2`,
      type: 'medication',
      label: 'Medication',
      value: medMatch[1] || medMatch[2],
      confidence: 'medium',
      reason: 'You mentioned taking this medication',
    });
  }

  // Detect conditions
  if (lowerText.includes('diabetes') || lowerText.includes('diabetic')) {
    candidates.push({
      id: `cand_${Date.now()}_3`,
      type: 'condition',
      label: 'Condition',
      value: 'Diabetes',
      confidence: 'high',
      reason: 'You mentioned having diabetes',
    });
  }

  // Add default candidates if none detected
  if (candidates.length === 0) {
    const keyword = detectKeywords(text);
    if (keyword !== 'default') {
      candidates.push({
        id: `cand_${Date.now()}_default`,
        type: 'past_episode',
        label: 'Past Episode',
        value: `Experienced ${keyword} symptoms`,
        confidence: 'low',
        reason: 'To track patterns in your health history',
      });
    }
  }

  return candidates;
}

/**
 * Send message to Ask CareBow API
 */
export async function sendAskCareBowMessage(
  payload: AskCareBowMessagePayload
): Promise<AskCareBowMessageResponse> {
  if (USE_MOCK) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));

    const keyword = detectKeywords(payload.messageText);
    const triageLevel = determineTriageLevel(payload.messageText);
    const followUpQuestions = MOCK_FOLLOW_UP_QUESTIONS[keyword] || MOCK_FOLLOW_UP_QUESTIONS.default;
    const enhancedResponse = MOCK_ENHANCED_RESPONSES[keyword] || MOCK_ENHANCED_RESPONSES.default;
    const memoryCandidates = generateMemoryCandidates(payload.messageText);

    return {
      conversationId: payload.conversationId || `conv_${Date.now()}`,
      assistantMessage: enhancedResponse.summary,
      enhancedResponse: {
        ...enhancedResponse,
        triageLevel,
      },
      triageLevel,
      followUpQuestions,
      memoryCandidates,
    };
  }

  // Real API call (when backend is ready)
  try {
    const response = await fetch(`${API_BASE_URL}/ask-carebow/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add auth headers as needed
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Ask CareBow API error:', error);
    throw error;
  }
}

/**
 * Upload image attachment
 */
export async function uploadImage(image: ImageAttachment): Promise<string> {
  if (USE_MOCK) {
    // Return the local URI in mock mode
    await new Promise(resolve => setTimeout(resolve, 200));
    return image.uri;
  }

  // Real upload implementation
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: image.uri,
      type: image.type,
      name: image.fileName || 'image.jpg',
    } as any);

    const response = await fetch(`${API_BASE_URL}/uploads/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload error: ${response.status}`);
    }

    const result = await response.json();
    return result.url;
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Create API payload from conversation state
 */
export function createMessagePayload(
  userId: string,
  messageText: string,
  context: { forWhom: 'me' | 'family'; ageGroup?: string; relationship?: string },
  attachments: ImageAttachment[],
  memorySnapshot: MemorySnapshot,
  conversationId?: string,
  includeSystemPrompt: boolean = true
): AskCareBowMessagePayload {
  return {
    userId,
    context,
    messageText,
    attachments: attachments.map(img => ({
      type: 'image' as const,
      uri: img.uri,
      mimeType: img.type,
    })),
    memorySnapshot,
    conversationId,
    // Include system prompt on first message of conversation
    systemPrompt: includeSystemPrompt && !conversationId ? HEALTH_BUDDY_SYSTEM_PROMPT : undefined,
  };
}
