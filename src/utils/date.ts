// Mọi ngày được lưu dưới dạng chuỗi 'YYYY-MM-DD' theo giờ địa phương,
// nên có thể so sánh trực tiếp bằng toán tử chuỗi.

const pad = (n: number) => String(n).padStart(2, '0');
const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseISODate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function isValidISODate(s: unknown): s is string {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  return toISODate(parseISODate(s)) === s;
}

export function today(): string {
  return toISODate(new Date());
}

export function addDays(s: string, n: number): string {
  const d = parseISODate(s);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  const ms = parseISODate(checkOut).getTime() - parseISODate(checkIn).getTime();
  return Math.round(ms / 86_400_000);
}

/** Hai khoảng [aStart, aEnd) và [bStart, bEnd) có giao nhau không. */
export function rangesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/** "T2, 18/11" */
export function formatShortDate(s: string): string {
  const d = parseISODate(s);
  return `${WEEKDAYS[d.getDay()]}, ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
}

/** "T2, 18/11/2026" */
export function formatLongDate(s: string): string {
  return `${formatShortDate(s)}/${parseISODate(s).getFullYear()}`;
}
