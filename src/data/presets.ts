import { FoodPreset } from '../types';

export const MONGOLIAN_FOOD_PRESETS: FoodPreset[] = [
  { id: 'buuz', name: 'Бууз', nameEn: 'Buuz (steamed dumpling)', emoji: '🥟', defaultUnit: 'ширхэг (piece)', caloriesPerUnit: 70 },
  { id: 'khuushuur', name: 'Хуушуур', nameEn: 'Khuushuur (fried dumpling)', emoji: '🥟', defaultUnit: 'ширхэг (piece)', caloriesPerUnit: 120 },
  { id: 'bansh', name: 'Банш', nameEn: 'Bansh (small dumpling)', emoji: '🥟', defaultUnit: 'ширхэг (piece)', caloriesPerUnit: 35 },
  { id: 'tsuivan', name: 'Цуйван', nameEn: 'Tsuivan (stir-fried noodles)', emoji: '🍜', defaultUnit: 'таваг (plate)', caloriesPerUnit: 450 },
  { id: 'guriltai_shol', name: 'Гурилтай шөл', nameEn: 'Guriltai shöl (noodle soup)', emoji: '🍲', defaultUnit: 'аяга (cup)', caloriesPerUnit: 320 },
  { id: 'suutei_tsai', name: 'Сүүтэй цай', nameEn: 'Suutei tsai (milk tea)', emoji: '🍵', defaultUnit: 'аяга (cup)', caloriesPerUnit: 60 },
  { id: 'airag', name: 'Айраг', nameEn: 'Airag (fermented mare milk)', emoji: '🥛', defaultUnit: 'аяга (cup)', caloriesPerUnit: 50 },
  { id: 'aaruul', name: 'Аарууд', nameEn: 'Aaruul (dried curd)', emoji: '🧀', defaultUnit: 'ширхэг (piece)', caloriesPerUnit: 45 },
  { id: 'boortsog', name: 'Боорцог', nameEn: 'Boortsog (fried dough)', emoji: '🍩', defaultUnit: 'ширхэг (piece)', caloriesPerUnit: 80 },
  { id: 'khorkhog', name: 'Хорхог', nameEn: 'Khorkhog (meat stew)', emoji: '🍖', defaultUnit: 'таваг (plate)', caloriesPerUnit: 550 },
  { id: 'budaatai_huurga', name: 'Будаатай хуурга', nameEn: 'Budaatai khuurga (fried rice)', emoji: '🍚', defaultUnit: 'таваг (plate)', caloriesPerUnit: 420 },
  { id: 'shorlog', name: 'Шорлог', nameEn: 'Shorlog (kebab)', emoji: '🍢', defaultUnit: 'ширхэг (piece)', caloriesPerUnit: 150 },
  { id: 'gambir', name: 'Гамбир', nameEn: 'Gambir (pancake)', emoji: '🥞', defaultUnit: 'ширхэг (piece)', caloriesPerUnit: 180 },
  { id: 'piroshki', name: 'Пирошки', nameEn: 'Piroshki (meat pastry)', emoji: '🥧', defaultUnit: 'ширхэг (piece)', caloriesPerUnit: 200 },
  { id: 'niislel_salat', name: 'Нийслэл салат', nameEn: 'Capital salad', emoji: '🥗', defaultUnit: 'таваг (plate)', caloriesPerUnit: 280 },
  { id: 'orom', name: 'Өрөм', nameEn: 'Öröm (clotted cream)', emoji: '🍦', defaultUnit: 'хувь (serving)', caloriesPerUnit: 150 },
  { id: 'tarag', name: 'Тараг', nameEn: 'Tarag (yogurt)', emoji: '🥛', defaultUnit: 'аяга (cup)', caloriesPerUnit: 90 },
  { id: 'ul_boov', name: 'Үл боов', nameEn: 'Ul boov (layered cake)', emoji: '🍰', defaultUnit: 'ширхэг (piece)', caloriesPerUnit: 160 },
  { id: 'chanasan_makh', name: 'Чанасан мах', nameEn: 'Boiled meat', emoji: '🥩', defaultUnit: 'хувь (serving)', caloriesPerUnit: 350 },
  { id: 'shol', name: 'Шөл', nameEn: 'Meat broth soup', emoji: '🍲', defaultUnit: 'аяга (cup)', caloriesPerUnit: 180 },
  { id: 'byaslag', name: 'Бяслаг', nameEn: 'Byaslag (cheese)', emoji: '🧀', defaultUnit: 'ширхэг (piece)', caloriesPerUnit: 90 },
  { id: 'tsagaan_idee', name: 'Цагаан идээ', nameEn: 'White food (dairy mix)', emoji: '🥛', defaultUnit: 'аяга (cup)', caloriesPerUnit: 120 },
  { id: 'makh_shuus', name: 'Махны шүүс', nameEn: 'Meat juice/broth', emoji: '🥤', defaultUnit: 'аяга (cup)', caloriesPerUnit: 80 },
  { id: 'lapsha', name: 'Лапша', nameEn: 'Lapsha (noodle soup)', emoji: '🍜', defaultUnit: 'аяга (cup)', caloriesPerUnit: 300 },
  { id: 'mantuu', name: 'Мантуу', nameEn: 'Mantuu (steamed bun)', emoji: '🍞', defaultUnit: 'ширхэг (piece)', caloriesPerUnit: 130 },
  { id: 'talh', name: 'Талх', nameEn: 'Bread', emoji: '🍞', defaultUnit: 'ширхэг (piece)', caloriesPerUnit: 90 },
  { id: 'undaa', name: 'Ундаа', nameEn: 'Soft drink', emoji: '🥤', defaultUnit: 'аяга (cup)', caloriesPerUnit: 140 },
  { id: 'shar_tos', name: 'Шар тос', nameEn: 'Yellow butter', emoji: '🧈', defaultUnit: 'хувь (serving)', caloriesPerUnit: 100 },
  { id: 'huruud', name: 'Хурууд', nameEn: 'Huruud (dried meat strips)', emoji: '🥩', defaultUnit: 'ширхэг (piece)', caloriesPerUnit: 60 },
  { id: 'borts', name: 'Борц', nameEn: 'Borts (dried meat)', emoji: '🥩', defaultUnit: 'хувь (serving)', caloriesPerUnit: 250 },
];

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
