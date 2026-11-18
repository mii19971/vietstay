import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Token đăng nhập: Keychain/Keystore (SecureStore) trên iOS/Android;
// SecureStore không hỗ trợ web nên trên web dùng AsyncStorage (localStorage).
const KEY = 'vietstay.token';

export async function loadToken(): Promise<string | null> {
  try {
    return Platform.OS === 'web' ? await AsyncStorage.getItem(KEY) : await SecureStore.getItemAsync(KEY);
  } catch {
    return null;
  }
}

export async function saveToken(token: string): Promise<void> {
  if (Platform.OS === 'web') await AsyncStorage.setItem(KEY, token);
  else await SecureStore.setItemAsync(KEY, token);
}

export async function clearToken(): Promise<void> {
  if (Platform.OS === 'web') await AsyncStorage.removeItem(KEY);
  else await SecureStore.deleteItemAsync(KEY);
}
