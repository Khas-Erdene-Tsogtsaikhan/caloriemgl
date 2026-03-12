import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect, Line, Text as SvgText } from 'react-native-svg';
import { colors } from '@/src/theme/tokens';
import { getDayLabel } from '@/src/utils/date';

export interface MacroDayDatum {
  date: string;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MacrosStackedBarChartProps {
  data: MacroDayDatum[];
  selectedDay?: string | null;
  onSelectDay?: (date: string | null) => void;
}

const Y_AXIS_PADDING = 44;
const CHART_WIDTH = 360;
const CHART_HEIGHT = 260;
const MAX_Y = 100;
const TICK_STEP = 10;
const EMPTY_BAR_COLOR = '#E8E8E6';
const MIN_BAR_HEIGHT = 6;
const TOP_CORNER_RADIUS = 4;

const MUTED_PROTEIN = '#A8C4D8';
const MUTED_CARBS = '#E8C898';
const MUTED_FAT = '#E8A0A0';

/** Path for a rect with only the top two corners rounded (subtle roundish top) */
function roundedTopRectPath(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.min(r, w / 2, h);
  return `M ${x + rr} ${y} L ${x + w - rr} ${y} Q ${x + w} ${y} ${x + w} ${y + rr} L ${x + w} ${y + h} L ${x} ${y + h} L ${x} ${y + rr} Q ${x} ${y} ${x + rr} ${y} Z`;
}

/** Y-axis: 0 to 100 in increments of 10 */
function getTickValues(): number[] {
  const ticks: number[] = [];
  for (let v = 0; v <= MAX_Y; v += TICK_STEP) ticks.push(v);
  return ticks;
}

function getChartDayLabel(dateStr: string): string {
  return getDayLabel(dateStr);
}

export default function MacrosStackedBarChart({
  data,
  selectedDay = null,
  onSelectDay,
}: MacrosStackedBarChartProps) {
  const padding = { top: 20, bottom: 28, left: Y_AXIS_PADDING, right: 10 };
  const drawWidth = CHART_WIDTH - padding.left - padding.right;
  const drawHeight = CHART_HEIGHT - padding.top - padding.bottom;

  const barCount = data.length;
  const barWidth = barCount > 0 ? Math.min(drawWidth / barCount - 6, 36) : 24;
  const gap = barCount > 0 ? (drawWidth - barWidth * barCount) / (barCount + 1) : 0;

  const tickValues = getTickValues();
  const selectedIndex = selectedDay ? data.findIndex((d) => d.date === selectedDay) : -1;

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
      <View style={styles.chartWrapper}>
        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
          {/* Horizontal grid lines only */}
          {tickValues.slice(1).map((tick) => {
            const y = padding.top + drawHeight * (1 - tick / MAX_Y);
            return (
              <Line
                key={`grid-${tick}`}
                x1={padding.left}
                y1={y}
                x2={CHART_WIDTH - padding.right}
                y2={y}
                stroke={colors.borderLight}
                strokeWidth={1}
              />
            );
          })}

          {/* Y-axis labels - smaller and lighter */}
          {tickValues.map((tick) => {
            const y = padding.top + drawHeight * (1 - tick / MAX_Y);
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

          {data.map((d, i) => {
            const x = padding.left + gap + i * (barWidth + gap);
            const total = d.protein + d.carbs + d.fat;
            const barHeight = total > 0
              ? Math.max((total / MAX_Y) * drawHeight, 4)
              : MIN_BAR_HEIGHT;
            const y = padding.top + drawHeight - barHeight;
            const isSelected = selectedDay === d.date;

            const segments = [
              { value: d.protein, color: colors.proteinColor, muted: MUTED_PROTEIN },
              { value: d.carbs, color: colors.carbColor, muted: MUTED_CARBS },
              { value: d.fat, color: colors.fatColor, muted: MUTED_FAT },
            ];
            const segmentsWithValues = segments.filter((s) => s.value > 0);
            let yOffset = padding.top + drawHeight;

            const getColor = (seg: { color: string; muted: string }) => (isSelected ? seg.color : seg.muted);

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
                  segmentsWithValues.map((seg, segIdx) => {
                    const height = Math.max((seg.value / total) * barHeight, 1);
                    const isTopSegment = segIdx === segmentsWithValues.length - 1;
                    yOffset -= height;
                    if (isTopSegment && barWidth > 8) {
                      return (
                        <Path
                          key={seg.color}
                          d={roundedTopRectPath(x, yOffset, barWidth, height, TOP_CORNER_RADIUS)}
                          fill={getColor(seg)}
                          onPress={() => onSelectDay?.(isSelected ? null : d.date)}
                        />
                      );
                    }
                    return (
                      <Rect
                        key={seg.color}
                        x={x}
                        y={yOffset}
                        width={barWidth}
                        height={height}
                        fill={getColor(seg)}
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
                  y={CHART_HEIGHT - 4}
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
            const total = d.protein + d.carbs + d.fat;
            const barHeight = total > 0
              ? Math.max((total / MAX_Y) * drawHeight, 4)
              : MIN_BAR_HEIGHT;
            const x = padding.left + gap + selectedIndex * (barWidth + gap);
            const barTop = padding.top + drawHeight - barHeight;
            const tooltipLeft = x + barWidth / 2 - 40;
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
                <Text style={styles.tooltipText}>
                  P{d.protein} C{d.carbs} F{d.fat}г
                </Text>
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
  chartWrapper: { position: 'relative', width: CHART_WIDTH },
  tooltip: {
    position: 'absolute',
    backgroundColor: colors.text,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  tooltipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textInverse,
  },
});
