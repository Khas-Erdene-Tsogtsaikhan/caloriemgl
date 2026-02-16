import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OnboardingStep from '@/src/components/onboarding/OnboardingStep';
import Chip from '@/src/components/ui/Chip';
import { colors, spacing } from '@/src/theme/tokens';
import { useNutrioStore } from '@/src/store';
import { Gender } from '@/src/types';

const GENDERS: { value: Gender; label: string; emoji: string }[] = [
  { value: 'male', label: 'Male', emoji: '👨' },
  { value: 'female', label: 'Female', emoji: '👩' },
  { value: 'other', label: 'Other', emoji: '🧑' },
];

export default function Step2() {
  const insets = useSafeAreaInsets();
  const [gender, setGender] = useState<Gender | null>(null);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <OnboardingStep
        step={2}
        totalSteps={8}
        title="What's your gender?"
        subtitle="This helps us calculate your calorie needs."
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
