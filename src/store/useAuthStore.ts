import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  token: string | null;
  isLoggedIn: boolean;
  setToken: (token: string | null) => void;
  logout: () => void;
  loadToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>(set => ({
  token: null,
  isLoggedIn: false,
  setToken: token => {
    if (token) {
      AsyncStorage.setItem('authToken', token);
    } else {
      AsyncStorage.removeItem('authToken');
    }
    set({ token, isLoggedIn: !!token });
  },
  logout: () => {
    AsyncStorage.removeItem('authToken');
    set({ token: null, isLoggedIn: false });
  },
  loadToken: async () => {
    const token = await AsyncStorage.getItem('authToken');
    set({ token, isLoggedIn: !!token });
  },
}));
