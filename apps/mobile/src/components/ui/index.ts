/**
 * UI Components Index
 * Export all reusable UI components
 */

// =============================================================================
// MEDICAL-GRADE UI COMPONENTS (NEW)
// =============================================================================

export {
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
} from './MedicalUI';

// =============================================================================
// CORE COMPONENTS
// =============================================================================

export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from './Button';
export { Input, type InputProps, type InputType } from './Input';
export { Card, CardHeader, CardBody, CardFooter, type CardProps, type CardVariant, type CardPadding } from './Card';
export { BottomSheet, type BottomSheetProps } from './BottomSheet';

// Feedback Components
export {
  EmptyState,
  NoResultsEmptyState,
  NoDataEmptyState,
  ErrorEmptyState,
  OfflineEmptyState,
  NoOrdersEmptyState,
  NoMessagesEmptyState,
  NoAppointmentsEmptyState,
  NoHealthRecordsEmptyState,
  NoFamilyMembersEmptyState,
  NoNotificationsEmptyState,
  NoServicesEmptyState,
  EmptyCartEmptyState,
  NoSavedAddressesEmptyState,
  NoPaymentMethodsEmptyState,
  NoHealthMemoryEmptyState,
  NoFollowUpsEmptyState,
  type EmptyStateProps,
  type EmptyStateSize,
} from './EmptyState';
export {
  OptimizedFlatList,
  OptimizedSectionList,
  MemoizedListItem,
  ListSeparator,
  ListSeparatorWithPadding,
  ListItemGap,
  type OptimizedFlatListProps,
  type OptimizedSectionListProps,
} from './OptimizedList';
export {
  LoadingSpinner,
  FullScreenLoading,
  Skeleton,
  SkeletonCard,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonList,
  SkeletonGrid,
  SkeletonHomeScreen,
  SkeletonProfileScreen,
  SkeletonDetailScreen,
  type LoadingSpinnerProps,
  type LoadingSize,
  type LoadingVariant,
} from './LoadingSpinner';

// Data Display Components
export { StatusBadge, DotBadge, DiscountBadge, PopularBadge } from './StatusBadge';
export { PriceText, PriceRow } from './PriceText';
export { StarRating } from './StarRating';
export { PressableCard, PressableGridItem, PressableScrollItem } from './PressableCard';
export { BadgeRow, Badge } from './BadgeRow';

// Form Components
export { HorizontalDatePicker } from './HorizontalDatePicker';
export { TimePicker } from './TimePicker';
export { QuantityStepper } from './QuantityStepper';
export { MemberPicker } from './MemberPicker';
export { RequestTextArea } from './RequestTextArea';
export {
  FileUpload,
  type FileUploadProps,
  type SelectedFile,
  type AcceptedFileType,
} from './FileUpload';
export { FormInput, type FormInputProps } from './FormInput';

// Service Components
export { CategorySection } from './CategorySection';
export { ServiceRowCard } from './ServiceRowCard';
export { PackageSelectorList } from './PackageSelectorList';
export { SubscriptionPlanCard } from './SubscriptionPlanCard';
export { StickyCheckoutBar } from './StickyCheckoutBar';

// Layout Components
export { Collapsible } from './collapsible';

// Feedback Components
export {
  ToastProvider,
  useToast,
  type ToastConfig,
  type ToastType,
  type ToastPosition,
} from './Toast';

// Screen State Components
export {
  ScreenState,
  HomeScreenState,
  ProfileScreenState,
  DetailScreenState,
  ListScreenState,
  CardScreenState,
  useScreenState,
  type ScreenStateProps,
  type ScreenStateStatus,
  type LoadingType,
  type SkeletonType,
  type UseScreenStateOptions,
} from './ScreenState';
export {
  RefreshableScrollView,
  RefreshableFlatList,
  useRefresh,
  type RefreshableScrollViewProps,
  type RefreshableFlatListProps,
  type UseRefreshReturn,
} from './RefreshableScrollView';
