import { router } from 'expo-router';
import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

/** Đóng màn hình đăng nhập/đăng ký và quay lại nơi đã mở nó (vd. trang đặt phòng). */
export function closeAuth() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

export const authStyles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  muted: { color: colors.muted, fontSize: 15 },
  error: { color: colors.danger, fontSize: 14 },
});
