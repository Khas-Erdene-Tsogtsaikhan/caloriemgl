import React, { useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import { colors, spacing, typography, radii } from '../../theme/tokens';
import { BMI_CATEGORIES, categoryForBMI } from '../../utils/bmi';

interface BmiRangeBarProps {
  bmi: number;
}

const BAR_MIN = 14;
const BAR_MAX = 40;

export default function BmiRangeBar({ bmi }: BmiRangeBarProps) {
  const [barWidth, setBarWidth] = useState(0);
  const cat = categoryForBMI(bmi);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setBarWidth(w);
  };

  const clampedBmi = Math.min(Math.max(bmi, BAR_MIN), BAR_MAX);
  const markerRatio = (clampedBmi - BAR_MIN) / (BAR_MAX - BAR_MIN);

  return (
    <View style={styles.container}>
      {/* Colored bar */}
      <View style={styles.barOuter} onLayout={onLayout}>
        {BMI_CATEGORIES.map((c) => {
          const segMin = Math.max(c.min, BAR_MIN);
          const segMax = Math.min(c.max, BAR_MAX);
          const widthPct = ((segMax - segMin) / (BAR_MAX - BAR_MIN)) * 100;
          if (widthPct <= 0) return null;
          return (
            <View
              key={c.label}
              style={[styles.segment, { width: `${widthPct}%`, backgroundColor: c.color }]}
            />
          );
        })}

        {/* Marker needle */}
        {barWidth > 0 && (
          <View
            style={[
              styles.marker,
              { left: markerRatio * barWidth - 2 },
            ]}
          >
            <View style={styles.markerLine} />
            <View style={styles.markerDot} />
          </View>
        )}

        {/* Skeleton placeholder when width=0 */}
        {barWidth === 0 && <View style={styles.skeleton} />}
      </View>

      {/* Labels below bar */}
      <View style={styles.labelRow}>
        {BMI_CATEGORIES.map((c) => {
          const segMin = Math.max(c.min, BAR_MIN);
          const segMax = Math.min(c.max, BAR_MAX);
          const widthPct = ((segMax - segMin) / (BAR_MAX - BAR_MIN)) * 100;
          if (widthPct <= 0) return null;
          return (
            <Text
              key={c.label}
              style={[styles.segLabel, { width: `${widthPct}%` }]}
              numberOfLines={1}
            >
              {c.label}
            </Text>
          );
        })}
      </View>

      {/* Big BMI value + category pill */}
      <View style={styles.valueRow}>
        <Text style={styles.bmiValue}>{bmi}</Text>
        <View style={[styles.pill, { backgroundColor: cat.color + '18' }]}>
          <View style={[styles.pillDot, { backgroundColor: cat.color }]} />
          <Text style={[styles.pillText, { color: cat.color }]}>{cat.label}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: spacing.sm },
  barOuter: {
    flexDirection: 'row',
    height: 14,
    borderRadius: radii.full,
    overflow: 'hidden',
    position: 'relative',
  },
  segment: { height: '100%' },
  skeleton: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.borderLight,
    borderRadius: radii.full,
  },
  marker: {
    position: 'absolute',
    top: -4,
    alignItems: 'center',
    width: 4,
  },
  markerLine: {
    width: 3,
    height: 22,
    backgroundColor: colors.text,
    borderRadius: 2,
  },
  markerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text,
    marginTop: -2,
  },
  labelRow: {
    flexDirection: 'row',
    marginTop: spacing.xs + 6,
  },
  segLabel: {
    ...typography.small,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  bmiValue: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.full,
    gap: spacing.xs,
  },
  pillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pillText: {
    ...typography.captionBold,
  },
});
