#!/usr/bin/env node
/**
 * Fetch 300+ foods from USDA API and output seed-ready JSON.
 *
 * Usage:
 *   USDA_API_KEY=your_key node scripts/fetch-usda-seeds.js
 *   (or set in .env / app.json extra)
 *
 * Reads: scripts/usda-input.json
 * Writes: scripts/usda-output.json
 *
 * Uses 5 concurrent requests for speed. ~2-3 min for 300 foods.
 */

const fs = require('fs');
const path = require('path');

const USDA_API_KEY =
  process.env.USDA_API_KEY ||
  process.env.EXPO_PUBLIC_USDA_API_KEY ||
  'Ed72fZHCLB4ayMS00d9fLNA0WVw1nuHr34ifCMUZ'; // from app.json for dev
const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1';
const CONCURRENCY = 5;
const DELAY_MS = 150;

const NUTRIENT_IDS = { energy: 1008, protein: 1003, carbs: 1005, fat: 1004 };

function getNutrientValue(nutrients, nutrientId) {
  const n = nutrients.find((x) => x.nutrientId === nutrientId);
  return n?.value ?? 0;
}

function extractPer100g(detail, nutrients) {
  const servingSize = detail.servingSize;
  const servingUnit = (detail.servingSizeUnit || '').toLowerCase();

  if (servingSize && servingUnit === 'g' && servingSize > 0) {
    const factor = 100 / servingSize;
    return {
      calories_per_100g: Math.round(getNutrientValue(nutrients, NUTRIENT_IDS.energy) * factor * 10) / 10,
      protein_g_per_100g: Math.round(getNutrientValue(nutrients, NUTRIENT_IDS.protein) * factor * 10) / 10,
      carbs_g_per_100g: Math.round(getNutrientValue(nutrients, NUTRIENT_IDS.carbs) * factor * 10) / 10,
      fat_g_per_100g: Math.round(getNutrientValue(nutrients, NUTRIENT_IDS.fat) * factor * 10) / 10,
    };
  }

  return {
    calories_per_100g: Math.round(getNutrientValue(nutrients, NUTRIENT_IDS.energy) * 10) / 10,
    protein_g_per_100g: Math.round(getNutrientValue(nutrients, NUTRIENT_IDS.protein) * 10) / 10,
    carbs_g_per_100g: Math.round(getNutrientValue(nutrients, NUTRIENT_IDS.carbs) * 10) / 10,
    fat_g_per_100g: Math.round(getNutrientValue(nutrients, NUTRIENT_IDS.fat) * 10) / 10,
  };
}

async function searchFoods(query) {
  const url = `${USDA_BASE}/foods/search?api_key=${encodeURIComponent(USDA_API_KEY)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      dataType: ['Foundation', 'Survey (FNDDS)', 'SR Legacy'],
      pageSize: 5,
    }),
  });
  if (!res.ok) throw new Error(`USDA search failed: ${res.status}`);
  const data = await res.json();
  return data.foods ?? [];
}

async function getFood(fdcId) {
  const url = `${USDA_BASE}/food/${fdcId}?api_key=${encodeURIComponent(USDA_API_KEY)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`USDA get food failed: ${res.status}`);
  return res.json();
}

/**
 * Extract per-100g from search result (has foodNutrients, may have servingSize).
 * Search results often have nutrients per 100g already.
 */
function extractFromSearchResult(food) {
  const nutrients = food.foodNutrients ?? [];
  const servingSize = food.servingSize;
  const servingUnit = (food.servingSizeUnit || '').toLowerCase();

  if (servingSize && servingUnit === 'g' && servingSize > 0) {
    const factor = 100 / servingSize;
    return {
      calories_per_100g: Math.round(getNutrientValue(nutrients, NUTRIENT_IDS.energy) * factor * 10) / 10,
      protein_g_per_100g: Math.round(getNutrientValue(nutrients, NUTRIENT_IDS.protein) * factor * 10) / 10,
      carbs_g_per_100g: Math.round(getNutrientValue(nutrients, NUTRIENT_IDS.carbs) * factor * 10) / 10,
      fat_g_per_100g: Math.round(getNutrientValue(nutrients, NUTRIENT_IDS.fat) * factor * 10) / 10,
    };
  }

  return {
    calories_per_100g: Math.round(getNutrientValue(nutrients, NUTRIENT_IDS.energy) * 10) / 10,
    protein_g_per_100g: Math.round(getNutrientValue(nutrients, NUTRIENT_IDS.protein) * 10) / 10,
    carbs_g_per_100g: Math.round(getNutrientValue(nutrients, NUTRIENT_IDS.carbs) * 10) / 10,
    fat_g_per_100g: Math.round(getNutrientValue(nutrients, NUTRIENT_IDS.fat) * 10) / 10,
  };
}

/**
 * Fetch one food from USDA. Uses search result nutrients (no getFood call).
 */
