import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { colors, radii, spacing, typography } from '@/src/theme/tokens';
import type { RecipeSearchResult } from '@/lib/api/spoonacular';

interface RecipeCardProps {
  recipe: RecipeSearchResult;
  onPress: () => void;
}

export default function RecipeCard({ recipe, onPress }: RecipeCardProps) {
  const kcal = recipe.nutrition?.calories ?? 0;
  const stats = `${recipe.readyInMinutes} min • ${Math.round(kcal)} kcal`;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image
        source={recipe.image ? { uri: recipe.image } : undefined}
        style={styles.image}
        contentFit="cover"
        placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
      />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {recipe.title}
        </Text>
        <Text style={styles.stats}>{stats}</Text>
      </View>
    </TouchableOpacity>
  );
}

const CARD_WIDTH = 200;
const IMAGE_HEIGHT = 140;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginRight: spacing.md,
    backgroundColor: colors.recipesSurface,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  image: {
    width: CARD_WIDTH,
    height: IMAGE_HEIGHT,
    backgroundColor: colors.recipesSurfaceAlt,
  },
  content: {
    padding: spacing.md,
  },
  title: {
    ...typography.bodyBold,
    color: colors.recipesText,
    marginBottom: spacing.xs,
  },
  stats: {
    ...typography.small,
    color: colors.recipesTextSecondary,
  },
});
