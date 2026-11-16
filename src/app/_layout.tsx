import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppStoreProvider } from '@/store/AppStore';
import { colors } from '@/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppStoreProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerTintColor: colors.primary,
            headerTitleStyle: { color: colors.text, fontWeight: '700' },
            headerStyle: { backgroundColor: colors.card },
            headerTransparent: false,
            headerBackTitle: 'Quay lại',
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'VietStay' }} />
          <Stack.Screen name="search" options={{ title: 'Kết quả tìm kiếm' }} />
          <Stack.Screen name="hotel/[id]" options={{ title: 'Chi tiết khách sạn' }} />
          <Stack.Screen name="checkout" options={{ title: 'Xác nhận đặt phòng' }} />
          <Stack.Screen name="booking/[id]" options={{ title: 'Chi tiết đặt phòng' }} />
        </Stack>
      </AppStoreProvider>
    </SafeAreaProvider>
  );
}
