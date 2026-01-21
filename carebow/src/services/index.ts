/**
 * Services Index
 * Central export for all application services
 */

// API Service
export { ApiClient, api, authApi, servicesApi, ordersApi } from './api';
export { ApiError } from './api';
export type {
  ApiResponse,
  ApiErrorCode,
  AuthTokens,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  OrderResponse,
  ServiceDetails,
  ServiceListItem,
} from './api';

// Notification Service
export { NotificationService, initializeNotifications } from './notifications';
export type {
  NotificationChannel,
  NotificationPriority,
  NotificationContent,
  NotificationTrigger,
  ScheduledNotification,
  NotificationPermissionStatus,
} from './notifications';
export {
  scheduleCheckInReminder,
  cancelCheckInReminder,
  scheduleAppointmentReminder,
  cancelAppointmentReminder,
  scheduleMedicationReminder,
  cancelMedicationReminder,
  scheduleFollowUpReminder,
  cancelFollowUpReminder,
  sendSOSConfirmation,
  sendMissedCheckInAlert,
} from './notifications';

// Payment Service
export { PaymentService } from './payments';
export type {
  PaymentMethodType,
  SavedCard,
  PaymentMethod,
  PaymentRequest,
  PaymentResponse,
  PaymentStatus,
  RefundRequest,
  RefundResponse,
  Subscription,
  SubscriptionInterval,
} from './payments';
export {
  PaymentError,
  formatAmount,
  toSmallestUnit,
  getCardBrandIcon,
  maskCardNumber,
  isCardExpired,
} from './payments';

// Storage Services
export { SecureStorage } from './storage';

// Monitoring Services
export {
  SentryService,
  initializeSentry,
  captureError,
  captureMessage,
  addBreadcrumb,
  setSentryUser,
  clearSentryContext,
} from './monitoring';
export type { UserContext, ErrorContext, SeverityLevel } from './monitoring';

// Security Services
export {
  EncryptionService,
  initializeEncryption,
  clearEncryption,
  encrypt,
  decrypt,
  hashPassword,
  verifyPassword,
} from './security';
export type { EncryptionResult, DecryptionInput, HashResult } from './security';
