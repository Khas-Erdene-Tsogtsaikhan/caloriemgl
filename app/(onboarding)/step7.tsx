import OnboardingStep from '@/src/components/onboarding/OnboardingStep';
import Chip from '@/src/components/ui/Chip';
import { useNutrioStore } from '@/src/store';
import { colors, spacing } from '@/src/theme/tokens';
import { Goal } from '@/src/types';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const GOALS: { value: Goal; label: string; emoji: string }[] = [
  { value: 'lose_weight', label: 'Жингээ хасах', emoji: '⚖️' },
  { value: 'gain_muscle', label: 'Булчин нэмэх', emoji: '💪' },
  { value: 'maintain_weight', label: 'Жингээ хадгалах', emoji: '✅' },
  { value: 'boost_energy', label: 'Эрч хүч нэмэх', emoji: '⚡' },
  { value: 'improve_nutrition', label: 'Хоол хүнс сайжруулах', emoji: '🥦' },
  { value: 'gain_weight', label: 'Жингээ нэмэх', emoji: '📈' },
];

export default function Step7() {
  const insets = useSafeAreaInsets();
  const [goal, setGoal] = useState<Goal | null>(null);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <OnboardingStep
        step={7}
        totalSteps={8}
        title="Үндсэн зорилгоо сонгоно уу"
        onNext={() => {
          if (goal) {
            useNutrioStore.getState().updateProfile({ goal });
            router.push('/(onboarding)/step8');
          }
        }}
        onBack={() => router.back()}
        nextDisabled={!goal}
      >
        <View style={styles.options}>
          {GOALS.map((g) => (
            <Chip
              key={g.value}
              label={g.label}
              emoji={g.emoji}
              selected={goal === g.value}
              onPress={() => setGoal(g.value)}
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
  chip: { paddingVertical: spacing.md + 2, paddingHorizontal: spacing.xl },
});
