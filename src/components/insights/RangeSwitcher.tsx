import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, radii } from '../../theme/tokens';
import { formatRange } from '../../utils/date';

interface RangeSwitcherProps {
  startDate: string;
  endDate: string;
  onPrev: () => void;
  onNext: () => void;
  onGoToCurrentWeek?: () => void;
  isCurrentWeek?: boolean;
}

export default function RangeSwitcher({
  startDate,
  endDate,
  onPrev,
  onNext,
  onGoToCurrentWeek,
  isCurrentWeek = true,
}: RangeSwitcherProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.chevron} onPress={onPrev} activeOpacity={0.6}>
        <Text style={styles.chevronText}>‹</Text>
      </TouchableOpacity>
      <View style={styles.rangeBlock}>
        <Text style={styles.rangeText}>{formatRange(startDate, endDate)}</Text>
        {onGoToCurrentWeek && !isCurrentWeek && (
          <TouchableOpacity style={styles.todayBtn} onPress={onGoToCurrentWeek} activeOpacity={0.7}>
            <Text style={styles.todayBtnText}>Энэ долоо хоног</Text>
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity style={styles.chevron} onPress={onNext} activeOpacity={0.6}>
        <Text style={styles.chevronText}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  chevron: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronText: { fontSize: 24, fontWeight: '700', color: colors.text, marginTop: -2 },
  rangeBlock: { flex: 1, alignItems: 'center', marginHorizontal: spacing.md },
  rangeText: { ...typography.h3, color: colors.text, fontWeight: '700' },
  todayBtn: {
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    backgroundColor: colors.primaryMuted,
  },
  todayBtnText: { ...typography.small, color: colors.primary, fontWeight: '600' },
});
