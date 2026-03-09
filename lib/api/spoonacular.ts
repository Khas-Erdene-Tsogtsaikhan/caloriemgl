import Constants from 'expo-constants';

const SPOONACULAR_BASE = 'https://api.spoonacular.com';
const IMAGE_BASE = 'https://img.spoonacular.com/recipes';

const PREFERRED_SIZES = ['636x393', '556x370'] as const;
export type PreferredSize = (typeof PREFERRED_SIZES)[number];

function getApiKey(): string | undefined {
  return Constants.expoConfig?.extra?.SPOONACULAR_API_KEY as string | undefined;
}

/** Upgrade any Spoonacular image size (-90x90, -240x150, -312x231, etc.) to preferred size for sharper display */
export function resolveImageUrl(image: string | undefined, size: PreferredSize = '636x393'): string {
  if (!image) return '';
  const url = image.startsWith('http') ? image : `${IMAGE_BASE}/${image}`;
  return url.replace(/-\d+x\d+(?=\.\w+$)/, `-${size}`);
}

export interface RecipeNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface RecipeSearchResult {
  id: number;
  title: string;
  image: string;
  imageType?: string;
  readyInMinutes: number;
  servings: number;
  nutrition?: RecipeNutrition;
}

export interface ExtendedIngredient {
  id: number;
  name: string;
  original: string;
  amount: number;
  unit: string;
}

export interface AnalyzedStep {
  number: number;
  step: string;
}

export interface RecipeDetail {
  id: number;
  title: string;
  image: string;
  servings: number;
  readyInMinutes: number;
  extendedIngredients: ExtendedIngredient[];
  analyzedInstructions: Array<{ steps: AnalyzedStep[] }>;
  instructions: string;
  nutrition?: {
    nutrients: Array<{ name: string; amount: number; unit: string }>;
  };
}

function extractNutritionFromNutrients(nutrients: Array<{ name: string; amount: number; unit: string }> | undefined): RecipeNutrition {
  if (!nutrients?.length) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const getVal = (names: string[], exactOnly = false) => {
    for (const name of names) {
      const lower = name.toLowerCase();
      const exact = nutrients.find((x) => x.name.toLowerCase() === lower);
      if (exact) return exact.amount;
      if (!exactOnly) {
        const partial = nutrients.find((x) => {
          const xLower = x.name.toLowerCase();
          if (xLower === lower) return true;
          if (xLower.includes(lower)) {
            // For "fat", avoid "saturated fat", "trans fat", etc.
            if (lower === 'fat' && (xLower.includes('saturated') || xLower.includes('trans') || xLower.includes('poly') || xLower.includes('mono')))
              return false;
            return true;
          }
          return false;
        });
        if (partial) return partial.amount;
      }
    }
    return 0;
  };
  return {
    calories: Math.round(getVal(['Calories', 'Energy']) * 10) / 10,
    protein: Math.round(getVal(['Protein']) * 10) / 10,
    carbs: Math.round(getVal(['Carbohydrates', 'Carbohydrate']) * 10) / 10,
    fat: Math.round(getVal(['Fat']) * 10) / 10,
  };
}

function parseNutritionFromApi(apiNutrition: unknown): RecipeNutrition | undefined {
  if (!apiNutrition || typeof apiNutrition !== 'object') return undefined;
  const n = apiNutrition as Record<string, unknown>;

  // Format 1: nutrition.nutrients array (standard Spoonacular format)
  const nutrients = n.nutrients as Array<{ name: string; amount: number; unit: string }> | undefined;
  if (Array.isArray(nutrients) && nutrients.length > 0) {
    const parsed = extractNutritionFromNutrients(nutrients);
    if (parsed.calories > 0 || parsed.protein > 0 || parsed.carbs > 0 || parsed.fat > 0) {
      return parsed;
    }
  }

  // Format 2: flat object { calories, protein, fat, carbohydrates }
  const flatCal = typeof n.calories === 'number' ? n.calories : undefined;
  const flatProtein = typeof n.protein === 'number' ? n.protein : undefined;
  const flatFat = typeof n.fat === 'number' ? n.fat : undefined;
  const flatCarbs = typeof n.carbohydrates === 'number' ? n.carbohydrates : typeof n.carbs === 'number' ? n.carbs : undefined;
  if (flatCal !== undefined || flatProtein !== undefined || flatFat !== undefined || flatCarbs !== undefined) {
    return {
      calories: Math.round((flatCal ?? 0) * 10) / 10,
      protein: Math.round((flatProtein ?? 0) * 10) / 10,
      carbs: Math.round((flatCarbs ?? 0) * 10) / 10,
      fat: Math.round((flatFat ?? 0) * 10) / 10,
    };
  }

  return undefined;
}

