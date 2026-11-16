import type { SearchCriteria } from '@/types';
import { addDays, isValidISODate, today } from './date';

export const MAX_GUESTS = 20;
export const MAX_ROOMS = 8;
export const MAX_NIGHTS = 30;

export function defaultCriteria(): SearchCriteria {
  const checkIn = addDays(today(), 1);
  return { q: '', checkIn, checkOut: addDays(checkIn, 2), guests: 2, rooms: 1 };
}

type RawParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function clampInt(v: string | undefined, min: number, max: number, fallback: number): number {
  const n = Number.parseInt(v ?? '', 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

/** Đọc tiêu chí tìm kiếm từ route params, tự sửa giá trị không hợp lệ (vd. link cũ, ngày quá khứ). */
export function parseCriteria(params: RawParams): SearchCriteria {
  const def = defaultCriteria();
  let checkIn = first(params.checkIn);
  let checkOut = first(params.checkOut);
  if (!isValidISODate(checkIn) || checkIn < today()) checkIn = def.checkIn;
  if (!isValidISODate(checkOut) || checkOut <= checkIn || checkOut > addDays(checkIn, MAX_NIGHTS)) {
    checkOut = addDays(checkIn, 1);
  }
  const guests = clampInt(first(params.guests), 1, MAX_GUESTS, def.guests);
  const rooms = Math.min(guests, clampInt(first(params.rooms), 1, MAX_ROOMS, def.rooms));
  return { q: first(params.q) ?? '', checkIn, checkOut, guests, rooms };
}

export function criteriaToParams(c: SearchCriteria): Record<string, string> {
  return {
    q: c.q,
    checkIn: c.checkIn,
    checkOut: c.checkOut,
    guests: String(c.guests),
    rooms: String(c.rooms),
  };
}
