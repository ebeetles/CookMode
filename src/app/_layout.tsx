import { BarlowCondensed_500Medium, BarlowCondensed_600SemiBold, useFonts } from '@expo-google-fonts/barlow-condensed';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors, FONT_TIMEOUT_MS } from '@/constants/theme';
import { DisplayFontProvider } from '@/state/display-font';
import { RecipesProvider } from '@/state/recipes-store';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ BarlowCondensed_500Medium, BarlowCondensed_600SemiBold });
  const [timedOut, setTimedOut] = useState(false);
  const ready = fontsLoaded || fontError !== null || timedOut;

  useEffect(() => {
    const timeout = setTimeout(() => setTimedOut(true), FONT_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (fontError) console.warn('Could not load Barlow Condensed, using the system font', fontError);
  }, [fontError]);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <DisplayFontProvider value={fontsLoaded}>
        <RecipesProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.tile } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="add" />
            <Stack.Screen name="cook/[id]" options={{ contentStyle: { backgroundColor: colors.tape } }} />
          </Stack>
        </RecipesProvider>
      </DisplayFontProvider>
    </SafeAreaProvider>
  );
}
