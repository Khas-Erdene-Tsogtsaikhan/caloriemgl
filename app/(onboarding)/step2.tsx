import OnboardingStep from '@/src/components/onboarding/OnboardingStep';
import Chip from '@/src/components/ui/Chip';
import { useNutrioStore } from '@/src/store';
import { colors, spacing } from '@/src/theme/tokens';
import { Gender } from '@/src/types';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const GENDERS: { value: Gender; label: string; emoji: string }[] = [
  { value: 'male', label: 'Эрэгтэй', emoji: '👨' },
  { value: 'female', label: 'Эмэгтэй', emoji: '👩' },
];

export default function Step2() {
  const insets = useSafeAreaInsets();
  const [gender, setGender] = useState<Gender | null>(null);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <OnboardingStep
        step={2}
        totalSteps={8}
        title="Таны xүйс?"
  
        onNext={() => {
          if (gender) {
            useNutrioStore.getState().updateProfile({ gender });
            router.push('/(onboarding)/step3');
          }
        }}
        onBack={() => router.back()}
        nextDisabled={!gender}
      >
        <View style={styles.options}>
          {GENDERS.map((g) => (
            <Chip
              key={g.value}
              label={g.label}
              emoji={g.emoji}
              selected={gender === g.value}
              onPress={() => setGender(g.value)}
              style={styles.chip}
            />
          ))}
        </View>
      </OnboardingStep>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  options: { gap: spacing.md },
  chip: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl },
});
