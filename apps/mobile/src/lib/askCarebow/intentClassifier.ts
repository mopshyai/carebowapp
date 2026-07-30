/**
 * Intent classification for Ask CareBow's opening message.
 *
 * Runs after the emergency/red-flag safety check (which always takes
 * priority) and before the conversation engine decides how to respond. Not
 * every message is a request for symptom triage — someone who just wants to
 * talk gets pushed through the same "onset, location, severity" question
 * sequence as everyone else today, which reads as a symptom-checker pretending
 * to listen rather than actually listening. This is the fix: identify that
 * case (and the "I already know what I want — a doctor, or a test" cases)
 * before falling into the default symptom-gathering flow.
 */

export type ConversationIntent = 'talk' | 'want_doctor' | 'want_test' | 'symptom_help';

const WANT_DOCTOR_PATTERNS =
  /\b(see|talk to|speak (with|to)|connect (me )?(with|to)|book|schedule)\b.{0,20}\b(doctor|physician|gp|clinician|provider)\b|\b(doctor|physician)\s*appointment\b|\bteleconsult/i;

const WANT_TEST_PATTERNS =
  /\b(get|book|schedule|need|want)\b.{0,20}\b(a |an |some )?(blood|lab|urine|covid|diagnostic)?\s*test(s|ing)?\b|\bget\s*(myself\s*)?tested\b|\blab\s*work\b/i;

// Phrases that name an explicit desire to talk/vent, or a purely emotional
// state with no accompanying physical-symptom language. Deliberately narrow —
// a false positive here means someone with a real physical complaint gets
// routed into supportive listening instead of triage, which is the wrong
// failure mode for a health app. When in doubt, this returns 'symptom_help'.
const WANT_TO_TALK_PATTERNS =
  /\b(just )?(want|need)(ed)?\s*(to)?\s*(talk|vent|chat)\b|\bjust\s+(talk|vent|chat)\b|\bsomeone to (talk|listen)\b|\b(i'?m|im|i\s*am|i\s*feel(ing)?)\b[^.!?]{0,25}\b(anxious|stressed|overwhelmed|lonely|sad|down|low|depressed)\b/i;

// If any physical-symptom-shaped word shows up alongside talk language, this
// is symptom help wearing an emotional framing ("I'm so stressed, my chest
// hurts") — never let the talk classification override a physical complaint.
const PHYSICAL_SYMPTOM_HINT =
  /\b(pain|ache|hurts?|fever|naus\w*|vomit\w*|dizzy|rash|cough|swelling|bleeding|breath(ing|less)?)\b/i;

export function classifyIntent(text: string): ConversationIntent {
  const normalized = text.trim();
  if (!normalized) return 'symptom_help';

  if (WANT_DOCTOR_PATTERNS.test(normalized)) return 'want_doctor';
  if (WANT_TEST_PATTERNS.test(normalized)) return 'want_test';

  if (WANT_TO_TALK_PATTERNS.test(normalized) && !PHYSICAL_SYMPTOM_HINT.test(normalized)) {
    return 'talk';
  }

  return 'symptom_help';
}
