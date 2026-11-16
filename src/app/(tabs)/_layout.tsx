import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import type { IconName } from '@/components/ui';
import { colors } from '@/theme';

const icon =
  (name: IconName, active: IconName) =>
  ({ color, focused, size }: { color: ColorValue; focused: boolean; size: number }) => (
    <Ionicons name={focused ? active : name} size={size} color={typeof color === 'number' ? undefined : (color ?? undefined)} />
  );

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
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
