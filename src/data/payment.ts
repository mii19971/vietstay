import type { IconName } from '@/components/ui';
import type { PaymentMethod } from '@/types';

export const PAYMENT_METHODS: { key: PaymentMethod; label: string; desc: string; icon: IconName }[] = [
  { key: 'pay_at_hotel', label: 'Thanh toán tại khách sạn', desc: 'Không cần trả trước', icon: 'business-outline' },
  { key: 'bank_transfer', label: 'Chuyển khoản ngân hàng', desc: 'Hướng dẫn gửi qua email', icon: 'cash-outline' },
  { key: 'card', label: 'Thẻ tín dụng / ghi nợ', desc: 'Visa, Mastercard, JCB', icon: 'card-outline' },
];
