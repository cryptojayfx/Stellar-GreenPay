/**
 * __mocks__/src/i18n.js
 *
 * Jest manual mock for mobile/src/i18n.ts.
 *
 * Tests render screens without wrapping them in <I18nProvider>, so the real
 * context would return the fallback (key strings).  This mock replaces the
 * module with a version that:
 *   - useI18n()  →  { t, locale: 'en', setLocale, loading: false }
 *   - t(key)     →  resolves against the real English catalog, falling back to
 *                    the key itself — so tests can assert against real copy.
 *   - I18nProvider  →  pass-through wrapper (just renders children).
 *   - All other exports (SUPPORTED_LOCALES, LOCALE_LABELS, etc.) are real
 *     values so settings-screen tests can import them.
 */

const en = require('../../locales/en.json');

function get(obj, path) {
  return path.split('.').reduce((acc, part) => (acc && typeof acc === 'object' ? acc[part] : undefined), obj) ?? path;
}

function t(key) {
  return get(en, key);
}

const SUPPORTED_LOCALES = ['en', 'es', 'fr'];

const LOCALE_LABELS = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
};

const I18N_LOCALE_KEY = '@greenpay/locale';

const detectDeviceLocale = jest.fn(() => 'en');

// I18nProvider just renders its children in test environments.
const React = require('react');
function I18nProvider({ children }) {
  return React.createElement(React.Fragment, null, children);
}

function useI18n() {
  return {
    locale: 'en',
    setLocale: jest.fn().mockResolvedValue(undefined),
    t,
    loading: false,
  };
}

module.exports = {
  I18nProvider,
  useI18n,
  t,
  SUPPORTED_LOCALES,
  LOCALE_LABELS,
  I18N_LOCALE_KEY,
  detectDeviceLocale,
};
