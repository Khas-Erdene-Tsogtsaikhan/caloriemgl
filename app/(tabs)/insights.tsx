import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';
import { useNutrioStore } from '@/src/store';
import { colors, spacing, typography, radii, shadows } from '@/src/theme/tokens';
import { getWeekDates, getMonthDates, getDayLabel, formatDateShort } from '@/src/utils/date';
import Card from '@/src/components/ui/Card';

type Period = 'week' | 'month';

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>('week');
  const getCaloriesForDate = useNutrioStore((s) => s.getCaloriesForDate);
  const getWaterForDate = useNutrioStore((s) => s.getWaterForDate);
  const weightEntries = useNutrioStore((s) => s.weightEntries);
  const profile = useNutrioStore((s) => s.profile);

  const dates = period === 'week' ? getWeekDates() : getMonthDates();
  const calorieData = dates.map((d) => ({ date: d, value: getCaloriesForDate(d) }));
  const waterData = dates.map((d) => ({ date: d, value: getWaterForDate(d) }));
  const dailyGoal = profile?.dailyCalorieGoal ?? 2000;

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
          onPress={() => setPeriod('week')}
        >
          <Text style={[styles.toggleText, period === 'week' && styles.toggleTextActive]}>Weekly</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, period === 'month' && styles.toggleBtnActive]}
          onPress={() => setPeriod('month')}
        >
          <Text style={[styles.toggleText, period === 'month' && styles.toggleTextActive]}>Monthly</Text>
        </TouchableOpacity>
      </View>

      {/* Calories Chart */}
      <Card style={styles.chartCard}>
        <Text style={styles.chartTitle}>🔥 Calories Consumed</Text>
        <BarChart data={calorieData} maxValue={dailyGoal * 1.5} color={colors.primary} period={period} goalLine={dailyGoal} />
      </Card>

      {/* Water Chart */}
      <Card style={styles.chartCard}>
        <Text style={styles.chartTitle}>💧 Water Intake (ml)</Text>
        <BarChart data={waterData} maxValue={3000} color={colors.waterColor} period={period} goalLine={2000} />
      </Card>

      {/* Weight Trend */}
      <Card style={styles.chartCard}>
        <Text style={styles.chartTitle}>⚖️ Weight History</Text>
        {weightEntries.length === 0 ? (
          <Text style={styles.emptyText}>No weight entries yet. Log your weight to see trends.</Text>
        ) : (
          <View style={styles.weightList}>
            {weightEntries.slice(-7).reverse().map((w) => (
              <View key={w.id} style={styles.weightRow}>
                <Text style={styles.weightDate}>{formatDateShort(w.date)}</Text>
                <Text style={styles.weightValue}>{w.weightKg} kg</Text>
                <Text style={styles.weightBmi}>BMI {w.bmi}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

interface BarChartProps {
  data: { date: string; value: number }[];
  maxValue: number;
  color: string;
  period: Period;
  goalLine?: number;
}

function BarChart({ data, maxValue, color, period, goalLine }: BarChartProps) {
  const chartWidth = 320;
  const chartHeight = 160;
  const padding = { top: 10, bottom: 24, left: 0, right: 0 };
  const drawWidth = chartWidth - padding.left - padding.right;
  const drawHeight = chartHeight - padding.top - padding.bottom;

  const barCount = data.length;
  const barWidth = period === 'week' ? Math.min(drawWidth / barCount - 6, 32) : Math.max(drawWidth / barCount - 1, 2);
  const gap = (drawWidth - barWidth * barCount) / (barCount + 1);

  const effectiveMax = Math.max(maxValue, ...data.map((d) => d.value), 1);

  return (
    <View style={styles.chartContainer}>
      <Svg width={chartWidth} height={chartHeight}>
        {/* Goal line */}
        {goalLine && goalLine > 0 && (
          <>
            <Line
              x1={padding.left}
              y1={padding.top + drawHeight * (1 - goalLine / effectiveMax)}
              x2={chartWidth - padding.right}
              y2={padding.top + drawHeight * (1 - goalLine / effectiveMax)}
              stroke={colors.textTertiary}
              strokeWidth={1}
              strokeDasharray="4,4"
            />
            <SvgText
              x={chartWidth - padding.right - 2}
              y={padding.top + drawHeight * (1 - goalLine / effectiveMax) - 4}
              fontSize={9}
              fill={colors.textTertiary}
              textAnchor="end"
            >
              Goal
            </SvgText>
          </>
        )}

        {/* Bars */}
        {data.map((d, i) => {
          const barHeight = d.value > 0 ? Math.max((d.value / effectiveMax) * drawHeight, 2) : 0;
          const x = padding.left + gap + i * (barWidth + gap);
          const y = padding.top + drawHeight - barHeight;

          return (
            <React.Fragment key={d.date}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={barWidth > 6 ? 4 : 1}
                fill={d.value > 0 ? color : colors.borderLight}
              />
              {period === 'week' && (
                <SvgText
                  x={x + barWidth / 2}
                  y={chartHeight - 4}
                  fontSize={10}
                  fill={colors.textTertiary}
                  textAnchor="middle"
                >
                  {getDayLabel(d.date)}
                </SvgText>
              )}
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.huge },
  screenTitle: { ...typography.h1, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.md },
  toggle: { flexDirection: 'row', backgroundColor: colors.surfaceAlt, borderRadius: radii.lg, padding: 4, marginBottom: spacing.xl },
  toggleBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: radii.md, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: colors.surface, ...shadows.sm },
  toggleText: { ...typography.bodyBold, color: colors.textTertiary },
  toggleTextActive: { color: colors.text },
  chartCard: { marginBottom: spacing.lg },
  chartTitle: { ...typography.bodyBold, color: colors.text, marginBottom: spacing.md },
  chartContainer: { alignItems: 'center' },
  emptyText: { ...typography.body, color: colors.textTertiary, textAlign: 'center', paddingVertical: spacing.xl },
  weightList: { gap: spacing.sm },
  weightRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  weightDate: { ...typography.body, color: colors.textSecondary, flex: 1 },
  weightValue: { ...typography.bodyBold, color: colors.text, flex: 1, textAlign: 'center' },
  weightBmi: { ...typography.caption, color: colors.textTertiary, flex: 1, textAlign: 'right' },
});
