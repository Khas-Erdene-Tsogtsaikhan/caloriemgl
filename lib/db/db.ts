import * as SQLite from 'expo-sqlite';
import { makeId } from './ids';

let db: SQLite.SQLiteDatabase | null = null;

const SEED_IDS = {
  egg: 'seed-ondog-0001',
  rice: 'seed-budaa-0002',
  chicken: 'seed-tahia-0003',
  milk: 'seed-suu-0004',
  bread: 'seed-talh-0005',
  banana: 'seed-banan-0006',
  apple: 'seed-alim-0007',
  beef: 'seed-uhri-0008',
  yogurt: 'seed-tarag-0009',
  cheese: 'seed-byaslag-0010',
  potato: 'seed-toms-0011',
  buuz: 'seed-buuz-0012',
  khuushuur: 'seed-huushuur-0013',
  tsuivan: 'seed-tsuivan-0014',
  soup: 'seed-shol-0015',
};

export async function openDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('calorie_tracker.db');
  return db;
}

export async function run(sql: string, params: (string | number | null)[] = []): Promise<void> {
  const database = await openDb();
  await database.runAsync(sql, params);
}

export async function getAll<T>(sql: string, params: (string | number | null)[] = []): Promise<T[]> {
  const database = await openDb();
  const result = await database.getAllAsync<T>(sql, params);
  return result;
}

