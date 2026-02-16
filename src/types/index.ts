export type Gender = 'male' | 'female' | 'other';

export type Goal =
  | 'lose_weight'
  | 'gain_muscle'
  | 'maintain_weight'
  | 'boost_energy'
  | 'improve_nutrition'
  | 'gain_weight';

export type ActivityLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type FoodUnit = 'ширхэг (piece)' | 'аяга (cup)' | 'таваг (plate)' | 'хувь (serving)';

export interface UserProfile {
  name: string;
  gender: Gender;
  birthdate: string; // ISO string
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  goal: Goal;
  activityLevel: ActivityLevel;
  onboardingCompleted: boolean;
  dailyCalorieGoal: number;
}

export interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  quantity: number;
  unit: FoodUnit;
  mealType: MealType;
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO string
}

export interface ActivityEntry {
  id: string;
  name: string;
  durationMinutes: number;
  caloriesBurned: number;
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO string
}

export interface WaterEntry {
  date: string; // YYYY-MM-DD
  totalMl: number;
}

export interface WeightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  bmi: number;
}

export interface FoodPreset {
  id: string;
  name: string;
  nameEn: string;
  emoji: string;
  defaultUnit: FoodUnit;
  caloriesPerUnit: number;
}
