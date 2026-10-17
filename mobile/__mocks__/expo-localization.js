/**
 * __mocks__/expo-localization.js
 * Minimal stub for expo-localization used by Jest.
 * Returns an English locale so detectDeviceLocale() resolves to 'en'.
 */
module.exports = {
  getLocales: jest.fn(() => [
    { languageTag: 'en-US', languageCode: 'en' },
  ]),
  locale: 'en-US',
  locales: ['en-US'],
  timezone: 'America/New_York',
  isRTL: false,
};
