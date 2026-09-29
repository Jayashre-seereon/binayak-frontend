import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  refreshToken: localStorage.getItem("refreshToken") || null,
  role: localStorage.getItem("role") || null,
  storeUser: JSON.parse(localStorage.getItem("storeUser")) || null,
  storeToken: localStorage.getItem("storeToken") || null,
  storeRefreshToken: localStorage.getItem("storeRefreshToken") || null,
  selectedStore: JSON.parse(localStorage.getItem("selectedStore")) || null,

  setSession: ({ user, token, refreshToken, role }) => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    if (token) localStorage.setItem("token", token);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    if (role) localStorage.setItem("role", role);

    set((state) => ({
      user: user ?? state.user,
      token: token ?? state.token,
      refreshToken: refreshToken ?? state.refreshToken,
      role: role ?? state.role,
    }));
  },

  setStoreSession: ({ storeUser, storeToken, storeRefreshToken }) => {
    if (storeUser) localStorage.setItem("storeUser", JSON.stringify(storeUser));
    if (storeToken) localStorage.setItem("storeToken", storeToken);
    if (storeRefreshToken) {
      localStorage.setItem("storeRefreshToken", storeRefreshToken);
    }

    set((state) => ({
      storeUser: storeUser ?? state.storeUser,
      storeToken: storeToken ?? state.storeToken,
      storeRefreshToken: storeRefreshToken ?? state.storeRefreshToken,
    }));
  },

  setSelectedStore: (store) => {
    const normalizedStore = store
      ? {
          ...store,
          id: store.id ?? store.storeId ?? store.store_id ?? store._id,
        }
      : null;

    if (normalizedStore) {
      localStorage.setItem("selectedStore", JSON.stringify(normalizedStore));
      if (normalizedStore.id) {
        localStorage.setItem("selectedStoreId", String(normalizedStore.id));
      }
    } else {
      localStorage.removeItem("selectedStore");
      localStorage.removeItem("selectedStoreId");
    }
    set({ selectedStore: normalizedStore });
  },

  clearSelectedStore: () => {
    localStorage.removeItem("selectedStore");
    localStorage.removeItem("selectedStoreId");
    set({ selectedStore: null });
  },

  clearStoreSession: () => {
    localStorage.removeItem("storeUser");
    localStorage.removeItem("storeToken");
    localStorage.removeItem("storeRefreshToken");
    set({
      storeUser: null,
      storeToken: null,
      storeRefreshToken: null,
    });
  },

  logout: () => {
    localStorage.clear();
    set({
      user: null,
      token: null,
      refreshToken: null,
      role: null,
      storeUser: null,
      storeToken: null,
      storeRefreshToken: null,
      selectedStore: null,
    });
  },
}));
