import OnboardingStep from '@/src/components/onboarding/OnboardingStep';
import Input from '@/src/components/ui/Input';
import { useNutrioStore } from '@/src/store';
import { colors } from '@/src/theme/tokens';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Step6() {
  const insets = useSafeAreaInsets();
  const [weight, setWeight] = useState('65');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <OnboardingStep
        step={6}
        totalSteps={8}
        title="Зорилтот жин?"
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
          label="Ямар жинд хүрэхийг хүсч байна вэ?"
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
