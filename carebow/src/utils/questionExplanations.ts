/**
 * Question Explanations Utility
 * Provides "Why I'm asking" micro-explanations for critical follow-up questions
 */

/**
 * Question category with associated keywords and explanation
 */
type QuestionCategory = {
  keywords: string[];
  explanation: string;
};

/**
 * Categories of critical questions that warrant explanations
 */
const QUESTION_CATEGORIES: QuestionCategory[] = [
  {
    keywords: [
      'breathing',
      'breathe',
      'breath',
      'shortness of breath',
      'difficulty breathing',
      'hard to breathe',
      'can\'t breathe',
      'trouble breathing',
    ],
    explanation: 'I\'m asking because breathing changes can indicate how urgent this might be.',
  },
  {
    keywords: [
      'chest pain',
      'chest',
      'heart',
      'cardiac',
      'palpitations',
      'chest tightness',
      'pressure in chest',
    ],
    explanation: 'I\'m asking because chest symptoms help me assess if this needs immediate attention.',
  },
  {
    keywords: [
      'faint',
      'fainting',
      'fainted',
      'passed out',
      'black out',
      'lost consciousness',
      'dizzy',
      'dizziness',
      'lightheaded',
    ],
    explanation: 'I\'m asking because fainting or dizziness can signal something that needs quick care.',
  },
  {
    keywords: [
      'fever',
      'temperature',
      'chills',
      'hot',
      'burning up',
    ],
    explanation: 'I\'m asking because fever patterns help me understand how serious this might be.',
  },
  {
    keywords: [
      'severe pain',
      'worst pain',
      'intense pain',
      'unbearable',
      'excruciating',
      '10 out of 10',
      'scale of 1',
      'how severe',
      'how bad',
      'rate the pain',
    ],
    explanation: 'I\'m asking because pain severity helps me judge how urgent this might be.',
  },
  {
    keywords: [
      'blood',
      'bleeding',
      'vomiting blood',
      'coughing blood',
    ],
    explanation: 'I\'m asking because bleeding can indicate if you need care right away.',
  },
  {
    keywords: [
      'sudden',
      'suddenly',
      'came on fast',
      'out of nowhere',
    ],
    explanation: 'I\'m asking because sudden onset can change how urgently this should be addressed.',
  },
  {
    keywords: [
      'worse',
      'getting worse',
      'worsening',
      'progressing',
    ],
    explanation: 'I\'m asking because worsening symptoms help me understand if this is time-sensitive.',
  },
];

/**
 * Tracks which explanations have been shown in the current session
 * to avoid repetition
 */
const shownExplanations = new Set<string>();

/**
 * Reset shown explanations (call when starting a new conversation)
 */
export function resetShownExplanations(): void {
  shownExplanations.clear();
}

/**
 * Detect if an assistant message contains a critical question
 * and return the appropriate explanation if not already shown
 *
 * @param messageText - The assistant's message text
 * @returns The explanation string if applicable, or null
 */
export function getQuestionExplanation(messageText: string): string | null {
  if (!messageText) return null;

  const lowerText = messageText.toLowerCase();

  // Check if this looks like a question (contains ? or question-like phrases)
  const isQuestion =
    lowerText.includes('?') ||
    lowerText.includes('how') ||
    lowerText.includes('when') ||
    lowerText.includes('what') ||
    lowerText.includes('do you') ||
    lowerText.includes('are you') ||
    lowerText.includes('have you') ||
    lowerText.includes('is there') ||
    lowerText.includes('can you') ||
    lowerText.includes('does it') ||
    lowerText.includes('did you');

  if (!isQuestion) return null;

  // Find matching category
  for (const category of QUESTION_CATEGORIES) {
    for (const keyword of category.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        // Check if this explanation was already shown
        if (shownExplanations.has(category.explanation)) {
          return null;
        }

        // Mark as shown and return
        shownExplanations.add(category.explanation);
        return category.explanation;
      }
    }
  }

  return null;
}

/**
 * Check if a message should show an explanation without marking it as shown
 * Useful for preview/display purposes
 *
 * @param messageText - The assistant's message text
 * @returns The explanation string if applicable, or null
 */
export function peekQuestionExplanation(messageText: string): string | null {
  if (!messageText) return null;

  const lowerText = messageText.toLowerCase();

  // Check if this looks like a question
  const isQuestion =
    lowerText.includes('?') ||
    lowerText.includes('how') ||
    lowerText.includes('when') ||
    lowerText.includes('what') ||
    lowerText.includes('do you') ||
    lowerText.includes('are you') ||
    lowerText.includes('have you');

  if (!isQuestion) return null;

  // Find matching category
  for (const category of QUESTION_CATEGORIES) {
    for (const keyword of category.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return category.explanation;
      }
    }
  }

  return null;
}
