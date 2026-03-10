import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { MEAL_LABELS } from '@/src/data/presets';
import { colors } from '@/src/theme/tokens';
import { getDayLabel } from '@/src/utils/date';

export interface CaloriesByMealDatum {
  date: string;
  breakfast: number;
  lunch: number;
  dinner: number;
  snack: number;
}

const MEAL_COLORS: Record<string, string> = {
  breakfast: colors.primary,
  lunch: colors.primaryLight,
  dinner: colors.primaryDark,
  snack: colors.secondary,
};

const Y_AXIS_PADDING = 44;
const DEFAULT_MAX_CAL = 3000;

function getTickValues(maxValue: number): number[] {
  const rawMax = Math.max(maxValue, DEFAULT_MAX_CAL);
  const step = 500;
  const ticks: number[] = [];
  for (let v = 0; v <= rawMax; v += step) ticks.push(v);
  return ticks;
}

/** Returns Mongolian day abbreviation: Ня, Да, Мя, Лх, Пү, Ба, Бя */
function getChartDayLabel(dateStr: string): string {
  return getDayLabel(dateStr);
}

interface CaloriesByMealStackedBarChartProps {
  data: CaloriesByMealDatum[];
  goal?: number;
}

export default function CaloriesByMealStackedBarChart({ data, goal }: CaloriesByMealStackedBarChartProps) {
  const chartWidth = 360;
  const chartHeight = 260;
  const padding = { top: 16, bottom: 28, left: Y_AXIS_PADDING, right: 10 };
  const drawWidth = chartWidth - padding.left - padding.right;
  const drawHeight = chartHeight - padding.top - padding.bottom;

  const barCount = data.length;
  const barWidth = barCount > 0 ? Math.min(drawWidth / barCount - 6, 36) : 24;
  const gap = barCount > 0 ? (drawWidth - barWidth * barCount) / (barCount + 1) : 0;

  const dataMax = data.length > 0
    ? Math.max(...data.map((d) => d.breakfast + d.lunch + d.dinner + d.snack), goal ?? 0)
    : 0;
  const maxCal = Math.max(dataMax, DEFAULT_MAX_CAL);
  const tickValues = getTickValues(maxCal);

  const segments = [
    { key: 'breakfast', color: MEAL_COLORS.breakfast },
    { key: 'lunch', color: MEAL_COLORS.lunch },
    { key: 'dinner', color: MEAL_COLORS.dinner },
    { key: 'snack', color: MEAL_COLORS.snack },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.legend}>
        {segments.map((seg) => (
          <View key={seg.key} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: seg.color }]} />
            <Text style={styles.legendText}>{MEAL_LABELS[seg.key] ?? seg.key}</Text>
          </View>
        ))}
      </View>
      <Svg width={chartWidth} height={chartHeight}>
        {tickValues.map((tick) => {
          const y = padding.top + drawHeight * (1 - tick / maxCal);
          return (
            <SvgText
              key={tick}
              x={padding.left - 6}
              y={y + 4}
              fontSize={10}
              fill={colors.textTertiary}
              textAnchor="end"
            >
              {tick}
            </SvgText>
          );
        })}

        {data.map((d, i) => {
          const x = padding.left + gap + i * (barWidth + gap);
          const daySegments = [
            { value: d.breakfast, color: MEAL_COLORS.breakfast },
            { value: d.lunch, color: MEAL_COLORS.lunch },
            { value: d.dinner, color: MEAL_COLORS.dinner },
            { value: d.snack, color: MEAL_COLORS.snack },
          ];
          let yOffset = padding.top + drawHeight;

          return (
            <React.Fragment key={d.date}>
              {daySegments.map((seg) => {
                if (seg.value <= 0) return null;
                const height = (seg.value / maxCal) * drawHeight;
                yOffset -= height;
                return (
                  <Rect
                    key={seg.color}
                    x={x}
                    y={yOffset}
                    width={barWidth}
                    height={Math.max(height, 1)}
                    rx={barWidth > 6 ? 2 : 0}
                    fill={seg.color}
                  />
                );
              })}
              <SvgText
                x={x + barWidth / 2}
                y={chartHeight - 4}
                fontSize={10}
                fill={colors.textTertiary}
                textAnchor="middle"
              >
                {getChartDayLabel(d.date)}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
    justifyContent: 'center',
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, color: colors.textSecondary },
});
