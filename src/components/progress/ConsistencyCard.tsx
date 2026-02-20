import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Card from '@/src/components/ui/Card';
import { useFoodStore } from '@/store/useFoodStore';
import { getStreak } from '@/lib/utils/streak';
import { colors, radii, shadows, spacing, typography } from '@/src/theme/tokens';
import { addDays, getDayLabel, getTodayString } from '@/src/utils/date';

function getStreakMessage(streak: number): string {
  if (streak === 0) return 'Log today to start your streak!';
  if (streak === 1) return 'Great start!';
  if (streak < 5) return 'Keep it up!';
  if (streak < 10) return "You're on fire!";
  return 'Incredible consistency!';
}

export default function ConsistencyCard() {
  const logsByDay = useFoodStore((s) => s.logsByDay);

  const today = getTodayString();

  const logDates = useMemo(() => {
    const dates: string[] = [];
    for (const date of Object.keys(logsByDay)) {
      const logs = logsByDay[date];
      if (logs && logs.length > 0) dates.push(date);
    }
    return dates;
  }, [logsByDay]);

  const streak = getStreak(logDates, today);

  const weekDates = useMemo(() => {
    const d = new Date(today + 'T12:00:00');
    const dayOfWeek = d.getDay();
    const toMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = addDays(today, toMonday);
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) dates.push(addDays(monday, i));
    return dates;
  }, [today]);

  const daysLoggedThisWeek = weekDates.filter((d) => {
    const logs = logsByDay[d];
    return logs && logs.length > 0;
  }).length;

  const weekPct = Math.round((daysLoggedThisWeek / 7) * 100);

  return (
    <Card style={styles.card}>
      <Text style={styles.header}>Consistency</Text>
      <View style={styles.streakBlock}>
        <View style={styles.streakRow}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <View>
            <Text style={styles.streakValue}>{streak}</Text>
            <Text style={styles.streakLabel}>day streak</Text>
          </View>
        </View>
        <Text style={styles.streakMessage}>{getStreakMessage(streak)}</Text>
      </View>
      <View style={styles.weekBlock}>
        <View style={styles.weekHeader}>
          <Text style={styles.weekTitle}>This week</Text>
          <View style={styles.weekBadge}>
            <Text style={styles.weekBadgeText}>{weekPct}%</Text>
          </View>
        </View>
        <Text style={styles.weekSubtitle}>
          {daysLoggedThisWeek} of 7 days logged
        </Text>
        <View style={styles.weekRow}>
          {weekDates.map((d) => {
            const hasLog = (logsByDay[d] ?? []).length > 0;
            const dayName = getDayLabel(d);
            const isToday = d === today;
            return (
              <View key={d} style={styles.dayCol}>
                <View
                  style={[
                    styles.dayCircle,
                    hasLog && styles.dayCircleFilled,
                    isToday && styles.dayCircleToday,
                  ]}
                >
                  {hasLog && <Text style={styles.dayCheck}>✓</Text>}
                </View>
                <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
                  {dayName.slice(0, 2)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.lg },
  header: { ...typography.h3, color: colors.text, marginBottom: spacing.lg },
  streakBlock: {
    backgroundColor: colors.secondaryMuted,
    borderRadius: radii.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
    ...shadows.sm,
  },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  streakEmoji: { fontSize: 36 },
  streakValue: { ...typography.h1, color: colors.text },
  streakLabel: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  streakMessage: { ...typography.body, color: colors.textSecondary, marginTop: spacing.md },
  weekBlock: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.lg,
    padding: spacing.xl,
    ...shadows.sm,
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  weekTitle: { ...typography.bodyBold, color: colors.text },
  weekBadge: {
    backgroundColor: colors.primaryMuted,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.full,
  },
  weekBadgeText: { ...typography.captionBold, color: colors.primary },
  weekSubtitle: { ...typography.caption, color: colors.textTertiary, marginBottom: spacing.lg },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol: { alignItems: 'center', flex: 1 },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.borderLight,
    marginBottom: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleFilled: {
    backgroundColor: colors.primary,
  },
  dayCircleToday: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dayCheck: { color: colors.textInverse, fontSize: 14, fontWeight: '700' },
  dayLabel: { ...typography.small, color: colors.textTertiary },
  dayLabelToday: { color: colors.primary, fontWeight: '600' },
});
