import { useNutrioStore } from '@/src/store';
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
    const timer = setTimeout(() => {
      setReady(true);
      if (profile?.onboardingCompleted) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/(onboarding)/welcome');
      }
    }, 1200);
    return () => clearTimeout(timer);
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
