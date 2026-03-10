import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { colors } from '@/src/theme/tokens';
import { getDayLabel } from '@/src/utils/date';

export interface MacroDayDatum {
  date: string;
  protein: number;
  carbs: number;
  fat: number;
}

interface MacrosStackedBarChartProps {
  data: MacroDayDatum[];
}

const Y_AXIS_PADDING = 36;

function getTickValues(maxValue: number): number[] {
  const rawMax = Math.max(maxValue, 1);
  const step = rawMax <= 50 ? 25 : rawMax <= 150 ? 50 : rawMax <= 300 ? 100 : 50;
  const ticks: number[] = [0];
  for (let v = step; v < rawMax; v += step) ticks.push(v);
  ticks.push(Math.ceil(rawMax / step) * step || rawMax);
  return [...new Set(ticks)].sort((a, b) => a - b);
}

/** Returns Mongolian day abbreviation: Ня, Да, Мя, Лх, Пү, Ба, Бя */
function getChartDayLabel(dateStr: string): string {
  return getDayLabel(dateStr);
}

export default function MacrosStackedBarChart({ data }: MacrosStackedBarChartProps) {
  const chartWidth = 320;
  const chartHeight = 180;
  const padding = { top: 14, bottom: 26, left: Y_AXIS_PADDING, right: 8 };
  const drawWidth = chartWidth - padding.left - padding.right;
  const drawHeight = chartHeight - padding.top - padding.bottom;

  const barCount = data.length;
  const barWidth = Math.min(drawWidth / Math.max(barCount, 1) - 6, 32);
  const gap = barCount > 0 ? (drawWidth - barWidth * barCount) / (barCount + 1) : 0;

  const maxSum = Math.max(
    ...data.map((d) => d.protein + d.carbs + d.fat),
    50
  );
  const tickValues = getTickValues(maxSum);

  return (
    <View style={styles.container}>
      <View style={styles.legend}>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: colors.proteinColor }]} />
          <Text style={styles.legendText}>Уураг</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: colors.carbColor }]} />
          <Text style={styles.legendText}>Нүүрс ус</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: colors.fatColor }]} />
          <Text style={styles.legendText}>Өөх тос</Text>
        </View>
      </View>
      <Svg width={chartWidth} height={chartHeight}>
        {tickValues.map((tick) => {
          const y = padding.top + drawHeight * (1 - tick / maxSum);
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
          const segments = [
            { value: d.protein, color: colors.proteinColor },
            { value: d.carbs, color: colors.carbColor },
            { value: d.fat, color: colors.fatColor },
          ];
          let yOffset = padding.top + drawHeight;

          return (
            <React.Fragment key={d.date}>
              {segments.map((seg) => {
                if (seg.value <= 0) return null;
                const height = (seg.value / maxSum) * drawHeight;
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
    gap: 16,
    marginBottom: 8,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, color: colors.textSecondary },
});
