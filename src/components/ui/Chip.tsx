import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, radii, spacing, typography } from '../../theme/tokens';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  emoji?: string;
  style?: ViewStyle;
}

export default function Chip({ label, selected, onPress, emoji, style }: ChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.chip, selected && styles.selected, style]}
    >
      {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  selected: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  emoji: {
    fontSize: 16,
  },
  label: {
    ...typography.body,
    color: colors.text,
  },
  selectedLabel: {
    color: colors.primaryDark,
    fontWeight: '600',
  },
});
