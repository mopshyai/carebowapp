/**
 * Jest Setup File
 * Global test configuration and mocks
 */

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  Swipeable: 'Swipeable',
  DrawerLayout: 'DrawerLayout',
  State: {},
  ScrollView: 'ScrollView',
  Slider: 'Slider',
  Switch: 'Switch',
  TextInput: 'TextInput',
  ToolbarAndroid: 'ToolbarAndroid',
  ViewPagerAndroid: 'ViewPagerAndroid',
  DrawerLayoutAndroid: 'DrawerLayoutAndroid',
  WebView: 'WebView',
  NativeViewGestureHandler: 'NativeViewGestureHandler',
  TapGestureHandler: 'TapGestureHandler',
  FlingGestureHandler: 'FlingGestureHandler',
  ForceTouchGestureHandler: 'ForceTouchGestureHandler',
  LongPressGestureHandler: 'LongPressGestureHandler',
  PanGestureHandler: 'PanGestureHandler',
  PinchGestureHandler: 'PinchGestureHandler',
  RotationGestureHandler: 'RotationGestureHandler',
  RawButton: 'RawButton',
  BaseButton: 'BaseButton',
  RectButton: 'RectButton',
  BorderlessButton: 'BorderlessButton',
  TouchableHighlight: 'TouchableHighlight',
  TouchableNativeFeedback: 'TouchableNativeFeedback',
  TouchableOpacity: 'TouchableOpacity',
  TouchableWithoutFeedback: 'TouchableWithoutFeedback',
  Directions: {},
  GestureHandlerRootView: ({ children }) => children,
}));

// @env is mocked via moduleNameMapper in jest.config.js

// Mock react-native-haptic-feedback
jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
  HapticFeedbackTypes: {
    selection: 'selection',
    impactLight: 'impactLight',
    impactMedium: 'impactMedium',
    impactHeavy: 'impactHeavy',
    notificationSuccess: 'notificationSuccess',
    notificationWarning: 'notificationWarning',
    notificationError: 'notificationError',
  },
}));

// Mock react-native-image-picker
jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
}));

// Mock @react-native-community/geolocation
jest.mock('@react-native-community/geolocation', () => ({
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
  setRNConfiguration: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Feather', () => 'FeatherIcon');
jest.mock('react-native-vector-icons/Ionicons', () => 'IonIcon');

// Mock react-native-fast-image
jest.mock('react-native-fast-image', () => ({
  default: 'FastImage',
  priority: {
    low: 'low',
    normal: 'normal',
    high: 'high',
  },
  resizeMode: {
    contain: 'contain',
    cover: 'cover',
    stretch: 'stretch',
    center: 'center',
  },
  cacheControl: {
    immutable: 'immutable',
    web: 'web',
    cacheOnly: 'cacheOnly',
  },
  preload: jest.fn().mockResolvedValue(undefined),
  clearMemoryCache: jest.fn().mockResolvedValue(undefined),
  clearDiskCache: jest.fn().mockResolvedValue(undefined),
}));

// Mock react-native-document-picker
jest.mock('react-native-document-picker', () => ({
  pick: jest.fn(),
  pickDirectory: jest.fn(),
  pickMultiple: jest.fn(),
  types: {
    images: 'public.image',
    pdf: 'com.adobe.pdf',
    allFiles: '*/*',
  },
  isCancel: jest.fn().mockReturnValue(false),
}));

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn().mockResolvedValue({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  }),
  addEventListener: jest.fn().mockReturnValue(jest.fn()),
}));

// Mock @react-native-clipboard/clipboard
jest.mock('@react-native-clipboard/clipboard', () => ({
  setString: jest.fn(),
  getString: jest.fn().mockResolvedValue(''),
}));

// Mock react-native-keychain
jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn().mockResolvedValue(true),
  getGenericPassword: jest.fn().mockResolvedValue({ username: 'test', password: 'token' }),
  resetGenericPassword: jest.fn().mockResolvedValue(true),
  getSupportedBiometryType: jest.fn().mockResolvedValue('FaceID'),
  ACCESSIBLE: {
    WHEN_UNLOCKED: 'WHEN_UNLOCKED',
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
    AFTER_FIRST_UNLOCK: 'AFTER_FIRST_UNLOCK',
    AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 'AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY',
  },
  ACCESS_CONTROL: {
    BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE: 'BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE',
  },
  SECURITY_LEVEL: {
    SECURE_HARDWARE: 'SECURE_HARDWARE',
  },
  BIOMETRY_TYPE: {
    FACE_ID: 'FaceID',
    TOUCH_ID: 'TouchID',
  },
}));

// Mock SecureStorage service
jest.mock('@/services/storage/SecureStorage', () => ({
  SecureStorage: {
    setAuthTokens: jest.fn().mockResolvedValue(true),
    getAuthTokens: jest.fn().mockResolvedValue({ accessToken: null, refreshToken: null }),
    clearAuthTokens: jest.fn().mockResolvedValue(true),
    checkAvailability: jest.fn().mockResolvedValue(true),
    setItem: jest.fn().mockResolvedValue(true),
    getItem: jest.fn().mockResolvedValue(null),
    removeItem: jest.fn().mockResolvedValue(true),
  },
}));

// Mock react-native-splash-screen
jest.mock('react-native-splash-screen', () => ({
  show: jest.fn(),
  hide: jest.fn(),
}));

