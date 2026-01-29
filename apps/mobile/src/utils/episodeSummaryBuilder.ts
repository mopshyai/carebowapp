/**
 * Episode Summary Builder Utility
 * Generates shareable summaries from episode data
 */

import { Episode, EpisodeMessage } from '../types/episode';
import { TriageLevel } from './triageCTAMapping';

// ============================================
// TYPES
// ============================================

export interface EpisodeSummary {
  // Header
  title: string;
  dateRange: string;
  forWhom: string;
  triageLevel?: TriageLevel;

  // Main sections
  understanding: string;
  timeline: TimelineItem[];
  redFlags: string[];
  questionsForDoctor: string[];

  // Raw text for sharing
  shareableText: string;
}

export interface TimelineItem {
  label: string;
  value: string;
  type: 'symptom' | 'onset' | 'severity' | 'associated' | 'context';
}

// ============================================
// SECTION PARSERS
// ============================================

/**
 * Parse structured sections from assistant messages
 */
function parseStructuredSections(messages: EpisodeMessage[]): {
  understanding?: string;
  redFlags?: string[];
  selfCare?: string[];
  possibilities?: string[];
} {
  const assistantMessages = messages.filter((m) => m.role === 'assistant');
  const result: {
    understanding?: string;
    redFlags?: string[];
    selfCare?: string[];
    possibilities?: string[];
  } = {};

  for (const msg of assistantMessages) {
    const text = msg.text;

    // Look for "What I understand" section
    const understandingMatch = text.match(
      /(?:what i understand|from what you.ve shared|based on what you.ve told me)[:\n]?\s*([^]*?)(?=(?:how serious|what this could|watch for|next step|\n\n|$))/i
    );
    if (understandingMatch && !result.understanding) {
      result.understanding = cleanText(understandingMatch[1]);
    }

    // Look for red flags section
    const redFlagsMatch = text.match(
      /(?:watch for|red flags|seek help if)[:\n]?\s*([^]*?)(?=(?:next step|what you can|\n\n|$))/i
    );
    if (redFlagsMatch && !result.redFlags) {
      result.redFlags = extractBulletPoints(redFlagsMatch[1]);
    }

    // Look for possibilities section
    const possibilitiesMatch = text.match(
      /(?:what this could be|possible causes|this could be)[:\n]?\s*([^]*?)(?=(?:what you can|watch for|next step|\n\n|$))/i
    );
    if (possibilitiesMatch && !result.possibilities) {
      result.possibilities = extractBulletPoints(possibilitiesMatch[1]);
    }
  }

  return result;
}

/**
 * Extract bullet points from text
 */
function extractBulletPoints(text: string): string[] {
  const lines = text.split('\n');
  const bullets: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Match various bullet formats: -, •, *, numbers
    const bulletMatch = trimmed.match(/^[-•*]\s*(.+)|^\d+[.)]\s*(.+)/);
    if (bulletMatch) {
      const content = bulletMatch[1] || bulletMatch[2];
      if (content && content.length > 3) {
        bullets.push(cleanText(content));
      }
    } else if (trimmed.length > 10 && !trimmed.includes(':')) {
      // Include non-bullet lines that look like content
      bullets.push(cleanText(trimmed));
    }
  }

  return bullets.filter((b) => b.length > 0).slice(0, 5);
}

/**
 * Clean text by removing extra whitespace and formatting
 */
function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/^\s*[-•*]\s*/, '')
    .trim();
}

// ============================================
// HEURISTIC EXTRACTORS
// ============================================

/**
 * Extract symptoms from user messages
 */
function extractSymptoms(messages: EpisodeMessage[]): string[] {
  const userMessages = messages.filter((m) => m.role === 'user');
  const symptoms: string[] = [];

  const symptomKeywords = [
    'pain', 'ache', 'hurt', 'sore', 'fever', 'headache', 'nausea',
    'vomiting', 'dizziness', 'fatigue', 'tired', 'rash', 'swelling',
    'cough', 'cold', 'flu', 'breathing', 'chest', 'stomach', 'back',
  ];

  for (const msg of userMessages) {
    const lowerText = msg.text.toLowerCase();
    for (const keyword of symptomKeywords) {
      if (lowerText.includes(keyword)) {
        // Extract the sentence containing the keyword
        const sentences = msg.text.split(/[.!?]+/);
        for (const sentence of sentences) {
          if (sentence.toLowerCase().includes(keyword) && sentence.length > 10) {
            symptoms.push(cleanText(sentence));
            break;
          }
        }
      }
    }
  }

  // Remove duplicates and limit
  return [...new Set(symptoms)].slice(0, 3);
}

