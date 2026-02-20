import { addDays, daysBetween, formatDateShort } from '@/src/utils/date';

export type GoalType = 'lose' | 'maintain' | 'gain';

const DEFAULT_RATE_LOSE = 0.5;
const DEFAULT_RATE_GAIN = 0.25;

export function getDefaultRate(goal: GoalType): number | null {
  if (goal === 'lose') return DEFAULT_RATE_LOSE;
  if (goal === 'gain') return DEFAULT_RATE_GAIN;
  return null;
}

export function getPlanDescription(goal: GoalType, rate: number | null): string {
  if (goal === 'maintain' || rate == null) return 'Maintain your current weight.';
  if (goal === 'lose') return `Based on a safe ${rate} kg/week loss — sustainable and healthy.`;
  return `Based on a steady ${rate} kg/week gain — focused on lean mass.`;
}

/** 7-day moving average trend weight from sorted weight entries. */
export function getTrendWeight(
  weightEntries: { date: string; weightKg: number }[],
  asOfDate: string
): number | null {
  const sorted = [...weightEntries]
    .filter((e) => e.date <= asOfDate)
    .sort((a, b) => b.date.localeCompare(a.date));
  if (sorted.length === 0) return null;
  const recent = sorted.slice(0, 7);
  const sum = recent.reduce((s, e) => s + e.weightKg, 0);
  return sum / recent.length;
}

/** Time-based: weeks elapsed since start (0 at start). */
export function getWeeksElapsed(startDate: string, today: string): number {
  const days = daysBetween(today, startDate);
  return Math.max(0, Math.floor(days / 7));
}

/** Time-based: weeks left until target date. */
export function getWeeksLeftTimeBased(
  startDate: string,
  targetDate: string,
  today: string
): number {
  const daysLeft = daysBetween(targetDate, today);
  return Math.max(0, Math.ceil(daysLeft / 7));
}

/** Time-based progress 0..1 (elapsed time / total time). */
export function getProgressPct(
  startDate: string,
  targetDate: string,
  today: string
): number {
  const totalDays = daysBetween(targetDate, startDate);
  if (totalDays <= 0) return 1;
  const elapsedDays = daysBetween(today, startDate);
  return Math.min(1, Math.max(0, elapsedDays / totalDays));
}

/** Total weeks in plan (from start to target). */
export function getWeeksTotal(startDate: string, targetDate: string): number {
  const days = daysBetween(targetDate, startDate);
  return Math.max(1, Math.ceil(days / 7));
}

export function getTargetDateFormatted(targetDate: string): string {
  return formatDateShort(targetDate);
}

export type OnTrackStatus = 'on_track' | 'ahead' | 'behind' | 'unknown';

/**
 * Compare trend-based ETA to plan target date.
 * "On track" if ETA within ±1 week of plan.
 */
export function getOnTrackStatus(
  weightEntries: { date: string; weightKg: number }[],
  startWeight: number,
  targetWeight: number,
  planTargetDate: string,
  today: string,
  goalType: GoalType
): { status: OnTrackStatus; etaDate: string | null; message: string } {
  if (goalType === 'maintain') {
    return { status: 'on_track', etaDate: null, message: 'Maintaining' };
  }
  const trendToday = getTrendWeight(weightEntries, today);
  if (trendToday == null) {
    return { status: 'unknown', etaDate: null, message: 'Log weigh-ins to see if you\'re on track' };
  }
  const remainingKg = Math.abs(targetWeight - trendToday);
  if (remainingKg < 0.1) {
    return { status: 'on_track', etaDate: today, message: 'Almost there!' };
  }
  const rate = goalType === 'lose' ? DEFAULT_RATE_LOSE : DEFAULT_RATE_GAIN;
  const etaWeeks = remainingKg / rate;
  const etaDate = addDays(today, Math.ceil(etaWeeks * 7));

  const planDays = daysBetween(planTargetDate, today);
  const etaDays = daysBetween(etaDate, today);
  const diffWeeks = Math.abs(etaDays - planDays) / 7;

  if (diffWeeks <= 1) {
    return { status: 'on_track', etaDate, message: 'On track!' };
  }
  if (etaDays < planDays) {
    return { status: 'ahead', etaDate, message: 'Ahead of schedule!' };
  }
  return { status: 'behind', etaDate, message: 'A bit behind — keep going!' };
}
