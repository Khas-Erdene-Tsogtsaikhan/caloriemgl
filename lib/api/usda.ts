const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1';

export interface UsdaSearchResult {
  fdcId: number;
  description: string;
  score: number;
  foodNutrients?: Array<{
    nutrientId: number;
    nutrientName: string;
    unitName: string;
    value: number;
    amount?: number;
  }>;
  servingSize?: number;
  servingSizeUnit?: string;
}

export interface UsdaFoodDetail {
  fdcId: number;
  description: string;
  foodNutrients: Array<{
    nutrientId: number;
    nutrientName: string;
    unitName: string;
    value: number;
    amount?: number;
  }>;
  servingSize?: number;
  servingSizeUnit?: string;
}

export interface Per100gResult {
  calories_per_100g: number;
  protein_g_per_100g: number;
  carbs_g_per_100g: number;
  fat_g_per_100g: number;
  name_en: string;
}

const NUTRIENT_IDS = {
  energy: 1008,
  protein: 1003,
  carbs: 1005,
  fat: 1004,
};

function getNutrientValue(
  nutrients: Array<{ nutrientId: number; value: number; amount?: number }>,
  nutrientId: number
): number {
  const n = nutrients.find((x) => x.nutrientId === nutrientId);
  return n?.value ?? 0;
}

function extractPer100gFromNutrients(
  nutrients: Array<{ nutrientId: number; value: number; amount?: number }>,
  name: string
): Per100gResult | null {
  const energy = getNutrientValue(nutrients, NUTRIENT_IDS.energy);
  const protein = getNutrientValue(nutrients, NUTRIENT_IDS.protein);
  const carbs = getNutrientValue(nutrients, NUTRIENT_IDS.carbs);
  const fat = getNutrientValue(nutrients, NUTRIENT_IDS.fat);

  if (energy <= 0 && protein <= 0 && carbs <= 0 && fat <= 0) return null;

  return {
    calories_per_100g: energy > 0 ? energy : 0,
    protein_g_per_100g: protein > 0 ? protein : 0,
    carbs_g_per_100g: carbs > 0 ? carbs : 0,
    fat_g_per_100g: fat > 0 ? fat : 0,
    name_en: name,
  };
}

/**
 * Normalize nutrient values to per 100g if they are per serving.
 */
function normalizeToPer100g(
  detail: UsdaFoodDetail,
  nutrients: Array<{ nutrientId: number; value: number; amount?: number }>
): Per100gResult | null {
  const servingSize = detail.servingSize;
  const servingUnit = detail.servingSizeUnit?.toLowerCase();

  if (servingSize && servingUnit === 'g' && servingSize > 0) {
    const factor = 100 / servingSize;
    const energy = getNutrientValue(nutrients, NUTRIENT_IDS.energy) * factor;
    const protein = getNutrientValue(nutrients, NUTRIENT_IDS.protein) * factor;
    const carbs = getNutrientValue(nutrients, NUTRIENT_IDS.carbs) * factor;
    const fat = getNutrientValue(nutrients, NUTRIENT_IDS.fat) * factor;
    return {
      calories_per_100g: Math.round(energy * 10) / 10,
      protein_g_per_100g: Math.round(protein * 10) / 10,
      carbs_g_per_100g: Math.round(carbs * 10) / 10,
      fat_g_per_100g: Math.round(fat * 10) / 10,
      name_en: detail.description,
    };
  }

  return extractPer100gFromNutrients(nutrients, detail.description);
}

export async function searchFoods(
  queryEn: string,
  apiKey: string
): Promise<UsdaSearchResult[]> {
  const url = `${USDA_BASE}/foods/search?api_key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: queryEn,
      dataType: ['Foundation', 'Survey (FNDDS)', 'SR Legacy'],
      pageSize: 10,
    }),
  });
  if (!res.ok) throw new Error(`USDA search failed: ${res.status}`);
  const data = await res.json();
  return data.foods ?? [];
}

export async function getFood(fdcId: number, apiKey: string): Promise<UsdaFoodDetail> {
  const url = `${USDA_BASE}/food/${fdcId}?api_key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`USDA get food failed: ${res.status}`);
  return res.json();
}

/**
 * Fetch top USDA result and extract per-100g macros.
 * Returns null if extraction fails.
 */
export async function fetchAndExtractTopFood(
  queryEn: string,
  apiKey: string
): Promise<{ fdcId: number; name_en: string; per100g: Per100gResult } | null> {
  const foods = await searchFoods(queryEn, apiKey);
  if (foods.length === 0) return null;

  const top = foods[0];
  const detail = await getFood(top.fdcId, apiKey);
  const nutrients = detail.foodNutrients ?? [];

  const per100g = normalizeToPer100g(detail, nutrients);
  if (!per100g) return null;

  return {
    fdcId: detail.fdcId,
    name_en: detail.description,
    per100g,
  };
}
