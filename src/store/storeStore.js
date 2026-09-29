import { create } from "zustand";

export const useStoreStore = create((set) => ({
  stores: [],
  selectedStore: null,
  loading: false,
  error: null,

  setStores: (stores) => set({ stores }),
  setStore: (store) => set({ selectedStore: store }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  clearStore: () => set({ selectedStore: null }),
}));
