export type AmenityKey =
  | 'wifi'
  | 'pool'
  | 'spa'
  | 'gym'
  | 'restaurant'
  | 'parking'
  | 'breakfast'
  | 'airport'
  | 'beach'
  | 'ac'
  | 'pet';

export interface Review {
  id: string;
  author: string;
  rating: number; // thang 10
  comment: string;
  date: string; // YYYY-MM-DD
}

export interface Room {
  id: string;
  name: string;
  description: string;
  size: number; // m2
  beds: string;
  maxGuests: number; // số khách tối đa / phòng
  price: number; // VND / đêm
  image: string;
  inventory: number; // tổng số phòng loại này
  freeCancellation: boolean;
  breakfastIncluded: boolean;
}

export interface Hotel {
  id: string;
  name: string;
  cityId: string;
  city: string;
  address: string;
  stars: number;
  rating: number; // thang 10
  reviewCount: number;
  description: string;
  images: string[];
  amenities: AmenityKey[];
  rooms: Room[];
  reviews: Review[];
}

export interface City {
  id: string;
  name: string;
  image: string;
}

export type BookingStatus = 'confirmed' | 'cancelled';

export type PaymentMethod = 'pay_at_hotel' | 'bank_transfer' | 'card';

export interface Booking {
  id: string;
  code: string;
  hotelId: string;
  hotelName: string;
  hotelImage: string;
  city: string;
  address: string;
  roomId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  rooms: number;
  pricePerNight: number;
  subtotal: number;
  taxes: number;
  total: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  note?: string;
  paymentMethod: PaymentMethod;
  status: BookingStatus;
  createdAt: string; // ISO datetime
}

export interface SearchCriteria {
  q: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}

export type SortOption = 'recommended' | 'price-asc' | 'price-desc' | 'rating';

export interface SearchFilters {
  maxPrice?: number;
  minStars?: number;
  minRating?: number;
  amenities: AmenityKey[];
  sort: SortOption;
}

export interface Profile {
  name: string;
  email: string;
  phone: string;
}