/**
 * Extract onset/duration from messages
 */
function extractOnset(messages: EpisodeMessage[]): string | null {
  const allText = messages.map((m) => m.text).join(' ').toLowerCase();

  const onsetPatterns = [
    /(?:started|began|since)\s+(yesterday|today|this morning|last night|few days ago|a week ago|[0-9]+ (?:days?|hours?|weeks?) ago)/i,
    /(?:for|about)\s+([0-9]+\s+(?:days?|hours?|weeks?|months?))/i,
    /(?:just now|just started|recently)/i,
  ];

  for (const pattern of onsetPatterns) {
    const match = allText.match(pattern);
    if (match) {
      return match[1] || match[0];
    }
  }

  return null;
}

/**
 * Extract severity from messages
 */
function extractSeverity(messages: EpisodeMessage[]): string | null {
  const allText = messages.map((m) => m.text).join(' ').toLowerCase();

  // Look for numeric scale
  const scaleMatch = allText.match(/(?:severity|pain|rate)[:\s]+([0-9]+)(?:\/10|\s*out of\s*10)?/i);
  if (scaleMatch) {
    return `${scaleMatch[1]}/10`;
  }

  // Look for descriptive severity
  const severityWords = ['mild', 'moderate', 'severe', 'intense', 'unbearable', 'slight'];
  for (const word of severityWords) {
    if (allText.includes(word)) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
  }

  return null;
}

/**
 * Generate default red flags based on symptoms
 */
function generateDefaultRedFlags(symptoms: string[]): string[] {
  const redFlags: string[] = [];
  const symptomsText = symptoms.join(' ').toLowerCase();

  if (symptomsText.includes('head') || symptomsText.includes('pain')) {
    redFlags.push('Sudden severe headache or "worst headache of your life"');
  }
  if (symptomsText.includes('chest') || symptomsText.includes('heart')) {
    redFlags.push('Chest pain spreading to arm, jaw, or back');
  }
  if (symptomsText.includes('breath') || symptomsText.includes('breathing')) {
    redFlags.push('Difficulty breathing or shortness of breath at rest');
  }
  if (symptomsText.includes('fever')) {
    redFlags.push('Fever over 103°F (39.4°C) or fever with stiff neck');
  }

  // Add general red flags if none specific
  if (redFlags.length === 0) {
    redFlags.push('Symptoms suddenly get much worse');
    redFlags.push('New symptoms appear (fever, confusion, severe pain)');
  }

  return redFlags.slice(0, 4);
}

/**
 * Generate questions to ask a doctor
 */
function generateDoctorQuestions(summary: Partial<EpisodeSummary>): string[] {
  const questions: string[] = [];

  questions.push('What do you think is causing these symptoms?');
  questions.push('Are there any tests I should have done?');
  questions.push('What treatment options do you recommend?');
  questions.push('When should I follow up or seek immediate care?');

  return questions;
}

// ============================================
// MAIN BUILDER
// ============================================

/**
 * Build a complete episode summary
 */
