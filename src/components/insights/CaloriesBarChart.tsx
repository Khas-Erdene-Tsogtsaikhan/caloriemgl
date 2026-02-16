import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';
import { colors, spacing } from '../../theme/tokens';
import { getDayLabel } from '../../utils/date';

interface BarDatum {
  date: string;
  value: number;
}

interface CaloriesBarChartProps {
  data: BarDatum[];
  maxValue: number;
  color: string;
  goalLine?: number;
  selectedIndex?: number | null;
  onSelectIndex?: (index: number) => void;
  showDayLabels?: boolean;
}

export default function CaloriesBarChart({
  data,
  maxValue,
  color,
  goalLine,
  selectedIndex,
  onSelectIndex,
  showDayLabels = true,
}: CaloriesBarChartProps) {
  const chartWidth = 320;
  const chartHeight = 170;
  const padding = { top: 14, bottom: showDayLabels ? 26 : 8, left: 0, right: 0 };
  const drawWidth = chartWidth - padding.left - padding.right;
  const drawHeight = chartHeight - padding.top - padding.bottom;

  const barCount = data.length;
  const barWidth = showDayLabels
    ? Math.min(drawWidth / Math.max(barCount, 1) - 6, 32)
    : Math.max(drawWidth / Math.max(barCount, 1) - 1, 2);
  const gap = (drawWidth - barWidth * barCount) / (barCount + 1);

  const effectiveMax = Math.max(maxValue, ...data.map((d) => d.value), 1);

  return (
    <View style={styles.container}>
      <Svg width={chartWidth} height={chartHeight}>
        {/* Goal line */}
        {goalLine != null && goalLine > 0 && (
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
          const isSelected = selectedIndex === i;
          const barColor = d.value > 0
            ? isSelected ? colors.primaryDark : color
            : colors.borderLight;

          return (
            <React.Fragment key={`${d.date}-${i}`}>
              {/* Invisible wider touch target */}
              <Rect
                x={x - gap / 2}
                y={padding.top}
                width={barWidth + gap}
                height={drawHeight}
                fill="transparent"
                onPress={() => onSelectIndex?.(i)}
              />
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={barWidth > 6 ? 4 : 1}
                fill={barColor}
                onPress={() => onSelectIndex?.(i)}
              />
              {/* Value label on selected bar */}
              {isSelected && d.value > 0 && (
                <SvgText
                  x={x + barWidth / 2}
                  y={y - 4}
                  fontSize={10}
                  fill={colors.text}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {d.value}
                </SvgText>
              )}
              {/* Day label */}
              {showDayLabels && barCount <= 7 && (
                <SvgText
                  x={x + barWidth / 2}
                  y={chartHeight - 4}
                  fontSize={10}
                  fill={isSelected ? colors.text : colors.textTertiary}
                  fontWeight={isSelected ? '700' : '400'}
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
  container: { alignItems: 'center' },
});
