import React, { useState } from 'react';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';
import OnboardingStep from '@/src/components/onboarding/OnboardingStep';
import Input from '@/src/components/ui/Input';
import { colors } from '@/src/theme/tokens';
import { useNutrioStore } from '@/src/store';

export default function Step1() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <OnboardingStep
        step={1}
        totalSteps={8}
        title="What's your name?"
        subtitle="We'll use this to personalize your experience."
        onNext={() => {
          useNutrioStore.setState({ profile: { ...DEFAULT_PROFILE, name } });
          router.push('/(onboarding)/step2');
        }}
        nextDisabled={name.trim().length === 0}
      >
        <Input
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
          maxLength={30}
        />
      </OnboardingStep>
    </View>
  );
}

const DEFAULT_PROFILE = {
  name: '',
  gender: 'male' as const,
  birthdate: '2000-01-01',
  heightCm: 170,
  currentWeightKg: 70,
  targetWeightKg: 65,
  goal: 'maintain_weight' as const,
  activityLevel: 'moderately_active' as const,
  onboardingCompleted: false,
  dailyCalorieGoal: 2000,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});
