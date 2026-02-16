import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OnboardingStep from '@/src/components/onboarding/OnboardingStep';
import Input from '@/src/components/ui/Input';
import { colors } from '@/src/theme/tokens';
import { useNutrioStore } from '@/src/store';

export default function Step6() {
  const insets = useSafeAreaInsets();
  const [weight, setWeight] = useState('65');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <OnboardingStep
        step={6}
        totalSteps={8}
        title="Target weight?"
        subtitle="What weight would you like to reach?"
        onNext={() => {
          const w = parseFloat(weight);
          if (w > 0) {
            useNutrioStore.getState().updateProfile({ targetWeightKg: w });
            router.push('/(onboarding)/step7');
          }
        }}
        onBack={() => router.back()}
        nextDisabled={!weight || parseFloat(weight) <= 0}
      >
        <Input
          label="Target Weight"
          placeholder="65"
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
