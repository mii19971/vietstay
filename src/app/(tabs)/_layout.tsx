import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { IconName } from '@/components/ui';
import { colors } from '@/theme';

/** Thanh tab gọn: chiều cao nội dung (chưa tính vùng an toàn dưới đáy màn hình). */
const TAB_BAR_HEIGHT = 44;
const TAB_ICON_SIZE = 20;

const icon =
  (name: IconName, active: IconName) =>
  ({ color, focused }: { color: ColorValue; focused: boolean; size: number }) => (
    <Ionicons
      name={focused ? active : name}
      size={TAB_ICON_SIZE}
      color={typeof color === 'number' ? undefined : (color ?? undefined)}
    />
  );

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        // Đặt chiều cao cố định thì phải tự cộng vùng an toàn (thanh home iPhone, gesture bar Android).
        tabBarStyle: { height: TAB_BAR_HEIGHT + insets.bottom, paddingBottom: insets.bottom },
        // Khung icon cố định để dòng chữ bên dưới không bị ép mất khi thanh tab thấp.
        // 44 = viền 1 + đệm 5 (mặc định của thư viện) + icon 20 + chữ 13 + đệm 5.
        tabBarIconStyle: { height: TAB_ICON_SIZE, flexGrow: 0 },
        tabBarLabelStyle: { fontSize: 11, lineHeight: 13 },
        headerTitleStyle: { color: colors.text, fontWeight: '700' },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Khám phá', headerShown: false, tabBarIcon: icon('compass-outline', 'compass') }}
      />
      <Tabs.Screen name="favorites" options={{ title: 'Yêu thích', tabBarIcon: icon('heart-outline', 'heart') }} />
      <Tabs.Screen name="trips" options={{ title: 'Chuyến đi', tabBarIcon: icon('briefcase-outline', 'briefcase') }} />
      <Tabs.Screen name="account" options={{ title: 'Tài khoản', tabBarIcon: icon('person-outline', 'person') }} />
    </Tabs>
  );
}
