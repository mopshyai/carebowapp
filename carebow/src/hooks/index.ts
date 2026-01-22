/**
 * Hooks Index
 * Export all custom hooks
 */

// Form management
export { useForm, type UseFormOptions, type UseFormReturn, type FormState } from './useForm';

// Analytics
export {
  useAnalytics,
  withClickTracking,
  initializeAnalytics,
  type UseAnalyticsReturn,
} from './useAnalytics';

// Theme hooks
export { useColorScheme } from './use-color-scheme';
export { useThemeColor } from './use-theme-color';

// Loading state management
export {
  useLoadingState,
  useFetch,
  useManualFetch,
  useMutation,
  combineLoadingStates,
  combineScreenStatus,
  type LoadingState,
  type LoadingStateResult,
  type UseLoadingStateOptions,
} from './useLoadingState';

// Biometric authentication
export {
  useBiometrics,
  type BiometryType,
  type BiometricState,
  type UseBiometricsReturn,
} from './useBiometrics';
