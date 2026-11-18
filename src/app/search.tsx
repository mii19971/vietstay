import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { DestinationAutocomplete } from '@/components/DestinationAutocomplete';
import { Grid } from '@/components/Grid';
import { HotelCard } from '@/components/HotelCard';
import { Sheet } from '@/components/Sheet';
import { Button, Chip, EmptyState, ErrorState, Loading, Screen } from '@/components/ui';
import { AMENITIES } from '@/data/amenities';
import { useApi } from '@/hooks/useApi';
import { searchHotels } from '@/services/api';
import { colors } from '@/theme';
import type { AmenityKey, SearchFilters, SortOption } from '@/types';
import { criteriaToParams, parseCriteria } from '@/utils/criteria';
import { formatNumber } from '@/utils/format';

const SORTS: { key: SortOption; label: string }[] = [
  { key: 'recommended', label: 'Đề xuất' },
  { key: 'rating', label: 'Đánh giá cao' },
  { key: 'stars', label: 'Hạng sao' },
  { key: 'name', label: 'Tên A–Z' },
];

const RATING_OPTIONS = [8, 8.5, 9];
const EMPTY_FILTERS: SearchFilters = { amenities: [], sort: 'recommended' };

function countActive(f: SearchFilters) {
  return (f.minStars ? 1 : 0) + (f.minRating ? 1 : 0) + f.amenities.length;
}

export default function SearchScreen() {
  const params = useLocalSearchParams();
  // Chỉ tính lại khi giá trị params thực sự đổi.
  const paramsKey = JSON.stringify(params);
  const criteria = useMemo(() => parseCriteria(params), [paramsKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const hasTarget = !!criteria.regionId || criteria.q.trim().length >= 2;

  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [draft, setDraft] = useState<SearchFilters>(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  // Từ khóa đang gõ trong ô tìm kiếm; chỉ áp dụng khi nhấn Enter / chọn gợi ý.
  // Đồng bộ lại khi URL đổi (chọn gợi ý, quay lại) — cập nhật ngay trong render thay vì dùng effect.
  const [draftQ, setDraftQ] = useState(criteria.q);
  const [syncedQ, setSyncedQ] = useState(criteria.q);
  if (syncedQ !== criteria.q) {
    setSyncedQ(criteria.q);
    setDraftQ(criteria.q);
  }

  const search = useApi(
    () => (hasTarget ? searchHotels(criteria, filters) : Promise.resolve(undefined)),
    [criteria, filters, hasTarget],
  );
  const results = search.loading ? null : search.data;
  const activeCount = countActive(filters);
  const title = results?.region?.name ?? (criteria.q || 'Tìm khách sạn');

  const toggleAmenity = (a: AmenityKey) =>
    setDraft((d) => ({
      ...d,
      amenities: d.amenities.includes(a) ? d.amenities.filter((x) => x !== a) : [...d.amenities, a],
    }));

  const openHotel = (id: string) =>
    router.push({ pathname: '/hotel/[id]', params: { id, ...criteriaToParams(criteria) } });

  return (
    <>
      <Stack.Screen options={{ title }} />
      <Screen>
        <DestinationAutocomplete
          value={draftQ}
          onChangeText={setDraftQ}
          // Tìm theo từ khóa mới → bỏ vùng đang chọn.
          onSubmit={() => router.setParams({ ...criteriaToParams({ ...criteria, q: draftQ.trim() }), regionId: '' })}
          onPick={(place) =>
            place.type === 'hotel'
              ? openHotel(place.id)
              : router.setParams(criteriaToParams({ ...criteria, q: place.name, regionId: place.id }))
          }
        />

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

        {!hasTarget ? (
          <EmptyState
            icon="search-outline"
            title="Bạn muốn đi đâu?"
            message="Nhập tên thành phố, địa danh hoặc khách sạn rồi chọn một gợi ý."
          />
        ) : search.error ? (
          <ErrorState message={search.error} onRetry={search.reload} />
        ) : !results ? (
          <Loading />
        ) : results.items.length === 0 ? (
          <EmptyState
            icon="bed-outline"
            title="Không tìm thấy khách sạn phù hợp"
            message="Hãy thử điểm đến khác (gõ đủ từ, vd. “da nang”) hoặc bỏ bớt bộ lọc."
            action={
              activeCount > 0 ? (
                <Button title="Xóa bộ lọc" variant="outline" onPress={() => setFilters({ ...EMPTY_FILTERS, sort: filters.sort })} />
              ) : undefined
            }
          />
        ) : (
          <>
            <Text style={styles.count}>
              {formatNumber(results.total)} khách sạn
              {results.region ? ` tại ${results.region.name}` : ` khớp “${criteria.q}”`}
              {results.total > results.items.length ? ` · hiển thị ${results.items.length} đầu tiên` : ''}
            </Text>
            <Grid
              data={results.items}
              keyOf={(h) => h.id}
              render={(h) => <HotelCard hotel={h} onPress={() => openHotel(h.id)} />}
            />
          </>
        )}
      </Screen>

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
  count: { color: colors.muted, fontWeight: '600' },
  filterTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 4 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
