import * as SQLite from 'expo-sqlite';
import { SEED_FOODS, SEED_IDS } from '@/lib/data/seedFoods';
import { makeId } from './ids';

let db: SQLite.SQLiteDatabase | null = null;

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

  const hasMetadata = await getOne<{ name: string }>(
    `SELECT name FROM pragma_table_info('food_logs') WHERE name = 'metadata'`
  );
  if (!hasMetadata) {
    await database.execAsync(`ALTER TABLE food_logs ADD COLUMN metadata TEXT`);
  }

  const existing = await getOne<{ count: number }>(
    "SELECT COUNT(*) as count FROM foods WHERE source = 'custom'"
  );
  const count = existing?.count ?? 0;

  // Migrate: add any missing seed foods (for users upgrading from old 15-food DB)
  for (const food of SEED_FOODS) {
    const foodId = SEED_IDS[food.id];
    if (!foodId) continue;
    const exists = await getOne<{ id: string }>(`SELECT id FROM foods WHERE id = ?`, [foodId]);
    if (!exists) {
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
        const a = alias.trim().toLowerCase();
        if (!a) continue;
        await run(
          `INSERT OR IGNORE INTO food_aliases (id, food_id, alias, lang) VALUES (?, ?, ?, 'mn')`,
          [makeId(), foodId, a]
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
    } else {
      // Food exists: ensure aliases are up to date
      for (const alias of food.aliases) {
        const a = alias.trim().toLowerCase();
        if (!a) continue;
        await run(
          `INSERT OR IGNORE INTO food_aliases (id, food_id, alias, lang) VALUES (?, ?, ?, 'mn')`,
          [makeId(), foodId, a]
        );
      }
    }
  }

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
