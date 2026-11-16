import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow } from '@/theme';
import type { Booking } from '@/types';
import { formatShortDate, today } from '@/utils/date';
import { formatVND } from '@/utils/format';
import { RemoteImage } from './ui';

export function bookingStatus(b: Booking): { label: string; color: string; bg: string } {
  if (b.status === 'cancelled') return { label: 'Đã hủy', color: colors.danger, bg: colors.dangerSoft };
  if (b.checkOut <= today()) return { label: 'Đã hoàn thành', color: colors.muted, bg: colors.background };
  return { label: 'Đã xác nhận', color: colors.success, bg: colors.successSoft };
}

export function StatusPill({ booking }: { booking: Booking }) {
  const s = bookingStatus(booking);
  return (
    <View style={[styles.pill, { backgroundColor: s.bg }]}>
      <Text style={[styles.pillText, { color: s.color }]}>{s.label}</Text>
    </View>
  );
}

export function BookingCard({ booking, onPress }: { booking: Booking; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
    >
      <RemoteImage uri={booking.hotelImage} style={styles.image} />
      <View style={styles.body}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
          <Text style={styles.name} numberOfLines={1}>
            {booking.hotelName}
          </Text>
          <StatusPill booking={booking} />
        </View>
        <Text style={styles.muted}>{booking.roomName}</Text>
        <Text style={styles.muted}>
          {formatShortDate(booking.checkIn)} → {formatShortDate(booking.checkOut)} · {booking.nights} đêm
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
          <Text style={styles.code}>Mã: {booking.code}</Text>
          <Text style={styles.total}>{formatVND(booking.total)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.lg, overflow: 'hidden', ...shadow },
  image: { width: 110, minHeight: 120, height: '100%' },
  body: { flex: 1, padding: 12, gap: 3 },
  name: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.text },
  muted: { color: colors.muted, fontSize: 13 },
  code: { fontWeight: '600', color: colors.text, fontSize: 13 },
  total: { fontWeight: '800', color: colors.accent },
  pill: { borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start' },
  pillText: { fontSize: 12, fontWeight: '700' },
});
