/**
 * CareBow App
 * Root component with navigation setup, error handling, and deep linking
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Linking, Alert } from 'react-native';
import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
  NavigationContainerRef,
} from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './navigation';
import type { RootStackParamList } from './navigation/types';
import { ErrorBoundary, ErrorLogger } from './components/ErrorBoundary';
import { SplashScreen } from './components/SplashScreen';
import { initializeFeedbackDevTools } from './utils/feedbackDevTools';
import { NetworkProvider } from './utils/NetworkProvider';
import { ToastProvider } from './components/ui/Toast';
import { initializeSentry } from './services/monitoring/SentryService';
import { useAuthStore } from './store/useAuthStore';
import { ThemeProvider, useTheme } from './theme';

// Initialize services on app load
initializeSentry();

if (__DEV__) {
  initializeFeedbackDevTools();
}

// ============================================
// DEEP LINKING CONFIGURATION
// ============================================

const linking = {
  prefixes: ['carebow://', 'https://carebow.app', 'https://www.carebow.app'],
  config: {
    screens: {
      // Auth Stack (for password reset links, etc.)
      Auth: {
        screens: {
          Welcome: 'welcome',
          Login: 'login',
          Signup: 'signup',
          VerifyEmail: 'verify-email/:email',
          ForgotPassword: 'forgot-password',
          ResetPassword: 'reset-password/:token',
        },
      },
      // Onboarding Stack
      Onboarding: {
        screens: {
          OnboardingSlides: 'onboarding',
          RoleSelection: 'onboarding/role',
          CreateProfile: 'onboarding/profile/:role',
          OnboardingComplete: 'onboarding/complete',
        },
      },
      // Main Tabs
      MainTabs: {
        screens: {
          Home: 'home',
          Ask: 'ask',
          Messages: 'messages',
        },
      },
      // Conversation & Assessment
      Conversation: 'conversation',
      Assessment: 'assessment',
      Thread: 'thread/:id',
      Schedule: 'schedule',
      Modal: 'modal',
      // Services & Orders
      Services: 'services/:category?',
      ServiceDetails: 'service/:id',
      PlanDetails: 'plan/:id',
      Checkout: 'checkout/:serviceId?',
      OrderSuccess: 'order-success/:orderId?',
      Orders: 'orders',
      OrderDetails: 'order/:id',
      Requests: 'requests',
      RequestDetails: 'request/:id',
      // Profile Stack
      Profile: {
        screens: {
          ProfileIndex: 'profile',
          PersonalInfo: 'profile/personal',
          FamilyMembers: 'profile/family',
          MemberDetails: 'profile/family/:memberId?',
          Addresses: 'profile/addresses',
          CareHistory: 'profile/history',
          HealthRecords: 'profile/records',
          Insurance: 'profile/insurance',
          Notifications: 'profile/notifications',
          Privacy: 'profile/privacy',
          Help: 'profile/help',
          Settings: 'profile/settings',
          EmergencyContacts: 'profile/emergency',
          HealthInfo: 'profile/health',
        },
      },
      // Safety Stack
      Safety: {
        screens: {
          SafetyIndex: 'safety',
          SafetySettings: 'safety/settings',
          SafetyContacts: 'safety/contacts',
        },
      },
      // Telemedicine
      TelemedicineBooking: 'telemedicine/book/:doctorId?',
      VideoCall: 'telemedicine/call/:appointmentId',
      // Health Memory
      HealthMemory: 'health-memory',
      EpisodeSummary: 'episode/:episodeId',
    },
  },
};

// ============================================
// ERROR HANDLERS
// ============================================

const handleNavigationError = (error: Error) => {
  ErrorLogger.logError(error, undefined, { source: 'navigation' });
  if (__DEV__) {
    Alert.alert('Navigation Error', error.message);
  }
};

const handleAppError = (error: Error, errorInfo: React.ErrorInfo) => {
  ErrorLogger.logError(error, errorInfo, { source: 'app' });
};

// ============================================
// APP CONTENT COMPONENT (uses theme context)
// ============================================

function AppContent() {
  const { isDark } = useTheme();
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);

  const hydrateTokens = useAuthStore((state) => state.hydrateTokensFromSecureStorage);

  // Initialize app - hydrate auth tokens from secure storage
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Hydrate auth tokens from secure storage
        await hydrateTokens();

        // Add any other initialization logic here
        // e.g., fetch user preferences, check for updates, etc.

        if (__DEV__) {
          console.log('[App] Initialization complete');
        }
      } catch (error) {
        ErrorLogger.logError(
          error instanceof Error ? error : new Error(String(error)),
          undefined,
          { source: 'app_init' }
        );
      } finally {
        setIsAppReady(true);
      }
    };

    initializeApp();
  }, [hydrateTokens]);

  // Handle deep links that arrive while app is running
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      if (__DEV__) {
        console.log('[App] Deep link received:', event.url);
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Handle deep link that opened the app
    Linking.getInitialURL().then((url) => {
      if (url && __DEV__) {
        console.log('[App] Initial deep link:', url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Handle splash screen completion
  const handleSplashComplete = useCallback(() => {
    if (isAppReady) {
      setShowSplash(false);
    }
  }, [isAppReady]);

  return (
    <>
      {/* Splash Screen */}
      {showSplash && (
        <SplashScreen
          onAnimationComplete={handleSplashComplete}
          isVisible={showSplash}
        />
      )}

      {/* Main App */}
      <NavigationContainer
        ref={navigationRef}
        theme={isDark ? DarkTheme : DefaultTheme}
        linking={linking}
        onStateChange={(state) => {
          // Can be used for analytics screen tracking
          if (__DEV__ && state) {
            const currentRoute = state.routes[state.index];
            console.log('[Navigation] Screen:', currentRoute?.name);
          }
        }}
        fallback={null}
      >
        <RootNavigator />
      </NavigationContainer>
    </>
  );
}

// ============================================
// APP COMPONENT (root with providers)
// ============================================

export default function App() {
  return (
    <ErrorBoundary onError={handleAppError}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <NetworkProvider>
              <ToastProvider>
                <AppContent />
              </ToastProvider>
            </NetworkProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
