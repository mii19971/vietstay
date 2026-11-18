import { router } from 'expo-router';
import { View } from 'react-native';
import { Button, EmptyState, type IconName } from './ui';

/** Hiển thị khi màn hình cần đăng nhập. */
export function LoginPrompt({ icon, title, message }: { icon: IconName; title: string; message: string }) {
  return (
    <EmptyState
      icon={icon}
      title={title}
      message={message}
      action={
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button title="Đăng nhập" onPress={() => router.push('/login')} />
          <Button title="Tạo tài khoản" variant="outline" onPress={() => router.push('/register')} />
        </View>
      }
    />
  );
}
