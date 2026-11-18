import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { FavoriteButton } from '@/components/HotelCard';
import { StayPickers } from '@/components/SearchForm';
import {
  Button,
  Card,
  Divider,
  EmptyState,
  ErrorState,
  InfoRow,
  Loading,
  RatingBadge,
  RemoteImage,
  Screen,
  SectionTitle,
  Stars,
} from '@/components/ui';
import { amenityInfo } from '@/data/amenities';
import { useApi } from '@/hooks/useApi';
import { getHotel } from '@/services/api';
import { colors, MAX_WIDTH, radius } from '@/theme';
import type { Hotel, ImageInfo, RatingBreakdown, Room, SearchCriteria } from '@/types';
import { criteriaToParams, parseCriteria } from '@/utils/criteria';
import { formatNumber, ratingLabel } from '@/utils/format';

function Gallery({ images }: { images: ImageInfo[] }) {
  const { width: winWidth } = useWindowDimensions();
  const width = Math.min(winWidth, MAX_WIDTH) - 32;
  const height = Math.round(Math.min(width * 0.6, 420));
  const [index, setIndex] = useState(0);
  // Chỉ render tối đa 15 ảnh đầu để trang nhẹ (khách sạn lớn có hàng trăm ảnh).
  const shown = images.slice(0, 15);
  if (shown.length === 0) return <RemoteImage uri="" style={{ width, height, borderRadius: radius.lg }} />;
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
        {shown.map((img, i) => (
          <RemoteImage key={i} uri={img.url} style={{ width, height }} />
        ))}
      </ScrollView>
      <View style={styles.counter}>
        <Text style={styles.counterText}>
          {index + 1}/{shown.length}
          {shown[index]?.caption ? ` · ${shown[index].caption}` : ''}
        </Text>
      </View>
    </View>
  );
}

const BREAKDOWN: { key: keyof RatingBreakdown; label: string }[] = [
  { key: 'cleanliness', label: 'Sạch sẽ' },
  { key: 'service', label: 'Dịch vụ' },
  { key: 'comfort', label: 'Thoải mái' },
  { key: 'condition', label: 'Tình trạng' },
  { key: 'amenities', label: 'Tiện nghi' },
];

