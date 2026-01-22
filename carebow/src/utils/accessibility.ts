/**
 * Accessibility Utilities
 * Helper functions and components for better accessibility
 */

import { AccessibilityInfo, Platform } from 'react-native';
import { useEffect, useState, useCallback } from 'react';

// ============================================
// TYPES
// ============================================

export interface AccessibilityProps {
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
  accessibilityValue?: AccessibilityValue;
  accessibilityActions?: AccessibilityAction[];
  onAccessibilityAction?: (event: AccessibilityActionEvent) => void;
  accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';
  importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
}

export type AccessibilityRole =
  | 'none'
  | 'button'
  | 'link'
  | 'search'
  | 'image'
  | 'keyboardkey'
  | 'text'
  | 'adjustable'
  | 'imagebutton'
  | 'header'
  | 'summary'
  | 'alert'
  | 'checkbox'
  | 'combobox'
  | 'menu'
  | 'menubar'
  | 'menuitem'
  | 'progressbar'
  | 'radio'
  | 'radiogroup'
  | 'scrollbar'
  | 'spinbutton'
  | 'switch'
  | 'tab'
  | 'tablist'
  | 'timer'
  | 'toolbar';

export interface AccessibilityState {
  disabled?: boolean;
  selected?: boolean;
  checked?: boolean | 'mixed';
  busy?: boolean;
  expanded?: boolean;
}

export interface AccessibilityValue {
  min?: number;
  max?: number;
  now?: number;
  text?: string;
}

export interface AccessibilityAction {
  name: string;
  label?: string;
}

export interface AccessibilityActionEvent {
  nativeEvent: {
    actionName: string;
  };
}

// ============================================
// HOOKS
// ============================================

/**
 * Hook to detect if screen reader is enabled
 */
