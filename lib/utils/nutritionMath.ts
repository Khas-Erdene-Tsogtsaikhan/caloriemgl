export interface Per100g {
  calories_per_100g: number;
  protein_g_per_100g: number;
  carbs_g_per_100g: number;
  fat_g_per_100g: number;
}

export interface Totals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

/**
 * Compute nutrition totals from per-100g values and total grams.
 * Formula: total = per100g * grams_total / 100
 */
export function computeTotals(per100g: Per100g, grams_total: number): Totals {
  if (grams_total <= 0) {
    return { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };
  }
  const factor = grams_total / 100;
  return {
    calories: Math.round(per100g.calories_per_100g * factor * 10) / 10,
    protein_g: Math.round(per100g.protein_g_per_100g * factor * 10) / 10,
    carbs_g: Math.round(per100g.carbs_g_per_100g * factor * 10) / 10,
    fat_g: Math.round(per100g.fat_g_per_100g * factor * 10) / 10,
  };
}

export interface GramsTotalInput {
  unitMode: 'grams' | 'portion';
  gramsInput: number;
  portionGrams: number;
  quantity: number;
}

/**
 * Compute grams_total based on unit mode.
 * - grams: grams_total = gramsInput
 * - portion: grams_total = quantity * portion.grams
 */
export function computeGramsTotal(input: GramsTotalInput): number {
  if (input.unitMode === 'grams') {
    return Math.max(0, input.gramsInput);
  }
  return Math.max(0, input.quantity * input.portionGrams);
}
