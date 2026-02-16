import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, radii, shadows } from '../../theme/tokens';
import { formatRange } from '../../utils/date';

interface RangeSwitcherProps {
  startDate: string;
  endDate: string;
  onPrev: () => void;
  onNext: () => void;
}

export default function RangeSwitcher({ startDate, endDate, onPrev, onNext }: RangeSwitcherProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.chevron} onPress={onPrev}>
        <Text style={styles.chevronText}>‹</Text>
      </TouchableOpacity>
      <Text style={styles.rangeText}>{formatRange(startDate, endDate)}</Text>
      <TouchableOpacity style={styles.chevron} onPress={onNext}>
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
    marginBottom: spacing.lg,
  },
  chevron: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronText: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: -1 },
  rangeText: { ...typography.captionBold, color: colors.textSecondary },
});
