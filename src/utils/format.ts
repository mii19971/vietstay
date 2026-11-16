/** 1250000 -> "1.250.000" (không phụ thuộc Intl để chạy ổn định trên Hermes). */
export function formatNumber(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** 1250000 -> "1.250.000 ₫" */
export function formatVND(amount: number): string {
  return `${formatNumber(amount)} ₫`;
}

/** Bỏ dấu tiếng Việt + chữ thường, dùng cho tìm kiếm. */
export function normalizeText(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

export function ratingLabel(rating: number): string {
  if (rating >= 9) return 'Xuất sắc';
  if (rating >= 8.5) return 'Tuyệt vời';
  if (rating >= 8) return 'Rất tốt';
  if (rating >= 7) return 'Tốt';
  return 'Dễ chịu';
}

export function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim());
}

export function isValidPhone(s: string): boolean {
  return /^(0|\+84)\d{9,10}$/.test(s.replace(/[\s.-]/g, ''));
}
