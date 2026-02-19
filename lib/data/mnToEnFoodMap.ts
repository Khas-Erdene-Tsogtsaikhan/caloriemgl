/**
 * Mongolian (Cyrillic) → English food name mappings for USDA API search.
 * Extend this map to support more foods.
 */
export const MN_TO_EN_FOOD_MAP: Record<string, string> = {
  'өндөг': 'egg',
  'цагаан будаа': 'white rice cooked',
  'будаа': 'rice',
  'тахианы цээж': 'chicken breast roasted',
  'тахиа': 'chicken',
  'үхрийн мах': 'beef',
  'мах': 'meat',
  'сүү': 'milk',
  'талх': 'bread',
  'банана': 'banana',
  'алим': 'apple',
  'тараг': 'yogurt',
  'бяслаг': 'cheese',
  'төмс': 'potato',
  'лууван': 'carrot',
  'улаан лооль': 'tomato',
  'өргөст хэмх': 'cucumber',
  'бууз': 'buuz steamed dumpling',
  'хуушуур': 'fried dumpling',
  'банш': 'bansh dumpling',
  'цуйван': 'tsuivan noodles',
  'шөл': 'soup',
  'гурвалтай шөл': 'noodle soup',
  'овьёос': 'oatmeal',
  'самар': 'nuts',
  'тос': 'oil',
  'шар тос': 'butter',
  'өрөм': 'cream',
  'айраг': 'airag fermented milk',
  'ааруул': 'aaruul dried curd',
  'мантуу': 'mantuu steamed bun',
  'боорцог': 'boortsog fried dough',
  'гамбир': 'pancake',
  'нийслэл салат': 'capital salad',
  'ундаа': 'soft drink',
  'ус': 'water',
  'цай': 'tea',
  'сүүтэй цай': 'milk tea',
  'кофе': 'coffee',
};

/**
 * Look up English search term for a Mongolian query (normalized, lowercase).
 */
export function mnToEn(query: string): string | null {
  const normalized = query.trim().toLowerCase().replace(/\s+/g, ' ');
  return MN_TO_EN_FOOD_MAP[normalized] ?? null;
}
