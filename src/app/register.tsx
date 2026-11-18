import { router } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';
import { authStyles as styles, closeAuth } from '@/components/auth';
import { Button, Card, Screen, TextField } from '@/components/ui';
import { ApiError } from '@/services/api';
import { useAppStore } from '@/store/AppStore';
import { isValidEmail, isValidPhone } from '@/utils/format';

type Field = 'name' | 'email' | 'phone' | 'password';

export default function RegisterScreen() {
  const { register } = useAppStore();
  const [form, setForm] = useState<Record<Field, string>>({ name: '', email: '', phone: '', password: '' });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const set = (field: Field) => (value: string) => setForm((f) => ({ ...f, [field]: value }));

  const submit = async () => {
    const e: Partial<Record<Field, string>> = {};
    if (form.name.trim().length < 2) e.name = 'Vui lòng nhập họ tên';
    if (!isValidEmail(form.email)) e.email = 'Email không hợp lệ';
    if (!isValidPhone(form.phone)) e.phone = 'Số điện thoại không hợp lệ (vd. 0912345678)';
    if (form.password.length < 8) e.password = 'Mật khẩu tối thiểu 8 ký tự';
    setErrors(e);
    setError(undefined);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      await register(form);
      closeAuth();
    } catch (err) {
      if (err instanceof ApiError) {
        const fe = err.fieldErrors;
        setErrors({ name: fe.name?.[0], email: fe.email?.[0], phone: fe.phone?.[0], password: fe.password?.[0] });
        setError(err.message);
      } else {
        setError('Đã có lỗi xảy ra, vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen contentContainerStyle={{ maxWidth: 480 }}>
      <Text style={styles.title}>Tạo tài khoản</Text>
      <Text style={styles.muted}>Đặt phòng nhanh hơn và quản lý mọi chuyến đi ở một nơi.</Text>
      <Card style={{ gap: 12 }}>
        <TextField label="Họ và tên" placeholder="Nguyễn Văn A" value={form.name} onChangeText={set('name')} error={errors.name} autoComplete="name" />
        <TextField
          label="Email"
          placeholder="ban@example.com"
          value={form.email}
          onChangeText={set('email')}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <TextField
          label="Số điện thoại"
          placeholder="0912 345 678"
          value={form.phone}
          onChangeText={set('phone')}
          error={errors.phone}
          keyboardType="phone-pad"
          autoComplete="tel"
        />
        <TextField
          label="Mật khẩu"
          placeholder="Tối thiểu 8 ký tự"
          value={form.password}
          onChangeText={set('password')}
          error={errors.password}
          secureTextEntry
          autoComplete="new-password"
          returnKeyType="go"
          onSubmitEditing={submit}
        />
        {!!error && <Text style={styles.error}>{error}</Text>}
        <Button title="Đăng ký" loading={loading} onPress={submit} />
      </Card>
      <Button title="Đã có tài khoản? Đăng nhập" variant="ghost" onPress={() => router.replace('/login')} />
    </Screen>
  );
}
