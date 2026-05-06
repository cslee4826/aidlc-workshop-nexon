import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '../api/client';

interface AuthState {
  token: string | null;
  tableId: string | null;
  tableNumber: number | null;
  storeIdentifier: string | null;
  isAuthenticated: boolean;
  login: (storeIdentifier: string, tableNumber: number, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      tableId: null,
      tableNumber: null,
      storeIdentifier: null,
      isAuthenticated: false,

      login: async (storeIdentifier, tableNumber, password) => {
        const response = await apiClient.post('/tables/login', {
          store_identifier: storeIdentifier,
          table_number: tableNumber,
          password,
        });
        set({
          token: response.data.access_token,
          tableId: response.data.table_id,
          tableNumber: response.data.table_number,
          storeIdentifier,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          token: null,
          tableId: null,
          tableNumber: null,
          storeIdentifier: null,
          isAuthenticated: false,
        });
      },
    }),
    { name: 'table-auth' }
  )
);
