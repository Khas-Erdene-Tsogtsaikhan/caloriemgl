import { run, getAll, getOne, initDb } from '@/lib/db/db';
import { makeId } from '@/lib/db/ids';

export interface FoodRow {
  id: string;
  source: string;
  source_id: string | null;
  name_mn: string;
  name_en: string | null;
  calories_per_100g: number;
  protein_g_per_100g: number;
  carbs_g_per_100g: number;
  fat_g_per_100g: number;
  created_at: string;
}

export interface FoodPortionRow {
  id: string;
  food_id: string;
  label_mn: string;
  grams: number;
  is_default: number;
}

function trigramSimilarity(a: string, b: string): number {
  const triA = new Set<string>();
  const triB = new Set<string>();
  for (let i = 0; i <= a.length - 3; i++) triA.add(a.slice(i, i + 3));
  for (let i = 0; i <= b.length - 3; i++) triB.add(b.slice(i, i + 3));
  if (triA.size === 0 || triB.size === 0) return 0;
  let overlap = 0;
  for (const t of triA) if (triB.has(t)) overlap++;
  return (2 * overlap) / (triA.size + triB.size);
}

function scoreFood(query: string, nameMn: string, aliases: string[]): number {
  const q = query.toLowerCase().trim();
  const name = nameMn.toLowerCase();
  const allText = [name, ...aliases.map((a) => a.toLowerCase())].join(' ');

  let score = 0;
  if (name.includes(q) || aliases.some((a) => a.toLowerCase().includes(q))) {
    score += 0.5;
  }
  if (name.startsWith(q) || aliases.some((a) => a.toLowerCase().startsWith(q))) {
    score += 0.3;
  }
  score += trigramSimilarity(q, allText) * 0.5;
  return score;
}

/** Case-insensitive includes for Cyrillic/Unicode (SQLite LIKE is case-sensitive for non-ASCII) */
function includesIgnoreCase(text: string, query: string): boolean {
  return text.toLowerCase().includes(query.toLowerCase());
}

