import { router } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';
import { authStyles as styles, closeAuth } from '@/components/auth';
import { Button, Card, Screen, TextField } from '@/components/ui';
import { ApiError } from '@/services/api';
import { useAppStore } from '@/store/AppStore';

export default function LoginScreen() {
  const { login } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) {
      setError('Vui lòng nhập email và mật khẩu.');
      return;
    }
    setLoading(true);
    setError(undefined);
    try {
      await login(email, password);
      closeAuth();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Đã có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen contentContainerStyle={{ maxWidth: 480 }}>
      <Text style={styles.title}>Chào mừng trở lại</Text>
      <Text style={styles.muted}>Đăng nhập để đặt phòng và quản lý chuyến đi của bạn.</Text>
      <Card style={{ gap: 12 }}>
        <TextField
          label="Email"
          icon="mail-outline"
          placeholder="ban@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <TextField
          label="Mật khẩu"
          icon="lock-closed-outline"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="current-password"
          returnKeyType="go"
          onSubmitEditing={submit}
        />
        {!!error && <Text style={styles.error}>{error}</Text>}
        <Button title="Đăng nhập" loading={loading} onPress={submit} />
      </Card>
      <Button title="Chưa có tài khoản? Đăng ký" variant="ghost" onPress={() => router.replace('/register')} />
    </Screen>
  );
}
