import { addDays } from './date';
import type { Goal } from '../types';

/**
 * Compute plan target date and pace from goal + weights.
 * Used at onboarding complete and when user edits goal in Account.
 */
export function computePlanForProfile(
  goal: Goal,
  startWeight: number,
  targetWeight: number,
  startDate: string
): { planTargetDate: string; planPaceKgPerWeek: number } {
  const isLose = goal === 'lose_weight';
  const isGain = goal === 'gain_weight' || goal === 'gain_muscle';
  if (!isLose && !isGain) {
    return { planTargetDate: startDate, planPaceKgPerWeek: 0 };
  }
  const deltaKg = Math.abs(targetWeight - startWeight);
  const pace = isLose ? 0.5 : 0.25;
  const weeksTotal = Math.max(1, Math.ceil(deltaKg / pace));
  const planTargetDate = addDays(startDate, weeksTotal * 7);
  return { planTargetDate, planPaceKgPerWeek: pace };
}
