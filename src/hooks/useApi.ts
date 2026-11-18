import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react';
import { ApiError } from '@/services/api';

export interface ApiState<T> {
  data: T | undefined;
  /** Thông báo lỗi để hiển thị (undefined nếu không lỗi). */
  error: string | undefined;
  /** HTTP status của lỗi (0 = mất kết nối). */
  errorStatus: number | undefined;
  loading: boolean;
  reload: () => void;
}

/** Gọi API khi deps thay đổi; bỏ qua kết quả cũ nếu deps đổi trong lúc đang chờ. */
export function useApi<T>(fn: () => Promise<T>, deps: DependencyList): ApiState<T> {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<ApiError>();
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(undefined);
    fnRef
      .current()
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e instanceof ApiError ? e : new ApiError('Đã có lỗi xảy ra.', -1)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { data, error: error?.message, errorStatus: error?.status, loading, reload };
}
