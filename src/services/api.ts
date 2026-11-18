// Các hàm gọi VietStay API (.NET). Mọi màn hình chỉ dùng những hàm này.
import type {
  AuthResponse,
  Booking,
  City,
  Hotel,
  HotelSummary,
  PaymentMethod,
  RoomOffer,
  SearchCriteria,
  SearchFilters,
  User,
} from '@/types';
import { request } from './http';

export { ApiError } from './http';

/** Chỉ dùng để hiển thị ước tính; tổng tiền chính thức do server tính khi đặt. */
export const TAX_RATE = 0.1;

export function calcPrice(pricePerNight: number, nights: number, rooms: number) {
  const subtotal = pricePerNight * nights * rooms;
  const taxes = Math.round(subtotal * TAX_RATE);
  return { subtotal, taxes, total: subtotal + taxes };
}

const stayQuery = (c: SearchCriteria) => ({
  checkIn: c.checkIn,
  checkOut: c.checkOut,
  guests: c.guests,
  rooms: c.rooms,
});

// ---------- Danh mục ----------

export const getCities = () => request<City[]>('GET', '/api/cities');

export const getFeaturedHotels = (limit = 6) =>
  request<HotelSummary[]>('GET', '/api/hotels/featured', { query: { limit } });

export interface SearchResult {
  items: HotelSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export const searchHotels = (c: SearchCriteria, f: SearchFilters, page = 1) =>
  request<SearchResult>('GET', '/api/hotels/search', {
    query: {
      q: c.q,
      ...stayQuery(c),
      maxPrice: f.maxPrice,
      minStars: f.minStars,
      minRating: f.minRating,
      amenities: f.amenities.join(','),
      sort: f.sort,
      page,
      pageSize: 50,
    },
  });

export const getHotel = (id: string) => request<Hotel>('GET', `/api/hotels/${encodeURIComponent(id)}`);

export const getRoomOffers = (hotelId: string, c: SearchCriteria) =>
  request<RoomOffer[]>('GET', `/api/hotels/${encodeURIComponent(hotelId)}/rooms`, { query: stayQuery(c) });

// ---------- Tài khoản ----------

export const login = (email: string, password: string) =>
  request<AuthResponse>('POST', '/api/auth/login', { body: { email, password } });

export const register = (input: { name: string; email: string; phone: string; password: string }) =>
  request<AuthResponse>('POST', '/api/auth/register', { body: input });

export const getMe = () => request<User>('GET', '/api/me');

export const updateMe = (input: { name?: string; phone?: string }) => request<User>('PUT', '/api/me', { body: input });

export const getFavorites = () => request<HotelSummary[]>('GET', '/api/me/favorites');

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

export const createBooking = ({ criteria, ...rest }: NewBookingInput) =>
  request<Booking>('POST', '/api/bookings', {
    body: { ...rest, ...stayQuery(criteria), note: rest.note?.trim() || undefined },
  });

export const cancelBooking = (id: string) =>
  request<Booking>('POST', `/api/bookings/${encodeURIComponent(id)}/cancel`);