/** Parse nutrition from API response - exported for recipe detail screen */
export function parseRecipeNutrition(apiNutrition: unknown): RecipeNutrition | null {
  const parsed = parseNutritionFromApi(apiNutrition);
  return parsed ?? null;
}

export async function searchRecipes(
  query: string,
  options?: { number?: number; offset?: number; type?: string; diet?: string }
): Promise<RecipeSearchResult[]> {
  const apiKey = getApiKey();
  if (!apiKey) return [];

  const params = new URLSearchParams({
    apiKey,
    query: query.trim() || 'pasta',
    addRecipeNutrition: 'true',
    addRecipeInformation: 'true',
    number: String(options?.number ?? 20),
    offset: String(options?.offset ?? 0),
  });
  if (options?.type) params.set('type', options.type);
  if (options?.diet) params.set('diet', options.diet);

  const res = await fetch(`${SPOONACULAR_BASE}/recipes/complexSearch?${params}`);
  if (!res.ok) throw new Error(`Spoonacular search failed: ${res.status}`);

  const data = await res.json();
  const results = data.results ?? [];

  return results.map((r: Record<string, unknown>) => {
    const nutrition = parseNutritionFromApi(r.nutrition);
    return {
      id: r.id as number,
      title: (r.title as string) ?? '',
      image: resolveImageUrl(r.image as string, '636x393'),
      imageType: r.imageType as string | undefined,
      readyInMinutes: (r.readyInMinutes as number) ?? 0,
      servings: (r.servings as number) ?? 1,
      nutrition: nutrition ?? undefined,
    };
  });
}

export async function getRandomRecipes(number: number = 10): Promise<RecipeSearchResult[]> {
  const apiKey = getApiKey();
  if (!apiKey) return [];

  const params = new URLSearchParams({
    apiKey,
    number: String(number),
    includeNutrition: 'true',
  });

  const res = await fetch(`${SPOONACULAR_BASE}/recipes/random?${params}`);
  if (!res.ok) throw new Error(`Spoonacular random failed: ${res.status}`);

  const data = await res.json();
  const recipes = data.recipes ?? [];

  return recipes.map((r: Record<string, unknown>) => {
    const nutrition = parseNutritionFromApi(r.nutrition);
    return {
      id: r.id as number,
      title: (r.title as string) ?? '',
      image: resolveImageUrl(r.image as string, '636x393'),
      imageType: r.imageType as string | undefined,
      readyInMinutes: (r.readyInMinutes as number) ?? 0,
      servings: (r.servings as number) ?? 1,
      nutrition: nutrition ?? undefined,
    };
  });
}

export async function getRecipeById(id: number): Promise<RecipeDetail | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const params = new URLSearchParams({
    apiKey,
    includeNutrition: 'true',
  });

  const res = await fetch(`${SPOONACULAR_BASE}/recipes/${id}/information?${params}`);
  if (!res.ok) return null;

  const r = await res.json();

  const instructions =
    r.analyzedInstructions?.[0]?.steps?.map((s: { step: string }) => s.step).join('\n\n') ?? r.instructions ?? '';

  return {
    id: r.id,
    title: r.title ?? '',
    image: resolveImageUrl(r.image, '636x393'),
    servings: r.servings ?? 1,
    readyInMinutes: r.readyInMinutes ?? 0,
    extendedIngredients: r.extendedIngredients ?? [],
    analyzedInstructions: r.analyzedInstructions ?? [],
    instructions,
    nutrition: r.nutrition,
  };
}
