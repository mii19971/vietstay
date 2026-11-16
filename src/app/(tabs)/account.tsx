import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card, Screen, SectionTitle, TextField } from '@/components/ui';
import { useAppStore } from '@/store/AppStore';
import { colors } from '@/theme';
import { confirmAction, notify } from '@/utils/dialog';
import { isValidEmail, isValidPhone } from '@/utils/format';

type Errors = Partial<Record<'name' | 'email' | 'phone', string>>;

export default function AccountScreen() {
  const { profile, bookings, favorites, saveProfile, clearProfile } = useAppStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(profile?.name ?? '');
    setEmail(profile?.email ?? '');
    setPhone(profile?.phone ?? '');
  }, [profile]);

  const save = async () => {
    const e: Errors = {};
    if (name.trim().length < 2) e.name = 'Vui lòng nhập họ tên';
    if (!isValidEmail(email)) e.email = 'Email không hợp lệ';
    if (!isValidPhone(phone)) e.phone = 'Số điện thoại không hợp lệ';
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    await saveProfile({ name: name.trim(), email: email.trim(), phone: phone.trim() });
    setSaving(false);
    notify('Đã lưu', 'Thông tin của bạn sẽ được điền sẵn khi đặt phòng.');
  };

  const confirmed = bookings.filter((b) => b.status === 'confirmed').length;

  return (
    <Screen>
      <Card style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(profile?.name || 'K').trim().charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{profile?.name || 'Khách'}</Text>
          <Text style={styles.muted}>{profile?.email || 'Chưa có thông tin liên hệ'}</Text>
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
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="ban@example.com"
        />
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

      {profile && (
        <Button
          title="Xóa thông tin cá nhân"
          variant="ghost"
          icon="log-out-outline"
          onPress={() =>
            confirmAction('Xóa thông tin?', 'Thông tin liên hệ đã lưu trên thiết bị này sẽ bị xóa.', () => void clearProfile(), 'Xóa')
          }
        />
      )}

      <Text style={[styles.muted, { textAlign: 'center' }]}>
        VietStay v{Constants.expoConfig?.version ?? '1.0.0'}
      </Text>
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
