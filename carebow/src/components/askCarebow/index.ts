/**
 * Ask CareBow Components
 * Export all chat UI components
 */

// Core chat components
export { ChatBubble } from './ChatBubble';
export { ChatInput } from './ChatInput';
export { QuickOptionButtons } from './QuickOptionButtons';
export { EmergencyAlert } from './EmergencyAlert';
export { GuidanceCard } from './GuidanceCard';
export { ServiceRecommendationCard } from './ServiceRecommendationCard';
export { TypingIndicator } from './TypingIndicator';
export { SubscriptionGate } from './SubscriptionGate';
export { ActionButtons } from './ActionButtons';

// New enhanced components
export { ImageUploadBottomSheet } from './ImageUploadBottomSheet';
export type { ImageAttachment } from './ImageUploadBottomSheet';
export { ImageThumbnailRow } from './ImageThumbnailRow';
export { RedFlagWarning, detectRedFlags, getMatchedRedFlags, RED_FLAG_KEYWORDS } from './RedFlagWarning';
export { CollapsibleSection, UnderstandingSection, PossibilitiesSection, SeriousnessSection, SelfCareSection, RedFlagsSection } from './CollapsibleSection';
export { EnhancedChatBubble, DEFAULT_ACTION_BUTTONS } from './EnhancedChatBubble';
export type { EnhancedResponse } from './EnhancedChatBubble';
export { MemoryCandidateCard } from './MemoryCandidateCard';
export { TriageActionBar } from './TriageActionBar';
export { ComingSoonSheet } from './ComingSoonSheet';
export { FollowUpCheckIn } from './FollowUpCheckIn';
export { StillNeedCard } from './StillNeedCard';
export { FeedbackButtons } from './FeedbackButtons';
