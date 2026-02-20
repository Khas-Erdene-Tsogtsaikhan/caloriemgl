import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { colors, spacing, typography } from '@/src/theme/tokens';

interface TimelineChartProps {
  progress: number; // 0 to 1
  weeksElapsed: number;
  weeksTotal: number;
  weeksLeft: number;
  startWeight: number;
  currentWeight: number;
  targetWeight: number;
  targetDateStr: string;
  onTrackStatus: 'on_track' | 'ahead' | 'behind' | 'unknown';
  onTrackMessage: string;
  etaDateStr?: string;
}

export default function TimelineChart({
  progress,
  weeksElapsed,
  weeksTotal,
  weeksLeft,
  startWeight,
  currentWeight,
  targetWeight,
  targetDateStr,
  onTrackStatus,
  onTrackMessage,
  etaDateStr,
}: TimelineChartProps) {
  const size = 140;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const strokeDashoffset = circumference * (1 - clampedProgress);

  const statusColor =
    onTrackStatus === 'on_track'
      ? colors.success
      : onTrackStatus === 'ahead'
        ? colors.secondary
        : onTrackStatus === 'behind'
          ? colors.warning
          : colors.textTertiary;

  return (
    <View style={styles.container}>
      <View style={styles.ringSection}>
        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient id="progressGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={colors.primary} />
              <Stop offset="1" stopColor={colors.primaryDark} />
            </LinearGradient>
          </Defs>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.borderLight}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#progressGrad)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={styles.ringCenter}>
          <Text style={styles.weeksLeftValue}>{weeksLeft}</Text>
          <Text style={styles.weeksLeftLabel}>weeks left</Text>
        </View>
      </View>

      <View style={styles.timelineBar}>
        <View style={styles.timelineTrack}>
          <View
            style={[
              styles.timelineFill,
              { width: `${clampedProgress * 100}%` },
            ]}
          />
        </View>
        <View style={styles.timelineLabels}>
          <Text style={styles.timelineLabel}>Start</Text>
          <Text style={styles.timelineWeek}>
            Week {weeksElapsed} of {weeksTotal}
          </Text>
          <Text style={styles.timelineLabel}>{targetDateStr}</Text>
        </View>
      </View>

      <View style={styles.weightRow}>
        <View style={styles.weightCol}>
          <Text style={styles.weightValue}>{startWeight}</Text>
          <Text style={styles.weightLabel}>Start</Text>
        </View>
        <View style={styles.weightCol}>
          <Text style={[styles.weightValue, styles.weightCurrent]}>{currentWeight.toFixed(1)}</Text>
          <Text style={styles.weightLabel}>Now</Text>
        </View>
        <View style={styles.weightCol}>
          <Text style={styles.weightValue}>{targetWeight}</Text>
          <Text style={styles.weightLabel}>Goal</Text>
        </View>
      </View>

      <View style={[styles.statusBadge, { borderLeftColor: statusColor }]}>
        <Text style={styles.statusText}>{onTrackMessage}</Text>
        {etaDateStr && onTrackStatus !== 'on_track' && (
          <Text style={styles.etaText}>ETA: {etaDateStr}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginBottom: spacing.lg },
  ringSection: { position: 'relative', marginBottom: spacing.lg },
  ringCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weeksLeftValue: { ...typography.h1, color: colors.primary, fontSize: 32 },
  weeksLeftLabel: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  timelineBar: { width: '100%', marginBottom: spacing.lg },
  timelineTrack: {
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  timelineFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  timelineLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timelineLabel: { ...typography.small, color: colors.textTertiary },
  timelineWeek: { ...typography.captionBold, color: colors.text },
  weightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  weightCol: { alignItems: 'center' },
  weightValue: { ...typography.bodyBold, color: colors.text },
  weightCurrent: { ...typography.h3, color: colors.primary },
  weightLabel: { ...typography.small, color: colors.textTertiary, marginTop: 2 },
  statusBadge: {
    alignSelf: 'stretch',
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    borderLeftWidth: 4,
  },
  statusText: { ...typography.bodyBold, color: colors.text, textAlign: 'center' },
  etaText: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', marginTop: 4 },
});
