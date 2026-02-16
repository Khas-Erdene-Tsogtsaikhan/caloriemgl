import React, { useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Path, Line, Circle } from 'react-native-svg';
import { colors, spacing, typography } from '../../theme/tokens';

interface BmiGaugeProps {
  bmi: number;
}

/** BMI color helper */
export function getBmiColor(bmi: number): string {
  if (bmi < 16) return '#42A5F5';
  if (bmi < 18.5) return '#9CCC65';
  if (bmi < 25) return '#4CAF50';
  if (bmi < 30) return '#FF9800';
  if (bmi < 35) return '#FF5722';
  return '#B71C1C';
}

/** BMI category + color mapping util */
export function getBmiInfo(bmi: number): { category: string; color: string } {
  if (bmi < 16) return { category: 'Very severely underweight', color: '#42A5F5' };
  if (bmi < 17) return { category: 'Severely underweight', color: '#66BB6A' };
  if (bmi < 18.5) return { category: 'Underweight', color: '#9CCC65' };
  if (bmi < 25) return { category: 'Normal', color: '#4CAF50' };
  if (bmi < 30) return { category: 'Overweight', color: '#FF9800' };
  if (bmi < 35) return { category: 'Obese Class I', color: '#FF5722' };
  if (bmi < 40) return { category: 'Obese Class II', color: '#E53935' };
  return { category: 'Obese Class III', color: '#B71C1C' };
}

export default function BmiGauge({ bmi }: BmiGaugeProps) {
  const [containerWidth, setContainerWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setContainerWidth(w);
  };

  // Don't render SVG until we know the container width
  if (containerWidth === 0) {
    return <View style={styles.gaugeContainer} onLayout={onLayout}><View style={{ height: 130 }} /></View>;
  }

  const size = Math.min(containerWidth, 260);
  const cx = size / 2;
  const cy = size / 2 + 10;
  const radius = size * 0.38;
  const strokeWidth = size * 0.075;

  const startAngle = Math.PI;
  const totalAngle = Math.PI;

  const minBmi = 10;
  const maxBmi = 45;
  const clampedBmi = Math.min(Math.max(bmi, minBmi), maxBmi);
  const ratio = (clampedBmi - minBmi) / (maxBmi - minBmi);
  const needleAngle = startAngle - ratio * totalAngle;

  const segments = [
    { from: 0, to: (16 - minBmi) / (maxBmi - minBmi), color: '#42A5F5' },
    { from: (16 - minBmi) / (maxBmi - minBmi), to: (18.5 - minBmi) / (maxBmi - minBmi), color: '#9CCC65' },
    { from: (18.5 - minBmi) / (maxBmi - minBmi), to: (25 - minBmi) / (maxBmi - minBmi), color: '#4CAF50' },
    { from: (25 - minBmi) / (maxBmi - minBmi), to: (30 - minBmi) / (maxBmi - minBmi), color: '#FF9800' },
    { from: (30 - minBmi) / (maxBmi - minBmi), to: (35 - minBmi) / (maxBmi - minBmi), color: '#FF5722' },
    { from: (35 - minBmi) / (maxBmi - minBmi), to: 1, color: '#B71C1C' },
  ];

  const describeArc = (startRatio: number, endRatio: number): string => {
    const sAngle = startAngle - startRatio * totalAngle;
    const eAngle = startAngle - endRatio * totalAngle;
    const x1 = cx + radius * Math.cos(sAngle);
    const y1 = cy + radius * Math.sin(sAngle);
    const x2 = cx + radius * Math.cos(eAngle);
    const y2 = cy + radius * Math.sin(eAngle);
    const largeArc = Math.abs(eAngle - sAngle) > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 0 ${x2} ${y2}`;
  };

  const needleLen = radius - strokeWidth / 2 - 4;
  const needleX = cx + needleLen * Math.cos(needleAngle);
  const needleY = cy + needleLen * Math.sin(needleAngle);

  const svgHeight = size / 2 + 30;

  return (
    <View style={styles.gaugeContainer} onLayout={onLayout}>
      <Svg width={size} height={svgHeight} viewBox={`0 0 ${size} ${svgHeight}`}>
        {segments.map((seg, i) => (
          <Path
            key={i}
            d={describeArc(seg.from, seg.to)}
            stroke={seg.color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="butt"
          />
        ))}
        <Line
          x1={cx}
          y1={cy}
          x2={needleX}
          y2={needleY}
          stroke={colors.text}
          strokeWidth={2.5}
        />
        <Circle cx={cx} cy={cy} r={5} fill={colors.text} />
      </Svg>
      <View style={[styles.gaugeValueContainer, { bottom: 2 }]}>
        <Text style={styles.gaugeValue}>{bmi}</Text>
        <Text style={styles.gaugeLabel}>BMI (kg/m²)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gaugeContainer: { alignItems: 'center', marginBottom: spacing.md, width: '100%' },
  gaugeValueContainer: { position: 'absolute', alignItems: 'center' },
  gaugeValue: { ...typography.h1, color: colors.text, fontSize: 32 },
  gaugeLabel: { ...typography.caption, color: colors.textTertiary },
});
