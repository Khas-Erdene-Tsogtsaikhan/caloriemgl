import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNutrioStore } from '@/src/store';
import { colors, spacing, typography, radii, shadows } from '@/src/theme/tokens';
import { getTodayString } from '@/src/utils/date';
import { MEAL_LABELS, MEAL_EMOJIS } from '@/src/data/presets';
import Card from '@/src/components/ui/Card';
import Button from '@/src/components/ui/Button';
import Input from '@/src/components/ui/Input';
import Chip from '@/src/components/ui/Chip';
import { MealType, FoodUnit } from '@/src/types';

type TabMode = 'meals' | 'activities';

const UNITS: FoodUnit[] = ['ширхэг (piece)', 'аяга (cup)', 'таваг (plate)', 'хувь (serving)'];

export default function LogScreen() {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<TabMode>('meals');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.screenTitle}>Log</Text>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, mode === 'meals' && styles.tabActive]}
          onPress={() => setMode('meals')}
        >
          <Text style={[styles.tabText, mode === 'meals' && styles.tabTextActive]}>🍽️ Meals</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, mode === 'activities' && styles.tabActive]}
          onPress={() => setMode('activities')}
        >
          <Text style={[styles.tabText, mode === 'activities' && styles.tabTextActive]}>🏃 Activities</Text>
        </TouchableOpacity>
      </View>
      {mode === 'meals' ? <MealsTab /> : <ActivitiesTab />}
    </View>
  );
}

function MealsTab() {
  const addFoodEntry = useNutrioStore((s) => s.addFoodEntry);
  const recentFoods = useNutrioStore((s) => s.recentFoods);
  const today = getTodayString();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState<FoodUnit>('ширхэг (piece)');
  const [meal, setMeal] = useState<MealType>('lunch');

  const meals: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

  const resetForm = () => {
    setName('');
    setCalories('');
    setQuantity('1');
    setUnit('ширхэг (piece)');
    setShowForm(false);
  };

  const handleAdd = () => {
    const cal = parseInt(calories, 10);
    const qty = parseInt(quantity, 10) || 1;
    if (!name.trim() || !cal || cal <= 0) {
      Alert.alert('Error', 'Please enter a valid food name and calories.');
      return;
    }
    addFoodEntry({ name: name.trim(), calories: cal, quantity: qty, unit, mealType: meal, date: today });
    resetForm();
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Button
        title={showForm ? 'Cancel' : '+ Add Food Manually'}
        variant={showForm ? 'ghost' : 'primary'}
        onPress={() => (showForm ? resetForm() : setShowForm(true))}
      />

      {showForm && (
        <Card style={styles.formCard}>
          <Text style={styles.formTitle}>New Food Entry</Text>
          <Input label="Food name" value={name} onChangeText={setName} placeholder="e.g. Бууз" />
          <Input label="Calories per unit" value={calories} onChangeText={setCalories} placeholder="70" keyboardType="numeric" suffix="kcal" />
          <Input label="Quantity" value={quantity} onChangeText={setQuantity} placeholder="1" keyboardType="numeric" />

          <Text style={styles.fieldLabel}>Unit</Text>
          <View style={styles.chipRow}>
            {UNITS.map((u) => (
              <Chip key={u} label={u} selected={unit === u} onPress={() => setUnit(u)} />
            ))}
          </View>

          <Text style={styles.fieldLabel}>Meal</Text>
          <View style={styles.chipRow}>
            {meals.map((m) => (
              <Chip key={m} label={`${MEAL_EMOJIS[m]} ${MEAL_LABELS[m]}`} selected={meal === m} onPress={() => setMeal(m)} />
            ))}
          </View>

          <Button title="Save" onPress={handleAdd} style={{ marginTop: spacing.lg }} />
        </Card>
      )}

      {/* Recent Foods */}
      {recentFoods.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>⏱️ Recent Foods</Text>
          {recentFoods.map((food, idx) => (
            <TouchableOpacity
              key={`${food.name}-${idx}`}
              style={styles.recentItem}
              onPress={() => {
                addFoodEntry({
                  name: food.name,
                  calories: food.calories,
                  quantity: 1,
                  unit: food.unit,
                  mealType: 'snack',
                  date: today,
                });
                Alert.alert('Added!', `${food.name} added to Snacks.`);
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.recentName}>{food.name}</Text>
                <Text style={styles.recentCals}>{food.calories} kcal · {food.unit}</Text>
              </View>
              <Text style={styles.recentAdd}>+ Add</Text>
            </TouchableOpacity>
          ))}
        </>
      )}
    </ScrollView>
  );
}

