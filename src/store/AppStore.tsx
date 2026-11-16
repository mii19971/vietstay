import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as api from '@/services/api';
import { readJSON, removeKey, writeJSON } from '@/services/storage';
import type { Booking, Profile } from '@/types';

const FAVORITES_KEY = 'vietstay:favorites';
const PROFILE_KEY = 'vietstay:profile';

interface AppStore {
  ready: boolean;
  bookings: Booking[];
  favorites: string[];
  profile: Profile | null;
  isFavorite: (hotelId: string) => boolean;
  toggleFavorite: (hotelId: string) => void;
  refreshBookings: () => Promise<void>;
  book: (input: api.NewBookingInput) => Promise<Booking>;
  cancel: (bookingId: string) => Promise<void>;
  saveProfile: (p: Profile) => Promise<void>;
  clearProfile: () => Promise<void>;
}

const AppStoreContext = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([
      api.getBookings(),
      readJSON<string[]>(FAVORITES_KEY, []),
      readJSON<Profile | null>(PROFILE_KEY, null),
    ]).then(([b, f, p]) => {
      if (!alive) return;
      setBookings(b);
      setFavorites(f);
      setProfile(p);
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const refreshBookings = useCallback(async () => {
    setBookings(await api.getBookings());
  }, []);

  const toggleFavorite = useCallback((hotelId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(hotelId) ? prev.filter((id) => id !== hotelId) : [...prev, hotelId];
      void writeJSON(FAVORITES_KEY, next);
      return next;
    });
  }, []);

  const book = useCallback(
    async (input: api.NewBookingInput) => {
      const booking = await api.createBooking(input);
      await refreshBookings();
      return booking;
    },
    [refreshBookings],
  );

  const cancel = useCallback(
    async (bookingId: string) => {
      await api.cancelBooking(bookingId);
      await refreshBookings();
    },
    [refreshBookings],
  );

  const saveProfile = useCallback(async (p: Profile) => {
    await writeJSON(PROFILE_KEY, p);
    setProfile(p);
  }, []);

  const clearProfile = useCallback(async () => {
    await removeKey(PROFILE_KEY);
    setProfile(null);
  }, []);

  const value = useMemo<AppStore>(
    () => ({
      ready,
      bookings,
      favorites,
      profile,
      isFavorite: (id) => favorites.includes(id),
      toggleFavorite,
      refreshBookings,
      book,
      cancel,
      saveProfile,
      clearProfile,
    }),
    [ready, bookings, favorites, profile, toggleFavorite, refreshBookings, book, cancel, saveProfile, clearProfile],
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore(): AppStore {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error('useAppStore phải được dùng bên trong AppStoreProvider');
  return ctx;
}
