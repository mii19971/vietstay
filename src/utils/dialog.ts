import { Alert, Platform } from 'react-native';

// Alert.alert không hoạt động trên web, nên dùng window.confirm / window.alert thay thế.

export function confirmAction(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmText = 'Đồng ý',
) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Không', style: 'cancel' },
    { text: confirmText, style: 'destructive', onPress: onConfirm },
  ]);
}

export function notify(title: string, message: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}
