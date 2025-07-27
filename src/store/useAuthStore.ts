import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

// interface AuthState {
//   token: string | null;
//   isLoggedIn: boolean;
//   setToken: (token: string | null) => void;
//   logout: () => void;
//   loadToken: () => Promise<void>;
// }

interface AuthState {
  token: string | null;
  isLoggedIn: boolean;
  role: 'USER' | 'ADMIN' | null;
  setAuth: (token: string | null, role: 'USER' | 'ADMIN' | null) => void;
  logout: () => void;
  loadAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>(set => ({
  token: null,
  isLoggedIn: false,
  role: null,
  setAuth: (token, role) => {
    if (token && role) {
      AsyncStorage.setItem('authToken', token);
      AsyncStorage.setItem('userRole', role);
    } else {
      AsyncStorage.removeItem('authToken');
      AsyncStorage.removeItem('userRole');
    }
    set({ token, role, isLoggedIn: !!token });
  },
  logout: () => {
    AsyncStorage.removeItem('authToken');
    AsyncStorage.removeItem('userRole');
    set({ token: null, role: null, isLoggedIn: false });
  },
  loadAuth: async () => {
    const token = await AsyncStorage.getItem('authToken');
    const role = (await AsyncStorage.getItem('userRole')) as
      | 'USER'
      | 'ADMIN'
      | null;
    set({ token, role, isLoggedIn: !!token });
  },
}));

// export const useAuthStore = create<AuthState>(set => ({
//   token: null,
//   isLoggedIn: false,
//   setToken: token => {
//     if (token) {
//       AsyncStorage.setItem('authToken', token);
//     } else {
//       AsyncStorage.removeItem('authToken');
//     }
//     set({ token, isLoggedIn: !!token });
//   },
//   logout: () => {
//     AsyncStorage.removeItem('authToken');
//     set({ token: null, isLoggedIn: false });
//   },
//   loadToken: async () => {
//     const token = await AsyncStorage.getItem('authToken');
//     set({ token, isLoggedIn: !!token });
//   },
// }));
