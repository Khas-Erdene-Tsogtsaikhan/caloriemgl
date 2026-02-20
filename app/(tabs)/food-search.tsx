import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FoodDetailSheet from '@/components/foods/FoodDetailSheet';
import FoodResultCard from '@/components/foods/FoodResultCard';
import { useFoodStore } from '@/store/useFoodStore';
import { colors, spacing, typography } from '@/src/theme/tokens';
import { getTodayString } from '@/src/utils/date';
import type { FoodRow } from '@/lib/repo/foodsRepo';
import type { MealType } from '@/store/useFoodStore';

const DEBOUNCE_MS = 280;

export default function FoodSearchScreen() {
  const insets = useSafeAreaInsets();
  const search = useFoodStore((s) => s.search);
  const topMatch = useFoodStore((s) => s.topMatch);
  const moreResults = useFoodStore((s) => s.moreResults);
  const moreExpanded = useFoodStore((s) => s.moreExpanded);
  const setMoreExpanded = useFoodStore((s) => s.setMoreExpanded);
  const loading = useFoodStore((s) => s.loading);
  const error = useFoodStore((s) => s.error);
  const loadLogsByDay = useFoodStore((s) => s.loadLogsByDay);

  const [query, setQuery] = useState('');
  const [detailFood, setDetailFood] = useState<FoodRow | null>(null);
  const [initialMeal, setInitialMeal] = useState<MealType>('snack');

  const debouncedSearch = useCallback(() => {
    search(query.trim());
  }, [query, search]);

  useEffect(() => {
    const t = setTimeout(debouncedSearch, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query, debouncedSearch]);

  const handleSelectFood = (food: FoodRow) => {
    setDetailFood(food);
  };

  const handleLogged = useCallback(() => {
    loadLogsByDay(getTodayString());
  }, [loadLogsByDay]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={insets.top}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Хоол хайх</Text>
        <TextInput
        style={styles.input}
        placeholder="Хоол хайх…"
        placeholderTextColor={colors.textTertiary}
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        autoCorrect={false}
        />

        {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Хайж байна…</Text>
        </View>
        )}

        {error && <Text style={styles.error}>{error}</Text>}

        {!loading && (
        <>
            <Text style={styles.sectionTitle}>Top match</Text>
            {topMatch ? (
              <FoodResultCard food={topMatch} onPress={() => handleSelectFood(topMatch)} />
            ) : (
              <Text style={styles.empty}>Олдсонгүй</Text>
            )}

            {(topMatch || moreResults.length > 0) && (
              <TouchableOpacity
                style={styles.moreBtn}
                onPress={() => setMoreExpanded(!moreExpanded)}
              >
                <Text style={styles.moreBtnText}>
                  {moreExpanded ? 'Нуух' : 'Илүү үр дүн'}
                </Text>
              </TouchableOpacity>
            )}

            {moreExpanded &&
              moreResults.slice(0, 8).map((food) => (
                <FoodResultCard
                  key={food.id}
                  food={food}
                  onPress={() => handleSelectFood(food)}
                />
              ))}
          </>
        )}

        <FoodDetailSheet
          visible={!!detailFood}
          food={detailFood}
          initialMeal={initialMeal}
          logDate={getTodayString()}
          onClose={() => setDetailFood(null)}
          onLogged={handleLogged}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.huge,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    color: colors.text,
    marginBottom: spacing.xl,
  },
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  loadingText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  error: {
    ...typography.caption,
    color: colors.error,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  empty: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.lg,
  },
  moreBtn: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  moreBtnText: {
    ...typography.captionBold,
    color: colors.primary,
  },
});
