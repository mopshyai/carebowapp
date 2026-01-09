/**
 * Triage Level to CTA Mapping Utility
 * Maps assessment results to appropriate call-to-action buttons
 */

export type TriageLevel = 'emergency' | 'urgent' | 'soon' | 'self_care';

export interface CTAButton {
  id: string;
  label: string;
  icon: string;
  action: string;
  variant: 'emergency' | 'urgent' | 'primary' | 'secondary';
}

export interface CTAConfig {
  primary: CTAButton;
  secondary?: CTAButton;
  hint: string;
}

interface AssessmentData {
  recommendation?: string;
  riskLevel?: string;
  hasRedFlags?: boolean;
  severity?: number;
  urgencyLevel?: string;
}

/**
 * Maps assessment data to triage level
 */
export function getTriageLevel(data: AssessmentData): TriageLevel {
  const { recommendation, riskLevel, hasRedFlags, severity = 5, urgencyLevel } = data;

  // Check urgency level first (from API response)
  if (urgencyLevel === 'emergency' || urgencyLevel === 'critical') {
    return 'emergency';
  }

  // Emergency: explicit emergency recommendation or high risk with red flags
  if (recommendation === 'emergency' || (hasRedFlags && severity >= 8)) {
    return 'emergency';
  }

  // Urgent: high risk level or video recommendation with high severity
  if (
    riskLevel === 'high' ||
    urgencyLevel === 'urgent' ||
    (recommendation === 'video' && severity >= 7)
  ) {
    return 'urgent';
  }

  // Soon: medium risk or video recommendation
  if (riskLevel === 'medium' || recommendation === 'video' || urgencyLevel === 'moderate') {
    return 'soon';
  }

  // Self-care: low risk or self-care recommendation
  return 'self_care';
}

/**
 * Returns CTA configuration based on triage level
 */
export function getCTAConfig(triageLevel: TriageLevel): CTAConfig {
  switch (triageLevel) {
    case 'emergency':
      return {
        primary: {
          id: 'emergency_call',
          label: 'Call emergency services',
          icon: 'call',
          action: 'emergency_call',
          variant: 'emergency',
        },
        secondary: {
          id: 'find_er',
          label: 'Find nearest ER',
          icon: 'navigate',
          action: 'find_er',
          variant: 'secondary',
        },
        hint: 'Do not delay seeking care',
      };

    case 'urgent':
      return {
        primary: {
          id: 'connect_doctor',
          label: 'Talk to a doctor today',
          icon: 'videocam',
          action: 'connect_doctor',
          variant: 'urgent',
        },
        secondary: {
          id: 'book_home_visit',
          label: 'Home visit',
          icon: 'home',
          action: 'book_home_visit',
          variant: 'secondary',
        },
        hint: 'Same-day consultations available',
      };

    case 'soon':
      return {
        primary: {
          id: 'schedule_teleconsult',
          label: 'Schedule teleconsult',
          icon: 'calendar',
          action: 'schedule_teleconsult',
          variant: 'primary',
        },
        secondary: {
          id: 'home_visit_options',
          label: 'Home visit',
          icon: 'home',
          action: 'home_visit_options',
          variant: 'secondary',
        },
        hint: 'Book at your convenience',
      };

    case 'self_care':
      return {
        primary: {
          id: 'set_reminder',
          label: 'Set check-in reminder',
          icon: 'notifications',
          action: 'set_reminder',
          variant: 'primary',
        },
        secondary: {
          id: 'home_remedies',
          label: 'Remedies',
          icon: 'list',
          action: 'home_remedies',
          variant: 'secondary',
        },
        hint: 'Monitor and follow up if needed',
      };
  }
}

/**
 * Get tertiary action (always available)
 */
export function getTertiaryAction(): CTAButton {
  return {
    id: 'save_share',
    label: 'Save / Share Summary',
    icon: 'share-social',
    action: 'save_share',
    variant: 'secondary',
  };
}

/**
 * Emergency note shown above action buttons
 */
export const EMERGENCY_NOTE = "If you feel in danger or symptoms are severe, get help now.";

/**
 * Get final message based on triage level
 */
export function getTriageMessage(triageLevel: TriageLevel): string {
  switch (triageLevel) {
    case 'emergency':
      return "Based on what you've shared, I recommend seeking immediate medical attention. Please take action now.";
    case 'urgent':
      return "I'd recommend speaking with a doctor today. Your symptoms warrant prompt attention.";
    case 'soon':
      return 'A consultation would be helpful. Consider scheduling one in the next day or two.';
    case 'self_care':
      return 'Your symptoms appear manageable with self-care. Monitor closely and reach out if things change.';
  }
}
