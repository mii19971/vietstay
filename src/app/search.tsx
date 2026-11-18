import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Grid } from '@/components/Grid';
import { HotelCard } from '@/components/HotelCard';
import { datesLabel, guestsLabel, SearchForm } from '@/components/SearchForm';
import { Sheet } from '@/components/Sheet';
import { Button, Chip, EmptyState, ErrorState, Loading, Screen } from '@/components/ui';
import { AMENITIES } from '@/data/amenities';
import { useApi } from '@/hooks/useApi';
import { searchHotels } from '@/services/api';
import { colors, radius } from '@/theme';
import type { AmenityKey, SearchCriteria, SearchFilters, SortOption } from '@/types';
import { criteriaToParams, parseCriteria } from '@/utils/criteria';
import { nightsBetween } from '@/utils/date';
import { formatVND } from '@/utils/format';

const SORTS: { key: SortOption; label: string }[] = [
  { key: 'recommended', label: 'Đề xuất' },
  { key: 'price-asc', label: 'Giá thấp nhất' },
  { key: 'price-desc', label: 'Giá cao nhất' },
  { key: 'rating', label: 'Đánh giá cao' },
];

const PRICE_OPTIONS = [1_000_000, 1_500_000, 2_500_000, 4_000_000];
const RATING_OPTIONS = [8, 8.5, 9];
const EMPTY_FILTERS: SearchFilters = { amenities: [], sort: 'recommended' };

function countActive(f: SearchFilters) {
  return (f.maxPrice ? 1 : 0) + (f.minStars ? 1 : 0) + (f.minRating ? 1 : 0) + f.amenities.length;
}

export default function SearchScreen() {
  const params = useLocalSearchParams();
  // Chỉ tính lại khi giá trị params thực sự đổi.
  const paramsKey = JSON.stringify(params);
  const criteria = useMemo(() => parseCriteria(params), [paramsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [draft, setDraft] = useState<SearchFilters>(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const search = useApi(() => searchHotels(criteria, filters), [criteria, filters]);
  const results = search.loading ? null : search.data;

  const nights = nightsBetween(criteria.checkIn, criteria.checkOut);
  const activeCount = countActive(filters);

  const updateCriteria = (c: SearchCriteria) => {
    setShowEdit(false);
    router.setParams(criteriaToParams(c));
  };

  const toggleAmenity = (a: AmenityKey) =>
    setDraft((d) => ({
      ...d,
      amenities: d.amenities.includes(a) ? d.amenities.filter((x) => x !== a) : [...d.amenities, a],
    }));

  return (
    <>
      <Stack.Screen options={{ title: criteria.q || 'Tất cả khách sạn' }} />
      <Screen>
        <Pressable style={styles.summary} onPress={() => setShowEdit(true)} accessibilityRole="button">
          <Ionicons name="search" size={20} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryTitle} numberOfLines={1}>
              {criteria.q || 'Mọi điểm đến'}
            </Text>
            <Text style={styles.summarySub} numberOfLines={1}>
              {datesLabel(criteria)} · {guestsLabel(criteria)}
            </Text>
          </View>
          <Text style={styles.edit}>Sửa</Text>
        </Pressable>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <Chip
            icon="options-outline"
            label={activeCount ? `Bộ lọc (${activeCount})` : 'Bộ lọc'}
            selected={activeCount > 0}
            onPress={() => {
              setDraft(filters);
              setShowFilters(true);
            }}
          />
          {SORTS.map((s) => (
            <Chip
              key={s.key}
              label={s.label}
              selected={filters.sort === s.key}
              onPress={() => setFilters((f) => ({ ...f, sort: s.key }))}
            />
          ))}
        </ScrollView>

        {search.error ? (
          <ErrorState message={search.error} onRetry={search.reload} />
        ) : !results ? (
          <Loading />
        ) : results.items.length === 0 ? (
          <EmptyState
            icon="bed-outline"
            title="Không tìm thấy khách sạn phù hợp"
            message="Hãy thử đổi điểm đến, ngày, số khách hoặc bỏ bớt bộ lọc."
            action={
              activeCount > 0 ? (
                <Button title="Xóa bộ lọc" variant="outline" onPress={() => setFilters({ ...EMPTY_FILTERS, sort: filters.sort })} />
              ) : undefined
            }
          />
        ) : (
          <>
            <Text style={styles.count}>{results.total} khách sạn còn phòng</Text>
            <Grid
              data={results.items}
              keyOf={(h) => h.id}
              render={(h) => (
                <HotelCard
                  hotel={h}
                  nights={nights}
                  onPress={() =>
                    router.push({ pathname: '/hotel/[id]', params: { id: h.id, ...criteriaToParams(criteria) } })
                  }
                />
              )}
            />
          </>
        )}
      </Screen>

      <Sheet visible={showEdit} title="Thay đổi tìm kiếm" onClose={() => setShowEdit(false)}>
        <SearchForm key={paramsKey} initial={criteria} onSubmit={updateCriteria} submitLabel="Cập nhật" />
      </Sheet>

      <Sheet
        visible={showFilters}
        title="Bộ lọc"
        onClose={() => setShowFilters(false)}
        footer={
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button
              title="Xóa hết"
              variant="outline"
              style={{ flex: 1 }}
              onPress={() => setDraft({ ...EMPTY_FILTERS, sort: draft.sort })}
            />
            <Button
              title="Áp dụng"
              style={{ flex: 2 }}
              onPress={() => {
                setFilters(draft);
                setShowFilters(false);
              }}
            />
          </View>
        }
      >
        <Text style={styles.filterTitle}>Giá tối đa / đêm</Text>
        <View style={styles.wrap}>
          {PRICE_OPTIONS.map((p) => (
            <Chip
              key={p}
              label={`≤ ${formatVND(p)}`}
              selected={draft.maxPrice === p}
              onPress={() => setDraft((d) => ({ ...d, maxPrice: d.maxPrice === p ? undefined : p }))}
            />
          ))}
        </View>

        <Text style={styles.filterTitle}>Hạng sao</Text>
        <View style={styles.wrap}>
          {[3, 4, 5].map((s) => (
            <Chip
              key={s}
              icon="star"
              label={`Từ ${s} sao`}
              selected={draft.minStars === s}
              onPress={() => setDraft((d) => ({ ...d, minStars: d.minStars === s ? undefined : s }))}
            />
          ))}
        </View>

        <Text style={styles.filterTitle}>Điểm đánh giá</Text>
        <View style={styles.wrap}>
          {RATING_OPTIONS.map((r) => (
            <Chip
              key={r}
              label={`${r}+`}
              selected={draft.minRating === r}
              onPress={() => setDraft((d) => ({ ...d, minRating: d.minRating === r ? undefined : r }))}
            />
          ))}
        </View>

        <Text style={styles.filterTitle}>Tiện nghi</Text>
        <View style={styles.wrap}>
          {(Object.keys(AMENITIES) as AmenityKey[]).map((a) => (
            <Chip
              key={a}
              label={AMENITIES[a].label}
              selected={draft.amenities.includes(a)}
              onPress={() => toggleAmenity(a)}
            />
          ))}
        </View>
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  summarySub: { fontSize: 13, color: colors.muted },
  edit: { color: colors.primary, fontWeight: '700' },
  count: { color: colors.muted, fontWeight: '600' },
  filterTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 4 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
