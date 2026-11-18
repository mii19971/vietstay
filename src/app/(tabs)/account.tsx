import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LoginPrompt } from '@/components/LoginPrompt';
import { Button, Card, Loading, Screen, SectionTitle, TextField } from '@/components/ui';
import { API_URL } from '@/config';
import { ApiError } from '@/services/api';
import { useAppStore } from '@/store/AppStore';
import { colors } from '@/theme';
import { confirmAction, notify } from '@/utils/dialog';
import { isValidPhone } from '@/utils/format';

type Errors = Partial<Record<'name' | 'phone', string>>;

export default function AccountScreen() {
  const { ready, user, bookings, favorites, updateProfile, logout } = useAppStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user?.name ?? '');
    setPhone(user?.phone ?? '');
  }, [user]);

  if (!ready) return <Loading />;

  const footer = (
    <Text style={[styles.muted, { textAlign: 'center' }]}>
      VietStay v{Constants.expoConfig?.version ?? '1.0.0'} · {API_URL}
    </Text>
  );

  if (!user) {
    return (
      <Screen>
        <LoginPrompt
          icon="person-circle-outline"
          title="Chào mừng đến VietStay"
          message="Đăng nhập để đặt phòng, lưu khách sạn yêu thích và quản lý chuyến đi."
        />
        {footer}
      </Screen>
    );
  }

  const save = async () => {
    const e: Errors = {};
    if (name.trim().length < 2) e.name = 'Vui lòng nhập họ tên';
    if (!isValidPhone(phone)) e.phone = 'Số điện thoại không hợp lệ';
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() });
      notify('Đã lưu', 'Thông tin tài khoản đã được cập nhật.');
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors({ name: err.fieldErrors.name?.[0], phone: err.fieldErrors.phone?.[0] });
        notify('Không lưu được', err.message);
      }
    } finally {
      setSaving(false);
    }
  };

  // Đơn còn hiệu lực (chờ xác nhận hoặc đã xác nhận).
  const confirmed = bookings.filter((b) => b.status !== 'cancelled').length;

  return (
    <Screen>
      <Card style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name.trim().charAt(0).toUpperCase() || 'K'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.muted}>{user.email}</Text>
        </View>
      </Card>

      <View style={styles.stats}>
        <Card style={styles.stat}>
          <Text style={styles.statValue}>{confirmed}</Text>
          <Text style={styles.muted}>Đơn đặt phòng</Text>
        </Card>
        <Card style={styles.stat}>
          <Text style={styles.statValue}>{favorites.length}</Text>
          <Text style={styles.muted}>Yêu thích</Text>
        </Card>
      </View>

      <SectionTitle>Thông tin cá nhân</SectionTitle>
      <Card style={{ gap: 12 }}>
        <TextField label="Họ và tên" value={name} onChangeText={setName} error={errors.name} placeholder="Nguyễn Văn A" />
        <TextField label="Email" value={user.email} editable={false} style={{ color: colors.muted }} />
        <TextField
          label="Số điện thoại"
          value={phone}
          onChangeText={setPhone}
          error={errors.phone}
          keyboardType="phone-pad"
          placeholder="0912 345 678"
        />
        <Button title="Lưu thông tin" loading={saving} onPress={save} />
      </Card>

      <Button
        title="Đăng xuất"
        variant="ghost"
        icon="log-out-outline"
        onPress={() => confirmAction('Đăng xuất?', 'Bạn sẽ cần đăng nhập lại để đặt phòng.', () => void logout(), 'Đăng xuất')}
      />
      {footer}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: '800' },
  name: { fontSize: 18, fontWeight: '700', color: colors.text },
  muted: { color: colors.muted, fontSize: 14 },
  stats: { flexDirection: 'row', gap: 12 },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontSize: 24, fontWeight: '800', color: colors.primary },
});
