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
import FoodDetailSheet from '@/components/foods/FoodDetailSheet';
import FoodResultCard from '@/components/foods/FoodResultCard';
import { useFoodStore } from '@/store/useFoodStore';
import { colors, spacing, typography } from '@/src/theme/tokens';
import type { FoodRow } from '@/lib/repo/foodsRepo';
import type { MealType } from '@/store/useFoodStore';

const DEBOUNCE_MS = 280;

interface FoodSearchPanelProps {
  initialMeal: MealType;
  logDate: string;
  onLogged: () => void;
}

export default function FoodSearchPanel({
  initialMeal,
  logDate,
  onLogged,
}: FoodSearchPanelProps) {
  const search = useFoodStore((s) => s.search);
  const topMatch = useFoodStore((s) => s.topMatch);
  const moreResults = useFoodStore((s) => s.moreResults);
  const moreExpanded = useFoodStore((s) => s.moreExpanded);
  const setMoreExpanded = useFoodStore((s) => s.setMoreExpanded);
  const loading = useFoodStore((s) => s.loading);
  const error = useFoodStore((s) => s.error);

  const [query, setQuery] = useState('');
  const [detailFood, setDetailFood] = useState<FoodRow | null>(null);

  const debouncedSearch = useCallback(() => {
    search(query.trim());
  }, [query, search]);

  useEffect(() => {
    const t = setTimeout(debouncedSearch, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query, debouncedSearch]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
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
          {topMatch && (
            <FoodResultCard
              food={topMatch}
              onPress={() => setDetailFood(topMatch)}
            />
          )}
          {topMatch || moreResults.length > 0 ? (
            <TouchableOpacity
              style={styles.moreBtn}
              onPress={() => setMoreExpanded(!moreExpanded)}
            >
              <Text style={styles.moreBtnText}>
                {moreExpanded ? 'Нуух' : 'Илүү үр дүн'}
              </Text>
            </TouchableOpacity>
          ) : null}
          {moreExpanded && (
            <ScrollView style={styles.moreList} nestedScrollEnabled>
              {moreResults.slice(0, 8).map((food) => (
                <FoodResultCard
                  key={food.id}
                  food={food}
                  onPress={() => setDetailFood(food)}
                />
              ))}
            </ScrollView>
          )}
        </>
      )}

      <FoodDetailSheet
        visible={!!detailFood}
        food={detailFood}
        initialMeal={initialMeal}
        logDate={logDate}
        onClose={() => setDetailFood(null)}
        onLogged={() => {
          onLogged();
          setDetailFood(null);
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 200,
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
    marginBottom: spacing.lg,
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
  moreList: {
    maxHeight: 250,
  },
});
