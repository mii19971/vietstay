import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { guestsLabel } from '@/components/SearchForm';
import {
  Button,
  Card,
  Divider,
  EmptyState,
  ErrorState,
  InfoRow,
  Loading,
  RemoteImage,
  Screen,
  SectionTitle,
  TextField,
} from '@/components/ui';
import { PAYMENT_METHODS } from '@/data/payment';
import { useApi } from '@/hooks/useApi';
import { ApiError, getHotel } from '@/services/api';
import { useAppStore } from '@/store/AppStore';
import { colors, radius } from '@/theme';
import type { PaymentMethod } from '@/types';
import { parseCriteria } from '@/utils/criteria';
import { formatLongDate, nightsBetween } from '@/utils/date';
import { notify } from '@/utils/dialog';
import { isValidEmail, isValidPhone } from '@/utils/format';

type Errors = Partial<Record<'name' | 'email' | 'phone', string>>;

export default function CheckoutScreen() {
  const params = useLocalSearchParams<{ hotelId: string; roomId: string }>();
  const paramsKey = JSON.stringify(params);
  const criteria = useMemo(() => parseCriteria(params), [paramsKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const { ready, user, book } = useAppStore();

  const hotelReq = useApi(() => getHotel(params.hotelId), [params.hotelId]);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [note, setNote] = useState('');
  const [payment, setPayment] = useState<PaymentMethod>('pay_at_hotel');
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  // Điền sẵn thông tin liên hệ từ tài khoản (kể cả khi vừa đăng nhập xong rồi quay lại màn hình này).
  useEffect(() => {
    if (!user) return;
    setName((v) => v || user.name);
    setEmail((v) => v || user.email);
    setPhone((v) => v || user.phone);
  }, [user]);

  const hotel = hotelReq.data;
  const room = hotel?.rooms.find((r) => r.id === params.roomId);

  if (!ready || (hotelReq.loading && !hotel)) return <Loading />;
  if (hotelReq.error && hotelReq.errorStatus !== 404) {
    return <ErrorState message={hotelReq.error} onRetry={hotelReq.reload} />;
  }
  if (!hotel || !room) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        title="Không tìm thấy phòng"
        message="Liên kết đặt phòng không hợp lệ hoặc đã hết hạn."
        action={<Button title="Về trang chủ" onPress={() => router.replace('/')} />}
      />
    );
  }

  if (!user) {
    return (
      <EmptyState
        icon="person-circle-outline"
        title="Đăng nhập để đặt phòng"
        message={`${room.name} · ${hotel.name}. Đơn đặt phòng được lưu vào tài khoản để bạn xem lại và hủy khi cần.`}
        action={
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button title="Đăng nhập" onPress={() => router.push('/login')} />
            <Button title="Tạo tài khoản" variant="outline" onPress={() => router.push('/register')} />
          </View>
        }
      />
    );
  }

  const nights = nightsBetween(criteria.checkIn, criteria.checkOut);
  const fits = room.maxGuests == null || room.maxGuests * criteria.rooms >= criteria.guests;
  const checkInFrom = hotel.policies.checkInFrom;
  const checkOutBefore = hotel.policies.checkOutBefore;

  const validate = (): boolean => {
    const e: Errors = {};
    if (name.trim().length < 2) e.name = 'Vui lòng nhập họ tên';
    if (!isValidEmail(email)) e.email = 'Email không hợp lệ';
    if (!isValidPhone(phone)) e.phone = 'Số điện thoại không hợp lệ (vd. 0912345678)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const booking = await book({
        hotelId: hotel.id,
        roomId: room.id,
        criteria,
        guestName: name,
        guestEmail: email,
        guestPhone: phone,
        note,
        paymentMethod: payment,
      });
      router.replace({ pathname: '/booking/[id]', params: { id: booking.id, created: '1' } });
    } catch (err) {
      if (err instanceof ApiError) {
        // Hiển thị lỗi kiểm tra của server ngay dưới ô nhập tương ứng.
        const fe = err.fieldErrors;
        setErrors({ name: fe.guestName?.[0], email: fe.guestEmail?.[0], phone: fe.guestPhone?.[0] });
        notify('Không thể gửi yêu cầu', err.details);
      } else {
        notify('Không thể gửi yêu cầu', 'Đã có lỗi xảy ra, vui lòng thử lại.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <Card style={styles.summary}>
        <RemoteImage uri={hotel.images[0]?.thumb ?? ''} style={styles.thumb} />
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={styles.hotelName}>{hotel.name}</Text>
          <Text style={styles.roomName}>{room.name}</Text>
          <InfoRow icon="location-outline">{hotel.address}</InfoRow>
        </View>
      </Card>

      <Card style={{ gap: 10 }}>
        <View style={styles.dates}>
          <View style={{ flex: 1 }}>
            <Text style={styles.muted}>Nhận phòng</Text>
            <Text style={styles.strong}>{formatLongDate(criteria.checkIn)}</Text>
            {!!checkInFrom && <Text style={styles.muted}>Từ {checkInFrom}</Text>}
          </View>
          <Ionicons name="arrow-forward" size={20} color={colors.muted} />
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={styles.muted}>Trả phòng</Text>
            <Text style={styles.strong}>{formatLongDate(criteria.checkOut)}</Text>
            {!!checkOutBefore && <Text style={styles.muted}>Trước {checkOutBefore}</Text>}
          </View>
        </View>
        <Divider />
        <InfoRow icon="moon-outline">{`${nights} đêm · ${guestsLabel(criteria)}`}</InfoRow>
      </Card>

      <SectionTitle>Thông tin liên hệ</SectionTitle>
      <Card style={{ gap: 12 }}>
        <TextField label="Họ và tên" placeholder="Nguyễn Văn A" value={name} onChangeText={setName} error={errors.name} autoComplete="name" />
        <TextField
          label="Email"
          placeholder="ban@example.com"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <TextField
          label="Số điện thoại"
          placeholder="0912 345 678"
          value={phone}
          onChangeText={setPhone}
          error={errors.phone}
          keyboardType="phone-pad"
          autoComplete="tel"
        />
        <TextField
          label="Yêu cầu đặc biệt (không bắt buộc)"
          placeholder="Vd. phòng tầng cao, nhận phòng muộn..."
          value={note}
          onChangeText={setNote}
          multiline
          style={{ minHeight: 72, textAlignVertical: 'top', paddingTop: 12 }}
        />
      </Card>

      <SectionTitle>Phương thức thanh toán</SectionTitle>
      <Card style={{ gap: 8 }}>
        {PAYMENT_METHODS.map((m) => {
          const selected = payment === m.key;
          return (
            <Pressable
              key={m.key}
              onPress={() => setPayment(m.key)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              style={[styles.payment, selected && styles.paymentSelected]}
            >
              <Ionicons name={m.icon} size={22} color={selected ? colors.primary : colors.muted} />
              <View style={{ flex: 1 }}>
                <Text style={styles.strong}>{m.label}</Text>
                <Text style={styles.muted}>{m.desc}</Text>
              </View>
              <Ionicons
                name={selected ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={selected ? colors.primary : colors.muted}
              />
            </Pressable>
          );
        })}
      </Card>

      <SectionTitle>Giá phòng</SectionTitle>
      <Card style={{ gap: 6 }}>
        <InfoRow icon="information-circle-outline">
          Đây là yêu cầu đặt phòng. Khách sạn sẽ kiểm tra phòng trống và gửi giá cho bạn qua email/điện thoại trước
          khi xác nhận. Bạn chưa phải thanh toán bây giờ.
        </InfoRow>
        {!fits && (
          <Text style={styles.warning}>
            {room.name} chỉ chứa tối đa {room.maxGuests} khách/phòng — không đủ cho {criteria.guests} khách với{' '}
            {criteria.rooms} phòng.
          </Text>
        )}
      </Card>

      <Button title="Gửi yêu cầu đặt phòng" loading={submitting} disabled={!fits} onPress={submit} />
      <Text style={[styles.muted, { textAlign: 'center' }]}>
        Bằng việc gửi yêu cầu, bạn đồng ý với Điều khoản sử dụng và Chính sách bảo mật của VietStay.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  thumb: { width: 84, height: 84, borderRadius: radius.md },
  hotelName: { fontSize: 17, fontWeight: '700', color: colors.text },
  roomName: { fontSize: 14, fontWeight: '600', color: colors.primary },
  dates: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  muted: { color: colors.muted, fontSize: 13 },
  strong: { fontSize: 15, fontWeight: '700', color: colors.text },
  payment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paymentSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  warning: { color: colors.danger, fontSize: 13, fontWeight: '600' },
});
