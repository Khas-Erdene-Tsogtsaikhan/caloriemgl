import BmiRangeBar from '@/src/components/health/BmiRangeBar';
import CaloriesBarChart from '@/src/components/insights/CaloriesBarChart';
import RangeSwitcher from '@/src/components/insights/RangeSwitcher';
import Card from '@/src/components/ui/Card';
import ProgressBar from '@/src/components/ui/ProgressBar';
import { useNutrioStore } from '@/src/store';
import { colors, radii, shadows, spacing, typography } from '@/src/theme/tokens';
import { calcBMI } from '@/src/utils/bmi';
import { addDays, getDayLabel, getMonthDatesFrom, getTodayString, getWeekDatesFrom } from '@/src/utils/date';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Period = 'week' | 'month';
type InsightTab = 'calories' | 'macros';

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>('week');
  const [insightTab, setInsightTab] = useState<InsightTab>('calories');
  // Raw reactive arrays — these trigger re-render on any CRUD
  const foodEntries = useNutrioStore((s) => s.foodEntries);
  const activityEntries = useNutrioStore((s) => s.activityEntries);
  const weightEntries = useNutrioStore((s) => s.weightEntries);
  const profile = useNutrioStore((s) => s.profile);

  const today = getTodayString();
  const [rangeEnd, setRangeEnd] = useState(today);
  const [selectedBarIdx, setSelectedBarIdx] = useState<number | null>(null);

  const step = period === 'week' ? 7 : 30;
  const dates = period === 'week' ? getWeekDatesFrom(rangeEnd) : getMonthDatesFrom(rangeEnd);
  const rangeStart = dates[0];
  const dailyGoal = profile?.dailyCalorieGoal ?? 2000;

  // Reactive derived data from raw arrays
  const calorieData = useMemo(
    () => dates.map((d) => ({
      date: d,
      value: foodEntries.filter((e) => e.date === d).reduce((s, e) => s + e.calories * e.quantity, 0),
    })),
    [dates, foodEntries]
  );

  const macrosByDay = useMemo(
    () => dates.map((d) => {
      const dayE = foodEntries.filter((e) => e.date === d);
      return {
        date: d,
        protein: Math.round(dayE.reduce((s, e) => s + (e.protein_g ?? 0) * e.quantity, 0)),
        carbs: Math.round(dayE.reduce((s, e) => s + (e.carbs_g ?? 0) * e.quantity, 0)),
        fat: Math.round(dayE.reduce((s, e) => s + (e.fat_g ?? 0) * e.quantity, 0)),
      };
    }),
    [dates, foodEntries]
  );

  const macroTotals = useMemo(
    () => macrosByDay.reduce(
      (acc, m) => ({ protein: acc.protein + m.protein, carbs: acc.carbs + m.carbs, fat: acc.fat + m.fat }),
      { protein: 0, carbs: 0, fat: 0 }
    ),
    [macrosByDay]
  );

  const proteinData = useMemo(() => macrosByDay.map((m) => ({ date: m.date, value: m.protein })), [macrosByDay]);
  const carbsData = useMemo(() => macrosByDay.map((m) => ({ date: m.date, value: m.carbs })), [macrosByDay]);
  const fatData = useMemo(() => macrosByDay.map((m) => ({ date: m.date, value: m.fat })), [macrosByDay]);

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

  const currentWeight = profile?.currentWeightKg ?? 0;
  const heightCm = profile?.heightCm ?? 170;
  const bmi = calcBMI(heightCm, currentWeight);

  // Weight data for chart
  const weightChartData = useMemo(() => {
    const sorted = [...weightEntries].sort((a, b) => a.date.localeCompare(b.date));
    return sorted
      .filter((w) => w.date >= rangeStart && w.date <= rangeEnd)
      .map((w) => ({ date: w.date, value: w.weightKg }));
  }, [weightEntries, rangeStart, rangeEnd]);

  const shiftRange = (dir: number) => {
    setRangeEnd(addDays(rangeEnd, dir * step));
    setSelectedBarIdx(null);
  };

  const handlePeriodChange = (p: Period) => {
    setPeriod(p);
    setRangeEnd(today);
    setSelectedBarIdx(null);
  };

  // Week strip dates (always show current week around rangeEnd)
  const weekStripDates = useMemo(() => getWeekDatesFrom(rangeEnd), [rangeEnd]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.screenTitle}>Insights</Text>

      {/* Period Toggle */}
      <View style={styles.toggle}>
        <TouchableOpacity
          style={[styles.toggleBtn, period === 'week' && styles.toggleBtnActive]}
          onPress={() => handlePeriodChange('week')}
        >
          <Text style={[styles.toggleText, period === 'week' && styles.toggleTextActive]}>Weekly</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, period === 'month' && styles.toggleBtnActive]}
          onPress={() => handlePeriodChange('month')}
        >
          <Text style={[styles.toggleText, period === 'month' && styles.toggleTextActive]}>Monthly</Text>
        </TouchableOpacity>
      </View>

      {/* Range Switcher */}
      <RangeSwitcher
        startDate={rangeStart}
        endDate={rangeEnd}
        onPrev={() => shiftRange(-1)}
        onNext={() => shiftRange(1)}
      />

      {/* Week Strip Calendar */}
      {period === 'week' && (
        <View style={styles.weekStrip}>
          {weekStripDates.map((d) => {
            const dayNum = d.split('-')[2];
            const isSelected = selectedDay === d;
            const dayCals = foodEntries.filter((e) => e.date === d).reduce((s, e) => s + e.calories * e.quantity, 0);
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
      )}

      {/* Selected day callout */}
      {selectedDay && (
        <Card style={styles.dayCallout}>
          <Text style={styles.dayCalloutTitle}>{selectedDay}</Text>
          <Text style={styles.dayCalloutValue}>
            {foodEntries.filter((e) => e.date === selectedDay).reduce((s, e) => s + e.calories * e.quantity, 0)} kcal eaten
            {' · '}
            {activityEntries.filter((a) => a.date === selectedDay).reduce((s, a) => s + a.caloriesBurned, 0)} burned
          </Text>
        </Card>
      )}

      {/* Insight Tab: Calories / Macros */}
      <View style={styles.insightTabs}>
        <TouchableOpacity
          style={[styles.insightTab, insightTab === 'calories' && styles.insightTabActive]}
          onPress={() => setInsightTab('calories')}
        >
          <Text style={[styles.insightTabText, insightTab === 'calories' && styles.insightTabTextActive]}>🔥 Calories</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.insightTab, insightTab === 'macros' && styles.insightTabActive]}
          onPress={() => setInsightTab('macros')}
        >
          <Text style={[styles.insightTabText, insightTab === 'macros' && styles.insightTabTextActive]}>🥩 Macros</Text>
        </TouchableOpacity>
      </View>

      {insightTab === 'calories' && (
        <>
          <Card style={styles.chartCard}>
            <Text style={styles.chartTitle}>Calories Consumed</Text>
            <CaloriesBarChart
              data={calorieData}
              maxValue={dailyGoal * 1.5}
              color={colors.primary}
              goalLine={dailyGoal}
              selectedIndex={selectedBarIdx}
              onSelectIndex={setSelectedBarIdx}
              showDayLabels={period === 'week'}
            />
            {selectedBarIdx != null && calorieData[selectedBarIdx] && (
              <Text style={styles.selectedLabel}>
                {calorieData[selectedBarIdx].date}: {calorieData[selectedBarIdx].value} kcal
              </Text>
            )}
          </Card>

          {/* Summary Cards */}
          <View style={styles.summaryRow}>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{avgCalories}</Text>
              <Text style={styles.summaryLabel}>Avg kcal</Text>
            </Card>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{daysOnTarget}</Text>
              <Text style={styles.summaryLabel}>On target</Text>
            </Card>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{avgProtein}g</Text>
              <Text style={styles.summaryLabel}>Avg protein</Text>
            </Card>
          </View>
        </>
      )}

      {insightTab === 'macros' && (
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Macronutrient Totals</Text>
          <View style={styles.macroSummary}>
            <MacroSummaryRow label="Protein" value={macroTotals.protein} color={colors.proteinColor} max={Math.max(macroTotals.protein, macroTotals.carbs, macroTotals.fat, 1)} />
            <MacroSummaryRow label="Carbs" value={macroTotals.carbs} color={colors.carbColor} max={Math.max(macroTotals.protein, macroTotals.carbs, macroTotals.fat, 1)} />
            <MacroSummaryRow label="Fat" value={macroTotals.fat} color={colors.fatColor} max={Math.max(macroTotals.protein, macroTotals.carbs, macroTotals.fat, 1)} />
          </View>

          <Text style={[styles.chartSubtitle, { marginTop: spacing.lg }]}>Protein (daily)</Text>
          <CaloriesBarChart data={proteinData} maxValue={Math.max(...proteinData.map((d) => d.value), 50)} color={colors.proteinColor} showDayLabels={period === 'week'} />

          <Text style={[styles.chartSubtitle, { marginTop: spacing.lg }]}>Carbs (daily)</Text>
          <CaloriesBarChart data={carbsData} maxValue={Math.max(...carbsData.map((d) => d.value), 100)} color={colors.carbColor} showDayLabels={period === 'week'} />

          <Text style={[styles.chartSubtitle, { marginTop: spacing.lg }]}>Fat (daily)</Text>
          <CaloriesBarChart data={fatData} maxValue={Math.max(...fatData.map((d) => d.value), 50)} color={colors.fatColor} showDayLabels={period === 'week'} />
        </Card>
      )}

      {/* Weight Trend Chart */}
      <Card style={styles.chartCard}>
        <Text style={styles.chartTitle}>⚖️ Weight Trend</Text>
        {weightChartData.length === 0 ? (
          <Text style={styles.emptyText}>No weight entries in this range.</Text>
        ) : (
          <CaloriesBarChart
            data={weightChartData}
            maxValue={Math.max(...weightChartData.map((d) => d.value)) + 5}
            color={colors.secondary}
            goalLine={profile?.targetWeightKg}
            showDayLabels={weightChartData.length <= 7}
          />
        )}
      </Card>

      {/* BMI Range Bar */}
      <Card style={styles.chartCard}>
        <Text style={styles.chartTitle}>BMI</Text>
        <BmiRangeBar bmi={bmi} />
      </Card>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

function MacroSummaryRow({ label, value, color, max }: { label: string; value: number; color: string; max: number }) {
  return (
    <View style={styles.macroSumRow}>
      <View style={styles.macroSumLabel}>
        <View style={[styles.macroSumDot, { backgroundColor: color }]} />
        <Text style={styles.macroSumText}>{label}</Text>
        <Text style={styles.macroSumValue}>{value}g</Text>
      </View>
      <ProgressBar progress={value / max} color={color} height={6} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.huge },
  screenTitle: { ...typography.h1, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.md },
  toggle: { flexDirection: 'row', backgroundColor: colors.surfaceAlt, borderRadius: radii.sm, padding: 3, marginBottom: spacing.lg },
  toggleBtn: { flex: 1, paddingVertical: spacing.sm + 2, borderRadius: radii.xs + 2, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: colors.surface, ...shadows.sm },
  toggleText: { ...typography.bodyBold, color: colors.textTertiary },
  toggleTextActive: { color: colors.text },
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
  emptyText: { ...typography.caption, color: colors.textTertiary, textAlign: 'center', paddingVertical: spacing.xl },
  summaryRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  summaryCard: { flex: 1, alignItems: 'center', paddingVertical: spacing.md },
  summaryValue: { ...typography.h3, color: colors.primary },
  summaryLabel: { ...typography.small, color: colors.textTertiary, marginTop: 2 },
  macroSummary: { gap: spacing.md },
  macroSumRow: { gap: 4 },
  macroSumLabel: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  macroSumDot: { width: 8, height: 8, borderRadius: 4 },
  macroSumText: { ...typography.caption, color: colors.textSecondary, flex: 1 },
  macroSumValue: { ...typography.captionBold, color: colors.text },
});
