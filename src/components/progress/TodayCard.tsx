import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Card from '@/src/components/ui/Card';
import { useNutrioStore } from '@/src/store';
import { useFoodStore } from '@/store/useFoodStore';
import { colors, radii, shadows, spacing, typography } from '@/src/theme/tokens';
import { getTodayString } from '@/src/utils/date';

function MacroPill({
  label,
  value,
  color,
  target,
}: {
  label: string;
  value: number;
  color: string;
  target: number;
}) {
  const pct = target > 0 ? Math.min(value / target, 1.2) : 0;
  return (
    <View style={[styles.macroPill, { borderLeftColor: color }]}>
      <Text style={styles.macroPillLabel}>{label}</Text>
      <Text style={styles.macroPillValue}>{value}g</Text>
      {target > 0 && (
        <View style={styles.macroPillBar}>
          <View
            style={[
              styles.macroPillFill,
              { width: `${Math.min(pct * 100, 100)}%`, backgroundColor: color },
            ]}
          />
        </View>
      )}
    </View>
  );
}

export default function TodayCard() {
  const profile = useNutrioStore((s) => s.profile);
  const logsByDay = useFoodStore((s) => s.logsByDay);

  const today = getTodayString();
  const dayLogs = logsByDay[today] ?? [];
  const dailyGoal = profile?.dailyCalorieGoal ?? 2000;

  const consumed = useMemo(
    () => dayLogs.reduce((s, e) => s + e.calories, 0),
    [dayLogs]
  );
  const remaining = Math.max(dailyGoal - consumed, 0);
  const over = consumed > dailyGoal ? consumed - dailyGoal : 0;
  const progress = dailyGoal > 0 ? Math.min(consumed / dailyGoal, 1.2) : 0;

  const macros = useMemo(
    () => ({
      protein: Math.round(dayLogs.reduce((s, e) => s + e.protein_g, 0)),
      carbs: Math.round(dayLogs.reduce((s, e) => s + e.carbs_g, 0)),
      fat: Math.round(dayLogs.reduce((s, e) => s + e.fat_g, 0)),
    }),
    [dayLogs]
  );
  const proteinTarget = Math.round(dailyGoal * 0.3 / 4);
  const carbsTarget = Math.round(dailyGoal * 0.45 / 4);
  const fatTarget = Math.round(dailyGoal * 0.25 / 9);

  return (
    <Card style={styles.card}>
      <Text style={styles.header}>Today</Text>
      <View style={styles.calorieBlock}>
        <View style={styles.calorieMain}>
          <Text style={styles.remainingValue}>
            {over > 0 ? `+${over}` : remaining}
          </Text>
          <Text style={styles.remainingLabel}>
            {over > 0 ? 'over goal' : 'kcal remaining'}
          </Text>
        </View>
        <View style={styles.calorieBarWrap}>
          <View style={styles.calorieBar}>
            <View
              style={[
                styles.calorieBarFill,
                {
                  width: `${progress * 100}%`,
                  backgroundColor: over > 0 ? colors.warning : colors.primary,
                },
              ]}
            />
          </View>
          <View style={styles.calorieMeta}>
            <Text style={styles.calorieConsumed}>{consumed} eaten</Text>
            <Text style={styles.calorieGoal}>{dailyGoal} goal</Text>
          </View>
        </View>
      </View>
      <View style={styles.macroGrid}>
        <MacroPill label="Protein" value={macros.protein} color={colors.proteinColor} target={proteinTarget} />
        <MacroPill label="Carbs" value={macros.carbs} color={colors.carbColor} target={carbsTarget} />
        <MacroPill label="Fat" value={macros.fat} color={colors.fatColor} target={fatTarget} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.lg },
  header: { ...typography.h3, color: colors.text, marginBottom: spacing.lg },
  calorieBlock: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  calorieMain: { alignItems: 'center', marginBottom: spacing.lg },
  remainingValue: {
    ...typography.big,
    color: colors.primary,
    fontSize: 44,
    letterSpacing: -1,
  },
  remainingLabel: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  calorieBarWrap: {},
  calorieBar: {
    height: 10,
    backgroundColor: colors.borderLight,
    borderRadius: radii.full,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  calorieBarFill: { height: '100%', borderRadius: radii.full },
  calorieMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calorieConsumed: { ...typography.small, color: colors.textSecondary },
  calorieGoal: { ...typography.small, color: colors.textTertiary },
  macroGrid: { flexDirection: 'row', gap: spacing.md },
  macroPill: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.border,
    ...shadows.sm,
  },
  macroPillLabel: { ...typography.small, color: colors.textTertiary, marginBottom: 2 },
  macroPillValue: { ...typography.bodyBold, color: colors.text },
  macroPillBar: {
    height: 4,
    backgroundColor: colors.borderLight,
    borderRadius: 2,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  macroPillFill: { height: '100%', borderRadius: 2 },
});
