import http from "./axios";

export const loginApi = async (payload) => {
  const res = await http.post("/api/users/login", payload);
  return res;
};

export const refreshTokenApi = async (payload) => {
  const res = await http.post("/api/users/refresh-token", payload);
  return res;
};

export const logoutApi = async () => {
  const res = await http.post("/api/users/logout");
  return res;
};

export const storeLoginApi = async (payload) => {
  const res = await http.post("/api/stores/login", payload);
  return res;
};

export const storeRefreshTokenApi = async (payload) => {
  const res = await http.post("/api/stores/refresh-token", payload);
  return res;
};

export const storeLogoutApi = async () => {
  const res = await http.post("/api/stores/logout");
  return res;
};
