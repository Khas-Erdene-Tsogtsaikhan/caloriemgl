import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import TimelineChart from '@/src/components/progress/TimelineChart';
import { useNutrioStore } from '@/src/store';
import { colors, radii, shadows, spacing, typography } from '@/src/theme/tokens';
import type { Goal } from '@/src/types';
import { getTodayString } from '@/src/utils/date';
import { computePlanForProfile } from '@/src/utils/planCompute';
import {
  getPlanDescription,
  getProgressPct,
  getTargetDateFormatted,
  getTrendWeight,
  getOnTrackStatus,
  getWeeksElapsed,
  getWeeksLeftTimeBased,
  getWeeksTotal,
  type GoalType,
} from '@/lib/utils/goalTimeline';

function mapGoal(goal: Goal): GoalType {
  if (goal === 'lose_weight') return 'lose';
  if (goal === 'gain_weight' || goal === 'gain_muscle') return 'gain';
  return 'maintain';
}

function goalLabel(goal: GoalType): string {
  if (goal === 'lose') return 'Lose';
  if (goal === 'gain') return 'Gain';
  return 'Maintain';
}

interface GoalCardProps {
  onEditGoal: () => void;
  onCheckIn: () => void;
}

export default function GoalCard({ onEditGoal, onCheckIn }: GoalCardProps) {
  const profile = useNutrioStore((s) => s.profile);
  const weightEntries = useNutrioStore((s) => s.weightEntries);

  const goal = profile?.goal ?? 'maintain_weight';
  const goalType = mapGoal(goal);
  const currentWeight = profile?.currentWeightKg ?? 0;
  const targetWeight = profile?.targetWeightKg ?? 0;
  const today = getTodayString();

  const startDate = profile?.planStartDate ?? today;
  const startWeight = profile?.planStartWeightKg ?? currentWeight;
  let targetDate = profile?.planTargetDate;
  const pace = profile?.planPaceKgPerWeek ?? (goalType === 'lose' ? 0.5 : goalType === 'gain' ? 0.25 : 0);

  if (!targetDate && goalType !== 'maintain' && pace > 0) {
    const { planTargetDate } = computePlanForProfile(goal, startWeight, targetWeight, startDate);
    targetDate = planTargetDate;
  }

  const weeksTotal = targetDate ? getWeeksTotal(startDate, targetDate) : 0;
  const weeksElapsed = getWeeksElapsed(startDate, today);
  const weeksLeft = targetDate ? getWeeksLeftTimeBased(startDate, targetDate, today) : 0;
  const progressPct = targetDate ? getProgressPct(startDate, targetDate, today) : 0;

  const sortedWeights = [...weightEntries].sort((a, b) => a.date.localeCompare(b.date));
  const trendWeight = getTrendWeight(
    sortedWeights.map((e) => ({ date: e.date, weightKg: e.weightKg })),
    today
  );
  const displayWeight = trendWeight ?? currentWeight;

  const { status: onTrackStatus, message: onTrackMessage, etaDate } = getOnTrackStatus(
    sortedWeights.map((e) => ({ date: e.date, weightKg: e.weightKg })),
    startWeight,
    targetWeight,
    targetDate ?? today,
    today,
    goalType
  );

  const targetDisplay =
    goalType === 'maintain'
      ? '—'
      : targetWeight - startWeight < 0
        ? `${targetWeight - startWeight} kg`
        : `+${targetWeight - startWeight} kg`;

  const planDesc = getPlanDescription(goalType, pace > 0 ? pace : null);

  return (
    <Card style={styles.card}>
      <Text style={styles.header}>Your Goal & Plan</Text>
      <View style={styles.goalBadge}>
        <Text style={styles.goalType}>{goalLabel(goalType)}</Text>
        <Text style={styles.target}>{targetDisplay}</Text>
      </View>

      {goalType !== 'maintain' && weeksTotal > 0 && (
        <>
          <Text style={styles.planDesc}>{planDesc}</Text>

          <View style={styles.chartBlock}>
            <TimelineChart
              progress={progressPct}
              weeksElapsed={weeksElapsed}
              weeksTotal={weeksTotal}
              weeksLeft={weeksLeft}
              startWeight={startWeight}
              currentWeight={displayWeight}
              targetWeight={targetWeight}
              targetDateStr={targetDate ? getTargetDateFormatted(targetDate) : '—'}
              onTrackStatus={onTrackStatus}
              onTrackMessage={onTrackMessage}
              etaDateStr={etaDate && etaDate !== today ? getTargetDateFormatted(etaDate) : undefined}
            />
          </View>
        </>
      )}

      {goalType === 'maintain' && (
        <Text style={styles.maintainText}>{planDesc}</Text>
      )}

      <View style={styles.actions}>
        <Button title="Edit goal" variant="ghost" onPress={onEditGoal} style={styles.btn} />
        <Button title="Check-in" onPress={onCheckIn} style={styles.btn} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.lg },
  header: { ...typography.h3, color: colors.text, marginBottom: spacing.md },
  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryMuted,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.full,
    marginBottom: spacing.lg,
  },
  goalType: { ...typography.bodyBold, color: colors.primary },
  target: { ...typography.bodyBold, color: colors.textSecondary },
  planDesc: { ...typography.caption, color: colors.textTertiary, marginBottom: spacing.lg },
  chartBlock: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  maintainText: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  actions: { flexDirection: 'row', gap: spacing.sm },
  btn: { flex: 1 },
});
