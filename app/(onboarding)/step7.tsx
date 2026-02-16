import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OnboardingStep from '@/src/components/onboarding/OnboardingStep';
import Chip from '@/src/components/ui/Chip';
import { colors, spacing } from '@/src/theme/tokens';
import { useNutrioStore } from '@/src/store';
import { Goal } from '@/src/types';

const GOALS: { value: Goal; label: string; emoji: string }[] = [
  { value: 'lose_weight', label: 'Lose weight', emoji: '⚖️' },
  { value: 'gain_muscle', label: 'Gain muscle', emoji: '💪' },
  { value: 'maintain_weight', label: 'Maintain weight', emoji: '✅' },
  { value: 'boost_energy', label: 'Boost energy', emoji: '⚡' },
  { value: 'improve_nutrition', label: 'Improve nutrition', emoji: '🥦' },
  { value: 'gain_weight', label: 'Gain weight', emoji: '📈' },
];

export default function Step7() {
  const insets = useSafeAreaInsets();
  const [goal, setGoal] = useState<Goal | null>(null);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <OnboardingStep
        step={7}
        totalSteps={8}
        title="What's your main goal?"
        subtitle="Choose the goal that matters most to you."
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
