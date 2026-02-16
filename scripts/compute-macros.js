#!/usr/bin/env node
/**
 * Macro Calculator for Mongolian Preset Foods
 *
 * Usage:
 *   node scripts/compute-macros.js
 *
 * This script computes per-serving macronutrients for traditional Mongolian dishes
 * using a recipe-based approach with USDA FoodData Central (FDC) ingredient data.
 *
 * Workflow:
 * 1. Define a recipe as an array of ingredients with weights (grams)
 * 2. Look up each ingredient's nutrients per 100g from USDA FDC
 * 3. Sum up nutrients proportionally
 * 4. Divide by number of servings to get per-serving values
 *
 * To use the USDA API:
 *   - Get a free API key at https://fdc.nal.usda.gov/api-key-signup.html
 *   - Set FDC_API_KEY environment variable
 *   - Run: FDC_API_KEY=your_key node scripts/compute-macros.js
 *
 * The output can be copy-pasted into mongolianPresets.ts
 */

const FDC_API_KEY = process.env.FDC_API_KEY || 'DEMO_KEY';
const FDC_BASE = 'https://api.nal.usda.gov/fdc/v1';

/**
 * Recipe definitions: each recipe has ingredients with gram weights
 * and a serving count + serving size note.
 */
const RECIPES = {
  buuz: {
    name_mn: 'Бууз',
    servings: 20,
    servingSizeNote: '1 medium buuz (~50g)',
    unit: 'piece',
    ingredients: [
      { name: 'ground beef (80/20)', grams: 500, fdcId: 174032 },
      { name: 'all-purpose flour', grams: 300, fdcId: 169761 },
      { name: 'onion, raw', grams: 150, fdcId: 170000 },
      { name: 'water', grams: 100, fdcId: 0 },
      { name: 'salt', grams: 8, fdcId: 0 },
      { name: 'black pepper', grams: 2, fdcId: 0 },
    ],
  },
  khuushuur: {
    name_mn: 'Хуушуур',
    servings: 12,
    servingSizeNote: '1 khuushuur (~80g)',
    unit: 'piece',
    ingredients: [
      { name: 'ground beef (80/20)', grams: 500, fdcId: 174032 },
      { name: 'all-purpose flour', grams: 300, fdcId: 169761 },
      { name: 'onion, raw', grams: 100, fdcId: 170000 },
      { name: 'vegetable oil (for frying)', grams: 100, fdcId: 172336 },
      { name: 'water', grams: 80, fdcId: 0 },
    ],
  },
  // Add more recipes here following the same pattern
};

/**
 * Hardcoded USDA nutrient data per 100g for common ingredients.
 * This avoids API calls for the demo. Replace with live API calls
 * when FDC_API_KEY is set to a real key.
 */
const NUTRIENT_DB = {
  174032: { name: 'Ground beef, 80% lean', calories: 254, protein_g: 17.2, carbs_g: 0, fat_g: 20 },
  169761: { name: 'All-purpose flour', calories: 364, protein_g: 10.3, carbs_g: 76.3, fat_g: 1 },
  170000: { name: 'Onion, raw', calories: 40, protein_g: 1.1, carbs_g: 9.3, fat_g: 0.1 },
  172336: { name: 'Vegetable oil', calories: 884, protein_g: 0, carbs_g: 0, fat_g: 100 },
};

function computeRecipe(recipe) {
  let totalCal = 0, totalP = 0, totalC = 0, totalF = 0;

  for (const ing of recipe.ingredients) {
    const data = NUTRIENT_DB[ing.fdcId];
    if (!data) continue; // skip water, salt, etc.
    const factor = ing.grams / 100;
    totalCal += data.calories * factor;
    totalP += data.protein_g * factor;
    totalC += data.carbs_g * factor;
    totalF += data.fat_g * factor;
  }

  const servings = recipe.servings;
  return {
    id: Object.keys(RECIPES).find((k) => RECIPES[k] === recipe),
    name_mn: recipe.name_mn,
    servingSizeNote: recipe.servingSizeNote,
    calories: Math.round(totalCal / servings),
    protein_g: Math.round((totalP / servings) * 10) / 10,
    carbs_g: Math.round((totalC / servings) * 10) / 10,
    fat_g: Math.round((totalF / servings) * 10) / 10,
  };
}

// Compute all recipes
console.log('=== Mongolian Preset Macro Calculator ===\n');
console.log('Using hardcoded USDA data (set FDC_API_KEY for live lookups)\n');

for (const [key, recipe] of Object.entries(RECIPES)) {
  const result = computeRecipe(recipe);
  console.log(`${result.name_mn} (${key}):`);
  console.log(`  Serving: ${result.servingSizeNote}`);
  console.log(`  Per serving: ${result.calories} kcal | P${result.protein_g}g C${result.carbs_g}g F${result.fat_g}g`);
  console.log('');
}

console.log('To add more recipes, edit the RECIPES object in this script.');
console.log('For live USDA lookups, set FDC_API_KEY and implement fetchNutrients().');
