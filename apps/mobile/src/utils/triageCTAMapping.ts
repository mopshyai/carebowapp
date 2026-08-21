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

export function getTriageLevel(data: AssessmentData): TriageLevel {
  const { recommendation, riskLevel, hasRedFlags, severity = 5, urgencyLevel } = data;

  if (urgencyLevel === 'emergency' || urgencyLevel === 'critical') return 'emergency';
  if (recommendation === 'emergency' || (hasRedFlags && severity >= 8)) return 'emergency';

  if (
    riskLevel === 'high' ||
    urgencyLevel === 'urgent' ||
    (recommendation === 'video' && severity >= 7)
  ) {
    return 'urgent';
  }

  if (riskLevel === 'medium' || recommendation === 'video' || urgencyLevel === 'moderate') {
    return 'soon';
  }

  return 'self_care';
}

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
          label: 'Find a doctor today',
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
        hint: 'Availability is confirmed during booking',
      };

    case 'soon':
      return {
        primary: {
          id: 'schedule_teleconsult',
          label: 'Find consultation options',
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
        hint: 'Choose a preferred time; CareBow confirms availability',
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

export function getTertiaryAction(): CTAButton {
  return {
    id: 'save_share',
    label: 'Save / Share Summary',
    icon: 'share-social',
    action: 'save_share',
    variant: 'secondary',
  };
}

export const EMERGENCY_NOTE = "If you feel in danger or symptoms are severe, get help now.";

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
