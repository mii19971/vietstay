import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '@/theme';
import type { SearchCriteria } from '@/types';
import { MAX_GUESTS, MAX_ROOMS } from '@/utils/criteria';
import { formatShortDate, nightsBetween } from '@/utils/date';
import { DateRangePicker } from './DateRangePicker';
import { Sheet } from './Sheet';
import { Button, Counter, TextField, type IconName } from './ui';

export function guestsLabel(c: Pick<SearchCriteria, 'guests' | 'rooms'>) {
  return `${c.guests} khách · ${c.rooms} phòng`;
}

export function datesLabel(c: Pick<SearchCriteria, 'checkIn' | 'checkOut'>) {
  return `${formatShortDate(c.checkIn)} → ${formatShortDate(c.checkOut)} · ${nightsBetween(c.checkIn, c.checkOut)} đêm`;
}

function Field({ icon, label, value, onPress }: { icon: IconName; label: string; value: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.field} accessibilityRole="button" accessibilityLabel={`${label}: ${value}`}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <View style={{ flex: 1 }}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.fieldValue} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </Pressable>
  );
}

/** Chọn ngày + số khách, dùng chung cho form tìm kiếm và trang chi tiết khách sạn. */
export function StayPickers({
  value,
  onChange,
}: {
  value: SearchCriteria;
  onChange: (c: SearchCriteria) => void;
}) {
  const [showDates, setShowDates] = useState(false);
  const [showGuests, setShowGuests] = useState(false);
  const [guests, setGuests] = useState(value.guests);
  const [rooms, setRooms] = useState(value.rooms);

  return (
    <>
      <Field icon="calendar-outline" label="Ngày nhận – trả phòng" value={datesLabel(value)} onPress={() => setShowDates(true)} />
      <Field
        icon="people-outline"
        label="Khách & phòng"
        value={guestsLabel(value)}
        onPress={() => {
          setGuests(value.guests);
          setRooms(value.rooms);
          setShowGuests(true);
        }}
      />

      <DateRangePicker
        visible={showDates}
        checkIn={value.checkIn}
        checkOut={value.checkOut}
        onClose={() => setShowDates(false)}
        onConfirm={(checkIn, checkOut) => {
          onChange({ ...value, checkIn, checkOut });
          setShowDates(false);
        }}
      />

      <Sheet
        visible={showGuests}
        title="Khách & phòng"
        onClose={() => setShowGuests(false)}
        footer={
          <Button
            title="Áp dụng"
            onPress={() => {
              onChange({ ...value, guests, rooms });
              setShowGuests(false);
            }}
          />
        }
      >
        <Counter
          label="Số khách"
          hint="Người lớn và trẻ em"
          value={guests}
          min={1}
          max={MAX_GUESTS}
          onChange={(g) => {
            setGuests(g);
            if (rooms > g) setRooms(g);
          }}
        />
        <Counter
          label="Số phòng"
          hint="Mỗi phòng ít nhất 1 khách"
          value={rooms}
          min={1}
          max={Math.min(MAX_ROOMS, guests)}
          onChange={setRooms}
        />
      </Sheet>
    </>
  );
}

export function SearchForm({
  initial,
  onSubmit,
  submitLabel = 'Tìm khách sạn',
}: {
  initial: SearchCriteria;
  onSubmit: (c: SearchCriteria) => void;
  submitLabel?: string;
}) {
  const [criteria, setCriteria] = useState(initial);

  return (
    <View style={{ gap: 10 }}>
      <TextField
        icon="location-outline"
        placeholder="Bạn muốn đi đâu? (thành phố, tên khách sạn)"
        value={criteria.q}
        onChangeText={(q) => setCriteria((c) => ({ ...c, q }))}
        returnKeyType="search"
        onSubmitEditing={() => onSubmit(criteria)}
        accessibilityLabel="Điểm đến"
      />
      <StayPickers value={criteria} onChange={setCriteria} />
      <Button title={submitLabel} icon="search" onPress={() => onSubmit(criteria)} />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.card,
  },
  fieldLabel: { fontSize: 12, color: colors.muted },
  fieldValue: { fontSize: 15, fontWeight: '600', color: colors.text },
});
