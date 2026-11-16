// Lớp API giả lập. Toàn bộ UI chỉ gọi các hàm trong file này, nên khi có backend thật
// chỉ cần thay phần thân hàm bằng fetch(...) tới server mà không phải sửa màn hình nào.
import { CITIES, HOTELS } from '@/data/hotels';
import type {
  Booking,
  City,
  Hotel,
  PaymentMethod,
  Room,
  SearchCriteria,
  SearchFilters,
} from '@/types';
import { nightsBetween, rangesOverlap, today } from '@/utils/date';
import { normalizeText } from '@/utils/format';
import { readJSON, writeJSON } from './storage';

const BOOKINGS_KEY = 'vietstay:bookings';
export const TAX_RATE = 0.1;

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------- Bookings (lưu cục bộ) ----------

async function loadBookings(): Promise<Booking[]> {
  return readJSON<Booking[]>(BOOKINGS_KEY, []);
}

export async function getBookings(): Promise<Booking[]> {
  const list = await loadBookings();
  return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getBooking(id: string): Promise<Booking | undefined> {
  return (await loadBookings()).find((b) => b.id === id);
}

/** Số phòng còn trống của một loại phòng trong khoảng ngày, đã trừ các đơn đã xác nhận. */
function remainingRooms(room: Room, bookings: Booking[], checkIn: string, checkOut: string): number {
  const booked = bookings
    .filter(
      (b) =>
        b.status === 'confirmed' &&
        b.roomId === room.id &&
        rangesOverlap(b.checkIn, b.checkOut, checkIn, checkOut),
    )
    .reduce((sum, b) => sum + b.rooms, 0);
  return Math.max(0, room.inventory - booked);
}

/** Loại phòng có đủ chỗ cho số khách và số phòng yêu cầu không. */
function fits(room: Room, guests: number, rooms: number): boolean {
  return room.maxGuests * rooms >= guests;
}

// ---------- Hotels ----------

export function getCities(): City[] {
  return CITIES;
}

export async function getFeaturedHotels(limit = 6): Promise<Hotel[]> {
  await delay(150);
  return [...HOTELS].sort((a, b) => b.rating - a.rating).slice(0, limit);
}

export async function getHotel(id: string): Promise<Hotel | undefined> {
  await delay(150);
  return HOTELS.find((h) => h.id === id);
}

export async function getHotelsByIds(ids: string[]): Promise<Hotel[]> {
  return HOTELS.filter((h) => ids.includes(h.id));
}

export interface HotelResult {
  hotel: Hotel;
  /** Giá thấp nhất/đêm/phòng trong các loại phòng còn trống và đủ chỗ. */
  minPrice: number;
}

export async function searchHotels(c: SearchCriteria, f: SearchFilters): Promise<HotelResult[]> {
  await delay();
  const bookings = await loadBookings();
  const q = normalizeText(c.q);

  const results: HotelResult[] = [];
  for (const hotel of HOTELS) {
    if (q) {
      const haystack = normalizeText(`${hotel.name} ${hotel.city} ${hotel.address}`);
      if (!q.split(/\s+/).every((word) => haystack.includes(word))) continue;
    }
    if (f.minStars && hotel.stars < f.minStars) continue;
    if (f.minRating && hotel.rating < f.minRating) continue;
    if (f.amenities.some((a) => !hotel.amenities.includes(a))) continue;

    const prices = hotel.rooms
      .filter((r) => fits(r, c.guests, c.rooms) && remainingRooms(r, bookings, c.checkIn, c.checkOut) >= c.rooms)
      .map((r) => r.price);
    if (prices.length === 0) continue;

    const minPrice = Math.min(...prices);
    if (f.maxPrice && minPrice > f.maxPrice) continue;
    results.push({ hotel, minPrice });
  }

  switch (f.sort) {
    case 'price-asc':
      results.sort((a, b) => a.minPrice - b.minPrice);
      break;
    case 'price-desc':
      results.sort((a, b) => b.minPrice - a.minPrice);
      break;
    case 'rating':
      results.sort((a, b) => b.hotel.rating - a.hotel.rating);
      break;
    default:
      // "Đề xuất": cân bằng giữa điểm đánh giá và số lượt đánh giá.
      results.sort(
        (a, b) =>
          b.hotel.rating + Math.log10(b.hotel.reviewCount) - (a.hotel.rating + Math.log10(a.hotel.reviewCount)),
      );
  }
  return results;
}

export interface RoomOffer {
  room: Room;
  remaining: number;
  fitsGuests: boolean;
}

export async function getRoomOffers(hotelId: string, c: SearchCriteria): Promise<RoomOffer[]> {
  const hotel = HOTELS.find((h) => h.id === hotelId);
  if (!hotel) return [];
  const bookings = await loadBookings();
  return hotel.rooms.map((room) => ({
    room,
    remaining: remainingRooms(room, bookings, c.checkIn, c.checkOut),
    fitsGuests: fits(room, c.guests, c.rooms),
  }));
}

// ---------- Đặt phòng ----------

export function calcPrice(pricePerNight: number, nights: number, rooms: number) {
  const subtotal = pricePerNight * nights * rooms;
  const taxes = Math.round(subtotal * TAX_RATE);
  return { subtotal, taxes, total: subtotal + taxes };
}

export interface NewBookingInput {
  hotelId: string;
  roomId: string;
  criteria: SearchCriteria;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  note?: string;
  paymentMethod: PaymentMethod;
}

export class BookingError extends Error {}

function makeCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'VS';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function createBooking(input: NewBookingInput): Promise<Booking> {
  await delay(600);
  const { criteria: c } = input;
  const hotel = HOTELS.find((h) => h.id === input.hotelId);
  const room = hotel?.rooms.find((r) => r.id === input.roomId);
  if (!hotel || !room) throw new BookingError('Không tìm thấy khách sạn hoặc loại phòng.');

  const nights = nightsBetween(c.checkIn, c.checkOut);
  if (c.checkIn < today() || nights < 1) throw new BookingError('Ngày nhận/trả phòng không hợp lệ.');
  if (!fits(room, c.guests, c.rooms)) {
    throw new BookingError(`Loại phòng này chỉ chứa tối đa ${room.maxGuests * c.rooms} khách cho ${c.rooms} phòng.`);
  }

  // Đọc lại ngay trước khi ghi để kiểm tra phòng trống mới nhất.
  const bookings = await loadBookings();
  if (remainingRooms(room, bookings, c.checkIn, c.checkOut) < c.rooms) {
    throw new BookingError('Rất tiếc, loại phòng này vừa hết chỗ cho ngày bạn chọn.');
  }

  const price = calcPrice(room.price, nights, c.rooms);
  const booking: Booking = {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
    code: makeCode(),
    hotelId: hotel.id,
    hotelName: hotel.name,
    hotelImage: hotel.images[0],
    city: hotel.city,
    address: hotel.address,
    roomId: room.id,
    roomName: room.name,
    checkIn: c.checkIn,
    checkOut: c.checkOut,
    nights,
    guests: c.guests,
    rooms: c.rooms,
    pricePerNight: room.price,
    ...price,
    guestName: input.guestName.trim(),
    guestEmail: input.guestEmail.trim(),
    guestPhone: input.guestPhone.trim(),
    note: input.note?.trim() || undefined,
    paymentMethod: input.paymentMethod,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };
  await writeJSON(BOOKINGS_KEY, [...bookings, booking]);
  return booking;
}

export function canCancel(b: Booking): boolean {
  return b.status === 'confirmed' && b.checkIn > today();
}

export async function cancelBooking(id: string): Promise<Booking> {
  await delay(400);
  const bookings = await loadBookings();
  const target = bookings.find((b) => b.id === id);
  if (!target) throw new BookingError('Không tìm thấy đơn đặt phòng.');
  if (!canCancel(target)) throw new BookingError('Đơn này không thể hủy (đã hủy hoặc đã đến ngày nhận phòng).');
  const updated: Booking = { ...target, status: 'cancelled' };
  await writeJSON(
    BOOKINGS_KEY,
    bookings.map((b) => (b.id === id ? updated : b)),
  );
  return updated;
}
