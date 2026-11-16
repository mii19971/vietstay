// Dữ liệu mẫu (mock). Khi có backend thật, thay thế phần đọc dữ liệu trong src/services/api.ts.
import type { AmenityKey, City, Hotel, Review, Room } from '@/types';

const u = (id: string, w = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;

const HOTEL_IMAGES = [
  u('photo-1566073771259-6a8506099945'),
  u('photo-1542314831-068cd1dbfeeb'),
  u('photo-1551882547-ff40c63fe5fa'),
  u('photo-1520250497591-112f2f40a3f4'),
  u('photo-1571896349842-33c89424de2d'),
  u('photo-1582719478250-c89cae4dc85b'),
  u('photo-1564501049412-61c2a3083791'),
  u('photo-1584132967334-10e028bd69f7'),
];

const ROOM_IMAGES = [
  u('photo-1611892440504-42a792e24d32', 800),
  u('photo-1590490360182-c33d57733427', 800),
  u('photo-1631049307264-da0ec9d70304', 800),
  u('photo-1618773928121-c32242e63f39', 800),
];

export const AMENITIES: Record<AmenityKey, { label: string; icon: string }> = {
  wifi: { label: 'Wi-Fi miễn phí', icon: 'wifi' },
  pool: { label: 'Hồ bơi', icon: 'water-outline' },
  spa: { label: 'Spa', icon: 'flower-outline' },
  gym: { label: 'Phòng gym', icon: 'barbell-outline' },
  restaurant: { label: 'Nhà hàng', icon: 'restaurant-outline' },
  parking: { label: 'Chỗ đỗ xe', icon: 'car-outline' },
  breakfast: { label: 'Bữa sáng', icon: 'cafe-outline' },
  airport: { label: 'Đưa đón sân bay', icon: 'airplane-outline' },
  beach: { label: 'Gần biển', icon: 'umbrella-outline' },
  ac: { label: 'Điều hòa', icon: 'snow-outline' },
  pet: { label: 'Cho phép thú cưng', icon: 'paw-outline' },
};

export const CITIES: City[] = [
  { id: 'ha-noi', name: 'Hà Nội', image: u('photo-1509030450996-dd1a26dda07a', 600) },
  { id: 'ho-chi-minh', name: 'TP. Hồ Chí Minh', image: u('photo-1583417319070-4a69db38a482', 600) },
  { id: 'da-nang', name: 'Đà Nẵng', image: u('photo-1559592413-7cec4d0cae2b', 600) },
  { id: 'hoi-an', name: 'Hội An', image: u('photo-1557750255-c76072a7aad1', 600) },
  { id: 'nha-trang', name: 'Nha Trang', image: u('photo-1573270689103-d7a4e42b609a', 600) },
  { id: 'phu-quoc', name: 'Phú Quốc', image: u('photo-1540541338287-41700207dee6', 600) },
  { id: 'da-lat', name: 'Đà Lạt', image: u('photo-1555921015-5532091f6026', 600) },
  { id: 'sa-pa', name: 'Sa Pa', image: u('photo-1528127269322-539801943592', 600) },
];

const REVIEW_POOL: Omit<Review, 'id' | 'date'>[] = [
  { author: 'Minh Anh', rating: 9.2, comment: 'Phòng sạch sẽ, nhân viên thân thiện, vị trí rất thuận tiện.' },
  { author: 'Quốc Bảo', rating: 8.6, comment: 'Bữa sáng ngon và đa dạng. Sẽ quay lại lần sau.' },
  { author: 'Thu Hà', rating: 9.6, comment: 'View đẹp tuyệt vời, check-in nhanh chóng.' },
  { author: 'Đức Huy', rating: 7.8, comment: 'Giá hợp lý, tuy nhiên cách âm chưa tốt lắm.' },
  { author: 'Lan Phương', rating: 8.9, comment: 'Hồ bơi rộng, rất phù hợp cho gia đình có trẻ nhỏ.' },
  { author: 'Hoàng Nam', rating: 9.0, comment: 'Dịch vụ chu đáo, giường êm, ngủ rất ngon.' },
];

function makeReviews(seed: number): Review[] {
  return [0, 1, 2].map((i) => {
    const r = REVIEW_POOL[(seed + i * 2) % REVIEW_POOL.length];
    return { ...r, id: `rv-${seed}-${i}`, date: `2026-${String(((seed + i) % 9) + 1).padStart(2, '0')}-1${i}` };
  });
}

function makeRooms(hotelId: string, base: number, seed: number): Room[] {
  const img = (i: number) => ROOM_IMAGES[(seed + i) % ROOM_IMAGES.length];
  return [
    {
      id: `${hotelId}-std`,
      name: 'Phòng Tiêu chuẩn',
      description: 'Phòng ấm cúng với đầy đủ tiện nghi cơ bản, phù hợp cho chuyến đi ngắn ngày.',
      size: 22,
      beds: '1 giường đôi',
      maxGuests: 2,
      price: base,
      image: img(0),
      inventory: 6,
      freeCancellation: false,
      breakfastIncluded: false,
    },
    {
      id: `${hotelId}-dlx`,
      name: 'Phòng Deluxe',
      description: 'Không gian rộng rãi, cửa sổ lớn đón ánh sáng tự nhiên, bao gồm bữa sáng.',
      size: 30,
      beds: '1 giường King',
      maxGuests: 2,
      price: Math.round((base * 1.4) / 10_000) * 10_000,
      image: img(1),
      inventory: 4,
      freeCancellation: true,
      breakfastIncluded: true,
    },
    {
      id: `${hotelId}-fam`,
      name: 'Phòng Gia đình',
      description: 'Hai giường lớn, khu vực sinh hoạt riêng, lý tưởng cho gia đình 4 người.',
      size: 40,
      beds: '2 giường Queen',
      maxGuests: 4,
      price: Math.round((base * 1.8) / 10_000) * 10_000,
      image: img(2),
      inventory: 3,
      freeCancellation: true,
      breakfastIncluded: true,
    },
    {
      id: `${hotelId}-ste`,
      name: 'Suite Hướng cảnh',
      description: 'Phòng khách riêng biệt, bồn tắm nằm và tầm nhìn toàn cảnh tuyệt đẹp.',
      size: 55,
      beds: '1 giường King + sofa giường',
      maxGuests: 3,
      price: Math.round((base * 2.6) / 10_000) * 10_000,
      image: img(3),
      inventory: 1,
      freeCancellation: true,
      breakfastIncluded: true,
    },
  ];
}

type HotelSeed = Omit<Hotel, 'rooms' | 'reviews' | 'images' | 'city'> & { basePrice: number };

const SEEDS: HotelSeed[] = [
  {
    id: 'hn-lotus-old-quarter',
    name: 'Lotus Old Quarter Hotel',
    cityId: 'ha-noi',
    address: '28 Hàng Bạc, Hoàn Kiếm, Hà Nội',
    stars: 4,
    rating: 9.1,
    reviewCount: 1284,
    description: 'Nằm giữa lòng phố cổ, chỉ vài phút đi bộ tới Hồ Gươm. Thiết kế giao thoa giữa nét Đông Dương và hiện đại.',
    amenities: ['wifi', 'restaurant', 'breakfast', 'ac', 'airport'],
    basePrice: 1_150_000,
  },
  {
    id: 'hn-west-lake-retreat',
    name: 'West Lake Retreat',
    cityId: 'ha-noi',
    address: '115 Quảng An, Tây Hồ, Hà Nội',
    stars: 5,
    rating: 9.4,
    reviewCount: 862,
    description: 'Khu nghỉ dưỡng yên tĩnh bên Hồ Tây với hồ bơi vô cực, spa và nhà hàng ẩm thực Việt cao cấp.',
    amenities: ['wifi', 'pool', 'spa', 'gym', 'restaurant', 'parking', 'breakfast', 'ac'],
    basePrice: 2_600_000,
  },
  {
    id: 'hcm-saigon-skyline',
    name: 'Saigon Skyline Hotel',
    cityId: 'ho-chi-minh',
    address: '76 Lê Lợi, Quận 1, TP. Hồ Chí Minh',
    stars: 5,
    rating: 8.9,
    reviewCount: 2310,
    description: 'Khách sạn trung tâm Quận 1 với rooftop bar nhìn toàn cảnh thành phố và hồ bơi trên tầng thượng.',
    amenities: ['wifi', 'pool', 'gym', 'restaurant', 'spa', 'ac', 'airport'],
    basePrice: 2_200_000,
  },
  {
    id: 'hcm-district3-boutique',
    name: 'District 3 Boutique',
    cityId: 'ho-chi-minh',
    address: '52 Võ Văn Tần, Quận 3, TP. Hồ Chí Minh',
    stars: 3,
    rating: 8.4,
    reviewCount: 540,
    description: 'Khách sạn boutique nhỏ xinh trên con phố rợp bóng cây, gần nhiều quán cà phê nổi tiếng.',
    amenities: ['wifi', 'breakfast', 'ac', 'pet'],
    basePrice: 750_000,
  },
  {
    id: 'dn-my-khe-ocean',
    name: 'My Khe Ocean Resort',
    cityId: 'da-nang',
    address: '200 Võ Nguyên Giáp, Sơn Trà, Đà Nẵng',
    stars: 5,
    rating: 9.3,
    reviewCount: 1795,
    description: 'Resort ven biển Mỹ Khê với bãi biển riêng, ba hồ bơi và câu lạc bộ trẻ em.',
    amenities: ['wifi', 'pool', 'spa', 'gym', 'restaurant', 'beach', 'parking', 'breakfast', 'ac', 'airport'],
    basePrice: 2_900_000,
  },
  {
    id: 'dn-han-river-view',
    name: 'Han River View Hotel',
    cityId: 'da-nang',
    address: '35 Bạch Đằng, Hải Châu, Đà Nẵng',
    stars: 4,
    rating: 8.7,
    reviewCount: 980,
    description: 'Ngắm cầu Rồng phun lửa ngay từ ban công phòng. Gần chợ Hàn và các điểm ăn uống.',
    amenities: ['wifi', 'pool', 'restaurant', 'breakfast', 'ac', 'parking'],
    basePrice: 1_250_000,
  },
  {
    id: 'ha-lantern-garden',
    name: 'Lantern Garden Villa',
    cityId: 'hoi-an',
    address: '12 Trần Hưng Đạo, Minh An, Hội An',
    stars: 4,
    rating: 9.5,
    reviewCount: 1120,
    description: 'Biệt thự sân vườn đậm chất phố Hội, miễn phí xe đạp và lớp học nấu ăn truyền thống.',
    amenities: ['wifi', 'pool', 'breakfast', 'restaurant', 'ac', 'airport'],
    basePrice: 1_350_000,
  },
  {
    id: 'nt-coral-bay',
    name: 'Coral Bay Nha Trang',
    cityId: 'nha-trang',
    address: '64 Trần Phú, Lộc Thọ, Nha Trang',
    stars: 4,
    rating: 8.6,
    reviewCount: 1430,
    description: 'Đối diện bãi biển Trần Phú, hồ bơi tầng thượng và nhà hàng hải sản tươi sống.',
    amenities: ['wifi', 'pool', 'restaurant', 'beach', 'breakfast', 'ac', 'gym'],
    basePrice: 1_100_000,
  },
  {
    id: 'pq-sunset-sanctuary',
    name: 'Sunset Sanctuary Phú Quốc',
    cityId: 'phu-quoc',
    address: 'Bãi Trường, Dương Tơ, Phú Quốc',
    stars: 5,
    rating: 9.6,
    reviewCount: 760,
    description: 'Những căn villa có hồ bơi riêng hướng về hoàng hôn trên biển. Thiên đường cho kỳ nghỉ trăng mật.',
    amenities: ['wifi', 'pool', 'spa', 'gym', 'restaurant', 'beach', 'breakfast', 'ac', 'airport'],
    basePrice: 3_800_000,
  },
  {
    id: 'dl-pine-hill',
    name: 'Pine Hill Lodge',
    cityId: 'da-lat',
    address: '9 Trần Hưng Đạo, Phường 10, Đà Lạt',
    stars: 3,
    rating: 8.8,
    reviewCount: 615,
    description: 'Nhà nghỉ gỗ giữa đồi thông, lò sưởi ấm áp và vườn hoa quanh năm.',
    amenities: ['wifi', 'breakfast', 'parking', 'pet', 'restaurant'],
    basePrice: 680_000,
  },
  {
    id: 'sp-cloud-terrace',
    name: 'Cloud Terrace Sa Pa',
    cityId: 'sa-pa',
    address: '18 Mường Hoa, Sa Pa, Lào Cai',
    stars: 4,
    rating: 9.0,
    reviewCount: 488,
    description: 'Phòng kính nhìn thẳng ra thung lũng Mường Hoa và ruộng bậc thang, có bể sục nước nóng ngoài trời.',
    amenities: ['wifi', 'spa', 'restaurant', 'breakfast', 'parking'],
    basePrice: 1_450_000,
  },
];

export const HOTELS: Hotel[] = SEEDS.map(({ basePrice, ...seed }, i) => ({
  ...seed,
  city: CITIES.find((c) => c.id === seed.cityId)?.name ?? '',
  images: [0, 1, 2, 3].map((k) => HOTEL_IMAGES[(i + k * 3) % HOTEL_IMAGES.length]),
  rooms: makeRooms(seed.id, basePrice, i),
  reviews: makeReviews(i),
}));
