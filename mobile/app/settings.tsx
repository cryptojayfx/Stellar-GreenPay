/**
 * app/settings.tsx
 *
 * Settings screen.
 * - Language override: lets the user pick en / es / fr, persisted to
 *   AsyncStorage via the I18nProvider's setLocale().  The device locale
 *   is used by default; this overrides it.
 * - Wired into the I18nProvider declared in _layout.tsx so the whole
 *   app re-renders immediately when the user changes language.
 */
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTheme } from './theme';
import { useI18n, SUPPORTED_LOCALES, LOCALE_LABELS, type Locale } from '../src/i18n';
import Constants from 'expo-constants';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const { t, locale, setLocale } = useI18n();

  const appVersion: string =
    (Constants.expoConfig?.version ?? Constants.manifest?.version ?? '—') as string;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* ── Language ──────────────────────────────────────────────────── */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
        <Text style={[styles.sectionHeader, { color: colors.primaryText }]}>
          {t('settings.language')}
        </Text>
        <Text style={[styles.sectionSubtitle, { color: colors.secondaryText }]}>
          {t('settings.languageSubtitle')}
        </Text>

        <View style={styles.localeRow}>
          {SUPPORTED_LOCALES.map((loc: Locale) => {
            const isActive = loc === locale;
            return (
              <TouchableOpacity
                key={loc}
                style={[
                  styles.localeChip,
                  { borderColor: colors.cardBorder },
                  isActive && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => setLocale(loc)}
                activeOpacity={0.7}
                accessibilityLabel={`Set language to ${LOCALE_LABELS[loc]}`}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
              >
                <Text
                  style={[
                    styles.localeChipText,
                    { color: isActive ? '#fff' : colors.primaryText },
                  ]}
                >
                  {LOCALE_LABELS[loc]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── About ─────────────────────────────────────────────────────── */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
        <Text style={[styles.sectionHeader, { color: colors.primaryText }]}>
          {t('settings.about')}
        </Text>
        <View style={styles.aboutRow}>
          <Text style={[styles.aboutLabel, { color: colors.secondaryText }]}>
            {t('settings.version')}
          </Text>
          <Text style={[styles.aboutValue, { color: colors.primaryText }]}>
            {appVersion}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 14,
  },
  localeRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  localeChip: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  localeChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  aboutLabel: {
    fontSize: 14,
  },
  aboutValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});