export function buildEpisodeSummary(
  episode: Episode,
  messages: EpisodeMessage[]
): EpisodeSummary {
  // Parse structured sections from AI responses
  const structured = parseStructuredSections(messages);

  // Extract heuristic data
  const symptoms = extractSymptoms(messages);
  const onset = extractOnset(messages);
  const severity = extractSeverity(messages);

  // Build timeline
  const timeline: TimelineItem[] = [];

  // Add primary symptom
  if (symptoms.length > 0) {
    timeline.push({
      label: 'Main concern',
      value: symptoms[0],
      type: 'symptom',
    });
  }

  // Add onset
  if (onset) {
    timeline.push({
      label: 'Started',
      value: onset,
      type: 'onset',
    });
  }

  // Add severity
  if (severity) {
    timeline.push({
      label: 'Severity',
      value: severity,
      type: 'severity',
    });
  }

  // Add associated symptoms
  if (symptoms.length > 1) {
    timeline.push({
      label: 'Also experiencing',
      value: symptoms.slice(1).join(', '),
      type: 'associated',
    });
  }

  // Add context
  if (episode.forWhom === 'family' && episode.relationship) {
    timeline.push({
      label: 'Patient',
      value: `${episode.relationship}${episode.ageGroup ? ` (${episode.ageGroup})` : ''}`,
      type: 'context',
    });
  }

  // Build understanding
  const understanding =
    structured.understanding ||
    (symptoms.length > 0
      ? `Experiencing ${symptoms[0].toLowerCase()}${onset ? ` for ${onset}` : ''}.`
      : 'Health concern discussed with AI assistant.');

  // Build red flags
  const redFlags = structured.redFlags?.length
    ? structured.redFlags
    : generateDefaultRedFlags(symptoms);

  // Build questions for doctor
  const questionsForDoctor = generateDoctorQuestions({ timeline, redFlags });

  // Format date range
  const startDate = new Date(episode.createdAt);
  const endDate = new Date(episode.updatedAt);
  const dateRange = formatDateRange(startDate, endDate);

  // Build forWhom display
  const forWhomDisplay =
    episode.forWhom === 'family'
      ? `For ${episode.relationship || 'family member'}${episode.ageGroup ? ` (${episode.ageGroup})` : ''}`
      : 'For myself';

  // Build summary object
  const summary: EpisodeSummary = {
    title: episode.title,
    dateRange,
    forWhom: forWhomDisplay,
    triageLevel: episode.triageLevel,
    understanding,
    timeline,
    redFlags,
    questionsForDoctor,
    shareableText: '', // Will be generated below
  };

  // Generate shareable text
  summary.shareableText = generateShareableText(summary);

  return summary;
}

/**
 * Format date range for display
 */
function formatDateRange(start: Date, end: Date): string {
  const startStr = start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  // If same day, just show one date
  if (start.toDateString() === end.toDateString()) {
    return startStr;
  }

  const endStr = end.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return `${startStr} - ${endStr}`;
}

/**
 * Generate shareable text version of summary
 */
function generateShareableText(summary: EpisodeSummary): string {
  const lines: string[] = [];

  // Header
  lines.push('═══════════════════════════════════');
  lines.push('CAREBOW HEALTH SUMMARY');
  lines.push('═══════════════════════════════════');
  lines.push('');
  lines.push(`Episode: ${summary.title}`);
  lines.push(`Date: ${summary.dateRange}`);
  lines.push(`${summary.forWhom}`);
  if (summary.triageLevel) {
    lines.push(`Urgency: ${summary.triageLevel.toUpperCase()}`);
  }
  lines.push('');

  // Understanding
  lines.push('WHAT WE DISCUSSED');
  lines.push('─────────────────');
  lines.push(summary.understanding);
  lines.push('');

  // Timeline
  if (summary.timeline.length > 0) {
    lines.push('KEY INFORMATION');
    lines.push('───────────────');
    for (const item of summary.timeline) {
      lines.push(`• ${item.label}: ${item.value}`);
    }
    lines.push('');
  }

  // Red flags
  if (summary.redFlags.length > 0) {
    lines.push('⚠️ WATCH FOR THESE RED FLAGS');
    lines.push('────────────────────────────');
    for (const flag of summary.redFlags) {
      lines.push(`• ${flag}`);
    }
    lines.push('');
  }

  // Questions for doctor
  if (summary.questionsForDoctor.length > 0) {
    lines.push('QUESTIONS TO ASK YOUR DOCTOR');
    lines.push('────────────────────────────');
    for (const question of summary.questionsForDoctor) {
      lines.push(`• ${question}`);
    }
    lines.push('');
  }

  // Footer
  lines.push('═══════════════════════════════════');
  lines.push('Generated by CareBow Health Assistant');
  lines.push('This is not medical advice. Please consult');
  lines.push('a healthcare provider for diagnosis.');
  lines.push('═══════════════════════════════════');

  return lines.join('\n');
}

/**
 * Get triage level display info
 */
export function getTriageLevelDisplay(level?: TriageLevel): {
  label: string;
  color: string;
  bgColor: string;
} {
  switch (level) {
    case 'emergency':
      return { label: 'Emergency', color: '#DC2626', bgColor: '#FEE2E2' };
    case 'urgent':
      return { label: 'Urgent', color: '#EA580C', bgColor: '#FFEDD5' };
    case 'soon':
      return { label: 'See Doctor Soon', color: '#D97706', bgColor: '#FEF3C7' };
    case 'self_care':
      return { label: 'Self-Care', color: '#16A34A', bgColor: '#DCFCE7' };
    default:
      return { label: 'Not Assessed', color: '#6B7280', bgColor: '#F3F4F6' };
  }
}
