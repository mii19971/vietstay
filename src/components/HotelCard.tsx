import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useAppStore } from '@/store/AppStore';
import { colors, radius, shadow } from '@/theme';
import type { Hotel } from '@/types';
import { formatNumber, formatVND, ratingLabel } from '@/utils/format';
import { RatingBadge, RemoteImage, Stars } from './ui';

export function FavoriteButton({ hotelId, size = 22 }: { hotelId: string; size?: number }) {
  const { isFavorite, toggleFavorite } = useAppStore();
  const fav = isFavorite(hotelId);
  return (
    <Pressable
      onPress={() => toggleFavorite(hotelId)}
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
  hotel: Hotel;
  /** Giá/đêm thấp nhất; không truyền thì hiển thị giá từ phòng rẻ nhất. */
  price?: number;
  nights?: number;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const fromPrice = price ?? Math.min(...hotel.rooms.map((r) => r.price));
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={hotel.name}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }, style]}
    >
      <View>
        <RemoteImage uri={hotel.images[0]} style={styles.image} />
        <View style={styles.favWrap}>
          <FavoriteButton hotelId={hotel.id} />
        </View>
      </View>
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
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.lg, overflow: 'hidden', ...shadow },
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
