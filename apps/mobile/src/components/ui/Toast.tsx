/**
 * Toast Notification System
 * In-app toast notifications for user feedback
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  ReactNode,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
  AccessibilityInfo,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing, radius, shadows } from '../../theme';

// ============================================
// TYPES
// ============================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top' | 'bottom';

export interface ToastConfig {
  /** Toast message */
  message: string;
  /** Toast type */
  type?: ToastType;
  /** Duration in milliseconds (0 for persistent) */
  duration?: number;
  /** Position */
  position?: ToastPosition;
  /** Action button label */
  actionLabel?: string;
  /** Action button callback */
  onAction?: () => void;
  /** Custom icon name */
  icon?: string;
  /** Dismiss callback */
  onDismiss?: () => void;
}

interface ToastState extends ToastConfig {
  id: string;
  visible: boolean;
}

interface ToastContextType {
  showToast: (config: ToastConfig) => string;
  hideToast: (id?: string) => void;
  success: (message: string, options?: Partial<ToastConfig>) => string;
  error: (message: string, options?: Partial<ToastConfig>) => string;
  warning: (message: string, options?: Partial<ToastConfig>) => string;
  info: (message: string, options?: Partial<ToastConfig>) => string;
}

// ============================================
// CONSTANTS
// ============================================

const DEFAULT_DURATION = 3000;
const ANIMATION_DURATION = 300;

const TOAST_ICONS: Record<ToastType, string> = {
  success: 'checkmark-circle',
  error: 'alert-circle',
  warning: 'warning',
  info: 'information-circle',
};

const TOAST_COLORS: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: {
    bg: colors.successSoft || '#F0FDF4',
    border: colors.success,
    icon: colors.success,
  },
  error: {
    bg: colors.errorSoft || '#FEF2F2',
    border: colors.error,
    icon: colors.error,
  },
  warning: {
    bg: colors.warningSoft || '#FFFBEB',
    border: colors.warning,
    icon: colors.warning,
  },
  info: {
    bg: colors.infoSoft || '#EFF6FF',
    border: colors.info || colors.accent,
    icon: colors.info || colors.accent,
  },
};

// ============================================
// CONTEXT
// ============================================

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

interface ToastProviderProps {
  children: ReactNode;
  /** Default position */
  defaultPosition?: ToastPosition;
  /** Max visible toasts */
  maxToasts?: number;
}

