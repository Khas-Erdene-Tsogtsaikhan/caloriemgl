import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { getRandomRecipes, searchRecipes, type RecipeSearchResult } from '@/lib/api/spoonacular';
import RecipeCard from '@/components/recipes/RecipeCard';
import RecipeListCard from '@/components/recipes/RecipeListCard';
import { colors, radii, spacing, typography } from '@/src/theme/tokens';

const CATEGORIES = [
  { id: 'high_protein', label: 'High protein', diet: 'high-protein' },
  { id: 'quick', label: 'Quick', type: 'snack' },
  { id: 'budget', label: 'Budget', type: 'side dish' },
  { id: 'breakfast', label: 'Breakfast', type: 'breakfast' },
  { id: 'dinner', label: 'Dinner', type: 'dinner' },
  { id: 'dessert', label: 'Dessert', type: 'dessert' },
] as const;

export default function RecipesScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [popular, setPopular] = useState<RecipeSearchResult[]>([]);
  const [listRecipes, setListRecipes] = useState<RecipeSearchResult[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [loadingList, setLoadingList] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const loadPopular = useCallback(async () => {
    setLoadingPopular(true);
    try {
      const recipes = await getRandomRecipes(10);
      setPopular(recipes);
    } catch {
      setPopular([]);
    } finally {
      setLoadingPopular(false);
    }
  }, []);

  const loadList = useCallback(
    async (query?: string, category?: string | null) => {
      setLoadingList(true);
      try {
        const q = query ?? searchQuery;
        const cat = category ?? selectedCategory;
        const catConfig = cat ? CATEGORIES.find((c) => c.id === cat) : null;
        const recipes = await searchRecipes(q || 'pasta', {
          number: 20,
          type: catConfig && 'type' in catConfig ? catConfig.type : undefined,
          diet: catConfig && 'diet' in catConfig ? catConfig.diet : undefined,
        });
        setListRecipes(recipes);
      } catch {
        setListRecipes([]);
      } finally {
        setLoadingList(false);
      }
    },
    [searchQuery, selectedCategory]
  );

  useEffect(() => {
    loadPopular();
  }, [loadPopular]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadList(searchQuery, selectedCategory);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  const handleSearchSubmit = () => {
    Keyboard.dismiss();
    loadList(searchQuery, selectedCategory);
  };

  const handleCategoryPress = (id: string) => {
    setSelectedCategory((prev) => (prev === id ? null : id));
  };

  const handleRecipePress = (id: number) => {
    router.push(`/recipe/${id}` as never);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recipes</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TextInput
          style={styles.search}
          placeholder="Search recipes (pizza, pasta, chicken…)"
          placeholderTextColor={colors.recipesTextTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />

        <Text style={styles.sectionTitle}>Popular today</Text>
        {loadingPopular ? (
          <View style={styles.carouselPlaceholder}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : popular.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carousel}
          >
            {popular.map((r) => (
              <RecipeCard key={r.id} recipe={r} onPress={() => handleRecipePress(r.id)} />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Add SPOONACULAR_API_KEY in app.json to load recipes</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.chip, selectedCategory === c.id && styles.chipSelected]}
              onPress={() => handleCategoryPress(c.id)}
            >
              <Text style={[styles.chipText, selectedCategory === c.id && styles.chipTextSelected]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Recipes</Text>
        {loadingList ? (
          <View style={styles.listPlaceholder}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : listRecipes.length > 0 ? (
          <View style={styles.list}>
            {listRecipes.map((r) => (
              <RecipeListCard key={r.id} recipe={r} onPress={() => handleRecipePress(r.id)} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No recipes found. Try a different search or category.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.recipesBg,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.recipesText,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.huge,
  },
  search: {
    backgroundColor: colors.recipesSurface,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    color: colors.recipesText,
    ...typography.body,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.recipesText,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  carousel: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  carouselPlaceholder: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chips: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.recipesSurface,
    marginRight: spacing.sm,
  },
  chipSelected: {
    backgroundColor: colors.primary,
  },
  chipText: {
    ...typography.caption,
    color: colors.recipesTextSecondary,
  },
  chipTextSelected: {
    color: colors.textInverse,
  },
  list: {
    paddingHorizontal: spacing.lg,
  },
  listPlaceholder: {
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    ...typography.caption,
    color: colors.recipesTextTertiary,
    textAlign: 'center',
  },
});
