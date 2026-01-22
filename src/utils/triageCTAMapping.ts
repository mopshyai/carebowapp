import { Phone, MapPin, Video, Calendar, Home, Bell, FileText, MessageSquare } from 'lucide-react';

export type TriageLevel = 'emergency' | 'urgent' | 'soon' | 'self_care';

export interface CTAConfig {
  primary: {
    label: string;
    icon: typeof Phone;
    action: string;
    variant: 'emergency' | 'urgent' | 'primary' | 'default';
  };
  secondary?: {
    label: string;
    icon: typeof Phone;
    action: string;
  };
  hint?: string;
}

/**
 * Maps assessment data to triage level
 */
export function getTriageLevel(assessmentData: {
  recommendation?: string;
  riskLevel?: string;
  hasRedFlags?: boolean;
  severity?: number;
}): TriageLevel {
  const { recommendation, riskLevel, hasRedFlags, severity = 5 } = assessmentData;

  // Emergency: explicit emergency recommendation or high risk with red flags
  if (recommendation === 'emergency' || (hasRedFlags && severity >= 8)) {
    return 'emergency';
  }

  // Urgent: high risk level or video recommendation with high severity
  if (riskLevel === 'high' || (recommendation === 'video' && severity >= 7)) {
    return 'urgent';
  }

  // Soon: medium risk or video recommendation
  if (riskLevel === 'medium' || recommendation === 'video') {
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
          label: 'Get urgent help now',
          icon: Phone,
          action: 'emergency_call',
          variant: 'emergency',
        },
        secondary: {
          label: 'Find nearest ER',
          icon: MapPin,
          action: 'find_er',
        },
        hint: 'Do not delay seeking care',
      };

    case 'urgent':
      return {
        primary: {
          label: 'Talk to a doctor today',
          icon: Video,
          action: 'connect_doctor',
          variant: 'urgent',
        },
        secondary: {
          label: 'Book home visit',
          icon: Home,
          action: 'book_home_visit',
        },
        hint: 'Same-day consultations available',
      };

    case 'soon':
      return {
        primary: {
          label: 'Schedule teleconsult',
          icon: Calendar,
          action: 'schedule_teleconsult',
          variant: 'primary',
        },
        secondary: {
          label: 'Home visit options',
          icon: Home,
          action: 'home_visit_options',
        },
        hint: 'Book at your convenience',
      };

    case 'self_care':
      return {
        primary: {
          label: 'Set check-in reminder',
          icon: Bell,
          action: 'set_reminder',
          variant: 'default',
        },
        secondary: {
          label: 'Home remedies checklist',
          icon: FileText,
          action: 'home_remedies',
        },
        hint: 'Monitor and follow up if needed',
      };
  }
}

/**
 * Returns tertiary action config (always available)
 */
export function getTertiaryAction() {
  return {
    label: 'Save / Share Summary',
    icon: MessageSquare,
    action: 'save_share',
  };
}
