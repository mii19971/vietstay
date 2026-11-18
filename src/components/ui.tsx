// Các thành phần giao diện cơ bản dùng chung cho cả 3 nền tảng.
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState, type ComponentProps, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ImageStyle,
  type ScrollViewProps,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { colors, MAX_WIDTH, radius, shadow } from '@/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

// ---------- Layout ----------

/** ScrollView có nội dung căn giữa, giới hạn chiều rộng trên web/tablet. */
export function Screen({ children, contentContainerStyle, ...rest }: ScrollViewProps & { children: ReactNode }) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.screenContent, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      {...rest}
    >
      {children}
    </ScrollView>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {right}
    </View>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

// ---------- Button ----------

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger';

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading,
  disabled,
  style,
}: {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const inactive = disabled || loading;
  const fg = variant === 'primary' || variant === 'danger' ? '#fff' : variant === 'outline' ? colors.primary : colors.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.btn,
        styles[`btn_${variant}`],
        pressed && { opacity: 0.85 },
        inactive && { opacity: 0.5 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={18} color={fg} />}
          <Text style={[styles.btnText, { color: fg }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

// ---------- Chip ----------

export function Chip({
  label,
  selected,
  onPress,
  icon,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      {icon && <Ionicons name={icon} size={14} color={selected ? '#fff' : colors.text} />}
      <Text style={[styles.chipText, selected && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

// ---------- TextField ----------

export function TextField({
  label,
  error,
  icon,
  style,
  ...rest
}: TextInputProps & { label?: string; error?: string; icon?: IconName }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrap, focused && { borderColor: colors.primary }, !!error && { borderColor: colors.danger }]}>
        {icon && <Ionicons name={icon} size={18} color={colors.muted} />}
        <TextInput
          placeholderTextColor={colors.muted}
          style={[styles.input, style]}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          {...rest}
        />
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

// ---------- Ảnh từ mạng có fallback ----------

export function RemoteImage({ uri, style }: { uri: string; style?: StyleProp<ImageStyle> }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <View style={[styles.imageFallback, style as StyleProp<ViewStyle>]}>
        <Ionicons name="image-outline" size={28} color={colors.primary} />
      </View>
    );
  }
  return (
    <Image
      source={{ uri }}
      style={[{ backgroundColor: colors.primarySoft }, style]}
      resizeMode="cover"
      onError={() => setFailed(true)}
    />
  );
}

// ---------- Rating ----------

/** Hạng sao, hỗ trợ nửa sao (4.5). 0 = chưa xếp hạng → không hiển thị. */
export function Stars({ count, size = 14 }: { count: number; size?: number }) {
  const full = Math.floor(count);
  const half = count - full >= 0.5;
  if (full <= 0 && !half) return null;
  return (
    <View style={{ flexDirection: 'row', gap: 1 }} accessibilityLabel={`${count} sao`}>
      {Array.from({ length: full }, (_, i) => (
        <Ionicons key={i} name="star" size={size} color={colors.star} />
      ))}
      {half && <Ionicons name="star-half" size={size} color={colors.star} />}
    </View>
  );
}

export function RatingBadge({ rating }: { rating: number }) {
  return (
    <View style={styles.ratingBadge}>
      <Text style={styles.ratingBadgeText}>{rating.toFixed(1)}</Text>
    </View>
  );
}

// ---------- Counter ----------

export function Counter({
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.counterRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.counterLabel}>{label}</Text>
        {hint && <Text style={styles.muted}>{hint}</Text>}
      </View>
      <Pressable
        accessibilityLabel={`Giảm ${label}`}
        disabled={value <= min}
        onPress={() => onChange(value - 1)}
        style={[styles.counterBtn, value <= min && { opacity: 0.35 }]}
      >
        <Ionicons name="remove" size={18} color={colors.primary} />
      </Pressable>
      <Text style={styles.counterValue}>{value}</Text>
      <Pressable
        accessibilityLabel={`Tăng ${label}`}
        disabled={value >= max}
        onPress={() => onChange(value + 1)}
        style={[styles.counterBtn, value >= max && { opacity: 0.35 }]}
      >
        <Ionicons name="add" size={18} color={colors.primary} />
      </Pressable>
    </View>
  );
}

// ---------- Trạng thái ----------

export function Loading() {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon: IconName;
  title: string;
  message?: string;
  action?: ReactNode;
}) {
  return (
    <View style={[styles.center, { gap: 10 }]}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={36} color={colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {message && <Text style={[styles.muted, { textAlign: 'center', maxWidth: 360 }]}>{message}</Text>}
      {action}
    </View>
  );
}

/** Lỗi tải dữ liệu kèm nút thử lại. */
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <EmptyState
      icon="cloud-offline-outline"
      title="Không tải được dữ liệu"
      message={message}
      action={onRetry ? <Button title="Thử lại" variant="outline" icon="refresh" onPress={onRetry} /> : undefined}
    />
  );
}

export function InfoRow({ icon, children }: { icon: IconName; children: ReactNode }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={16} color={colors.muted} />
      <Text style={[styles.muted, { flex: 1 }]}>{children}</Text>
    </View>
  );
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  screenContent: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', padding: 16, gap: 16, paddingBottom: 40 },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, ...shadow },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: 4 },
  btn: {
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btn_primary: { backgroundColor: colors.primary },
  btn_danger: { backgroundColor: colors.danger },
  btn_outline: { borderWidth: 1.5, borderColor: colors.primary, backgroundColor: 'transparent' },
  btn_ghost: { backgroundColor: 'transparent' },
  btnText: { fontSize: 16, fontWeight: '600' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 14, color: colors.text, fontWeight: '500' },
  label: { fontSize: 14, fontWeight: '600', color: colors.text },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    backgroundColor: colors.card,
  },
  input: { flex: 1, minHeight: 46, fontSize: 16, color: colors.text },
  error: { color: colors.danger, fontSize: 13 },
  imageFallback: { backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  ratingBadge: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderBottomLeftRadius: 2,
  },
  ratingBadgeText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  counterRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  counterLabel: { fontSize: 16, fontWeight: '600', color: colors.text },
  counterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterValue: { minWidth: 24, textAlign: 'center', fontSize: 16, fontWeight: '700', color: colors.text },
  muted: { color: colors.muted, fontSize: 14 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, minHeight: 240 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text, textAlign: 'center' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
