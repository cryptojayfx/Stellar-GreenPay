/**
 * src/i18n.ts
 *
 * Lightweight i18n helper for the Expo mobile app.
 *
 * - Device locale is detected via expo-localization on first load.
 * - The user can override the locale via the settings screen; the choice
 *   is persisted in AsyncStorage under I18N_LOCALE_KEY.
 * - t(key) resolves dot-notation keys (e.g. "home.title") against the
 *   active locale catalog, falling back to the key itself when missing.
 * - Mirrors the pattern used in frontend/lib/i18n.tsx.
 *
 * Supported locales: en · es · fr
 */

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { createElement } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ExpoLocalization from 'expo-localization';

import en from '../locales/en.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Locale = 'en' | 'es' | 'fr';

export const SUPPORTED_LOCALES: Locale[] = ['en', 'es', 'fr'];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
};

/** AsyncStorage key for the user's locale override */
export const I18N_LOCALE_KEY = '@greenpay/locale';

// ─── Catalog ─────────────────────────────────────────────────────────────────

const catalogs: Record<Locale, Record<string, unknown>> = { en, es, fr };

// ─── Dot-notation resolver ────────────────────────────────────────────────────

function get(obj: Record<string, unknown>, path: string): string {
  const result = path.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
  return typeof result === 'string' ? result : path;
}

// ─── Locale detection ────────────────────────────────────────────────────────

/**
 * Derive the best supported locale from the device's locale list.
 * Tries full tag (e.g. "es-MX"), then language-only ("es"), falls back "en".
 */
export function detectDeviceLocale(): Locale {
  const deviceLocales = ExpoLocalization.getLocales?.() ?? [];
  for (const { languageTag, languageCode } of deviceLocales) {
    // exact match: e.g. "fr-FR"
    const full = languageTag?.split('-')[0]?.toLowerCase() as Locale;
    if (full && SUPPORTED_LOCALES.includes(full)) return full;
    // language-only: e.g. "es"
    const lang = languageCode?.toLowerCase() as Locale;
    if (lang && SUPPORTED_LOCALES.includes(lang)) return lang;
  }
  return 'en';
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface I18nContextValue {
  locale: Locale;
  /** Change locale and persist to AsyncStorage */
  setLocale: (l: Locale) => Promise<void>;
  /** Translate a dot-notation key */
  t: (key: string) => string;
  /** True while the initial locale is being resolved from AsyncStorage */
  loading: boolean;
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  setLocale: async () => {},
  t: (k) => k,
  loading: true,
});

// ─── Provider ────────────────────────────────────────────────────────────────

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps): ReturnType<typeof createElement> {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [loading, setLoading] = useState(true);

  // On mount: check AsyncStorage for a saved override, otherwise detect device locale.
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(I18N_LOCALE_KEY);
        if (saved && SUPPORTED_LOCALES.includes(saved as Locale)) {
          setLocaleState(saved as Locale);
        } else {
          setLocaleState(detectDeviceLocale());
        }
      } catch {
        setLocaleState(detectDeviceLocale());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setLocale = useCallback(async (l: Locale) => {
    setLocaleState(l);
    try {
      await AsyncStorage.setItem(I18N_LOCALE_KEY, l);
    } catch {
      // Non-critical — locale change still takes effect in-memory.
    }
  }, []);

  const t = useCallback(
    (key: string) => get(catalogs[locale] as Record<string, unknown>, key),
    [locale],
  );

  return createElement(I18nContext.Provider, { value: { locale, setLocale, t, loading } }, children);
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/** Access the active locale, setLocale, and t() from any component. */
export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}