async function fetchOneFood({ id, name, usda_query }) {
  try {
    const foods = await searchFoods(usda_query);
    if (!foods.length) return null;

    const top = foods[0];
    const per100g = extractFromSearchResult(top);

    if (per100g.calories_per_100g <= 0 && per100g.protein_g_per_100g <= 0 && per100g.carbs_g_per_100g <= 0 && per100g.fat_g_per_100g <= 0) {
      return null;
    }

    return {
      id,
      name_mn: name,
      name_en: top.description || name,
      calories_per_100g: per100g.calories_per_100g,
      protein_g_per_100g: per100g.protein_g_per_100g,
      carbs_g_per_100g: per100g.carbs_g_per_100g,
      fat_g_per_100g: per100g.fat_g_per_100g,
    };
  } catch (err) {
    console.error(`  [${id}] ${err.message}`);
    return null;
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runWithConcurrency(items, fn, concurrency) {
  const results = [];
  const executing = [];
  for (const item of items) {
    const p = Promise.resolve().then(() => fn(item)).then((r) => {
      executing.splice(executing.indexOf(p), 1);
      return r;
    });
    results.push(p);
    executing.push(p);
    if (executing.length >= concurrency) {
      await Promise.race(executing);
      await sleep(DELAY_MS);
    }
  }
  return Promise.all(results);
}

function getDefaultPortions(id, name) {
  const n = name.toLowerCase();
  const portions = [{ label_mn: '100г', grams: 100, is_default: 1 }];

  if (n.includes('egg') || n.includes('өндөг')) {
    portions.unshift({ label_mn: '1 ширхэг', grams: 50, is_default: 1 });
    portions[1].is_default = 0;
  } else if (n.includes('rice') || n.includes('будаа') || n.includes('pasta') || n.includes('noodle')) {
    portions.unshift({ label_mn: '1 аяга', grams: 158, is_default: 1 });
    portions[1].is_default = 0;
  } else if (n.includes('chicken') || n.includes('тахиа') || n.includes('beef') || n.includes('үхэр') || n.includes('steak') || n.includes('salmon') || n.includes('tuna')) {
    portions.unshift({ label_mn: '100г', grams: 100, is_default: 1 });
    portions.push({ label_mn: '1 таваг', grams: 200, is_default: 0 });
  } else if (n.includes('milk') || n.includes('сүү') || n.includes('juice') || n.includes('coffee') || n.includes('tea') || n.includes('soda') || n.includes('broth')) {
    portions.unshift({ label_mn: '1 аяга', grams: 250, is_default: 1 });
    portions[1].is_default = 0;
  } else if (n.includes('bread') || n.includes('талх') || n.includes('bagel') || n.includes('muffin') || n.includes('croissant')) {
    portions.unshift({ label_mn: '1 ширхэг', grams: 50, is_default: 1 });
    portions[1].is_default = 0;
  } else if (n.includes('banana') || n.includes('apple') || n.includes('orange') || n.includes('fruit') || n.includes('алим') || n.includes('банана')) {
    portions.unshift({ label_mn: '1 ширхэг', grams: 120, is_default: 1 });
    portions[1].is_default = 0;
  } else if (n.includes('cheese') || n.includes('бяслаг') || n.includes('yogurt') || n.includes('тараг')) {
    portions.unshift({ label_mn: '1 ширхэг', grams: 30, is_default: 1 });
    portions[1].is_default = 0;
  } else if (n.includes('potato') || n.includes('төмс') || n.includes('vegetable') || n.includes('salad')) {
    portions.unshift({ label_mn: '1 таваг', grams: 200, is_default: 1 });
    portions[1].is_default = 0;
  } else if (n.includes('soup') || n.includes('шөл')) {
    portions.unshift({ label_mn: '1 аяга', grams: 350, is_default: 1 });
    portions[1].is_default = 0;
  } else if (n.includes('buuz') || n.includes('бууз') || n.includes('dumpling')) {
    portions.unshift({ label_mn: '1 ширхэг', grams: 50, is_default: 1 });
    portions[1].is_default = 0;
  } else if (n.includes('khuushuur') || n.includes('хуушуур')) {
    portions.unshift({ label_mn: '1 ширхэг', grams: 80, is_default: 1 });
    portions[1].is_default = 0;
  } else if (n.includes('pizza') || n.includes('burger') || n.includes('sandwich') || n.includes('burrito') || n.includes('taco')) {
    portions.unshift({ label_mn: '1 ширхэг', grams: 200, is_default: 1 });
    portions[1].is_default = 0;
  } else if (n.includes('oil') || n.includes('тос') || n.includes('butter') || n.includes('шар тос')) {
    portions.unshift({ label_mn: '1 халбага', grams: 15, is_default: 1 });
    portions[1].is_default = 0;
  } else {
    portions.unshift({ label_mn: '1 ширхэг', grams: 100, is_default: 1 });
    portions[1].is_default = 0;
  }

  return portions;
}

async function main() {
  const inputPath = path.join(__dirname, 'usda-input.json');
  const outputPath = path.join(__dirname, 'usda-output.json');

  if (!fs.existsSync(inputPath)) {
    console.error('Missing usda-input.json');
    process.exit(1);
  }

  const input = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  console.log(`Fetching ${input.length} foods from USDA (concurrency: ${CONCURRENCY})...\n`);

  const start = Date.now();
  const results = await runWithConcurrency(input, fetchOneFood, CONCURRENCY);
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  const successful = results.filter(Boolean);
  const failed = input.length - successful.length;

  console.log(`\nDone in ${elapsed}s. Success: ${successful.length}, Failed: ${failed}`);

  const MN_ALIASES = { buuz: ['бууз'], khuushuur: ['хуушуур'], tsuivan: ['цуйван'] };
  const output = successful.map((f) => {
    const portions = getDefaultPortions(f.id, f.name_mn);
    const aliases = [f.name_mn.toLowerCase(), (f.name_en || '').toLowerCase().slice(0, 50)];
    if (MN_ALIASES[f.id]) aliases.push(...MN_ALIASES[f.id]);
    return {
      ...f,
      aliases: [...new Set(aliases.filter(Boolean))],
      portions,
    };
  });

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
  console.log(`\nWrote ${outputPath}`);
  console.log(`\nNext: node scripts/json-to-seed.js`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
