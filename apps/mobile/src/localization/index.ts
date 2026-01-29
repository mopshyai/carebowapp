/**
 * Localization System
 * Lightweight i18n implementation for React Native
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';

import en from './languages/en';
import es from './languages/es';
import hi from './languages/hi';

// ============================================
// TYPES
// ============================================

export type SupportedLanguage = 'en' | 'es' | 'hi';

export type TranslationKeys = keyof typeof en;

export type TranslationParams = Record<string, string | number>;

// ============================================
// LANGUAGE METADATA
// ============================================

export const LANGUAGES: Record<SupportedLanguage, { name: string; nativeName: string; direction: 'ltr' | 'rtl' }> = {
  en: { name: 'English', nativeName: 'English', direction: 'ltr' },
  es: { name: 'Spanish', nativeName: 'Español', direction: 'ltr' },
  hi: { name: 'Hindi', nativeName: 'हिंदी', direction: 'ltr' },
};

// All translations indexed by language code
const translations: Record<SupportedLanguage, typeof en> = {
  en,
  es,
  hi,
};

// ============================================
// STORE
// ============================================

interface LocalizationState {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
}

export const useLocalizationStore = create<LocalizationState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'carebow-localization',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ============================================
// TRANSLATION FUNCTION
// ============================================

/**
 * Get translated string with optional parameter interpolation
 * @param key - Translation key
 * @param params - Optional parameters for interpolation
 * @returns Translated string
 */
export function t(key: TranslationKeys, params?: TranslationParams): string {
  const language = useLocalizationStore.getState().language;
  const languageTranslations = translations[language] || translations.en;

  let text = languageTranslations[key] || translations.en[key] || key;

  // Interpolate parameters: {{param}} syntax
  if (params) {
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      text = text.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
    });
  }

  return text;
}

// ============================================
// DEVICE LANGUAGE DETECTION
// ============================================

/**
 * Get device's preferred language
 */
export function getDeviceLanguage(): SupportedLanguage {
  let deviceLanguage: string;

  if (Platform.OS === 'ios') {
    deviceLanguage =
      NativeModules.SettingsManager?.settings?.AppleLocale ||
      NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
      'en';
  } else {
    deviceLanguage = NativeModules.I18nManager?.localeIdentifier || 'en';
  }

  // Extract language code (e.g., 'en_US' -> 'en')
  const languageCode = deviceLanguage.split(/[-_]/)[0].toLowerCase();

  // Return supported language or default to English
  if (languageCode in LANGUAGES) {
    return languageCode as SupportedLanguage;
  }

  return 'en';
}

/**
 * Initialize localization with device language if not already set
 */
export function initializeLocalization(): void {
  // Only set if this is first launch (no persisted value)
  const currentLanguage = useLocalizationStore.getState().language;
  if (!currentLanguage) {
    const deviceLanguage = getDeviceLanguage();
    useLocalizationStore.getState().setLanguage(deviceLanguage);
  }
}

// ============================================
// EXPORTS
// ============================================

export { default as useTranslation } from './useTranslation';
export type { TranslationKey } from './languages/en';
