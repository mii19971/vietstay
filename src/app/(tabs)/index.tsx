import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Grid } from '@/components/Grid';
import { HotelCard } from '@/components/HotelCard';
import { SearchForm } from '@/components/SearchForm';
import { Card, ErrorState, Loading, RemoteImage, Screen, SectionTitle } from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { getDestinations, getFeaturedHotels } from '@/services/api';
import { useAppStore } from '@/store/AppStore';
import { colors, radius } from '@/theme';
import type { SearchCriteria } from '@/types';
import { criteriaToParams, defaultCriteria } from '@/utils/criteria';
import { formatNumber } from '@/utils/format';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAppStore();
  const [initial] = useState(defaultCriteria);
  const home = useApi(() => Promise.all([getDestinations(), getFeaturedHotels()]), []);
  const [cities, featured] = home.data ?? [[], []];

  const search = (c: SearchCriteria) => router.push({ pathname: '/search', params: criteriaToParams(c) });

  return (
    <Screen contentContainerStyle={{ paddingTop: insets.top + 16 }}>
      <View style={styles.hero}>
        <Text style={styles.brand}>VietStay</Text>
        <Text style={styles.greeting}>
          {user ? `Xin chào, ${user.name.trim().split(' ').pop()}!` : 'Xin chào!'} Hôm nay bạn muốn nghỉ ở đâu?
        </Text>
      </View>

      <Card>
        <SearchForm initial={initial} onSubmit={search} />
      </Card>

      {home.error ? (
        <ErrorState message={home.error} onRetry={home.reload} />
      ) : home.loading && !home.data ? (
        <Loading />
      ) : (
        <>
          <SectionTitle>Điểm đến phổ biến</SectionTitle>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {cities.map((city) => (
              <Pressable
                key={city.id}
                onPress={() => search({ ...initial, q: city.name, regionId: city.id })}
                accessibilityRole="button"
                accessibilityLabel={`Tìm khách sạn ở ${city.name}`}
                style={styles.city}
              >
                <RemoteImage uri={city.image} style={StyleSheet.absoluteFill} />
                <View style={styles.cityOverlay} />
                <Text style={styles.cityName}>{city.name}</Text>
                <Text style={styles.cityCount}>{formatNumber(city.hotelCount)} khách sạn</Text>
              </Pressable>
            ))}
          </ScrollView>

          <SectionTitle>Được đánh giá cao nhất</SectionTitle>
          <Grid
            data={featured}
            keyOf={(h) => h.id}
            render={(h) => (
              <HotelCard
                hotel={h}
                onPress={() => router.push({ pathname: '/hotel/[id]', params: { id: h.id, ...criteriaToParams(initial) } })}
              />
            )}
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: 4 },
  brand: { fontSize: 30, fontWeight: '800', color: colors.primary, letterSpacing: -0.5 },
  greeting: { fontSize: 16, color: colors.muted },
  city: {
    width: 140,
    height: 170,
    borderRadius: radius.lg,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: 12,
    backgroundColor: colors.primarySoft,
  },
  cityOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.28)' },
  cityName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cityCount: { color: '#fff', fontSize: 12, opacity: 0.9 },
});
