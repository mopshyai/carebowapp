/**
 * CareBow Medical-Grade UI Components
 *
 * GOLD STANDARD: Care Plans / Plan Comparison screen
 * Style: Calm, trustworthy, medical-grade, premium
 *
 * These components follow strict design rules:
 * - Consistent spacing and typography
 * - Subtle shadows, never heavy drop shadows
 * - One icon set (Lucide)
 * - No random emojis except optional greeting
 */

import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  colors,
  space,
  radius,
  typography,
  shadows,
  componentStyles,
  layout,
} from '@/theme/tokens';

// =============================================================================
// APP HEADER
// Back button + centered title, consistent height everywhere
// =============================================================================

interface AppHeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  showBorder?: boolean;
  style?: ViewStyle;
}

export function AppHeader({
  title,
  onBack,
  rightAction,
  showBorder = false,
  style,
}: AppHeaderProps) {
  return (
    <View style={[styles.header, showBorder && styles.headerBorder, style]}>
      <View style={styles.headerLeft}>
        {onBack && (
          <Pressable
            onPress={onBack}
            style={styles.headerBackButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Text style={styles.headerBackIcon}>←</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.headerRight}>
        {rightAction}
      </View>
    </View>
  );
}

// =============================================================================
// SCREEN CONTAINER
// Standard screen wrapper with consistent padding
// =============================================================================

interface ScreenContainerProps {
  children: React.ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  style?: ViewStyle;
  scrollable?: boolean;
}

export function ScreenContainer({
  children,
  edges = ['top'],
  style,
}: ScreenContainerProps) {
  return (
    <SafeAreaView style={[styles.screenContainer, style]} edges={edges}>
      {children}
    </SafeAreaView>
  );
}

// =============================================================================
// SECTION TITLE
// Title + optional "View all" action
// =============================================================================

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  action?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
}

export function SectionTitle({
  title,
  subtitle,
  action,
  onActionPress,
  style,
}: SectionTitleProps) {
  return (
    <View style={[styles.sectionTitleContainer, style]}>
      <View style={styles.sectionTitleLeft}>
        <Text style={styles.sectionTitleText}>{title}</Text>
        {subtitle && (
          <Text style={styles.sectionSubtitleText}>{subtitle}</Text>
        )}
      </View>
      {action && onActionPress && (
        <Pressable
          onPress={onActionPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
        >
          <Text style={styles.sectionActionText}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

// =============================================================================
// MEDICAL CARD
// Surface + padding + radius + subtle border/shadow
// =============================================================================

type MedicalCardVariant = 'default' | 'elevated' | 'outlined' | 'flat';

interface MedicalCardProps {
  children: React.ReactNode;
  variant?: MedicalCardVariant;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export function MedicalCard({
  children,
  variant = 'default',
  onPress,
  disabled = false,
  style,
  testID,
}: MedicalCardProps) {
  const cardStyle = getCardVariantStyle(variant);

  const content = (
    <View
      style={[styles.medicalCard, cardStyle, disabled && styles.disabled, style]}
      testID={testID}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [pressed && styles.cardPressed]}
        accessibilityRole="button"
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

function getCardVariantStyle(variant: MedicalCardVariant): ViewStyle {
  switch (variant) {
    case 'elevated':
      return {
        borderWidth: 0,
        ...shadows.card,
      };
    case 'outlined':
      return {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.border.default,
      };
    case 'flat':
      return {
        backgroundColor: colors.surfaceSecondary,
        borderWidth: 0,
      };
    default:
      return {
        borderWidth: 1,
        borderColor: colors.border.light,
        ...shadows.subtle,
      };
  }
}

// =============================================================================
// LIST ROW
// Icon + title + subtitle + chevron
// =============================================================================

interface ListRowProps {
  icon?: React.ReactNode;
  iconBackground?: string;
  title: string;
  subtitle?: string;
  value?: string;
  showChevron?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export function ListRow({
  icon,
  iconBackground = colors.primary.muted,
  title,
  subtitle,
  value,
  showChevron = true,
  onPress,
  disabled = false,
  style,
}: ListRowProps) {
  const content = (
    <View style={[styles.listRow, disabled && styles.disabled, style]}>
      {icon && (
        <View style={[styles.listRowIcon, { backgroundColor: iconBackground }]}>
          {icon}
        </View>
      )}

      <View style={styles.listRowContent}>
        <Text style={styles.listRowTitle} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.listRowSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      {value && (
        <Text style={styles.listRowValue}>{value}</Text>
      )}

      {showChevron && onPress && (
        <Text style={styles.listRowChevron}>›</Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [pressed && styles.rowPressed]}
        accessibilityRole="button"
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

// =============================================================================
// PRIMARY BUTTON
// Solid, high contrast, rounded
// =============================================================================

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function PrimaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  size = 'medium',
  fullWidth = false,
  style,
}: PrimaryButtonProps) {
  const sizeStyle = getButtonSizeStyle(size);
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.primaryButton,
        sizeStyle,
        fullWidth && styles.fullWidth,
        isDisabled && styles.buttonDisabled,
        pressed && !isDisabled && styles.buttonPressed,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      <Text
        style={[
          styles.primaryButtonText,
          size === 'small' && styles.buttonTextSmall,
          size === 'large' && styles.buttonTextLarge,
        ]}
      >
        {loading ? 'Loading...' : title}
      </Text>
    </Pressable>
  );
}

// =============================================================================
// SECONDARY BUTTON
// Outline/ghost style
// =============================================================================

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function SecondaryButton({
  title,
  onPress,
  disabled = false,
  size = 'medium',
  fullWidth = false,
  style,
}: SecondaryButtonProps) {
  const sizeStyle = getButtonSizeStyle(size);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.secondaryButton,
        sizeStyle,
        fullWidth && styles.fullWidth,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.secondaryButtonPressed,
        style,
      ]}
      accessibilityRole="button"
    >
      <Text
        style={[
          styles.secondaryButtonText,
          size === 'small' && styles.buttonTextSmall,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

function getButtonSizeStyle(size: 'small' | 'medium' | 'large'): ViewStyle {
  switch (size) {
    case 'small':
      return { height: 40, paddingHorizontal: space.md };
    case 'large':
      return { height: 56, paddingHorizontal: space.xl };
    default:
      return { height: 52, paddingHorizontal: space.lg };
  }
}

// =============================================================================
// COMPARISON TABLE ROW
// Clean grid, muted lines, check/x icons
// =============================================================================

interface ComparisonRowProps {
  label: string;
  values: (boolean | string)[];
  isHeader?: boolean;
  style?: ViewStyle;
}

export function ComparisonRow({
  label,
  values,
  isHeader = false,
  style,
}: ComparisonRowProps) {
  return (
    <View style={[styles.comparisonRow, isHeader && styles.comparisonHeaderRow, style]}>
      <View style={styles.comparisonLabel}>
        <Text
          style={[
            styles.comparisonLabelText,
            isHeader && styles.comparisonHeaderText,
          ]}
        >
          {label}
        </Text>
      </View>
      {values.map((value, index) => (
        <View key={index} style={styles.comparisonValue}>
          {typeof value === 'boolean' ? (
            <Text style={value ? styles.checkIcon : styles.xIcon}>
              {value ? '✓' : '✕'}
            </Text>
          ) : (
            <Text
              style={[
                styles.comparisonValueText,
                isHeader && styles.comparisonHeaderText,
              ]}
            >
              {value}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

// =============================================================================
// PRICE DISPLAY
// Medical-grade pricing display
// =============================================================================

interface PriceDisplayProps {
  price: string;
  originalPrice?: string;
  prefix?: string;
  suffix?: string;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export function PriceDisplay({
  price,
  originalPrice,
  prefix,
  suffix,
  size = 'medium',
  style,
}: PriceDisplayProps) {
  const priceStyle = getPriceSizeStyle(size);

  return (
    <View style={[styles.priceContainer, style]}>
      {prefix && <Text style={styles.pricePrefix}>{prefix}</Text>}
      <View style={styles.priceRow}>
        <Text style={[styles.priceText, priceStyle]}>{price}</Text>
        {originalPrice && (
          <Text style={styles.originalPrice}>{originalPrice}</Text>
        )}
      </View>
      {suffix && <Text style={styles.priceSuffix}>{suffix}</Text>}
    </View>
  );
}

function getPriceSizeStyle(size: 'small' | 'medium' | 'large'): TextStyle {
  switch (size) {
    case 'small':
      return { fontSize: 16, lineHeight: 22 };
    case 'large':
      return { fontSize: 24, lineHeight: 30 };
    default:
      return { fontSize: 20, lineHeight: 26 };
  }
}

// =============================================================================
// STATUS INDICATOR
// Clean status badges
// =============================================================================

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusIndicatorProps {
  label: string;
  status?: StatusType;
  showDot?: boolean;
  style?: ViewStyle;
}

export function StatusIndicator({
  label,
  status = 'neutral',
  showDot = true,
  style,
}: StatusIndicatorProps) {
  const statusColors = getStatusColors(status);

  return (
    <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }, style]}>
      {showDot && (
        <View style={[styles.statusDot, { backgroundColor: statusColors.dot }]} />
      )}
      <Text style={[styles.statusText, { color: statusColors.text }]}>
        {label}
      </Text>
    </View>
  );
}

function getStatusColors(status: StatusType) {
  switch (status) {
    case 'success':
      return { bg: colors.success.muted, dot: colors.success.default, text: colors.success.default };
    case 'warning':
      return { bg: colors.warning.muted, dot: colors.warning.default, text: colors.warning.default };
    case 'error':
      return { bg: colors.error.muted, dot: colors.error.default, text: colors.error.default };
    case 'info':
      return { bg: colors.info.muted, dot: colors.info.default, text: colors.info.default };
    default:
      return { bg: colors.secondary.default, dot: colors.text.tertiary, text: colors.text.secondary };
  }
}

// =============================================================================
// DIVIDER
// =============================================================================

interface DividerProps {
  style?: ViewStyle;
}

export function Divider({ style }: DividerProps) {
  return <View style={[styles.divider, style]} />;
}

// =============================================================================
// EMPTY STATE
// Clean empty state display
// =============================================================================

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onPress: () => void;
  };
  style?: ViewStyle;
}

export function MedicalEmptyState({
  title,
  description,
  icon,
  action,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.emptyState, style]}>
      {icon && <View style={styles.emptyStateIcon}>{icon}</View>}
      <Text style={styles.emptyStateTitle}>{title}</Text>
      {description && (
        <Text style={styles.emptyStateDescription}>{description}</Text>
      )}
      {action && (
        <PrimaryButton
          title={action.label}
          onPress={action.onPress}
          size="small"
          style={styles.emptyStateButton}
        />
      )}
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: layout.screenPaddingHorizontal,
    backgroundColor: colors.surface,
  },
  headerBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerLeft: {
    width: 44,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 44,
    alignItems: 'flex-end',
  },
  headerBackButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBackIcon: {
    fontSize: 24,
    color: colors.text.primary,
  },
  headerTitle: {
    ...typography.sectionHeader,
    textAlign: 'center',
  },

  // Screen Container
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Section Title
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: layout.screenPaddingHorizontal,
    marginBottom: space.md,
  },
  sectionTitleLeft: {
    flex: 1,
  },
  sectionTitleText: {
    ...typography.sectionHeader,
  },
  sectionSubtitleText: {
    ...typography.caption,
    marginTop: space.xxs,
  },
  sectionActionText: {
    ...typography.label,
    color: colors.primary.default,
  },

  // Medical Card
  medicalCard: {
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    padding: layout.cardPadding,
  },
  cardPressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.5,
  },

  // List Row
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space.sm,
    paddingHorizontal: layout.screenPaddingHorizontal,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  listRowIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: space.sm,
  },
  listRowContent: {
    flex: 1,
  },
  listRowTitle: {
    ...typography.body,
    color: colors.text.primary,
  },
  listRowSubtitle: {
    ...typography.captionSmall,
    marginTop: space.xxs,
  },
  listRowValue: {
    ...typography.label,
    color: colors.text.secondary,
    marginRight: space.xs,
  },
  listRowChevron: {
    fontSize: 20,
    color: colors.text.tertiary,
  },
  rowPressed: {
    backgroundColor: colors.surfaceSecondary,
  },

  // Buttons
  primaryButton: {
    backgroundColor: colors.primary.default,
    borderRadius: layout.buttonRadius,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.primaryButton,
  },
  primaryButtonText: {
    ...typography.buttonMedium,
    color: colors.text.inverse,
  },
  buttonTextSmall: {
    ...typography.buttonSmall,
  },
  buttonTextLarge: {
    ...typography.buttonLarge,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderRadius: layout.buttonRadius,
    borderWidth: 1,
    borderColor: colors.border.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...typography.buttonMedium,
    color: colors.text.primary,
  },
  secondaryButtonPressed: {
    backgroundColor: colors.surfaceSecondary,
  },
  buttonDisabled: {
    backgroundColor: colors.disabled,
    ...shadows.none,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  fullWidth: {
    width: '100%',
  },

  // Comparison Table
  comparisonRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    paddingVertical: space.sm,
  },
  comparisonHeaderRow: {
    backgroundColor: colors.surfaceSecondary,
    borderBottomColor: colors.border.default,
  },
  comparisonLabel: {
    flex: 2,
    paddingHorizontal: space.md,
  },
  comparisonValue: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comparisonLabelText: {
    ...typography.bodySmall,
  },
  comparisonValueText: {
    ...typography.label,
    textAlign: 'center',
  },
  comparisonHeaderText: {
    ...typography.labelSmall,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  checkIcon: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success.default,
  },
  xIcon: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.tertiary,
  },

  // Price Display
  priceContainer: {
    alignItems: 'flex-start',
  },
  pricePrefix: {
    ...typography.captionSmall,
    marginBottom: space.xxs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    ...typography.priceLarge,
  },
  originalPrice: {
    ...typography.bodySmall,
    textDecorationLine: 'line-through',
    color: colors.text.tertiary,
    marginLeft: space.xs,
  },
  priceSuffix: {
    ...typography.priceUnit,
    marginTop: space.xxs,
  },

  // Status Badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.xs,
    paddingVertical: space.xxs,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: space.xxs,
  },
  statusText: {
    ...typography.badge,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: space.xxxl,
    paddingHorizontal: space.xl,
  },
  emptyStateIcon: {
    marginBottom: space.md,
  },
  emptyStateTitle: {
    ...typography.sectionHeader,
    textAlign: 'center',
    marginBottom: space.xs,
  },
  emptyStateDescription: {
    ...typography.bodySmall,
    textAlign: 'center',
    color: colors.text.secondary,
    marginBottom: space.lg,
  },
  emptyStateButton: {
    marginTop: space.sm,
  },
});

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  AppHeader,
  ScreenContainer,
  SectionTitle,
  MedicalCard,
  ListRow,
  PrimaryButton,
  SecondaryButton,
  ComparisonRow,
  PriceDisplay,
  StatusIndicator,
  Divider,
  MedicalEmptyState,
};
