// Kiểu dữ liệu trả về từ VietStay API. Nội dung khách sạn lấy từ database hbe (không có giá phòng).

/** Mã tiện nghi chính do API tính sẵn (dùng cho icon và bộ lọc). */
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
  | 'pet';

export type Lang = 'vi' | 'en';

export interface ImageInfo {
  url: string; // ~1000px
  thumb: string; // ~350px
  caption?: string | null;
}

/** Khách sạn dạng rút gọn cho danh sách (tìm kiếm, nổi bật, yêu thích). id = external_property_id. */
export interface HotelSummary {
  id: string;
  name: string;
  /** Loại hình: Khách sạn, Resort, Căn hộ... */
  category?: string | null;
  city: string;
  address: string;
  countryCode?: string | null;
  /** Hạng sao 0–5, có thể lẻ .5 (0 = chưa xếp hạng). */
  stars: number;
  /** Điểm khách đánh giá, thang 10 (0 = chưa có). */
  rating: number;
  reviewCount: number;
  image: string;
  amenities: AmenityKey[];
  lat?: number | null;
  lng?: number | null;
}

/** Gợi ý khi gõ: một vùng (thành phố, khu phố, sân bay, điểm tham quan...) hoặc một khách sạn. */
export interface PlaceSuggestion {
  type: 'region' | 'hotel';
  id: string;
  name: string;
  subtitle?: string | null;
  /** city, neighborhood, point_of_interest, airport, ... (chỉ với type = region). */
  regionType?: string | null;
  countryCode?: string | null;
}

export interface Region {
  id: string;
  name: string;
  type?: string | null;
  subtitle?: string | null;
  countryCode?: string | null;
  parentId?: string | null;
  lat?: number | null;
  lng?: number | null;
  hotelCount: number;
}

/** Điểm đến phổ biến. id = region id. */
export interface Destination {
  id: string;
  name: string;
  image: string;
  hotelCount: number;
}

export interface Room {
  id: string;
  name: string;
  /** Văn bản thuần, có thể nhiều dòng. */
  description: string;
  sizeM2?: number | null;
  beds: string[];
  /** Số khách tối đa / phòng (null = không rõ). */
  maxGuests?: number | null;
  maxAdults?: number | null;
  maxChildren?: number | null;
  images: ImageInfo[];
  amenities: string[];
  views: string[];
}

export interface NamedItem {
  id: string;
  name: string;
  value?: string | null;
}

export interface DescriptionSection {
  key: string;
  title: string;
  text: string;
}

export interface RatingBreakdown {
  cleanliness?: number | null;
  service?: number | null;
  comfort?: number | null;
  condition?: number | null;
  amenities?: number | null;
}

export interface Policies {
  checkInFrom?: string | null;
  checkInUntil?: string | null;
  checkOutBefore?: string | null;
  checkInInstructions?: string | null;
  specialInstructions?: string | null;
  knowBeforeYouGo?: string | null;
  mandatoryFees?: string | null;
  optionalFees?: string | null;
  pets: string[];
  general: string[];
}

export interface Hotel {
  id: string;
  name: string;
  category?: string | null;
  city: string;
  address: string;
  countryCode?: string | null;
  stars: number;
  rating: number; // thang 10
  reviewCount: number;
  ratingBreakdown?: RatingBreakdown | null;
  headline?: string | null;
  /** Mô tả vị trí (văn bản thuần). */
  description: string;
  sections: DescriptionSection[];
  images: ImageInfo[];
  amenityKeys: AmenityKey[];
  /** Toàn bộ tiện nghi (tên đã dịch). */
  amenities: NamedItem[];
  rooms: Room[];
  policies: Policies;
  statistics: NamedItem[];
  phone?: string | null;
  lat?: number | null;
  lng?: number | null;
}

/** pending = yêu cầu đã gửi, chờ khách sạn xác nhận giá & phòng. */
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

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
  /** null khi chưa có giá (khách sạn sẽ báo giá khi xác nhận). */
  pricePerNight?: number | null;
  subtotal?: number | null;
  taxes?: number | null;
  total?: number | null;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  note?: string | null;
  paymentMethod: PaymentMethod;
  status: BookingStatus;
  /** Server tính: còn hủy được không (chưa hủy và chưa tới ngày nhận phòng). */
  canCancel: boolean;
  createdAt: string; // ISO datetime
  cancelledAt?: string | null;
}

export interface SearchCriteria {
  /** Từ khóa hiển thị (tên điểm đến). */
  q: string;
  /** Vùng đã chọn từ gợi ý / điểm đến phổ biến; ưu tiên hơn q khi tìm kiếm. */
  regionId?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}

export type SortOption = 'recommended' | 'rating' | 'stars' | 'name';

export interface SearchFilters {
  minStars?: number;
  minRating?: number;
  amenities: AmenityKey[];
  sort: SortOption;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: User;
}
