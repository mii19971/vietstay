import { API_URL } from '@/config';

/** Lỗi từ API (ProblemDetails) hoặc lỗi mạng. */
export class ApiError extends Error {
  constructor(
    message: string,
    /** 0 = không kết nối được server. */
    readonly status: number,
    /** Lỗi theo từng trường, vd. { guestEmail: ['Email không hợp lệ.'] }. */
    readonly fieldErrors: Record<string, string[]> = {},
  ) {
    super(message);
  }

  /** Thông báo đầy đủ để hiển thị: tiêu đề + các lỗi trường (nếu có). */
  get details(): string {
    const lines = Object.values(this.fieldErrors).flat();
    return lines.length ? `${this.message}\n• ${lines.join('\n• ')}` : this.message;
  }
}

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

/** Gọi khi API trả 401 với request có token (token hết hạn / tài khoản bị xóa). */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

type Query = Record<string, string | number | undefined | null>;

export async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  options: { query?: Query; body?: unknown } = {},
): Promise<T> {
  const qs = Object.entries(options.query ?? {})
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  const url = `${API_URL}${path}${qs ? `?${qs}` : ''}`;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  const sentToken = authToken;
  if (sentToken) headers.Authorization = `Bearer ${sentToken}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError(`Không kết nối được máy chủ (${API_URL}). Kiểm tra mạng hoặc địa chỉ API.`, 0);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  let data: unknown = undefined;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    // Không phải JSON (vd. trang lỗi của proxy).
  }

  if (!res.ok) {
    if (res.status === 401 && sentToken) onUnauthorized?.();
    const problem = (data ?? {}) as { title?: string; errors?: Record<string, string[]> };
    const fallback =
      res.status === 401
        ? 'Vui lòng đăng nhập.'
        : res.status === 429
          ? 'Bạn thao tác quá nhanh, vui lòng thử lại sau ít phút.'
          : `Lỗi máy chủ (${res.status}).`;
    throw new ApiError(problem.title || fallback, res.status, problem.errors ?? {});
  }
  return data as T;
}
