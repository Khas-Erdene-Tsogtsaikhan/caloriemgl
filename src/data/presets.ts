import { FoodPreset, FoodUnit } from '../types';
import { MONGOLIAN_PRESETS, MongolianPresetFood } from './mongolianPresets';

/** Map mongolianPresets unit to FoodUnit */
const UNIT_MAP: Record<MongolianPresetFood['unit'], FoodUnit> = {
  piece: 'ширхэг (piece)',
  cup: 'аяга (cup)',
  bowl: 'аяга (cup)',
  plate: 'таваг (plate)',
};

/** Build FoodPreset[] from the authoritative mongolianPresets source */
export const MONGOLIAN_FOOD_PRESETS: FoodPreset[] = MONGOLIAN_PRESETS.map((p) => ({
  id: p.id,
  name: p.name_mn,
  nameEn: p.name_en ?? p.name_mn,
  emoji: p.emoji,
  defaultUnit: UNIT_MAP[p.unit],
  caloriesPerUnit: p.calories,
  protein_g: p.protein_g,
  carbs_g: p.carbs_g,
  fat_g: p.fat_g,
}));

export const GOAL_LABELS: Record<string, string> = {
  lose_weight: 'Lose weight',
  gain_muscle: 'Gain muscle',
  maintain_weight: 'Maintain weight',
  boost_energy: 'Boost energy',
  improve_nutrition: 'Improve nutrition',
  gain_weight: 'Gain weight',
};

export const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: 'Sedentary',
  lightly_active: 'Lightly active',
  moderately_active: 'Moderately active',
  very_active: 'Very active',
};

export const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snacks',
};

export const MEAL_EMOJIS: Record<string, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍪',
};
