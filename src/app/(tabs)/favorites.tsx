import { router } from 'expo-router';
import { Grid } from '@/components/Grid';
import { HotelCard } from '@/components/HotelCard';
import { LoginPrompt } from '@/components/LoginPrompt';
import { Button, EmptyState, ErrorState, Loading, Screen } from '@/components/ui';
import { useApi } from '@/hooks/useApi';
import { getFavorites } from '@/services/api';
import { useAppStore } from '@/store/AppStore';

export default function FavoritesScreen() {
  const { ready, user, favorites } = useAppStore();
  // Tải lại khi danh sách id yêu thích đổi (bấm tim ở màn hình khác).
  const req = useApi(
    () => (user ? getFavorites() : Promise.resolve([])),
    [user?.id, favorites.join(',')],
  );

  if (!ready) return <Loading />;
  if (!user) {
    return (
      <LoginPrompt
        icon="heart-outline"
        title="Lưu khách sạn yêu thích"
        message="Đăng nhập để lưu khách sạn yêu thích và xem lại trên mọi thiết bị."
      />
    );
  }
  if (req.error) return <ErrorState message={req.error} onRetry={req.reload} />;
  if (!req.data) return <Loading />;
  // Ẩn ngay khách sạn vừa bỏ thích, không chờ tải lại.
  const hotels = req.data.filter((h) => favorites.includes(h.id));
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
