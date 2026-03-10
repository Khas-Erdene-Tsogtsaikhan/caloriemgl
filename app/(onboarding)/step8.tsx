import OnboardingStep from '@/src/components/onboarding/OnboardingStep';
import Chip from '@/src/components/ui/Chip';
import { useNutrioStore } from '@/src/store';
import { colors, spacing } from '@/src/theme/tokens';
import { ActivityLevel } from '@/src/types';
import { calculateDailyCalories } from '@/src/utils/calories';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LEVELS: { value: ActivityLevel; label: string; desc: string; emoji: string }[] = [
  { value: 'sedentary', label: 'Xийдэггүй', desc: 'Огт дасгал хийдэггүй', emoji: '🪑' },
  { value: 'lightly_active', label: 'Бага идэвхтэй', desc: '1-3 өдөр долоо хоногт', emoji: '🚶' },
  { value: 'moderately_active', label: 'Дунд идэвхтэй', desc: '3-5 өдөр долоо хоногт', emoji: '🏃' },
  { value: 'very_active', label: 'Маш идэвхтэй', desc: '6-7 өдөр долоо хоногт', emoji: '🏋️' },
];

export default function Step8() {
  const insets = useSafeAreaInsets();
  const [level, setLevel] = useState<ActivityLevel | null>(null);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <OnboardingStep
        step={8}
        totalSteps={8}
        title="Үйл ажиллагааны түвшин?"
        subtitle="Долоо хоногт хэр идэвхтэй вэ?"
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
