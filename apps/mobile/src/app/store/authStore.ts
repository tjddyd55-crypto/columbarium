import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../types/api';

const AUTH_KEY = '@columbarium_auth';

interface AuthState {
  token: string | null;
  user: User | null;
  hydrated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  setHydrated: (v: boolean) => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  hydrated: false,
  setAuth: (token, user) => {
    set({ token, user });
    AsyncStorage.setItem(AUTH_KEY, JSON.stringify({ token, user }));
  },
  logout: () => {
    set({ token: null, user: null });
    AsyncStorage.removeItem(AUTH_KEY);
  },
  setHydrated: (hydrated) => set({ hydrated }),
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(AUTH_KEY);
      if (raw) {
        const { token, user } = JSON.parse(raw);
        if (token && user) set({ token, user });
      }
    } catch (_) {}
    set({ hydrated: true });
  },
}));
