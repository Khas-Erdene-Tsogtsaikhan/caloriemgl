import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { colors, radii, spacing, typography } from '@/src/theme/tokens';
import type { RecipeSearchResult } from '@/lib/api/spoonacular';

interface RecipeListCardProps {
  recipe: RecipeSearchResult;
  onPress: () => void;
}

export default function RecipeListCard({ recipe, onPress }: RecipeListCardProps) {
  const n = recipe.nutrition;
  const macros = n
    ? `${Math.round(n.calories)} kcal/serv • P${Math.round(n.protein)} C${Math.round(n.carbs)} F${Math.round(n.fat)}`
    : `${recipe.readyInMinutes} min`;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
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
        <Text style={styles.macros}>{macros}</Text>
        <Text style={styles.time}>{recipe.readyInMinutes} min</Text>
      </View>
    </TouchableOpacity>
  );
}

const IMAGE_SIZE = 72;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.recipesSurface,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.recipesBorder,
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: radii.sm,
    backgroundColor: colors.recipesSurfaceAlt,
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  title: {
    ...typography.bodyBold,
    color: colors.recipesText,
    marginBottom: spacing.xs,
  },
  macros: {
    ...typography.caption,
    color: colors.recipesTextSecondary,
    marginBottom: spacing.xs,
  },
  time: {
    ...typography.small,
    color: colors.recipesTextTertiary,
  },
});
