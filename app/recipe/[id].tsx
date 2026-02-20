import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '@/src/components/ui/Button';
import { getRecipeById, type RecipeDetail } from '@/lib/api/spoonacular';
import {
  createRecipeFood,
  getRecipeFoodBySourceId,
  getFoodPortions,
} from '@/lib/repo/foodsRepo';
import { useFoodStore } from '@/store/useFoodStore';
import { getTodayString } from '@/src/utils/date';
import { colors, radii, spacing, typography } from '@/src/theme/tokens';
import type { MealType } from '@/store/useFoodStore';

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

function extractNutrition(recipe: RecipeDetail) {
  const nutrients = recipe.nutrition?.nutrients ?? [];
  const getVal = (name: string) => {
    const n = nutrients.find((x) => x.name.toLowerCase().includes(name));
    return n?.amount ?? 0;
  };
  return {
    calories: Math.round(getVal('Calories') * 10) / 10,
    protein: Math.round(getVal('Protein') * 10) / 10,
    carbs: Math.round(getVal('Carbohydrate') * 10) / 10,
    fat: Math.round(getVal('Fat') * 10) / 10,
  };
}

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const loadLogsByDay = useFoodStore((s) => s.loadLogsByDay);

  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [servings, setServings] = useState(2);
  const [meal, setMeal] = useState<MealType>('lunch');
  const [showMealPicker, setShowMealPicker] = useState(false);
  const [logging, setLogging] = useState(false);

  const recipeId = id ? parseInt(id, 10) : NaN;

  useEffect(() => {
    if (isNaN(recipeId)) return;
    let cancelled = false;
    const load = async () => {
      const r = await getRecipeById(recipeId);
      if (!cancelled && r) {
        setRecipe(r);
        setServings(Math.min(Math.max(r.servings, 2), 6));
      }
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [recipeId]);

  const nutrition = recipe ? extractNutrition(recipe) : null;
  const perServing = nutrition
    ? {
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
      }
    : null;
  const totals = perServing
    ? {
        calories: Math.round(perServing.calories * servings * 10) / 10,
        protein: Math.round(perServing.protein * servings * 10) / 10,
        carbs: Math.round(perServing.carbs * servings * 10) / 10,
        fat: Math.round(perServing.fat * servings * 10) / 10,
      }
    : null;

  const handleLog = useCallback(async () => {
    if (!recipe || !totals || !perServing) return;

    setLogging(true);
    try {
      let food = await getRecipeFoodBySourceId(String(recipe.id));
      if (!food) {
        food = await createRecipeFood({
          recipeId: recipe.id,
          title: recipe.title,
          caloriesPerServing: perServing.calories,
          proteinPerServing: perServing.protein,
          carbsPerServing: perServing.carbs,
          fatPerServing: perServing.fat,
        });
      }

      const portions = await getFoodPortions(food.id);
      const servingPortion = portions.find((p) => p.label_mn === '1 ширхэг') ?? portions[0];
      if (!servingPortion) throw new Error('No portion found');

      const gramsTotal = servingPortion.grams * servings;
      const factor = gramsTotal / 100;
      const logCalories = food.calories_per_100g * factor;
      const logProtein = food.protein_g_per_100g * factor;
      const logCarbs = food.carbs_g_per_100g * factor;
      const logFat = food.fat_g_per_100g * factor;

      await useFoodStore.getState().addLog({
        food_id: food.id,
        log_date: getTodayString(),
        meal,
        unit_mode: 'portion',
        quantity: servings,
        portion_id: servingPortion.id,
        portion_label_mn: `${servings} ширхэг`,
        grams_total: gramsTotal,
        calories: logCalories,
        protein_g: logProtein,
        carbs_g: logCarbs,
        fat_g: logFat,
        metadata: { recipeId: recipe.id, imageUrl: recipe.image },
      });

      if (Platform.OS === 'android') {
        const { ToastAndroid } = require('react-native');
        ToastAndroid.show('Бүртгэгдлээ', ToastAndroid.SHORT);
      } else {
        Alert.alert('Амжилттай', 'Бүртгэгдлээ');
      }
      setShowMealPicker(false);
      router.back();
    } catch (e) {
      Alert.alert('Алдаа', e instanceof Error ? e.message : 'Бүртгэхэд алдаа гарлаа');
    } finally {
      setLogging(false);
    }
  }, [recipe, totals, perServing, servings, meal]);

  if (loading || !recipe) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const displayInstructions = recipe.instructions;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Image
          source={recipe.image ? { uri: recipe.image } : undefined}
          style={styles.hero}
          contentFit="cover"
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        />
        <View style={styles.content}>
          <Text style={styles.title}>{recipe.title}</Text>

          <View style={styles.statsRow}>
            <Text style={styles.stat}>
              {perServing ? `${Math.round(perServing.calories)} kcal/serv` : '—'}
            </Text>
            <Text style={styles.stat}>{recipe.readyInMinutes} min</Text>
            <Text style={styles.stat}>{recipe.servings} serv</Text>
          </View>

          <View style={styles.stepperRow}>
            <Text style={styles.stepperLabel}>Servings</Text>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => setServings((s) => Math.max(2, s - 1))}
              >
                <Text style={styles.stepperBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{servings}</Text>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => setServings((s) => Math.min(6, s + 1))}
              >
                <Text style={styles.stepperBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {totals && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Total:</Text>
              <Text style={styles.totalsValue}>
                {Math.round(totals.calories)} kcal · P{Math.round(totals.protein)} C
                {Math.round(totals.carbs)} F{Math.round(totals.fat)}
              </Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Ingredients</Text>
          {recipe.extendedIngredients.map((ing, i) => (
            <Text key={i} style={styles.ingredient}>
              • {ing.original}
            </Text>
          ))}

          <Text style={styles.sectionTitle}>Instructions</Text>
          <Text style={styles.instructions}>{displayInstructions || 'No instructions available.'}</Text>

          {showMealPicker ? (
            <View style={styles.mealPicker}>
              <Text style={styles.mealPickerTitle}>Log as</Text>
              {(Object.keys(MEAL_LABELS) as MealType[]).map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.mealBtn, meal === m && styles.mealBtnActive]}
                  onPress={() => setMeal(m)}
                >
                  <Text style={[styles.mealBtnText, meal === m && styles.mealBtnTextActive]}>
                    {MEAL_LABELS[m]}
                  </Text>
                </TouchableOpacity>
              ))}
              <Button
                title={logging ? 'Logging…' : 'Log this recipe'}
                onPress={handleLog}
                disabled={logging}
                style={styles.logBtn}
              />
              <TouchableOpacity onPress={() => setShowMealPicker(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Button
              title="Log this recipe"
              onPress={() => setShowMealPicker(true)}
              style={styles.logBtn}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.recipesBg,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.huge,
  },
  backBtn: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    zIndex: 10,
    padding: spacing.sm,
  },
  backText: {
    ...typography.body,
    color: colors.recipesText,
  },
  hero: {
    width: '100%',
    aspectRatio: 636 / 393,
    backgroundColor: colors.recipesSurfaceAlt,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.recipesText,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  stat: {
    ...typography.caption,
    color: colors.recipesTextSecondary,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  stepperLabel: {
    ...typography.bodyBold,
    color: colors.recipesText,
    marginRight: spacing.md,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.recipesSurface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperBtnText: {
    ...typography.bodyBold,
    color: colors.recipesText,
    fontSize: 20,
  },
  stepperValue: {
    ...typography.h3,
    color: colors.recipesText,
    minWidth: 24,
    textAlign: 'center',
  },
  totalsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  totalsLabel: {
    ...typography.bodyBold,
    color: colors.recipesText,
    marginRight: spacing.sm,
  },
  totalsValue: {
    ...typography.caption,
    color: colors.recipesTextSecondary,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.recipesText,
    marginBottom: spacing.md,
  },
  ingredient: {
    ...typography.body,
    color: colors.recipesTextSecondary,
    marginBottom: spacing.xs,
  },
  instructions: {
    ...typography.body,
    color: colors.recipesTextSecondary,
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  mealPicker: {
    marginTop: spacing.md,
  },
  mealPickerTitle: {
    ...typography.bodyBold,
    color: colors.recipesText,
    marginBottom: spacing.md,
  },
  mealBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    backgroundColor: colors.recipesSurface,
    marginBottom: spacing.sm,
  },
  mealBtnActive: {
    backgroundColor: colors.primary,
  },
  mealBtnText: {
    ...typography.body,
    color: colors.recipesText,
  },
  mealBtnTextActive: {
    color: colors.textInverse,
  },
  logBtn: {
    marginTop: spacing.lg,
  },
  cancelText: {
    ...typography.caption,
    color: colors.recipesTextTertiary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
