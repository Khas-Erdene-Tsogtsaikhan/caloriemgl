import DateSwitcher from '@/src/components/home/DateSwitcher';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import Input from '@/src/components/ui/Input';
import ProgressBar from '@/src/components/ui/ProgressBar';
import ProgressRing from '@/src/components/ui/ProgressRing';
import { MEAL_EMOJIS, MEAL_LABELS, MONGOLIAN_FOOD_PRESETS } from '@/src/data/presets';
import { useNutrioStore } from '@/src/store';
import { colors, radii, shadows, spacing, typography } from '@/src/theme/tokens';
import { FoodEntry, FoodPreset, MealType } from '@/src/types';
import { addDays, getTodayString } from '@/src/utils/date';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
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
  const foodEntries = useNutrioStore((s) => s.foodEntries);
  const activityEntries = useNutrioStore((s) => s.activityEntries);
  const recentFoods = useNutrioStore((s) => s.recentFoods);
  const addFoodEntry = useNutrioStore((s) => s.addFoodEntry);
  const updateFoodEntry = useNutrioStore((s) => s.updateFoodEntry);
  const removeFoodEntry = useNutrioStore((s) => s.removeFoodEntry);
  const addActivityEntry = useNutrioStore((s) => s.addActivityEntry);
  const removeActivityEntry = useNutrioStore((s) => s.removeActivityEntry);

  const [quickAddModal, setQuickAddModal] = useState<{
    preset: FoodPreset;
    meal: MealType;
  } | null>(null);
  const [quickQty, setQuickQty] = useState(1);
  const [addMealModal, setAddMealModal] = useState<MealType | null>(null);
  const [addMealTab, setAddMealTab] = useState<'presets' | 'manual' | 'recent'>('presets');

  // Manual food entry state
  const [manualName, setManualName] = useState('');
  const [manualCals, setManualCals] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFat, setManualFat] = useState('');

  // Edit food entry state
  const [editEntry, setEditEntry] = useState<FoodEntry | null>(null);
  const [editCals, setEditCals] = useState('');
  const [editProtein, setEditProtein] = useState('');
  const [editCarbs, setEditCarbs] = useState('');
  const [editFat, setEditFat] = useState('');
  const [editQty, setEditQty] = useState('');

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

  // Reactive derived values from raw arrays
  const dayEntries = useMemo(
    () => foodEntries.filter((e) => e.date === selectedDate),
    [foodEntries, selectedDate]
  );
  const dayActivities = useMemo(
    () => activityEntries.filter((a) => a.date === selectedDate),
    [activityEntries, selectedDate]
  );
  const eaten = useMemo(
    () => dayEntries.reduce((s, e) => s + e.calories * e.quantity, 0),
    [dayEntries]
  );
  const burned = useMemo(
    () => dayActivities.reduce((s, a) => s + a.caloriesBurned, 0),
    [dayActivities]
  );
  const macros = useMemo(() => ({
    protein: Math.round(dayEntries.reduce((s, e) => s + (e.protein_g ?? 0) * e.quantity, 0)),
    carbs: Math.round(dayEntries.reduce((s, e) => s + (e.carbs_g ?? 0) * e.quantity, 0)),
    fat: Math.round(dayEntries.reduce((s, e) => s + (e.fat_g ?? 0) * e.quantity, 0)),
  }), [dayEntries]);

  const remaining = Math.max(dailyGoal - eaten + burned, 0);
  const progress = eaten / dailyGoal;

  const resetManualForm = () => { setManualName(''); setManualCals(''); setManualProtein(''); setManualCarbs(''); setManualFat(''); };

  const openEditEntry = (entry: FoodEntry) => {
    setEditEntry(entry);
    setEditCals(String(entry.calories));
    setEditProtein(String(entry.protein_g));
    setEditCarbs(String(entry.carbs_g));
    setEditFat(String(entry.fat_g));
    setEditQty(String(entry.quantity));
  };

  const copyYesterday = () => {
    const yesterday = addDays(selectedDate, -1);
    const yEntries = foodEntries.filter((e) => e.date === yesterday);
    if (yEntries.length === 0) {
      Alert.alert('Nothing to copy', 'No food entries found for yesterday.');
      return;
    }
    yEntries.forEach((e) => {
      addFoodEntry({
        name: e.name, calories: e.calories, protein_g: e.protein_g, carbs_g: e.carbs_g,
        fat_g: e.fat_g, quantity: e.quantity, unit: e.unit, mealType: e.mealType, date: selectedDate,
      });
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Gradient Header */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradientHeader, { paddingTop: insets.top + spacing.lg }]}
      >
        <Text style={styles.greeting}>Hello, {profile?.name ?? 'there'} 👋</Text>
        <Text style={styles.greetingSub}>Let's track your nutrition</Text>
      </LinearGradient>

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
            <Text style={styles.emptyText}>No activities logged yet</Text>
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
          const mealEntries = dayEntries.filter((e) => e.mealType === meal);
          const mealCals = mealEntries.reduce((s, e) => s + e.calories * e.quantity, 0);
          const mealMacros = {
            protein: Math.round(mealEntries.reduce((s, e) => s + (e.protein_g ?? 0) * e.quantity, 0)),
            carbs: Math.round(mealEntries.reduce((s, e) => s + (e.carbs_g ?? 0) * e.quantity, 0)),
            fat: Math.round(mealEntries.reduce((s, e) => s + (e.fat_g ?? 0) * e.quantity, 0)),
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
                    onPress={() => { setAddMealTab('presets'); setAddMealModal(meal); }}
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
                <TouchableOpacity key={entry.id} style={styles.entryRow} activeOpacity={0.6} onPress={() => openEditEntry(entry)}>
                  <View style={styles.entryInfo}>
                    <Text style={styles.entryName}>{entry.name}</Text>
                    <Text style={styles.entrySub}>
                      {entry.quantity} × {entry.calories} kcal
                      {(entry.protein_g > 0 || entry.carbs_g > 0 || entry.fat_g > 0)
                        ? `  ·  P${Math.round(entry.protein_g * entry.quantity)}  C${Math.round(entry.carbs_g * entry.quantity)}  F${Math.round(entry.fat_g * entry.quantity)}`
                        : ''}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert('Delete', `Remove ${entry.name}?`, [
                        { text: 'Cancel' },
                        { text: 'Delete', style: 'destructive', onPress: () => removeFoodEntry(entry.id) },
                      ])
                    }
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.deleteBtnText}>✕</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
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
              activeOpacity={0.7}
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
      </View>

      {/* Quick Add Modal (preset quantity picker) */}
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
                  {quickAddModal.preset.caloriesPerUnit} kcal · P{quickAddModal.preset.protein_g} C{quickAddModal.preset.carbs_g} F{quickAddModal.preset.fat_g}
                </Text>

                <Text style={styles.modalLabel}>Meal</Text>
                <View style={styles.mealPicker}>
                  {meals.map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={[styles.mealPickerBtn, quickAddModal.meal === m && styles.mealPickerBtnActive]}
                      onPress={() => setQuickAddModal({ ...quickAddModal, meal: m })}
                    >
                      <Text style={[styles.mealPickerText, quickAddModal.meal === m && styles.mealPickerTextActive]}>
                        {MEAL_LABELS[m]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.modalLabel}>Quantity</Text>
                <View style={styles.qtyRow}>
                  {[1, 2, 3, 4, 5, 6].map((q) => (
                    <TouchableOpacity
                      key={q}
                      style={[styles.qtyBtn, quickQty === q && styles.qtyBtnActive]}
                      onPress={() => setQuickQty(q)}
                    >
                      <Text style={[styles.qtyText, quickQty === q && styles.qtyTextActive]}>{q}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.totalCals}>
                  Total: {quickAddModal.preset.caloriesPerUnit * quickQty} kcal
                </Text>

                <View style={styles.modalActions}>
                  <Button title="Cancel" variant="ghost" onPress={() => setQuickAddModal(null)} style={{ flex: 1 }} />
                  <Button
                    title="Add"
                    onPress={() => {
                      addFoodEntry({
                        name: quickAddModal.preset.name,
                        calories: quickAddModal.preset.caloriesPerUnit,
                        protein_g: quickAddModal.preset.protein_g,
                        carbs_g: quickAddModal.preset.carbs_g,
                        fat_g: quickAddModal.preset.fat_g,
                        quantity: quickQty,
                        unit: quickAddModal.preset.defaultUnit,
                        mealType: quickAddModal.meal,
                        date: selectedDate,
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

      {/* Edit Food Entry Modal */}
      <Modal visible={!!editEntry} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {editEntry && (
              <>
                <Text style={styles.modalTitle}>Edit: {editEntry.name}</Text>
                <Input label="Calories" value={editCals} onChangeText={setEditCals} keyboardType="numeric" suffix="kcal" />
                <View style={styles.actFormRow}>
                  <View style={{ flex: 1 }}>
                    <Input label="Protein" value={editProtein} onChangeText={setEditProtein} keyboardType="numeric" suffix="g" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Input label="Carbs" value={editCarbs} onChangeText={setEditCarbs} keyboardType="numeric" suffix="g" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Input label="Fat" value={editFat} onChangeText={setEditFat} keyboardType="numeric" suffix="g" />
                  </View>
                </View>
                <Input label="Quantity" value={editQty} onChangeText={setEditQty} keyboardType="numeric" />
                <View style={styles.modalActions}>
                  <Button title="Cancel" variant="ghost" onPress={() => setEditEntry(null)} style={{ flex: 1 }} />
                  <Button
                    title="Save"
                    onPress={() => {
                      const cal = parseInt(editCals, 10);
                      const qty = parseInt(editQty, 10);
                      if (!cal || cal <= 0 || !qty || qty <= 0) {
                        Alert.alert('Error', 'Enter valid calories and quantity.');
                        return;
                      }
                      updateFoodEntry(editEntry.id, {
                        calories: cal,
                        protein_g: parseFloat(editProtein) || 0,
                        carbs_g: parseFloat(editCarbs) || 0,
                        fat_g: parseFloat(editFat) || 0,
                        quantity: qty,
                      });
                      setEditEntry(null);
                    }}
                    style={{ flex: 1 }}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Quick Add Calories Modal */}
      <Modal visible={!!quickCalModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⚡ Quick Add Calories</Text>
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
                onPress={() => {
                  const cal = parseInt(quickCalAmt, 10);
                  if (!cal || cal <= 0) { Alert.alert('Error', 'Enter a valid calorie amount.'); return; }
                  addFoodEntry({
                    name: `Quick ${cal} kcal`,
                    calories: cal, protein_g: 0, carbs_g: 0, fat_g: 0,
                    quantity: 1, unit: 'хувь (serving)', mealType: quickCalModal!, date: selectedDate,
                  });
                  setQuickCalModal(null); setQuickCalAmt('');
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
            <Text style={styles.modalTitle}>
              Add to {addMealModal ? MEAL_LABELS[addMealModal] : ''}
            </Text>

            {/* Sub-tabs */}
            <View style={styles.subTabs}>
              {(['presets', 'manual', 'recent'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.subTab, addMealTab === t && styles.subTabActive]}
                  onPress={() => setAddMealTab(t)}
                >
                  <Text style={[styles.subTabText, addMealTab === t && styles.subTabTextActive]}>
                    {t === 'presets' ? '🥟 Presets' : t === 'manual' ? '✏️ Manual' : '⏱️ Recent'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {addMealTab === 'presets' && (
              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 350 }}>
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
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.presetListCals}>{preset.caloriesPerUnit} kcal</Text>
                      <Text style={styles.presetListMacros}>P{preset.protein_g} C{preset.carbs_g} F{preset.fat_g}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
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
                  onPress={() => {
                    const cal = parseInt(manualCals, 10);
                    if (!manualName.trim() || !cal || cal <= 0) {
                      Alert.alert('Error', 'Enter a valid name and calories.');
                      return;
                    }
                    addFoodEntry({
                      name: manualName.trim(),
                      calories: cal,
                      protein_g: parseFloat(manualProtein) || 0,
                      carbs_g: parseFloat(manualCarbs) || 0,
                      fat_g: parseFloat(manualFat) || 0,
                      quantity: 1,
                      unit: 'хувь (serving)',
                      mealType: addMealModal!,
                      date: selectedDate,
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
                  <Text style={styles.emptyText}>No recent foods yet. Log something first!</Text>
                ) : (
                  recentFoods.map((food, idx) => (
                    <TouchableOpacity
                      key={`${food.name}-${idx}`}
                      style={styles.presetListItem}
                      onPress={() => {
                        addFoodEntry({
                          name: food.name,
                          calories: food.calories,
                          protein_g: food.protein_g ?? 0,
                          carbs_g: food.carbs_g ?? 0,
                          fat_g: food.fat_g ?? 0,
                          quantity: 1,
                          unit: food.unit,
                          mealType: addMealModal!,
                          date: selectedDate,
                        });
                        setAddMealModal(null);
                      }}
                    >
                      <Text style={styles.presetListEmoji}>⏱️</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.presetListName}>{food.name}</Text>
                        <Text style={styles.presetListEn}>{food.unit}</Text>
                      </View>
                      <Text style={styles.presetListCals}>{food.calories} kcal</Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
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
  gradientHeader: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    borderBottomLeftRadius: radii.xxl,
    borderBottomRightRadius: radii.xxl,
  },
  greeting: { ...typography.h2, color: colors.textInverse },
  greetingSub: { ...typography.caption, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  body: { paddingHorizontal: spacing.xl, marginTop: -spacing.sm },
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
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: radii.xxl, borderTopRightRadius: radii.xxl, padding: spacing.xxl, paddingBottom: spacing.huge },
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
