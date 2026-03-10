import OnboardingStep from '@/src/components/onboarding/OnboardingStep';
import { useNutrioStore } from '@/src/store';
import { colors, radii, spacing, typography } from '@/src/theme/tokens';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Step3() {
  const insets = useSafeAreaInsets();
  const [year, setYear] = useState(2000);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);

  const months = ['1-р сар','2-р сар','3-р сар','4-р сар','5-р сар','6-р сар','7-р сар','8-р сар','9-р сар','10-р сар','11-р сар','12-р сар'];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <OnboardingStep
        step={3}
        totalSteps={8}
        title="Төрсөн он?"
        onNext={() => {
          const birthdate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          useNutrioStore.getState().updateProfile({ birthdate });
          router.push('/(onboarding)/step4');
        }}
        onBack={() => router.back()}
      >
        <View style={styles.pickerRow}>
          <View style={styles.pickerCol}>
            <Text style={styles.pickerLabel}>Жил</Text>
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
            <Text style={styles.pickerLabel}>Сар</Text>
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
            <Text style={styles.pickerLabel}>Өдөр</Text>
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
