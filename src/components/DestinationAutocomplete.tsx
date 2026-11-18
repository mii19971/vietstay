import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ApiError, suggestPlaces } from '@/services/api';
import { colors, radius, shadow } from '@/theme';
import type { PlaceSuggestion } from '@/types';
import type { IconName } from './ui';
import { TextField } from './ui';

const MIN_CHARS = 2;
const DEBOUNCE_MS = 300;

const REGION_ICONS: Record<string, IconName> = {
  airport: 'airplane-outline',
  train_station: 'train-outline',
  metro_station: 'subway-outline',
  bus_station: 'bus-outline',
  point_of_interest: 'flag-outline',
  neighborhood: 'map-outline',
};

const REGION_LABELS: Record<string, string> = {
  country: 'Quốc gia',
  province_state: 'Tỉnh/bang',
  multi_city_vicinity: 'Khu vực',
  high_level_region: 'Khu vực',
  city: 'Thành phố',
  neighborhood: 'Khu phố',
  airport: 'Sân bay',
  train_station: 'Ga tàu',
  metro_station: 'Ga metro',
  bus_station: 'Bến xe',
  point_of_interest: 'Địa danh',
};

function iconOf(p: PlaceSuggestion): IconName {
  if (p.type === 'hotel') return 'bed-outline';
  return REGION_ICONS[p.regionType ?? ''] ?? 'location-outline';
}

function labelOf(p: PlaceSuggestion): string {
  if (p.type === 'hotel') return 'Khách sạn';
  return REGION_LABELS[p.regionType ?? ''] ?? 'Địa điểm';
}

/**
 * Ô "Bạn muốn đi đâu?" có gợi ý: khi gõ ≥ 2 ký tự, hiện các vùng (thành phố, khu phố, sân bay, địa danh)
 * và khách sạn khớp với mọi từ đã gõ (không dấu cũng được).
 */
export function DestinationAutocomplete({
  value,
  onChangeText,
  onSubmit,
  onPick,
}: {
  value: string;
  onChangeText: (q: string) => void;
  /** Enter hoặc "Tìm theo ...". */
  onSubmit: () => void;
  onPick: (place: PlaceSuggestion) => void;
}) {
  const q = value.trim();
  const [open, setOpen] = useState(false);
  // Kết quả gắn với từ khóa đã gửi đi; khác từ khóa hiện tại nghĩa là đang tải.
  const [result, setResult] = useState<{ q: string; items?: PlaceSuggestion[]; error?: string }>();
  const showPanel = open && q.length >= MIN_CHARS;

  useEffect(() => {
    if (!showPanel) return;
    let alive = true; // bỏ qua phản hồi cũ khi từ khóa đổi / panel đóng
    const timer = setTimeout(() => {
      suggestPlaces(q)
        .then((items) => alive && setResult({ q, items }))
        .catch((e) => alive && setResult({ q, error: e instanceof ApiError ? e.message : 'Đã có lỗi xảy ra.' }));
    }, DEBOUNCE_MS);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [showPanel, q]);

  const loading = result?.q !== q;
  // Trong lúc tải từ khóa mới vẫn giữ danh sách cũ để không nhấp nháy.
  const items = result?.items;
  const error = loading ? undefined : result?.error;

  const close = () => setOpen(false);

  return (
    <View>
      <TextField
        icon="location-outline"
        placeholder="Bạn muốn đi đâu? (thành phố, địa danh, khách sạn)"
        value={value}
        onChangeText={(text) => {
          onChangeText(text);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        returnKeyType="search"
        onSubmitEditing={() => {
          close();
          onSubmit();
        }}
        autoCorrect={false}
        accessibilityLabel="Điểm đến"
      />

      {showPanel && (
        <View style={styles.panel} accessibilityRole="list">
          {error ? (
            <Text style={[styles.note, { color: colors.danger }]}>{error}</Text>
          ) : !items ? (
            <ActivityIndicator style={{ padding: 16 }} color={colors.primary} />
          ) : items.length === 0 ? (
            <Text style={styles.note}>
              {loading ? 'Đang tìm…' : `Không tìm thấy địa điểm “${q}”. Hãy gõ đủ từ, vd. “da nang”, “hoi an”.`}
            </Text>
          ) : (
            <ScrollView style={styles.list} nestedScrollEnabled keyboardShouldPersistTaps="handled">
              {items.map((p) => (
                <Pressable
                  key={`${p.type}:${p.id}`}
                  accessibilityRole="button"
                  accessibilityLabel={`${labelOf(p)} ${p.name}${p.subtitle ? `, ${p.subtitle}` : ''}`}
                  onPress={() => {
                    close();
                    onPick(p);
                  }}
                  style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
                    styles.row,
                    (pressed || hovered) && { backgroundColor: colors.primarySoft },
                  ]}
                >
                  <View style={styles.icon}>
                    <Ionicons name={iconOf(p)} size={18} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.name} numberOfLines={1}>
                      {p.name}
                    </Text>
                    <Text style={styles.meta} numberOfLines={1}>
                      {labelOf(p)}
                      {p.subtitle ? ` · ${p.subtitle}` : ''}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          )}
          <Pressable
            style={styles.footer}
            accessibilityRole="button"
            onPress={() => {
              close();
              onSubmit();
            }}
          >
            <Ionicons name="search" size={16} color={colors.primary} />
            <Text style={styles.footerText} numberOfLines={1}>
              Tìm khách sạn theo “{q}”
            </Text>
            {loading && items && <ActivityIndicator size="small" color={colors.primary} />}
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginTop: 6,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadow,
  },
  list: { maxHeight: 336 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10 },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  name: { fontSize: 15, fontWeight: '600', color: colors.text },
  meta: { fontSize: 12, color: colors.muted, flexShrink: 1 },
  note: { padding: 14, color: colors.muted, fontSize: 14 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  footerText: { flex: 1, color: colors.primary, fontWeight: '700' },
});
