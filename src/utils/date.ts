export function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const months = [
    '1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар',
    '7-р сар', '8-р сар', '9-р сар', '10-р сар', '11-р сар', '12-р сар',
  ];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const months = [
    '1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар',
    '7-р сар', '8-р сар', '9-р сар', '10-р сар', '11-р сар', '12-р сар',
  ];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

export function getWeekDates(): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    );
  }
  return dates;
}

export function getMonthDates(): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    );
  }
  return dates;
}

export function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const days = ['Ня', 'Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя'];
  return days[d.getDay()];
}

export function getAge(birthdate: string): number {
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/** Convert a Date object to YYYY-MM-DD string */
export function toDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Add (or subtract) days from a date string, returning a new YYYY-MM-DD string */
export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return toDateString(d);
}

/** Days between two date strings (a - b). Positive if a is after b. */
export function daysBetween(a: string, b: string): number {
  const dA = new Date(a + 'T12:00:00').getTime();
  const dB = new Date(b + 'T12:00:00').getTime();
  return Math.round((dA - dB) / (24 * 60 * 60 * 1000));
}

/** Format as "Өнөөдөр, 2-р сар 16" or "Да, 2-р сар 16" */
export function formatDateWithDay(dateStr: string): string {
  const today = getTodayString();
  const d = new Date(dateStr + 'T00:00:00');
  const months = ['1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар', '7-р сар', '8-р сар', '9-р сар', '10-р сар', '11-р сар', '12-р сар'];
  const dayStr = `${months[d.getMonth()]} ${d.getDate()}`;
  if (dateStr === today) return `Өнөөдөр, ${dayStr}`;
  const days = ['Ня', 'Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя'];
  return `${days[d.getDay()]}, ${dayStr}`;
}

/** Get array of YYYY-MM-DD strings for a week ending on `endDate` */
export function getWeekDatesFrom(endDate: string): string[] {
  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    dates.push(addDays(endDate, -i));
  }
  return dates;
}

/** Get array of YYYY-MM-DD strings for 30 days ending on `endDate` */
export function getMonthDatesFrom(endDate: string): string[] {
  const dates: string[] = [];
  for (let i = 29; i >= 0; i--) {
    dates.push(addDays(endDate, -i));
  }
  return dates;
}

/** Format a date range like "2-р сар 10 - 2-р сар 16, 2025" */
export function formatRange(startDate: string, endDate: string): string {
  const s = new Date(startDate + 'T00:00:00');
  const e = new Date(endDate + 'T00:00:00');
  const months = ['1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар', '7-р сар', '8-р сар', '9-р сар', '10-р сар', '11-р сар', '12-р сар'];
  return `${months[s.getMonth()]} ${s.getDate()} - ${months[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`;
}