export function ToastProvider({
  children,
  defaultPosition = 'top',
  maxToasts = 3,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const insets = useSafeAreaInsets();
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  const generateId = () => `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const showToast = useCallback(
    (config: ToastConfig): string => {
      const id = generateId();
      const toast: ToastState = {
        id,
        message: config.message,
        type: config.type || 'info',
        duration: config.duration ?? DEFAULT_DURATION,
        position: config.position || defaultPosition,
        actionLabel: config.actionLabel,
        onAction: config.onAction,
        icon: config.icon,
        onDismiss: config.onDismiss,
        visible: true,
      };

      // Add toast, respecting max limit
      setToasts((prev) => {
        const newToasts = [...prev, toast];
        if (newToasts.length > maxToasts) {
          // Remove oldest toasts
          const removed = newToasts.slice(0, newToasts.length - maxToasts);
          removed.forEach((t) => {
            const timeout = timeoutRefs.current.get(t.id);
            if (timeout) {
              clearTimeout(timeout);
              timeoutRefs.current.delete(t.id);
            }
          });
          return newToasts.slice(-maxToasts);
        }
        return newToasts;
      });

      // Announce to screen readers
      AccessibilityInfo.announceForAccessibility(`${toast.type}: ${toast.message}`);

      // Auto-dismiss
      if (toast.duration > 0) {
        const timeout = setTimeout(() => {
          hideToast(id);
        }, toast.duration);
        timeoutRefs.current.set(id, timeout);
      }

      return id;
    },
    [defaultPosition, maxToasts]
  );

  const hideToast = useCallback((id?: string) => {
    if (id) {
      // Hide specific toast
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, visible: false } : t))
      );
      // Clear timeout
      const timeout = timeoutRefs.current.get(id);
      if (timeout) {
        clearTimeout(timeout);
        timeoutRefs.current.delete(id);
      }
      // Remove after animation
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, ANIMATION_DURATION);
    } else {
      // Hide all toasts
      setToasts((prev) => prev.map((t) => ({ ...t, visible: false })));
      timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
      timeoutRefs.current.clear();
      setTimeout(() => {
        setToasts([]);
      }, ANIMATION_DURATION);
    }
  }, []);

  // Convenience methods
  const success = useCallback(
    (message: string, options?: Partial<ToastConfig>) =>
      showToast({ message, type: 'success', ...options }),
    [showToast]
  );

  const error = useCallback(
    (message: string, options?: Partial<ToastConfig>) =>
      showToast({ message, type: 'error', ...options }),
    [showToast]
  );

  const warning = useCallback(
    (message: string, options?: Partial<ToastConfig>) =>
      showToast({ message, type: 'warning', ...options }),
    [showToast]
  );

  const info = useCallback(
    (message: string, options?: Partial<ToastConfig>) =>
      showToast({ message, type: 'info', ...options }),
    [showToast]
  );

  const contextValue: ToastContextType = {
    showToast,
    hideToast,
    success,
    error,
    warning,
    info,
  };

  // Separate toasts by position
  const topToasts = toasts.filter((t) => t.position === 'top');
  const bottomToasts = toasts.filter((t) => t.position === 'bottom');

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Top Toasts */}
      {topToasts.length > 0 && (
        <View
          style={[
            styles.container,
            styles.containerTop,
            { top: insets.top + spacing.md },
          ]}
          pointerEvents="box-none"
        >
          {topToasts.map((toast, index) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              index={index}
              position="top"
              onDismiss={() => {
                hideToast(toast.id);
                toast.onDismiss?.();
              }}
            />
          ))}
        </View>
      )}

      {/* Bottom Toasts */}
      {bottomToasts.length > 0 && (
        <View
          style={[
            styles.container,
            styles.containerBottom,
            { bottom: insets.bottom + spacing.md },
          ]}
          pointerEvents="box-none"
        >
          {bottomToasts.map((toast, index) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              index={index}
              position="bottom"
              onDismiss={() => {
                hideToast(toast.id);
                toast.onDismiss?.();
              }}
            />
          ))}
        </View>
      )}
    </ToastContext.Provider>
  );
}

// ============================================
// TOAST ITEM
// ============================================

interface ToastItemProps {
  toast: ToastState;
  index: number;
  position: ToastPosition;
  onDismiss: () => void;
}

function ToastItem({ toast, index, position, onDismiss }: ToastItemProps) {
  const translateY = useRef(new Animated.Value(position === 'top' ? -100 : 100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (toast.visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: position === 'top' ? -100 : 100,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [toast.visible, translateY, opacity, position]);

  const toastColors = TOAST_COLORS[toast.type || 'info'];
  const iconName = toast.icon || TOAST_ICONS[toast.type || 'info'];

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: toastColors.bg,
          borderLeftColor: toastColors.border,
          transform: [{ translateY }],
          opacity,
          marginBottom: index > 0 ? spacing.xs : 0,
        },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      {/* Icon */}
      <View style={styles.iconContainer}>
        <Icon name={iconName} size={22} color={toastColors.icon} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.message} numberOfLines={3}>
          {toast.message}
        </Text>

        {/* Action Button */}
        {toast.actionLabel && toast.onAction && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              toast.onAction?.();
              onDismiss();
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.actionText, { color: toastColors.icon }]}>
              {toast.actionLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Dismiss Button */}
      <TouchableOpacity
        style={styles.dismissButton}
        onPress={onDismiss}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel="Dismiss notification"
        accessibilityRole="button"
      >
        <Icon name="close" size={18} color={colors.textTertiary} />
      </TouchableOpacity>
    </Animated.View>
  );
}

// ============================================
// HOOK
// ============================================

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    zIndex: 9999,
  },
  containerTop: {
    alignItems: 'stretch',
  },
  containerBottom: {
    alignItems: 'stretch',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    backgroundColor: colors.surface,
    ...shadows.card,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  content: {
    flex: 1,
  },
  message: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  actionButton: {
    marginTop: spacing.xxs,
  },
  actionText: {
    ...typography.label,
    fontSize: 13,
  },
  dismissButton: {
    marginLeft: spacing.sm,
    padding: spacing.xxs,
  },
});

export default ToastProvider;