function Breakdown({ value }: { value: RatingBreakdown }) {
  const rows = BREAKDOWN.filter((b) => value[b.key] != null);
  return (
    <View style={{ gap: 6 }}>
      {rows.map((b) => (
        <View key={b.key} style={styles.barRow}>
          <Text style={styles.barLabel}>{b.label}</Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${(value[b.key]! / 10) * 100}%` }]} />
          </View>
          <Text style={styles.barValue}>{value[b.key]!.toFixed(1)}</Text>
        </View>
      ))}
    </View>
  );
}

/** Đoạn văn dài: hiện vài dòng đầu, bấm để xem hết. */
function ExpandableText({ text, lines = 4 }: { text: string; lines?: number }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 220 || text.split('\n').length > lines;
  return (
    <View style={{ gap: 4 }}>
      <Text style={styles.body} numberOfLines={open ? undefined : lines}>
        {text}
      </Text>
      {long && (
        <Pressable onPress={() => setOpen((o) => !o)} accessibilityRole="button" hitSlop={6}>
          <Text style={styles.link}>{open ? 'Thu gọn' : 'Xem thêm'}</Text>
        </Pressable>
      )}
    </View>
  );
}

function Policies({ hotel }: { hotel: Hotel }) {
  const p = hotel.policies;
  const blocks: { title: string; text?: string | null }[] = [
    { title: 'Hướng dẫn nhận phòng', text: p.checkInInstructions },
    { title: 'Lưu ý đặc biệt', text: p.specialInstructions },
    { title: 'Cần biết trước khi đến', text: p.knowBeforeYouGo },
    { title: 'Phí bắt buộc', text: p.mandatoryFees },
    { title: 'Phí tùy chọn', text: p.optionalFees },
    { title: 'Vật nuôi', text: p.pets.join('\n') },
  ];
  return (
    <Card style={{ gap: 10 }}>
      <View style={styles.timeRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.muted}>Nhận phòng</Text>
          <Text style={styles.strong}>
            {p.checkInFrom ? `Từ ${p.checkInFrom}` : '—'}
            {p.checkInUntil ? ` đến ${p.checkInUntil}` : ''}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.muted}>Trả phòng</Text>
          <Text style={styles.strong}>{p.checkOutBefore ? `Trước ${p.checkOutBefore}` : '—'}</Text>
        </View>
      </View>
      {blocks
        .filter((b) => !!b.text)
        .map((b) => (
          <View key={b.title} style={{ gap: 4 }}>
            <Divider />
            <Text style={styles.subTitle}>{b.title}</Text>
            <ExpandableText text={b.text!} lines={5} />
          </View>
        ))}
    </Card>
  );
}

function RoomCard({ room, hotel, criteria }: { room: Room; hotel: Hotel; criteria: SearchCriteria }) {
  const fits = room.maxGuests == null || room.maxGuests * criteria.rooms >= criteria.guests;
  const image = room.images[0]?.thumb ?? hotel.images[0]?.thumb ?? '';
  return (
    <Card style={styles.roomCard}>
      <RemoteImage uri={image} style={styles.roomImage} />
      <View style={{ gap: 4 }}>
        <Text style={styles.roomName}>{room.name}</Text>
        {room.beds.length > 0 && <InfoRow icon="bed-outline">{room.beds.join(' hoặc ')}</InfoRow>}
        <InfoRow icon="people-outline">
          {[
            room.sizeM2 ? `${formatNumber(room.sizeM2)} m²` : null,
            room.maxGuests ? `tối đa ${room.maxGuests} khách/phòng` : null,
          ]
            .filter(Boolean)
            .join(' · ') || 'Chưa có thông tin sức chứa'}
        </InfoRow>
        {room.views.length > 0 && <InfoRow icon="eye-outline">{room.views.join(', ')}</InfoRow>}
        {room.amenities.length > 0 && (
          <Text style={styles.muted} numberOfLines={2}>
            {room.amenities.slice(0, 8).join(' · ')}
          </Text>
        )}

        <View style={styles.roomFooter}>
          <View style={{ flex: 1, minWidth: 160 }}>
            <Text style={styles.muted}>Giá sẽ được khách sạn báo khi xác nhận yêu cầu.</Text>
            {!fits && (
              <Text style={styles.warning}>
                Không đủ chỗ cho {criteria.guests} khách với {criteria.rooms} phòng
              </Text>
            )}
          </View>
          <Button
            title="Gửi yêu cầu"
            disabled={!fits}
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
}

export default function HotelScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const paramsKey = JSON.stringify(params);
  const criteria = useMemo(() => parseCriteria(params), [paramsKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  const hotelReq = useApi(() => getHotel(params.id), [params.id]);
  const hotel = hotelReq.data;
  if (hotelReq.errorStatus === 404) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        title="Không tìm thấy khách sạn"
        action={<Button title="Về trang chủ" onPress={() => router.replace('/')} />}
      />
    );
  }
  if (hotelReq.error) return <ErrorState message={hotelReq.error} onRetry={hotelReq.reload} />;
  if (!hotel) return <Loading />;

  const amenities = showAllAmenities ? hotel.amenities : hotel.amenities.slice(0, 12);

  return (
    <>
      <Stack.Screen options={{ title: hotel.name, headerRight: () => <FavoriteButton hotelId={hotel.id} /> }} />
      <Screen>
        <Gallery images={hotel.images} />

        <View style={{ gap: 6 }}>
          <View style={styles.row}>
            {!!hotel.category && <Text style={styles.category}>{hotel.category}</Text>}
            <Stars count={hotel.stars} />
          </View>
          <Text style={styles.title}>{hotel.name}</Text>
          <InfoRow icon="location-outline">{hotel.address}</InfoRow>
          {!!hotel.phone && <InfoRow icon="call-outline">{hotel.phone}</InfoRow>}
          {hotel.rating > 0 ? (
            <View style={styles.row}>
              <RatingBadge rating={hotel.rating} />
              <Text style={styles.ratingText}>{ratingLabel(hotel.rating)}</Text>
              <Text style={styles.muted}>· {formatNumber(hotel.reviewCount)} đánh giá</Text>
            </View>
          ) : (
            <Text style={styles.muted}>Chưa có đánh giá</Text>
          )}
        </View>

        <Card style={{ gap: 10 }}>
          {!!hotel.headline && <Text style={styles.headline}>{hotel.headline}</Text>}
          {!!hotel.description && <ExpandableText text={hotel.description} />}
          {hotel.amenityKeys.length > 0 && (
            <>
              <Divider />
              <View style={styles.amenities}>
                {hotel.amenityKeys.map((a) => (
                  <View key={a} style={styles.amenity}>
                    <Ionicons name={amenityInfo(a).icon} size={18} color={colors.primary} />
                    <Text style={styles.amenityText}>{amenityInfo(a).label}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </Card>

        {hotel.ratingBreakdown && (
          <>
            <SectionTitle>Khách đánh giá</SectionTitle>
            <Card>
              <Breakdown value={hotel.ratingBreakdown} />
            </Card>
          </>
        )}

        <SectionTitle>Chọn phòng</SectionTitle>
        <View style={{ gap: 10 }}>
          <StayPickers value={criteria} onChange={(c) => router.setParams(criteriaToParams(c))} />
        </View>
        {hotel.rooms.length === 0 ? (
          <Text style={styles.muted}>Khách sạn chưa có thông tin loại phòng.</Text>
        ) : (
          hotel.rooms.map((room) => <RoomCard key={room.id} room={room} hotel={hotel} criteria={criteria} />)
        )}

        {hotel.amenities.length > 0 && (
          <>
            <SectionTitle>Tất cả tiện nghi</SectionTitle>
            <Card style={{ gap: 6 }}>
              {amenities.map((a) => (
                <InfoRow key={a.id} icon="checkmark-circle-outline">
                  {a.name}
                </InfoRow>
              ))}
              {hotel.amenities.length > 12 && (
                <Pressable onPress={() => setShowAllAmenities((v) => !v)} accessibilityRole="button" hitSlop={6}>
                  <Text style={styles.link}>
                    {showAllAmenities ? 'Thu gọn' : `Xem tất cả ${hotel.amenities.length} tiện nghi`}
                  </Text>
                </Pressable>
              )}
            </Card>
          </>
        )}

        {hotel.sections.map((s) => (
          <View key={s.key} style={{ gap: 8 }}>
            <SectionTitle>{s.title}</SectionTitle>
            <Card>
              <ExpandableText text={s.text} />
            </Card>
          </View>
        ))}

        <SectionTitle>Chính sách</SectionTitle>
        <Policies hotel={hotel} />
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  counter: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    maxWidth: '80%',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  counterText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  category: { fontSize: 12, fontWeight: '700', color: colors.primary, textTransform: 'uppercase' },
  headline: { fontSize: 16, fontWeight: '700', color: colors.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ratingText: { fontWeight: '700', color: colors.text },
  muted: { color: colors.muted, fontSize: 13 },
  strong: { fontSize: 15, fontWeight: '700', color: colors.text },
  subTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  body: { fontSize: 15, lineHeight: 22, color: colors.text },
  link: { color: colors.primary, fontWeight: '700' },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  amenity: { flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: 140 },
  amenityText: { color: colors.text },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barLabel: { width: 84, color: colors.text, fontSize: 14 },
  barTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.primarySoft, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4, backgroundColor: colors.primary },
  barValue: { width: 32, textAlign: 'right', fontWeight: '700', color: colors.text },
  timeRow: { flexDirection: 'row', gap: 12 },
  // Thẻ phòng xếp dọc: ảnh trên, thông tin dưới (trên mọi kích thước màn hình).
  roomCard: { flexDirection: 'column', gap: 12 },
  roomImage: { width: '100%', height: 180, borderRadius: radius.md },
  roomName: { fontSize: 17, fontWeight: '700', color: colors.text },
  roomFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 8,
  },
  warning: { color: colors.danger, fontSize: 13, fontWeight: '600', marginTop: 2 },
});
