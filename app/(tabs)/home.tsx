import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNutrioStore } from '@/src/store';
import { colors, spacing, typography, radii, shadows } from '@/src/theme/tokens';
import { formatDate, getTodayString } from '@/src/utils/date';
import { MONGOLIAN_FOOD_PRESETS, MEAL_LABELS, MEAL_EMOJIS } from '@/src/data/presets';
import Card from '@/src/components/ui/Card';
import ProgressRing from '@/src/components/ui/ProgressRing';
import ProgressBar from '@/src/components/ui/ProgressBar';
import Button from '@/src/components/ui/Button';
import { MealType, FoodPreset } from '@/src/types';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const profile = useNutrioStore((s) => s.profile);
  const getTodayCaloriesEaten = useNutrioStore((s) => s.getTodayCaloriesEaten);
  const getTodayCaloriesBurned = useNutrioStore((s) => s.getTodayCaloriesBurned);
  const getTodayMealCalories = useNutrioStore((s) => s.getTodayMealCalories);
  const getTodayWater = useNutrioStore((s) => s.getTodayWater);
  const addFoodEntry = useNutrioStore((s) => s.addFoodEntry);
  const addWater = useNutrioStore((s) => s.addWater);
  const foodEntries = useNutrioStore((s) => s.foodEntries);
  const removeFoodEntry = useNutrioStore((s) => s.removeFoodEntry);

  const [quickAddModal, setQuickAddModal] = useState<{
    preset: FoodPreset;
    meal: MealType;
  } | null>(null);
  const [quickQty, setQuickQty] = useState(1);
  const [addMealModal, setAddMealModal] = useState<MealType | null>(null);

  const dailyGoal = profile?.dailyCalorieGoal ?? 2000;
  const eaten = getTodayCaloriesEaten();
  const burned = getTodayCaloriesBurned();
  const remaining = Math.max(dailyGoal - eaten + burned, 0);
  const progress = eaten / dailyGoal;
  const todayWater = getTodayWater();
  const today = getTodayString();

  const todayEntries = foodEntries.filter((e) => e.date === today);
  const meals: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {profile?.name ?? 'there'} 👋</Text>
          <Text style={styles.date}>{formatDate(today)}</Text>
        </View>
      </View>

      {/* Calorie Ring Card */}
      <Card style={styles.calorieCard}>
        <View style={styles.calorieRow}>
          <ProgressRing
            progress={progress}
            size={130}
            strokeWidth={12}
            value={String(remaining)}
            label="kcal left"
          />
          <View style={styles.calorieDetails}>
            <View style={styles.calorieStat}>
              <Text style={styles.statEmoji}>🍽️</Text>
              <View>
                <Text style={styles.statValue}>{eaten}</Text>
                <Text style={styles.statLabel}>Eaten</Text>
              </View>
            </View>
            <View style={styles.calorieStat}>
              <Text style={styles.statEmoji}>🔥</Text>
              <View>
                <Text style={styles.statValue}>{burned}</Text>
                <Text style={styles.statLabel}>Burned</Text>
              </View>
            </View>
            <View style={styles.calorieStat}>
              <Text style={styles.statEmoji}>🎯</Text>
              <View>
                <Text style={styles.statValue}>{dailyGoal}</Text>
                <Text style={styles.statLabel}>Goal</Text>
              </View>
            </View>
          </View>
        </View>
      </Card>

      {/* Water Quick Add */}
      <Card style={styles.waterCard}>
        <View style={styles.waterHeader}>
          <Text style={styles.sectionTitle}>💧 Water</Text>
          <Text style={styles.waterAmount}>{todayWater} ml</Text>
        </View>
        <ProgressBar progress={todayWater / 2000} color={colors.waterColor} height={6} />
        <View style={styles.waterButtons}>
          {[250, 500].map((ml) => (
            <TouchableOpacity
              key={ml}
              style={styles.waterBtn}
              onPress={() => addWater(ml)}
            >
              <Text style={styles.waterBtnText}>+{ml}ml</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Meal Sections */}
      {meals.map((meal) => {
        const mealCals = getTodayMealCalories(meal);
        const mealEntries = todayEntries.filter((e) => e.mealType === meal);
        return (
          <Card key={meal} style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <Text style={styles.mealTitle}>
                {MEAL_EMOJIS[meal]} {MEAL_LABELS[meal]}
              </Text>
              <View style={styles.mealRight}>
                <Text style={styles.mealCals}>{mealCals} kcal</Text>
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => setAddMealModal(meal)}
                >
                  <Text style={styles.addBtnText}>+ Add</Text>
                </TouchableOpacity>
              </View>
            </View>
            {mealEntries.map((entry) => (
              <View key={entry.id} style={styles.entryRow}>
                <View style={styles.entryInfo}>
                  <Text style={styles.entryName}>{entry.name}</Text>
                  <Text style={styles.entryCals}>
                    {entry.quantity} × {entry.calories} kcal
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert('Delete', `Remove ${entry.name}?`, [
                      { text: 'Cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => removeFoodEntry(entry.id) },
                    ])
                  }
                >
                  <Text style={styles.deleteBtn}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </Card>
        );
      })}

      {/* Quick Mongolian Presets */}
      <Text style={styles.sectionTitle}>🥟 Quick Add — Mongolian Foods</Text>
      <FlatList
        horizontal
        data={MONGOLIAN_FOOD_PRESETS}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.presetList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.presetCard}
            onPress={() => {
              setQuickQty(1);
              setQuickAddModal({ preset: item, meal: 'snack' });
            }}
          >
            <Text style={styles.presetEmoji}>{item.emoji}</Text>
            <Text style={styles.presetName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.presetCals}>{item.caloriesPerUnit} kcal</Text>
          </TouchableOpacity>
        )}
      />

      <View style={{ height: 30 }} />

      {/* Quick Add Modal */}
      <Modal visible={!!quickAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {quickAddModal && (
              <>
                <Text style={styles.modalTitle}>
                  {quickAddModal.preset.emoji} {quickAddModal.preset.name}
                </Text>
                <Text style={styles.modalSub}>{quickAddModal.preset.nameEn}</Text>
                <Text style={styles.modalInfo}>
                  {quickAddModal.preset.caloriesPerUnit} kcal per {quickAddModal.preset.defaultUnit}
                </Text>

                {/* Meal picker */}
                <Text style={styles.modalLabel}>Meal</Text>
                <View style={styles.mealPicker}>
                  {meals.map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={[
                        styles.mealPickerBtn,
                        quickAddModal.meal === m && styles.mealPickerBtnActive,
                      ]}
                      onPress={() => setQuickAddModal({ ...quickAddModal, meal: m })}
                    >
                      <Text
                        style={[
                          styles.mealPickerText,
                          quickAddModal.meal === m && styles.mealPickerTextActive,
                        ]}
                      >
                        {MEAL_LABELS[m]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Quantity picker */}
                <Text style={styles.modalLabel}>Quantity</Text>
                <View style={styles.qtyRow}>
                  {[1, 2, 3, 4, 5, 6].map((q) => (
                    <TouchableOpacity
                      key={q}
                      style={[styles.qtyBtn, quickQty === q && styles.qtyBtnActive]}
                      onPress={() => setQuickQty(q)}
                    >
                      <Text style={[styles.qtyText, quickQty === q && styles.qtyTextActive]}>
                        {q}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.totalCals}>
                  Total: {quickAddModal.preset.caloriesPerUnit * quickQty} kcal
                </Text>

                <View style={styles.modalActions}>
                  <Button
                    title="Cancel"
                    variant="ghost"
                    onPress={() => setQuickAddModal(null)}
                    style={{ flex: 1 }}
                  />
                  <Button
                    title="Add"
                    onPress={() => {
                      addFoodEntry({
                        name: quickAddModal.preset.name,
                        calories: quickAddModal.preset.caloriesPerUnit,
                        quantity: quickQty,
                        unit: quickAddModal.preset.defaultUnit,
                        mealType: quickAddModal.meal,
                        date: today,
                      });
                      setQuickAddModal(null);
                    }}
                    style={{ flex: 1 }}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Add to Meal Modal (from presets) */}
      <Modal visible={!!addMealModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '70%' }]}>
            <Text style={styles.modalTitle}>
              Add to {addMealModal ? MEAL_LABELS[addMealModal] : ''}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {MONGOLIAN_FOOD_PRESETS.map((preset) => (
                <TouchableOpacity
                  key={preset.id}
                  style={styles.presetListItem}
                  onPress={() => {
                    setQuickQty(1);
                    setQuickAddModal({ preset, meal: addMealModal! });
                    setAddMealModal(null);
                  }}
                >
                  <Text style={styles.presetListEmoji}>{preset.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.presetListName}>{preset.name}</Text>
                    <Text style={styles.presetListEn}>{preset.nameEn}</Text>
                  </View>
                  <Text style={styles.presetListCals}>{preset.caloriesPerUnit} kcal</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Button
              title="Cancel"
              variant="ghost"
              onPress={() => setAddMealModal(null)}
              style={{ marginTop: spacing.md }}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.huge },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl, marginTop: spacing.lg },
  greeting: { ...typography.h2, color: colors.text },
  date: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  calorieCard: { marginBottom: spacing.lg },
  calorieRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl },
  calorieDetails: { flex: 1, gap: spacing.md },
  calorieStat: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  statEmoji: { fontSize: 18 },
  statValue: { ...typography.bodyBold, color: colors.text },
  statLabel: { ...typography.small, color: colors.textTertiary },
  waterCard: { marginBottom: spacing.lg },
  waterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  waterAmount: { ...typography.bodyBold, color: colors.waterColor },
  waterButtons: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  waterBtn: { backgroundColor: colors.waterColor + '15', paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: radii.full },
  waterBtnText: { ...typography.captionBold, color: colors.waterColor },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.md },
  mealCard: { marginBottom: spacing.md },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mealTitle: { ...typography.bodyBold, color: colors.text },
  mealRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  mealCals: { ...typography.caption, color: colors.textSecondary },
  addBtn: { backgroundColor: colors.primary + '15', paddingVertical: spacing.xs + 2, paddingHorizontal: spacing.md, borderRadius: radii.full },
  addBtnText: { ...typography.captionBold, color: colors.primary },
  entryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.borderLight, marginTop: spacing.md },
  entryInfo: { flex: 1 },
  entryName: { ...typography.body, color: colors.text },
  entryCals: { ...typography.caption, color: colors.textSecondary },
  deleteBtn: { fontSize: 16, color: colors.error, padding: spacing.sm },
  presetList: { gap: spacing.sm, paddingBottom: spacing.sm },
  presetCard: { width: 100, backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.md, alignItems: 'center', ...shadows.sm },
  presetEmoji: { fontSize: 28, marginBottom: spacing.xs },
  presetName: { ...typography.captionBold, color: colors.text, textAlign: 'center' },
  presetCals: { ...typography.small, color: colors.textTertiary, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: radii.xxl, borderTopRightRadius: radii.xxl, padding: spacing.xxl, paddingBottom: spacing.huge },
  modalTitle: { ...typography.h2, color: colors.text, textAlign: 'center' },
  modalSub: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', marginTop: 2, marginBottom: spacing.lg },
  modalInfo: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
  modalLabel: { ...typography.captionBold, color: colors.textSecondary, marginBottom: spacing.sm, textTransform: 'uppercase' },
  mealPicker: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl, flexWrap: 'wrap' },
  mealPickerBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radii.full, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  mealPickerBtnActive: { backgroundColor: colors.primary + '15', borderColor: colors.primary },
  mealPickerText: { ...typography.caption, color: colors.textSecondary },
  mealPickerTextActive: { color: colors.primary, fontWeight: '600' },
  qtyRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
  qtyBtn: { width: 44, height: 44, borderRadius: radii.md, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  qtyBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  qtyText: { ...typography.bodyBold, color: colors.text },
  qtyTextActive: { color: colors.textInverse },
  totalCals: { ...typography.h3, color: colors.primary, textAlign: 'center', marginBottom: spacing.xl },
  modalActions: { flexDirection: 'row', gap: spacing.md },
  presetListItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight, gap: spacing.md },
  presetListEmoji: { fontSize: 28 },
  presetListName: { ...typography.bodyBold, color: colors.text },
  presetListEn: { ...typography.caption, color: colors.textSecondary },
  presetListCals: { ...typography.captionBold, color: colors.primary },
});
