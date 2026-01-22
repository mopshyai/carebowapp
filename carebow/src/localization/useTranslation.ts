/**
 * useTranslation Hook
 * React hook for accessing translations with reactivity
 */

import { useCallback, useMemo } from 'react';
import { useLocalizationStore, LANGUAGES, type SupportedLanguage } from './index';
import en from './languages/en';
import es from './languages/es';
import hi from './languages/hi';

import type { TranslationKey } from './languages/en';

// All translations indexed by language code
const translations: Record<SupportedLanguage, typeof en> = {
  en,
  es,
  hi,
};

type TranslationParams = Record<string, string | number>;

interface UseTranslationReturn {
  /** Get a translated string */
  t: (key: TranslationKey, params?: TranslationParams) => string;
  /** Current language code */
  language: SupportedLanguage;
  /** Set the current language */
  setLanguage: (language: SupportedLanguage) => void;
  /** List of supported languages with metadata */
  languages: typeof LANGUAGES;
  /** Check if current language is RTL */
  isRTL: boolean;
}

/**
 * Hook for accessing translations
 * Provides reactive translation function and language management
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { t, language, setLanguage } = useTranslation();
 *
 *   return (
 *     <View>
 *       <Text>{t('common.welcome')}</Text>
 *       <Text>{t('home.greeting', { name: 'John' })}</Text>
 *       <Button onPress={() => setLanguage('es')} title="Switch to Spanish" />
 *     </View>
 *   );
 * }
 * ```
 */
export default function useTranslation(): UseTranslationReturn {
  const language = useLocalizationStore((state) => state.language);
  const setLanguage = useLocalizationStore((state) => state.setLanguage);

  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams): string => {
      const languageTranslations = translations[language] || translations.en;
      let text = languageTranslations[key] || translations.en[key] || key;

      // Interpolate parameters: {{param}} syntax
      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          text = text.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
        });
      }

      return text;
    },
    [language]
  );

  const isRTL = useMemo(() => {
    return LANGUAGES[language]?.direction === 'rtl';
  }, [language]);

  return {
    t,
    language,
    setLanguage,
    languages: LANGUAGES,
    isRTL,
  };
}
