// Các hàm gọi VietStay API (.NET). Mọi màn hình chỉ dùng những hàm này.
// Danh mục khách sạn đọc từ database hbe: id khách sạn = external_property_id, id vùng = region_id.
import type {
  AuthResponse,
  Booking,
  Destination,
  Hotel,
  HotelSummary,
  Lang,
  PaymentMethod,
  PlaceSuggestion,
  Region,
  SearchCriteria,
  SearchFilters,
  User,
} from '@/types';
import { request } from './http';

export { ApiError } from './http';

/** Ngôn ngữ nội dung khách sạn. */
const LANG: Lang = 'vi';

// ---------- Danh mục ----------

export const getDestinations = () => request<Destination[]>('GET', '/api/destinations', { query: { lang: LANG } });

export const getFeaturedHotels = (limit = 6) =>
  request<HotelSummary[]>('GET', '/api/hotels/featured', { query: { limit, lang: LANG } });

export interface SearchResult {
  items: HotelSummary[];
  total: number;
  page: number;
  pageSize: number;
  /** Vùng đang liệt kê; null khi từ khóa chỉ khớp tên khách sạn. */
  region: Region | null;
}

/** Tìm theo vùng (regionId) nếu có, ngược lại theo từ khóa q. */
export const searchHotels = (c: SearchCriteria, f: SearchFilters, page = 1, pageSize = 50) =>
  request<SearchResult>('GET', '/api/hotels/search', {
    query: {
      regionId: c.regionId,
      q: c.regionId ? undefined : c.q,
      minStars: f.minStars,
      minRating: f.minRating,
      amenities: f.amenities.join(','),
      sort: f.sort,
      page,
      pageSize,
      lang: LANG,
    },
  });

/** Gợi ý khi gõ: vùng và khách sạn khớp mọi từ (không dấu cũng được). */
export const suggestPlaces = (q: string, limit = 10) =>
  request<PlaceSuggestion[]>('GET', '/api/places/suggest', { query: { q, limit, lang: LANG } });

export const getHotel = (id: string) =>
  request<Hotel>('GET', `/api/hotels/${encodeURIComponent(id)}`, { query: { lang: LANG } });

// ---------- Tài khoản ----------

export const login = (email: string, password: string) =>
  request<AuthResponse>('POST', '/api/auth/login', { body: { email, password } });

export const register = (input: { name: string; email: string; phone: string; password: string }) =>
  request<AuthResponse>('POST', '/api/auth/register', { body: input });

export const getMe = () => request<User>('GET', '/api/me');

export const updateMe = (input: { name?: string; phone?: string }) => request<User>('PUT', '/api/me', { body: input });

export const getFavorites = () => request<HotelSummary[]>('GET', '/api/me/favorites', { query: { lang: LANG } });

export const addFavorite = (hotelId: string) =>
  request<void>('PUT', `/api/me/favorites/${encodeURIComponent(hotelId)}`);

export const removeFavorite = (hotelId: string) =>
  request<void>('DELETE', `/api/me/favorites/${encodeURIComponent(hotelId)}`);

// ---------- Đặt phòng ----------

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

export const getBookings = () => request<Booking[]>('GET', '/api/bookings');

export const getBooking = (id: string) => request<Booking>('GET', `/api/bookings/${encodeURIComponent(id)}`);

/** Gửi yêu cầu đặt phòng (trạng thái pending — khách sạn xác nhận giá sau). */
export const createBooking = ({ criteria, ...rest }: NewBookingInput) =>
  request<Booking>('POST', '/api/bookings', {
    body: {
      ...rest,
      checkIn: criteria.checkIn,
      checkOut: criteria.checkOut,
      guests: criteria.guests,
      rooms: criteria.rooms,
      note: rest.note?.trim() || undefined,
    },
  });

export const cancelBooking = (id: string) =>
  request<Booking>('POST', `/api/bookings/${encodeURIComponent(id)}/cancel`);
