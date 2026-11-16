import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useColumns } from '@/hooks/useColumns';

const GAP = 16;

/** Lưới đáp ứng đơn giản (dùng trong ScrollView khi số phần tử nhỏ). */
export function Grid<T>({ data, keyOf, render }: { data: T[]; keyOf: (item: T) => string; render: (item: T) => ReactNode }) {
  const cols = useColumns();
  const rows: T[][] = [];
  for (let i = 0; i < data.length; i += cols) rows.push(data.slice(i, i + cols));
  return (
    <View style={{ gap: GAP }}>
      {rows.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row', gap: GAP }}>
          {row.map((item) => (
            <View key={keyOf(item)} style={{ flex: 1 }}>
              {render(item)}
            </View>
          ))}
          {Array.from({ length: cols - row.length }, (_, i) => (
            <View key={`pad${i}`} style={{ flex: 1 }} />
          ))}
        </View>
      ))}
    </View>
  );
}