export function useScreenReader(): boolean {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);

  useEffect(() => {
    const checkScreenReader = async () => {
      const enabled = await AccessibilityInfo.isScreenReaderEnabled();
      setIsScreenReaderEnabled(enabled);
    };

    checkScreenReader();

    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsScreenReaderEnabled
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return isScreenReaderEnabled;
}

/**
 * Hook to detect if reduce motion is enabled
 */
export function useReduceMotion(): boolean {
  const [isReduceMotionEnabled, setIsReduceMotionEnabled] = useState(false);

  useEffect(() => {
    const checkReduceMotion = async () => {
      const enabled = await AccessibilityInfo.isReduceMotionEnabled();
      setIsReduceMotionEnabled(enabled);
    };

    checkReduceMotion();

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setIsReduceMotionEnabled
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return isReduceMotionEnabled;
}

/**
 * Hook to detect if bold text is enabled
 */
export function useBoldText(): boolean {
  const [isBoldTextEnabled, setIsBoldTextEnabled] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'ios') {
      return;
    }

    const checkBoldText = async () => {
      const enabled = await AccessibilityInfo.isBoldTextEnabled();
      setIsBoldTextEnabled(enabled);
    };

    checkBoldText();

    const subscription = AccessibilityInfo.addEventListener(
      'boldTextChanged',
      setIsBoldTextEnabled
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return isBoldTextEnabled;
}

/**
 * Hook for accessibility preferences
 */
export function useAccessibilityPreferences() {
  const isScreenReaderEnabled = useScreenReader();
  const isReduceMotionEnabled = useReduceMotion();
  const isBoldTextEnabled = useBoldText();

  return {
    isScreenReaderEnabled,
    isReduceMotionEnabled,
    isBoldTextEnabled,
  };
}

// ============================================
// ANNOUNCEMENT FUNCTIONS
// ============================================

/**
 * Announce a message to screen readers
 */
export function announce(message: string): void {
  AccessibilityInfo.announceForAccessibility(message);
}

/**
 * Announce a message for screen readers (alias)
 */
export function announceForAccessibility(message: string): void {
  AccessibilityInfo.announceForAccessibility(message);
}

/**
 * Set accessibility focus to an element
 * Note: Requires a native view ref
 */
export function setAccessibilityFocus(reactTag: number): void {
  AccessibilityInfo.setAccessibilityFocus(reactTag);
}

// ============================================
// LABEL GENERATORS
// ============================================

/**
 * Generate accessibility label for a button
 */
export function buttonLabel(text: string, disabled?: boolean): string {
  return disabled ? `${text}, disabled` : text;
}

/**
 * Generate accessibility label for a toggle/switch
 */
export function toggleLabel(label: string, isOn: boolean): string {
  return `${label}, ${isOn ? 'on' : 'off'}`;
}

/**
 * Generate accessibility label for a count badge
 */
export function countLabel(label: string, count: number): string {
  return `${label}: ${count} ${count === 1 ? 'item' : 'items'}`;
}

/**
 * Generate accessibility label for a price
 */
export function priceLabel(amount: number, currency: string = 'INR'): string {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
  });
  return formatter.format(amount);
}

/**
 * Generate accessibility label for a rating
 */
export function ratingLabel(rating: number, maxRating: number = 5): string {
  return `${rating} out of ${maxRating} stars`;
}

/**
 * Generate accessibility label for a date
 */
export function dateLabel(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Generate accessibility label for a time
 */
export function timeLabel(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Generate accessibility label for a percentage
 */
export function percentageLabel(value: number, context?: string): string {
  const percent = Math.round(value * 100);
  return context ? `${context}: ${percent} percent` : `${percent} percent`;
}

/**
 * Generate accessibility hint for a list item
 */
export function listItemHint(
  index: number,
  total: number,
  action?: string
): string {
  let hint = `Item ${index + 1} of ${total}`;
  if (action) {
    hint += `. ${action}`;
  }
  return hint;
}

// ============================================
// ACCESSIBILITY PROPS BUILDERS
// ============================================

/**
 * Build accessibility props for a button
 */
export function buildButtonA11yProps(
  label: string,
  hint?: string,
  disabled?: boolean
): AccessibilityProps {
  return {
    accessible: true,
    accessibilityLabel: buttonLabel(label, disabled),
    accessibilityHint: hint,
    accessibilityRole: 'button',
    accessibilityState: { disabled },
  };
}

/**
 * Build accessibility props for a link
 */
export function buildLinkA11yProps(label: string, hint?: string): AccessibilityProps {
  return {
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint || 'Opens link',
    accessibilityRole: 'link',
  };
}

/**
 * Build accessibility props for a checkbox
 */
export function buildCheckboxA11yProps(
  label: string,
  checked: boolean,
  hint?: string
): AccessibilityProps {
  return {
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint || 'Double tap to toggle',
    accessibilityRole: 'checkbox',
    accessibilityState: { checked },
  };
}

/**
 * Build accessibility props for a switch/toggle
 */
export function buildSwitchA11yProps(
  label: string,
  isOn: boolean,
  hint?: string
): AccessibilityProps {
  return {
    accessible: true,
    accessibilityLabel: toggleLabel(label, isOn),
    accessibilityHint: hint || 'Double tap to toggle',
    accessibilityRole: 'switch',
    accessibilityState: { checked: isOn },
  };
}

/**
 * Build accessibility props for a header
 */
export function buildHeaderA11yProps(level: 1 | 2 | 3 | 4 | 5 | 6 = 1): AccessibilityProps {
  return {
    accessible: true,
    accessibilityRole: 'header',
  };
}

/**
 * Build accessibility props for an image
 */
export function buildImageA11yProps(
  description: string,
  isDecorative: boolean = false
): AccessibilityProps {
  if (isDecorative) {
    return {
      accessible: false,
      importantForAccessibility: 'no',
    };
  }
  return {
    accessible: true,
    accessibilityLabel: description,
    accessibilityRole: 'image',
  };
}

/**
 * Build accessibility props for a progress indicator
 */
export function buildProgressA11yProps(
  label: string,
  progress: number,
  min: number = 0,
  max: number = 100
): AccessibilityProps {
  return {
    accessible: true,
    accessibilityLabel: `${label}: ${Math.round(progress)} percent`,
    accessibilityRole: 'progressbar',
    accessibilityValue: {
      min,
      max,
      now: progress,
      text: `${Math.round(progress)}%`,
    },
  };
}

/**
 * Build accessibility props for a tab
 */
export function buildTabA11yProps(
  label: string,
  selected: boolean,
  index: number,
  total: number
): AccessibilityProps {
  return {
    accessible: true,
    accessibilityLabel: `${label}, tab ${index + 1} of ${total}`,
    accessibilityRole: 'tab',
    accessibilityState: { selected },
  };
}

// ============================================
// FOCUS MANAGEMENT
// ============================================

/**
 * Hook for managing accessibility focus
 */
export function useAccessibilityFocus() {
  const setFocus = useCallback((ref: { current: { _nativeTag?: number } | null }) => {
    if (ref.current?._nativeTag) {
      setAccessibilityFocus(ref.current._nativeTag);
    }
  }, []);

  return { setFocus };
}

export default {
  useScreenReader,
  useReduceMotion,
  useBoldText,
  useAccessibilityPreferences,
  useAccessibilityFocus,
  announce,
  announceForAccessibility,
  setAccessibilityFocus,
  buttonLabel,
  toggleLabel,
  countLabel,
  priceLabel,
  ratingLabel,
  dateLabel,
  timeLabel,
  percentageLabel,
  listItemHint,
  buildButtonA11yProps,
  buildLinkA11yProps,
  buildCheckboxA11yProps,
  buildSwitchA11yProps,
  buildHeaderA11yProps,
  buildImageA11yProps,
  buildProgressA11yProps,
  buildTabA11yProps,
};
