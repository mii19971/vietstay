import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { BookingCard } from '@/components/BookingCard';
import { LoginPrompt } from '@/components/LoginPrompt';
import { Button, Chip, EmptyState, ErrorState, Loading, Screen } from '@/components/ui';
import { ApiError } from '@/services/api';
import { useAppStore } from '@/store/AppStore';
import type { Booking } from '@/types';
import { today } from '@/utils/date';

type Segment = 'upcoming' | 'past' | 'cancelled';

const SEGMENTS: { key: Segment; label: string }[] = [
  { key: 'upcoming', label: 'Sắp tới' },
  { key: 'past', label: 'Đã qua' },
  { key: 'cancelled', label: 'Đã hủy' },
];

function inSegment(b: Booking, s: Segment, now: string) {
  if (s === 'cancelled') return b.status === 'cancelled';
  if (b.status === 'cancelled') return false;
  return s === 'upcoming' ? b.checkOut > now : b.checkOut <= now;
}

const EMPTY_MESSAGES: Record<Segment, string> = {
  upcoming: 'Bạn chưa có chuyến đi nào sắp tới. Hãy tìm một nơi nghỉ thật ưng ý nhé!',
  past: 'Các chuyến đi đã hoàn thành sẽ hiển thị ở đây.',
  cancelled: 'Bạn chưa hủy đơn đặt phòng nào.',
};

export default function TripsScreen() {
  const { ready, user, bookings, refreshBookings } = useAppStore();
  const [segment, setSegment] = useState<Segment>('upcoming');
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string>();

  const load = useCallback(async () => {
    try {
      await refreshBookings();
      setLoadError(undefined);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Đã có lỗi xảy ra.');
    }
  }, [refreshBookings]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (!ready) return <Loading />;
  if (!user) {
    return (
      <LoginPrompt
        icon="briefcase-outline"
        title="Chuyến đi của bạn"
        message="Đăng nhập để xem, quản lý và hủy các đơn đặt phòng."
      />
    );
  }
  if (loadError && bookings.length === 0) return <ErrorState message={loadError} onRetry={() => void load()} />;

  const now = today();
  const list = bookings
    .filter((b) => inSegment(b, segment, now))
    .sort((a, b) => (segment === 'upcoming' ? a.checkIn.localeCompare(b.checkIn) : b.checkIn.localeCompare(a.checkIn)));

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.segments}>
        {SEGMENTS.map((s) => (
          <Chip key={s.key} label={s.label} selected={segment === s.key} onPress={() => setSegment(s.key)} />
        ))}
      </View>
      {list.length === 0 ? (
        <EmptyState
          icon="briefcase-outline"
          title="Không có đơn đặt phòng"
          message={EMPTY_MESSAGES[segment]}
          action={
            segment === 'upcoming' ? <Button title="Tìm khách sạn" onPress={() => router.navigate('/')} /> : undefined
          }
        />
      ) : (
        list.map((b) => (
          <BookingCard
            key={b.id}
            booking={b}
            onPress={() => router.push({ pathname: '/booking/[id]', params: { id: b.id } })}
          />
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  segments: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
});
