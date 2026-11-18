import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import * as api from '@/services/api';
import { setAuthToken, setUnauthorizedHandler } from '@/services/http';
import { clearToken, loadToken, saveToken } from '@/services/tokenStore';
import type { AuthResponse, Booking, User } from '@/types';

interface AppStore {
  /** Đã khôi phục phiên đăng nhập (nếu có) từ bộ nhớ thiết bị. */
  ready: boolean;
  user: User | null;
  bookings: Booking[];
  /** id các khách sạn yêu thích của user đang đăng nhập. */
  favorites: string[];
  isFavorite: (hotelId: string) => boolean;
  /** Trả về false nếu chưa đăng nhập (màn hình gọi sẽ chuyển tới đăng nhập). */
  toggleFavorite: (hotelId: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<void>;
  register: (input: { name: string; email: string; phone: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (input: { name: string; phone: string }) => Promise<void>;
  refreshBookings: () => Promise<void>;
  book: (input: api.NewBookingInput) => Promise<Booking>;
  cancel: (bookingId: string) => Promise<Booking>;
}

const AppStoreContext = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const userRef = useRef<User | null>(null);
  userRef.current = user;

  const resetSession = useCallback(async () => {
    setAuthToken(null);
    setUser(null);
    setBookings([]);
    setFavorites([]);
    await clearToken();
  }, []);

  /** Tải dữ liệu riêng của user sau khi đăng nhập. Lỗi tải phụ không làm hỏng việc đăng nhập. */
  const loadUserData = useCallback(async () => {
    const [b, f] = await Promise.allSettled([api.getBookings(), api.getFavorites()]);
    if (b.status === 'fulfilled') setBookings(b.value);
    if (f.status === 'fulfilled') setFavorites(f.value.map((h) => h.id));
  }, []);

  const startSession = useCallback(
    async (auth: AuthResponse) => {
      setAuthToken(auth.token);
      await saveToken(auth.token);
      setUser(auth.user);
      await loadUserData();
    },
    [loadUserData],
  );

  // Khôi phục phiên đăng nhập khi mở app.
  useEffect(() => {
    setUnauthorizedHandler(() => void resetSession());
    let alive = true;
    (async () => {
      const token = await loadToken();
      if (token) {
        setAuthToken(token);
        try {
          const me = await api.getMe();
          if (alive) {
            setUser(me);
            await loadUserData();
          }
        } catch (err) {
          // Token hết hạn → đăng xuất. Lỗi mạng → giữ token để thử lại lần sau.
          if (err instanceof api.ApiError && err.status === 401) await resetSession();
          else setAuthToken(null);
        }
      }
      if (alive) setReady(true);
    })();
    return () => {
      alive = false;
      setUnauthorizedHandler(null);
    };
  }, [loadUserData, resetSession]);

  const login = useCallback(
    async (email: string, password: string) => startSession(await api.login(email.trim(), password)),
    [startSession],
  );

  const register = useCallback(
    async (input: { name: string; email: string; phone: string; password: string }) =>
      startSession(await api.register({ ...input, name: input.name.trim(), email: input.email.trim() })),
    [startSession],
  );

  const updateProfile = useCallback(async (input: { name: string; phone: string }) => {
    setUser(await api.updateMe(input));
  }, []);

  const refreshBookings = useCallback(async () => {
    if (userRef.current) setBookings(await api.getBookings());
  }, []);

  const toggleFavorite = useCallback(
    async (hotelId: string) => {
      if (!userRef.current) return false;
      const wasFav = favorites.includes(hotelId);
      // Cập nhật giao diện ngay, hoàn tác nếu server lỗi.
      setFavorites((prev) => (wasFav ? prev.filter((id) => id !== hotelId) : [...prev, hotelId]));
      try {
        if (wasFav) await api.removeFavorite(hotelId);
        else await api.addFavorite(hotelId);
      } catch (err) {
        setFavorites((prev) => (wasFav ? [...prev, hotelId] : prev.filter((id) => id !== hotelId)));
        throw err;
      }
      return true;
    },
    [favorites],
  );

  const book = useCallback(async (input: api.NewBookingInput) => {
    const booking = await api.createBooking(input);
    setBookings((prev) => [booking, ...prev]);
    return booking;
  }, []);

  const cancel = useCallback(async (bookingId: string) => {
    const updated = await api.cancelBooking(bookingId);
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? updated : b)));
    return updated;
  }, []);

  const value = useMemo<AppStore>(
    () => ({
      ready,
      user,
      bookings,
      favorites,
      isFavorite: (id) => favorites.includes(id),
      toggleFavorite,
      login,
      register,
      logout: resetSession,
      updateProfile,
      refreshBookings,
      book,
      cancel,
    }),
    [ready, user, bookings, favorites, toggleFavorite, login, register, resetSession, updateProfile, refreshBookings, book, cancel],
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore(): AppStore {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error('useAppStore phải được dùng bên trong AppStoreProvider');
  return ctx;
}
