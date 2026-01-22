/**
 * BottomSheet Component
 * Modal that slides up from the bottom
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { colors, typography, spacing, radius, shadows } from '@/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================
// TYPES
// ============================================

export interface BottomSheetProps {
  /** Visibility state */
  visible: boolean;
  /** Close handler */
  onClose: () => void;
  /** Sheet title */
  title?: string;
  /** Sheet content */
  children: React.ReactNode;
  /** Show close button */
  showCloseButton?: boolean;
  /** Show drag handle */
  showHandle?: boolean;
  /** Close on backdrop press */
  closeOnBackdrop?: boolean;
  /** Snap height as percentage (0.3 to 0.9) */
  snapHeight?: number;
  /** Keyboard avoiding behavior */
  avoidKeyboard?: boolean;
  /** Make content scrollable */
  scrollable?: boolean;
}

// ============================================
// COMPONENT
// ============================================

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  showHandle = true,
  closeOnBackdrop = true,
  snapHeight = 0.5,
  avoidKeyboard = true,
  scrollable = false,
}: BottomSheetProps) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const sheetHeight = SCREEN_HEIGHT * Math.min(Math.max(snapHeight, 0.3), 0.9);

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  const handleBackdropPress = () => {
    if (closeOnBackdrop) {
      onClose();
    }
  };

  const renderContent = () => {
    const content = (
      <>
        {/* Handle */}
        {showHandle && (
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>
        )}

        {/* Header */}
        {(title || showCloseButton) && (
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            {showCloseButton && (
              <Pressable
                style={styles.closeButton}
                onPress={onClose}
                hitSlop={12}
              >
                <Icon name="x" size={24} color={colors.textPrimary} />
              </Pressable>
            )}
          </View>
        )}

        {/* Content */}
        {scrollable ? (
          <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={styles.content}>{children}</View>
        )}
      </>
    );

    if (avoidKeyboard && Platform.OS === 'ios') {
      return (
        <KeyboardAvoidingView behavior="padding" style={styles.keyboardView}>
          {content}
        </KeyboardAvoidingView>
      );
    }

    return content;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.5],
              }),
            },
          ]}
        >
          <Pressable style={styles.backdropPressable} onPress={handleBackdropPress} />
        </Animated.View>

        {/* Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            {
              maxHeight: sheetHeight,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <SafeAreaView edges={['bottom']} style={styles.safeArea}>
            {renderContent()}
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.black,
  },
  backdropPressable: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    ...shadows.cardElevated,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -spacing.xs,
  },
  content: {
    padding: spacing.lg,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});

export default BottomSheet;
