import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OnboardingStep from '@/src/components/onboarding/OnboardingStep';
import Input from '@/src/components/ui/Input';
import { colors } from '@/src/theme/tokens';
import { useNutrioStore } from '@/src/store';

export default function Step5() {
  const insets = useSafeAreaInsets();
  const [weight, setWeight] = useState('70');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <OnboardingStep
        step={5}
        totalSteps={8}
        title="Current weight?"
        subtitle="Enter your current weight in kilograms."
        onNext={() => {
          const w = parseFloat(weight);
          if (w > 0) {
            useNutrioStore.getState().updateProfile({ currentWeightKg: w });
            router.push('/(onboarding)/step6');
          }
        }}
        onBack={() => router.back()}
        nextDisabled={!weight || parseFloat(weight) <= 0}
      >
        <Input
          label="Weight"
          placeholder="70"
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          suffix="kg"
        />
      </OnboardingStep>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});
