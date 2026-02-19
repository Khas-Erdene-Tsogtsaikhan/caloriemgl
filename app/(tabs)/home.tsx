import FoodDetailSheet from '@/components/foods/FoodDetailSheet';
import FoodSearchPanel from '@/components/foods/FoodSearchPanel';
import DateSwitcher from '@/src/components/home/DateSwitcher';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import Input from '@/src/components/ui/Input';
import ModalHandle from '@/src/components/ui/ModalHandle';
import ProgressBar from '@/src/components/ui/ProgressBar';
import ProgressRing from '@/src/components/ui/ProgressRing';
import { MEAL_EMOJIS, MEAL_LABELS } from '@/src/data/presets';
import { useNutrioStore } from '@/src/store';
import { useFoodStore } from '@/store/useFoodStore';
import { createCustomFood, getFoodById, type FoodRow } from '@/lib/repo/foodsRepo';
import { listRecentFoods, type RecentFoodRow } from '@/lib/repo/logsRepo';
import { colors, radii, shadows, spacing, typography } from '@/src/theme/tokens';
import { MealType } from '@/src/types';
import { addDays, getTodayString } from '@/src/utils/date';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const profile = useNutrioStore((s) => s.profile);
  const activityEntries = useNutrioStore((s) => s.activityEntries);
  const addActivityEntry = useNutrioStore((s) => s.addActivityEntry);
  const removeActivityEntry = useNutrioStore((s) => s.removeActivityEntry);

  const logsByDay = useFoodStore((s) => s.logsByDay);
  const loadLogsByDay = useFoodStore((s) => s.loadLogsByDay);
  const addLog = useFoodStore((s) => s.addLog);
  const removeLog = useFoodStore((s) => s.removeLog);
  const copyLogsFromDay = useFoodStore((s) => s.copyLogsFromDay);

  const [addMealModal, setAddMealModal] = useState<MealType | null>(null);
  const [addMealTab, setAddMealTab] = useState<'search' | 'manual' | 'recent'>('search');
  const [recentFoods, setRecentFoods] = useState<RecentFoodRow[]>([]);
  const [recentDetailFood, setRecentDetailFood] = useState<FoodRow | null>(null);

  // Manual food entry state
  const [manualName, setManualName] = useState('');
  const [manualCals, setManualCals] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFat, setManualFat] = useState('');

  // Quick add calories state
  const [quickCalModal, setQuickCalModal] = useState<MealType | null>(null);
  const [quickCalAmt, setQuickCalAmt] = useState('');

  // Activity add state
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [actName, setActName] = useState('');
  const [actDuration, setActDuration] = useState('');
  const [actBurned, setActBurned] = useState('');

  // Date switcher
  const [selectedDate, setSelectedDate] = useState(getTodayString);

  const dailyGoal = profile?.dailyCalorieGoal ?? 2000;
  const meals: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

  useEffect(() => {
    loadLogsByDay(selectedDate);
  }, [selectedDate, loadLogsByDay]);

  useEffect(() => {
    if (addMealTab === 'recent') {
      listRecentFoods(10).then(setRecentFoods);
    }
  }, [addMealTab]);

  const dayEntries = useMemo(
    () => logsByDay[selectedDate] ?? [],
    [logsByDay, selectedDate]
  );
  const dayActivities = useMemo(
    () => activityEntries.filter((a) => a.date === selectedDate),
    [activityEntries, selectedDate]
  );
  const eaten = useMemo(
    () => dayEntries.reduce((s, e) => s + e.calories, 0),
    [dayEntries]
  );
  const burned = useMemo(
    () => dayActivities.reduce((s, a) => s + a.caloriesBurned, 0),
    [dayActivities]
  );
  const macros = useMemo(() => ({
    protein: Math.round(dayEntries.reduce((s, e) => s + (e.protein_g ?? 0), 0)),
    carbs: Math.round(dayEntries.reduce((s, e) => s + (e.carbs_g ?? 0), 0)),
    fat: Math.round(dayEntries.reduce((s, e) => s + (e.fat_g ?? 0), 0)),
  }), [dayEntries]);

  const remaining = Math.max(dailyGoal - eaten + burned, 0);
  const progress = eaten / dailyGoal;

  const resetManualForm = () => { setManualName(''); setManualCals(''); setManualProtein(''); setManualCarbs(''); setManualFat(''); };

  const copyYesterday = useCallback(async () => {
    const yesterday = addDays(selectedDate, -1);
    const logs = logsByDay[yesterday] ?? [];
    if (logs.length === 0) {
      Alert.alert('Nothing to copy', 'No food entries found for yesterday.');
      return;
    }
    await copyLogsFromDay(yesterday, selectedDate);
  }, [selectedDate, logsByDay, copyLogsFromDay]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <Text style={styles.greeting}>Hello, {profile?.name ?? 'there'}</Text>
        <Text style={styles.greetingSub}>Track your nutrition today</Text>
      </View>

      <View style={styles.body}>
        {/* Date Switcher */}
        <DateSwitcher selectedDate={selectedDate} onDateChange={setSelectedDate} />

        {/* Calorie Ring Card */}
        <Card style={styles.calorieCard}>
          <View style={styles.calorieRow}>
            <ProgressRing
              progress={progress}
              size={120}
              strokeWidth={11}
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

          {/* Macro Progress Bars */}
          <View style={styles.macroSection}>
            <MacroBar label="Protein" value={macros.protein} color={colors.proteinColor} suffix="g" />
            <MacroBar label="Carbs" value={macros.carbs} color={colors.carbColor} suffix="g" />
            <MacroBar label="Fat" value={macros.fat} color={colors.fatColor} suffix="g" />
          </View>
        </Card>

        {/* Activity / Burned Section */}
        <Card style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <Text style={styles.sectionTitle}>🏃 Activity & Burned</Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setShowActivityForm(!showActivityForm)}
            >
              <Text style={styles.addBtnText}>{showActivityForm ? 'Cancel' : '+ Add'}</Text>
            </TouchableOpacity>
          </View>

          {showActivityForm && (
            <View style={styles.activityForm}>
              <Input label="Activity" value={actName} onChangeText={setActName} placeholder="e.g. Walking" />
              <View style={styles.actFormRow}>
                <View style={{ flex: 1 }}>
                  <Input label="Duration" value={actDuration} onChangeText={setActDuration} placeholder="30" keyboardType="numeric" suffix="min" />
                </View>
                <View style={{ flex: 1 }}>
                  <Input label="Burned" value={actBurned} onChangeText={setActBurned} placeholder="150" keyboardType="numeric" suffix="kcal" />
                </View>
              </View>
              <Button
                title="Log Activity"
                onPress={() => {
                  const dur = parseInt(actDuration, 10);
                  const cal = parseInt(actBurned, 10);
                  if (!actName.trim() || !dur || !cal) {
                    Alert.alert('Error', 'Please fill all fields.');
                    return;
                  }
                  addActivityEntry({ name: actName.trim(), durationMinutes: dur, caloriesBurned: cal, date: selectedDate });
                  setActName(''); setActDuration(''); setActBurned('');
                  setShowActivityForm(false);
                }}
              />
            </View>
          )}

          {dayActivities.length === 0 && !showActivityForm ? (
            <Text style={styles.emptyText}>No activities yet — tap + Add to start</Text>
          ) : (
            dayActivities.map((a) => (
              <View key={a.id} style={styles.entryRow}>
                <View style={styles.entryInfo}>
                  <Text style={styles.entryName}>{a.name}</Text>
                  <Text style={styles.entrySub}>{a.durationMinutes} min · {a.caloriesBurned} kcal burned</Text>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert('Delete', `Remove ${a.name}?`, [
                      { text: 'Cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => removeActivityEntry(a.id) },
                    ])
                  }
                >
                  <Text style={styles.deleteBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </Card>

        {/* Meal Sections */}
        {meals.map((meal) => {
          const mealEntries = dayEntries.filter((e) => e.meal === meal);
          const mealCals = mealEntries.reduce((s, e) => s + e.calories, 0);
          const mealMacros = {
            protein: Math.round(mealEntries.reduce((s, e) => s + (e.protein_g ?? 0), 0)),
            carbs: Math.round(mealEntries.reduce((s, e) => s + (e.carbs_g ?? 0), 0)),
            fat: Math.round(mealEntries.reduce((s, e) => s + (e.fat_g ?? 0), 0)),
          };
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
                    onPress={() => { setAddMealTab('search'); setAddMealModal(meal); }}
                  >
                    <Text style={styles.addBtnText}>+ Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {mealCals > 0 && (
                <View style={styles.mealMacroRow}>
                  <Text style={[styles.mealMacroChip, { color: colors.proteinColor }]}>P {mealMacros.protein}g</Text>
                  <Text style={[styles.mealMacroChip, { color: colors.carbColor }]}>C {mealMacros.carbs}g</Text>
                  <Text style={[styles.mealMacroChip, { color: colors.fatColor }]}>F {mealMacros.fat}g</Text>
                </View>
              )}
              {mealEntries.map((entry) => (
                <View key={entry.id} style={styles.entryRow}>
                  <View style={styles.entryInfo}>
                    <Text style={styles.entryName}>{entry.name_mn ?? 'Food'}</Text>
                    <Text style={styles.entrySub}>
                      {entry.portion_label_mn} · {Math.round(entry.calories)} kcal
                      {(entry.protein_g > 0 || entry.carbs_g > 0 || entry.fat_g > 0)
                        ? `  ·  P${Math.round(entry.protein_g)}  C${Math.round(entry.carbs_g)}  F${Math.round(entry.fat_g)}`
                        : ''}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert('Delete', `Remove ${entry.name_mn ?? 'this'}?`, [
                        { text: 'Cancel' },
                        { text: 'Delete', style: 'destructive', onPress: () => removeLog(entry.id, selectedDate) },
                      ])
                    }
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.deleteBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </Card>
          );
        })}

        {/* Action Buttons Row */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setQuickCalModal('snack')}>
            <Text style={styles.actionBtnEmoji}>⚡</Text>
            <Text style={styles.actionBtnLabel}>Quick Cal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={copyYesterday}>
            <Text style={styles.actionBtnEmoji}>📋</Text>
            <Text style={styles.actionBtnLabel}>Copy Yesterday</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </View>

      {/* Quick Add Calories Modal */}
      <Modal visible={!!quickCalModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ModalHandle />
            <Text style={styles.modalTitle}>Quick Add Calories</Text>
            <View style={styles.quickCalRow}>
              {[100, 200, 300, 500].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[styles.quickCalBtn, quickCalAmt === String(amt) && styles.qtyBtnActive]}
                  onPress={() => setQuickCalAmt(String(amt))}
                >
                  <Text style={[styles.quickCalBtnText, quickCalAmt === String(amt) && styles.qtyTextActive]}>{amt}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Input label="Or enter custom" value={quickCalAmt} onChangeText={setQuickCalAmt} keyboardType="numeric" suffix="kcal" />
            <Text style={styles.modalLabel}>Meal</Text>
            <View style={styles.mealPicker}>
              {meals.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.mealPickerBtn, quickCalModal === m && styles.mealPickerBtnActive]}
                  onPress={() => setQuickCalModal(m)}
                >
                  <Text style={[styles.mealPickerText, quickCalModal === m && styles.mealPickerTextActive]}>
                    {MEAL_LABELS[m]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <Button title="Cancel" variant="ghost" onPress={() => { setQuickCalModal(null); setQuickCalAmt(''); }} style={{ flex: 1 }} />
              <Button
                title="Add"
                onPress={async () => {
                  const cal = parseInt(quickCalAmt, 10);
                  if (!cal || cal <= 0) { Alert.alert('Error', 'Enter a valid calorie amount.'); return; }
                  const food = await createCustomFood({
                    name_mn: `Quick ${cal} kcal`,
                    calories_per_100g: cal,
                    protein_g_per_100g: 0,
                    carbs_g_per_100g: 0,
                    fat_g_per_100g: 0,
                  });
                  await addLog({
                    food_id: food.id,
                    log_date: selectedDate,
                    meal: quickCalModal!,
                    unit_mode: 'grams',
                    quantity: 100,
                    portion_id: null,
                    portion_label_mn: 'грамм',
                    grams_total: 100,
                    calories: cal,
                    protein_g: 0,
                    carbs_g: 0,
                    fat_g: 0,
                  });
                  setQuickCalModal(null);
                  setQuickCalAmt('');
                }}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Add to Meal Modal — with Presets / Manual / Recents tabs */}
      <Modal visible={!!addMealModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <ModalHandle />
            <Text style={styles.modalTitle}>
              Add to {addMealModal ? MEAL_LABELS[addMealModal] : ''}
            </Text>

            {/* Sub-tabs */}
            <View style={styles.subTabs}>
              {(['search', 'manual', 'recent'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.subTab, addMealTab === t && styles.subTabActive]}
                  onPress={() => setAddMealTab(t)}
                >
                  <Text style={[styles.subTabText, addMealTab === t && styles.subTabTextActive]}>
                    {t === 'search' ? '🔍 Search' : t === 'manual' ? '✏️ Manual' : '⏱️ Recent'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {addMealTab === 'search' && addMealModal && (
              <FoodSearchPanel
                initialMeal={addMealModal}
                logDate={selectedDate}
                onLogged={() => {
                  loadLogsByDay(selectedDate);
                  setAddMealModal(null);
                }}
              />
            )}

            {addMealTab === 'manual' && (
              <View style={{ paddingTop: spacing.md }}>
                <Input label="Food name" value={manualName} onChangeText={setManualName} placeholder="e.g. Бууз" />
                <Input label="Calories" value={manualCals} onChangeText={setManualCals} placeholder="200" keyboardType="numeric" suffix="kcal" />
                <View style={styles.actFormRow}>
                  <View style={{ flex: 1 }}>
                    <Input label="Protein" value={manualProtein} onChangeText={setManualProtein} placeholder="0" keyboardType="numeric" suffix="g" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Input label="Carbs" value={manualCarbs} onChangeText={setManualCarbs} placeholder="0" keyboardType="numeric" suffix="g" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Input label="Fat" value={manualFat} onChangeText={setManualFat} placeholder="0" keyboardType="numeric" suffix="g" />
                  </View>
                </View>
                <Button
                  title="Add"
                  onPress={async () => {
                    const cal = parseInt(manualCals, 10);
                    if (!manualName.trim() || !cal || cal <= 0) {
                      Alert.alert('Error', 'Enter a valid name and calories.');
                      return;
                    }
                    const food = await createCustomFood({
                      name_mn: manualName.trim(),
                      calories_per_100g: cal,
                      protein_g_per_100g: parseFloat(manualProtein) || 0,
                      carbs_g_per_100g: parseFloat(manualCarbs) || 0,
                      fat_g_per_100g: parseFloat(manualFat) || 0,
                    });
                    await addLog({
                      food_id: food.id,
                      log_date: selectedDate,
                      meal: addMealModal!,
                      unit_mode: 'grams',
                      quantity: 100,
                      portion_id: null,
                      portion_label_mn: 'грамм',
                      grams_total: 100,
                      calories: cal,
                      protein_g: parseFloat(manualProtein) || 0,
                      carbs_g: parseFloat(manualCarbs) || 0,
                      fat_g: parseFloat(manualFat) || 0,
                    });
                    resetManualForm();
                    setAddMealModal(null);
                  }}
                  style={{ marginTop: spacing.sm }}
                />
              </View>
            )}

            {addMealTab === 'recent' && (
              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 350 }}>
                {recentFoods.length === 0 ? (
                  <Text style={styles.emptyText}>No recent foods yet — log something first</Text>
                ) : (
                  recentFoods.map((food) => (
                    <TouchableOpacity
                      key={food.food_id}
                      style={styles.presetListItem}
                      onPress={async () => {
                        const full = await getFoodById(food.food_id);
                        if (full) setRecentDetailFood(full);
                      }}
                    >
                      <Text style={styles.presetListEmoji}>⏱️</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.presetListName}>{food.name_mn}</Text>
                        <Text style={styles.presetListEn}>per 100g</Text>
                      </View>
                      <Text style={styles.presetListCals}>{food.calories_per_100g} kcal</Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            )}

            {recentDetailFood && addMealModal && (
              <FoodDetailSheet
                visible={!!recentDetailFood}
                food={recentDetailFood}
                initialMeal={addMealModal}
                logDate={selectedDate}
                onClose={() => setRecentDetailFood(null)}
                onLogged={() => {
                  loadLogsByDay(selectedDate);
                  setRecentDetailFood(null);
                  setAddMealModal(null);
                }}
              />
            )}

            <Button
              title="Cancel"
              variant="ghost"
              onPress={() => { setAddMealModal(null); resetManualForm(); }}
              style={{ marginTop: spacing.md }}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

/** Compact macro progress bar row */
function MacroBar({ label, value, color, suffix }: { label: string; value: number; color: string; suffix: string }) {
  return (
    <View style={styles.macroRow}>
      <View style={styles.macroLabelRow}>
        <View style={[styles.macroDot, { backgroundColor: color }]} />
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={styles.macroValue}>{value}{suffix}</Text>
      </View>
      <ProgressBar progress={Math.min(value / 150, 1)} color={color} height={5} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.huge },
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
  },
  greeting: { ...typography.h1, color: colors.text },
  greetingSub: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  body: { paddingHorizontal: spacing.xl },
  calorieCard: { marginBottom: spacing.lg, marginTop: spacing.md },
  calorieRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl },
  calorieDetails: { flex: 1, gap: spacing.md },
  calorieStat: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  statEmoji: { fontSize: 18 },
  statValue: { ...typography.bodyBold, color: colors.text },
  statLabel: { ...typography.small, color: colors.textTertiary },
  macroSection: { marginTop: spacing.lg, gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: spacing.lg },
  macroRow: { gap: 3 },
  macroLabelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  macroDot: { width: 7, height: 7, borderRadius: 4 },
  macroLabel: { ...typography.small, color: colors.textSecondary, flex: 1 },
  macroValue: { ...typography.captionBold, color: colors.text },
  activityCard: { marginBottom: spacing.lg },
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  activityForm: { marginTop: spacing.sm },
  actFormRow: { flexDirection: 'row', gap: spacing.md },
  emptyText: { ...typography.caption, color: colors.textTertiary, textAlign: 'center', paddingVertical: spacing.md },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.md },
  mealCard: { marginBottom: spacing.md },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mealTitle: { ...typography.bodyBold, color: colors.text },
  mealRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  mealCals: { ...typography.caption, color: colors.textSecondary },
  mealMacroRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs },
  mealMacroChip: { ...typography.small, fontWeight: '600' },
  addBtn: { backgroundColor: colors.primaryMuted, paddingVertical: spacing.xs + 2, paddingHorizontal: spacing.md, borderRadius: radii.full },
  addBtnText: { ...typography.captionBold, color: colors.primary },
  entryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.borderLight, marginTop: spacing.md },
  entryInfo: { flex: 1 },
  entryName: { ...typography.body, color: colors.text },
  entrySub: { ...typography.small, color: colors.textTertiary, marginTop: 1 },
  deleteBtnText: { fontSize: 16, color: colors.error, padding: spacing.sm },
  presetList: { gap: spacing.sm, paddingBottom: spacing.sm },
  presetCard: { width: 100, backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.md, alignItems: 'center', ...shadows.sm },
  presetEmoji: { fontSize: 28, marginBottom: spacing.xs },
  presetName: { ...typography.captionBold, color: colors.text, textAlign: 'center' },
  presetCals: { ...typography.small, color: colors.textTertiary, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: spacing.xxl, paddingBottom: spacing.huge },
  modalTitle: { ...typography.h2, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  modalSub: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', marginTop: 2, marginBottom: spacing.lg },
  modalInfo: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
  modalLabel: { ...typography.captionBold, color: colors.textSecondary, marginBottom: spacing.sm, textTransform: 'uppercase' },
  subTabs: { flexDirection: 'row', backgroundColor: colors.surfaceAlt, borderRadius: radii.lg, padding: 3, marginBottom: spacing.lg },
  subTab: { flex: 1, paddingVertical: spacing.sm + 2, borderRadius: radii.md, alignItems: 'center' },
  subTabActive: { backgroundColor: colors.surface, ...shadows.sm },
  subTabText: { ...typography.captionBold, color: colors.textTertiary },
  subTabTextActive: { color: colors.text },
  mealPicker: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl, flexWrap: 'wrap' },
  mealPickerBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radii.full, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  mealPickerBtnActive: { backgroundColor: colors.primaryMuted, borderColor: colors.primary },
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
  presetListMacros: { ...typography.small, color: colors.textTertiary, marginTop: 1 },
  actionRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.surfaceAlt, paddingVertical: spacing.md, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.borderLight },
  actionBtnEmoji: { fontSize: 18 },
  actionBtnLabel: { ...typography.captionBold, color: colors.text },
  quickCalRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  quickCalBtn: { flex: 1, height: 44, borderRadius: radii.md, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  quickCalBtnText: { ...typography.bodyBold, color: colors.text },
});