export async function getOne<T>(sql: string, params: (string | number | null)[] = []): Promise<T | null> {
  const rows = await getAll<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

const SEED_FOODS: Array<{
  id: keyof typeof SEED_IDS;
  name_mn: string;
  name_en: string;
  calories_per_100g: number;
  protein_g_per_100g: number;
  carbs_g_per_100g: number;
  fat_g_per_100g: number;
  aliases: string[];
  portions: Array<{ label_mn: string; grams: number; is_default: number }>;
}> = [
  {
    id: 'egg',
    name_mn: 'Өндөг',
    name_en: 'Egg',
    calories_per_100g: 155,
    protein_g_per_100g: 13,
    carbs_g_per_100g: 1.1,
    fat_g_per_100g: 11,
    aliases: ['өндөг', 'egg', 'өндөгний'],
    portions: [
      { label_mn: '1 ширхэг', grams: 50, is_default: 1 },
      { label_mn: '2 ширхэг', grams: 100, is_default: 0 },
    ],
  },
  {
    id: 'rice',
    name_mn: 'Цагаан будаа',
    name_en: 'White rice cooked',
    calories_per_100g: 130,
    protein_g_per_100g: 2.7,
    carbs_g_per_100g: 28,
    fat_g_per_100g: 0.3,
    aliases: ['цагаан будаа', 'будаа', 'white rice', 'rice'],
    portions: [
      { label_mn: '1 аяга', grams: 158, is_default: 1 },
      { label_mn: '1 таваг', grams: 250, is_default: 0 },
    ],
  },
  {
    id: 'chicken',
    name_mn: 'Тахианы цээж',
    name_en: 'Chicken breast roasted',
    calories_per_100g: 165,
    protein_g_per_100g: 31,
    carbs_g_per_100g: 0,
    fat_g_per_100g: 3.6,
    aliases: ['тахианы цээж', 'тахиа', 'chicken breast', 'chicken'],
    portions: [
      { label_mn: '1 ширхэг', grams: 120, is_default: 1 },
      { label_mn: '100г', grams: 100, is_default: 0 },
    ],
  },
  {
    id: 'milk',
    name_mn: 'Сүү',
    name_en: 'Milk',
    calories_per_100g: 42,
    protein_g_per_100g: 3.4,
    carbs_g_per_100g: 5,
    fat_g_per_100g: 1,
    aliases: ['сүү', 'milk'],
    portions: [
      { label_mn: '1 аяга', grams: 250, is_default: 1 },
      { label_mn: '1 литр', grams: 1000, is_default: 0 },
    ],
  },
  {
    id: 'bread',
    name_mn: 'Талх',
    name_en: 'Bread',
    calories_per_100g: 265,
    protein_g_per_100g: 9,
    carbs_g_per_100g: 49,
    fat_g_per_100g: 3.2,
    aliases: ['талх', 'bread'],
    portions: [
      { label_mn: '1 ширхэг', grams: 30, is_default: 1 },
      { label_mn: '2 ширхэг', grams: 60, is_default: 0 },
    ],
  },
  {
    id: 'banana',
    name_mn: 'Банана',
    name_en: 'Banana',
    calories_per_100g: 89,
    protein_g_per_100g: 1.1,
    carbs_g_per_100g: 23,
    fat_g_per_100g: 0.3,
    aliases: ['банана', 'banana'],
    portions: [
      { label_mn: '1 ширхэг', grams: 118, is_default: 1 },
      { label_mn: '2 ширхэг', grams: 236, is_default: 0 },
    ],
  },
  {
    id: 'apple',
    name_mn: 'Алим',
    name_en: 'Apple',
    calories_per_100g: 52,
    protein_g_per_100g: 0.3,
    carbs_g_per_100g: 14,
    fat_g_per_100g: 0.2,
    aliases: ['алим', 'apple'],
    portions: [
      { label_mn: '1 ширхэг', grams: 182, is_default: 1 },
      { label_mn: '2 ширхэг', grams: 364, is_default: 0 },
    ],
  },
  {
    id: 'beef',
    name_mn: 'Үхрийн мах',
    name_en: 'Beef',
    calories_per_100g: 250,
    protein_g_per_100g: 26,
    carbs_g_per_100g: 0,
    fat_g_per_100g: 15,
    aliases: ['үхрийн мах', 'мах', 'beef', 'үхэр'],
    portions: [
      { label_mn: '100г', grams: 100, is_default: 1 },
      { label_mn: '1 таваг', grams: 200, is_default: 0 },
    ],
  },
  {
    id: 'yogurt',
    name_mn: 'Тараг',
    name_en: 'Yogurt',
    calories_per_100g: 59,
    protein_g_per_100g: 10,
    carbs_g_per_100g: 3.5,
    fat_g_per_100g: 0.4,
    aliases: ['тараг', 'yogurt'],
    portions: [
      { label_mn: '1 аяга', grams: 200, is_default: 1 },
      { label_mn: '100г', grams: 100, is_default: 0 },
    ],
  },
  {
    id: 'cheese',
    name_mn: 'Бяслаг',
    name_en: 'Cheese',
    calories_per_100g: 402,
    protein_g_per_100g: 25,
    carbs_g_per_100g: 1.3,
    fat_g_per_100g: 33,
    aliases: ['бяслаг', 'cheese'],
    portions: [
      { label_mn: '1 ширхэг', grams: 30, is_default: 1 },
      { label_mn: '100г', grams: 100, is_default: 0 },
    ],
  },
  {
    id: 'potato',
    name_mn: 'Төмс',
    name_en: 'Potato',
    calories_per_100g: 77,
    protein_g_per_100g: 2,
    carbs_g_per_100g: 17,
    fat_g_per_100g: 0.1,
    aliases: ['төмс', 'potato'],
    portions: [
      { label_mn: '1 ширхэг', grams: 170, is_default: 1 },
      { label_mn: '1 таваг', grams: 250, is_default: 0 },
    ],
  },
  {
    id: 'buuz',
    name_mn: 'Бууз',
    name_en: 'Buuz (steamed dumpling)',
    calories_per_100g: 150,
    protein_g_per_100g: 9,
    carbs_g_per_100g: 12,
    fat_g_per_100g: 7,
    aliases: ['бууз', 'buuz'],
    portions: [
      { label_mn: '1 ширхэг', grams: 50, is_default: 1 },
      { label_mn: '5 ширхэг', grams: 250, is_default: 0 },
    ],
  },
  {
    id: 'khuushuur',
    name_mn: 'Хуушуур',
    name_en: 'Khuushuur (fried dumpling)',
    calories_per_100g: 163,
    protein_g_per_100g: 6.3,
    carbs_g_per_100g: 12.5,
    fat_g_per_100g: 10,
    aliases: ['хуушуур', 'khuushuur'],
    portions: [
      { label_mn: '1 ширхэг', grams: 80, is_default: 1 },
      { label_mn: '2 ширхэг', grams: 160, is_default: 0 },
    ],
  },
  {
    id: 'tsuivan',
    name_mn: 'Цуйван',
    name_en: 'Tsuivan (stir-fried noodles)',
    calories_per_100g: 129,
    protein_g_per_100g: 6.3,
    carbs_g_per_100g: 12.9,
    fat_g_per_100g: 5.1,
    aliases: ['цуйван', 'tsuivan'],
    portions: [
      { label_mn: '1 таваг', grams: 350, is_default: 1 },
      { label_mn: '1 аяга', grams: 250, is_default: 0 },
    ],
  },
  {
    id: 'soup',
    name_mn: 'Шөл',
    name_en: 'Meat broth soup',
    calories_per_100g: 51,
    protein_g_per_100g: 3.4,
    carbs_g_per_100g: 2.3,
    fat_g_per_100g: 2.9,
    aliases: ['шөл', 'soup'],
    portions: [
      { label_mn: '1 аяга', grams: 350, is_default: 1 },
      { label_mn: '1 таваг', grams: 400, is_default: 0 },
    ],
  },
];

export async function initDb(): Promise<void> {
  const database = await openDb();

  await database.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS foods (
      id TEXT PRIMARY KEY,
      source TEXT NOT NULL DEFAULT 'custom',
      source_id TEXT,
      name_mn TEXT NOT NULL,
      name_en TEXT,
      calories_per_100g REAL NOT NULL,
      protein_g_per_100g REAL NOT NULL,
      carbs_g_per_100g REAL NOT NULL,
      fat_g_per_100g REAL NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS food_aliases (
      id TEXT PRIMARY KEY,
      food_id TEXT NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
      alias TEXT NOT NULL,
      lang TEXT NOT NULL DEFAULT 'mn',
      UNIQUE(food_id, alias)
    );

    CREATE TABLE IF NOT EXISTS food_portions (
      id TEXT PRIMARY KEY,
      food_id TEXT NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
      label_mn TEXT NOT NULL,
      grams REAL NOT NULL,
      is_default INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS food_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      food_id TEXT NOT NULL REFERENCES foods(id),
      logged_at TEXT NOT NULL,
      log_date TEXT NOT NULL,
      meal TEXT NOT NULL DEFAULT 'snack',
      unit_mode TEXT NOT NULL,
      quantity REAL NOT NULL,
      portion_id TEXT REFERENCES food_portions(id),
      portion_label_mn TEXT NOT NULL,
      grams_total REAL NOT NULL,
      calories REAL NOT NULL,
      protein_g REAL NOT NULL,
      carbs_g REAL NOT NULL,
      fat_g REAL NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_food_aliases_alias ON food_aliases(alias);
    CREATE INDEX IF NOT EXISTS idx_food_logs_logged_at ON food_logs(logged_at);
  `);

  const hasLogDate = await getOne<{ name: string }>(
    `SELECT name FROM pragma_table_info('food_logs') WHERE name = 'log_date'`
  );
  if (!hasLogDate) {
    await database.execAsync(`ALTER TABLE food_logs ADD COLUMN log_date TEXT`);
    await run(
      `UPDATE food_logs SET log_date = substr(logged_at, 1, 10) WHERE log_date IS NULL OR log_date = ''`
    );
  }

  const existing = await getOne<{ count: number }>(
    "SELECT COUNT(*) as count FROM foods WHERE source = 'custom'"
  );
  const count = existing?.count ?? 0;
  if (count > 0) return;

  for (const food of SEED_FOODS) {
    const foodId = SEED_IDS[food.id];
    const now = new Date().toISOString();
    await run(
      `INSERT OR IGNORE INTO foods (id, source, source_id, name_mn, name_en, calories_per_100g, protein_g_per_100g, carbs_g_per_100g, fat_g_per_100g, created_at)
       VALUES (?, 'custom', NULL, ?, ?, ?, ?, ?, ?, ?)`,
      [
        foodId,
        food.name_mn,
        food.name_en,
        food.calories_per_100g,
        food.protein_g_per_100g,
        food.carbs_g_per_100g,
        food.fat_g_per_100g,
        now,
      ]
    );

    for (const alias of food.aliases) {
      await run(
        `INSERT OR IGNORE INTO food_aliases (id, food_id, alias, lang) VALUES (?, ?, ?, 'mn')`,
        [makeId(), foodId, alias.toLowerCase().trim()]
      );
    }
    await run(
      `INSERT OR IGNORE INTO food_aliases (id, food_id, alias, lang) VALUES (?, ?, ?, 'mn')`,
      [makeId(), foodId, food.name_mn.toLowerCase().trim()]
    );

    for (const p of food.portions) {
      await run(
        `INSERT OR IGNORE INTO food_portions (id, food_id, label_mn, grams, is_default) VALUES (?, ?, ?, ?, ?)`,
        [makeId(), foodId, p.label_mn, p.grams, p.is_default]
      );
    }
  }
}
