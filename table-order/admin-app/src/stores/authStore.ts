import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

interface AdminAuthState {
  token: string | null;
  storeId: string | null;
  username: string | null;
  isAuthenticated: boolean;
  login: (storeIdentifier: string, username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      token: null,
      storeId: null,
      username: null,
      isAuthenticated: false,

      login: async (storeIdentifier, username, password) => {
        const response = await axios.post('/api/admin/login', {
          store_identifier: storeIdentifier,
          username,
          password,
        });
        set({
          token: response.data.access_token,
          storeId: storeIdentifier,
          username,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({ token: null, storeId: null, username: null, isAuthenticated: false });
      },
    }),
    { name: 'admin-auth' }
  )
);
