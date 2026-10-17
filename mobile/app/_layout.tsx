/**
 * app/_layout.tsx
 * Root layout for the mobile app using expo-router
 */
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ThemeProvider, themes } from './theme';
import { useDeepLink } from '../hooks/useDeepLink';
import { setupNotificationListener, setupNotificationResponseListener } from '../utils/notifications';
import { I18nProvider, useI18n } from '../src/i18n';

function DeepLinkHandler() {
  useDeepLink();
  return null;
}

function NotificationHandler() {
  const router = useRouter();

  useEffect(() => {
    // Foreground notification display listener
    const receivedSub = setupNotificationListener();

    // Tap-on-notification → navigate to project detail (#483)
    const responseSub = setupNotificationResponseListener((path) => router.push(path as any));

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, [router]);

  return null;
}

/** Inner stack that has access to the I18nProvider context. */
function AppStack() {
  const { t } = useI18n();
  const colorScheme = useColorScheme();
  const themeMode = colorScheme === 'dark' ? 'dark' : 'light';
  const theme = themes[themeMode];

  return (
    <>
      <DeepLinkHandler />
      <NotificationHandler />
      <StatusBar style={theme.statusBarStyle} />
      <Stack screenOptions={{
        headerStyle: { backgroundColor: theme.header },
        headerTintColor: theme.headerText,
        headerTitleStyle: { fontFamily: 'Lora_700Bold' },
      }}>
        <Stack.Screen name="index" options={{ title: t('nav.home') }} />
        <Stack.Screen name="projects" options={{ title: t('nav.projects') }} />
        <Stack.Screen name="projects/[id]" options={{ title: t('nav.projectDetails') }} />
        <Stack.Screen name="donate/[id]" options={{ title: t('nav.donate') }} />
        <Stack.Screen name="impact" options={{ title: t('nav.impact') }} />
        <Stack.Screen name="profile/[address]" options={{ title: t('nav.donorProfile') }} />
        <Stack.Screen name="leaderboard" options={{ title: t('nav.leaderboard') }} />
        <Stack.Screen name="recurring" options={{ title: t('nav.recurring') }} />
        <Stack.Screen name="scan" options={{ title: t('nav.scan'), headerShown: false }} />
        <Stack.Screen name="settings" options={{ title: t('nav.settings') }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <AppStack />
      </ThemeProvider>
    </I18nProvider>
  );
}
