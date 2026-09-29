import axios from "@/api/axios";

export const getStores = async () => {
  const res = await axios.get("/api/stores/get");
  return res;
};

export const createStore = async (payload) => {
  const res = await axios.post("/api/stores/create", payload);
  return res;
};

export const deleteStore = async (id) => {
  const res = await axios.delete(`/api/stores/delete/${id}`);
  return res;
};

export const getStoreById = async (id) => {
  const res = await axios.get(`/api/stores/getById/${id}`);
  return res;
};

export const updateStore = async (id, payload) => {
  const res = await axios.put(`/api/stores/update/${id}`, payload);
  return res;
};
