/**
 * Enhanced Chat Bubble Component
 * Chat bubble with collapsible sections and action buttons for assistant responses
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../../theme';
import {
  CollapsibleSection,
  UnderstandingSection,
  PossibilitiesSection,
  SeriousnessSection,
  SelfCareSection,
  RedFlagsSection,
} from './CollapsibleSection';
import type { Message, GuidanceResponse, UrgencyLevel } from '../../types/askCarebow';
import type { ImageAttachment } from './ImageUploadBottomSheet';

// ============================================
// TYPES
// ============================================

export type EnhancedResponse = {
  summary: string;  // Short initial answer
  understanding?: string;
  possibilities?: Array<{ name: string; uncertainty: 'LOW' | 'MED' | 'HIGH' }>;
  triageLevel?: 'emergency' | 'urgent' | 'soon' | 'self_care';
  triageDescription?: string;
  selfCareActions?: string[];
  redFlags?: string[];
  followUpQuestions?: string[];
};

type ActionButton = {
  id: string;
  label: string;
  icon: string;
  type: 'primary' | 'secondary' | 'outline';
  action: 'connect_doctor' | 'book_home_visit' | 'save_summary' | 'custom';
  customAction?: () => void;
};

type EnhancedChatBubbleProps = {
  message: Message;
  enhancedResponse?: EnhancedResponse;
  actionButtons?: ActionButton[];
  onAction?: (action: ActionButton['action'], buttonId: string) => void;
  showCollapsibleSections?: boolean;
  attachedImages?: ImageAttachment[];
};

// ============================================
// COMPONENT
// ============================================

export function EnhancedChatBubble({
  message,
  enhancedResponse,
  actionButtons = [],
  onAction,
  showCollapsibleSections = true,
  attachedImages,
}: EnhancedChatBubbleProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  // User message bubble
  if (isUser) {
    return (
      <View style={styles.userContainer}>
        {/* Attached images (if any) */}
        {attachedImages && attachedImages.length > 0 && (
          <View style={styles.userImagesRow}>
            {attachedImages.map((img) => (
              <Image
                key={img.id}
                source={{ uri: img.uri }}
                style={styles.userImage}
              />
            ))}
          </View>
        )}
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{message.text}</Text>
        </View>
      </View>
    );
  }

  // Assistant message bubble
  if (isAssistant) {
    const hasEnhancedContent = enhancedResponse && showCollapsibleSections;

    return (
      <View style={styles.assistantContainer}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Icon name="heart" size={14} color={colors.textInverse} />
          </View>
        </View>

        <View style={styles.assistantContent}>
          {/* Main message bubble */}
          <View style={styles.assistantBubble}>
            <Text style={styles.assistantText}>
              {enhancedResponse?.summary || message.text}
            </Text>
          </View>

          {/* Enhanced collapsible sections */}
          {hasEnhancedContent && (
            <View style={styles.collapsibleContainer}>
              {/* Understanding section */}
              {enhancedResponse.understanding && (
                <UnderstandingSection content={enhancedResponse.understanding} />
              )}

              {/* Possibilities section */}
              {enhancedResponse.possibilities && enhancedResponse.possibilities.length > 0 && (
                <PossibilitiesSection items={enhancedResponse.possibilities} />
              )}

              {/* Seriousness/Triage section */}
              {enhancedResponse.triageLevel && enhancedResponse.triageDescription && (
                <SeriousnessSection
                  level={enhancedResponse.triageLevel}
                  description={enhancedResponse.triageDescription}
                />
              )}

              {/* Self-care actions */}
              {enhancedResponse.selfCareActions && enhancedResponse.selfCareActions.length > 0 && (
                <SelfCareSection items={enhancedResponse.selfCareActions} />
              )}

              {/* Red flags */}
              {enhancedResponse.redFlags && enhancedResponse.redFlags.length > 0 && (
                <RedFlagsSection items={enhancedResponse.redFlags} />
              )}
            </View>
          )}

          {/* Action buttons */}
          {actionButtons.length > 0 && (
            <View style={styles.actionButtonsContainer}>
              {actionButtons.map((button) => (
                <TouchableOpacity
                  key={button.id}
                  style={[
                    styles.actionButton,
                    button.type === 'primary' && styles.actionButtonPrimary,
                    button.type === 'secondary' && styles.actionButtonSecondary,
                    button.type === 'outline' && styles.actionButtonOutline,
                  ]}
                  onPress={() => {
                    if (button.customAction) {
                      button.customAction();
                    } else {
                      onAction?.(button.action, button.id);
                    }
                  }}
                >
                  <Icon
                    name={button.icon}
                    size={16}
                    color={
                      button.type === 'primary'
                        ? colors.textInverse
                        : button.type === 'secondary'
                        ? colors.accent
                        : colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.actionButtonText,
                      button.type === 'primary' && styles.actionButtonTextPrimary,
                      button.type === 'secondary' && styles.actionButtonTextSecondary,
                    ]}
                  >
                    {button.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  }

  return null;
}

// ============================================
// DEFAULT ACTION BUTTONS
// ============================================

export const DEFAULT_ACTION_BUTTONS: ActionButton[] = [
  {
    id: 'connect_doctor',
    label: 'Connect to Doctor',
    icon: 'videocam',
    type: 'primary',
    action: 'connect_doctor',
  },
  {
    id: 'book_home',
    label: 'Book Home Visit',
    icon: 'home',
    type: 'secondary',
    action: 'book_home_visit',
  },
  {
    id: 'save',
    label: 'Save Summary',
    icon: 'bookmark-outline',
    type: 'outline',
    action: 'save_summary',
  },
];

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  // User message styles
  userContainer: {
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
  },
  userImagesRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  userImage: {
    width: 64,
    height: 64,
    borderRadius: radius.sm,
    backgroundColor: colors.surface2,
  },
  userBubble: {
    maxWidth: '80%',
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    borderBottomRightRadius: radius.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.subtle,
  },
  userText: {
    ...typography.body,
    color: colors.textInverse,
  },

  // Assistant message styles
  assistantContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  avatarContainer: {
    width: 28,
    alignItems: 'center',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.subtle,
  },
  assistantContent: {
    flex: 1,
    maxWidth: '90%',
  },
  assistantBubble: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderBottomLeftRadius: radius.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
  },
  assistantText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 22,
  },

  // Collapsible sections container
  collapsibleContainer: {
    marginTop: spacing.xs,
    gap: spacing.xxs,
  },

  // Action buttons
  actionButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  actionButtonPrimary: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
    ...shadows.button,
  },
  actionButtonSecondary: {
    backgroundColor: colors.accentMuted,
    borderColor: colors.accentSoft,
  },
  actionButtonOutline: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  actionButtonText: {
    ...typography.labelSmall,
    color: colors.textSecondary,
  },
  actionButtonTextPrimary: {
    color: colors.textInverse,
  },
  actionButtonTextSecondary: {
    color: colors.accent,
  },
});

export default EnhancedChatBubble;
