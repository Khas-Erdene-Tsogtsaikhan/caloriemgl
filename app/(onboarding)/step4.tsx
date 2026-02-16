import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OnboardingStep from '@/src/components/onboarding/OnboardingStep';
import Input from '@/src/components/ui/Input';
import { colors } from '@/src/theme/tokens';
import { useNutrioStore } from '@/src/store';

export default function Step4() {
  const insets = useSafeAreaInsets();
  const [height, setHeight] = useState('170');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <OnboardingStep
        step={4}
        totalSteps={8}
        title="How tall are you?"
        subtitle="Enter your height in centimeters."
        onNext={() => {
          const h = parseInt(height, 10);
          if (h > 0) {
            useNutrioStore.getState().updateProfile({ heightCm: h });
            router.push('/(onboarding)/step5');
          }
        }}
        onBack={() => router.back()}
        nextDisabled={!height || parseInt(height, 10) <= 0}
      >
        <Input
          label="Height"
          placeholder="170"
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
          suffix="cm"
        />
      </OnboardingStep>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});
