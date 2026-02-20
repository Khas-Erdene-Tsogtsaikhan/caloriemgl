import { z } from 'zod';
import { run, getAll, initDb } from '@/lib/db/db';
import { makeId } from '@/lib/db/ids';

const insertLogSchema = z.object({
  food_id: z.string(),
  logged_at: z.string(),
  log_date: z.string(),
  meal: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  unit_mode: z.enum(['grams', 'portion']),
  quantity: z.number().min(0.001),
  portion_id: z.string().nullable(),
  portion_label_mn: z.string(),
  grams_total: z.number().min(0),
  calories: z.number().min(0),
  protein_g: z.number().min(0),
  carbs_g: z.number().min(0),
  fat_g: z.number().min(0),
  metadata: z.object({ recipeId: z.number(), imageUrl: z.string() }).optional(),
});

export type InsertLogPayload = z.infer<typeof insertLogSchema>;

export interface FoodLogRow {
  id: string;
  user_id: string;
  food_id: string;
  logged_at: string;
  log_date?: string;
  meal: string;
  unit_mode: string;
  quantity: number;
  portion_id: string | null;
  portion_label_mn: string;
  grams_total: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  name_mn?: string;
  metadata?: string;
}

const USER_ID = 'local-user';

export async function insertLog(payload: InsertLogPayload): Promise<FoodLogRow> {
  const parsed = insertLogSchema.parse(payload);
  await initDb();

  const id = makeId();
  const metadataJson = parsed.metadata ? JSON.stringify(parsed.metadata) : null;
  await run(
    `INSERT INTO food_logs (id, user_id, food_id, logged_at, log_date, meal, unit_mode, quantity, portion_id, portion_label_mn, grams_total, calories, protein_g, carbs_g, fat_g, metadata)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      USER_ID,
      parsed.food_id,
      parsed.logged_at,
      parsed.log_date,
      parsed.meal,
      parsed.unit_mode,
      parsed.quantity,
      parsed.portion_id,
      parsed.portion_label_mn,
      parsed.grams_total,
      parsed.calories,
      parsed.protein_g,
      parsed.carbs_g,
      parsed.fat_g,
      metadataJson,
    ]
  );

  const row = await getAll<FoodLogRow>(`SELECT * FROM food_logs WHERE id = ?`, [id]);
  if (!row[0]) throw new Error('Failed to insert log');
  return row[0];
}

export async function listLogsByDay(date: string): Promise<FoodLogRow[]> {
  await initDb();
  const rows = await getAll<FoodLogRow & { name_mn: string }>(
    `SELECT l.*, f.name_mn FROM food_logs l JOIN foods f ON f.id = l.food_id WHERE l.user_id = ? AND l.log_date = ? ORDER BY l.logged_at ASC`,
    [USER_ID, date]
  );
  return rows;
}

export async function listLogsForRange(startDate: string, endDate: string): Promise<FoodLogRow[]> {
  await initDb();
  const rows = await getAll<FoodLogRow & { name_mn: string }>(
    `SELECT l.*, f.name_mn FROM food_logs l JOIN foods f ON f.id = l.food_id WHERE l.user_id = ? AND l.log_date >= ? AND l.log_date <= ? ORDER BY l.log_date ASC, l.logged_at ASC`,
    [USER_ID, startDate, endDate]
  );
  return rows;
}

export async function deleteLog(id: string): Promise<void> {
  await run(`DELETE FROM food_logs WHERE id = ?`, [id]);
}

export async function copyLogsFromDay(fromDate: string, toDate: string): Promise<number> {
  await initDb();
  const logs = await listLogsByDay(fromDate);
  let count = 0;
  for (const log of logs) {
    await insertLog({
      food_id: log.food_id,
      logged_at: new Date().toISOString(),
      log_date: toDate,
      meal: log.meal as InsertLogPayload['meal'],
      unit_mode: log.unit_mode as InsertLogPayload['unit_mode'],
      quantity: log.quantity,
      portion_id: log.portion_id,
      portion_label_mn: log.portion_label_mn,
      grams_total: log.grams_total,
      calories: log.calories,
      protein_g: log.protein_g,
      carbs_g: log.carbs_g,
      fat_g: log.fat_g,
    });
    count++;
  }
  return count;
}

export interface RecentFoodRow {
  food_id: string;
  name_mn: string;
  name_en: string | null;
  calories_per_100g: number;
  protein_g_per_100g: number;
  carbs_g_per_100g: number;
  fat_g_per_100g: number;
}

export async function listRecentFoods(limit: number = 10): Promise<RecentFoodRow[]> {
  await initDb();
  const rows = await getAll<RecentFoodRow & { logged_at: string }>(
    `SELECT DISTINCT f.id as food_id, f.name_mn, f.name_en, f.calories_per_100g, f.protein_g_per_100g, f.carbs_g_per_100g, f.fat_g_per_100g, l.logged_at
     FROM food_logs l
     JOIN foods f ON f.id = l.food_id
     WHERE l.user_id = ?
     ORDER BY l.logged_at DESC
     LIMIT ?`,
    [USER_ID, limit]
  );
  const seen = new Set<string>();
  const result: RecentFoodRow[] = [];
  for (const r of rows) {
    if (seen.has(r.food_id)) continue;
    seen.add(r.food_id);
    result.push({
      food_id: r.food_id,
      name_mn: r.name_mn,
      name_en: r.name_en,
      calories_per_100g: r.calories_per_100g,
      protein_g_per_100g: r.protein_g_per_100g,
      carbs_g_per_100g: r.carbs_g_per_100g,
      fat_g_per_100g: r.fat_g_per_100g,
    });
  }
  return result;
}
