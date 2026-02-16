import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OnboardingStep from '@/src/components/onboarding/OnboardingStep';
import { colors, spacing, typography, radii } from '@/src/theme/tokens';
import { useNutrioStore } from '@/src/store';

export default function Step3() {
  const insets = useSafeAreaInsets();
  const [year, setYear] = useState(2000);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <OnboardingStep
        step={3}
        totalSteps={8}
        title="When were you born?"
        subtitle="We need your age for accurate calculations."
        onNext={() => {
          const birthdate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          useNutrioStore.getState().updateProfile({ birthdate });
          router.push('/(onboarding)/step4');
        }}
        onBack={() => router.back()}
      >
        <View style={styles.pickerRow}>
          <View style={styles.pickerCol}>
            <Text style={styles.pickerLabel}>Year</Text>
            <View style={styles.scrollCol}>
              <TouchableOpacity onPress={() => setYear((y) => Math.min(y + 1, 2020))} style={styles.arrowBtn}>
                <Text style={styles.arrow}>▲</Text>
              </TouchableOpacity>
              <Text style={styles.pickerValue}>{year}</Text>
              <TouchableOpacity onPress={() => setYear((y) => Math.max(y - 1, 1940))} style={styles.arrowBtn}>
                <Text style={styles.arrow}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.pickerCol}>
            <Text style={styles.pickerLabel}>Month</Text>
            <View style={styles.scrollCol}>
              <TouchableOpacity onPress={() => setMonth((m) => (m < 12 ? m + 1 : 1))} style={styles.arrowBtn}>
                <Text style={styles.arrow}>▲</Text>
              </TouchableOpacity>
              <Text style={styles.pickerValue}>{months[month - 1]}</Text>
              <TouchableOpacity onPress={() => setMonth((m) => (m > 1 ? m - 1 : 12))} style={styles.arrowBtn}>
                <Text style={styles.arrow}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.pickerCol}>
            <Text style={styles.pickerLabel}>Day</Text>
            <View style={styles.scrollCol}>
              <TouchableOpacity onPress={() => setDay((d) => (d < 31 ? d + 1 : 1))} style={styles.arrowBtn}>
                <Text style={styles.arrow}>▲</Text>
              </TouchableOpacity>
              <Text style={styles.pickerValue}>{day}</Text>
              <TouchableOpacity onPress={() => setDay((d) => (d > 1 ? d - 1 : 31))} style={styles.arrowBtn}>
                <Text style={styles.arrow}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </OnboardingStep>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  pickerRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xl },
  pickerCol: { alignItems: 'center' },
  pickerLabel: { ...typography.captionBold, color: colors.textSecondary, marginBottom: spacing.md, textTransform: 'uppercase' },
  scrollCol: { alignItems: 'center', backgroundColor: colors.surfaceAlt, borderRadius: radii.lg, padding: spacing.md, width: 90 },
  arrowBtn: { padding: spacing.sm },
  arrow: { fontSize: 18, color: colors.primary },
  pickerValue: { ...typography.h2, color: colors.text, paddingVertical: spacing.sm },
});
