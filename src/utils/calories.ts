import { Gender, Goal, ActivityLevel } from '../types';
import { getAge } from './date';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
};

const GOAL_ADJUSTMENTS: Record<Goal, number> = {
  lose_weight: -500,
  gain_muscle: 300,
  maintain_weight: 0,
  boost_energy: 0,
  improve_nutrition: 0,
  gain_weight: 500,
};

/** Mifflin-St Jeor equation */
export function calculateBMR(
  gender: Gender,
  weightKg: number,
  heightCm: number,
  birthdate: string
): number {
  const age = getAge(birthdate);
  if (gender === 'male') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  }
  // female or other
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
}

export function calculateDailyCalories(
  gender: Gender,
  weightKg: number,
  heightCm: number,
  birthdate: string,
  activityLevel: ActivityLevel,
  goal: Goal
): number {
  const bmr = calculateBMR(gender, weightKg, heightCm, birthdate);
  const tdee = bmr * ACTIVITY_MULTIPLIERS[activityLevel];
  const adjusted = tdee + GOAL_ADJUSTMENTS[goal];
  return Math.round(Math.max(adjusted, 1200)); // never below 1200
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}
