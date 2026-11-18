import { Platform } from 'react-native';

/**
 * Địa chỉ VietStay API. Đặt trong file .env.local, ví dụ:
 *   EXPO_PUBLIC_API_URL=http://192.168.1.10:5045
 * Lưu ý: trên điện thoại thật, "localhost" là chính điện thoại — phải dùng IP LAN của máy chạy API.
 * Phải viết đúng dạng process.env.EXPO_PUBLIC_API_URL để Expo nhúng giá trị lúc build.
 */
const fromEnv = process.env.EXPO_PUBLIC_API_URL;

// Mặc định: Android emulator truy cập máy host qua 10.0.2.2, các nền tảng khác qua localhost.
const fallback = Platform.OS === 'android' ? 'http://10.0.2.2:5045' : 'http://localhost:5045';

export const API_URL = (fromEnv || fallback).replace(/\/+$/, '');
