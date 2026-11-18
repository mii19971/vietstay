import type { IconName } from '@/components/ui';
import type { AmenityKey } from '@/types';

/** Nhãn + icon cho mã tiện nghi do API trả về. */
export const AMENITIES: Record<AmenityKey, { label: string; icon: IconName }> = {
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

export function amenityInfo(key: string): { label: string; icon: IconName } {
  return AMENITIES[key as AmenityKey] ?? { label: key, icon: 'checkmark-circle-outline' };
}
