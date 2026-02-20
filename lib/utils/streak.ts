/**
 * Count consecutive days with logs ending at today.
 * logDates: array of YYYY-MM-DD strings for days that have at least one food log.
 * today: YYYY-MM-DD string for today.
 * Returns the streak length (0 if today has no log).
 */
export function getStreak(logDates: string[], today: string): number {
  const set = new Set(logDates);
  if (!set.has(today)) return 0;
  let count = 0;
  let d = today;
  while (set.has(d)) {
    count++;
    d = addDays(d, -1);
  }
  return count;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
