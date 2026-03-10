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
  lose_weight: 'Жингээ хасах',
  gain_muscle: 'Булчин нэмэх',
  maintain_weight: 'Жингээ хадгалах',
  boost_energy: 'Эрч хүч нэмэх',
  improve_nutrition: 'Хоол хүнс сайжруулах',
  gain_weight: 'Жингээ нэмэх',
};

export const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: 'Огт дасгал хийдэггүй',
  lightly_active: 'Бага идэвхтэй',
  moderately_active: 'Дунд идэвхтэй',
  very_active: 'Маш идэвхтэй',
};

export const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Өглөөний цай',
  lunch: 'Өдрийн хоол',
  dinner: 'Оройн хоол',
  snack: 'Хөнгөн зууш',
};

export const MEAL_EMOJIS: Record<string, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍪',
};
