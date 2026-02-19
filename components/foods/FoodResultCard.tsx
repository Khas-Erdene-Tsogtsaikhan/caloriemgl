import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii, shadows, spacing, typography } from '@/src/theme/tokens';
import type { FoodRow } from '@/lib/repo/foodsRepo';

interface FoodResultCardProps {
  food: FoodRow;
  onPress: () => void;
}

export default function FoodResultCard({ food, onPress }: FoodResultCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.name}>{food.name_mn}</Text>
      <Text style={styles.macros}>
        {Math.round(food.calories_per_100g)} kcal · P{Math.round(food.protein_g_per_100g)} C
        {Math.round(food.carbs_g_per_100g)} F{Math.round(food.fat_g_per_100g)} / 100g
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  name: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  macros: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
