import { initDb } from '@/lib/db/db';
import { useNutrioStore } from '@/src/store';
import { useFoodStore } from '@/store/useFoodStore';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import 'react-native-reanimated';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Wait for zustand to rehydrate from AsyncStorage
    const unsub = useNutrioStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    // If already hydrated (sync)
    if (useNutrioStore.persist.hasHydrated()) {
      setHydrated(true);
    }
    return () => { unsub(); };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const profile = useNutrioStore.getState().profile;
    const init = async () => {
      await initDb();
      await useFoodStore.getState().hydrateFromDb();
    };
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
    Promise.all([init(), delay(1200)]).then(() => {
      setReady(true);
      if (profile?.onboardingCompleted) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/(onboarding)/welcome');
      }
    });
  }, [hydrated]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="weight-history" options={{ presentation: 'modal', headerShown: true, title: 'Weight History' }} />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}