function ActivitiesTab() {
  const addActivityEntry = useNutrioStore((s) => s.addActivityEntry);
  const activityEntries = useNutrioStore((s) => s.activityEntries);
  const removeActivityEntry = useNutrioStore((s) => s.removeActivityEntry);
  const today = getTodayString();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [burned, setBurned] = useState('');

  const todayActivities = activityEntries.filter((a) => a.date === today);

  const resetForm = () => {
    setName('');
    setDuration('');
    setBurned('');
    setShowForm(false);
  };

  const handleAdd = () => {
    const dur = parseInt(duration, 10);
    const cal = parseInt(burned, 10);
    if (!name.trim() || !dur || !cal) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }
    addActivityEntry({ name: name.trim(), durationMinutes: dur, caloriesBurned: cal, date: today });
    resetForm();
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Button
        title={showForm ? 'Cancel' : '+ Add Activity'}
        variant={showForm ? 'ghost' : 'primary'}
        onPress={() => (showForm ? resetForm() : setShowForm(true))}
      />

      {showForm && (
        <Card style={styles.formCard}>
          <Text style={styles.formTitle}>New Activity</Text>
          <Input label="Activity name" value={name} onChangeText={setName} placeholder="e.g. Walking" />
          <Input label="Duration" value={duration} onChangeText={setDuration} placeholder="30" keyboardType="numeric" suffix="min" />
          <Input label="Calories burned" value={burned} onChangeText={setBurned} placeholder="150" keyboardType="numeric" suffix="kcal" />
          <Button title="Save" onPress={handleAdd} style={{ marginTop: spacing.lg }} />
        </Card>
      )}

      {/* Today's Activities */}
      <Text style={styles.sectionTitle}>🏃 Today's Activities</Text>
      {todayActivities.length === 0 ? (
        <Text style={styles.emptyText}>No activities logged today.</Text>
      ) : (
        todayActivities.map((a) => (
          <Card key={a.id} style={styles.activityItem}>
            <View style={styles.activityRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.activityName}>{a.name}</Text>
                <Text style={styles.activityMeta}>{a.durationMinutes} min · {a.caloriesBurned} kcal burned</Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert('Delete', `Remove ${a.name}?`, [
                    { text: 'Cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => removeActivityEntry(a.id) },
                  ])
                }
              >
                <Text style={styles.deleteBtn}>✕</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  screenTitle: { ...typography.h1, color: colors.text, paddingHorizontal: spacing.xl, marginTop: spacing.lg, marginBottom: spacing.md },
  tabs: { flexDirection: 'row', marginHorizontal: spacing.xl, backgroundColor: colors.surfaceAlt, borderRadius: radii.lg, padding: 4, marginBottom: spacing.lg },
  tab: { flex: 1, paddingVertical: spacing.md, borderRadius: radii.md, alignItems: 'center' },
  tabActive: { backgroundColor: colors.surface, ...shadows.sm },
  tabText: { ...typography.bodyBold, color: colors.textTertiary },
  tabTextActive: { color: colors.text },
  scrollContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.huge },
  formCard: { marginTop: spacing.lg },
  formTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.lg },
  fieldLabel: { ...typography.captionBold, color: colors.textSecondary, marginBottom: spacing.sm, marginTop: spacing.md, textTransform: 'uppercase', letterSpacing: 0.5 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  sectionTitle: { ...typography.h3, color: colors.text, marginTop: spacing.xxl, marginBottom: spacing.md },
  recentItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radii.lg, marginBottom: spacing.sm, ...shadows.sm },
  recentName: { ...typography.bodyBold, color: colors.text },
  recentCals: { ...typography.caption, color: colors.textSecondary },
  recentAdd: { ...typography.captionBold, color: colors.primary },
  emptyText: { ...typography.body, color: colors.textTertiary, textAlign: 'center', paddingVertical: spacing.xxl },
  activityItem: { marginBottom: spacing.sm },
  activityRow: { flexDirection: 'row', alignItems: 'center' },
  activityName: { ...typography.bodyBold, color: colors.text },
  activityMeta: { ...typography.caption, color: colors.textSecondary },
  deleteBtn: { fontSize: 16, color: colors.error, padding: spacing.sm },
});
