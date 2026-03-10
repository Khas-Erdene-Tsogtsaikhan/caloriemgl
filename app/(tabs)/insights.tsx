import CaloriesByMealStackedBarChart from '@/src/components/insights/CaloriesByMealStackedBarChart';
import MacrosStackedBarChart from '@/src/components/insights/MacrosStackedBarChart';
import RangeSwitcher from '@/src/components/insights/RangeSwitcher';
import Card from '@/src/components/ui/Card';
import { useNutrioStore } from '@/src/store';
import { colors, radii, spacing, typography } from '@/src/theme/tokens';
import { addDays, getDayLabel, getTodayString, getWeekDatesFrom } from '@/src/utils/date';
import { useFoodStore } from '@/store/useFoodStore';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type InsightTab = 'calories' | 'macros';

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const [insightTab, setInsightTab] = useState<InsightTab>('calories');
  const logsByDay = useFoodStore((s) => s.logsByDay);
  const loadLogsForRange = useFoodStore((s) => s.loadLogsForRange);
  const activityEntries = useNutrioStore((s) => s.activityEntries);
  const profile = useNutrioStore((s) => s.profile);

  const today = getTodayString();
  const [rangeEnd, setRangeEnd] = useState(today);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const step = 7;
  const dates = getWeekDatesFrom(rangeEnd);
  const rangeStart = dates[0];
  const dailyGoal = profile?.dailyCalorieGoal ?? 2000;

  useEffect(() => {
    loadLogsForRange(rangeStart, rangeEnd);
  }, [rangeStart, rangeEnd, loadLogsForRange]);

  const sumDayLogs = (dayLogs: { calories: number }[]) =>
    dayLogs.reduce((s, e) => s + e.calories, 0);
  const sumDayProtein = (dayLogs: { protein_g: number }[]) =>
    dayLogs.reduce((s, e) => s + e.protein_g, 0);
  const sumDayCarbs = (dayLogs: { carbs_g: number }[]) =>
    dayLogs.reduce((s, e) => s + e.carbs_g, 0);
  const sumDayFat = (dayLogs: { fat_g: number }[]) =>
    dayLogs.reduce((s, e) => s + e.fat_g, 0);

  const calorieData = useMemo(
    () => dates.map((d) => ({
      date: d,
      value: Math.round(sumDayLogs(logsByDay[d] ?? [])),
    })),
    [dates, logsByDay]
  );

  const macrosByDay = useMemo(
    () => dates.map((d) => {
      const dayLogs = logsByDay[d] ?? [];
      return {
        date: d,
        protein: Math.round(sumDayProtein(dayLogs)),
        carbs: Math.round(sumDayCarbs(dayLogs)),
        fat: Math.round(sumDayFat(dayLogs)),
      };
    }),
    [dates, logsByDay]
  );

  const caloriesByMealByDay = useMemo(
    () => dates.map((d) => {
      const dayLogs = logsByDay[d] ?? [];
      const byMeal: Record<string, number> = { breakfast: 0, lunch: 0, dinner: 0, snack: 0 };
      dayLogs.forEach((log) => {
        if (byMeal[log.meal] !== undefined) {
          byMeal[log.meal] += log.calories;
        }
      });
      return {
        date: d,
        breakfast: Math.round(byMeal.breakfast),
        lunch: Math.round(byMeal.lunch),
        dinner: Math.round(byMeal.dinner),
        snack: Math.round(byMeal.snack),
      };
    }),
    [dates, logsByDay]
  );

  // Summary stats
  const avgCalories = useMemo(() => {
    const daysWithData = calorieData.filter((d) => d.value > 0);
    return daysWithData.length > 0 ? Math.round(daysWithData.reduce((s, d) => s + d.value, 0) / daysWithData.length) : 0;
  }, [calorieData]);
  const daysOnTarget = useMemo(
    () => calorieData.filter((d) => d.value > 0 && d.value <= dailyGoal * 1.1).length,
    [calorieData, dailyGoal]
  );
  const avgProtein = useMemo(() => {
    const daysWithData = macrosByDay.filter((d) => d.protein > 0);
    return daysWithData.length > 0 ? Math.round(daysWithData.reduce((s, d) => s + d.protein, 0) / daysWithData.length) : 0;
  }, [macrosByDay]);

  const shiftRange = (dir: number) => {
    setRangeEnd(addDays(rangeEnd, dir * step));
  };

  // Week strip dates (always show current week around rangeEnd)
  const weekStripDates = useMemo(() => getWeekDatesFrom(rangeEnd), [rangeEnd]);

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.screenTitle}>Статистик</Text>

      {/* Range Switcher */}
      <RangeSwitcher
        startDate={rangeStart}
        endDate={rangeEnd}
        onPrev={() => shiftRange(-1)}
        onNext={() => shiftRange(1)}
      />

      {/* Week Strip Calendar */}
      <View style={styles.weekStrip}>
          {weekStripDates.map((d) => {
            const dayNum = d.split('-')[2];
            const isSelected = selectedDay === d;
            const dayCals = sumDayLogs(logsByDay[d] ?? []);
            const hasData = dayCals > 0;
            return (
              <TouchableOpacity
                key={d}
                style={[styles.weekDay, isSelected && styles.weekDaySelected]}
                onPress={() => setSelectedDay(isSelected ? null : d)}
              >
                <Text style={[styles.weekDayLabel, isSelected && styles.weekDayLabelSelected]}>{getDayLabel(d)}</Text>
                <Text style={[styles.weekDayNum, isSelected && styles.weekDayNumSelected]}>{dayNum}</Text>
                {hasData && <View style={[styles.weekDayDot, isSelected && styles.weekDayDotSelected]} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected day callout */}
      {selectedDay && (
        <Card style={styles.dayCallout}>
          <Text style={styles.dayCalloutTitle}>{selectedDay}</Text>
          <Text style={styles.dayCalloutValue}>
            {sumDayLogs(logsByDay[selectedDay] ?? [])} калори идсэн
            {' · '}
            {activityEntries.filter((a) => a.date === selectedDay).reduce((s, a) => s + a.caloriesBurned, 0)} шатаасан
          </Text>
        </Card>
      )}

      {/* Insight Tab: Calories / Macros */}
      <View style={styles.insightTabs}>
        <TouchableOpacity
          style={[styles.insightTab, insightTab === 'calories' && styles.insightTabActive]}
          onPress={() => setInsightTab('calories')}
        >
          <Text style={[styles.insightTabText, insightTab === 'calories' && styles.insightTabTextActive]}>🔥 Калори</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.insightTab, insightTab === 'macros' && styles.insightTabActive]}
          onPress={() => setInsightTab('macros')}
        >
          <Text style={[styles.insightTabText, insightTab === 'macros' && styles.insightTabTextActive]}>🥩 Уураг/Нүүрс/Өөх</Text>
        </TouchableOpacity>
      </View>

      {insightTab === 'calories' && (
        <>
          <Card style={styles.chartCard}>
            <Text style={styles.chartTitle}>Энэ долоо хоногт</Text>
            <CaloriesByMealStackedBarChart data={caloriesByMealByDay} goal={dailyGoal} />
            <View style={styles.calorieSummary}>
              <Text style={styles.calorieSummaryRow}>
                Нийт: {calorieData.reduce((s, d) => s + d.value, 0)} калори
              </Text>
              <Text style={styles.calorieSummaryRow}>
                Зорилго: {dailyGoal}
              </Text>
            </View>
          </Card>

          {/* Summary Cards */}
          <View style={styles.summaryRow}>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{avgCalories}</Text>
              <Text style={styles.summaryLabel}>Дундаж калори</Text>
            </Card>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{daysOnTarget}</Text>
              <Text style={styles.summaryLabel}>Зорилгод хүрсэн</Text>
            </Card>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{avgProtein}g</Text>
              <Text style={styles.summaryLabel}>Дундаж уураг</Text>
            </Card>
          </View>
        </>
      )}

      {insightTab === 'macros' && (
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Уураг/Нүүрс ус/Өөх тос</Text>
          <MacrosStackedBarChart data={macrosByDay} />
        </Card>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.huge },
  screenTitle: { ...typography.h1, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.md },
  weekStrip: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg },
  weekDay: { alignItems: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, borderRadius: radii.md, minWidth: 40 },
  weekDaySelected: { backgroundColor: colors.primary },
  weekDayLabel: { ...typography.small, color: colors.textTertiary, marginBottom: 2 },
  weekDayLabelSelected: { color: colors.textInverse },
  weekDayNum: { ...typography.bodyBold, color: colors.text },
  weekDayNumSelected: { color: colors.textInverse },
  weekDayDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.primary, marginTop: 3 },
  weekDayDotSelected: { backgroundColor: colors.textInverse },
  dayCallout: { marginBottom: spacing.lg, paddingVertical: spacing.md },
  dayCalloutTitle: { ...typography.captionBold, color: colors.textSecondary },
  dayCalloutValue: { ...typography.body, color: colors.text, marginTop: 2 },
  insightTabs: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  insightTab: { flex: 1, paddingVertical: spacing.sm + 2, borderRadius: radii.sm, alignItems: 'center', backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  insightTabActive: { backgroundColor: colors.primaryMuted, borderColor: colors.primary },
  insightTabText: { ...typography.captionBold, color: colors.textTertiary },
  insightTabTextActive: { color: colors.primary },
  chartCard: { marginBottom: spacing.lg },
  chartTitle: { ...typography.bodyBold, color: colors.text, marginBottom: spacing.md },
  chartSubtitle: { ...typography.captionBold, color: colors.textSecondary, marginBottom: spacing.sm },
  selectedLabel: { ...typography.caption, color: colors.primary, textAlign: 'center', marginTop: spacing.sm },
  calorieSummary: { marginTop: spacing.lg, gap: spacing.xs },
  calorieSummaryRow: { ...typography.caption, color: colors.textSecondary },
  emptyText: { ...typography.caption, color: colors.textTertiary, textAlign: 'center', paddingVertical: spacing.xl },
  summaryRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  summaryCard: { flex: 1, alignItems: 'center', paddingVertical: spacing.md },
  summaryValue: { ...typography.h3, color: colors.primary },
  summaryLabel: { ...typography.small, color: colors.textTertiary, marginTop: 2 },
});
