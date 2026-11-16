import { useWindowDimensions } from 'react-native';
import { MAX_WIDTH } from '@/theme';

/** Số cột lưới theo chiều rộng màn hình: 1 trên điện thoại, 2–3 trên tablet/web. */
export function useColumns(): number {
  const { width } = useWindowDimensions();
  const w = Math.min(width, MAX_WIDTH);
  if (w >= 960) return 3;
  if (w >= 620) return 2;
  return 1;
}
