import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { FavoriteButton } from '@/components/HotelCard';
import { StayPickers } from '@/components/SearchForm';
import {
  Button,
  Card,
  Divider,
  EmptyState,
  InfoRow,
  Loading,
  RatingBadge,
  RemoteImage,
  Screen,
  SectionTitle,
  Stars,
  type IconName,
} from '@/components/ui';
import { AMENITIES } from '@/data/hotels';
import { getHotel, getRoomOffers, type RoomOffer } from '@/services/api';
import { colors, MAX_WIDTH, radius } from '@/theme';
import type { Hotel } from '@/types';
import { criteriaToParams, parseCriteria } from '@/utils/criteria';
import { nightsBetween } from '@/utils/date';
import { formatNumber, formatVND, ratingLabel } from '@/utils/format';

function Gallery({ images }: { images: string[] }) {
  const { width: winWidth } = useWindowDimensions();
  const width = Math.min(winWidth, MAX_WIDTH) - 32;
  const height = Math.round(Math.min(width * 0.6, 420));
  const [index, setIndex] = useState(0);
  return (
    <View style={{ borderRadius: radius.lg, overflow: 'hidden' }}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        onScroll={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        scrollEventThrottle={64}
      >
        {images.map((uri, i) => (
          <RemoteImage key={i} uri={uri} style={{ width, height }} />
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {images.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

export default function HotelScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const paramsKey = JSON.stringify(params);
  const criteria = useMemo(() => parseCriteria(params), [paramsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const [hotel, setHotel] = useState<Hotel | null | undefined>(undefined);
  const [offers, setOffers] = useState<RoomOffer[]>([]);

  useEffect(() => {
    getHotel(params.id).then((h) => setHotel(h ?? null));
  }, [params.id]);

  // Tải lại phòng trống mỗi khi quay lại màn hình (vd. sau khi vừa đặt phòng).
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      getRoomOffers(params.id, criteria).then((o) => alive && setOffers(o));
      return () => {
        alive = false;
      };
    }, [params.id, criteria]),
  );

  if (hotel === undefined) return <Loading />;
  if (hotel === null) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        title="Không tìm thấy khách sạn"
        action={<Button title="Về trang chủ" onPress={() => router.replace('/')} />}
      />
    );
  }

  const nights = nightsBetween(criteria.checkIn, criteria.checkOut);

  return (
    <>
      <Stack.Screen options={{ title: hotel.name, headerRight: () => <FavoriteButton hotelId={hotel.id} /> }} />
      <Screen>
        <Gallery images={hotel.images} />

        <View style={{ gap: 6 }}>
          <Stars count={hotel.stars} />
          <Text style={styles.title}>{hotel.name}</Text>
          <InfoRow icon="location-outline">{hotel.address}</InfoRow>
          <View style={styles.row}>
            <RatingBadge rating={hotel.rating} />
            <Text style={styles.ratingText}>{ratingLabel(hotel.rating)}</Text>
            <Text style={styles.muted}>· {formatNumber(hotel.reviewCount)} đánh giá</Text>
          </View>
        </View>

        <Card style={{ gap: 10 }}>
          <Text style={styles.body}>{hotel.description}</Text>
          <Divider />
          <View style={styles.amenities}>
            {hotel.amenities.map((a) => (
              <View key={a} style={styles.amenity}>
                <Ionicons name={AMENITIES[a].icon as IconName} size={18} color={colors.primary} />
                <Text style={styles.amenityText}>{AMENITIES[a].label}</Text>
              </View>
            ))}
          </View>
        </Card>

        <SectionTitle>Chọn phòng</SectionTitle>
        <View style={{ gap: 10 }}>
          <StayPickers value={criteria} onChange={(c) => router.setParams(criteriaToParams(c))} />
        </View>

        {offers.map(({ room, remaining, fitsGuests }) => {
          const enough = remaining >= criteria.rooms;
          const bookable = enough && fitsGuests;
          return (
            <Card key={room.id} style={styles.roomCard}>
              <RemoteImage uri={room.image} style={styles.roomImage} />
              <View style={{ flex: 1, gap: 4, minWidth: 220 }}>
                <Text style={styles.roomName}>{room.name}</Text>
                <InfoRow icon="bed-outline">{room.beds}</InfoRow>
                <InfoRow icon="resize-outline">{`${room.size} m² · tối đa ${room.maxGuests} khách/phòng`}</InfoRow>
                {room.breakfastIncluded && (
                  <Text style={styles.perk}>✓ Bao gồm bữa sáng</Text>
                )}
                {room.freeCancellation ? (
                  <Text style={styles.perk}>✓ Hủy miễn phí trước ngày nhận phòng</Text>
                ) : (
                  <Text style={styles.muted}>Không hoàn tiền khi hủy</Text>
                )}
                <Text style={styles.muted}>{room.description}</Text>

                <View style={styles.roomFooter}>
                  <View>
                    <Text style={styles.price}>{formatVND(room.price)}</Text>
                    <Text style={styles.muted}>
                      /đêm · {formatVND(room.price * nights * criteria.rooms)} cho {nights} đêm, {criteria.rooms} phòng
                    </Text>
                    {enough && remaining <= 2 && (
                      <Text style={styles.warning}>Chỉ còn {remaining} phòng!</Text>
                    )}
                    {!enough && <Text style={styles.warning}>Hết phòng cho ngày đã chọn</Text>}
                    {enough && !fitsGuests && (
                      <Text style={styles.warning}>
                        Không đủ chỗ cho {criteria.guests} khách với {criteria.rooms} phòng
                      </Text>
                    )}
                  </View>
                  <Button
                    title="Đặt ngay"
                    disabled={!bookable}
                    onPress={() =>
                      router.push({
                        pathname: '/checkout',
                        params: { hotelId: hotel.id, roomId: room.id, ...criteriaToParams(criteria) },
                      })
                    }
                  />
                </View>
              </View>
            </Card>
          );
        })}

        <SectionTitle>Khách hàng nói gì</SectionTitle>
        {hotel.reviews.map((r) => (
          <Card key={r.id} style={{ gap: 6 }}>
            <View style={styles.row}>
              <RatingBadge rating={r.rating} />
              <Text style={styles.ratingText}>{r.author}</Text>
            </View>
            <Text style={styles.body}>“{r.comment}”</Text>
          </Card>
        ))}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  dots: { position: 'absolute', bottom: 10, alignSelf: 'center', flexDirection: 'row', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.6)' },
  dotActive: { backgroundColor: '#fff', width: 18 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ratingText: { fontWeight: '700', color: colors.text },
  muted: { color: colors.muted, fontSize: 13 },
  body: { fontSize: 15, lineHeight: 22, color: colors.text },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  amenity: { flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: 140 },
  amenityText: { color: colors.text },
  roomCard: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  roomImage: { width: '100%', maxWidth: 320, height: 170, borderRadius: radius.md, flexGrow: 1 },
  roomName: { fontSize: 17, fontWeight: '700', color: colors.text },
  perk: { color: colors.success, fontSize: 13, fontWeight: '600' },
  roomFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 8,
  },
  price: { fontSize: 20, fontWeight: '800', color: colors.accent },
  warning: { color: colors.danger, fontSize: 13, fontWeight: '600', marginTop: 2 },
});
