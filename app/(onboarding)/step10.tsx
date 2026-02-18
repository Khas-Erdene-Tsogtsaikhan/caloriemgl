import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import { colors, spacing, typography } from '@/src/theme/tokens';
import { useNutrioStore } from '@/src/store';
import { GOAL_LABELS, ACTIVITY_LABELS } from '@/src/data/presets';

export default function Step10() {
  const insets = useSafeAreaInsets();
  const profile = useNutrioStore((s) => s.profile);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}>
      <View style={styles.center}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>Your plan is ready!</Text>
        <Text style={styles.subtitle}>Here's what we've set up for you, {profile?.name}.</Text>

        <Card style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Daily calorie goal</Text>
            <Text style={styles.value}>{profile?.dailyCalorieGoal ?? 2000} kcal</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Goal</Text>
            <Text style={styles.value}>{GOAL_LABELS[profile?.goal ?? 'maintain_weight']}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Activity</Text>
            <Text style={styles.value}>{ACTIVITY_LABELS[profile?.activityLevel ?? 'moderately_active']}</Text>
          </View>
        </Card>
      </View>
      <Button
        title="Continue"
        onPress={() => {
          useNutrioStore.getState().updateProfile({ onboardingCompleted: true });
          router.replace('/(tabs)/home');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.xxl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emoji: { fontSize: 56, marginBottom: spacing.lg },
  title: { ...typography.h1, color: colors.text, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.xxxl },
  card: { width: '100%' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  label: { ...typography.body, color: colors.textSecondary },
  value: { ...typography.bodyBold, color: colors.text },
  divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: spacing.sm },
});
