import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Button from '@/src/components/ui/Button';
import Input from '@/src/components/ui/Input';
import ModalHandle from '@/src/components/ui/ModalHandle';
import { getFoodPortions, type FoodPortionRow, type FoodRow } from '@/lib/repo/foodsRepo';
import { computeGramsTotal, computeTotals } from '@/lib/utils/nutritionMath';
import { colors, radii, spacing, typography } from '@/src/theme/tokens';
import type { MealType } from '@/store/useFoodStore';

const MEAL_LABELS_MN: Record<MealType, string> = {
  breakfast: 'Өглөөний цай',
  lunch: 'Өдрийн хоол',
  dinner: 'Оройн хоол',
  snack: 'Зайрмаг',
};

interface FoodDetailSheetProps {
  visible: boolean;
  food: FoodRow | null;
  initialMeal: MealType;
  logDate: string;
  onClose: () => void;
  onLogged: () => void;
}

export default function FoodDetailSheet({
  visible,
  food,
  initialMeal,
  logDate,
  onClose,
  onLogged,
}: FoodDetailSheetProps) {
  const [unitMode, setUnitMode] = useState<'grams' | 'portion'>('grams');
  const [gramsInput, setGramsInput] = useState('100');
  const [portionId, setPortionId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [meal, setMeal] = useState<MealType>(initialMeal);
  const [portions, setPortions] = useState<FoodPortionRow[]>([]);
  const [loading, setLoading] = useState(false);

  const per100g = food
    ? {
        calories_per_100g: food.calories_per_100g,
        protein_g_per_100g: food.protein_g_per_100g,
        carbs_g_per_100g: food.carbs_g_per_100g,
        fat_g_per_100g: food.fat_g_per_100g,
      }
    : null;

  const selectedPortion = portions.find((p) => p.id === portionId) ?? portions[0];
  const portionGrams = selectedPortion?.grams ?? 100;

  const gramsTotal = computeGramsTotal({
    unitMode,
    gramsInput: parseFloat(gramsInput) || 0,
    portionGrams,
    quantity,
  });

  const totals = per100g ? computeTotals(per100g, gramsTotal) : null;

  const loadPortions = useCallback(async () => {
    if (!food) return;
    const p = await getFoodPortions(food.id);
    setPortions(p);
    const defaultP = p.find((x) => x.is_default) ?? p[0];
    if (defaultP) setPortionId(defaultP.id);
  }, [food?.id]);

  useEffect(() => {
    if (visible && food) {
      loadPortions();
      setUnitMode('grams');
      setGramsInput('100');
      setQuantity(1);
      setMeal(initialMeal);
    }
  }, [visible, food?.id, initialMeal, loadPortions]);

  const handleLog = async () => {
    if (!food || !totals) return;
    const grams = parseFloat(gramsInput) || 0;
    if (unitMode === 'grams' && grams <= 0) {
      Alert.alert('Алдаа', 'Грамм оруулна уу.');
      return;
    }
    if (unitMode === 'portion' && quantity <= 0) {
      Alert.alert('Алдаа', 'Тоо хэмжээ оруулна уу.');
      return;
    }

    const portionLabel =
      unitMode === 'grams' ? 'грамм' : selectedPortion?.label_mn ?? 'грамм';

    setLoading(true);
    try {
      const { useFoodStore } = await import('@/store/useFoodStore');
      await useFoodStore.getState().addLog({
        food_id: food.id,
        log_date: logDate,
        meal,
        unit_mode: unitMode,
        quantity: unitMode === 'grams' ? grams : quantity,
        portion_id: unitMode === 'portion' ? selectedPortion?.id ?? null : null,
        portion_label_mn: portionLabel,
        grams_total: gramsTotal,
        calories: totals.calories,
        protein_g: totals.protein_g,
        carbs_g: totals.carbs_g,
        fat_g: totals.fat_g,
      });

      if (Platform.OS === 'android') {
        const { ToastAndroid } = require('react-native');
        ToastAndroid.show('Бүртгэгдлээ', ToastAndroid.SHORT);
      } else {
        Alert.alert('Амжилттай', 'Бүртгэгдлээ');
      }
      onLogged();
      onClose();
    } catch (e) {
      Alert.alert('Алдаа', e instanceof Error ? e.message : 'Бүртгэхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  if (!food) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <ModalHandle />
          <Text style={styles.title}>{food.name_mn}</Text>
          {food.name_en && (
            <Text style={styles.subtitle}>{food.name_en}</Text>
          )}

          {totals && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Нийт:</Text>
              <Text style={styles.totalsValue}>
                {Math.round(totals.calories)} kcal · P{Math.round(totals.protein_g)} C
                {Math.round(totals.carbs_g)} F{Math.round(totals.fat_g)}
              </Text>
            </View>
          )}

          <View style={styles.unitToggle}>
            <TouchableOpacity
              style={[styles.toggleBtn, unitMode === 'grams' && styles.toggleBtnActive]}
              onPress={() => setUnitMode('grams')}
            >
              <Text style={[styles.toggleText, unitMode === 'grams' && styles.toggleTextActive]}>
                Грамм
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, unitMode === 'portion' && styles.toggleBtnActive]}
              onPress={() => setUnitMode('portion')}
            >
              <Text style={[styles.toggleText, unitMode === 'portion' && styles.toggleTextActive]}>
                Порц
              </Text>
            </TouchableOpacity>
          </View>

          {unitMode === 'grams' ? (
            <Input
              label="Грамм"
              value={gramsInput}
              onChangeText={setGramsInput}
              keyboardType="numeric"
              suffix="г"
            />
          ) : (
            <>
              {portions.length > 0 && (
                <View style={styles.portionPicker}>
                  <Text style={styles.label}>Порц</Text>
                  <View style={styles.portionRow}>
                    {portions.map((p) => (
                      <TouchableOpacity
                        key={p.id}
                        style={[
                          styles.portionBtn,
                          portionId === p.id && styles.portionBtnActive,
                        ]}
                        onPress={() => setPortionId(p.id)}
                      >
                        <Text
                          style={[
                            styles.portionBtnText,
                            portionId === p.id && styles.portionBtnTextActive,
                          ]}
                        >
                          {p.label_mn}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setQuantity((q) => Math.max(0.5, q - 0.5))}
                >
                  <Text style={styles.stepperText}>−</Text>
                </TouchableOpacity>
                <Input
                  label="Тоо хэмжээ"
                  value={String(quantity)}
                  onChangeText={(t) => setQuantity(parseFloat(t) || 1)}
                  keyboardType="numeric"
                  style={{ flex: 1, marginBottom: 0 }}
                />
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setQuantity((q) => q + 0.5)}
                >
                  <Text style={styles.stepperText}>+</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          <Text style={styles.label}>Цаг</Text>
          <View style={styles.mealPicker}>
            {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.mealBtn, meal === m && styles.mealBtnActive]}
                onPress={() => setMeal(m)}
              >
                <Text style={[styles.mealBtnText, meal === m && styles.mealBtnTextActive]}>
                  {MEAL_LABELS_MN[m]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.actions}>
            <Button title="Болих" variant="ghost" onPress={onClose} style={{ flex: 1 }} />
            <Button
              title="Бүртгэх"
              onPress={handleLog}
              loading={loading}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.xxl,
    paddingBottom: spacing.huge,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  totalsLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  totalsValue: {
    ...typography.h3,
    color: colors.primary,
  },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    padding: 3,
    marginBottom: spacing.lg,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.sm,
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: colors.surface,
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  toggleText: {
    ...typography.captionBold,
    color: colors.textTertiary,
  },
  toggleTextActive: {
    color: colors.text,
  },
  label: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  portionPicker: {
    marginBottom: spacing.lg,
  },
  portionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  portionBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  portionBtnActive: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  portionBtnText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  portionBtnTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  mealPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  mealBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mealBtnActive: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  mealBtnText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  mealBtnTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
