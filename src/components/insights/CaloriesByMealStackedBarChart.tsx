import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect, Line, Text as SvgText } from 'react-native-svg';
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

const MUTED_BAR_COLOR = '#B8D4C4';
const EMPTY_BAR_COLOR = '#E8E8E6';
const MIN_BAR_HEIGHT = 6;
const TOP_CORNER_RADIUS = 4;

/** Path for a rect with only the top two corners rounded (subtle roundish top) */
function roundedTopRectPath(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.min(r, w / 2, h);
  return `M ${x + rr} ${y} L ${x + w - rr} ${y} Q ${x + w} ${y} ${x + w} ${y + rr} L ${x + w} ${y + h} L ${x} ${y + h} L ${x} ${y + rr} Q ${x} ${y} ${x + rr} ${y} Z`;
}
const Y_AXIS_PADDING = 44;
const DEFAULT_MAX_CAL = 3000;

function getTickValues(maxValue: number): number[] {
  const rawMax = Math.max(maxValue, DEFAULT_MAX_CAL);
  const step = 500;
  const ticks: number[] = [];
  for (let v = 0; v <= rawMax; v += step) ticks.push(v);
  return ticks;
}

function getChartDayLabel(dateStr: string): string {
  return getDayLabel(dateStr);
}

interface CaloriesByMealStackedBarChartProps {
  data: CaloriesByMealDatum[];
  goal?: number;
  selectedDay?: string | null;
  onSelectDay?: (date: string | null) => void;
  dates?: string[];
}

export default function CaloriesByMealStackedBarChart({
  data,
  goal,
  selectedDay = null,
  onSelectDay,
}: CaloriesByMealStackedBarChartProps) {
  const chartWidth = 360;
  const chartHeight = 260;
  const padding = { top: 20, bottom: 28, left: Y_AXIS_PADDING, right: 10 };
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

  const segmentKeys = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

  const selectedIndex = selectedDay ? data.findIndex((d) => d.date === selectedDay) : -1;

  return (
    <View style={styles.container}>
      <View style={styles.legend}>
        {segmentKeys.map((key) => (
          <View key={key} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: MEAL_COLORS[key] }]} />
            <Text style={styles.legendText}>{MEAL_LABELS[key] ?? key}</Text>
          </View>
        ))}
      </View>
      <View style={styles.chartWrapper}>
        <Svg width={chartWidth} height={chartHeight}>
          {/* Horizontal grid lines only */}
          {tickValues.slice(1).map((tick) => {
            const y = padding.top + drawHeight * (1 - tick / maxCal);
            return (
              <Line
                key={`grid-${tick}`}
                x1={padding.left}
                y1={y}
                x2={chartWidth - padding.right}
                y2={y}
                stroke={colors.borderLight}
                strokeWidth={1}
              />
            );
          })}

          {/* Y-axis labels - smaller and lighter */}
          {tickValues.map((tick) => {
            const y = padding.top + drawHeight * (1 - tick / maxCal);
            return (
              <SvgText
                key={tick}
                x={padding.left - 6}
                y={y + 3}
                fontSize={8}
                fill="#A0A3A8"
                textAnchor="end"
              >
                {tick}
              </SvgText>
            );
          })}

          {/* Bars */}
          {data.map((d, i) => {
            const total = d.breakfast + d.lunch + d.dinner + d.snack;
            const barHeight = total > 0
              ? Math.max((total / maxCal) * drawHeight, 4)
              : MIN_BAR_HEIGHT;
            const x = padding.left + gap + i * (barWidth + gap);
            const y = padding.top + drawHeight - barHeight;
            const isSelected = selectedDay === d.date;

            const daySegments = [
              { key: 'breakfast' as const, value: d.breakfast },
              { key: 'lunch' as const, value: d.lunch },
              { key: 'dinner' as const, value: d.dinner },
              { key: 'snack' as const, value: d.snack },
            ].filter((s) => s.value > 0);

            const getColor = (key: (typeof segmentKeys)[number]) => (isSelected ? MEAL_COLORS[key] : MUTED_BAR_COLOR);

            return (
              <React.Fragment key={d.date}>
                {/* Touch target */}
                <Rect
                  x={x - gap / 2}
                  y={padding.top}
                  width={barWidth + gap}
                  height={drawHeight}
                  fill="transparent"
                  onPress={() => onSelectDay?.(isSelected ? null : d.date)}
                />
                {total > 0 ? (
                  daySegments.map((seg, segIdx) => {
                    const height = Math.max((seg.value / maxCal) * drawHeight, 1);
                    const isTopSegment = segIdx === daySegments.length - 1;
                    let segY = padding.top + drawHeight;
                    for (let j = 0; j < segIdx; j++) {
                      segY -= (daySegments[j].value / maxCal) * drawHeight;
                    }
                    segY -= height;
                    if (isTopSegment && barWidth > 8) {
                      return (
                        <Path
                          key={seg.key}
                          d={roundedTopRectPath(x, segY, barWidth, height, TOP_CORNER_RADIUS)}
                          fill={getColor(seg.key)}
                          onPress={() => onSelectDay?.(isSelected ? null : d.date)}
                        />
                      );
                    }
                    return (
                      <Rect
                        key={seg.key}
                        x={x}
                        y={segY}
                        width={barWidth}
                        height={height}
                        fill={getColor(seg.key)}
                        onPress={() => onSelectDay?.(isSelected ? null : d.date)}
                      />
                    );
                  })
                ) : (
                  <Path
                    d={roundedTopRectPath(x, y, barWidth, barHeight, TOP_CORNER_RADIUS)}
                    fill={EMPTY_BAR_COLOR}
                    onPress={() => onSelectDay?.(isSelected ? null : d.date)}
                  />
                )}
                <SvgText
                  x={x + barWidth / 2}
                  y={chartHeight - 4}
                  fontSize={9}
                  fill={isSelected ? colors.text : colors.textTertiary}
                  fontWeight={isSelected ? '600' : '400'}
                  textAnchor="middle"
                >
                  {getChartDayLabel(d.date)}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>

        {/* Floating tooltip when bar is selected */}
        {selectedIndex >= 0 && data[selectedIndex] && (
          (() => {
            const d = data[selectedIndex];
            const total = d.breakfast + d.lunch + d.dinner + d.snack;
            const barHeight = total > 0
              ? Math.max((total / maxCal) * drawHeight, 4)
              : MIN_BAR_HEIGHT;
            const x = padding.left + gap + selectedIndex * (barWidth + gap);
            const barTop = padding.top + drawHeight - barHeight;
            const tooltipLeft = x + barWidth / 2 - 28;
            const tooltipTop = barTop - 36;
            return (
              <View
                style={[
                  styles.tooltip,
                  {
                    left: tooltipLeft,
                    top: tooltipTop,
                  },
                ]}
              >
                <Text style={styles.tooltipText}>{total} kcal</Text>
              </View>
            );
          })()
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
    justifyContent: 'center',
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, color: colors.textSecondary },
  chartWrapper: { position: 'relative', width: 360 },
  tooltip: {
    position: 'absolute',
    backgroundColor: colors.text,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 56,
    alignItems: 'center',
  },
  tooltipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textInverse,
  },
});
