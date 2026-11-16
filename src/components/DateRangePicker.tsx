import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme';
import { MAX_NIGHTS } from '@/utils/criteria';
import { addDays, formatShortDate, nightsBetween, toISODate, today } from '@/utils/date';
import { Sheet } from './Sheet';
import { Button } from './ui';

const WEEK_HEADER = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const MONTHS_AHEAD = 12;

interface Month {
  key: string;
  label: string;
  cells: (string | null)[]; // null = ô trống đầu tháng
}

function buildMonths(): Month[] {
  const now = new Date();
  return Array.from({ length: MONTHS_AHEAD }, (_, i) => {
    const y = now.getFullYear();
    const m = now.getMonth() + i;
    const first = new Date(y, m, 1);
    const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const offset = (first.getDay() + 6) % 7; // tuần bắt đầu từ thứ Hai
    const cells: (string | null)[] = Array(offset).fill(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(toISODate(new Date(first.getFullYear(), first.getMonth(), d)));
    }
    return {
      key: `${first.getFullYear()}-${first.getMonth()}`,
      label: `Tháng ${first.getMonth() + 1}, ${first.getFullYear()}`,
      cells,
    };
  });
}

export function DateRangePicker({
  visible,
  checkIn,
  checkOut,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  checkIn: string;
  checkOut: string;
  onClose: () => void;
  onConfirm: (checkIn: string, checkOut: string) => void;
}) {
  const [start, setStart] = useState<string>(checkIn);
  const [end, setEnd] = useState<string | null>(checkOut);
  const months = useMemo(buildMonths, [visible]);
  const minDate = today();

  useEffect(() => {
    if (visible) {
      setStart(checkIn);
      setEnd(checkOut);
    }
  }, [visible, checkIn, checkOut]);

  const onDayPress = (d: string) => {
    // Chưa có ngày bắt đầu mới, hoặc đã chọn đủ 2 ngày, hoặc chọn lùi về trước -> bắt đầu lại.
    if (end || d <= start || nightsBetween(start, d) > MAX_NIGHTS) {
      setStart(d);
      setEnd(null);
    } else {
      setEnd(d);
    }
  };

  const nights = end ? nightsBetween(start, end) : 0;

  return (
    <Sheet
      visible={visible}
      title="Chọn ngày"
      onClose={onClose}
      footer={
        <View style={{ gap: 10 }}>
          <Text style={styles.summary}>
            {end
              ? `${formatShortDate(start)} → ${formatShortDate(end)} · ${nights} đêm`
              : `Nhận phòng ${formatShortDate(start)} — chọn ngày trả phòng (tối đa ${MAX_NIGHTS} đêm)`}
          </Text>
          <Button title="Áp dụng" disabled={!end} onPress={() => end && onConfirm(start, end)} />
        </View>
      }
    >
      <View style={styles.weekRow}>
        {WEEK_HEADER.map((w) => (
          <Text key={w} style={[styles.weekCell, (w === 'T7' || w === 'CN') && { color: colors.accent }]}>
            {w}
          </Text>
        ))}
      </View>
      {months.map((month) => (
        <View key={month.key} style={{ gap: 6 }}>
          <Text style={styles.monthLabel}>{month.label}</Text>
          <View style={styles.grid}>
            {month.cells.map((d, i) => {
              if (!d) return <View key={`e${i}`} style={styles.cell} />;
              const disabled = d < minDate || (!end && d > start && d > addDays(start, MAX_NIGHTS));
              const isStart = d === start;
              const isEnd = d === end;
              const inRange = !!end && d > start && d < end;
              return (
                <Pressable
                  key={d}
                  disabled={disabled}
                  onPress={() => onDayPress(d)}
                  accessibilityLabel={formatShortDate(d)}
                  style={[styles.cell, inRange && styles.inRange, (isStart && end) && styles.rangeStart, isEnd && styles.rangeEnd]}
                >
                  <View style={[styles.day, (isStart || isEnd) && styles.daySelected]}>
                    <Text
                      style={[
                        styles.dayText,
                        disabled && { color: colors.border },
                        (isStart || isEnd) && { color: '#fff', fontWeight: '700' },
                      ]}
                    >
                      {Number(d.slice(8))}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </Sheet>
  );
}

const CELL = `${100 / 7}%` as const;

const styles = StyleSheet.create({
  summary: { textAlign: 'center', color: colors.text, fontWeight: '600' },
  weekRow: { flexDirection: 'row' },
  weekCell: { width: CELL, textAlign: 'center', color: colors.muted, fontWeight: '600', fontSize: 13 },
  monthLabel: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: CELL, height: 44, alignItems: 'center', justifyContent: 'center', marginVertical: 1 },
  inRange: { backgroundColor: colors.primarySoft },
  rangeStart: { backgroundColor: colors.primarySoft, borderTopLeftRadius: 22, borderBottomLeftRadius: 22 },
  rangeEnd: { backgroundColor: colors.primarySoft, borderTopRightRadius: 22, borderBottomRightRadius: 22 },
  day: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  daySelected: { backgroundColor: colors.primary },
  dayText: { fontSize: 15, color: colors.text },
});