// Mock @notifee/react-native
jest.mock('@notifee/react-native', () => ({
  default: {
    createChannel: jest.fn().mockResolvedValue('channel-id'),
    createChannels: jest.fn().mockResolvedValue(undefined),
    requestPermission: jest.fn().mockResolvedValue({ authorizationStatus: 1 }),
    getNotificationSettings: jest.fn().mockResolvedValue({ authorizationStatus: 1 }),
    displayNotification: jest.fn().mockResolvedValue('notification-id'),
    createTriggerNotification: jest.fn().mockResolvedValue('notification-id'),
    cancelNotification: jest.fn().mockResolvedValue(undefined),
    cancelAllNotifications: jest.fn().mockResolvedValue(undefined),
    getTriggerNotifications: jest.fn().mockResolvedValue([]),
    onForegroundEvent: jest.fn().mockReturnValue(jest.fn()),
    onBackgroundEvent: jest.fn(),
    setBadgeCount: jest.fn().mockResolvedValue(undefined),
    getBadgeCount: jest.fn().mockResolvedValue(0),
    incrementBadgeCount: jest.fn().mockResolvedValue(undefined),
    decrementBadgeCount: jest.fn().mockResolvedValue(undefined),
  },
  AndroidImportance: {
    HIGH: 4,
    DEFAULT: 3,
    LOW: 2,
    MIN: 1,
  },
  AndroidVisibility: {
    PUBLIC: 1,
    PRIVATE: 0,
    SECRET: -1,
  },
  TriggerType: {
    TIMESTAMP: 0,
    INTERVAL: 1,
  },
  RepeatFrequency: {
    NONE: -1,
    HOURLY: 0,
    DAILY: 1,
    WEEKLY: 2,
  },
  EventType: {
    DISMISSED: 0,
    PRESS: 1,
    ACTION_PRESS: 2,
    DELIVERED: 3,
    APP_BLOCKED: 4,
    CHANNEL_BLOCKED: 5,
    CHANNEL_GROUP_BLOCKED: 6,
    TRIGGER_NOTIFICATION_CREATED: 7,
  },
}));

// Mock @sentry/react-native
jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  wrap: jest.fn((component) => component),
  setUser: jest.fn(),
  setTag: jest.fn(),
  setExtra: jest.fn(),
  setTags: jest.fn(),
  addBreadcrumb: jest.fn(),
  captureException: jest.fn().mockReturnValue('mock-event-id'),
  captureMessage: jest.fn().mockReturnValue('mock-event-id'),
  withScope: jest.fn((callback) => callback({ setLevel: jest.fn(), setExtras: jest.fn() })),
  flush: jest.fn().mockResolvedValue(true),
  reactNativeTracingIntegration: jest.fn(),
  reactNavigationIntegration: jest.fn(),
  startInactiveSpan: jest.fn(),
}));

// Mock EncryptionService
jest.mock('@/services/security/EncryptionService', () => ({
  EncryptionService: {
    initialize: jest.fn(),
    clear: jest.fn(),
    isInitialized: jest.fn().mockReturnValue(false),
    encrypt: jest.fn().mockReturnValue({ data: 'encrypted', iv: 'iv123', tag: 'tag123' }),
    decrypt: jest.fn().mockReturnValue('decrypted'),
    encryptJSON: jest.fn().mockReturnValue({ data: 'encrypted', iv: 'iv123', tag: 'tag123' }),
    decryptJSON: jest.fn().mockReturnValue({}),
    hashPassword: jest.fn().mockReturnValue({ hash: 'hash123', salt: 'salt123' }),
    verifyPassword: jest.fn().mockReturnValue(true),
    hash: jest.fn().mockReturnValue('hash123'),
    generateId: jest.fn().mockReturnValue('id123'),
    generatePin: jest.fn().mockReturnValue('123456'),
    maskData: jest.fn((data) => '****' + data.slice(-4)),
    maskEmail: jest.fn((email) => 'm***@' + email.split('@')[1]),
    maskPhone: jest.fn(() => '****1234'),
  },
  initializeEncryption: jest.fn(),
  clearEncryption: jest.fn(),
  encrypt: jest.fn().mockReturnValue({ data: 'encrypted', iv: 'iv123', tag: 'tag123' }),
  decrypt: jest.fn().mockReturnValue('decrypted'),
  hashPassword: jest.fn().mockReturnValue({ hash: 'hash123', salt: 'salt123' }),
  verifyPassword: jest.fn().mockReturnValue(true),
}));

// Mock SentryService
jest.mock('@/services/monitoring/SentryService', () => ({
  SentryService: {
    initialize: jest.fn(),
    setUser: jest.fn(),
    captureError: jest.fn().mockReturnValue('mock-event-id'),
    captureMessage: jest.fn().mockReturnValue('mock-event-id'),
    addBreadcrumb: jest.fn(),
    clearContext: jest.fn(),
    isEnabled: jest.fn().mockReturnValue(false),
  },
  initializeSentry: jest.fn(),
  captureError: jest.fn().mockReturnValue('mock-event-id'),
  captureMessage: jest.fn().mockReturnValue('mock-event-id'),
  addBreadcrumb: jest.fn(),
  setSentryUser: jest.fn(),
  clearSentryContext: jest.fn(),
}));

// Silence console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
