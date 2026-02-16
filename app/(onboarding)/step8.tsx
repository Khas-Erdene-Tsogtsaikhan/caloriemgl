import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OnboardingStep from '@/src/components/onboarding/OnboardingStep';
import Chip from '@/src/components/ui/Chip';
import { colors, spacing } from '@/src/theme/tokens';
import { useNutrioStore } from '@/src/store';
import { ActivityLevel } from '@/src/types';
import { calculateDailyCalories } from '@/src/utils/calories';

const LEVELS: { value: ActivityLevel; label: string; desc: string; emoji: string }[] = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise', emoji: '🪑' },
  { value: 'lightly_active', label: 'Lightly active', desc: 'Light exercise 1-3 days/week', emoji: '🚶' },
  { value: 'moderately_active', label: 'Moderately active', desc: 'Moderate exercise 3-5 days/week', emoji: '🏃' },
  { value: 'very_active', label: 'Very active', desc: 'Hard exercise 6-7 days/week', emoji: '🏋️' },
];

export default function Step8() {
  const insets = useSafeAreaInsets();
  const [level, setLevel] = useState<ActivityLevel | null>(null);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <OnboardingStep
        step={8}
        totalSteps={8}
        title="Activity level?"
        subtitle="How active are you on a typical week?"
        onNext={() => {
          if (level) {
            const profile = useNutrioStore.getState().profile;
            if (profile) {
              const dailyCalorieGoal = calculateDailyCalories(
                profile.gender,
                profile.currentWeightKg,
                profile.heightCm,
                profile.birthdate,
                level,
                profile.goal
              );
              useNutrioStore.getState().updateProfile({ activityLevel: level, dailyCalorieGoal });
            }
            router.push('/(onboarding)/step9');
          }
        }}
        onBack={() => router.back()}
        nextDisabled={!level}
      >
        <View style={styles.options}>
          {LEVELS.map((l) => (
            <Chip
              key={l.value}
              label={`${l.label} — ${l.desc}`}
              emoji={l.emoji}
              selected={level === l.value}
              onPress={() => setLevel(l.value)}
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
  chip: { paddingVertical: spacing.md + 2, paddingHorizontal: spacing.lg },
});
