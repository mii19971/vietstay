import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { ApiError } from '@/services/api';
import { useAppStore } from '@/store/AppStore';
import { colors, radius, shadow } from '@/theme';
import type { HotelSummary } from '@/types';
import { notify } from '@/utils/dialog';
import { amenityInfo } from '@/data/amenities';
import { formatNumber, ratingLabel } from '@/utils/format';
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
  onPress,
  style,
}: {
  hotel: HotelSummary;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const amenities = hotel.amenities.slice(0, 4);
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
          <View style={styles.row}>
            {!!hotel.category && <Text style={styles.category}>{hotel.category}</Text>}
            <Stars count={hotel.stars} size={12} />
          </View>
          <Text style={styles.name} numberOfLines={1}>
            {hotel.name}
          </Text>
          <View style={styles.row}>
            <Ionicons name="location-outline" size={14} color={colors.muted} />
            <Text style={styles.muted} numberOfLines={1}>
              {hotel.address || hotel.city}
            </Text>
          </View>
          <View style={[styles.row, { marginTop: 4 }]}>
            {hotel.rating > 0 ? (
              <>
                <RatingBadge rating={hotel.rating} />
                <Text style={styles.ratingText}>{ratingLabel(hotel.rating)}</Text>
                <Text style={styles.muted}>· {formatNumber(hotel.reviewCount)} đánh giá</Text>
              </>
            ) : (
              <Text style={styles.muted}>Chưa có đánh giá</Text>
            )}
          </View>
          {amenities.length > 0 && (
            <View style={styles.amenities}>
              {amenities.map((a) => (
                <View key={a} style={styles.row} accessibilityLabel={amenityInfo(a).label}>
                  <Ionicons name={amenityInfo(a).icon} size={13} color={colors.primary} />
                  <Text style={styles.amenityText}>{amenityInfo(a).label}</Text>
                </View>
              ))}
            </View>
          )}
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
  category: { fontSize: 12, fontWeight: '700', color: colors.primary, textTransform: 'uppercase' },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 10, rowGap: 4, marginTop: 6 },
  amenityText: { color: colors.muted, fontSize: 12 },
});
