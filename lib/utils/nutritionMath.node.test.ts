import { computeTotals, computeGramsTotal } from './nutritionMath';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function assertApprox(a: number, b: number, eps: number, msg: string) {
  if (Math.abs(a - b) > eps) throw new Error(`${msg}: expected ~${b}, got ${a}`);
}

console.log('Running nutritionMath tests...');

const per100 = {
  calories_per_100g: 155,
  protein_g_per_100g: 13,
  carbs_g_per_100g: 1.1,
  fat_g_per_100g: 11,
};

const t1 = computeTotals(per100, 100);
assertApprox(t1.calories, 155, 0.1, '100g calories');
assertApprox(t1.protein_g, 13, 0.1, '100g protein');
assertApprox(t1.carbs_g, 1.1, 0.1, '100g carbs');
assertApprox(t1.fat_g, 11, 0.1, '100g fat');

const t2 = computeTotals(per100, 50);
assertApprox(t2.calories, 77.5, 0.1, '50g calories');
assertApprox(t2.protein_g, 6.5, 0.1, '50g protein');

const t3 = computeTotals(per100, 0);
assert(t3.calories === 0 && t3.protein_g === 0, '0g returns zeros');

const g1 = computeGramsTotal({ unitMode: 'grams', gramsInput: 150, portionGrams: 50, quantity: 2 });
assert(g1 === 150, 'grams mode uses gramsInput');

const g2 = computeGramsTotal({ unitMode: 'portion', gramsInput: 100, portionGrams: 50, quantity: 3 });
assert(g2 === 150, 'portion mode: 3 * 50 = 150');

console.log('All nutritionMath tests passed.');