export async function localSearchFoods(q: string): Promise<FoodRow[]> {
  if (!q.trim()) return [];

  await initDb();
  const query = q.trim();
  const queryLower = query.toLowerCase();

  // Fetch all foods with aliases - filter in JS for reliable Cyrillic/Unicode matching
  const rows = await getAll<FoodRow & { alias: string }>(
    `SELECT f.id, f.source, f.source_id, f.name_mn, f.name_en, f.calories_per_100g, f.protein_g_per_100g, f.carbs_g_per_100g, f.fat_g_per_100g, f.created_at, COALESCE(a.alias, '') as alias
     FROM foods f
     LEFT JOIN food_aliases a ON a.food_id = f.id`
  );

  const byId = new Map<string, { food: FoodRow; aliases: string[] }>();
  for (const r of rows) {
    const food: FoodRow = {
      id: r.id,
      source: r.source,
      source_id: r.source_id,
      name_mn: r.name_mn,
      name_en: r.name_en,
      calories_per_100g: r.calories_per_100g,
      protein_g_per_100g: r.protein_g_per_100g,
      carbs_g_per_100g: r.carbs_g_per_100g,
      fat_g_per_100g: r.fat_g_per_100g,
      created_at: r.created_at,
    };
    const existing = byId.get(r.id);
    const alias = r.alias?.trim();
    if (existing) {
      if (alias && !existing.aliases.includes(alias)) existing.aliases.push(alias);
    } else {
      byId.set(r.id, { food, aliases: alias ? [alias] : [] });
    }
  }

  const scored = Array.from(byId.values())
    .filter(({ food, aliases }) => {
      const nameMatch = includesIgnoreCase(food.name_mn, query);
      const aliasMatch = aliases.some((a) => includesIgnoreCase(a, query));
      const enMatch = food.name_en && includesIgnoreCase(food.name_en, query);
      return nameMatch || aliasMatch || !!enMatch;
    })
    .map(({ food, aliases }) => ({
      food,
      score: scoreFood(query, food.name_mn, aliases),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 50);

  return scored.map((x) => x.food);
}

export async function getFoodPortions(foodId: string): Promise<FoodPortionRow[]> {
  const rows = await getAll<FoodPortionRow>(
    `SELECT id, food_id, label_mn, grams, is_default FROM food_portions WHERE food_id = ? ORDER BY is_default DESC, grams ASC`,
    [foodId]
  );
  return rows;
}

export async function getFoodById(foodId: string): Promise<FoodRow | null> {
  const row = await getOne<FoodRow>(
    `SELECT id, source, source_id, name_mn, name_en, calories_per_100g, protein_g_per_100g, carbs_g_per_100g, fat_g_per_100g, created_at FROM foods WHERE id = ?`,
    [foodId]
  );
  return row;
}

export interface CreateCustomFoodPayload {
  name_mn: string;
  name_en?: string;
  calories_per_100g: number;
  protein_g_per_100g: number;
  carbs_g_per_100g: number;
  fat_g_per_100g: number;
  portions?: Array<{ label_mn: string; grams: number; is_default?: number }>;
}

export async function createCustomFood(payload: CreateCustomFoodPayload): Promise<FoodRow> {
  await initDb();
  const id = makeId();
  const now = new Date().toISOString();
  const nameEn = payload.name_en ?? payload.name_mn;

  await run(
    `INSERT INTO foods (id, source, source_id, name_mn, name_en, calories_per_100g, protein_g_per_100g, carbs_g_per_100g, fat_g_per_100g, created_at)
     VALUES (?, 'custom', NULL, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      payload.name_mn,
      nameEn,
      payload.calories_per_100g,
      payload.protein_g_per_100g,
      payload.carbs_g_per_100g,
      payload.fat_g_per_100g,
      now,
    ]
  );

  await run(
    `INSERT INTO food_aliases (id, food_id, alias, lang) VALUES (?, ?, ?, 'mn')`,
    [makeId(), id, payload.name_mn.toLowerCase().trim()]
  );

  const portions = payload.portions ?? [
    { label_mn: '100г', grams: 100, is_default: 1 },
    { label_mn: '1 ширхэг', grams: 100, is_default: 0 },
  ];
  for (const p of portions) {
    await run(
      `INSERT INTO food_portions (id, food_id, label_mn, grams, is_default) VALUES (?, ?, ?, ?, ?)`,
      [makeId(), id, p.label_mn, p.grams, p.is_default ?? 0]
    );
  }

  const food = await getFoodById(id);
  if (!food) throw new Error('Failed to create food');
  return food;
}

export interface UpsertUsdaPayload {
  fdcId: number;
  mnQuery: string;
  name_en: string;
  calories_per_100g: number;
  protein_g_per_100g: number;
  carbs_g_per_100g: number;
  fat_g_per_100g: number;
}

export interface CreateRecipeFoodPayload {
  recipeId: number;
  title: string;
  caloriesPerServing: number;
  proteinPerServing: number;
  carbsPerServing: number;
  fatPerServing: number;
}

const GRAMS_PER_SERVING = 250;

export async function getRecipeFoodBySourceId(sourceId: string): Promise<FoodRow | null> {
  await initDb();
  return getOne<FoodRow>(
    `SELECT id, source, source_id, name_mn, name_en, calories_per_100g, protein_g_per_100g, carbs_g_per_100g, fat_g_per_100g, created_at FROM foods WHERE source = 'recipe' AND source_id = ?`,
    [String(sourceId)]
  );
}

export async function createRecipeFood(payload: CreateRecipeFoodPayload): Promise<FoodRow> {
  await initDb();

  const existing = await getRecipeFoodBySourceId(String(payload.recipeId));
  if (existing) return existing;

  const factor = 100 / GRAMS_PER_SERVING;
  const calories_per_100g = Math.round(payload.caloriesPerServing * factor * 10) / 10;
  const protein_g_per_100g = Math.round(payload.proteinPerServing * factor * 10) / 10;
  const carbs_g_per_100g = Math.round(payload.carbsPerServing * factor * 10) / 10;
  const fat_g_per_100g = Math.round(payload.fatPerServing * factor * 10) / 10;

  const id = makeId();
  const now = new Date().toISOString();

  await run(
    `INSERT INTO foods (id, source, source_id, name_mn, name_en, calories_per_100g, protein_g_per_100g, carbs_g_per_100g, fat_g_per_100g, created_at)
     VALUES (?, 'recipe', ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      String(payload.recipeId),
      payload.title,
      payload.title,
      calories_per_100g,
      protein_g_per_100g,
      carbs_g_per_100g,
      fat_g_per_100g,
      now,
    ]
  );

  await run(
    `INSERT INTO food_aliases (id, food_id, alias, lang) VALUES (?, ?, ?, 'en')`,
    [makeId(), id, payload.title.toLowerCase().trim()]
  );

  await run(
    `INSERT INTO food_portions (id, food_id, label_mn, grams, is_default) VALUES (?, ?, ?, ?, ?)`,
    [makeId(), id, '1 ширхэг', GRAMS_PER_SERVING, 1]
  );

  const food = await getFoodById(id);
  if (!food) throw new Error('Failed to create recipe food');
  return food;
}

export async function upsertFoodFromUsda(payload: UpsertUsdaPayload): Promise<FoodRow> {
  await initDb();

  const existing = await getOne<{ id: string }>(
    `SELECT id FROM foods WHERE source = 'usda' AND source_id = ?`,
    [String(payload.fdcId)]
  );

  const id = existing?.id ?? makeId();
  const now = new Date().toISOString();

  if (existing) {
    await run(
      `UPDATE foods SET name_mn = COALESCE(name_mn, ?), name_en = ?, calories_per_100g = ?, protein_g_per_100g = ?, carbs_g_per_100g = ?, fat_g_per_100g = ? WHERE id = ?`,
      [
        payload.mnQuery,
        payload.name_en,
        payload.calories_per_100g,
        payload.protein_g_per_100g,
        payload.carbs_g_per_100g,
        payload.fat_g_per_100g,
        id,
      ]
    );
  } else {
    await run(
      `INSERT INTO foods (id, source, source_id, name_mn, name_en, calories_per_100g, protein_g_per_100g, carbs_g_per_100g, fat_g_per_100g, created_at)
       VALUES (?, 'usda', ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        String(payload.fdcId),
        payload.mnQuery,
        payload.name_en,
        payload.calories_per_100g,
        payload.protein_g_per_100g,
        payload.carbs_g_per_100g,
        payload.fat_g_per_100g,
        now,
      ]
    );

    await run(
      `INSERT OR IGNORE INTO food_aliases (id, food_id, alias, lang) VALUES (?, ?, ?, 'mn')`,
      [makeId(), id, payload.mnQuery.toLowerCase().trim()]
    );
    await run(
      `INSERT OR IGNORE INTO food_aliases (id, food_id, alias, lang) VALUES (?, ?, ?, 'en')`,
      [makeId(), id, payload.name_en.toLowerCase().trim()]
    );

    await run(
      `INSERT INTO food_portions (id, food_id, label_mn, grams, is_default) VALUES (?, ?, ?, ?, ?)`,
      [makeId(), id, '100г', 100, 1]
    );
  }

  const food = await getFoodById(id);
  if (!food) throw new Error('Failed to upsert USDA food');
  return food;
}

/**
 * Search local food database only (300+ common foods).
 */
export async function searchWithUsdaFallback(
  q: string,
  _usdaApiKey?: string
): Promise<FoodRow[]> {
  return localSearchFoods(q);
}
