import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusPill } from '@/components/BookingCard';
import { Button, Card, Divider, EmptyState, ErrorState, InfoRow, Loading, RemoteImage, Screen } from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { ApiError, getBooking } from '@/services/api';
import { useAppStore } from '@/store/AppStore';
import { colors, radius } from '@/theme';
import { formatLongDate } from '@/utils/date';
import { confirmAction, notify } from '@/utils/dialog';
import { formatVND } from '@/utils/format';
import { PAYMENT_METHODS } from '@/data/payment';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export default function BookingDetailScreen() {
  const { id, created } = useLocalSearchParams<{ id: string; created?: string }>();
  const { ready, user, bookings, cancel } = useAppStore();
  const [cancelling, setCancelling] = useState(false);
  const cached = bookings.find((b) => b.id === id);
  // Mở trực tiếp bằng link: đơn chưa có trong danh sách đã tải → hỏi server.
  const remote = useApi(
    () => (user && !cached ? getBooking(id) : Promise.resolve(undefined)),
    [id, user?.id, !!cached],
  );

  if (!ready) return <Loading />;
  if (!user) {
    return (
      <EmptyState
        icon="person-circle-outline"
        title="Đăng nhập để xem đơn đặt phòng"
        action={<Button title="Đăng nhập" onPress={() => router.push('/login')} />}
      />
    );
  }
  const booking = cached ?? remote.data;
  if (!booking && remote.loading) return <Loading />;
  if (!booking && remote.error && remote.errorStatus !== 404) {
    return <ErrorState message={remote.error} onRetry={remote.reload} />;
  }
  if (!booking) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        title="Không tìm thấy đơn đặt phòng"
        action={<Button title="Xem chuyến đi của tôi" onPress={() => router.replace('/trips')} />}
      />
    );
  }

  const payment = PAYMENT_METHODS.find((m) => m.key === booking.paymentMethod);

  const onCancel = () =>
    confirmAction(
      'Hủy đặt phòng?',
      `Bạn chắc chắn muốn hủy đơn ${booking.code} tại ${booking.hotelName}?`,
      async () => {
        setCancelling(true);
        try {
          await cancel(booking.id);
        } catch (err) {
          notify('Không thể hủy', err instanceof ApiError ? err.message : 'Đã có lỗi xảy ra.');
        } finally {
          setCancelling(false);
        }
      },
      'Hủy đặt phòng',
    );

  return (
    <Screen>
      {created === '1' && booking.status !== 'cancelled' && (
        <View style={styles.success}>
          <Ionicons name="checkmark-circle" size={44} color={colors.success} />
          <Text style={styles.successTitle}>Đã gửi yêu cầu đặt phòng!</Text>
          <Text style={[styles.muted, { textAlign: 'center' }]}>
            Khách sạn sẽ liên hệ báo giá và xác nhận phòng. Yêu cầu được lưu trong mục Chuyến đi.
          </Text>
        </View>
      )}

      <Card style={{ gap: 12 }}>
        <View style={styles.header}>
          <RemoteImage uri={booking.hotelImage} style={styles.thumb} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.hotelName}>{booking.hotelName}</Text>
            <InfoRow icon="location-outline">{booking.address}</InfoRow>
            <StatusPill booking={booking} />
          </View>
        </View>
        <View style={styles.codeBox}>
          <Text style={styles.muted}>Mã đặt phòng</Text>
          <Text style={styles.code} selectable>
            {booking.code}
          </Text>
        </View>
      </Card>

      <Card style={{ gap: 10 }}>
        <Row label="Loại phòng" value={booking.roomName} />
        <Row label="Nhận phòng" value={`${formatLongDate(booking.checkIn)} · 14:00`} />
        <Row label="Trả phòng" value={`${formatLongDate(booking.checkOut)} · 12:00`} />
        <Row label="Thời gian" value={`${booking.nights} đêm`} />
        <Row label="Khách & phòng" value={`${booking.guests} khách · ${booking.rooms} phòng`} />
        <Divider />
        <Row label="Họ tên" value={booking.guestName} />
        <Row label="Email" value={booking.guestEmail} />
        <Row label="Điện thoại" value={booking.guestPhone} />
        {!!booking.note && <Row label="Yêu cầu" value={booking.note} />}
        <Divider />
        <Row label="Thanh toán" value={payment?.label ?? ''} />
        {booking.total != null ? (
          <>
            {booking.subtotal != null && <Row label="Tiền phòng" value={formatVND(booking.subtotal)} />}
            {booking.taxes != null && <Row label="Thuế & phí" value={formatVND(booking.taxes)} />}
            <View style={styles.row}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.total}>{formatVND(booking.total)}</Text>
            </View>
          </>
        ) : (
          <Row label="Giá phòng" value="Chờ khách sạn báo giá" />
        )}
      </Card>

      <Button
        title="Xem khách sạn"
        variant="outline"
        icon="business-outline"
        onPress={() =>
          router.push({
            pathname: '/hotel/[id]',
            params: { id: booking.hotelId },
          })
        }
      />
      {booking.canCancel && (
        <Button title="Hủy đặt phòng" variant="danger" icon="trash-outline" loading={cancelling} onPress={onCancel} />
      )}
      {created === '1' && (
        <Button title="Về trang chủ" variant="ghost" onPress={() => router.replace('/')} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  success: {
    alignItems: 'center',
    gap: 6,
    padding: 20,
    borderRadius: radius.lg,
    backgroundColor: colors.successSoft,
  },
  successTitle: { fontSize: 20, fontWeight: '800', color: colors.success },
  header: { flexDirection: 'row', gap: 12 },
  thumb: { width: 90, height: 90, borderRadius: radius.md },
  hotelName: { fontSize: 18, fontWeight: '700', color: colors.text },
  codeBox: {
    alignItems: 'center',
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  code: { fontSize: 26, fontWeight: '800', letterSpacing: 3, color: colors.primary },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  muted: { color: colors.muted, fontSize: 14 },
  value: { flexShrink: 1, textAlign: 'right', fontSize: 14, fontWeight: '600', color: colors.text },
  totalLabel: { fontSize: 17, fontWeight: '700', color: colors.text },
  total: { fontSize: 20, fontWeight: '800', color: colors.accent },
});
