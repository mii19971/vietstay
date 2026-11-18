import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { ApiError } from '@/services/api';
import { useAppStore } from '@/store/AppStore';
import { colors, radius, shadow } from '@/theme';
import type { HotelSummary } from '@/types';
import { notify } from '@/utils/dialog';
import { formatNumber, formatVND, ratingLabel } from '@/utils/format';
import { RatingBadge, RemoteImage, Stars } from './ui';

export function FavoriteButton({ hotelId, size = 22 }: { hotelId: string; size?: number }) {
  const { isFavorite, toggleFavorite } = useAppStore();
  const fav = isFavorite(hotelId);
  const onPress = async () => {
    try {
      // Chưa đăng nhập → mở màn hình đăng nhập (yêu thích được lưu theo tài khoản).
      if (!(await toggleFavorite(hotelId))) router.push('/login');
    } catch (err) {
      notify('Không lưu được yêu thích', err instanceof ApiError ? err.message : 'Đã có lỗi xảy ra.');
    }
  };
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={fav ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
      style={styles.favBtn}
    >
      <Ionicons name={fav ? 'heart' : 'heart-outline'} size={size} color={fav ? colors.danger : colors.text} />
    </Pressable>
  );
}

export function HotelCard({
  hotel,
  price,
  nights,
  onPress,
  style,
}: {
  hotel: HotelSummary;
  /** Giá/đêm hiển thị; mặc định là hotel.minPrice. */
  price?: number;
  nights?: number;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const fromPrice = price ?? hotel.minPrice;
  // Nút yêu thích là anh em (không phải con) của nút thẻ: trên web Pressable role="button"
  // render thành <button>, và HTML không cho phép <button> lồng trong <button>.
  return (
    <View style={[styles.card, style]}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={hotel.name}
        style={({ pressed }) => [styles.cardInner, pressed && { opacity: 0.92 }]}
      >
        <RemoteImage uri={hotel.image} style={styles.image} />
        <View style={styles.body}>
          <Stars count={hotel.stars} size={12} />
          <Text style={styles.name} numberOfLines={1}>
            {hotel.name}
          </Text>
          <View style={styles.row}>
            <Ionicons name="location-outline" size={14} color={colors.muted} />
            <Text style={styles.muted} numberOfLines={1}>
              {hotel.city}
            </Text>
          </View>
          <View style={[styles.row, { marginTop: 4 }]}>
            <RatingBadge rating={hotel.rating} />
            <Text style={styles.ratingText}>{ratingLabel(hotel.rating)}</Text>
            <Text style={styles.muted}>· {formatNumber(hotel.reviewCount)} đánh giá</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.muted}>Từ</Text>
            <Text style={styles.price}>{formatVND(fromPrice)}</Text>
            <Text style={styles.muted}>/đêm</Text>
          </View>
          {nights && nights > 1 ? (
            <Text style={[styles.muted, { fontSize: 12 }]}>
              {formatVND(fromPrice * nights)} cho {nights} đêm (chưa gồm thuế)
            </Text>
          ) : null}
        </View>
      </Pressable>
      <View style={styles.favWrap}>
        <FavoriteButton hotelId={hotel.id} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.lg, ...shadow },
  cardInner: { borderRadius: radius.lg, overflow: 'hidden' },
  image: { width: '100%', height: 180 },
  favWrap: { position: 'absolute', top: 10, right: 10 },
  favBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: 14, gap: 4 },
  name: { fontSize: 17, fontWeight: '700', color: colors.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  muted: { color: colors.muted, fontSize: 13 },
  ratingText: { fontWeight: '600', color: colors.text, fontSize: 14 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 6 },
  price: { fontSize: 18, fontWeight: '800', color: colors.accent },
});
