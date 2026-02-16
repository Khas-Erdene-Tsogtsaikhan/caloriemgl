/**
 * BMI calculation and categorization utilities.
 */

export interface BmiCategory {
  label: string;
  color: string;
  min: number;
  max: number;
}

export const BMI_CATEGORIES: BmiCategory[] = [
  { label: 'Underweight', color: '#4A90D9', min: 0, max: 18.5 },
  { label: 'Normal', color: '#3B9B5E', min: 18.5, max: 25 },
  { label: 'Overweight', color: '#E8943A', min: 25, max: 30 },
  { label: 'Obese', color: '#DC4545', min: 30, max: 50 },
];

/** Calculate BMI from height (cm) and weight (kg) */
export function calcBMI(heightCm: number, weightKg: number): number {
  if (heightCm <= 0 || weightKg <= 0) return 0;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

/** Get the BMI category for a given BMI value */
export function categoryForBMI(bmi: number): BmiCategory {
  for (const cat of BMI_CATEGORIES) {
    if (bmi < cat.max) return cat;
  }
  return BMI_CATEGORIES[BMI_CATEGORIES.length - 1];
}
