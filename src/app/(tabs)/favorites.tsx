import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Grid } from '@/components/Grid';
import { HotelCard } from '@/components/HotelCard';
import { Button, EmptyState, Loading, Screen } from '@/components/ui';
import { getHotelsByIds } from '@/services/api';
import { useAppStore } from '@/store/AppStore';
import type { Hotel } from '@/types';

export default function FavoritesScreen() {
  const { ready, favorites } = useAppStore();
  const [hotels, setHotels] = useState<Hotel[] | null>(null);

  useEffect(() => {
    if (ready) getHotelsByIds(favorites).then(setHotels);
  }, [ready, favorites]);

  if (!hotels) return <Loading />;
  if (hotels.length === 0) {
    return (
      <EmptyState
        icon="heart-outline"
        title="Chưa có khách sạn yêu thích"
        message="Nhấn biểu tượng trái tim trên khách sạn để lưu lại và xem nhanh tại đây."
        action={<Button title="Khám phá ngay" onPress={() => router.navigate('/')} />}
      />
    );
  }

  return (
    <Screen>
      <Grid
        data={hotels}
        keyOf={(h) => h.id}
        render={(h) => (
          <HotelCard hotel={h} onPress={() => router.push({ pathname: '/hotel/[id]', params: { id: h.id } })} />
        )}
      />
    </Screen>
  );
}
